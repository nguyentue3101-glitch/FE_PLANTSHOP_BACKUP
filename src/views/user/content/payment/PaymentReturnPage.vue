<!-- <template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4 max-w-2xl">
            <div class="bg-white rounded-lg shadow-lg p-8 text-center"> -->
                <!-- Loading State -->
                <!-- <div v-if="status === 'loading'" class="py-12">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4">
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Đang xử lý...</h3>
                    <p class="text-gray-600">Vui lòng đợi trong giây lát</p>
                </div> -->

                <!-- Success State -->
                <!-- <div v-else-if="status === 'success'" class="py-12">
                    <div class="mb-6">
                        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                            <CheckCircle :size="48" class="text-green-600" />
                        </div>
                        <h3 class="text-2xl font-bold text-green-600 mb-2">
                            {{ isDepositPayment ? 'Đặt cọc thành công!' : 'Thanh toán thành công!' }}
                        </h3>
                        <p class="text-gray-700 mb-1">
                            <span v-if="isDepositPayment">
                                Đơn hàng #{{ orderId }} đã được đặt cọc thành công. Đơn hàng sẽ được xử lý trong thời
                                gian sớm nhất.
                            </span>
                            <span v-else>
                                Đơn hàng #{{ orderId }} của bạn đã được xác nhận
                            </span>
                        </p>
                        <p class="text-sm text-gray-500">Bạn sẽ được chuyển về trang đơn hàng trong giây lát...</p>
                    </div>
                    <div class="flex gap-4 justify-center">
                        <button @click="goToOrders"
                            class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                            Xem đơn hàng ngay
                        </button>
                        <button @click="goToHome"
                            class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors">
                            Về trang chủ
                        </button>
                    </div>
                </div> -->

                <!-- Failed State -->
                <!-- <div v-else-if="status === 'failed'" class="py-12">
                    <div class="mb-6">
                        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                            <XCircle :size="48" class="text-red-600" />
                        </div>
                        <h3 class="text-2xl font-bold text-red-600 mb-2">
                            {{ isDepositPayment ? 'Đặt cọc thất bại' : 'Thanh toán thất bại' }}
                        </h3>
                        <p class="text-gray-700 mb-4">
                            {{ errorMessage || (isDepositPayment ? 'Vui lòng thử lại đặt cọc hoặc liên hệ với cửa hàng'
                                : 'Vui lòng thử lại hoặc chọn phương thức thanh toán khác') }}
                        </p>
                    </div>
                    <div class="flex gap-4 justify-center">
                        <button @click="goToCart"
                            class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                            Quay lại giỏ hàng
                        </button>
                        <button @click="goToHome"
                            class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors">
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template> -->

<!-- <script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CheckCircle, XCircle } from 'lucide-vue-next'
import { usePaymentMethodStore } from '@/stores/payment-methods'
import { usePaymentStore } from '@/stores/payments'
import { useOrderStore } from '@/stores/orders'

const router = useRouter()
const route = useRoute()
const paymentMethodStore = usePaymentMethodStore()
const paymentStore = usePaymentStore()
const orderStore = useOrderStore()

const status = ref('loading')
const orderId = ref(null)
const errorMessage = ref('')
const isDepositPayment = ref(false) -->

// Cập nhật payment status thành SUCCESS sau khi thanh toán thành công
// const updatePaymentStatus = async () => {
//     try {
//         if (!orderId.value) return

//         // Load payment methods trước
//         await paymentMethodStore.getAllPaymentMethods()

//         // Lấy amount từ query hoặc từ order
//         let amount = route.query.amount ? parseFloat(route.query.amount) : null

//         // Nếu không có amount trong query, lấy từ order
//         if (!amount) {
//             try {
//                 const orderResponse = await orderStore.getOrderByIdStore(orderId.value)
//                 if (orderResponse.data.success && orderResponse.data.data) {
//                     amount = orderResponse.data.data.final_total || orderResponse.data.data.total
//                 }
//             } catch (orderError) {
//                 console.error('Error getting order:', orderError)
//             }
//         }

//         if (!amount) {
//             console.warn('Không thể lấy amount, không thể cập nhật payment')
//             return
//         }

//         // Cập nhật payment với status SUCCESS (chỉ update, không tạo mới)
//         // Payment đã được tạo khi tạo đơn, chỉ cần update status
//         try {
//             const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderId.value)
//             if (paymentResponse.data.success && paymentResponse.data.data) {
//                 const payment = paymentResponse.data.data

