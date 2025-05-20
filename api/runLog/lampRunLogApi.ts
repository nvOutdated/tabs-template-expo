import request from "@/utils/request";

export const stats_runLog_quey_list = (params:any)=>{
    return request('/smart/stats/runlog/query/list',{
        method:'post',
        body:params
    })
}