<template>
    <div v-if="shouldDisplayOrder" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <!-- Order Header -->

        <!-- Payment and Shipping Info -->
        <div class="mt-4 mb-4 space-y-2">
            <div class="flex flex-col ">
                <div>
                    <h3 class="text-lg font-bold text-gray-800">Đơn hàng #{{ order.order_id }}</h3>
                    <p class="text-sm text-gray-600 mt-1">
                        Ngày đặt: {{ formatDate(order.order_date) }}
                    </p>
                </div>

            </div>

            <!-- Shipping Information -->
            <div class="bg-gray-50 rounded-lg p-4 mt-3 space-y-2">
                <h4 class="font-semibold text-gray-800 mb-2">Thông tin giao hàng:</h4>
                <div class="space-y-1 text-sm">
                    <div class="flex items-start gap-2">
                        <span class="font-medium text-gray-700 min-w-[100px]">Tên người nhận:</span>
                        <span class="text-gray-900">{{ getShippingUsername() }}</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="font-medium text-gray-700 min-w-[100px]">Số điện thoại:</span>
                        <span class="text-gray-900">{{ getShippingPhone() }}</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="font-medium text-gray-700 min-w-[100px]">Địa chỉ:</span>
                        <span class="text-gray-900">{{ getShippingAddress() }}</span>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Trạng thái đơn hàng:</span>
                <span :class="[
                    'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                    getStatusClass(order?.status)
                ]">
                    {{ getStatusText(order.status) }}
                </span>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Phương thức thanh toán ({{ getPaymentMethodName(order) }}):</span>
                <span :class="[
                    'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                    getPaymentStatusClass(paymentInfo?.status)
                ]">
                    {{ getPaymentStatusText(order) }}
                </span>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Trạng thái giao hàng:</span>
                <span :class="[
                    'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                    getShippingStatusClass(order?.shipping_status)
                ]">
                    {{ getShippingStatusText(order.shipping_status) }}
                </span>
            </div>
        </div>

        <!-- Order Items -->
        <div class="mb-4 pt-3 border-t  border-gray-300">
            <h4 class="font-semibold text-gray-800 mb-2">Sản phẩm:</h4>
            <div class="space-y-2">
                <div v-for="detail in order.order_details" :key="detail.order_detail_id"
                    class="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <img :src="getProductImage(detail.product)" :alt="getProductName(detail.product)"
                        class="w-16 h-16 object-contain bg-white rounded" @error="handleImageError($event)" />
                    <div>
                        <p class="font-medium text-gray-800">{{ getProductName(detail.product) }}</p>

                    </div>
                    <div class="flex flex-1 justify-center font-bold text-gray-800 font-semibold gap-100">
                        <p class="">
                            {{ formatPrice(detail.price_at_order) }}
                        </p>
                        <p class=""> x {{ detail.quantity }}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-green-600 ">{{ formatPrice(detail.sub_total) }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Order Summary - Tạm tính chi tiết giống ReviewOrderPage -->
        <div class="border-t border-gray-300 pt-4 space-y-3 ">
            <div class=" text-gray-600 flex justify-end gap-4">
                <span>Tạm tính ({{ totalQuantity }} sản phẩm):</span>
                <span class="font-semibold ">{{ formatPrice(order.total) }}</span>
            </div>
            <div class="flex justify-end gap-4 text-gray-600">
                <span>Phí vận chuyển: </span>
                <span class="font-semibold">
                    <span>{{ formatPrice(shippingFee) }}</span>
                </span>
            </div>
            <div v-if="specialDiscountAmount > 0" class="flex justify-end gap-4 text-green-600">
                <span>
                    Giảm giá
                    <span v-if="order.discount_code">({{ order.discount_code }})</span>:
                </span>
                <span class="font-semibold">-{{ formatPrice(specialDiscountAmount) }}</span>
            </div>
            <div v-if="order.deposit?.paid">
                <div class="flex justify-end gap-4 items-center">
                    <span class="text-gray-700">Số tiền đã đặt cọc:</span>
                    <span class="font-semibold text-green-600">{{ formatPrice(order.deposit.amount) }}</span>
                </div>
            </div>
            <div class="border-t pt-3 flex justify-end gap-4 text-lg font-bold text-gray-800">
                <span>Tổng cộng:</span>
                <span class="text-green-600">{{ formatPrice(order.final_total) }}</span>
            </div>
            <div v-if="order.deposit?.paid">
                <div class="flex justify-end gap-4 items-center">
                    <span class="font-semibold text-gray-800">Còn lại:</span>
                    <span class="text-lg font-bold text-orange-600">{{ formatPrice(remainingAmount) }}</span>
                </div>
            </div>

        </div>

        <!-- Deposit Information -->
        <!-- <div v-if="order.deposit_required" class="mt-4 pt-4 border-t space-y-3">
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-semibold text-gray-700">Trạng thái đặt cọc:</span>
                <span :class="[
                    'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                    order.deposit?.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                ]">
                    {{ order.deposit?.paid ? 'Đã đặt cọc' : 'Chưa đặt cọc' }}
                </span>
            </div> -->

        <!-- Nút đặt cọc (chỉ hiển thị khi chưa đặt cọc) -->
        <!-- <div v-if="!order.deposit?.paid && order.deposit_payment">
                <button @click="handleDepositPayment"
                    class="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors cursor-pointer">
                    Thanh toán cọc
                </button>
            </div> -->

        <!-- Thông tin chi tiết đặt cọc (hiển thị khi đã đặt cọc) -->
        <!-- <div v-if="order.deposit?.paid" class="bg-green-50 border-l-4 border-green-400 p-4 rounded space-y-3">
                <div class="flex items-center gap-2 mb-2">
                    <svg class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p class="text-sm font-semibold text-green-800">Đã đặt cọc thành công</p>
                </div>

                <div class="space-y-2 text-sm">

                    <div class="flex justify-between items-center">
                        <span class="text-gray-700">Tổng giá trị đơn hàng:</span>
                        <span class="font-semibold text-gray-800">{{ formatPrice(order.final_total) }}</span>
                    </div>
                    <div class="flex justify-between items-center pt-2 border-t border-green-200">
                        <span class="font-semibold text-gray-800">Số tiền còn lại phải thanh toán:</span>
                        <span class="text-lg font-bold text-orange-600">{{ formatPrice(remainingAmount) }}</span>
                    </div>
                </div>

                <p class="text-xs text-green-700 mt-2">
                    Đơn hàng sẽ được xử lý trong thời gian sớm nhất. Số tiền còn lại sẽ được thanh toán khi nhận hàng.
                </p>
            </div> -->

        <!-- Thông tin đặt cọc khi chưa đặt (hiển thị số tiền cần đặt cọc) -->
        <!-- <div v-else-if="order.deposit" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-700">Số tiền cần đặt cọc:</span>
                        <span class="font-semibold text-yellow-600">{{ formatPrice(order.deposit.amount) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-700">Tổng giá trị đơn hàng:</span>
                        <span class="font-semibold text-gray-800">{{ formatPrice(order.final_total) }}</span>
                    </div>
                </div>
            </div>
        </div> -->

        <!-- Action Buttons -->
        <div class="mt-4 pt-4  flex justify-end gap-3">
            <!-- Cancel Order Button -->
            <button v-if="showCancelButton" @click="$emit('cancel-order', order)"
                :disabled="order.status !== 'PENDING_CONFIRMATION'" :class="[
                    'px-4 py-1.5 text-sm rounded-lg font-medium transition-colors',
                    order.status === 'PENDING_CONFIRMATION'
                        ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                ]">
                Hủy đơn hàng
            </button>
            <!-- Review Button (only for DELIVERED orders) -->
            <router-link v-if="order.shipping_status === 'DELIVERED' && !hasAllProductsReviewed"
                :to="`/review/${order.order_id}`"
                class="px-4 py-1.5 text-sm rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer">
                Đánh giá sản phẩm
            </router-link>
            <!-- View Review Button (if all products are reviewed) -->
            <router-link v-if="order.shipping_status === 'DELIVERED' && hasAllProductsReviewed"
                :to="`/review/${order.order_id}`"
                class="px-4 py-1.5 text-sm rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer">
                Xem đánh giá
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { defineProps, computed, onMounted, watch, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useReviewStore } from '@/stores/reviews'
import { usePaymentStore } from '@/stores/payments'
import { useShippingFee } from '@/composables/useShippingFee'
import { useProductStore } from '@/stores/products'


const productStore = useProductStore()
const props = defineProps({
    order: {
        type: Object,
        required: true
    },
    showCancelButton: {
        type: Boolean,
        default: false
    },
    // Prop để xác định có áp dụng filter hay không (mặc định là true cho OrderPage)
    applyFilter: {
        type: Boolean,
        default: true
    }
})

defineEmits(['cancel-order'])

const authStore = useAuthStore()
const reviewStore = useReviewStore()
const paymentStore = usePaymentStore()
const { getShippingFeeFromOrder } = useShippingFee()
const userReviews = ref([])
const isLoadingReviews = ref(false)
const paymentInfo = ref(null)
const fullOrderInfo = ref(null)
const isLoadingOrderInfo = ref(false)

// Kiểm tra xem có nên hiển thị đơn hàng này không
// Chỉ áp dụng filter khi applyFilter = true (dùng trong OrderPage)
// Không áp dụng filter khi applyFilter = false (dùng trong OrderHistoryPage)
const shouldDisplayOrder = computed(() => {
    // Nếu không áp dụng filter, luôn hiển thị
    if (!props.applyFilter) {
        return true
    }

    // Chỉ áp dụng filter khi applyFilter = true (OrderPage)
    const status = (props.order.status || '').toUpperCase()
    const shippingStatus = (props.order.shipping_status || '').toUpperCase()

    // Chỉ KHÔNG hiển thị khi ĐỒNG THỜI status = CONFIRMED VÀ shipping_status = DELIVERED
    // Hoặc khi status = CANCELLED
    // Hoặc khi shipping_status = CANCELLED (Giao thất bại)
    // Nếu chỉ một trong hai điều kiện đúng (CONFIRMED hoặc DELIVERED) thì vẫn hiển thị
    const isConfirmedAndDelivered = status === 'CONFIRMED' && shippingStatus === 'DELIVERED'
    const isCancelled = status === 'CANCELLED'
    const isShippingCancelled = shippingStatus === 'CANCELLED'
    return !isConfirmedAndDelivered && !isCancelled && !isShippingCancelled
})

// Load user reviews to check if all products are reviewed
const loadUserReviews = async () => {
    const userId = authStore.userId
    if (!userId || props.order.shipping_status !== 'DELIVERED') return

    isLoadingReviews.value = true
    try {
        await reviewStore.getReviewsByUserIdStore(userId)
        userReviews.value = reviewStore.userReviews || []
    } catch (error) {
        console.error('Error loading user reviews:', error)
        userReviews.value = []
    } finally {
        isLoadingReviews.value = false
    }
}

// Check if all order_details in order have been reviewed (based on order_detail_id)
const hasAllProductsReviewed = computed(() => {
    if (!props.order.order_details || props.order.order_details.length === 0) {
        return false
    }

    // If reviews haven't loaded yet, return false
    if (isLoadingReviews.value) {
        return false
    }

    // Check if all order_details have reviews (each order_detail_id should have its own review)
    const allReviewed = props.order.order_details.every(detail => {
        const orderDetailId = detail.order_detail_id
        if (!orderDetailId) return false

        // Check if there's a review for this order_detail_id
        return userReviews.value.some(review => {
            const reviewOrderDetailId = review.order_detail_id || review.orderDetailId
            return reviewOrderDetailId && String(reviewOrderDetailId) === String(orderDetailId)
        })
    })

    return allReviewed
})

// Watch order changes to reload reviews
watch(() => props.order.order_id, () => {
    if (props.order.shipping_status === 'DELIVERED') {
        loadUserReviews()
    }
}, { immediate: true })

// Load full order info nếu thiếu thông tin shipping
const loadFullOrderInfo = async () => {
    // Kiểm tra xem đã có đủ thông tin shipping chưa
    const hasShippingInfo = props.order.shipping_username ||
        props.order.shipping_phone ||
        props.order.shipping_address ||
        props.order.user?.username ||
        props.order.user?.phone_number ||
        props.order.user?.address

    if (hasShippingInfo) {
        return // Đã có thông tin, không cần load
    }

    if (isLoadingOrderInfo.value || fullOrderInfo.value) {
        return // Đang load hoặc đã load rồi
    }



    // Nếu có user_id, thử load user info
    if (props.order.user_id && authStore.accessToken) {
        try {
            const { useUserStore } = await import('@/stores/user')
            const userStore = useUserStore()
            await userStore.getInfo(authStore.accessToken)
            if (userStore.userInfo && userStore.userInfo.user_id === props.order.user_id) {
                // Tạo fullOrderInfo từ user info
                fullOrderInfo.value = {
                    ...props.order,
                    user: userStore.userInfo
                }
                return
            }
        } catch (error) {
            console.error('❌ OrderCard - Error loading user info:', error)
        }
    }

    // Nếu không load được user info, không gọi API getOrderById vì nó không có thông tin shipping
}

// Load product deleted info nếu thiếu
const loadMissingProducts = async () => {
    if (!props.order.order_details) return
    for (const orderDetail of props.order.order_details) {
        if (!orderDetail.product?.product_name && orderDetail.product_id) {
            try {
                const product = await productStore.getProductByIdDeletedStore(orderDetail.product_id)
                if (product) orderDetail.product = product
            } catch (error) {
                console.error('Error loading product:', error)
            }
        }
    }
}

onMounted(async () => {
    // Load lại product nếu thiếu
    await loadMissingProducts()

    if (props.order.shipping_status === 'DELIVERED') {
        loadUserReviews()
    }
    // Load payment info nếu chưa có
    loadPaymentInfo()
    // Load full order info nếu thiếu thông tin shipping
    loadFullOrderInfo()
})

// Tính tổng số lượng sản phẩm
const totalQuantity = computed(() => {
    if (!props.order.order_details) return 0
    return props.order.order_details.reduce((sum, detail) => sum + (detail.quantity || 0), 0)
})

// Tính tổng giá trị đơn hàng (tạm tính)
// const subTotal = computed(() => {
//     if (!props.order.order_details) return props.order.total || 0
//     return props.order.order_details.reduce((sum, detail) => {
//         return sum + (detail.sub_total || (detail.price_at_order || 0) * (detail.quantity || 0))
//     }, 0)
// })




// Lấy special discount amount (discount từ mã giảm giá)
const specialDiscountAmount = computed(() => {
    // Nếu có auto_discount_amount và discount_amount, thì discount_amount là special discount
    if (props.order.auto_discount_amount && props.order.discount_amount) {
        // discount_amount có thể là tổng hoặc chỉ special, cần kiểm tra
        // Nếu có total_discount_amount, thì special = total - auto
        if (props.order.total_discount_amount) {
            return props.order.total_discount_amount - (props.order.auto_discount_amount || 0)
        }
        // Nếu không có total_discount_amount, giả sử discount_amount là special
        return props.order.discount_amount
    }
    // Nếu không có auto discount, thì discount_amount là special discount
    return props.order.discount_amount || 0
})

// Tính phí ship sử dụng composable
const shippingFee = computed(() => {
    return getShippingFeeFromOrder(props.order, props.order.order_details)
})



// Tính số tiền còn lại phải thanh toán sau khi đặt cọc
const remainingAmount = computed(() => {
    if (!props.order.deposit_required || !props.order.deposit?.paid || !props.order.deposit?.amount) {
        return props.order.final_total || 0
    }
    const depositAmount = props.order.deposit.amount || 0
    const finalTotal = props.order.final_total || 0
    const remaining = finalTotal - depositAmount
    return remaining > 0 ? remaining : 0
})

const formatPrice = (price) => {
    if (!price) return '0 ₫'
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) : price
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(numPrice)
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getStatusText = (status) => {
    const statusMap = {
        'PENDING': 'Chờ xử lý',
        'PENDING_CONFIRMATION': 'Chờ xác nhận',
        'CONFIRMED': 'Đã xác nhận',
        'PROCESSING': 'Đang xử lý',
        'SHIPPING': 'Đang giao hàng',
        'DELIVERED': 'Đã giao hàng',
        'CANCELLED': 'Đã hủy'
    }
    return statusMap[status] || status
}

// Hàm chung để lấy class cho tất cả các loại status (order status và shipping status)
const getStatusClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800'

    const classMap = {
        // Order status
        'PENDING_CONFIRMATION': 'bg-yellow-100 text-yellow-800',
        'CONFIRMED': 'bg-blue-100 text-blue-800',
        'CANCELLED': 'bg-red-100 text-red-800',
        'FAILED': 'bg-red-100 text-red-800',
    }
    return classMap[status] || 'bg-gray-100 text-gray-800'
}
const getShippingStatusClass = (shipping_status) => {
    if (!shipping_status) return 'bg-gray-100 text-gray-800'

    const classMap = {

        'SHIPPING': 'bg-indigo-100 text-indigo-800',
        'DELIVERED': 'bg-green-100 text-green-800',
        'CANCELLED': 'bg-red-100 text-red-800',
        'PREPARING_ORDER': 'bg-orange-100 text-orange-800',
        'UNDELIVERED': 'bg-yellow-100 text-yellow-800',
    }
    return classMap[shipping_status] || 'bg-gray-100 text-gray-800'
}
const getPaymentStatusClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800'

    const classMap = {

        'PROCESSING': 'bg-yellow-100 text-yellow-800',
        'FAILED': 'bg-red-100 text-red-800',
        'SUCCESS': 'bg-green-100 text-green-800',
    }
    return classMap[status] || 'bg-gray-100 text-gray-800'
}


