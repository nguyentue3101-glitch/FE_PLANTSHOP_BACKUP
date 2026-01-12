import apiClient from "../axios";
export const getAllDiscount = async()=>{
    const response = await apiClient.get("/api/discount/getall")
    return response

}
export const getAllDiscountDeleted = async(token) => {
    const response = await apiClient.get("/api/discount/getall-deleted",{
        headers:{
            Authorization: `Bearer ${token}`,
        },
    })
    return response
}