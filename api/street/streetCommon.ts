import request from "@/utils/request";
interface  gisSmartLightDetailsType{
    container_id:number
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