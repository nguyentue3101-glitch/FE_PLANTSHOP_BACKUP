import apiClient from "../axios";

export const restoreDiscount = async(token, discountId)=>{
    const response = await apiClient.put(`/api/discount/restore/${discountId}`, {}, {
        headers:{
            Authorization:`Bearer ${token}`,
        }
    })
    return response
}

export const updateDiscount = async(token, discountId, discountData)=>{
    const response = await apiClient.put(`/api/discount/update/${discountId}`, discountData, {
        headers:{
            Authorization:`Bearer ${token}`,
        }
    })
    return response
}