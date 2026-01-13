import apiClient from "../axios";

export const createMoMoPayment = async (orderId, amount, orderInfo = null) => {
    const data = {
        orderId,
        amount,
        orderInfo: orderInfo 
    }
    return apiClient.post('/api/payments/momo/create', data)
}


// export const createVNPayPayment = async (orderId, amount, orderInfo = null, purpose = 'ORDER_PAYMENT') => {
//     // Đảm bảo amount là số nguyên (VNPay yêu cầu VND, không có phần thập phân)
//     const roundedAmount = Math.round(Number(amount))
//     const numericOrderId = Number(orderId)
    
//     // Validate dữ liệu
//     if (isNaN(numericOrderId) || numericOrderId <= 0) {
//         throw new Error(`OrderId không hợp lệ: ${orderId}`)
//     }
//     if (isNaN(roundedAmount) || roundedAmount <= 0) {
//         throw new Error(`Amount không hợp lệ: ${amount}`)
//     }
//     // if (roundedAmount < 1000) {
//     //     console.warn(`⚠️ Amount ${roundedAmount} VND nhỏ hơn 1000 VND, VNPay có thể từ chối`)
//     // }
    
//     const data = {
//         orderId: numericOrderId,
//         amount: roundedAmount,
//         orderInfo: orderInfo || `Thanh toán đơn hàng #${numericOrderId}`,
//         purpose: purpose || 'ORDER_PAYMENT'
//     }
    

//     try {
//         const response = await apiClient.post('/payments/vnpay/create', data)
//         return response
//     } catch (error) {
//         throw error
//     }
// }

// Tạo payment record sau khi tạo đơn hàng
export const createPayment = async (orderId, paymentData) => {
    return apiClient.post(`/api/payments/create/${orderId}`, paymentData)
}

