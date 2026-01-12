import apiClient from "../axios";


export const getInfoUser = async(token)=>{
    const response = await apiClient.get("/api/user/get-user", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return response
}

export const getAllUser = async(token)=>{
    const response = await apiClient.get("/api/user/getall", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return response

}

export const getAllUserDeleted = async(token) => {
    const response = await apiClient.get("/api/user/getall-deleted",{
        headers:{
            Authorization: `Bearer ${token}`,
        },
    })
    return response
}