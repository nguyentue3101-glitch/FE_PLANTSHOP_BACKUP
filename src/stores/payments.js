import { defineStore } from "pinia"
import { ref } from "vue"
import { createMoMoPayment,  createPayment as createPaymentAPI } from "@/api/payments/post"
import { getPaymentByOrderId, getPaymentById, getAllPayments } from "@/api/payments/get"
import { updatePaymentStatus as updatePaymentStatusAPI } from "@/api/payments/put"
import { useAuthStore } from "@/stores/auth"

export const usePaymentStore = defineStore("payment", () => {
    const authStore = useAuthStore()
    const payments = ref([])
    const currentPayment = ref(null)

    // Tạo payment request MoMo
    const createMoMoPaymentStore = async (paymentData) => {
        try {
            const { orderId, amount, orderInfo } = paymentData
            const response = await createMoMoPayment(orderId, amount, orderInfo)
          
            if (response && response.success && response.data) {
                return { data: response }
            }
     
        } catch (error) {
            console.error("Create MoMo payment error:", error)
            throw error
        }
    }

    // Tạo payment request VNPay
    // const createVNPayPaymentStore = async (paymentData) => {
    //     try {
    //         const { orderId, amount, orderInfo, purpose } = paymentData
            
    //         // Validate dữ liệu trước khi gửi
    //         if (!orderId || orderId <= 0) {
    //             throw new Error('OrderId không hợp lệ')
    //         }
    //         if (!amount || amount <= 0) {
    //             throw new Error('Amount không hợp lệ')
    //         }
    //         if (amount < 1000) {
    //             console.warn('⚠️ Amount nhỏ hơn 1000 VND, VNPay có thể từ chối')
    //         }
            
    //         console.log('🔍 VNPay Payment Store - Input data:', {
    //             orderId,
    //             amount,
    //             amountType: typeof amount,
    //             orderInfo,
    //             purpose,
    //             isValidOrderId: !!(orderId && orderId > 0),
    //             isValidAmount: !!(amount && amount > 0)
    //         })
            
    //         const response = await createVNPayPayment(orderId, amount, orderInfo, purpose)
            
    //         console.log('🔍 VNPay Payment Store - Raw response:', response)
    //         console.log('🔍 VNPay Payment Store - Response type:', typeof response)
    //         console.log('🔍 VNPay Payment Store - Response keys:', response ? Object.keys(response) : 'null')
            
    //         // Response từ apiClient đã được unwrap bởi interceptor
    //         // apiClient.interceptors.response.use((response) => response.data)
    //         // Vậy response ở đây chính là response.data từ axios
            
    //         // Theo tài liệu: Backend trả về { success: true, data: { payUrl: "..." } }
    //         // Response từ apiClient đã được unwrap, nên response = response.data từ axios
            
    //         // Trường hợp 1: Backend trả về { success: true, data: { payUrl: "..." } }
    //         if (response && response.success && response.data) {
    //             console.log('✅ VNPay Payment Store - Response format 1 (success + data)')
    //             console.log('✅ VNPay Payment Store - Data keys:', Object.keys(response.data))
    //             // Kiểm tra xem có payUrl trong data không
    //             if (response.data.payUrl || response.data.paymentUrl) {
    //                 console.log('✅ VNPay Payment Store - Found payUrl in response.data')
    //             }
    //             return { data: response }
    //         }
            
    //         // Trường hợp 2: Backend trả về trực tiếp data object với payUrl (theo tài liệu)
    //         // Ưu tiên payUrl trước paymentUrl (theo tài liệu VNPay dùng payUrl)
    //         if (response && (response.payUrl || response.pay_url || response.paymentUrl || response.payment_url)) {
    //             console.log('✅ VNPay Payment Store - Response format 2 (direct data object)')
    //             console.log('✅ VNPay Payment Store - Found URL field:', 
    //                 response.payUrl ? 'payUrl' : 
    //                 response.pay_url ? 'pay_url' : 
    //                 response.paymentUrl ? 'paymentUrl' : 'payment_url')
    //             return { data: { success: true, data: response } }
    //         }
            
    //         // Trường hợp 3: Response không có format mong đợi, trả về như cũ
    //         console.warn('⚠️ VNPay Payment Store - Response format không xác định, trả về như cũ')
    //         console.warn('⚠️ Full response:', JSON.stringify(response, null, 2))
    //         return { data: { success: true, data: response } }
    //     } catch (error) {
    //         console.error("❌ Create VNPay payment error:", error)
    //         console.error("❌ Error details:", {
    //             message: error.message,
    //             response: error.response?.data,
    //             status: error.response?.status,
    //             statusText: error.response?.statusText,
    //             config: error.config
    //         })
    //         throw error
    //     }
    // }

    // Tạo payment record sau khi tạo đơn hàng (chỉ tạo nếu chưa tồn tại)
    const createPaymentStore = async (orderId, paymentData) => {
        const token = authStore.accessToken
        try {
            // Kiểm tra xem payment đã tồn tại chưa (đợi một chút để đảm bảo backend đã xử lý xong)
            await new Promise(resolve => setTimeout(resolve, 100))
            
            try {
                const existingPayment = await getPaymentByOrderId(orderId, token)
                if (existingPayment.data.success && existingPayment.data.data) {
                    // Payment đã tồn tại, update thay vì tạo mới
                    const payment = existingPayment.data.data
                    console.log('Payment already exists. Payment object:', payment)
                    
                    // Thử nhiều cách để lấy payment_id
                    const paymentId = payment.payment_id || 
                                     payment.id || 
                                     payment.paymentId ||
                                     payment.paymentId ||
                                     (typeof payment === 'number' ? payment : null)
                    
                    if (paymentId) {
                        console.log('Payment already exists, updating instead of creating:', paymentId)
                        return await updatePaymentStatusAPI(token, paymentId, paymentData.status)
                    } else {
                        console.warn('Payment exists but no payment_id found. Payment object:', payment)
                        // Vẫn tạo mới nếu không lấy được payment_id
                    }
                }
            } catch (getError) {
                // Payment chưa tồn tại (404 hoặc lỗi khác), tạo mới
                console.log('Payment does not exist, creating new payment. Error:', getError.message)
            }

            // Tạo payment mới
            const response = await createPaymentAPI(token, orderId, paymentData)
            if (response.data.success) {
                return response
            }
            throw new Error(response.data.message || 'Tạo payment thất bại!')
        } catch (error) {
            // Nếu lỗi là payment đã tồn tại, thử update
            if (error.response?.status === 409 || error.response?.data?.message?.includes('already exists')) {
                try {
                    const existingPayment = await getPaymentByOrderId(orderId, token)
                    if (existingPayment.data.success && existingPayment.data.data) {
                        const paymentId = existingPayment.data.data.payment_id || existingPayment.data.data.id
                        console.log('Payment was created by backend, updating status:', paymentId)
                        return await updatePaymentStatusAPI(token, paymentId, paymentData.status)
                    }
                } catch (updateError) {
                    console.error('Error updating existing payment:', updateError)
                }
            }
            console.error("Create payment error:", error.message)
            throw error
        }
    }

    // Tạo hoặc cập nhật payment (luôn kiểm tra và update nếu đã tồn tại)
    const createOrUpdatePaymentStore = async (orderId, paymentData) => {
        const token = authStore.accessToken
        try {
            // Kiểm tra xem payment đã tồn tại chưa
            try {
                const existingPayment = await getPaymentByOrderId(orderId, token)
                if (existingPayment.data.success && existingPayment.data.data) {
                    // Payment đã tồn tại, update
                    const paymentId = existingPayment.data.data.payment_id || existingPayment.data.data.id
                    console.log('Payment exists, updating payment:', paymentId)
                    return await updatePaymentStatusAPI(token, paymentId, paymentData.status)
                }
            } catch (getError) {
                // Payment chưa tồn tại, tạo mới
                console.log('Payment does not exist, creating new payment', getError.message)
            }

            // Tạo payment mới
            const response = await createPaymentAPI(token, orderId, paymentData)
            if (response.data.success) {
                return response
            }
            throw new Error(response.data.message || 'Tạo payment thất bại!')
        } catch (error) {
            console.error("Create or update payment error:", error.message)
            throw error
        }
    }

    // Lấy payment theo order ID
    const getPaymentByOrderIdStore = async (orderId) => {
        const token = authStore.accessToken
        try {
            const response = await getPaymentByOrderId(orderId, token)
            if (response.data.success) {
                currentPayment.value = response.data.data
            }
            return response
        } catch (error) {
            console.error("Get payment by order id error:", error.message)
            throw error
        }
    }

    // Lấy payment theo payment ID
    const getPaymentByIdStore = async (paymentId) => {
        const token = authStore.accessToken
        try {
            const response = await getPaymentById(paymentId, token)
            if (response.data.success) {
                currentPayment.value = response.data.data
            }
            return response
        } catch (error) {
            console.error("Get payment by id error:", error.message)
            throw error
        }
    }

    // Cập nhật payment status
    const updatePaymentStatusStore = async (paymentId, status) => {
        const token = authStore.accessToken
        try {
            const response = await updatePaymentStatusAPI(token, paymentId, status)
            if (response.data.success) {
                // Reload payment if needed
                if (currentPayment.value && currentPayment.value.payment_id === paymentId) {
                    await getPaymentByIdStore(paymentId)
                }
                // Reload payments list if needed
                await getAllPaymentsStore()
            }
            return response
        } catch (error) {
            console.error("Update payment status error:", error.message)
            throw error
        }
    }

    // Lấy tất cả payments (cho admin)
    const getAllPaymentsStore = async () => {
        const token = authStore.accessToken
        try {
            const response = await getAllPayments(token)
            if (response.data.success) {
                payments.value = response.data.data || []
            }
            return response
        } catch (error) {
            console.error("Get all payments error:", error.message)
            throw error
        }
    }

    return {
        payments,
        currentPayment,
        createMoMoPaymentStore,
        // createVNPayPaymentStore,
        createPaymentStore,
        createOrUpdatePaymentStore,
        getPaymentByOrderIdStore,
        getPaymentByIdStore,
        updatePaymentStatusStore,
        getAllPaymentsStore,
    }
})

