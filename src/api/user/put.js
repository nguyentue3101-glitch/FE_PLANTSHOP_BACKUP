import apiClient from "../axios";

export const updateInfoUser = async(token, userId, userData)=>{
    const response = await apiClient.put(`/api/user/update/${userId}`, userData, {
        headers:{
            Authorization:`Bearer ${token}`,
        }
    })
    return response
}

export const restoreUser = async(token, userId)=>{
    const response = await apiClient.put(`/api/user/restore/${userId}`, {}, {
        headers:{
            Authorization:`Bearer ${token}`,
        }
    })
    return response
}