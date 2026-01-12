import apiClient from "../axios";

export const addProductToCart = async (userId, productId, quantity, token) => {
    const response = await apiClient.post(
        `/api/cartdetail/add-product/${userId}/${productId}/${quantity}`,
        null,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    return response
}

