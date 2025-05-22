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

// export const  ebox_upload=(params:any)=> {
//     return request('/smart/file/light/container/upload',{
//         method:'file',
//         body:params
//     })
// };
interface lightEboxQuerygetType{
   id:number
}
//指定配电箱信息查询
export const  light_ebox_query_get=(params:lightEboxQuerygetType)=> {
    return request('/smart/light/ebox/query/get',{
        method:'post',
        body:params
    })
};
