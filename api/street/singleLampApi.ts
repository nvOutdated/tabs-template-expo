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

// 添加线路
export const add_line = (params: { ebox_id: number; name: string; line_index: number }) => {
    return request("/smart/light/line/add", {
        method: "post",
        body: params
    });
}

// 修改线路
export const update_line = (params: { id: number; name: string; line_index: number }) => {
    return request("/smart/light/line/update", {
        method: "post",
        body: params
    });
}

// 删除线路
export const remove_line = (params: { id: number }) => {
    return request("/smart/light/line/remove", {
        method: "post",
        body: params
    });
}

// 添加单灯
export const add_lightPole = (params: any) => {
    return request("/smart/light/lightPole/add", {
        method: "post",
        body: params
    });
}

// 修改单灯
export const update_lightPole = (params: any) => {
    return request("/smart/light/lightPole/update", {
        method: "post",
        body: params
    });
}

// 删除单灯
export const remove_lightPole = (params: { id: number }) => {
    return request("/smart/light/lightPole/remove", {
        method: "post",
        body: params
    });
}

// 获取单灯详情
export const lightPole_query_get = (params: { id: number }) => {
    return request("/smart/light/lightPole/query/get", {
        method: "post",
        body: params
    });
}

//查询交流接触器
export function ebox_cfg_query_getEboxContactor(params:{cfg_id:number}) {
    return request("/smart/light/ebox_cfg/query/getEboxContactor",{
        method: 'post',
        body:params
    })
};

