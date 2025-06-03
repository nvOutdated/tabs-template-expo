import request from "@/utils/request";

export const get_smart_light_list = (params:any)=>{
    return request("/smart/light/smart_lamp/query/list",{
        method:"post",
        body:params
    })
}



