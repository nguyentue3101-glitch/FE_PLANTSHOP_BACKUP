import apiClient from "../axios";


export const getCartOfUser = async (userId, token) => {
    const response = await apiClient.get(`/api/cart/get-cart-of-user/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return response
}


export const getCartDetail = async (cartId, token) => {
    const response = await apiClient.get(`/api/cartdetail/get-cart-detail/${cartId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return response
}

