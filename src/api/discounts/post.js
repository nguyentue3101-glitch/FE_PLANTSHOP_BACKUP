import apiClient from "../axios";

export const addDiscount= async (token, discountData) => {
    const response = await apiClient.post("/api/discount/add", discountData, {
        headers: {
            Authorization: `Bearer ${token}`,
            
        }
    });
    return response
}
