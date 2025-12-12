import { ref, computed } from 'vue'
import { getProvinces, getProvinceByCode } from '@/api/location/get'

// Cache dữ liệu tỉnh thành để tránh gọi API nhiều lần
const provincesCache = ref(null)
const districtsCache = ref({}) // { provinceCode: districts[] }
const isLoading = ref(false)
const error = ref(null)

/**
 * Composable để quản lý dữ liệu tỉnh thành từ API
 */
export function useProvinces() {
  /**
   * Load danh sách tỉnh thành từ API (với cache)
   */
  const loadProvinces = async (forceRefresh = false) => {
    // Nếu đã có cache và không force refresh, trả về cache
    if (provincesCache.value && !forceRefresh) {
      return provincesCache.value
    }

    isLoading.value = true
    error.value = null

    try {
      // Gọi API với depth=2 để lấy provinces + districts (theo yêu cầu API)
      const data = await getProvinces(2)
      
      console.log('📦 API Response (first province sample):', data[0])
      
      // Transform dữ liệu từ API format sang format của ứng dụng
      const transformedProvinces = data.map(province => ({
        code: province.code,
        name: province.name,
        codename: province.codename,
        division_type: province.division_type,
        phone_code: province.phone_code,
        districts: province.districts || []
      }))

      provincesCache.value = transformedProvinces
      
      // Cache districts theo province code (vì API trả về districts với depth=2)
      transformedProvinces.forEach(province => {
        if (province.districts && province.districts.length > 0) {
          districtsCache.value[province.code] = province.districts.map(district => ({
            code: district.code,
            name: district.name, // Name đầy đủ từ API (ví dụ: "Thành phố Bà Rịa", "Thành phố Vũng Tàu")
            codename: district.codename,
            division_type: district.division_type,
            province_code: district.province_code
          }))
          console.log(`✅ Cached ${districtsCache.value[province.code].length} districts for province ${province.code} (${province.name})`)
        } else {
          console.warn(`⚠️ No districts found for province ${province.code} (${province.name})`)
        }
      })

      console.log('📊 Total provinces cached:', transformedProvinces.length)
      console.log('📊 Total provinces with districts:', Object.keys(districtsCache.value).length)

      return transformedProvinces
    } catch (err) {
      error.value = err.message || 'Không thể tải danh sách tỉnh thành'
      console.error('Error loading provinces:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Lấy danh sách tỉnh thành (computed)
   */
  const provinces = computed(() => {
    return provincesCache.value || []
  })

  /**
   * Lấy danh sách quận/huyện theo mã tỉnh thành (từ cache)
   */
  const getDistrictsByProvinceCode = (provinceCode) => {
    if (!provinceCode) {
      console.warn('⚠️ getDistrictsByProvinceCode: provinceCode is null/undefined')
      return []
    }
    
    if (!districtsCache.value[provinceCode]) {
      console.warn(`⚠️ getDistrictsByProvinceCode: No districts found in cache for province code ${provinceCode}`)
      console.log('📋 Available province codes in cache:', Object.keys(districtsCache.value))
      return []
    }
    
    const districts = districtsCache.value[provinceCode]
    console.log(`✅ getDistrictsByProvinceCode: Found ${districts.length} districts in cache for province ${provinceCode}`)
    return districts
  }

  /**
   * Load districts cho một tỉnh thành từ API (nếu chưa có trong cache)
   */
  const loadDistrictsForProvince = async (provinceCode) => {
    if (!provinceCode) {
      return []
    }
    
    // Nếu đã có trong cache, trả về ngay
    if (districtsCache.value[provinceCode]) {
      console.log(`✅ loadDistrictsForProvince: Using cached districts for province ${provinceCode}`)
      return districtsCache.value[provinceCode]
    }
    
    // Nếu chưa có trong cache, load từ API
    console.log(`🔄 loadDistrictsForProvince: Loading districts for province ${provinceCode} from API...`)
    try {
      // Gọi API để lấy chi tiết province với districts
      const provinceData = await getProvinceByCode(provinceCode, 1) // depth=1 để lấy districts
      
      console.log('📦 Province data from API:', {
        code: provinceData?.code,
        name: provinceData?.name,
        hasDistricts: !!provinceData?.districts,
        districtsCount: provinceData?.districts?.length || 0
      })
      
      if (provinceData && provinceData.districts && provinceData.districts.length > 0) {
        districtsCache.value[provinceCode] = provinceData.districts.map(district => ({
          code: district.code,
          name: district.name, // Name đầy đủ từ API (ví dụ: "Thành phố Bà Rịa", "Thành phố Vũng Tàu", "Quận 1", "Huyện Cần Giờ")
          codename: district.codename,
          division_type: district.division_type,
          province_code: district.province_code
        }))
        console.log(`✅ loadDistrictsForProvince: Loaded ${districtsCache.value[provinceCode].length} districts for province ${provinceCode} (${provinceData.name})`)
        console.log('📋 Sample districts:', districtsCache.value[provinceCode].slice(0, 5).map(d => `${d.name} (${d.division_type})`))
        return districtsCache.value[provinceCode]
      } else {
        console.warn(`⚠️ loadDistrictsForProvince: Province ${provinceCode} has no districts in API response`)
        console.log('📋 Full province data:', provinceData)
      }
    } catch (err) {
      console.error(`❌ Error loading districts for province ${provinceCode}:`, err)
      console.error('Error details:', err.response?.data || err.message)
    }
    
    console.warn(`⚠️ loadDistrictsForProvince: No districts found for province code ${provinceCode}`)
    return []
  }

  /**
   * Tìm tỉnh thành theo code
   */
  const getProvinceByCode = (code) => {
    if (!provincesCache.value) return null
    return provincesCache.value.find(p => p.code === code) || null
  }

  /**
   * Tìm quận/huyện theo code
   */
  const getDistrictByCode = (districtCode) => {
    for (const districts of Object.values(districtsCache.value)) {
      const district = districts.find(d => d.code === districtCode)
      if (district) return district
    }
    return null
  }

  /**
   * Clear cache
   */
  const clearCache = () => {
    provincesCache.value = null
    districtsCache.value = {}
  }

  return {
    provinces,
    isLoading,
    error,
    loadProvinces,
    getDistrictsByProvinceCode,
    loadDistrictsForProvince,
    getProvinceByCode,
    getDistrictByCode,
    clearCache
  }
}