//                 // Thử nhiều cách để lấy payment_id
//                 const paymentId = payment.payment_id ||
//                     payment.id ||
//                     payment.paymentId ||
//                     payment.paymentId ||
//                     (typeof payment === 'number' ? payment : null)

//                 if (paymentId) {
//                     await paymentStore.updatePaymentStatusStore(paymentId, 'SUCCESS')
//                 } else {
//                     console.warn('Payment exists but no payment_id found. Payment object:', payment)
//                 }
//             } else {
//                 console.warn('Payment not found for order, cannot update')
//             }
//         } catch (paymentError) {
//             console.error('Error updating payment status:', paymentError)
//             // Không throw error vì thanh toán đã thành công
//         }
//     } catch (error) {
//         console.error('Error updating payment status:', error)
//         // Không throw error vì đây chỉ là cập nhật, thanh toán đã thành công
//     }
// }

// Cập nhật trạng thái đơn hàng thành PENDING_CONFIRMATION sau khi thanh toán thành công
// KHÔNG tự động cập nhật thành CONFIRMED để khách hàng có thể hủy đơn nếu muốn
// const confirmOrderStatus = async () => {
//     try {
//         if (!orderId.value) return

//         const orderResponse = await orderStore.getOrderByIdStore(orderId.value)
//         if (orderResponse?.data?.success && orderResponse?.data?.data) {
//             const currentStatus = orderResponse.data.data.status
//             if (currentStatus !== 'PENDING_CONFIRMATION') {
//                 await orderStore.updateOrderStatusStore(orderId.value, 'PENDING_CONFIRMATION')
//             }
//         }
//     } catch (error) {
//         console.error('Error confirming order status after payment:', error)
//     }
// }

// onMounted(async () => {
//     // Lấy query params từ URL (MoMo sẽ redirect về với các params này)
//     const orderIdParam = route.query.orderId
//     const resultCodeParam = route.query.resultCode
//     const messageParam = route.query.message

//     // Kiểm tra nếu là deposit payment (orderId dạng DEPOSIT_xxx)
//     isDepositPayment.value = typeof orderIdParam === 'string' && orderIdParam.startsWith('DEPOSIT_')
//     let actualOrderId = null

//     if (isDepositPayment.value) {
//         // Lấy orderId thực từ DEPOSIT_orderId
//         const match = orderIdParam.match(/DEPOSIT_(\d+)/)
//         actualOrderId = match ? parseInt(match[1]) : null

//         // Lấy orderId thực từ sessionStorage nếu có
//         const depositOrderId = sessionStorage.getItem('deposit_order_id')
//         if (depositOrderId) {
//             actualOrderId = parseInt(depositOrderId)
//         }

//     } else {
//         // Parse orderId bình thường
//         actualOrderId = orderIdParam ? parseInt(orderIdParam) : null
//     }

//     // Parse orderId
//     orderId.value = actualOrderId

//     // Parse resultCode (có thể là string hoặc number)
//     let resultCode = resultCodeParam ? (typeof resultCodeParam === 'string' ? parseInt(resultCodeParam) : resultCodeParam) : null

//     // Decode message nếu có
//     let message = messageParam || null
//     if (message) {
//         try {
//             message = decodeURIComponent(message)
//         } catch (e) {
//             // Nếu không decode được, giữ nguyên
//             console.warn('Could not decode message:', e)
//         }
//     }

//     // Nếu không có thông tin, redirect về trang chủ sau 3 giây
//     if (!orderId.value) {
//         status.value = 'failed'
//         errorMessage.value = 'Không tìm thấy thông tin đơn hàng'
//         setTimeout(() => {
//             goToHome()
//         }, 3000)
//         return
//     }

//     // Xử lý kết quả thanh toán
//     // resultCode === 0 hoặc '0' nghĩa là thanh toán thành công
//     // Nếu resultCode là null/undefined hoặc khác 0, nghĩa là thanh toán thất bại hoặc bị hủy
//     // Nếu không có resultCode, có thể user quay về trực tiếp từ web payment (hủy thanh toán)
//     if (resultCode === null || resultCode === undefined) {
//         // Xử lý như thanh toán thất bại - set resultCode = -1 để trigger logic xóa đơn hàng
//         resultCode = -1
//     }

