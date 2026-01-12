import apiClient from "../axios";


export const getDepositByOrderId = async (orderId) => {
    return apiClient.get(`/deposits/order/${orderId}`)
}
