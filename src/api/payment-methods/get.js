import apiClient from "../axios";

// Lấy tất cả payment methods
export const getAllPaymentMethods = async (token) => {
    const response = await apiClient.get("/api/payment-methods/get-all", {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
    return response;
}

