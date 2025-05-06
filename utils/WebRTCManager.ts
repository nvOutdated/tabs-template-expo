import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';
import axios from 'axios';
import { getCameraPlayUrl } from '@/api/camera/cameraApi';

export interface WebRTCStream {
  stream: any;
  isPlaying: boolean;
}

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: any = null;
  private isMounted: boolean = true;
  private stream: any = null;
  private isPlaying: boolean = false;

  constructor(
    private channelId: string,
    private onStreamChange: (stream: WebRTCStream) => void,
    private onError: (error: Error) => void
  ) {}

  public async startStream() {
    if (!this.isMounted) return;

    try {
      console.log('开始获取流地址...');
      const data = await getCameraPlayUrl({ channel_id: this.channelId, play_type: 2 });
      console.log('获取流地址响应:', data);

      if (data.code === 200) {
        const streamUrl = data.data;
        console.log('流地址:', streamUrl);
        await this.setupWebRTC(streamUrl);
      } else {
        console.error('获取流地址失败:', data);
        this.onError(new Error('获取流地址失败'));
      }
    } catch (error) {
      console.error('获取流地址错误:', error);
      this.onError(error as Error);
    }
  }

  private async setupWebRTC(streamUrl: string) {
    if (!this.isMounted) return;

    try {
      console.log('开始设置 WebRTC...');
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'turn:numb.viagenie.ca', username: 'webrtc@live.com', credential: 'muazkh' }
        ],
      };

      this.peerConnection = new RTCPeerConnection(configuration);

      // 设置超时
      const timeout = setTimeout(() => {
        if (this.isMounted && this.peerConnection?.iceConnectionState !== 'connected') {
          console.log('Connection timeout');
          this.stopStream();
        }
      }, 10000);

      // ICE 候选者处理
      (this.peerConnection as any).onicecandidate = (event: any) => {
        if (event.candidate && this.isMounted) {
          console.log('New ICE candidate:', event.candidate);
        }
      };

      // ICE 连接状态变化
      (this.peerConnection as any).oniceconnectionstatechange = () => {
        if (!this.isMounted) return;

        const state = this.peerConnection?.iceConnectionState;
        console.log('ICE connection state changed:', state);

        if (state === 'failed' || state === 'disconnected' || state === 'closed') {
          console.log('ICE connection failed or disconnected');
          this.stopStream();
        } else if (state === 'connected' || state === 'completed') {
          console.log('ICE connection established');
          clearTimeout(timeout);
        }
      };

      // 视频流接收
      (this.peerConnection as any).ontrack = (event: any) => {
        if (!this.isMounted) return;

        console.log('Received track:', event);
        if (event.streams && event.streams[0]) {
          this.stream = event.streams[0];
          this.isPlaying = true;
          this.onStreamChange({ stream: this.stream, isPlaying: this.isPlaying });
        }
      };

      // 添加接收器
      this.peerConnection.addTransceiver('video', {
        direction: 'recvonly',
        streams: []
      });

      // 创建 offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: false,
        voiceActivityDetection: false
      });

      await this.peerConnection.setLocalDescription(offer);

      // 发送 offer 到服务器
      const stream = streamUrl.split('stream=')[1]?.split('&')[0];
      if (!stream) {
        throw new Error('Invalid stream URL: missing stream parameter');
      }

      const serverBaseUrl = 'http://182.99.177.29:30080';
      const requestUrl = `${serverBaseUrl}/index/api/webrtc?app=rtp&stream=${stream}&type=play`;

      const response = await axios.post(
        requestUrl,
        offer.sdp,
        {
          headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
            'Accept': 'application/json, text/plain, */*',
          },
          timeout: 10000,
        }
      );

      if (response.data.code === 0 || response.data.sdp) {
        const answerSdp = response.data.sdp || response.data.data;
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription({
            type: 'answer',
            sdp: answerSdp,
          })
        );
      } else {
        throw new Error('Invalid server response');
      }
    } catch (error) {
      console.error('WebRTC setup error:', error);
      this.stopStream();
      this.onError(error as Error);
    }
  }

  public stopStream() {
    console.log('Stopping stream...');
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.stream = null;
    this.isPlaying = false;
    this.onStreamChange({ stream: null, isPlaying: false });
  }

  public cleanup() {
    this.isMounted = false;
    this.stopStream();
  }
} 