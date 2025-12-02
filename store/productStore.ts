import { create } from "zustand";
import { getProductPage } from "../api/assets/product";
type streamType={
    id:number;
    streamId:number;
    StreamName:string;
    unit:string;
    value:string;
}
type productType = {
    categoryId:number;
    categoryName:string;
    createAt:string;
    createBy:string;
    id:number;
    manufacturerId:number;
    manufacturerName:string;
    name:string;
    remark:string;
    streamValues:streamType[]
}
interface ProductState {
    productList:productType[];
    fetchProductList:()=>Promise<void>;
    removeProductList:()=>void;
}

export const useProductStore = create<ProductState>((set)=>({
        productList: [],
        fetchProductList: async () => {
            try {
                const res = await getProductPage({pageSize:200,current:1});
                if (res.code === 200&&res.data) {
                    const data = [...res.data,{id:0,name:'未分类'}]
                    set({ productList: data });
                }
            } catch (error) {
                console.log('获取产品列表失败:', error);
            }
        },
        removeProductList:()=>{
            set({productList:[]})
        }
}))
