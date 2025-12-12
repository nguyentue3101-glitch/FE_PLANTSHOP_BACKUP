import { ref } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Composable để quản lý modal yêu cầu đăng nhập
 * @returns {Object} State và methods để quản lý modal đăng nhập
 */
export function useLoginModal() {
  const router = useRouter()
  const showLoginModal = ref(false)

  /**
   * Mở modal đăng nhập
   */
  const openLoginModal = () => {
    showLoginModal.value = true
  }

  /**
   * Đóng modal đăng nhập
   */
  const closeLoginModal = () => {
    showLoginModal.value = false
  }

  /**
   * Xác nhận và chuyển đến trang đăng nhập
   */
  const confirmLogin = () => {
    showLoginModal.value = false
    router.push('/login')
  }

  return {
    showLoginModal,
    openLoginModal,
    closeLoginModal,
    confirmLogin
  }
}

