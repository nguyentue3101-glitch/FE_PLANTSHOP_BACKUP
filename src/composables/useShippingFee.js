/**
 * Composable để tính phí vận chuyển
 */
export function useShippingFee() {
  const HCM_PROVINCE_CODE = 79

  /**
   * Kiểm tra xem có phải thành phố Hồ Chí Minh không (dựa vào cityId)
   * @param {number|null} cityId - Mã thành phố
   * @returns {boolean}
   */
  const isHoChiMinhCity = (cityId) => {
    if (!cityId) return false
    return parseInt(cityId) === HCM_PROVINCE_CODE
  }

  /**
   * Tính phí ship theo thành phố
   * - Thành phố Hồ Chí Minh (cityId = 79): 70,000 VNĐ
   * - Tất cả các tỉnh thành khác: 100,000 VNĐ
   * 
   * @param {Object} options - Các tùy chọn
   * @param {number|null} options.cityId - Mã thành phố
   * @returns {number} Phí ship (VNĐ)
   */
  const calculateShippingFeeByCity = ({ cityId = null } = {}) => {
    // Lấy city_id từ sessionStorage nếu không có trong options
    let finalCityId = cityId
    if (!finalCityId) {
      const shippingCityId = sessionStorage.getItem('shipping_city_id')
      if (shippingCityId) {
        finalCityId = parseInt(shippingCityId)
      }
    }

    // Tính phí ship dựa vào city_id
    if (isHoChiMinhCity(finalCityId)) {
      return 70000 // Hồ Chí Minh
    } else {
      return 100000 // Tất cả các tỉnh thành khác
    }
  }

  /**
   * Tính phí ship từ order object (tính theo cityId từ order hoặc sessionStorage)
   * @param {Object} order - Order object
   * @param {Array} orderDetails - Danh sách order details (không sử dụng, chỉ để tương thích)
   * @returns {number} Phí ship (VNĐ)
   */
  const getShippingFeeFromOrder = (order, orderDetails = null) => {
    // Lấy cityId từ order object nếu có
    const cityId = order?.city_id || null
    
    // Tính phí ship dựa vào cityId
    return calculateShippingFeeByCity({ cityId })
  }

  return {
    isHoChiMinhCity,
    calculateShippingFeeByCity,
    getShippingFeeFromOrder
  }
}

