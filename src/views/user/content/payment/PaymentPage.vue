<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4 max-w-6xl">
            <BackButton />
            <h1 class="text-3xl font-bold text-green-700 mb-8 text-center">Thanh Toán</h1>

            <!-- Empty State: Không có đơn hàng -->
            <div v-if="orderItems.length === 0" class="text-center py-16 bg-white rounded-lg shadow">
                <div class="mb-4">
                    <ShoppingCart class="mx-auto h-24 w-24 text-gray-400" />
                </div>
                <p class="text-xl text-gray-600 mb-4">Bạn không có đơn hàng nào cần thanh toán</p>
                <router-link to="/cart"
                    class="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    Quay lại giỏ hàng
                </router-link>
            </div>

            <!-- Payment Content: Có đơn hàng -->
            <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left: Order Items -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Shipping Info -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 class="text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200">Thông tin giao
                            hàng</h2>
                        <div class="space-y-3 text-gray-700">
                            <div class="flex items-start gap-3">
                                <span class="font-semibold text-gray-900 min-w-[120px]">Tên:</span>
                                <span class="text-gray-700">{{ shippingInfo.username }}</span>
                            </div>
                            <div class="flex items-start gap-3">
                                <span class="font-semibold text-gray-900 min-w-[120px]">Số điện thoại:</span>
                                <span class="text-gray-700">{{ shippingInfo.phone_number }}</span>
                            </div>
                            <div class="flex items-start gap-3">
                                <span class="font-semibold text-gray-900 min-w-[120px]">Địa chỉ:</span>
                                <span class="text-gray-700">{{ shippingInfo.address }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Order Items -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 class="text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200">Sản phẩm đặt hàng
                        </h2>
                        <div class="space-y-4">
                            <div v-for="item in orderItems" :key="item.cart_detail_id || item.product_id"
                                class="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                                <img :src="getProductImage(item)" :alt="getProductName(item)"
                                    class="w-24 h-24 object-contain bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0"
                                    @error="handleImageError($event)" />
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-semibold text-gray-900 mb-2 text-lg">{{ getProductName(item) }}</h3>
                                    <div class="flex items-center gap-4 text-sm">
                                        <span class="text-green-600 font-bold text-base">{{ formatPrice(item.price)
                                            }}</span>
                                        <span class="text-gray-500">x {{ item.quantity }}</span>
                                    </div>
                                </div>
                                <div class="text-right flex-shrink-0">
                                    <p class="font-bold text-gray-900 text-lg">
                                        {{ formatPrice((item.price || 0) * item.quantity) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Order Summary & Discount -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                        <!-- Hiển thị các mã giảm giá có thể áp dụng -->
                        <div v-if="availableDiscountCodes.length > 0" class="mt-4">
                            <p class="text-sm font-semibold text-gray-700 mb-2">Mã giảm giá có thể áp dụng:</p>
                            <div class="flex flex-wrap gap-2">
                                <button v-for="discount in availableDiscountCodes" :key="discount.code"
                                    @click="applyAvailableDiscount(discount)" :class="[
                                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border text-left',
                                        appliedSpecialDiscount?.code === discount.code
                                            ? 'bg-green-600 text-white border-green-700'
                                            : 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300'
                                    ]"
                                    :title="discount.description || `Mã ${discount.code}${discount.quantity > 0 ? ` - Áp dụng cho đơn hàng từ ${discount.quantity} sản phẩm` : ''}`"
                                    :disabled="appliedSpecialDiscount?.code === discount.code">
                                    <div class="flex items-center justify-between gap-2">
                                        <div class="flex flex-col">
                                            <span class="font-bold">{{ discount.code }}</span>
                                            <span class="text-xs opacity-75">
                                                <span v-if="discount.type === 'percent'">
                                                    - {{ discount.value }}%
                                                </span>
                                                <span v-else-if="discount.type === 'amount'">
                                                    - {{ formatPrice(discount.value) }}
                                                </span>
                                                <span v-if="discount.quantity > 0" class="ml-1">
                                                    • Từ {{ discount.quantity }} SP
                                                </span>
                                            </span>
                                        </div>
                                        <span v-if="appliedSpecialDiscount?.code === discount.code"
                                            class="text-base">✓</span>
                                    </div>
                                </button>
                            </div>
                            <!-- Discount Section -->
                            <div class="space-y-3 border-t border-green-300 mt-5">
                                <div v-if="appliedSpecialDiscount"
                                    class="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div class="flex items-start justify-between mb-2">
                                        <p class="text-sm text-green-800">
                                            <span class="font-semibold">Đã áp dụng:</span>
                                            <span class="font-bold">{{ appliedSpecialDiscount.code }}</span>
                                            <span v-if="appliedSpecialDiscount.type === 'percent'" class="ml-1">
                                                - {{ appliedSpecialDiscount.value }}%
                                            </span>
                                            <span v-else-if="appliedSpecialDiscount.type === 'amount'" class="ml-1">
                                                - {{ formatPrice(appliedSpecialDiscount.value) }}
                                            </span>
                                        </p>
                                    </div>
                                    <button @click="removeDiscount"
                                        class="text-red-600 text-sm hover:text-red-700 hover:underline font-medium cursor-pointer">
                                        Xóa mã giảm giá
                                    </button>
                                </div>
                            </div>

                            <div class=" flex mt-3 text-sm text-red-500 bg-gray-50 p-2 rounded">
                                <Lightbulb class="w-6 h-5  text-yellow-400 items-center" />
                                <p>
                                    Không áp dụng đồng thời nhiều mã khuyến mãi!
                                </p>
                            </div>
                        </div>


                        <!-- Error Message -->
                        <div v-if="errorMessage"
                            class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                            {{ errorMessage }}
                        </div>


                        <!-- Payment Method -->
                        <div class="mb-6 pb-6 border-b border-gray-200">
                            <label class="block text-gray-900 font-semibold mb-4">Phương thức thanh toán</label>
                            <div class="space-y-3">
                                <label
                                    class="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all"
                                    :class="paymentMethod === 'COD' ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                                    <input type="radio" v-model="paymentMethod" value="COD"
                                        class="w-5 h-5 text-green-600 focus:ring-green-500" />
                                    <div class="flex-1">
                                        <span class="font-semibold text-gray-900">COD</span>
                                        <span class="block text-xs text-gray-500 mt-0.5">Thanh toán khi nhận hàng</span>
                                    </div>
                                </label>
                                <label
                                    class="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all"
                                    :class="paymentMethod === 'MOMO' ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                                    <input type="radio" v-model="paymentMethod" value="MOMO"
                                        class="w-5 h-5 text-green-600 focus:ring-green-500" />
                                    <div class="flex-1">
                                        <span class="font-semibold text-gray-900">Momo</span>
                                        <span class="block text-xs text-gray-500 mt-0.5">Thanh toán online</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Price Summary -->
                        <div class="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
                            <div class="flex justify-between items-center py-2">
                                <span class="text-gray-700">Tạm tính:</span>
                                <span class="font-semibold text-gray-900">{{ formatPrice(subTotal) }}</span>
                            </div>
                            <div class="flex justify-between items-center py-2"
                                :class="finalShippingFee === 0 ? 'text-green-600' : 'text-gray-700'">
                                <span class="text-sm">Phí vận chuyển ({{ totalQuantity }} sản phẩm):</span>
                                <span class="font-semibold">
                                    <span v-if="finalShippingFee === 0">Miễn phí</span>
                                    <span v-else>{{ formatPrice(finalShippingFee) }}</span>
                                </span>
                            </div>
                            <div v-if="specialDiscountAmount > 0"
                                class="flex justify-between items-center py-2 text-green-600">
                                <span class="text-sm">
                                    Khuyến mãi(
                                    <span v-if="appliedSpecialDiscount?.code" class="font-medium">({{
                                        appliedSpecialDiscount.code }}</span>
                                    <!-- <span v-if="specialDiscountPercent !== null"> - {{ specialDiscountPercent }}%</span>
                                    <span v-if="appliedSpecialDiscount?.code">)</span> -->
                                    )
                                </span>
                                <span class="font-semibold">-{{ formatPrice(specialDiscountAmount) }}</span>
                            </div>
                            <div class="border-t border-gray-300 pt-4 mt-2 flex justify-between items-center">
                                <span class="text-lg font-bold text-gray-900">Tổng cộng:</span>
                                <span class="text-xl font-bold text-green-600">{{ formatPrice(finalTotal) }}</span>
                            </div>
                        </div>



                        <!-- Submit Button (chỉ hiển thị khi chưa tạo đơn hoặc COD) -->
                        <button v-if="!createdOrderId && paymentMethod !== 'MOMO'" @click="handleCreateOrder"
                            :disabled="isCreatingOrder"
                            class="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 px-6 rounded-lg font-semibold transition-all disabled:bg-gray-400 disabled:cursor-not-allowed mb-3 cursor-pointer shadow-sm hover:shadow-md">
                            {{ isCreatingOrder ? 'Đang tạo đơn hàng...' : 'Xác nhận đặt hàng' }}
                        </button>

                        <!-- Button tạo đơn cho MOMO -->
                        <button v-if="!createdOrderId && paymentMethod === 'MOMO'" @click="handleCreateOrderForMoMo"
                            :disabled="isCreatingOrder"
                            class="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 px-6 rounded-lg font-semibold transition-all disabled:bg-gray-400 disabled:cursor-not-allowed mb-3 cursor-pointer shadow-sm hover:shadow-md">
                            {{ isCreatingOrder ? 'Đang tạo đơn hàng...' : 'Tạo đơn hàng và thanh toán MoMo' }}
                        </button>

                        <button @click="handleCancel"
                            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors cursor-pointer border border-gray-300">
                            Hủy
                        </button>
                    </div>
                </div>

            </div>
        </div>

        <!-- Deposit Modal -->
        <DepositModal :show="showDepositModal" :deposit="currentDeposit" :deposit-payment="currentDepositPayment"
            :order-id="createdOrderId" :order-data="depositOrderData" :deposit-amount="depositAmount"
            @close="handleCloseDepositModal" @payment="handleCreateOrderForDeposit"
            @order-created="handleOrderCreatedFromDeposit" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useDiscountStore } from '@/stores/discounts'
import { useOrderStore } from '@/stores/orders'
import { useUserStore } from '@/stores/user'
import { usePaymentMethodStore } from '@/stores/payment-methods'
import { usePaymentStore } from '@/stores/payments'
import { useAsyncOperation } from '@/composables/useAsyncOperation'
import { useProvinces } from '@/composables/useProvinces'
import { useShippingFee } from '@/composables/useShippingFee'
import BackButton from '@/components/common/user/BackButton.vue'
import DepositModal from '@/components/common/user/DepositModal.vue'
import { ShoppingCart } from 'lucide-vue-next'
import { Lightbulb } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()
const discountStore = useDiscountStore()
const orderStore = useOrderStore()
const userStore = useUserStore()
const paymentMethodStore = usePaymentMethodStore()
const paymentStore = usePaymentStore()
const { isLoading: isCreatingOrder, errorMessage, executeAsync } = useAsyncOperation()
const { provinces, getProvinceByCode } = useProvinces()
const { calculateShippingFeeByCity } = useShippingFee()

const shippingInfo = ref({})
const orderItems = ref([])
const appliedSpecialDiscount = ref(null)
const availableDiscounts = ref([])
const paymentMethod = ref('COD')
const createdOrderId = ref(null)
const isOrderCompleted = ref(false)

// Deposit fields
const showDepositModal = ref(false)
const currentDeposit = ref(null)
const currentDepositPayment = ref(null)


// Kiểm tra xem có đang trong quá trình thanh toán không
const isPaymentActive = () => {
    return createdOrderId.value !== null && paymentMethod.value === 'MOMO'
}

// Kiểm tra xem có đang trong quá trình thanh toán MoMo không (dựa vào sessionStorage)
const isMoMoPaymentActive = () => {
    const momoOrderId = sessionStorage.getItem('momo_payment_order_id')
    const momoTimestamp = sessionStorage.getItem('momo_payment_timestamp')
    return !!(momoOrderId && momoTimestamp) || isPaymentActive()
}

// Hàm hủy đơn hàng khi user rời khỏi trang thanh toán MoMo
const cancelOrderOnMoMoLeave = async () => {
    try {
        // Kiểm tra sessionStorage flags trước
        const momoOrderId = sessionStorage.getItem('momo_payment_order_id')
        const depositOrderId = sessionStorage.getItem('deposit_order_id')

        // Ưu tiên lấy orderId từ sessionStorage (nếu có)
        let orderIdToCancel = momoOrderId || depositOrderId || createdOrderId.value

        if (!orderIdToCancel) {
            return
        }

        const orderIdNum = parseInt(orderIdToCancel)
        if (isNaN(orderIdNum)) {
            return
        }

        // Hủy đơn hàng
        try {
            await orderStore.cancelOrderStore(orderIdNum)
        } catch (cancelError) {
            console.error('❌ Lỗi khi hủy đơn hàng:', cancelError)
        }

        // Cập nhật payment status thành FAILED
        try {
            const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderIdNum)
            if (paymentResponse?.data?.success && paymentResponse?.data?.data) {
                const payment = paymentResponse.data.data
                const paymentId = payment.payment_id || payment.id || payment.paymentId
                if (paymentId) {
                    await paymentStore.updatePaymentStatusStore(paymentId, 'FAILED')
                }
            }
        } catch (paymentError) {
            console.error('❌ Lỗi khi cập nhật payment status:', paymentError)
        }

        // Xóa flags
        sessionStorage.removeItem('momo_payment_order_id')
        sessionStorage.removeItem('momo_payment_timestamp')
        sessionStorage.removeItem('deposit_order_id')
        createdOrderId.value = null
    } catch (error) {
        console.error('❌ Lỗi khi hủy đơn hàng:', error)
    }
}