// Lấy tên phương thức thanh toán từ order
const getPaymentMethodName = () => {
    // Ưu tiên lấy từ order.payment (đã được load từ getOrdersByUserIdStore)
    if (props.order.payment?.method?.name) {
        return props.order.payment.method.name
    }
    if (props.order.payment?.method_name) {
        return props.order.payment.method_name
    }
    if (props.order.payment_method) {
        return props.order.payment_method
    }
    // Fallback về paymentInfo nếu có
    if (paymentInfo.value?.method_name) {
        return paymentInfo.value.method_name
    }
    return 'COD' // Default
}

// Lấy trạng thái thanh toán
const getPaymentStatusText = (order) => {
    // Ưu tiên lấy từ payment object
    if (order.payment?.status) {
        const statusMap = {
            'PROCESSING': 'Đang xử lý',
            'SUCCESS': 'Thành công',
            'FAILED': 'Thất bại'
        }
        return statusMap[order.payment.status] || order.payment.status
    }
    // Nếu không có, thử lấy từ paymentInfo
    if (paymentInfo.value?.status) {
        const statusMap = {
            'PROCESSING': 'Đang xử lý',
            'SUCCESS': 'Thành công',
            'FAILED': 'Thất bại'
        }
        return statusMap[paymentInfo.value.status] || paymentInfo.value.status
    }
    return 'Chưa xác định'
}



