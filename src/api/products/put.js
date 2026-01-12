import apiClient from "../axios";

export const restorProduct = async(token, productId)=>{
    const response = await apiClient.put(`/api/product/restore/${productId}`, {}, {
        headers:{
            Authorization:`Bearer ${token}`,
        }
    })
    return response
}

export const updateProduct = async(token, productId, productData)=>{
    const response = await apiClient.put(`/api/product/update/${productId}`, productData, {
        headers:{
            Authorization:`Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    })
    return response
}

export const restorCategory = async(token, categoryId)=>{
    const response = await apiClient.put(`/api/category/restore/${categoryId}`, {}, {
        headers:{
            Authorization:`Bearer ${token}`,
        }
    })
    return response
}

export const updateCategory = async(token, categoryId, categoryData)=>{
    const response = await apiClient.put(`/api/category/update/${categoryId}`, categoryData, {
        headers:{
            Authorization:`Bearer ${token}`,
        }
    })
    return response
}