// Sử dụng onBeforeRouteLeave để tự động hủy đơn hàng khi rời khỏi trang thanh toán MOMO
onBeforeRouteLeave(async (to, from, next) => {
    // Nếu đang trong quá trình thanh toán MOMO, tự động hủy đơn hàng
    if (isMoMoPaymentActive()) {
        await cancelOrderOnMoMoLeave()
    }
    // Cho phép navigation
    next()
})

// Xử lý khi user đóng tab/browser - Tự động hủy đơn hàng ngay lập tức
const handleBeforeUnload = () => {
    if (isMoMoPaymentActive()) {
        // Lấy orderId để hủy
        const momoOrderId = sessionStorage.getItem('momo_payment_order_id')
        const depositOrderId = sessionStorage.getItem('deposit_order_id')
        const orderIdToCancel = momoOrderId || depositOrderId || createdOrderId.value

        if (orderIdToCancel) {
            const orderIdNum = parseInt(orderIdToCancel)
            if (isNaN(orderIdNum)) {
                return
            }

            // Đánh dấu rằng cần hủy đơn hàng khi quay lại (backup)
            sessionStorage.setItem('cancel_order_on_return', orderIdToCancel.toString())

            // Hủy đơn hàng ngay lập tức bằng cách gửi request với keepalive
            const token = authStore.accessToken
            if (!token) {
                return
            }

            try {
                // Gửi request hủy đơn hàng ngay lập tức
                fetch(`${window.location.origin}/api/orders/${orderIdNum}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: 'CANCELLED' }),
                    keepalive: true
                }).catch(err => {
                    console.error('❌ Lỗi khi hủy đơn hàng:', err)
                })
            } catch (error) {
                console.error('❌ Lỗi khi gửi request hủy đơn hàng:', error)
                sessionStorage.setItem('cancel_order_on_return', orderIdToCancel.toString())
            }
        }
    }
}

// Kiểm tra và xử lý khi user quay lại từ MoMo payment mà không thanh toán
const checkAndHandleMoMoReturn = async () => {
    const momoOrderId = sessionStorage.getItem('momo_payment_order_id')
    const momoTimestamp = sessionStorage.getItem('momo_payment_timestamp')

    // Kiểm tra xem có đang quay lại từ MoMo payment không
    if (momoOrderId && momoTimestamp) {
        // Kiểm tra xem có resultCode trong URL không (nghĩa là đã được redirect từ PaymentReturnPage)
        const hasResultCode = route.query.resultCode !== undefined

        // Nếu không có resultCode, nghĩa là user quay về trực tiếp từ MoMo (không thanh toán)
        if (!hasResultCode) {
            const orderIdNum = parseInt(momoOrderId)

            // Cập nhật trạng thái CANCELLED và payment status FAILED nếu user quay về mà không có resultCode
            if (orderIdNum) {
                // Bước 1: Cập nhật trạng thái đơn hàng thành CANCELLED
                try {
                    await orderStore.cancelOrderStore(orderIdNum)
                } catch (cancelError) {
                    console.error('❌ Lỗi khi cập nhật trạng thái CANCELLED:', cancelError)
                }

                // Bước 2: Cập nhật payment status thành FAILED
                try {
                    const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderIdNum)
                    if (paymentResponse?.data?.success && paymentResponse?.data?.data) {
                        const payment = paymentResponse.data.data
                        const paymentId = payment.payment_id || payment.id || payment.paymentId

                        if (paymentId) {
                            await paymentStore.updatePaymentStatusStore(paymentId, 'FAILED')
                        }
                    }
                } catch (paymentError) {
                    console.error('❌ Lỗi khi cập nhật payment status:', paymentError)
                }

                // Reset createdOrderId
                createdOrderId.value = null
            }

            // Xóa flags sau khi xử lý
            sessionStorage.removeItem('momo_payment_order_id')
            sessionStorage.removeItem('momo_payment_timestamp')
        }
    }
}


// Kiểm tra trạng thái đơn hàng và payment để chặn quay lại nếu đã thanh toán thành công/thất bại
const checkOrderAndPaymentStatus = async () => {
    try {
        // Kiểm tra orderId từ query params hoặc createdOrderId
        const orderIdFromQuery = route.query.orderId ? parseInt(route.query.orderId) : null
        const orderIdToCheck = orderIdFromQuery || createdOrderId.value

        if (!orderIdToCheck) {
            // Không có orderId, cho phép vào trang
            return true
        }


        // Kiểm tra trạng thái đơn hàng
        try {
            const orderResponse = await orderStore.getOrderByIdStore(orderIdToCheck)
            if (orderResponse?.data?.success && orderResponse?.data?.data) {
                const order = orderResponse.data.data
                const orderStatus = order.status
                const depositRequired = order.deposit_required || false
                const deposit = order.deposit || null


                // Nếu cần đặt cọc và chưa đặt cọc, không redirect
                if (depositRequired && (!deposit || !deposit.paid)) {
                    console.log('💰 Đơn hàng cần đặt cọc, không redirect để hiển thị modal')
                    // Không redirect, để modal có thể hiển thị
                    return true
                }

                // Nếu đơn hàng đã thành công (CONFIRMED, DELIVERED) hoặc thất bại (CANCELLED)
                if (orderStatus === 'CONFIRMED' || orderStatus === 'DELIVERED' || orderStatus === 'CANCELLED') {
                    router.replace('/orders-page')
                    return false
                }
            }
        } catch (orderError) {
            console.error('❌ Lỗi khi kiểm tra trạng thái đơn hàng:', orderError)
            // Tiếp tục kiểm tra payment status
        }

        // Kiểm tra trạng thái payment
        try {
            const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderIdToCheck)
            if (paymentResponse?.data?.success && paymentResponse?.data?.data) {
                const payment = paymentResponse.data.data
                const paymentStatus = payment.status || payment.payment_status

                // Nếu payment đã thành công (SUCCESS) hoặc thất bại (FAILED)
                if (paymentStatus === 'SUCCESS' || paymentStatus === 'FAILED') {
                    router.replace('/orders-page')
                    return false
                }
            }
        } catch (paymentError) {
            console.error('❌ Lỗi khi kiểm tra trạng thái payment:', paymentError)
            // Không block nếu không lấy được payment status
        }

        return true
    } catch (error) {
        console.error('❌ Lỗi khi kiểm tra trạng thái đơn hàng/payment:', error)
        // Cho phép vào trang nếu có lỗi
        return true
    }
}

// Setup lifecycle hooks
onMounted(async () => {
    // Kiểm tra nếu đơn hàng đã hoàn thành, redirect về trang chủ
    // CHỈ redirect nếu thực sự đang ở PaymentPage (không phải từ CheckoutPage hoặc ReviewPage)
    const orderCompleted = sessionStorage.getItem('order_completed')
    const fromCheckout = route.query.fromCheckout === 'true'

    if (orderCompleted === 'true' && !fromCheckout) {
        // Xóa flag
        sessionStorage.removeItem('order_completed')
        sessionStorage.removeItem('completed_order_id')
        // Redirect về trang chủ
        router.push('/home')
        return
    }

    // Nếu có flag order_completed nhưng đang từ CheckoutPage, xóa flag để tránh redirect
    if (orderCompleted === 'true' && fromCheckout) {
        sessionStorage.removeItem('order_completed')
        sessionStorage.removeItem('completed_order_id')
    }

    // Kiểm tra trạng thái đơn hàng và payment để chặn quay lại nếu đã thanh toán thành công/thất bại
    await checkOrderAndPaymentStatus()

    // Thêm event listener cho beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Xử lý khi tab trở nên visible (user quay lại từ MoMo)
    const handleVisibilityChange = async () => {
        if (document.visibilityState === 'visible' && isMoMoPaymentActive()) {
            // Kiểm tra xem payment đã thành công chưa
            const momoOrderId = sessionStorage.getItem('momo_payment_order_id')
            const depositOrderId = sessionStorage.getItem('deposit_order_id')
            const orderIdToCheck = momoOrderId || depositOrderId || createdOrderId.value

            if (orderIdToCheck) {
                try {
                    const orderIdNum = parseInt(orderIdToCheck)
                    if (!isNaN(orderIdNum)) {
                        // Kiểm tra trạng thái payment
                        const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderIdNum)
                        if (paymentResponse?.data?.success && paymentResponse?.data?.data) {
                            const payment = paymentResponse.data.data
                            const paymentStatus = payment.status || payment.payment_status

                            // Nếu payment chưa thành công (vẫn PROCESSING), hủy đơn hàng
                            if (paymentStatus === 'PROCESSING') {
                                await cancelOrderOnMoMoLeave()
                            }
                        }
                    }
                } catch (error) {
                    console.error('❌ Lỗi khi kiểm tra trạng thái payment:', error)
                }
            }
        }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Lưu reference để cleanup
    window._paymentPageVisibilityHandler = handleVisibilityChange

    // Kiểm tra xem có cần hủy đơn hàng khi quay lại không (từ beforeunload)
    const cancelOrderOnReturn = sessionStorage.getItem('cancel_order_on_return')
    if (cancelOrderOnReturn) {
        sessionStorage.removeItem('cancel_order_on_return')
        const orderIdNum = parseInt(cancelOrderOnReturn)
        if (!isNaN(orderIdNum)) {
            try {
                await cancelOrderOnMoMoLeave()
            } catch (error) {
                console.error('❌ Lỗi khi hủy đơn hàng từ flag:', error)
            }
        }
    }

    // Kiểm tra và xử lý khi user quay lại từ MoMo payment
    await checkAndHandleMoMoReturn()

    // Load shipping info from query params
    try {
        const userId = authStore.userId
        if (!userId) {
            router.push('/login')
            return
        }

        // Luôn tải lại giỏ hàng từ backend để đảm bảo có dữ liệu mới nhất
        try {
            await cartStore.loadCartFromBackend(userId)
        } catch (error) {
            console.error('Error loading cart from backend:', error)
            // Không throw error, tiếp tục với dữ liệu từ query params
        }

        // Load shipping info from query params
        const shippingInfoStr = route.query.shippingInfo
        if (shippingInfoStr) {
            shippingInfo.value = JSON.parse(shippingInfoStr)
        } else {
            // Nếu không có shipping info trong query, thử lấy từ user info
            try {
                const token = authStore.accessToken
                if (token) {
                    await userStore.getInfo(token)
                    if (userStore.userInfo) {
                        shippingInfo.value = {
                            username: userStore.userInfo.username || '',
                            phone_number: userStore.userInfo.phone_number || '',
                            address: userStore.userInfo.address || '',
                            note: ''
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading user info:', error)
            }

            // Nếu vẫn không có shipping info, hiển thị thông báo
            if (!shippingInfo.value.username || !shippingInfo.value.phone_number || !shippingInfo.value.address) {
                errorMessage.value = 'Vui lòng điền đầy đủ thông tin giao hàng'
            }
        }

        // Get selected items from query params or cart
        const selectedItemsStr = route.query.selectedItems
        if (selectedItemsStr) {
            try {
                const selectedItemsData = JSON.parse(selectedItemsStr)
                console.log('Selected items from query:', selectedItemsData)
                console.log('Cart items from store:', cartStore.cartItems)

                // Map selected items data to full cart items (đã được load từ backend)
                orderItems.value = selectedItemsData.map(selectedItem => {
                    // Tìm item trong cart bằng cart_detail_id hoặc product_id
                    const fullItem = cartStore.cartItems.find(
                        item => {
                            // So sánh cart_detail_id trước
                            if (selectedItem.cart_detail_id && item.cart_detail_id) {
                                return item.cart_detail_id === selectedItem.cart_detail_id
                            }
                            // Nếu không có cart_detail_id, so sánh product_id
                            if (selectedItem.product_id && item.product_id) {
                                return item.product_id === selectedItem.product_id
                            }
                            return false
                        }
                    )

                    if (fullItem) {
                        // Cập nhật quantity từ selectedItem nếu có, ưu tiên thông tin từ selectedItem
                        return {
                            ...fullItem,
                            quantity: selectedItem.quantity || fullItem.quantity,
                            price: selectedItem.price || fullItem.price,
                            // Đảm bảo có đầy đủ thông tin từ selectedItem nếu có
                            product_name: selectedItem.product_name || fullItem.product_name,
                            img_url: selectedItem.img_url || fullItem.img_url
                        }
                    }

                    // Nếu không tìm thấy trong cart, sử dụng đầy đủ thông tin từ selectedItem
                    // (selectedItem đã có đầy đủ thông tin từ CartPage)
                    return {
                        ...selectedItem,
                        product_name: selectedItem.product_name || 'Sản phẩm',
                        img_url: selectedItem.img_url || '/img/footer.png',
                        quantity: selectedItem.quantity || 1,
                        price: selectedItem.price || 0
                    }
                }).filter(item => item !== undefined && item !== null)

                console.log('Mapped order items:', orderItems.value)
            } catch (error) {
                console.error('Error parsing selectedItems:', error)
                // Fallback: get selected items from cart
                orderItems.value = cartStore.cartItems.filter(item => item.selected !== false)
            }
        } else {
            // Fallback: get selected items from cart (đã được load từ backend)
            orderItems.value = cartStore.cartItems.filter(item => {
                return item.selected !== false && item.selected !== null
            })
        }

        // Nếu không có sản phẩm, hiển thị thông báo lỗi
        if (orderItems.value.length === 0) {
            console.warn('No order items found')
            errorMessage.value = 'Không có sản phẩm để thanh toán. Vui lòng quay lại giỏ hàng.'
            // Không redirect về cart, để user có thể thấy thông báo lỗi
        }

        // Load available discounts
        loadDiscounts()

        // Load payment methods
        loadPaymentMethods()
    } catch (error) {
        console.error('Error loading checkout data:', error)
        errorMessage.value = 'Có lỗi xảy ra khi tải dữ liệu thanh toán'
    }
})

const loadDiscounts = async () => {
    try {
        await discountStore.getAllDiscounts()
        availableDiscounts.value = discountStore.discounts || []
    } catch (error) {
        console.error('Error loading discounts:', error)
    }
}

const loadPaymentMethods = async () => {
    try {
        await paymentMethodStore.getAllPaymentMethods()
    } catch (error) {
        console.error('Error loading payment methods:', error)
    }
}

// Map payment method string sang method_id
const getPaymentMethodId = (methodName) => {
    return paymentMethodStore.getPaymentMethodId(methodName)
}

// Tính tổng số lượng sản phẩm
const totalQuantity = computed(() => {
    return orderItems.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
})

// Tính phí ship theo thành phố
const shippingFee = computed(() => {
    // Lấy city_id từ sessionStorage hoặc shippingInfo
    let cityId = null
    const shippingCityId = sessionStorage.getItem('shipping_city_id')
    if (shippingCityId) {
        cityId = parseInt(shippingCityId)
    } else if (shippingInfo.value?.city_id) {
        cityId = parseInt(shippingInfo.value.city_id)
    }

    // Lấy địa chỉ từ shippingInfo hoặc sessionStorage
    const address = shippingInfo.value?.address || sessionStorage.getItem('shipping_address') || ''

    // Tính phí ship sử dụng composable
    return calculateShippingFeeByCity({
        cityId,
        address
    })
})

// Giảm giá tự động theo số lượng sản phẩm - Đã tắt
const autoDiscountPercent = computed(() => {
    return 0 // Tắt auto discount
})

const removeDiscount = () => {
    appliedSpecialDiscount.value = null
}

// Áp dụng mã giảm giá khi click vào mã có sẵn (từ database)
const applyAvailableDiscount = (discount) => {
    // Nếu click vào mã đã được áp dụng, remove nó
    if (appliedSpecialDiscount.value?.code === discount.code) {
        removeDiscount()
        return
    }

    // Kiểm tra điều kiện quantity: đơn hàng phải đáp ứng số lượng tối thiểu
    if (discount.quantity !== undefined && discount.quantity > 0) {
        const orderQuantity = totalQuantity.value
        if (orderQuantity < discount.quantity) {
            errorMessage.value = `Mã ${discount.code} chỉ áp dụng cho đơn hàng từ ${discount.quantity} sản phẩm trở lên!`
            return
        }
    }

    // Áp dụng mã giảm giá từ database
    appliedSpecialDiscount.value = {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discount_id: discount.discount_id || null
    }
    errorMessage.value = ''
    console.log('✅ Applied discount code from database:', discount.code)
}

// Calculate prices
const subTotal = computed(() => {
    return orderItems.value.reduce((sum, item) => {
        const price = item.price || 0
        return sum + (price * item.quantity)
    }, 0)
})

// Giảm giá tự động (theo số lượng sản phẩm)
const autoDiscountAmount = computed(() => {
    if (autoDiscountPercent.value === 0) return 0
    return (subTotal.value * autoDiscountPercent.value) / 100
})

// Giảm giá từ mã giảm giá (từ database)
const specialDiscountAmount = computed(() => {
    if (!appliedSpecialDiscount.value) return 0

    const discount = appliedSpecialDiscount.value
    if (discount.type === 'amount') {
        // Giảm giá cố định (CASH)
        return Number(discount.value) || 0
    } else if (discount.type === 'percent') {
        // Giảm giá theo phần trăm (PERCENT)
        const percent = Number(discount.value) || 0
        return (subTotal.value * percent) / 100
    }
    return 0
})

// Lấy phần trăm giảm giá từ mã (để hiển thị)
// const specialDiscountPercent = computed(() => {
//     if (!appliedSpecialDiscount.value) return null
//     if (appliedSpecialDiscount.value.type === 'percent') {
//         return Number(appliedSpecialDiscount.value.value) || 0
//     }
//     return null
// })

// Lọc các mã giảm giá có thể áp dụng từ database dựa trên số lượng sản phẩm
const availableDiscountCodes = computed(() => {
    const orderQuantity = totalQuantity.value // Tổng số lượng sản phẩm trong đơn hàng

    // Lọc các mã giảm giá từ database: số lượng sản phẩm trong đơn hàng >= quantity tối thiểu
    const eligibleDiscounts = (availableDiscounts.value || []).filter(discount => {
        const minQuantity = Number(discount.quantity) || 0
        return orderQuantity >= minQuantity
    })

    // Chuyển đổi discount từ database sang format phù hợp với UI
    return eligibleDiscounts.map(discount => {
        const discountType = discount.type === 'PERCENT' ? 'percent' :
            discount.type === 'CASH' ? 'amount' :
                discount.type?.toLowerCase() || 'amount'

        const discountValue = Number(discount.value) || 0
        const minQuantity = Number(discount.quantity) || 0

        return {
            code: discount.discount_code,
            type: discountType,
            value: discountValue,
            discount_id: discount.discount_id,
            discount_name: discount.discount_name,
            quantity: minQuantity, // Số lượng sản phẩm tối thiểu
            description: discount.discount_name ||
                `Giảm giá ${discountType === 'percent' ? `${discountValue}%` : formatPrice(discountValue)} cho đơn hàng từ ${minQuantity} sản phẩm`
        }
    })
})

// Phí ship
const finalShippingFee = computed(() => {
    return shippingFee.value
})

// Tổng giảm giá (tự động + mã giảm giá)
const totalDiscountAmount = computed(() => {
    return autoDiscountAmount.value + specialDiscountAmount.value
})

// Tổng tiền cuối cùng
const finalTotal = computed(() => {
    return subTotal.value + finalShippingFee.value - totalDiscountAmount.value
})

// Kiểm tra có cần đặt cọc không (COD + tổng số lượng >= 10)
const needsDeposit = computed(() => {
    return paymentMethod.value === 'COD' && totalQuantity.value >= 10
})

// Tính số tiền cần đặt cọc (50% tổng tiền, KHÔNG tính phí ship)
// Deposit = 50% của (Tạm tính - Tổng giảm giá)
// KHÔNG bao gồm phí ship
const depositAmount = computed(() => {
    if (!needsDeposit.value) return 0

    // Tính số tiền trước khi cộng phí ship = Tạm tính - Tổng giảm giá
    const amountBeforeShipping = subTotal.value - totalDiscountAmount.value

    // Đặt cọc 50% số tiền trên (KHÔNG bao gồm phí ship)
    return Math.round(amountBeforeShipping * 0.5)
})

// Build orderData để truyền vào DepositModal
const depositOrderData = computed(() => {
    if (!needsDeposit.value || orderItems.value.length === 0) return null

    // Get note from shipping info
    const orderNote = shippingInfo.value.note || ''

    // Prepare order items
    const items = orderItems.value.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_order: item.price,
        sub_total: (item.price || 0) * item.quantity,
        note: orderNote
    }))

    // Get payment method ID
    const paymentMethodId = getPaymentMethodId(paymentMethod.value)

    // Lấy thông tin giao hàng từ sessionStorage
    const shippingName = sessionStorage.getItem('shipping_name') || ''
    const shippingAddress = sessionStorage.getItem('shipping_address') || ''
    const shippingPhone = sessionStorage.getItem('shipping_phone') || ''

    // Nếu không có shipping info từ sessionStorage, thử lấy từ shippingInfo (nếu có)
    let finalShippingName = shippingName || shippingInfo.value?.username || ''
    let finalShippingAddress = shippingAddress || shippingInfo.value?.address || ''
    let finalShippingPhone = shippingPhone || shippingInfo.value?.phone_number || ''

    // Nếu vẫn không có, thử lấy từ userInfo
    if (!finalShippingName || !finalShippingAddress || !finalShippingPhone) {
        if (userStore.userInfo) {
            finalShippingName = finalShippingName || userStore.userInfo.username || ''
            finalShippingAddress = finalShippingAddress || userStore.userInfo.address || ''
            finalShippingPhone = finalShippingPhone || userStore.userInfo.phone_number || ''
        }
    }

    // Nếu không có đủ thông tin shipping, trả về null
    if (!finalShippingName || !finalShippingAddress || !finalShippingPhone) {
        return null
    }

    // Prepare order data
    return {
        discount_id: appliedSpecialDiscount.value?.discount_id || null,
        discount_code: appliedSpecialDiscount.value?.code || null,
        total: subTotal.value,
        shipping_fee: finalShippingFee.value,
        auto_discount_percent: autoDiscountPercent.value,
        auto_discount_amount: autoDiscountAmount.value,
        discount_amount: specialDiscountAmount.value,
        total_discount_amount: totalDiscountAmount.value,
        final_total: finalTotal.value,
        shipping_name: finalShippingName,
        shipping_address: finalShippingAddress,
        shipping_phone: finalShippingPhone,
        payment: {
            method_id: paymentMethodId,
            amount: finalTotal.value,
            status: 'PROCESSING'
        },
        items: items
    }
})

const formatPrice = (price) => {
    if (!price) return '0 ₫'
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) : price
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(numPrice)
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

const handleCreateOrder = async () => {
    const token = authStore.accessToken
    if (!token) {
        errorMessage.value = 'Vui lòng đăng nhập lại!'
        return
    }

    if (orderItems.value.length === 0) {
        errorMessage.value = 'Không có sản phẩm nào để đặt hàng!'
        return
    }

    // Nếu cần đặt cọc (COD + 10+ sản phẩm), chỉ hiển thị modal, không tạo đơn
    if (needsDeposit.value) {
        console.log('💰 Cần đặt cọc, hiển thị modal đặt cọc trước khi tạo đơn')
        // Tạo depositPayment object từ tính toán trước
        currentDepositPayment.value = {
            amount: depositAmount.value,
            // payUrl và qrCodeUrl sẽ được tạo khi user bấm "Thanh toán cọc"
            payUrl: null,
            qrCodeUrl: null,
            deeplink: null
        }
        currentDeposit.value = null
        showDepositModal.value = true
        return
    }

    console.log('Starting order creation...', {
        orderItemsCount: orderItems.value.length,
        paymentMethod: paymentMethod.value,
        finalTotal: finalTotal.value
    })

    try {
        await executeAsync(async () => {
            // Get note from shipping info
            const orderNote = shippingInfo.value.note || ''

            // Prepare order items
            const items = orderItems.value.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_order: item.price,
                sub_total: (item.price || 0) * item.quantity,
                note: orderNote
            }))

            // Get payment method ID
            const paymentMethodId = getPaymentMethodId(paymentMethod.value)

            // Lấy thông tin giao hàng từ sessionStorage
            const shippingName = sessionStorage.getItem('shipping_name') || ''
            const shippingAddress = sessionStorage.getItem('shipping_address') || ''
            const shippingPhone = sessionStorage.getItem('shipping_phone') || ''

            console.log('📦 PaymentPage - Shipping info from sessionStorage:', {
                shipping_name: shippingName,
                shipping_address: shippingAddress,
                shipping_phone: shippingPhone,
                has_shipping_name: !!shippingName,
                has_shipping_address: !!shippingAddress,
                has_shipping_phone: !!shippingPhone
            })

            // Nếu không có shipping info từ sessionStorage, thử lấy từ shippingInfo (nếu có)
            let finalShippingName = shippingName || shippingInfo.value?.username || ''
            let finalShippingAddress = shippingAddress || shippingInfo.value?.address || ''
            let finalShippingPhone = shippingPhone || shippingInfo.value?.phone_number || ''

            // Nếu vẫn không có, thử lấy từ userInfo
            if (!finalShippingName || !finalShippingAddress || !finalShippingPhone) {
                console.warn('⚠️ PaymentPage - Missing shipping info from sessionStorage, trying userInfo')
                if (userStore.userInfo) {
                    finalShippingName = finalShippingName || userStore.userInfo.username || ''
                    finalShippingAddress = finalShippingAddress || userStore.userInfo.address || ''
                    finalShippingPhone = finalShippingPhone || userStore.userInfo.phone_number || ''
                }
            }

            // Validate: Đảm bảo có đủ thông tin shipping trước khi tạo order
            if (!finalShippingName || !finalShippingAddress || !finalShippingPhone) {
                throw new Error('Thiếu thông tin giao hàng. Vui lòng quay lại trang xác nhận thông tin giao hàng!')
            }

            console.log('✅ PaymentPage - Final shipping info to send:', {
                shipping_name: finalShippingName,
                shipping_address: finalShippingAddress,
                shipping_phone: finalShippingPhone
            })

            // Prepare order data (KHÔNG gửi payment object vì backend có thể tự động tạo payment từ đó)
            // Payment sẽ được tạo riêng sau khi tạo đơn thành công
            const orderData = {
                discount_id: appliedSpecialDiscount.value?.discount_id || null,
                discount_code: appliedSpecialDiscount.value?.code || null,
                total: subTotal.value,
                shipping_fee: finalShippingFee.value,
                auto_discount_percent: autoDiscountPercent.value,
                auto_discount_amount: autoDiscountAmount.value,
                discount_amount: specialDiscountAmount.value,
                total_discount_amount: totalDiscountAmount.value,
                final_total: finalTotal.value,
                shipping_name: finalShippingName,
                shipping_address: finalShippingAddress,
                shipping_phone: finalShippingPhone,
                payment: {
                    method_id: paymentMethodId,
                    amount: finalTotal.value,
                    status: 'PROCESSING' // Cả COD và MOMO đều bắt đầu với PROCESSING
                },
                items: items
            }

            // Log chi tiết để debug
            console.log('📤 PaymentPage - Sending order data to API:', JSON.stringify(orderData, null, 2))
            console.log('📤 PaymentPage - Shipping fields in orderData:', {
                shipping_name: orderData.shipping_name,
                shipping_address: orderData.shipping_address,
                shipping_phone: orderData.shipping_phone,
                has_shipping_name: !!orderData.shipping_name,
                has_shipping_address: !!orderData.shipping_address,
                has_shipping_phone: !!orderData.shipping_phone
            })

            const response = await orderStore.createNewOrder(orderData)

            console.log('📥 PaymentPage - Order creation response:', response?.data)

            console.log('Order creation response:', response.data)

            if (response.data.success) {
                // Lấy order data từ response
                const orderData = response.data.data
                const orderId = orderData?.order_id || response.data.order_id || orderData?.id

                if (!orderId) {
                    throw new Error('Không thể lấy order ID từ response!')
                }

                // Lưu deposit fields từ response
                const depositRequired = orderData?.deposit_required || false
                const deposit = orderData?.deposit || null
                const depositPayment = orderData?.deposit_payment || null

                console.log('Deposit info from response:', {
                    depositRequired,
                    deposit,
                    depositPayment
                })

                // Lưu deposit info vào order store
                if (orderData) {
                    orderStore.currentOrder = {
                        ...orderData,
                        deposit_required: depositRequired,
                        deposit: deposit,
                        deposit_payment: depositPayment
                    }
                }

                // Payment đã được tạo tự động bởi backend từ orderData.payment
                // Không cần tạo payment ở frontend nữa để tránh duplicate
                console.log('Payment should be created by backend from orderData.payment')

                console.log('Order created successfully, orderId:', orderId)

                // Xóa shipping info từ sessionStorage sau khi tạo order thành công
                sessionStorage.removeItem('shipping_name')
                sessionStorage.removeItem('shipping_address')
                sessionStorage.removeItem('shipping_phone')
                sessionStorage.removeItem('shipping_city_id')

                // Nếu thanh toán MOMO, lưu orderId và hiển thị QR code
                if (paymentMethod.value === 'MOMO') {
                    createdOrderId.value = orderId
                    // Đánh dấu đơn hàng đã hoàn thành cho MOMO
                    isOrderCompleted.value = true
                    sessionStorage.setItem('order_completed', 'true')
                    sessionStorage.setItem('completed_order_id', orderId.toString())
                    console.log('MOMO payment, showing QR code')
                } else {
                    // Nếu COD, kiểm tra xem có cần đặt cọc không
                    if (depositRequired && (!deposit || !deposit.paid) && depositPayment) {
                        // Hiển thị modal đặt cọc - KHÔNG set isOrderCompleted để không redirect
                        createdOrderId.value = orderId
                        currentDeposit.value = deposit
                        currentDepositPayment.value = depositPayment
                        showDepositModal.value = true
                        console.log('COD payment requires deposit, showing deposit modal')
                        console.log('Deposit modal state:', {
                            showDepositModal: showDepositModal.value,
                            deposit: currentDeposit.value,
                            depositPayment: currentDepositPayment.value,
                            orderId: createdOrderId.value
                        })
                        // KHÔNG set order_completed để modal có thể hiển thị
                    } else {
                        // Nếu không cần đặt cọc, đánh dấu hoàn thành và redirect như bình thường
                        isOrderCompleted.value = true
                        sessionStorage.setItem('order_completed', 'true')
                        sessionStorage.setItem('completed_order_id', orderId.toString())
                        console.log('COD payment, redirecting to orders page')
                        router.replace('/cart')
                        // Sử dụng nextTick để đảm bảo replace cart đã hoàn thành trước khi push orders-page
                        await new Promise(resolve => setTimeout(resolve, 100))
                        router.push('/orders-page')
                    }
                }

                // Reload cart to reflect changes (sau khi đã redirect hoặc set createdOrderId)
                const userId = authStore.userId
                if (userId) {
                    // Reload cart trong background, không chờ
                    cartStore.loadCartFromBackend(userId).catch(err => {
                        console.error('Error reloading cart:', err)
                    })
                }
            } else {
                throw new Error(response.data.message || 'Tạo đơn hàng thất bại!')
            }
        }, {
            defaultErrorMessage: 'Không thể tạo đơn hàng!',
            onError: (error) => {
                console.error('Order creation error:', error)
                errorMessage.value = error.response?.data?.message || error.message
            }
        })
    } catch (error) {
        console.error('Unexpected error in handleCreateOrder:', error)
        errorMessage.value = error.message || 'Có lỗi xảy ra khi tạo đơn hàng!'
    }
}

const handleCancel = () => {
    router.push('/cart')
}

// Xử lý khi DepositModal tạo đơn hàng thành công
const handleOrderCreatedFromDeposit = (orderData) => {
    console.log('✅ Order created from DepositModal:', orderData)
    createdOrderId.value = orderData.orderId
    currentDeposit.value = orderData.deposit
    currentDepositPayment.value = orderData.depositPayment
    // DepositModal đã tự mở link thanh toán, không cần làm gì thêm
}

// Tạo đơn hàng khi user bấm "Thanh toán cọc" trong modal (fallback nếu DepositModal không tự xử lý)
const handleCreateOrderForDeposit = async () => {
    const token = authStore.accessToken
    if (!token) {
        errorMessage.value = 'Vui lòng đăng nhập lại!'
        return
    }

    if (orderItems.value.length === 0) {
        errorMessage.value = 'Không có sản phẩm nào để đặt hàng!'
        return
    }

    console.log('💰 Creating order for deposit payment...', {
        orderItemsCount: orderItems.value.length,
        paymentMethod: paymentMethod.value,
        finalTotal: finalTotal.value,
        depositAmount: depositAmount.value
    })

    try {
        await executeAsync(async () => {
            // Get note from shipping info
            const orderNote = shippingInfo.value.note || ''

            // Prepare order items
            const items = orderItems.value.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_order: item.price,
                sub_total: (item.price || 0) * item.quantity,
                note: orderNote
            }))

            // Get payment method ID
            const paymentMethodId = getPaymentMethodId(paymentMethod.value)

            // Lấy thông tin giao hàng từ sessionStorage
            const shippingName = sessionStorage.getItem('shipping_name') || ''
            const shippingAddress = sessionStorage.getItem('shipping_address') || ''
            const shippingPhone = sessionStorage.getItem('shipping_phone') || ''

            // Nếu không có shipping info từ sessionStorage, thử lấy từ shippingInfo (nếu có)
            let finalShippingName = shippingName || shippingInfo.value?.username || ''
            let finalShippingAddress = shippingAddress || shippingInfo.value?.address || ''
            let finalShippingPhone = shippingPhone || shippingInfo.value?.phone_number || ''

            // Nếu vẫn không có, thử lấy từ userInfo
            if (!finalShippingName || !finalShippingAddress || !finalShippingPhone) {
                if (userStore.userInfo) {
                    finalShippingName = finalShippingName || userStore.userInfo.username || ''
                    finalShippingAddress = finalShippingAddress || userStore.userInfo.address || ''
                    finalShippingPhone = finalShippingPhone || userStore.userInfo.phone_number || ''
                }
            }

            // Validate: Đảm bảo có đủ thông tin shipping trước khi tạo order
            if (!finalShippingName || !finalShippingAddress || !finalShippingPhone) {
                throw new Error('Thiếu thông tin giao hàng. Vui lòng quay lại trang xác nhận thông tin giao hàng!')
            }

            // Prepare order data
            const orderData = {
                discount_id: appliedSpecialDiscount.value?.discount_id || null,
                discount_code: appliedSpecialDiscount.value?.code || null,
                total: subTotal.value,
                shipping_fee: finalShippingFee.value,
                auto_discount_percent: autoDiscountPercent.value,
                auto_discount_amount: autoDiscountAmount.value,
                discount_amount: specialDiscountAmount.value,
                total_discount_amount: totalDiscountAmount.value,
                final_total: finalTotal.value,
                shipping_name: finalShippingName,
                shipping_address: finalShippingAddress,
                shipping_phone: finalShippingPhone,
                payment: {
                    method_id: paymentMethodId,
                    amount: finalTotal.value,
                    status: 'PROCESSING'
                },
                items: items
            }

            console.log('📤 Creating order for deposit...')

            const response = await orderStore.createNewOrder(orderData)

            if (response.data.success) {
                // Lấy order data từ response
                const orderDataFromResponse = response.data.data
                const orderId = orderDataFromResponse?.order_id || response.data.order_id || orderDataFromResponse?.id

                if (!orderId) {
                    throw new Error('Không thể lấy order ID từ response!')
                }

                // Lưu deposit fields từ response
                const depositRequired = orderDataFromResponse?.deposit_required || false
                const deposit = orderDataFromResponse?.deposit || null
                const depositPayment = orderDataFromResponse?.deposit_payment || null

                console.log('✅ Order created for deposit, orderId:', orderId)
                console.log('💰 Deposit info:', {
                    depositRequired,
                    deposit,
                    depositPayment
                })

                // Set orderId và deposit info
                createdOrderId.value = orderId
                currentDeposit.value = deposit
                currentDepositPayment.value = depositPayment

                // Xóa shipping info từ sessionStorage
                sessionStorage.removeItem('shipping_name')
                sessionStorage.removeItem('shipping_address')
                sessionStorage.removeItem('shipping_phone')
                sessionStorage.removeItem('shipping_city_id')

                // Reload cart
                const userId = authStore.userId
                if (userId) {
                    cartStore.loadCartFromBackend(userId).catch(err => {
                        console.error('Error reloading cart:', err)
                    })
                }

                // Mở link thanh toán MoMo
                if (depositPayment?.payUrl || depositPayment?.deeplink) {
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                    const paymentUrl = isMobile && depositPayment.deeplink
                        ? depositPayment.deeplink
                        : depositPayment.payUrl

                    if (paymentUrl) {
                        // Lưu orderId vào sessionStorage để xử lý redirect
                        sessionStorage.setItem('deposit_order_id', orderId.toString())

                        // Mở link thanh toán
                        window.location.href = paymentUrl
                    } else {
                        throw new Error('Không tìm thấy link thanh toán')
                    }
                } else {
                    throw new Error('Không tìm thấy thông tin thanh toán đặt cọc')
                }
            } else {
                throw new Error(response.data.message || 'Tạo đơn hàng thất bại!')
            }
        }, {
            defaultErrorMessage: 'Không thể tạo đơn hàng để đặt cọc!',
            onError: (error) => {
                console.error('Order creation error for deposit:', error)
                errorMessage.value = error.response?.data?.message || error.message
            }
        })
    } catch (error) {
        console.error('Unexpected error in handleCreateOrderForDeposit:', error)
        errorMessage.value = error.message || 'Có lỗi xảy ra khi tạo đơn hàng để đặt cọc!'
    }
}

// Deposit modal handlers
const handleCloseDepositModal = async () => {
    console.log('🔄 Đóng modal đặt cọc')
    showDepositModal.value = false

    // Khi hủy modal, chưa có đơn hàng nào được tạo (vì chỉ tạo khi bấm "Xác nhận đặt cọc")
    // Chỉ cần reset state để quay về trang thanh toán bình thường
    currentDeposit.value = null
    currentDepositPayment.value = null

    // Không reset createdOrderId vì chưa có đơn hàng nào được tạo ở đây
    // createdOrderId chỉ được set khi bấm "Xác nhận đặt cọc"
    console.log('✅ Đã reset state, quay về trang thanh toán')
}

// Cleanup event listeners khi component unmount
onBeforeUnmount(() => {
    console.log('🧹 PaymentPage unmounting, cleanup event listeners')
    window.removeEventListener('beforeunload', handleBeforeUnload)
    if (window._paymentPageVisibilityHandler) {
        document.removeEventListener('visibilitychange', window._paymentPageVisibilityHandler)
        delete window._paymentPageVisibilityHandler
    }
})



// Tạo đơn hàng cho MOMO (giống handleCreateOrder nhưng không redirect)
const initiateMoMoPayment = async (orderId) => {
    try {
        const paymentResponse = await paymentStore.createMoMoPaymentStore({
            orderId,
            amount: finalTotal.value,
            orderInfo: `Thanh toán đơn hàng #${orderId}`
        })

        const responseData = paymentResponse?.data || paymentResponse
        const paymentPayload = responseData?.data || responseData
        const payUrl = paymentPayload?.payUrl || paymentPayload?.pay_url

        if (payUrl) {
            sessionStorage.setItem('momo_payment_order_id', orderId.toString())
            sessionStorage.setItem('momo_payment_timestamp', Date.now().toString())
            window.location.href = payUrl
        } else {
            console.warn('Không tìm thấy payUrl trong dữ liệu thanh toán:', paymentPayload)
            errorMessage.value = 'Không tìm thấy link thanh toán MoMo.'
        }
    } catch (error) {
        console.error('Lỗi khi chuyển đến trang thanh toán MoMo:', error)
        errorMessage.value = error.response?.data?.message || error.message || 'Không thể mở trang thanh toán MoMo.'
    }
}

const handleCreateOrderForMoMo = async () => {
    await handleCreateOrder()

    if (createdOrderId.value) {
        await initiateMoMoPayment(createdOrderId.value)
    }
}
</script>