// Lấy trạng thái giao hàng
const getShippingStatusText = (shippingStatus) => {
    if (!shippingStatus) return 'Chưa xác định'
    const statusMap = {
        'PREPARING_ORDER': 'Đang chuẩn bị đơn',
        'SHIPPING': 'Đang giao hàng',
        'DELIVERED': 'Đã giao hàng',
        'UNDELIVERED': 'Chưa được giao',
        'CANCELLED': 'Giao thất bại'
    }
    return statusMap[shippingStatus] || shippingStatus
}


// Load payment info nếu chưa có trong order
const loadPaymentInfo = async () => {
    // Ưu tiên sử dụng payment info từ order object (đã được load từ getOrdersByUserIdStore)
    if (props.order.payment) {
        paymentInfo.value = props.order.payment
        return
    }

    // Nếu đã load paymentInfo rồi thì không load lại
    if (paymentInfo.value) return

    // Chỉ load từ API nếu order không có payment info
    try {
        const paymentResponse = await paymentStore.getPaymentByOrderIdStore(props.order.order_id)
        if (paymentResponse?.data?.success && paymentResponse?.data?.data) {
            // Xử lý cả trường hợp array và object
            const data = paymentResponse.data.data
            if (Array.isArray(data) && data.length > 0) {
                // Nếu là array, lấy phần tử đầu tiên
                paymentInfo.value = data[0]
            } else if (typeof data === 'object') {
                // Nếu là object, dùng trực tiếp
                paymentInfo.value = data
            }
        }
    } catch (error) {
        console.error('❌ Error loading payment info:', error)
    }
}

