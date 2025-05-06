import request from '@/utils/request';
/* /smart/camera/operate/getPlayUrl    */
/* 摄像头列表 */
export const getCameraInfoQueryList = (params:any)=>{
   return request('/smart/camera/cameraInfo/query/list',{
    method: 'post',
    body:params
  });
}
// export function getCameraInfoQueryList({data}:any) {
//   return request({
//     url: '/smart/camera/cameraInfo/query/list',
//     method: 'get',
//     data:data
//   });
// }
interface IGetCameraInfoQueryList {
  channel_id: string;
  play_type:number
}
interface cameraControlParams {
  channel_id: string;
  type:string;
  step:number;
}
/* 获取摄像头播放路径 */
export const getCameraPlayUrl = (params:any)=>{
  return request('/smart/camera/operate/getPlayUrl',{
    method: 'post',
    body:params
  });
}

export const cameraControl = (params:cameraControlParams)=>{
  return request('/smart/camera/operate/controlCamera',{
    method: 'post',
    body:params
  });
}
