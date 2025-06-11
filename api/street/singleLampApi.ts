import request from "@/utils/request";

interface queryEleBoxLine{
    ebox_id:number
}
interface lightPoleQueryListByLine{
    deviceId:number,
    lineId:number
}
//search line
export const query_eleBox_line =(params:queryEleBoxLine)=>{
    return request("/smart/light/line/query/list",{
        method:"post",
        body:params
    })
}

//search singleLamp by line (controller)
export const lightPole_query_list=(params:lightPoleQueryListByLine)=>{
    return request("/smart/light/lightPole/query/list",{
        method:"post",
        body:params
    })
}

//  singleLamp for common
export const ordinaryLamp_query_list=(params:any)=>{
    return request("/smart/light/lamp/query/list",{
        method:"post",
        body:params
    })
}

export const ordinaryLamp_query_get=(params:{id:number})=>{
    return request("/smart/light/lamp/query/get",{
        method:"post",
        body:params
    })
}

//singleLamp controller
export const lightPole_devicectrl_sendSingleControlCmd=(params:any)=>{
    return request("/smart/light/devicectrl/sendSingleControlCmd",{
        method:"post",
        body:params
    })
}

