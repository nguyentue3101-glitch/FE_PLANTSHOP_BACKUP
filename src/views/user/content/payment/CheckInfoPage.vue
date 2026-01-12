<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4 max-w-2xl">
            <h1 class="text-3xl font-bold text-green-700 mb-6 text-center">Kiểm tra thông tin giao hàng</h1>

            <!-- Confirm Leave Modal -->
            <ConfirmLeaveModal :show="showConfirmModal" @confirm="handleConfirmLeave" @cancel="handleCancelLeave" />

            <div class="bg-white rounded-lg shadow p-6">
                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <!-- Username -->
                    <div>
                        <label for="username" class="block text-gray-700 font-semibold mb-2">
                            Tên người nhận <span class="text-red-500">*</span>
                        </label>
                        <input v-model="formData.username" type="text" id="username" required
                            placeholder="Nhập tên người nhận"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>

                    <!-- Phone Number -->
                    <div>
                        <label for="phone_number" class="block text-gray-700 font-semibold mb-2">
                            Số điện thoại <span class="text-red-500">*</span>
                        </label>
                        <input v-model="formData.phone_number" type="tel" id="phone_number" required
                            placeholder="Nhập số điện thoại"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>

                    <!-- Address -->
                    <AddressSelector v-model="addressData" :mode="'shipping'" :required="true"
                        focus-ring-class="focus:ring-green-500" address-placeholder="Ví dụ: 123 Đường ABC, Phường XYZ"
                         />

                    <!-- Note -->
                    <div>
                        <label for="note" class="block text-gray-700 font-semibold mb-2">
                            Ghi chú đơn hàng
                        </label>
                        <textarea v-model="formData.note" id="note" rows="3"
                            placeholder="Nhập ghi chú cho đơn hàng (nếu có)"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"></textarea>
                    </div>

                    <!-- Error Message -->
                    <div v-if="errorMessage" class="text-red-600 text-sm text-center">
                        {{ errorMessage }}
                    </div>

                    <!-- Buttons -->
                    <div class="flex gap-4 pt-4">
                        <button type="button" @click="handleCancel"
                            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors cursor-pointer">
                            Hủy
                        </button>
                        <button type="submit" :disabled="isLoading"
                            class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer">
                            {{ isLoading ? 'Đang xử lý...' : 'Xác nhận' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useAsyncOperation } from '@/composables/useAsyncOperation'
// import { useProvinces } from '@/composables/useProvinces'
import ConfirmLeaveModal from '@/components/common/ConfirmLeaveModal.vue'
import AddressSelector from '@/components/common/AddressSelector.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const userStore = useUserStore()
const { isLoading, errorMessage, executeAsync } = useAsyncOperation()

// Sử dụng composable để load dữ liệu tỉnh thành
// const { loadProvinces, isLoading: isLoadingProvinces } = useProvinces()

const formData = ref({
    username: '',
    phone_number: '',
    note: ''
})

// Address data cho AddressSelector (mode shipping)
const addressData = ref({
    fullAddress: '',
    address: '',
    district_id: null,
    city_id: null
})

const showConfirmModal = ref(false)
const pendingNavigation = ref(null)

// Chặn navigation về các trang khi đang ở trang CheckInfoPage
onBeforeRouteLeave((to, from, next) => {
    if (to.name === 'home' || to.name === 'product' || to.name === 'contact' || to.name === 'userinfo' || to.name === 'cart') {
        pendingNavigation.value = { to, next }
        showConfirmModal.value = true
    } else {
        next()
    }
})

const handleConfirmLeave = () => {
    showConfirmModal.value = false
    if (pendingNavigation.value && pendingNavigation.value.next) {
        pendingNavigation.value.next()
        pendingNavigation.value = null
    }
}

const handleCancelLeave = () => {
    showConfirmModal.value = false
    if (pendingNavigation.value && pendingNavigation.value.next) {
        pendingNavigation.value.next(false)
        pendingNavigation.value = null
    }
}



onMounted(async () => {
    //kiểm tra flag
    console.log('completed_order_id:', sessionStorage.getItem('completed_order_id'))
    console.log('order_completed:', sessionStorage.getItem('order_completed'))
    sessionStorage.removeItem('order_completed')
    sessionStorage.removeItem('completed_order_id')
    console.log('completed_order_id:', sessionStorage.getItem('completed_order_id'))
    console.log('order_completed:', sessionStorage.getItem('order_completed'))
   

    try {
        const token = authStore.accessToken
        if (token) {
            await userStore.getInfo(token)
            if (userStore.userInfo) {
                formData.value = {
                    username: userStore.userInfo.username || '',
                    phone_number: userStore.userInfo.phone_number || '',
                    // address: userStore.userInfo.address || ''
                }
            }
        }
    } catch (error) {
        console.error('Error loading user info:', error)
    }
})


const handleSubmit = async () => {
    // Validate required fields
    if (!formData.value.username || !formData.value.phone_number) {
        errorMessage.value = 'Vui lòng điền đầy đủ thông tin bắt buộc!'
        return
    }

    // Validate thành phố - bắt buộc phải chọn
    if (!addressData.value.city_id) {
        errorMessage.value = 'Vui lòng chọn thành phố!'
        return
    }

    // Validate quận/huyện - bắt buộc phải chọn
    if (!addressData.value.district_id) {
        errorMessage.value = 'Vui lòng chọn quận/huyện!'
        return
    }

    // Validate địa chỉ chi tiết - bắt buộc phải nhập
    if (!addressData.value.address || !addressData.value.address.trim()) {
        errorMessage.value = 'Vui lòng nhập địa chỉ chi tiết!'

        return
    }

    // Validate địa chỉ hoàn chỉnh (fullAddress)
    if (!addressData.value.fullAddress || !addressData.value.fullAddress.trim()) {
        errorMessage.value = 'Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng!'
        return
    }

    await executeAsync(async () => {
        // Lưu thông tin giao hàng vào sessionStorage
        const shippingInfo = {
            shipping_name: formData.value.username,
            shipping_address: addressData.value.fullAddress, // Sử dụng fullAddress từ AddressSelector
            shipping_phone: formData.value.phone_number
        }

        sessionStorage.setItem('shipping_name', shippingInfo.shipping_name)
        sessionStorage.setItem('shipping_address', shippingInfo.shipping_address)
        sessionStorage.setItem('shipping_phone', shippingInfo.shipping_phone)
        // Lưu city_id để tính phí ship
        if (addressData.value.city_id) {
            sessionStorage.setItem('shipping_city_id', addressData.value.city_id)
        }

        console.log(' kiểm tra lưu thông tin giao hàng trong sessionStorage:', shippingInfo)

        // Xóa flag review_page_left để đảm bảo có thể vào trang ReviewOrderPage
        sessionStorage.removeItem('review_page_left')

        // Navigate to review order page with shipping info
        router.push({
            name: 'payment',
            query: {
                ...route.query, // sao chép các query params hiện tại
                shippingInfo: JSON.stringify({ //chuyển thông tin giao hàng dưới dạng chuỗi
                    ...formData.value, 
                    address: addressData.value.fullAddress,
                    city_id: addressData.value.city_id || null
                }),
                fromCheckout: 'true' // Đánh dấu là điều hướng từ trang checkInfoPage
            }
        })
    }, {
        defaultErrorMessage: 'Có lỗi xảy ra. Vui lòng thử lại!',
        // onError: (error) => {
        //     // Nếu lỗi là do cập nhật user info hoặc shipping info, vẫn cho phép tiếp tục
        //     console.error('Error in handleSubmit:', error)
        // }
    })
}

const handleCancel = () => {
    router.push('/cart')
}
</script>
