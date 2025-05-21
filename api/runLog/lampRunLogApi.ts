import request from "@/utils/request";

export const stats_runLog_quey_list = (params:any)=>{
    return request('/smart/stats/runlog/query/list',{
        method:'post',
        body:params
    })
}

export const stats_onlineOffline_log_list = (params:any)=>{
    return request('/smart/stats/onlineOfflineLog/query/list',{
        method:'post',
        body:params
    })
}
//报警类型
export const stats_alarm_log_alarmType = (params:any)=>{
    return request('/smart/stats/alarmlog/query/alarmType',{
        method:'post',
        body:params
    })
}
//alarmlog api
export const stats_alarm_log_list = (params:any)=>{
    return request('/smart/stats/alarmlog/query/list',{
        method:'post',
        body:params
    })
}

