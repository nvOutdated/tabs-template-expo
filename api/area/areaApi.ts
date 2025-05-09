import request from "@/utils/request";

export const get_area_list =(params={})=>{
    return request("/smart/area/area_info/query/list",{
        method:"post",
        body:params
    })
}

export const ebox_list = (params:{})=>{
    return request("/smart/light/ebox/query/list",{
       method:"post",
       body:params
    })
}