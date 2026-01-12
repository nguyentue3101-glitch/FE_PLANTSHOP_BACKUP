import apiClient from "../axios";

/**
 * Tạo deposit payment request với MoMo
 */
export const createDepositMoMoPayment = async (orderId, amount, orderInfo = null) => {
    const data = {
        amount,
        orderInfo: orderInfo || `Đặt cọc đơn hàng #${orderId}`
    }
    // Backend endpoint: POST /api/deposits/{orderId}/momo
    return apiClient.post(`/deposits/${orderId}/momo`, data)
}

