import { loginUser, logoutUser, registerUser, sendOtp, verifyOtp, sendOtpForForgotPassword, resetPasswordWithOtp } from "../api/auth/post"
import { changePassword as changePasswordAPI } from "../api/auth/put"
import { defineStore } from "pinia"
import { ref, computed } from "vue"

// giải mã JWT
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1] //tách chuỗi token tại dấu .
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/') //thay đổi nếu có kí tự - hoặc _
    const jsonPayload = decodeURIComponent( //giải mã  chuỗi đã encode theo URL
      atob(base64)
        .split('')
        // c là từng kí tự riêng lẻ trong chuỗi => % => 00 đảm bảo luôn ít nhất 2 chữ số => chuyển về mã số Unicode => sang hệ 16 => láy 2 kí tự cuối
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)) 
        .join('') //nối chuỗi
    )
    return JSON.parse(jsonPayload) //=>object
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref(localStorage.getItem('accessToken'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))

  // Hàm lưu token vào localStorage
  const saveTokens = (access, refresh) => {
    if (access) {
      localStorage.setItem('accessToken', access)
      accessToken.value = access
    }
    if (refresh) {
      localStorage.setItem('refreshToken', refresh)
      refreshToken.value = refresh
    }
  }

  // Hàm xóa token khỏi localStorage
  const clearTokens = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    accessToken.value = null
    refreshToken.value = null
  }

  // Kiểm tra access token đã hết hạn hay chưa
  const isAccessTokenExpired = computed(() => {
    if (!accessToken.value) return true
    try {
      const decoded = decodeJWT(accessToken.value)
      const exp = decoded?.exp
      if (!exp) return true
      return Date.now() >= exp * 1000
    } catch (error) {
      console.error('Error decoding token:', error)
      return true
    }
  })

  // check user login: token tồn tại và chưa expired
  const isAuthenticated = computed(() => {
    if (!accessToken.value) return false
    return !isAccessTokenExpired.value
  })

  // Thử refresh access token bằng refresh token (trả về true nếu refresh thành công)
  const refreshAccessToken = async () => {
    if (!refreshToken.value) return false
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken.value}`,
          'Content-Type': 'application/json'
        }
      })
      if (!resp.ok) {
        clearTokens()
        return false
      }
      const data = await resp.json()
      const newAccess = data?.data?.accessToken || data?.accessToken || null
      const newRefresh = data?.data?.refreshToken || data?.refreshToken || null
      if (newAccess) {
        saveTokens(newAccess, newRefresh)
        return true
      }
      clearTokens()
      return false
    } catch (error) {
      console.error('Refresh token error:', error)
      clearTokens()
      return false
    }
  }

  // lấy role từ JWT token
  const userRole = computed(() => {
    if (!accessToken.value) return null
    const decoded = decodeJWT(accessToken.value)
    return decoded?.role || null
  })

  //  lấy userId từ JWT token
  const userId = computed(() => {
    if (!accessToken.value) return null
    const decoded = decodeJWT(accessToken.value)
    return decoded?.sub || null
  })

  const registerUsers = async(email, username, password, otpCode, role = null)=>{
    try {
      const response = await registerUser(email, username, password, otpCode, role)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Gửi OTP đến email (cho đăng ký - cần username, email, password)
  const sendOtpToEmail = async (username, email, password) => {
    try {
      const response = await sendOtp(username, email, password)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Xác thực OTP (optional)
  const verifyOtpCode = async (email, otpCode) => {
    try {
      const response = await verifyOtp(email, otpCode)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const loginUsers = async (email, password) => {
    try {
      const response = await loginUser(email, password)
      if (!response.success) {
        throw new Error(response.message || 'Đăng nhập thất bại')
      }
      saveTokens(response.data.accessToken, response.data.refreshToken)
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const logout = async () => {
    try {
      if (accessToken.value) {
        await logoutUser(accessToken.value)
      }
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      clearTokens()
    }
  }

  // Logout ngay lập tức, clear toàn bộ trạng thái người dùng và redirect về login
  const logoutImmediate = async () => {
    try {
      // Xóa token
      clearTokens()
      // Clear user info and cart if possible
      try {
        const { useUserStore } = await import('./user')
        const userStore = useUserStore()
        userStore.userInfo = null
      } catch {
        // ignore
      }
      try {
        const { useCartStore } = await import('./cart')
        const cartStore = useCartStore()
        cartStore.cartItems = []
        cartStore.cartId = null
      } catch {
        // ignore
      }
    } catch (error) {
      console.error('logoutImmediate error:', error)
    } finally {
      // Redirect to login page
      try {
        window.location.href = '/login'
      } catch {
        // ignore
      }
    }
  }

  const loginWithGoogle = async (code) => {
    try {
      const { loginWithGoogle: loginGoogleAPI } = await import('../api/auth/post')
      const response = await loginGoogleAPI(code)
      
      saveTokens(response.data.accessToken, response.data.refreshToken)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const changePassword = async (oldPassword, newPassword, token) => {
    try {
      const response = await changePasswordAPI(oldPassword, newPassword, token)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Gửi OTP cho quên mật khẩu
  const sendOtpForForgotPasswordStore = async (email) => {
    try {
      const response = await sendOtpForForgotPassword(email)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Reset password với OTP
  const resetPasswordWithOtpStore = async (email, otpCode, newPassword) => {
    try {
      const response = await resetPasswordWithOtp(email, otpCode, newPassword)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  return { accessToken, refreshToken, userRole, userId, isAuthenticated, isAccessTokenExpired, saveTokens, clearTokens, refreshAccessToken, logoutImmediate, registerUsers, loginUsers, logout, loginWithGoogle, changePassword, sendOtpToEmail, verifyOtpCode, sendOtpForForgotPasswordStore, resetPasswordWithOtpStore }
})
