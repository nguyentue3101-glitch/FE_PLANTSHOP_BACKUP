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
                                <img :src="(item?.img_url && item.img_url.trim())"
                                    :alt="item?.product_name || 'Không có tên'"
                                    class="w-24 h-24 object-contain bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0"
                                    @error="handleImageError($event)" />
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-semibold text-gray-900 mb-2 text-lg">
                                        {{ item?.product_name || 'Không tên' }}</h3>
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
                                    ]" :title="discount.description">
                                    <div class="flex items-center justify-between gap-2">
                                        <div class="flex flex-col">
                                            <span class="font-bold">{{ discount.code }}</span>
                                            <span class="text-xs opacity-75">
                                                <span v-if="discount.type === 'PERCENT'">
                                                    - {{ discount.value }}%
                                                </span>
                                                <span v-else-if="discount.type === 'CASH'">
                                                    - {{ formatPrice(discount.value) }}
                                                </span>
                                                <span v-if="discount.quantity > 0" class="ml-1">
                                                    -> Từ {{ discount.quantity }} SP
                                                </span>
                                            </span>
                                        </div>
                                        <span v-if="appliedSpecialDiscount?.code === discount.code"
                                            class="text-base">✓</span>
                                    </div>
                                </button>
                            </div>
                            <!-- Discount Section -->
                            <div class=" border-t border-green-300 mt-3">
                                <div v-if="appliedSpecialDiscount"
                                    class="mt-2 p-2 bg-green-200 rounded-lg border border-green-500">
                                    <div class=" mb-2">
                                        <p class="text-center text-sm  font-bold text-green-800">
                                            <span>ĐÃ ÁP DỤNG: </span>
                                            <span>{{ appliedSpecialDiscount.code }}</span>
                                            <span v-if="appliedSpecialDiscount.type === 'PERCENT'" class="ml-1">
                                                - {{ appliedSpecialDiscount.value }}%
                                            </span>
                                            <span v-else-if="appliedSpecialDiscount.type === 'CASH'" class="ml-1">
                                                - {{ formatPrice(appliedSpecialDiscount.value) }}
                                            </span>
                                        </p>
                                    </div>
                                    <!-- <button @click="removeDiscount"
                                        class="text-red-600 text-sm hover:text-red-700 hover:underline font-medium cursor-pointer">
                                        Xóa mã giảm giá
                                    </button> -->
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
                                        <span class="font-semibold text-gray-900">MoMo</span>
                                        <span class="block text-xs text-gray-500 mt-0.5">Thanh toán online</span>
                                    </div>
                                </label>
                                <!-- <label
                                    class="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all"
                                    :class="paymentMethod === 'VNPAY' ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'">
                                    <input type="radio" v-model="paymentMethod" value="VNPAY"
                                        class="w-5 h-5 text-green-600 focus:ring-green-500" />
                                    <div class="flex-1">
                                        <span class="font-semibold text-gray-900">VNPay</span>
                                        <span class="block text-xs text-gray-500 mt-0.5">Thanh toán online</span>
                                    </div>
                                </label> -->
                            </div>
                        </div>

                        <!-- Price Summary -->
                        <div class="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
                            <div class="flex justify-between items-center py-2">
                                <span class="text-gray-700">Tạm tính:</span>
                                <span class="font-semibold text-gray-900">{{ formatPrice(subTotal) }}</span>
                            </div>
                            <div class="flex justify-between items-center py-2">
                                <span class="text-sm text-gray-700">Phí vận chuyển ({{ totalQuantity }} sản
                                    phẩm):</span>
                                <span class="font-semibold">
                                    <span>{{ formatPrice(finalShippingFee) }}</span>
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
                                    ):
                                </span>
                                <span class="font-semibold">-{{ formatPrice(specialDiscountAmount) }}</span>
                            </div>
                            <div class="border-t border-gray-300 pt-4 mt-2 flex justify-between items-center">
                                <span class="text-lg font-bold text-gray-900">Tổng cộng:</span>
                                <span class="text-xl font-bold text-green-600">{{ formatPrice(finalTotal) }}</span>
                            </div>
                        </div>



                        <!-- Submit Button (chỉ hiển thị khi chưa tạo đơn hoặc COD) -->
                        <button v-if="!createdOrderId && paymentMethod === 'COD'" @click="handleCreateOrder"
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

                        <!-- Button tạo đơn cho VNPay -->
                        <!-- <button v-if="!createdOrderId && paymentMethod === 'VNPAY'" @click="handleCreateOrderForVNPay"
                            :disabled="isCreatingOrder"
                            class="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 px-6 rounded-lg font-semibold transition-all disabled:bg-gray-400 disabled:cursor-not-allowed mb-3 cursor-pointer shadow-sm hover:shadow-md">
                            {{ isCreatingOrder ? 'Đang tạo đơn hàng...' : 'Tạo đơn hàng và thanh toán VNPay' }}
                        </button> -->

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
            @close="handleCloseDepositModal" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useDiscountStore } from '@/stores/discounts'
