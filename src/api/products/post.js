import apiClient from "../axios";

export const addProductsAPI = async (token, formData) => {
    const response = await apiClient.post("/api/product/add", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });
    return response
}


export const addCategories = async (token, categoryData) => {
    const response = await apiClient.post("/api/category/add", categoryData, {
        headers: {
            Authorization: `Bearer ${token}`,
            
        }
    });
    return response
}
