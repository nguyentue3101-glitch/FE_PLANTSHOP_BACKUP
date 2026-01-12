import apiClient from "../axios";

export const removeProductFromCart = async (userId, productId, token) => {
    const response = await apiClient.delete(
        `/api/cartdetail/remove-product/${userId}/${productId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    return response
}

