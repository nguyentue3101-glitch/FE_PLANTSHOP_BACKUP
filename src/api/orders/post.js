import apiClient from "../axios";

export const createOrder = async (token, orderData) => {
    const response = await apiClient.post("/api/orders/add", orderData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
    return response;
}

