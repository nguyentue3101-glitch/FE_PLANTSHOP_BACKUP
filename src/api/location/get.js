import axios from 'axios'
const provincesApiClient = axios.create({
  baseURL: 'https://provinces.open-api.vn/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Lấy danh sách tất cả tỉnh thành và quận/huyện (depth=2)
export const getProvinces = async (depth = 2) => {
  try {
    // Sử dụng depth=2 
    const response = await provincesApiClient.get('/', {
      params: { depth: depth || 2 }
    })
    const data = response.data || []
    
   console.log("lấy được api gòi:", data);
    
    return data
  } catch (error) {
    console.error('Error fetching provinces:', error)
    throw error
  }
}

//  Lấy thông tin chi tiết của một tỉnh thành theo code
// export const getProvinceByCode = async (provinceCode, depth = 2) => {
//   try {
//     const response = await provincesApiClient.get(`/p/${provinceCode}`, {
//       params: { depth }
//     })
//     const data = response.data || null
    
//     // Debug response
//     if (data) {
//       console.log(`kết quả API trả về ${provinceCode}:`, {
//         code: data.code,
//         name: data.name,
//         hasDistricts: !!data.districts,
//         districtsCount: data.districts?.length || 0,
//         districtsSample: data.districts?.slice(0, 3) || []
//       })
//     } else {
//       console.warn(`⚠️ API returned null for province ${provinceCode}`)
//     }
    
//     return data
//   } catch (error) {
//     console.error(`Error fetching province ${provinceCode} by code:`, error)
//   }
// }

// /**
//  * Lấy thông tin chi tiết của một quận/huyện theo code
//  * @param {number} districtCode - Mã quận/huyện
//  * @param {number} depth - Độ sâu dữ liệu
//  * @returns {Promise<Object>} Thông tin quận/huyện
//  */
// export const getDistrictByCode = async (districtCode, depth = 2) => {
//   try {
//     const response = await provincesApiClient.get(`/d/${districtCode}`, {
//       params: { depth }
//     })
//     return response.data || null
//   } catch (error) {
//     console.error('Error fetching district by code:', error)
//     throw error
//   }
// }

// /**
//  * Tìm kiếm quận/huyện theo từ khóa
//  * @param {string} query - Từ khóa tìm kiếm
//  * @returns {Promise<Array>} Danh sách quận/huyện khớp
//  */
// export const searchDistricts = async (query) => {
//   try {
//     const response = await provincesApiClient.get('/d/search/', {
//       params: { q: query }
//     })
//     return response.data || []
//   } catch (error) {
//     console.error('Error searching districts:', error)
//     throw error
//   }
// }
