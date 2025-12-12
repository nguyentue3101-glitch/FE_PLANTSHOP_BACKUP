<template>
    <div class="space-y-4">
        <!-- Thành phố (Dropdown) -->
        <div>
            <div class="flex gap-2 items-center flex-wrap mb-2">
                <label :for="`city-${componentId}`" class="block text-gray-700 font-semibold">
                    Tỉnh/Thành phố <span v-if="required" class="text-red-500">*</span>
                </label>
            </div>

            <select :id="`city-${componentId}`" v-model="cityId" :required="required" @change="handleCityChange"
                :disabled="isLoadingProvinces" :class="[
                    'w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2',
                    focusRingClass,
                    isLoadingProvinces ? 'bg-gray-100 cursor-not-allowed' : ''
                ]">
                <option :value="null">{{ isLoadingProvinces ? 'Đang tải...' : 'Chọn thành phố' }}</option>
                <option v-for="city in cities" :key="city.id" :value="city.id">
                    {{ city.name }}
                </option>
            </select>
        </div>

        <!-- Quận/Huyện (Dropdown) -->
        <div>
            <label :for="`district-${componentId}`" class="block text-gray-700 font-semibold mb-2">
                Quận/Huyện <span v-if="required" class="text-red-500">*</span>
            </label>
            <select :id="`district-${componentId}`" v-model="selectedDistrictId" :required="required"
                :disabled="!cityId" @change="handleDistrictChange" :class="[
                    'w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2',
                    focusRingClass,
                    !cityId ? 'bg-gray-100 cursor-not-allowed' : ''
                ]">
                <option :value="null">Chọn quận/huyện</option>
                <option v-for="district in districts" :key="district.id" :value="district.id">
                    {{ district.name }}
                </option>
            </select>
            <p v-if="errorMessage" class="mt-1 text-xs text-red-600">{{ errorMessage }}</p>
        </div>

        <!-- Địa chỉ chi tiết (Input) -->
        <div>
            <label :for="`address-detail-${componentId}`" class="block text-gray-700 font-semibold mb-2">
                Địa chỉ chi tiết <span v-if="required" class="text-red-500">*</span>
                <span class="text-sm font-normal text-gray-500">(Số nhà, tên đường, phường/xã)</span>
            </label>
            <textarea :id="`address-detail-${componentId}`" v-model="addressDetail" :required="required" rows="3"
                :placeholder="addressPlaceholder || 'Ví dụ: 123 Đường ABC, Phường XYZ'" @input="handleAddressChange"
                :class="[
                    'w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2',
                    focusRingClass
                ]"></textarea>
        </div>

        <!-- Địa chỉ hoàn chỉnh (Preview, chỉ hiển thị khi mode là shipping) -->
        <div v-if="mode === 'shipping' && fullAddress" class="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p class="text-sm text-gray-600 mb-1">Địa chỉ giao hàng:</p>
            <p class="text-sm font-semibold text-gray-800">{{ fullAddress }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useProvinces } from '@/composables/useProvinces'

// Tạo unique ID cho component (thay thế _uid trong Vue 3)
const componentId = ref(`address-selector-${Math.random().toString(36).substr(2, 9)}`)

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({
            address: '',
            district_id: null,
            city_id: null,
            fullAddress: ''
        })
    },
    mode: {
        type: String,
        default: 'user', // 'user' hoặc 'shipping'
        validator: (value) => ['user', 'shipping'].includes(value)
    },
    required: {
        type: Boolean,
        default: false
    },
    inputClass: {
        type: String,
        default: ''
    },
    focusRingClass: {
        type: String,
        default: 'focus:ring-green-500'
    },
    addressPlaceholder: {
        type: String,
        default: ''
    },
    showShippingNotice: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'change'])

// Sử dụng composable để quản lý dữ liệu tỉnh thành từ API
const {
    provinces: apiProvinces,
    isLoading: isLoadingProvinces,
    error: provincesError,
    loadProvinces,
    getDistrictsByProvinceCode,
    loadDistrictsForProvince,
    getProvinceByCode,
    getDistrictByCode
} = useProvinces()

// State
const cityId = ref(null)
const selectedDistrictId = ref(null)
const addressDetail = ref('')
const errorMessage = ref('')

// Computed để lấy danh sách thành phố (từ API)
const cities = computed(() => {
    if (apiProvinces.value.length > 0) {
        // Transform từ API format (code) sang format cũ (id) để tương thích
        return apiProvinces.value.map(province => ({
            id: province.code,
            code: province.code,
            name: province.name
        }))
    }
    return []
})

// State để lưu districts đã load
const loadedDistricts = ref([])

// Computed để lấy danh sách quận/huyện theo thành phố đã chọn
const districts = computed(() => {
    if (!cityId.value) {
        loadedDistricts.value = []
        return []
    }
    // Trả về districts đã load (sẽ được update bởi watch)
    return loadedDistricts.value
})

// Watch cityId để load districts khi thay đổi
watch(cityId, async (newCityId) => {
    if (!newCityId) {
        loadedDistricts.value = []
        return
    }

    console.log(`🔄 Loading districts for cityId ${newCityId}...`)
    try {
        // Thử lấy từ cache trước
        let apiDistricts = getDistrictsByProvinceCode(newCityId)

        // Nếu chưa có trong cache, load từ API
        if (apiDistricts.length === 0) {
            apiDistricts = await loadDistrictsForProvince(newCityId)
        }

        loadedDistricts.value = apiDistricts.map(district => ({
            id: district.code,
            code: district.code,
            name: district.name, // Name đầy đủ từ API (ví dụ: "Thành phố Bà Rịa", "Thành phố Vũng Tàu")
            division_type: district.division_type
        }))
        console.log(`✅ Loaded ${loadedDistricts.value.length} districts for cityId ${newCityId}`)
        console.log('📋 Sample districts:', loadedDistricts.value.slice(0, 3).map(d => d.name))
    } catch (err) {
        console.error('❌ Error loading districts:', err)
        loadedDistricts.value = []
    }
}, { immediate: false })

