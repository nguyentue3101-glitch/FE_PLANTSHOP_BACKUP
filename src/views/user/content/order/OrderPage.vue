<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4 max-w-6xl">
            <BackButton />
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-3xl font-bold text-green-700 flex-1 text-center">Đơn hàng của tôi</h1>
                <router-link to="/order-history" class="text-green-700 hover:text-green-500 transition-colors">
                    <History :size="28" />
                </router-link>
            </div>

            <!-- Loading and Error State -->
            <LoadingErrorState :isLoading="isLoading" loadingMessage="Đang tải đơn hàng..." />

            <!-- Empty State -->
            <div v-if="!isLoading && displayedOrdersCount === 0" class="text-center py-16 bg-white rounded-lg shadow">
                <div class="mb-4">
                    <History class="mx-auto h-24 w-24 text-gray-400" />
                </div>
                <p class="text-xl text-gray-600 mb-4">Bạn chưa có đơn hàng nào</p>
                <router-link to="/product"
                    class="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    Tiếp tục mua sắm
                </router-link>
            </div>

            <!-- Orders List -->
            <div v-if="!isLoading && !errorMessage && orders.length > 0" class="space-y-4">
                <OrderCard v-for="order in orders" :key="order.order_id" :order="order" :showCancelButton="true"
                    :applyFilter="true" @cancel-order="openCancelModal" />
            </div>
        </div>

        <!-- Cancel Order Confirmation Modal -->
        <div v-if="showCancelModal" class="fixed inset-0  flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 class="text-lg font-semibold mb-4 text-red-600">Xác nhận hủy đơn hàng</h3>
                <p class="mb-6 text-gray-700">
                    Bạn có chắc chắn muốn hủy đơn hàng <span class="font-bold">#{{
                        selectedOrderForCancel?.order_id }}</span> không?
                </p>
                <div v-if="cancelError" class="mb-4 text-red-600 text-sm ">
                    {{ cancelError }}
                </div>
                <div class="flex justify-end space-x-4">
                    <button @click="closeCancelModal" :disabled="isCancelling"
                        class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-800 font-semibold transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed cursor-pointer">
                        Hủy
                    </button>
                    <button @click="handleCancelOrder" :disabled="isCancelling"
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold transition-colors disabled:bg-red-400 disabled:cursor-not-allowed cursor-pointer">
                        {{ isCancelling ? 'Đang xử lý...' : 'Xác nhận hủy' }}
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrderStore } from '@/stores/orders'
import { useAsyncOperation } from '@/composables/useAsyncOperation'
// import { useShippingFee } from '@/composables/useShippingFee'
import OrderCard from '@/components/common/user/OrderCard.vue'
import LoadingErrorState from '@/components/common/LoadingErrorState.vue'
import BackButton from '@/components/common/user/BackButton.vue'
import { History } from 'lucide-vue-next'
import { usePaymentStore } from '@/stores/payments'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const orderStore = useOrderStore()
const paymentStore = usePaymentStore()
const { isLoading, errorMessage, executeAsync } = useAsyncOperation()
// const { getShippingFeeFromOrder } = useShippingFee()

const orders = ref([])
const showCancelModal = ref(false)
const selectedOrderForCancel = ref(null)
const cancelError = ref('')
const isCancelling = ref(false)

// ==================== MoMo Payment Return Handling ====================
const clearMoMoFlags = () => {
    sessionStorage.removeItem('momo_payment_order_id')
    sessionStorage.removeItem('momo_payment_timestamp')
    sessionStorage.removeItem('deposit_order_id')
}


//  kiểm tra payment status và clear flags
const handleMoMoPaymentReturn = async () => {
    const momoOrderId = sessionStorage.getItem('momo_payment_order_id')
    const depositOrderId = sessionStorage.getItem('deposit_order_id')

    // Parse orderId
    let orderIdNum = null
    if (depositOrderId) {
        orderIdNum = parseInt(depositOrderId)
    } else if (momoOrderId) {
        orderIdNum = parseInt(momoOrderId)
    }

    if (!orderIdNum) {
        clearMoMoFlags()
        return
    }

    

    try {
        // Kiểm tra payment status từ backend
        const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderIdNum)
        const payment = paymentResponse?.data?.data || null
        const paymentStatus = payment?.status

        // clear flags
        if (paymentStatus === 'SUCCESS' || paymentStatus === 'FAILED') {
            clearMoMoFlags()
            return
        }

    } catch (error) {
        console.error(' OrderPage - Lỗi khi kiểm tra trạng thái MoMo:', error)
    }
}
// ==================== End MoMo Payment Return Handling ====================

