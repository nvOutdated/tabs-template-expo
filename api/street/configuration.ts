import request from "@/utils/request";
// interface ContainerListParams{
//     page:number,
//     pageSize:number,
// }
interface getElectricCfgParams{
    cfg_type:string,
    cfg_id:number
}
export const getContainerListApi =(params:any)=>{
    return request('/smart/light/container/query/list',{
        method:'post',
        body:params
    })
}

export const getEboxListApi =(params:any)=>{
    return request('/smart/light/ebox/query/list',{
        method:'post',
        body:params
    })
}

export const getElectricCfg = (params:getElectricCfgParams)=>{
    return request('/smart/light/ebox_cfg/query/get',{
        method:'post',
        body:params
    })
}