const getProductName = (product) => {
    return product?.product_name || 'Không có tên'
}

const getProductImage = (product) => {
    const imageUrl = product?.img_url
    if (!imageUrl || imageUrl.trim() === '') {
        return '/img/footer.png'
    }
    return imageUrl
}

const handleImageError = (event) => {
    if (!event.target.src.includes('footer.png')) {
        event.target.src = '/img/footer.png'
    }
}

// Lấy thông tin giao hàng từ order prop (đã được load từ getOrdersByUserIdStore)
// Sử dụng fullOrderInfo nếu đã load, nếu không thì dùng props.order
const getShippingUsername = () => {
    const order = fullOrderInfo.value || props.order
    const username = order.shipping_name
    return username
}

const getShippingPhone = () => {
    const order = fullOrderInfo.value || props.order
    const phone = order.shipping_phone
    return phone
}

const getShippingAddress = () => {
    const order = fullOrderInfo.value || props.order
    const address = order.shipping_address
    return address
}

// Handle deposit payment
// const handleDepositPayment = () => {
//     const order = fullOrderInfo.value || props.order
//     if (!order.deposit_payment) return

//     // Lưu orderId vào sessionStorage
//     sessionStorage.setItem('deposit_order_id', order.order_id.toString())

//     // Kiểm tra nếu là mobile, dùng deeplink, nếu không dùng payUrl
//     const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
//     const paymentUrl = isMobile && order.deposit_payment.deeplink
//         ? order.deposit_payment.deeplink
//         : order.deposit_payment.payUrl

//     if (paymentUrl) {
//         window.location.href = paymentUrl
//     } else {
//         alert('Không tìm thấy link thanh toán. Vui lòng thử lại!')
//     }
// }
</script>