import { useOrderStore } from '@/stores/orders'
import { useUserStore } from '@/stores/user'
import { usePaymentMethodStore } from '@/stores/payment-methods'
import { usePaymentStore } from '@/stores/payments'
import { useProductStore } from '@/stores/products'
import { useAsyncOperation } from '@/composables/useAsyncOperation'
// import { useProvinces } from '@/composables/useProvinces'
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
const productStore = useProductStore()
const { isLoading: isCreatingOrder, errorMessage, executeAsync } = useAsyncOperation()
// const { provinces, getProvinceByCode } = useProvinces()
const { calculateShippingFeeByCity, saveOrderCityId } = useShippingFee()

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
    return createdOrderId.value !== null && (paymentMethod.value === 'MOMO' )
}

// Kiểm tra xem có đang trong quá trình thanh toán MoMo không (dựa vào sessionStorage)
const isMoMoPaymentActive = () => {
    const momoOrderId = sessionStorage.getItem('momo_payment_order_id')
    const momoTimestamp = sessionStorage.getItem('momo_payment_timestamp')
    return !!(momoOrderId && momoTimestamp) || (isPaymentActive() && paymentMethod.value === 'MOMO')
}

// Kiểm tra xem có đang trong quá trình thanh toán VNPay không (dựa vào sessionStorage)
// const isVNPayPaymentActive = () => {
//     const vnpayOrderId = sessionStorage.getItem('vnpay_payment_order_id')
//     const vnpayTimestamp = sessionStorage.getItem('vnpay_payment_timestamp')
//     return !!(vnpayOrderId && vnpayTimestamp) || (isPaymentActive() && paymentMethod.value === 'VNPAY')
// }



