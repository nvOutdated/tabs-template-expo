import request from "@/utils/request";
///smart/light/container/query/details
interface containerQueryDetailsType{
   container_id:number
}
export const container_query_details=(query:containerQueryDetailsType)=>{
    return request('/smart/light/container/query/details',{
        method:"post",
        body:query
    })
}

interface deviceQuantityQueryByAreaType{
    areaId:number
}
export const deviceQuantity_queryByArea=(query:deviceQuantityQueryByAreaType)=>{
    return request('/smart/stats/deviceQuantity/lamp/queryByArea',{
        method:"post",
        body:query
    })
}