// Computed để lấy tên thành phố hiện tại
const cityName = computed(() => {
    if (!cityId.value) return ''
    const province = getProvinceByCode(cityId.value)
    return province ? province.name : ''
})

// Computed
const fullAddress = computed(() => {
    if (!addressDetail.value || !selectedDistrictId.value || !cityId.value) return ''

    const district = getDistrictByCode(selectedDistrictId.value)
    const districtName = district ? district.name : ''

    if (!districtName || !cityName.value) return ''

    return `${addressDetail.value.trim()}, ${districtName}, ${cityName.value}`.trim()
})

// Không cần load cities/districts nữa vì dùng dữ liệu cố định
// Chỉ cần reset districts khi đổi thành phố
const loadDistricts = (cityIdParam) => {
    if (!cityIdParam) {
        // Reset districts khi không có thành phố
        selectedDistrictId.value = null
        return
    }

    // Reset district selection khi load quận/huyện mới
    selectedDistrictId.value = null
}

// Xử lý khi thay đổi thành phố
const handleCityChange = () => {
    // Reset district về "Chọn quận/huyện" khi đổi thành phố
    selectedDistrictId.value = null

    // Emit thay đổi
    emitChange()
}

// Xử lý khi thay đổi quận
const handleDistrictChange = () => {
    emitChange()
}

// Xử lý khi thay đổi địa chỉ chi tiết
const handleAddressChange = () => {
    emitChange()
}

// Emit thay đổi
const emitChange = () => {
    const selectedDistrict = getDistrictByCode(selectedDistrictId.value)

    if (props.mode === 'shipping') {
        // Mode shipping: emit fullAddress
        const newValue = {
            fullAddress: fullAddress.value,
            address: addressDetail.value,
            district_id: selectedDistrictId.value,
            city_id: cityId.value,
            district_name: selectedDistrict ? selectedDistrict.name : null
        }
        emit('update:modelValue', newValue)
        emit('change', newValue)
    } else {
        // Mode user: emit address, district_id, city_id riêng lẻ
        const newValue = {
            address: addressDetail.value,
            district_id: selectedDistrictId.value,
            city_id: cityId.value
        }
        emit('update:modelValue', newValue)
        emit('change', newValue)
    }
}

// Watch modelValue để đồng bộ từ bên ngoài
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        // Đồng bộ city_id
        if (newValue.city_id && newValue.city_id !== cityId.value) {
            cityId.value = newValue.city_id
        }

        // Parse địa chỉ nếu là fullAddress (mode shipping)
        // Lưu ý: Địa chỉ chi tiết (addressDetail) không tự động lấy từ modelValue.address
        // Chỉ set district_id và city_id, để người dùng nhập địa chỉ chi tiết mới
        if (props.mode === 'shipping') {
            // Chỉ set district_id và city_id, không set addressDetail
            selectedDistrictId.value = newValue.district_id || null
        } else {
            // Mode user: chỉ set district_id và city_id
            selectedDistrictId.value = newValue.district_id || null
        }
    }
}, { deep: true, immediate: true })

// Khởi tạo
onMounted(async () => {
    // Load dữ liệu tỉnh thành từ API
    try {
        await loadProvinces()
        console.log('✅ Loaded provinces from API')
    } catch (err) {
        console.error('❌ Failed to load provinces from API:', err)
    }

    // Nếu đã có city_id trong modelValue, sử dụng nó
    if (props.modelValue?.city_id) {
        cityId.value = props.modelValue.city_id

        // Load districts cho city_id này
        try {
            // Thử lấy từ cache trước
            let apiDistricts = getDistrictsByProvinceCode(props.modelValue.city_id)

            // Nếu chưa có trong cache, load từ API
            if (apiDistricts.length === 0) {
                apiDistricts = await loadDistrictsForProvince(props.modelValue.city_id)
            }

            loadedDistricts.value = apiDistricts.map(district => ({
                id: district.code,
                code: district.code,
                name: district.name, // Name đầy đủ từ API (ví dụ: "Thành phố Bà Rịa", "Thành phố Vũng Tàu")
                division_type: district.division_type
            }))
            console.log(`✅ Loaded ${loadedDistricts.value.length} districts on mount for cityId ${props.modelValue.city_id}`)
            console.log('📋 Sample districts:', loadedDistricts.value.slice(0, 5).map(d => `${d.name} (${d.division_type})`))
        } catch (err) {
            console.error('Error loading districts on mount:', err)
        }

        // Set district_id nếu có
        if (props.modelValue.district_id) {
            // Đợi một chút để districts được tính toán
            await new Promise(resolve => setTimeout(resolve, 200))
            const exists = districts.value.some(d => d.id === props.modelValue.district_id)
            if (exists) {
                selectedDistrictId.value = props.modelValue.district_id
            }
        }
    }

    // Lưu ý: Địa chỉ chi tiết không được tự động lấy từ modelValue
    // Người dùng phải nhập địa chỉ chi tiết mới mỗi lần

    // Mặc định: cityId và selectedDistrictId là null để hiển thị placeholder
})
</script>
