import request from "@/utils/request";

export const loginApi = (params:any)=>{
  return request('/smart/auth/token',{
    method:'post',
    body:params
  })
}