// Đếm số đơn hàng sẽ được hiển thị (sau khi OrderCard filter)
const displayedOrdersCount = computed(() => {
    return orders.value.filter(order => {
        const status = (order.status || '').toUpperCase()
        const shippingStatus = (order.shipping_status || '').toUpperCase()
        // Chỉ KHÔNG hiển thị khi ĐỒNG THỜI status = CONFIRMED VÀ shipping_status = DELIVERED
        // Hoặc khi status = CANCELLED
        // Hoặc khi shipping_status = CANCELLED (Giao thất bại)
        const isConfirmedAndDelivered = status === 'CONFIRMED' && shippingStatus === 'DELIVERED'
        const isCancelled = status === 'CANCELLED'
        const isShippingCancelled = shippingStatus === 'CANCELLED'
        return !isConfirmedAndDelivered && !isCancelled && !isShippingCancelled
    }).length
})



const loadOrders = async () => {
    const userId = authStore.userId
    if (!userId) {
        router.push('/login')
        return
    }

    await executeAsync(async () => {
        // Reload orders từ API để đảm bảo có dữ liệu mới nhất
        await orderStore.getOrdersByUserIdStore(userId)
        orders.value = orderStore.orders || []


    }, {
        defaultErrorMessage: 'Không thể tải danh sách đơn hàng!',
        onError: (error) => {
            errorMessage.value = error.response?.data?.message || error.message
        }
    })
}

onMounted(async () => {
    // Kiểm tra và xử lý query params từ MoMo trước
    const hasMoMoQueryParams = route.query.paymentResult

    if (hasMoMoQueryParams) {
        // Xử lý MoMo payment return
        await handleMoMoPaymentReturn()

        // Xóa query params bằng cách replace URL
        // Điều này sẽ thay thế entry hiện tại trong history
        router.replace({
            path: '/orders-page',
            query: {}
        })

        // Thay thế entry trước đó 
        // setTimeout(() => {
        //     // Lưu state hiện tại
        //     const currentState = window.history.state

        //     // Sử dụng history.go(-1) để quay lại, sau đó replaceState
        //     if (window.history.length > 1) {
        //         // Tạo một entry mới thay thế MoMo
        //         window.history.replaceState(
        //             { ...currentState, as: '/' },
        //             '',
        //             '/'
        //         )
        //         // Quay lại orders-page
        //         window.history.pushState(
        //             { ...currentState, as: '/orders-page' },
        //             '',
        //             '/orders-page'
        //         )
        //     }
        // }, 100)
    } else {
        // Nếu không có query params, chỉ xử lý MoMo payment return từ sessionStorage
        await handleMoMoPaymentReturn()
    }

    // Sau đó load orders
    loadOrders()
})

// // Reload khi route thay đổi 
// watch(() => route.path, (newPath, oldPath) => {
//         console.log('PATH:', oldPath, '=>', newPath)
//     if (newPath.includes('/orders-page') && oldPath && oldPath !== newPath) {
//         loadOrders()
//     }
// }, { immediate: false })


// Cancel order functions
const openCancelModal = (order) => {
    selectedOrderForCancel.value = order
    showCancelModal.value = true
    cancelError.value = ''
}

const closeCancelModal = () => {
    showCancelModal.value = false
    selectedOrderForCancel.value = null
    cancelError.value = ''
}

const handleCancelOrder = async () => {
    if (!selectedOrderForCancel.value) return

    isCancelling.value = true
    cancelError.value = ''

    try {
        const orderId = selectedOrderForCancel.value.order_id

        // Hủy đơn hàng (cập nhật status thành CANCELLED)
        const response = await orderStore.cancelOrderStore(orderId)

        if (response.success) {
            // Cập nhật payment status thành FAILED 
            try {
                // Thử lấy payment từ order_id
                try {
                    const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderId)
                    if (paymentResponse.success && paymentResponse.data) {
                        const payment = paymentResponse.data
                        console.log('===================payment lấy từ order_id:', payment)

                        //lấy payment_id
                        const paymentId = payment?.payment_id ||
                            (typeof payment === 'number' ? payment : null)
                        console.log('===================paymentId lấy từ order_id:', paymentId.payment_id)

                        if (paymentId) {
                            await paymentStore.updatePaymentStatusStore(paymentId, 'FAILED')
                        }
                    }
                } catch (error) {
                    console.warn('ko lấy được đơn bằng order_id:', error)
                    // Nếu API lấy payment theo order_id không tồn tại, thử lấy từ order object
                    const orderResponse = await orderStore.getOrderByIdStore(orderId)
                    if (orderResponse.success && orderResponse.data) {
                        const order = orderResponse.data
                        const paymentId = order.payment_id 
                        console.log('===================payment lấy từ order_id:', paymentId)

                        if (paymentId) {
                            await paymentStore.updatePaymentStatusStore(paymentId, 'FAILED')
                        }
                    }
                }
            } catch (paymentError) {
                console.error('Error updating payment status:', paymentError)
                // Không throw error vì đơn hàng đã được hủy thành công
            }

            // Reload orders
            await loadOrders()
            closeCancelModal()
        } else {
            cancelError.value = response.message || 'Hủy đơn hàng thất bại!'
        }
    } catch (error) {
        console.error('Error canceling order:', error)
        cancelError.value = error.response?.message || 'Có lỗi xảy ra khi hủy đơn hàng!'
    } finally {
        isCancelling.value = false
    }
}
</script>
