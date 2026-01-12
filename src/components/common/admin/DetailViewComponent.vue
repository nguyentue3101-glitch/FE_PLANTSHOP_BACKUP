<template>
    <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50"
        @click.self="handleClose">
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="flex p-6 border-b bg-gray-50">
                <div class="flex w-full">
                    <h2 class="text-2xl font-bold text-gray-800">
                        {{ type === 'order' ? `Chi tiết đơn #${data?.order_id || ''}` : `Chi tiết giao dịch
                        #${data?.payment_id || ''}` }}
                    </h2>
                </div>
                <button @click="handleClose"
                    class="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer ml-4">
                    <X :size="24" />
                </button>
            </div>

            <!-- Content -->
            <div class="p-6">
                <div v-if="data">
                    <!-- Order View -->
                    <template v-if="type === 'order'">
                        <!-- Customer Information -->
                        <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label class="text-1xl font-semibold text-gray-900">Tên khách hàng:</label>
                                <p class="text-gray-600 font-medium">{{ data.customer || 'Không có' }}</p>
                            </div>

                            <div>
                                <label class="text-1xl font-semibold text-gray-900">Số điện thoại:</label>
                                <p class="text-gray-900">{{ data.phone || 'Không có' }}</p>
                            </div>
                            <div>
                                <label class="text-1xl font-semibold text-gray-900">Địa chỉ:</label>
                                <p class="text-gray-900">{{ data.address || 'Không có' }}</p>
                            </div>

                            <div>
                                <label class="text-1xl font-semibold text-gray-900">Ngày đặt:</label>
                                <p class="text-gray-900">{{ data.created_at || 'Không có' }}</p>
                            </div>

                            <div>
                                <label class="text-1xl font-semibold text-gray-900">Phương thức thanh toán({{
                                    data.payment_method }}): 
                                <span :class="getPaymentStatusClass(data.payment_status)">{{getPaymentStatusText(data.payment_status)}}</span>
                                </label>
                            </div>

                        </div>

                        <!-- Product Details Table -->
                        <div class="mb-4">
                            <div class="overflow-x-auto">
                                <table class="min-w-full border-collapse ">
                                    <thead>
                                        <tr class="bg-gray-300 text-left">
                                            <th
                                                class="border border-gray-700 px-4 py-3 text-sm font-semibold text-gray-700">
                                                Mã sản phẩm</th>
                                            <th
                                                class="border border-gray-700 px-4 py-3 text-sm font-semibold text-gray-700">
                                                Tên sản phẩm</th>
                                            <th
                                                class="border border-gray-700 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                                Số lượng</th>
                                            <th
                                                class="border border-gray-700 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                                Đơn giá</th>
                                            <th
                                                class="border border-gray-700 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                                Tạm tính</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-if="!data.order_details || data.order_details.length === 0">
                                            <td colspan="5"
                                                class="border border-gray-700 px-4 py-4 text-center text-gray-500">
                                                Không có sản phẩm nào
                                            </td>
                                        </tr>
                                        <tr v-for="(detail, index) in data.order_details" :key="index"
                                            class="hover:bg-gray-50">
                                            <td class="border border-gray-700 px-4 py-3 text-sm text-gray-900">
                                                {{ detail.product_id || detail.product?.product_id || 'N/A' }}
                                            </td>
                                            <td class="border border-gray-700 px-4 py-3 text-sm text-gray-900">
                                                {{ detail.product_name || detail.product?.product_name || 'N/A' }}
                                            </td>
                                            <td
                                                class="border border-gray-700 px-4 py-3 text-sm text-gray-900 text-center">
                                                {{ detail.quantity || 0 }}
                                            </td>
                                            <td
                                                class="border border-gray-700 px-4 py-3 text-sm text-gray-900 text-center">
                                                {{ formatPrice(detail.price_at_order || detail.price || 0) }}
                                            </td>
                                            <td
                                                class="border border-gray-700 px-4 py-3 text-sm font-semibold text-gray-900 text-center">
                                                {{ formatPrice((detail.price_at_order || detail.price || 0) *
                                                    (detail.quantity || 0)) }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Order Summary -->
                        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div class="mb-4">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Ghi chú:</label>
                                <p class="text-gray-900 bg-white p-3 rounded border border-gray-500 min-h-[60px]">{{
                                    data.note || 'Không có' }}</p>
                            </div>
                            <div class="flex justify-end">
                                <div class="w-full md:w-1/2 space-y-2">
                                    <div class="flex justify-between text-sm pt-4">
                                        <span class="text-gray-600">Tạm tính:</span>
                                        <span class="text-gray-900 font-medium">{{ formatPrice(data.subtotal || 0)
                                            }}</span>
                                    </div>
                                    <div v-if="(data.discount > 0) || (data.discount_amount > 0) || (data.auto_discount_amount > 0)"
                                        class="space-y-1">
                                      
                                        <!-- tiền giảm giá -->
                                        <div v-if="data.discount_amount > 0" class="flex justify-between text-sm">
                                            <span class="text-gray-600">
                                                Giảm giá:
                                            </span>
                                            <span class="text-red-600 font-medium">-{{
                                                formatPrice(data.discount_amount || 0) }}</span>
                                        </div>
                                     
                                    </div>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-600">Phí vận chuyển:</span>
                                        <span class="text-gray-900 font-medium">{{ formatPrice(data.shipping_fee || 0)
                                            }}</span>
                                    </div>

                                    <!-- Chỉ hiển thị đặt cọc khi đã đặt cọc thành công (paid = true) -->
                                    <template v-if="data.deposit_required && data.deposit && data.deposit.paid">
                                        <div class="flex justify-between text-sm items-center  ">
                                            <span class=" text-gray-600">Đã đặt cọc:</span>
                                            <span class="font-semibold text-green-600">{{
                                                formatPrice(data.deposit?.amount || 0) }}</span>
                                        </div>
                                    </template>

                                    <div
                                        class="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 mt-2">
                                        <span class="text-gray-800">Tổng cộng:</span>
                                        <span class="text-green-600">{{ formatPrice(data.final_total || 0) }}</span>
                                    </div>

                                    <!-- Deposit Information - Chỉ hiển thị khi đã đặt cọc thành công -->
                                    <template v-if="data.deposit_required && data.deposit && data.deposit.paid">
                                        <div class="flex justify-between text-lg font-bold items-center ">
                                            <span class=" text-gray-800">Còn lại:</span>
                                            <span class="text-lg font-bold text-orange-600">{{
                                                formatPrice(remainingDepositAmount) }}</span>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
                <div v-else class="text-center text-gray-500 py-8">
                    Không có dữ liệu để hiển thị
                </div>
            </div>


        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { useProductStore } from '@/stores/products'

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: 'order',
        validator: (value) => ['order', 'transaction'].includes(value)
    },
    data: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['close'])