// xử lý sau khi bấm thanh toán momo và payment bị đóng tab và sẽ được set lại là success sau khi thanh toán thành công
const handleBeforeUnload = () => {
    if (isMoMoPaymentActive() ) {
        // Lấy orderId để hủy
        const momoOrderId = sessionStorage.getItem('momo_payment_order_id')
        const depositOrderId = sessionStorage.getItem('deposit_order_id')
        const orderIdToCancel = momoOrderId || depositOrderId || createdOrderId.value

        if (orderIdToCancel) {
            const orderIdNum = parseInt(orderIdToCancel)
            if (isNaN(orderIdNum)) {
                return
            }

            // Luôn set flag backup để đảm bảo hủy được khi quay lại nếu request fail
            sessionStorage.setItem('cancel_order_on_return', orderIdToCancel.toString())

            // Cố gắng hủy đơn hàng ngay lập tức bằng cách gửi request với keepalive
            const token = authStore.accessToken
            if (!token) {
                return
            }

            try {
                // Gửi request hủy đơn hàng ngay lập tức với keepalive (vẫn chạy khi đóng tab)
                fetch(`${window.location.origin}/api/orders/${orderIdNum}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: 'CANCELLED' }),
                    keepalive: true //cho phép request tiếp tục sau khi đóng tab
                }).catch(err => {
                    console.error(' Lỗi khi hủy đơn hàng:', err)
                })
            } catch (error) {
                console.error(' Lỗi khi gửi request hủy đơn hàng:', error)
                // Nếu request fail, flag đã được set ở trên, sẽ hủy khi quay lại
            }
        }
    }
}



// Setup lifecycle hooks
onMounted(async () => {
    console.log('====================kiểm tra 2 cái này================')
    console.log('completed_order_id:', sessionStorage.getItem('completed_order_id'))
    console.log('order_completed:', sessionStorage.getItem('order_completed'))

    if (sessionStorage.getItem('order_completed') === 'true') {
        sessionStorage.removeItem('order_completed')
        sessionStorage.removeItem('completed_order_id')
    }
    console.log('completed_order_id:', sessionStorage.getItem('completed_order_id'))
    console.log('order_completed:', sessionStorage.getItem('order_completed'))


    // Đăng ký event listener cho beforeunload và chỉ thực hiện khi thoát trang 
    window.addEventListener('beforeunload', handleBeforeUnload)


    // thấy thông tin giao hàng từ query params
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
            // lấy thông tin từ userInfo nếu có lỗi
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
        }

        // Get selected items from query params or cart
        const selectedItemsStr = route.query.selectedItems
        if (selectedItemsStr) {
            try {
                const selectedItemsData = JSON.parse(selectedItemsStr)
      
                // Map selected items data to full cart items (đã được load từ backend)
                // Chỉ gửi product_id và quantity từ frontend, giá sẽ được lấy từ backend
                const mappedItems = await Promise.all(selectedItemsData.map(async (selectedItem) => {
                    // xử lý khi ở trang giỏ hàng
                    const fullItem = cartStore.cartItems.find(
                        item => {
                            if (selectedItem.cart_detail_id && item.cart_detail_id) {
                                return item.cart_detail_id === selectedItem.cart_detail_id
                            }
                            return false
                        }
                    )
                    console.log('item được chọn từ giỏ hàng:',fullItem)
                    if (fullItem) {
                        return { ...fullItem }
                    }

                    //xử lý thông tin sản phẩm từ trang chi tiết vào thanh toán
                    if (selectedItem.product_id) {
                        console.log('Loading product from backend for product_id:', selectedItem.product_id)
                        try {
                            const productData = await productStore.getProduct(selectedItem.product_id)
                            if (productData) {
                                return {
                                    product_id: productData.product_id ,
                                    product_name: productData.product_name || 'Sản phẩm',
                                    img_url: productData.img_url || '/img/footer.png',
                                    price: productData.price || 0,
                                    quantity: selectedItem.quantity || 1,
                                    stock: productData.quantity || 0
                                }
                            }
                        } catch (error) {
                            console.error('Error loading product from backend:', error)
                        }
                    }

                    // Fallback: nếu không load được từ backend, bỏ qua item này
                    return null
                }))

                orderItems.value = mappedItems.filter(item => item !== undefined && item !== null)
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
    }
    
    // Tính phí ship sử dụng composable
    return calculateShippingFeeByCity({
        cityId
    })
})



// Áp dụng mã giảm giá khi click vào mã có sẵn 
const applyAvailableDiscount = (discount) => {
    // Nếu click vào mã đã được áp dụng, remove nó
    if (appliedSpecialDiscount.value?.code === discount.code) {
        appliedSpecialDiscount.value = null
        return
    }
    // Áp dụng mã giảm giá từ database
    appliedSpecialDiscount.value = {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discount_id: discount.discount_id || null
    }
    errorMessage.value = ''
    console.log(' Applied discount code from database:', discount.code)
}

// tạm tính
const subTotal = computed(() => {
    return orderItems.value.reduce((sum, item) => {
        const price = item.price || 0
        return sum + (price * item.quantity)
    }, 0)
})

// Giảm giá từ mã giảm giá 
const specialDiscountAmount = computed(() => {
    if (!appliedSpecialDiscount.value) return 0

    const discount = appliedSpecialDiscount.value
    if (discount.type === 'CASH') {
        // Giảm giá cố định (CASH)
        return Number(discount.value) || 0
    } else if (discount.type === 'PERCENT') {
        // Giảm giá theo phần trăm (PERCENT)
        const percent = Number(discount.value) || 0
        return (subTotal.value * percent) / 100
    }
    return 0
})



// Lọc các mã giảm giá có thể áp dụng 
const availableDiscountCodes = computed(() => {
    // Lọc các mã giảm giá đủ điều kiện áp dụng cho đơn hàng
    const eligibleDiscounts = (availableDiscounts.value || []).filter(discount => {
        const minQuantity = Number(discount.quantity) || 0
        return totalQuantity.value >= minQuantity
    })

    // Chuyển đổi discount từ database sang format phù hợp với UI
    return eligibleDiscounts.map(discount => {
        const discountType = discount.type
        const discountValue = Number(discount.value) || 0
        const minQuantity = Number(discount.quantity) || 0

        return {
            code: discount.discount_code,
            type: discountType,
            value: discountValue,
            discount_id: discount.discount_id,
            discount_name: discount.discount_name,
            quantity: minQuantity,
            description:
                `Giảm giá ${discountType === 'PERCENT' ? `${discountValue}%` : formatPrice(discountValue)} cho đơn hàng từ ${minQuantity} sản phẩm`
        }
    })
})

// Phí ship
const finalShippingFee = computed(() => {
    return shippingFee.value
})

// Tổng giảm giá (chỉ từ mã giảm giá, auto discount đã tắt)
const totalDiscountAmount = computed(() => {
    // return autoDiscountAmount.value + specialDiscountAmount.value
    return specialDiscountAmount.value
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
    //round => .5 thì làm tròn lên, dưới .5 thì làm tròn xuống
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

    let finalShippingName = shippingName 
    let finalShippingAddress = shippingAddress 
    let finalShippingPhone = shippingPhone 

    
    // Prepare order data
    return {
        discount_id: appliedSpecialDiscount.value?.discount_id || null,
        discount_code: appliedSpecialDiscount.value?.code || null,
        total: subTotal.value,
        discount_amount: specialDiscountAmount.value,
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

    // Kiểm tra có cần đặt cọc ở FE TRƯỚC KHI tạo order
    // Logic FE: COD + totalQuantity >= 10
    if (needsDeposit.value) {
        currentDepositPayment.value = {
            amount: depositAmount.value,
            payUrl: null,
            qrCodeUrl: null,
            deeplink: null
        }
        currentDeposit.value = null
        showDepositModal.value = true
        return
    }


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

            let finalShippingName = shippingName 
            let finalShippingAddress = shippingAddress 
            let finalShippingPhone = shippingPhone

        
            // Validate thông tin shipping trước khi tạo order
            if (!finalShippingName || !finalShippingAddress || !finalShippingPhone) {
                throw new Error('Thiếu thông tin giao hàng. Vui lòng quay lại trang xác nhận thông tin giao hàng!')
            }

            // Prepare order data (KHÔNG gửi payment object vì backend có thể tự động tạo payment từ đó)
            // Payment sẽ được tạo riêng sau khi tạo đơn thành công
            const orderData = {
                discount_id: appliedSpecialDiscount.value?.discount_id || null,
                discount_code: appliedSpecialDiscount.value?.code || null,
                total: subTotal.value,
                discount_amount: specialDiscountAmount.value,
                final_total: finalTotal.value,
                shipping_name: finalShippingName,
                shipping_address: finalShippingAddress,
                shipping_phone: finalShippingPhone,
                shipping_fee: shippingFee.value,
                payment: {
                    method_id: paymentMethodId,
                    amount: finalTotal.value,
                    status: 'PROCESSING'
                },
                items: items //chi tiết đơn
            }

            const response = await orderStore.createNewOrder(orderData)

            if (response.success) {
                const orderData = response.data
                const orderId = orderData?.order_id 

                if (!orderId) {
                    throw new Error('Không thể lấy order ID từ response!')
                }

                // Lưu city_id vào localStorage để tính phí ship 
                const shippingCityId = sessionStorage.getItem('shipping_city_id')
                if (shippingCityId) {
                    saveOrderCityId(orderId, shippingCityId)
                }

                // Lưu deposit fields từ response
                const depositRequired = orderData?.deposit_required || false
                const deposit = orderData?.deposit || null
                const depositPayment = orderData?.deposit_payment || null


                // Lưu deposit info vào order store
                if (orderData) {
                    orderStore.currentOrder = {
                        ...orderData,
                        deposit_required: depositRequired,
                        deposit: deposit,
                        deposit_payment: depositPayment
                    }
                }



                // Xóa shipping info từ sessionStorage sau khi tạo order thành công
                sessionStorage.removeItem('shipping_name')
                sessionStorage.removeItem('shipping_address')
                sessionStorage.removeItem('shipping_phone')
                sessionStorage.removeItem('shipping_city_id')

                // Nếu thanh toán MOMO  lưu orderId
                if (paymentMethod.value === 'MOMO') { //paymentMethod.value được set giá trị khi chọn phương thức thanh toán
                    createdOrderId.value = orderId //lấy orderId để tạo giao dịch momo
                    // Đánh dấu tạo đơn hàng đã hoàn thành 
                    isOrderCompleted.value = true
                    sessionStorage.setItem('order_completed', 'true')
                    sessionStorage.setItem('completed_order_id', orderId.toString())
                    console.log(`${paymentMethod.value} payment, redirecting to payment gateway`)
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
    

                // Reload cart to reflect changes (sau khi đã redirect hoặc set createdOrderId)
                const userId = authStore.userId
                if (userId) {
                    // Reload cart trong background, không chờ
                    cartStore.loadCartFromBackend(userId).catch(err => {
                        console.error('Error reloading cart:', err)
                    })
                }
            } else {
                throw new Error(response.message || 'Tạo đơn hàng thất bại!')
            }
        }, {
            defaultErrorMessage: 'Không thể tạo đơn hàng!',
            onError: (error) => {
                console.error('Order creation error:', error)
                errorMessage.value = error.response?.message || error.message
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

// // Xử lý khi DepositModal tạo đơn hàng thành công
// const handleOrderCreatedFromDeposit = (orderData) => {
//     console.log('✅ Order created from DepositModal:', orderData)
//     createdOrderId.value = orderData.orderId
//     currentDeposit.value = orderData.deposit
//     currentDepositPayment.value = orderData.depositPayment
//     // DepositModal đã tự mở link thanh toán, không cần làm gì thêm
// }

// Deposit modal handlers
const handleCloseDepositModal = async () => {
    console.log('Đóng modal đặt cọc')
    showDepositModal.value = false

    // Khi hủy modal, chưa có đơn hàng nào được tạo (vì chỉ tạo khi bấm "Xác nhận đặt cọc")
    // Chỉ cần reset state để quay về trang thanh toán bình thường
    currentDeposit.value = null
    currentDepositPayment.value = null

    // Không reset createdOrderId vì chưa có đơn hàng nào được tạo ở đây
    // createdOrderId chỉ được set khi bấm "Xác nhận đặt cọc"
    console.log(' Đã reset state, quay về trang thanh toán')
}

// Cleanup event listeners khi component unmount
onBeforeUnmount(() => {
    console.log(' PaymentPage unmounting, cleanup event listeners')
    window.removeEventListener('beforeunload', handleBeforeUnload)
    if (window._paymentPageVisibilityHandler) {
        document.removeEventListener('visibilitychange', window._paymentPageVisibilityHandler)
        delete window._paymentPageVisibilityHandler
    }
})



// Tạoo giao dịch MOMO
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

// Tạo đơn hàng cho VNPay 
// const initiateVNPayPayment = async (orderId) => {
//     try {
//         // Validate orderId
//         if (!orderId || orderId <= 0) {
//             throw new Error(`OrderId không hợp lệ: ${orderId}`)
//         }

//         // VNPay yêu cầu amount là số nguyên (VND, không có phần thập phân)
//         const amount = Math.round(finalTotal.value)

//         // Validate amount
//         if (!amount || amount <= 0) {
//             throw new Error(`Số tiền không hợp lệ: ${finalTotal.value}`)
//         }
//         if (amount < 1000) {
//             console.warn(`⚠️ Số tiền ${amount} VND nhỏ hơn 1000 VND, VNPay có thể từ chối`)
//         }

//         const paymentRequestData = {
//             orderId: Number(orderId),
//             amount: amount,
//             orderInfo: `Thanh toán đơn hàng #${orderId}`,
//             purpose: 'ORDER_PAYMENT'
//         }

//         console.log('💳 PaymentPage - Payment request data:', paymentRequestData)

//         const paymentResponse = await paymentStore.createVNPayPaymentStore(paymentRequestData)

//         const responseData = paymentResponse?.data || paymentResponse


//         const paymentPayload = responseData?.data || responseData


//         // Theo tài liệu: Backend trả về { success: true, data: { payUrl: "..." } }
//         const payUrl = paymentPayload?.payUrl 
//         if (payUrl && typeof payUrl === 'string' && payUrl.length > 0) {
//             // Parse và log các tham số trong URL để debug
//             try {
//                 const urlObj = new URL(payUrl)
//                 const params = new URLSearchParams(urlObj.search)
//                 // Kiểm tra các tham số bắt buộc
//                 const requiredParams = ['vnp_Amount', 'vnp_Command', 'vnp_CreateDate', 'vnp_CurrCode',
//                     'vnp_IpAddr', 'vnp_Locale', 'vnp_OrderInfo', 'vnp_OrderType',
//                     'vnp_ReturnUrl', 'vnp_TmnCode', 'vnp_TxnRef', 'vnp_Version', 'vnp_SecureHash']
//                 const missingParams = requiredParams.filter(param => !params.get(param))

//                 if (missingParams.length > 0) {
//                     console.error('❌ PaymentPage - Thiếu tham số bắt buộc:', missingParams)
//                 } else {
//                     console.log('✅ PaymentPage - Tất cả tham số bắt buộc đều có')
//                 }
//             } catch (urlError) {
//                 console.error('❌ PaymentPage - Lỗi khi parse URL:', urlError)
//             }
            
//         } 
//     } catch (error) {
//         const errorMsg = error.response?.data?.message ||
//             error.response?.data?.error ||
//             error.message ||
//             'Không thể mở trang thanh toán VNPay. Vui lòng thử lại.'

//         errorMessage.value = errorMsg
//     }
// }

// const handleCreateOrderForVNPay = async () => {
//     await handleCreateOrder()

//     if (createdOrderId.value) {
//         await initiateVNPayPayment(createdOrderId.value)
//     }
// }
</script>
