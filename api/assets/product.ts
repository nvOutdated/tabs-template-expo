import request from "@/utils/request";
interface paramsType {
    current:Number;
    pageSize:number;
}
/* 分页查询产品信息 */
export const getProductPage=(params:paramsType)=>{
    return request('/smart/assetCore/product/query/page',{
        method: 'post',
        body: params
    })
}