import request from "@/utils/request";
interface  gisSmartLightDetailsType{
    container_id:number
}
interface gisLightContainerListType{
    lat1:number,
    lng1:number,
    lat2:number,
    lng2:number,
    page_size:number,
    current:number
}
export const get_container_list = (params:any)=>{
    return request("/smart/light/container/query/list",{
       method:"post",
       body:params
    })
}
export const gis_SmartLight_Details = (query:gisSmartLightDetailsType) =>{
    return request("/smart/light/container/query/details",{
        method:"post",
        body:query
    })
};

export const gis_lightContainer_list=(query:gisLightContainerListType)=>{
    return request('/smart/light/container/query/list',{
        method:"post",
        body:query
    })
}