const productStore = useProductStore()

// Load product deleted info 
const loadMissingProducts = async () => {
    if (props.type !== 'order' || !props.data?.order_details) return
    for (const orderDetail of props.data.order_details) {
        if (!orderDetail.product_name && !orderDetail.product?.product_name && orderDetail.product_id) {
            try {
                const product = await productStore.getProductByIdDeletedStore(orderDetail.product_id)
                if (product) {
                    orderDetail.product = product
                    // Cập nhật product_name nếu chưa có
                    if (!orderDetail.product_name && product.product_name) {
                        orderDetail.product_name = product.product_name
                    }
                }
            } catch (error) {
                console.error('Error loading product:', error)
            }
        }
    }
}

// Watch data changes để load products khi modal mở
watch(() => props.data, () => {
    if (props.show && props.data) {
        loadMissingProducts()
    }
}, { immediate: true })

// Load products khi component mount
onMounted(() => {
    if (props.show && props.data) {
        loadMissingProducts()
    }
})

const handleClose = () => {
    emit('close')
}

const formatPrice = (price) => {
    if (!price && price !== 0) return '0 ₫'
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) : price
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(numPrice)
}

// Lấy text trạng thái thanh toán
const getPaymentStatusText = (status) => {
    if (!status) return 'Chưa có'
    const statusMap = {
        'PROCESSING': 'Đang xử lý',
        'SUCCESS': 'Thành công',
        'FAILED': 'Thất bại'
    }
    return statusMap[status] || status
}

// Lấy class cho trạng thái thanh toán
const getPaymentStatusClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    const classMap = {
        'PROCESSING': 'bg-yellow-100 text-yellow-800',
        'SUCCESS': 'bg-green-100 text-green-800',
        'FAILED': 'bg-red-100 text-red-800'
    }
    return classMap[status] || 'bg-gray-100 text-gray-800'
}


// Tính số tiền còn lại phải thanh toán sau khi đặt cọc
const remainingDepositAmount = computed(() => {
    if (props.type === 'order') {
        if (!props.data) {
            return 0
        }
        const finalTotal = props.data.final_total || 0
        const depositAmount = props.data.deposit?.amount || 0

        // Tính số tiền còn lại = final_total - deposit.amount
        const remaining = finalTotal - depositAmount
        return remaining > 0 ? remaining : 0
    }

    return 0
})

</script>
