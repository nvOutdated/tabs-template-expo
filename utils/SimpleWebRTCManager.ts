import { MediaStream, MediaStreamTrack, RTCIceCandidate, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';

export interface WebRTCStream {
  stream: MediaStream | null;
  isPlaying: boolean;
}

interface RTCTrackEvent {
  streams: MediaStream[];
  track: MediaStreamTrack;
}

export class SimpleWebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private stream: MediaStream | null = null;
  private isPlaying: boolean = false;
  private videoTrack: MediaStreamTrack | null = null;

  constructor(
    private onStreamChange: (stream: WebRTCStream) => void,
    private onError: (error: Error) => void
  ) {}

  public async startStream() {
    try {
      console.log('开始设置 WebRTC...');
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ],
      };

      this.peerConnection = new RTCPeerConnection(configuration);

      // ICE 候选者处理
      (this.peerConnection as any).onicecandidate = (event: { candidate: RTCIceCandidate | null }) => {
        if (event.candidate) {
          console.log('New ICE candidate:', event.candidate);
        }
      };

      // ICE 连接状态变化
      (this.peerConnection as any).oniceconnectionstatechange = () => {
        const state = this.peerConnection?.iceConnectionState;
        console.log('ICE connection state changed:', state);

        if (state === 'failed' || state === 'disconnected' || state === 'closed') {
          console.log('ICE connection failed or disconnected');
          this.stopStream();
        }
      };

      // 视频流接收
      (this.peerConnection as any).ontrack = (event: RTCTrackEvent) => {
        console.log('Received track:', event);
        if (event.streams && event.streams[0]) {
          this.stream = event.streams[0];
          this.videoTrack = event.track;
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

      // 使用固定的 requestUrl 获取 SDP answer
      const requestUrl = 'http://192.168.1.180:30080/index/api/webrtc?app=rtp&stream=0BEBD879&type=play';
      console.log('发送地址:', requestUrl);
      
      const fetchResponse = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
          'Accept': 'application/json, text/plain, */*',
        },
        body: offer.sdp,
      });

      if (!fetchResponse.ok) {
        throw new Error('Network response was not ok');
      }
      const responseData = await fetchResponse.json();

      if (responseData.code === 0 || responseData.sdp) {
        const answerSdp = responseData.sdp || responseData.data;
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
      console.log('WebRTC setup error:', error);
      this.stopStream();
      this.onError(error as Error);
    }
  }

  public pauseStream() {
    if (this.videoTrack) {
      this.videoTrack.enabled = false;
      this.isPlaying = false;
      this.onStreamChange({ stream: this.stream, isPlaying: this.isPlaying });
    }
  }

  public resumeStream() {
    if (this.videoTrack) {
      this.videoTrack.enabled = true;
      this.isPlaying = true;
      this.onStreamChange({ stream: this.stream, isPlaying: this.isPlaying });
    }
  }

  public stopStream() {
    console.log('Stopping stream...');
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.stream = null;
    this.videoTrack = null;
    this.isPlaying = false;
    this.onStreamChange({ stream: null, isPlaying: false });
  }

  public cleanup() {
    this.stopStream();
  }
} 