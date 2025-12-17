import { ref, computed } from 'vue'
import { getProvinces, getProvinceByCode, getDistrictsByProvince } from '@/api/location/get'

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
      // Gọi API mới
      const data = await getProvinces()
      
      console.log('📦 API Response (first province sample):', data[0])
      console.log('📦 API Response keys:', data[0] ? Object.keys(data[0]) : 'No data')
      
      // Transform dữ liệu từ API format mới sang format của ứng dụng
      // Lưu ý: API mới không trả về districts trong provinces/getAll
      // Districts sẽ được load riêng từ districts/getByProvince khi cần
      const transformedProvinces = data.map((province, index) => {
        // Log để debug format (chỉ log 2 province đầu)
        if (index < 2) {
          console.log(`🔍 Transforming province ${index}:`, province)
        }
        
        const transformed = {
          code: province.code || province.province_id || province.id || province.provinceCode,
          name: province.name || province.province_name || province.provinceName,
          codename: province.codename || province.slug,
          division_type: province.division_type || province.type || province.divisionType,
          phone_code: province.phone_code || province.phone || province.phoneCode,
          districts: [] // Districts sẽ được load riêng khi cần
        }
        
        // Chuẩn hóa code về format 2 chữ số (01, 02, ...)
        if (transformed.code) {
          transformed.code = String(transformed.code).padStart(2, '0')
        }
        
        // Log nếu không có code hoặc name
        if (!transformed.code || !transformed.name) {
          console.warn('⚠️ Province missing code or name:', province, transformed)
        }
        
        return transformed
      })
      
      console.log('✅ Transformed provinces count:', transformedProvinces.length)
      console.log('✅ First transformed province:', transformedProvinces[0])

      provincesCache.value = transformedProvinces
      
      // Không cache districts ở đây vì API mới không trả về districts trong provinces/getAll
      // Districts sẽ được load riêng từ districts/getByProvince khi cần

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
    
    // Chuẩn hóa provinceCode về format 2 chữ số
    const normalizedCode = String(provinceCode).padStart(2, '0')
    
    if (!districtsCache.value[normalizedCode]) {
      console.warn(`⚠️ getDistrictsByProvinceCode: No districts found in cache for province code ${normalizedCode}`)
      console.log('📋 Available province codes in cache:', Object.keys(districtsCache.value))
      return []
    }
    
    const districts = districtsCache.value[normalizedCode]
    console.log(`✅ getDistrictsByProvinceCode: Found ${districts.length} districts in cache for province ${normalizedCode}`)
    return districts
  }

  /**
   * Load districts cho một tỉnh thành từ API (nếu chưa có trong cache)
   */
  const loadDistrictsForProvince = async (provinceCode) => {
    if (!provinceCode) {
      return []
    }
    
    // Chuẩn hóa provinceCode về format 2 chữ số
    const normalizedCode = String(provinceCode).padStart(2, '0')
    
    // Nếu đã có trong cache, trả về ngay
    if (districtsCache.value[normalizedCode]) {
      console.log(`✅ loadDistrictsForProvince: Using cached districts for province ${normalizedCode}`)
      return districtsCache.value[normalizedCode]
    }
    
    // Nếu chưa có trong cache, load từ API mới
    console.log(`🔄 loadDistrictsForProvince: Loading districts for province ${normalizedCode} from API...`)
    try {
      // Gọi API mới để lấy districts theo province code
      const districtsData = await getDistrictsByProvince(normalizedCode)
      
      console.log('📦 Districts data from API:', {
        provinceCode: normalizedCode,
        districtsCount: districtsData?.length || 0,
        sampleDistrict: districtsData?.[0]
      })
      
      if (districtsData && Array.isArray(districtsData) && districtsData.length > 0) {
        districtsCache.value[normalizedCode] = districtsData.map(district => {
          const transformed = {
            code: district.code || district.district_id || district.id,
            name: district.name || district.district_name, // Name đầy đủ từ API
            codename: district.codename || district.slug,
            division_type: district.division_type || district.type,
            province_code: district.province_code || normalizedCode
          }
          
          // Chuẩn hóa code về format 3 chữ số (001, 002, ...)
          if (transformed.code) {
            transformed.code = String(transformed.code).padStart(3, '0')
          }
          
          return transformed
        })
        console.log(`✅ loadDistrictsForProvince: Loaded ${districtsCache.value[normalizedCode].length} districts for province ${normalizedCode}`)
        console.log('📋 Sample districts:', districtsCache.value[normalizedCode].slice(0, 5).map(d => `${d.name} (${d.division_type})`))
        return districtsCache.value[normalizedCode]
      } else {
        console.warn(`⚠️ loadDistrictsForProvince: No districts found for province ${normalizedCode}`)
        districtsCache.value[normalizedCode] = [] // Cache empty array để tránh gọi lại
        return []
      }
    } catch (err) {
      console.error(`❌ Error loading districts for province ${normalizedCode}:`, err)
      console.error('Error details:', err.response?.data || err.message)
      districtsCache.value[normalizedCode] = [] // Cache empty array để tránh gọi lại
      return []
    }
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

