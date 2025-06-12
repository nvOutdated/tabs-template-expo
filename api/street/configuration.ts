import request from "@/utils/request";
// interface ContainerListParams{
//     page:number,
//     pageSize:number,
// }
interface getElectricCfgParams{
    cfg_type:string,
    cfg_id:number
}
interface lightEleBoxCtrlSwitch{
    deviceIds:number[],
    isOpen:boolean,
    loops:boolean[],

}
interface smartPersonalMatchOptCode{
    isCreated:boolean,
    optCode:string
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
   id?:number,
   sn?:string,
}
//指定配电箱信息查询
export const  light_ebox_query_get=(params:lightEboxQuerygetType)=> {
    return request('/smart/light/ebox/query/get',{
        method:'post',
        body:params
    })
};

//集中器开关灯
export const  light_eleBox_ctrl_switch=(params:lightEleBoxCtrlSwitch)=> {
    return request('/smart/light/devicectrl/sendSwitchCmd',{
        method:'post',
        body:params
    })
};

//检测集中器状态
export const  light_central_detect_status=(params:any)=> {
    return request('/smart/light/central/detectStatus',{
        method:'post',
        body:params
    })
}

//操作密码检验
export const  smart_personal_matchOptCode=(params:smartPersonalMatchOptCode)=> {
    return request('/smart/auth/personal/matchOptCode',{
        method:'post',
        body:params
    })
}

// 集中器参数检测
export const detect_dev_param = (params: { deviceId: number }) => {
  return request("/smart/light/singlectrl/sendDetectParamsCmd", {
    method: "post",
    body: params
  });
};

// 集中器复位
export const singleLamp_reset = (params: { deviceId: number }) => {
  return request("/smart/light/singlectrl/sendSetupReset", {
    method: "post",
    body: params
  });
};

// 集中器手/自动切换
export const changeSwitchAuto = (params: { deviceId: number }) => {
  return request("/smart/light/devicectrl/sendSetupSwitchAutoCmd", {
    method: "post",
    body: params
  });
};

// 集中器系统时钟检测
export const detect_lamp_time = (params: { deviceId: number }) => {
  return request("/smart/light/singlectrl/sendSingleDetectDatetimeCmd", {
    method: "post",
    body: params
  });
};

// 集中器校时
export const deviceCtrl_sendTimingCmd = (params: { deviceIds: number[] }) => {
  return request("/smart/light/devicectrl/sendTimingCmd", {
    method: "post",
    body: params
  });
};