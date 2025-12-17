import axios from 'axios'

const provincesApiClient = axios.create({
  baseURL: 'https://vn-public-apis.fpo.vn',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // Timeout 10 giây
})

// Cache và promise đang pending để tránh gọi API nhiều lần
let provincesCache = null
let pendingRequest = null

export const getProvinces = async (useCache = true) => {
  // Nếu đã có cache và cho phép dùng cache, trả về ngay
  if (useCache && provincesCache) {
    return provincesCache
  }
  
  // Nếu đang có request đang pending, đợi request đó
  if (pendingRequest) {
    return pendingRequest
  }
  
  // Tạo request mới
  pendingRequest = (async () => {
    try {
      // API mới: /provinces/getAll?limit=-1 để lấy tất cả
      const response = await provincesApiClient.get('/provinces/getAll', {
        params: { limit: -1 }
      })
      
      // Debug: Log toàn bộ response để kiểm tra format
      console.log('🔍 Response.data.data:', response.data?.data)
      
      // API mới trả về format: {exitcode: 1, data: [...], message: '...'}
      let data = response.data
      
      // Kiểm tra và lấy data từ response
      if (data && data.data) {
        if (Array.isArray(data.data)) {
          // Format: { data: [...] }
          data = data.data
        } else if (data.data && typeof data.data === 'object') {
          // Có thể data.data là object chứa array
          if (data.data.data && Array.isArray(data.data.data)) {
            data = data.data.data
          } else if (data.data.results && Array.isArray(data.data.results)) {
            data = data.data.results
          } else {
            data = []
          }
        }
      } else if (data && Array.isArray(data)) {
        // Format: trực tiếp là array
        console.log('✅ Response.data is directly an array')
        // Giữ nguyên
      } else {
        console.warn('⚠️ Unexpected API response format:', data)
        data = []
      }
      
      // Lưu vào cache
      provincesCache = data
      
      // Debug: Kiểm tra structure của response
      // if (Array.isArray(data) && data.length > 0) {
      //   console.log('🌐 API getProvinces response structure:', {
      //     totalProvinces: data.length,
      //     firstProvince: data[0],
      //     firstProvinceKeys: Object.keys(data[0]),
      //     hasDistricts: !!data[0].districts,
      //     districtsCount: data[0].districts?.length || 0,
      //     sampleDistrict: data[0].districts?.[0]
      //   })
      // } else {
      //   console.warn('⚠️ No provinces data found in response')
      // }
      
      return data
    } catch (error) {
      // Nếu lỗi 429, đợi một chút rồi retry
      if (error.response?.status === 429) {
        console.warn('⚠️ Rate limited (429), waiting 2 seconds before retry...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        // Retry một lần
        try {
          const response = await provincesApiClient.get('/provinces/getAll', {
            params: { limit: -1 }
          })
          let data = response.data
          if (data && data.data && Array.isArray(data.data)) {
            data = data.data
          } else if (!Array.isArray(data)) {
            data = []
          }
          provincesCache = data
          return data
        } catch (retryError) {
          console.error('Error fetching provinces (retry failed):', retryError)
          throw retryError
        }
      }
      console.error('Error fetching provinces:', error)
      throw error
    } finally {
      // Xóa pending request
      pendingRequest = null
    }
  })()
  
  return pendingRequest
}

/**
 * Lấy danh sách quận/huyện theo mã tỉnh thành
 * @param {string|number} provinceCode - Mã tỉnh thành (ví dụ: '01', 1)
 * @returns {Promise<Array>} Danh sách quận/huyện
 */
export const getDistrictsByProvince = async (provinceCode) => {
  try {
    if (!provinceCode) {
      return []
    }
    
    // Chuyển đổi provinceCode sang string và đảm bảo có format đúng (01, 02, ...)
    const codeStr = String(provinceCode).padStart(2, '0')
    
    console.log(`🌐 Fetching districts for province code: ${codeStr}`)
    
    const response = await provincesApiClient.get('/districts/getByProvince', {
      params: { 
        provinceCode: codeStr,
        limit: -1 
      }
    })
    
    // Debug: Log toàn bộ response để kiểm tra format
    console.log('Response.data.data:', response.data?.data)
    
    // Xử lý response tương tự như getProvinces
    // API trả về format: {exitcode: 1, data: [...], message: '...'}
    let data = response.data
    
    // Kiểm tra và lấy data từ response
    if (data && data.data) {
      if (Array.isArray(data.data)) {
        // Format: { data: [...] }
        data = data.data
      } else if (data.data && typeof data.data === 'object') {
        // Có thể data.data là object chứa array
        if (data.data.data && Array.isArray(data.data.data)) {
          data = data.data.data
        } else if (data.data.results && Array.isArray(data.data.results)) {
          data = data.data.results
        } else {
          data = []
        }
      }
    } else if (data && Array.isArray(data)) {
      // Format: trực tiếp là array
      // Giữ nguyên
    } else {
      data = []
    }
    
    if (data.length > 0) {
      console.log('Sample district:', data[0])
    }
    return data
  } catch (error) {
    throw error
  }
}

/**
 * Lấy thông tin chi tiết của một tỉnh thành theo code
 * @param {number} provinceCode - Mã tỉnh thành
 * @returns {Promise<Object>} Thông tin tỉnh thành
 */
export const getProvinceByCode = async (provinceCode) => {
  try {
    // Sử dụng cache để tránh gọi API lại
    const allProvinces = await getProvinces(true) // Dùng cache
    const province = allProvinces.find(p => {
      const pCode = String(p.code || p.province_id || p.id || '').padStart(2, '0')
      const searchCode = String(provinceCode).padStart(2, '0')
      return pCode === searchCode || 
             p.code === provinceCode || 
             p.province_id === provinceCode ||
             p.id === provinceCode
    })
    
    if (province) {
      return province
    } else {
      return null
    }
  } catch (error) {
    throw error
  }
}


export const getDistrictByCode = async (districtCode, provinceCode = null) => {
  try {
    // Nếu có provinceCode, chỉ tìm trong province đó
    if (provinceCode) {
      const districts = await getDistrictsByProvince(provinceCode)
      const district = districts.find(d => {
        const dCode = String(d.code || d.district_id || d.id || '').padStart(3, '0')
        const searchCode = String(districtCode).padStart(3, '0')
        return dCode === searchCode ||
               d.code === districtCode || 
               d.district_id === districtCode ||
               d.id === districtCode
      })
      if (district) {
        return district
      }
    } else {
      // Nếu không có provinceCode, tìm trong tất cả provinces
      const allProvinces = await getProvinces(true) // Dùng cache
      
      for (const province of allProvinces) {
        const provinceCodeForSearch = String(province.code || province.province_id || province.id).padStart(2, '0')
        const districts = await getDistrictsByProvince(provinceCodeForSearch)
        const district = districts.find(d => {
          const dCode = String(d.code || d.district_id || d.id || '').padStart(3, '0')
          const searchCode = String(districtCode).padStart(3, '0')
          return dCode === searchCode ||
                 d.code === districtCode || 
                 d.district_id === districtCode ||
                 d.id === districtCode
        })
        if (district) {
          return district
        }
      }
    }
    
    console.warn(`⚠️ District ${districtCode} not found`)
    return null
  } catch (error) {
    console.error('Error fetching district by code:', error)
    throw error
  }
}


