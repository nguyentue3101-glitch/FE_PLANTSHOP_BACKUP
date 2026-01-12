/**
 * Composable để tính phí vận chuyển
 */
export function useShippingFee() {
  const HCM_PROVINCE_CODE = 79


  const isHoChiMinhCity = (cityId) => {
    if (!cityId) return false
    return parseInt(cityId) === HCM_PROVINCE_CODE
  }


  const calculateShippingFeeByCity = ({ cityId = null, orderId = null } = {}) => {
    // Lấy city_id từ tham số truyền vào
    let finalCityId = cityId
    console.log('calculateShippingFeeByCity - cityId truyền vào:', cityId, 'orderId:', orderId)

    // Tính phí ship dựa vào city_id
    return isHoChiMinhCity(finalCityId) ? 70000 : 100000
  }
  
  // Hàm helper để lưu city_id vào localStorage khi tạo order
  const saveOrderCityId = (orderId, cityId) => {
    if (orderId && cityId) {
      localStorage.setItem(`order_${orderId}_city_id`, cityId.toString())
    }
  }

 
  const getShippingFeeFromOrder = (order = null) => {
    // Lấy cityId từ order object nếu có
    let cityId = order?.city_id || null
    
    // Nếu không có city_id trong order, thử lấy từ localStorage (lưu khi tạo order)
    if (!cityId && order?.order_id) {
      const localStorageKey = `order_${order.order_id}_city_id`
      const storedCityId = localStorage.getItem(localStorageKey)
      if (storedCityId) {
        cityId = parseInt(storedCityId)
      }
    }
    
    // Tính phí ship dựa vào cityId và orderId (để calculateShippingFeeByCity có thể đọc lại từ localStorage nếu cần)
    return calculateShippingFeeByCity({ cityId, orderId: order?.order_id || null })
  }

  return {
    isHoChiMinhCity,
    calculateShippingFeeByCity,
    getShippingFeeFromOrder,
    saveOrderCityId
  }
}

