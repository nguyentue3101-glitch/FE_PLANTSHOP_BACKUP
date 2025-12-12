import axios from 'axios'

// API client riêng cho provinces.open-api.vn (không cần token)
const provincesApiClient = axios.create({
  baseURL: 'https://provinces.open-api.vn/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Lấy danh sách tất cả tỉnh thành (với districts và wards nếu cần)
 * @param {number} depth - Độ sâu dữ liệu: 0 = chỉ provinces, 1 = provinces + districts, 2 = provinces + districts + wards
 * @returns {Promise<Array>} Danh sách tỉnh thành
 */
export const getProvinces = async (depth = 2) => {
  try {
    // Sử dụng depth=2 để lấy districts (theo yêu cầu API)
    const response = await provincesApiClient.get('/', {
      params: { depth: depth || 2 }
    })
    // Axios trả về response.data
    const data = response.data || []
    
    // Debug: Kiểm tra structure của response
    if (Array.isArray(data) && data.length > 0) {
      console.log('🌐 API getProvinces response structure:', {
        totalProvinces: data.length,
        firstProvince: {
          code: data[0].code,
          name: data[0].name,
          hasDistricts: !!data[0].districts,
          districtsCount: data[0].districts?.length || 0,
          districtsSample: data[0].districts?.slice(0, 2) || []
        }
      })
    }
    
    return data
  } catch (error) {
    console.error('Error fetching provinces:', error)
    throw error
  }
}

/**
 * Lấy thông tin chi tiết của một tỉnh thành theo code
 * @param {number} provinceCode - Mã tỉnh thành
 * @param {number} depth - Độ sâu dữ liệu
 * @returns {Promise<Object>} Thông tin tỉnh thành
 */
export const getProvinceByCode = async (provinceCode, depth = 2) => {
  try {
    console.log(`🌐 Calling API: /p/${provinceCode}?depth=${depth}`)
    const response = await provincesApiClient.get(`/p/${provinceCode}`, {
      params: { depth }
    })
    const data = response.data || null
    
    // Debug response
    if (data) {
      console.log(`✅ API Response for province ${provinceCode}:`, {
        code: data.code,
        name: data.name,
        hasDistricts: !!data.districts,
        districtsCount: data.districts?.length || 0,
        districtsSample: data.districts?.slice(0, 3) || []
      })
    } else {
      console.warn(`⚠️ API returned null for province ${provinceCode}`)
    }
    
    return data
  } catch (error) {
    console.error(`❌ Error fetching province ${provinceCode} by code:`, error)
    console.error('Error response:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Lấy thông tin chi tiết của một quận/huyện theo code
 * @param {number} districtCode - Mã quận/huyện
 * @param {number} depth - Độ sâu dữ liệu
 * @returns {Promise<Object>} Thông tin quận/huyện
 */
export const getDistrictByCode = async (districtCode, depth = 2) => {
  try {
    const response = await provincesApiClient.get(`/d/${districtCode}`, {
      params: { depth }
    })
    return response.data || null
  } catch (error) {
    console.error('Error fetching district by code:', error)
    throw error
  }
}

/**
 * Tìm kiếm quận/huyện theo từ khóa
 * @param {string} query - Từ khóa tìm kiếm
 * @returns {Promise<Array>} Danh sách quận/huyện khớp
 */
export const searchDistricts = async (query) => {
  try {
    const response = await provincesApiClient.get('/d/search/', {
      params: { q: query }
    })
    return response.data || []
  } catch (error) {
    console.error('Error searching districts:', error)
    throw error
  }
}