//     if (resultCode === 0 || resultCode === '0') {
//         // Thanh toán thành công - cập nhật payment/deposit status
//         // Backend đã tự động cập nhật order status, không cần cập nhật ở frontend
//         if (orderId.value) {
//             if (isDepositPayment.value) {
//                 // Xử lý deposit payment - reload order để cập nhật deposit status
//                 try {
//                     await orderStore.getOrderByIdStore(orderId.value)
//                     // Backend đã tự động cập nhật order status, không cần gọi confirmOrderStatus()
//                     // await confirmOrderStatus()
//                 } catch (error) {
//                     console.error('Error reloading order after deposit payment:', error)
//                 }
//             } else {
//                 // Xử lý payment thông thường
//                 await updatePaymentStatus()
//                 // Backend đã tự động cập nhật order status, không cần gọi confirmOrderStatus()
//                 // await confirmOrderStatus()
//             }
//         }

//         // Xóa flags MoMo payment và deposit payment sau khi thanh toán thành công
//         sessionStorage.removeItem('momo_payment_order_id')
//         sessionStorage.removeItem('momo_payment_timestamp')
//         sessionStorage.removeItem('deposit_order_id')

//         // Lưu flag để ngăn user back về trang thanh toán
//         sessionStorage.setItem('order_completed', 'true')
//         sessionStorage.setItem('completed_order_id', orderId.value.toString())

//         status.value = 'success'

//         // Redirect về trang đơn hàng sau 2 giây (để user có thể thấy thông báo thành công)
//         setTimeout(() => {
//             router.push('/orders-page')
//         }, 2000)
//     } else {
//         // Thanh toán thất bại hoặc bị hủy - ĐẢM BẢO đơn hàng bị hủy và payment status FAILED
//         if (orderId.value) {
//             let orderCancelled = false
//             let paymentUpdated = false

//             // Bước 1: Cập nhật trạng thái đơn hàng thành CANCELLED
//             try {
//                 const cancelResponse = await orderStore.cancelOrderStore(orderId.value)

//                 if (cancelResponse?.data?.success) {
//                     orderCancelled = true
//                 } else {
//                     // Thử lại với updateOrderStatusStore nếu cancelOrderStore không thành công
//                     try {
//                         await orderStore.updateOrderStatusStore(orderId.value, 'CANCELLED')
//                         orderCancelled = true
//                     } catch (retryError) {
//                         console.error('❌ Thử lại hủy đơn hàng cũng thất bại:', retryError)
//                     }
//                 }
//             } catch (cancelError) {
//                 console.error('❌ Lỗi khi hủy đơn hàng:', cancelError)
//                 // Thử lại với updateOrderStatusStore nếu có lỗi
//                 try {
//                     await orderStore.updateOrderStatusStore(orderId.value, 'CANCELLED')
//                     orderCancelled = true
//                 } catch (retryError) {
//                     console.error('❌ Không thể hủy đơn hàng sau nhiều lần thử:', retryError)
//                 }
//             }

//             // Bước 2: Cập nhật payment status thành FAILED
//             try {
//                 const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderId.value)
//                 if (paymentResponse?.data?.success && paymentResponse?.data?.data) {
//                     const payment = paymentResponse.data.data
//                     const paymentData = Array.isArray(payment) ? payment[0] : payment
//                     const paymentId = paymentData?.payment_id || paymentData?.id || paymentData?.paymentId

//                     if (paymentId) {
//                         await paymentStore.updatePaymentStatusStore(paymentId, 'FAILED')
//                         paymentUpdated = true
//                     }
//                 }
//             } catch (paymentError) {
//                 console.error('❌ Lỗi khi cập nhật payment status:', paymentError)
//             }

//             if (!orderCancelled) {
//                 console.error('❌ CẢNH BÁO: Không thể hủy đơn hàng sau nhiều lần thử.')
//             }
//         }

//         // Xóa flags MoMo payment sau khi xử lý
//         sessionStorage.removeItem('momo_payment_order_id')
//         sessionStorage.removeItem('momo_payment_timestamp')
//         sessionStorage.removeItem('deposit_order_id')

//         status.value = 'failed'
//         errorMessage.value = message || 'Thanh toán không thành công. Đơn hàng đã được hủy.'
//     }
// })


// const goToOrders = () => {
//     router.push('/orders-page')
// }

// const goToCart = () => {
//     router.push('/cart')
// }

// const goToHome = () => {
//     router.push('/home')
// }
<!-- </script> -->
