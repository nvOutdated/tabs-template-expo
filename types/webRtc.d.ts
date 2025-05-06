declare module "@/untils/webRtc/ZLMRTCClient" {
  export interface ZLMRTCClient {
    Endpoint: new (options: {
      element: HTMLVideoElement;
      debug: boolean;
      zlmsdpUrl: string;
      simulcast: boolean;
      useCamera: boolean;
      audioEnable: boolean;
      videoEnable: boolean;
      recvOnly: boolean;
      resolution: { w: number; h: number };
      usedatachannel: boolean;
    }) => any;
    
    Events: {
      WEBRTC_ON_REMOTE_STREAMS: string;
      WEBRTC_OFFER_ANWSER_EXCHANGE_FAILED: string;
      // 添加其他需要的事件类型
    };
  }

  const ZLMRTCClient: ZLMRTCClient;
  export default ZLMRTCClient;
}