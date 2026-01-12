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
                :disabled="isLoadingProvinces || provincesError" :class="[
                    'w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2',
                    focusRingClass,
                    isLoadingProvinces || provincesError ? 'bg-gray-100 cursor-not-allowed border-gray-300' : 'border-gray-300',
                    provincesError ? 'border-red-300' : ''
                ]">
                <option :value="null">
                    {{ isLoadingProvinces ? 'Đang tải...' : provincesError ? 'Không thể tải dữ liệu' : 'Chọn tỉnh/thành phố'
                    }}
                </option>
                <option v-for="city in cities" :key="city.id" :value="city.id">
                    {{ city.name }}
                </option>
            </select>
            <p v-if="provincesError" class="mt-1 text-xs text-red-600">
                {{ provincesError }}
            </p>
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
                Địa chỉ<span v-if="required" class="text-red-500">*</span>
                <span class="text-sm font-normal text-gray-500">(Số nhà, tên đường, phường/xã)</span>
            </label>
            <textarea :id="`address-detail-${componentId}`" v-model="addressDetail" :required="required" rows="1"
                :placeholder="addressPlaceholder " @input="handleAddressChange"
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

// Tạo unique ID cho component tránh bug ngầm khi render lại component
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
        default: 'shipping',
        validator: (value) => ['shipping'].includes(value)
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

})

const emit = defineEmits(['update:modelValue'])

// Sử dụng composable để quản lý dữ liệu tỉnh thành từ API
const {
    provinces: apiProvinces,
    isLoading: isLoadingProvinces,
    error: provincesError,
    loadProvinces,
    loadDistrictsForProvince,
    getProvinceByCode,
    getDistrictByCode
} = useProvinces()

// State
const cityId = ref(null)
const selectedDistrictId = ref(null)
const addressDetail = ref('')
const errorMessage = ref('')

// Khởi tạo
onMounted(async () => {
    // Load dữ liệu tỉnh thành từ API
    try {
        await loadProvinces()
        console.log('đã lấy được danh sách tỉnh thành từ API')
    } catch (err) {
        if (err.message) {
            errorMessage.value = `Không thể tải danh sách tỉnh thành: ${err.message}`

        }
    }

})

// Computed để lấy danh sách thành phố (từ API)
const cities = computed(() => {
    console.log("lấy danh sách thành phố ")
    if (apiProvinces.value.length > 0) { 
        console.log("danh sách tỉnh thành:", apiProvinces.value);
        return apiProvinces.value.map(province => ({
            id: province.code,
            name: province.name
        }))
    }
    return []
})

// State để lưu districts đã load
const loadedDistricts = ref([])

// lấy danh sách quận huyện 
const districts = computed(() => {
    if (!cityId.value) {
        return []
    }
    return loadedDistricts.value
})

// Watch cityId để load districts khi thay đổi
//immediate: false => watch chỉ chạy khi cityId thay đổi
watch(cityId, async (newCityId) => {
    if (!newCityId) {
        loadedDistricts.value = []
        return
    }

    console.log(`mã thành phố: ${newCityId}...`)
    try {
        // loadDistrictsForProvince tự động kiểm tra cache và gọi API nếu cần
        const apiDistricts = await loadDistrictsForProvince(newCityId)

        loadedDistricts.value = apiDistricts.map(district => ({
            id: district.code,
            code: district.code,
            name: district.name, 
            division_type: district.type
        }))
        console.log(`Loaded được ${loadedDistricts.value.length} districts cho mã cityId ${newCityId}`)
        console.log('Sample districts:', loadedDistricts.value.slice(0, 3).map(d => d.name))
    } catch (err) {
        console.error('Error loading districts:', err)
        loadedDistricts.value = []
    }
}, { immediate: false })


// theo dõi sự thay đổi của full address
const fullAddress = computed(() => {
    if (!addressDetail.value || !selectedDistrictId.value || !cityId.value) return ''

    const provinces = getProvinceByCode(cityId.value)
    const cityName = provinces ? provinces.name : ''
    const district = getDistrictByCode(selectedDistrictId.value)
    const districtName = district ? district.name : ''

    if (!districtName || !cityName) return ''

    return `${addressDetail.value.trim()}, ${districtName}, ${cityName}`.trim()
})



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
        const newValue = {
            fullAddress: fullAddress.value,
            address: addressDetail.value,
            district_id: selectedDistrictId.value,
            city_id: cityId.value,
            district_name: selectedDistrict ? selectedDistrict.name : null
        }
        console.log("giá trị mới", newValue);
        emit('update:modelValue', newValue)
        // emit('change', newValue)
    } 
}

// Watch modelValue để đồng bộ từ bên ngoài
//xử lý ngay khi component mở 
// watch(() => props.modelValue, (newValue) => {
//     if (newValue) {
//         // Đồng bộ city_id
//         if (newValue.city_id && newValue.city_id !== cityId.value) {
//             cityId.value = newValue.city_id
//         }

//         if (props.mode === 'shipping') {
//             selectedDistrictId.value = newValue.district_id || null
//         }
//     }
// }, { deep: true, immediate: true })


</script>