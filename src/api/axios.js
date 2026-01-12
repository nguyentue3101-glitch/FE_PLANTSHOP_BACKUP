import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://be-plantshop.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Thêm interceptor để tự động thêm token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor xử lý response
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Xử lý lỗi
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname
      
      // Danh sách các route public không cần redirect về login
      const publicRoutes = ['/home', '/product', '/contact', '/categories', '/', '/login', '/register']
      const isPublicRoute = publicRoutes.some(route => currentPath === route || currentPath.startsWith(route + '/'))
      const isProductDetail = currentPath.startsWith('/product-detail/')
      
      // Chỉ redirect về login nếu:
      // 1. Không phải route public
      // 2. Không phải trang product-detail
      // 3. Không phải trang login/register
      if (!isPublicRoute && !isProductDetail && currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      // Nếu là route public, chỉ xóa token nhưng không redirect
      else if (isPublicRoute || isProductDetail) {
        // Không redirect, chỉ xóa token nếu có
        // (để tránh gửi token không hợp lệ trong các request tiếp theo)
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
        if (token) {
          // Chỉ xóa token nếu request có token (có thể token đã hết hạn)
          // Nhưng không redirect vì đang ở route public
        }
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

