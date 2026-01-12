import { ref, computed } from 'vue'
import { getProvinces } from '@/api/location/get'

const provincesCache = ref(null)
const districtsCache = ref({})
const isLoading = ref(false)
const error = ref(null)



export function useProvinces() {
  const loadProvinces = async () => {

    try {
      // Gọi API với depth=2 
      const data = await getProvinces(2)
            
      // Transform dữ liệu từ API để sau này api có thể thay đổi cấu trúc
      const transformedProvinces = data.map(province => ({
        code: province.code,
        name: province.name,
        codename: province.codename,
        division_type: province.division_type,
        phone_code: province.phone_code,
        districts: province.districts || []
      }))

      provincesCache.value = transformedProvinces
      
      // với version api mới thì khi gọi depth=2 nó sẽ trả về luôn districts trong mỗi province
      transformedProvinces.forEach(province => {
        if (province.districts && province.districts.length > 0) {
          districtsCache.value[province.code] = province.districts.map(district => ({
            code: district.code,
            name: district.name, 
            codename: district.codename,
            division_type: district.division_type,
            province_code: district.province_code
          }))
        } else {
          console.warn(` No districts found for province ${province.code} (${province.name})`)
        }
      })

      console.log("dữ liệu thành phố và tỉnh thành trong cache:", provincesCache.value);
      console.log("dữ liệu quận huyện trong cache:", districtsCache.value);

      return transformedProvinces
    } catch (err) {
      error.value = err.message || 'Không thể tải danh sách tỉnh thành'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Lấy danh sách tỉnh thành (computed)
   */
  const provinces = computed(() => {
    console.log("vào được đây gòi provincesCache:", provincesCache.value);
    return provincesCache.value || []
  })


  const loadDistrictsForProvince = async (provinceCode) => {
    if (!provinceCode) {
      return []
    }
    
    // lấy dữ liệu từ cache
    if (districtsCache.value[provinceCode]) {
      console.log(`loadDistrictsForProvince: Dùng dữ liệu trong cache ${provinceCode}`)
      return districtsCache.value[provinceCode]
    }
    
    console.warn(` loadDistrictsForProvince: ko tìm được quận huyện với mã ${provinceCode}`)
    return []
  }

  //tìm tinh thành theo code khi user chọn tỉnh thành và fulladdress cần hiện tên tỉnh thành
  const getProvinceByCode = (code) => {
    if (!provincesCache.value) return null
    return provincesCache.value.find(p => p.code === code) || null
  }

  
  //tìm quận huyện theo code khi user chọn quận huyện và fulladdress cần hiện tên quận huyện
  const getDistrictByCode = (districtCode) => {
    console.log("tìm quận huyện theo code:", districtCode);
    for (const districts of Object.values(districtsCache.value)) {
      const district = districts.find(d => d.code === districtCode)
      if (district) return district
    }
    return null
  }

  /**
   * Clear cache
   */
  // const clearCache = () => {
  //   provincesCache.value = null
  //   districtsCache.value = {}
  // }

  return {
    provinces,
    isLoading,
    error,
    loadProvinces,
    // getDistrictsByProvinceCode,
    loadDistrictsForProvince,
    getProvinceByCode,
    getDistrictByCode,
    // clearCache
  }
}
