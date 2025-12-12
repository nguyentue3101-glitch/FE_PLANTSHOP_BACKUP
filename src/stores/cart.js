import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { getCartOfUser, getCartDetail } from "@/api/cart/get"
import { addProductToCart } from "@/api/cart/post"
import { updateCartQuantity } from "@/api/cart/put"
import { removeProductFromCart } from "@/api/cart/delete"
import { useAuthStore } from "@/stores/auth"

export const useCartStore = defineStore("cart", () => {
  const authStore = useAuthStore()
  const cartItems = ref([])
  const cartId = ref(null)

  const loadCartFromBackend = async (userId) => {
    const token = authStore.accessToken
    try {
      const cartResponse = await getCartOfUser(userId, token)
      if (cartResponse.data.success) {
        cartId.value = cartResponse.data.data?.cart_id
      }
      if (!cartId.value) {
        cartItems.value = []
        return
      }
      const detailResponse = await getCartDetail(cartId.value, token)
      if (detailResponse.data.success) {
        const data = detailResponse.data.data || []
        cartItems.value = Array.isArray(data)
          ? data.map((item) => {
              const product = item.products
             
              const cartItem = {
                ...product,
                product_id: product.product_id,
                product_name: product.product_name,
                price: product.price || 0,
                img_url: product.img_url,
                quantity: item.quantity || 1, 
                cart_detail_id: item.cart_detail_id,
                selected: item.selected ?? true,
                stock: product.quantity || 0,
                out_of_stock: product.out_of_stock,
                products: product, 
                is_deleted: product._deleted,
              }
              
      
              return cartItem
            })
          : []
      } else {
        cartItems.value = []
      }
    } catch (error) {
      cartItems.value = []
      throw error
    }
  }

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product, quantity = 1) => {
    const userId = authStore.userId
    const productId = product.product_id
    const token = authStore.accessToken
    const response = await addProductToCart(userId, productId, quantity, token)

    if (response.data.success) {
      await loadCartFromBackend(userId)
    }

    return response
  }

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (cart_detail_id) => {
    const userId = authStore.userId

    const item = cartItems.value.find(
      (item) => item.cart_detail_id === cart_detail_id ,
      console.log(cart_detail_id)
    )

    const productId = item?.product_id 
    const token = authStore.accessToken
    const response = await removeProductFromCart(userId, productId, token)

    if (response.data.success) {
      await loadCartFromBackend(userId)
    }

    return response
  }

  // Cập nhật số lượng sản phẩm
  const updateQuantity = async (cart_detail_id, quantity, selected = null) => {
    const userId = authStore.userId
    const item = cartItems.value.find(
      (item) => item.cart_detail_id === cart_detail_id 
    )

    if (!item) return

    if (quantity <= 0) {
      return await removeFromCart(cart_detail_id)
    }

    const productId = item.product_id 
    const token = authStore.accessToken
    const response = await updateCartQuantity(userId, productId, quantity, token, selected)

    if (response.data.success) {
      await loadCartFromBackend(userId)
    }

    return response
  }


  // Kiểm tra sản phẩm có hết hàng hoặc ngưng kinh doanh không
  const isItemOutOfStockOrDeleted = (item) => {
    // Kiểm tra ngưng kinh doanh
    const deleted = item?._deleted ?? item?.is_deleted ?? item?.products?._deleted
    if (deleted === true || deleted === 1) {
      return true
    }

    // Kiểm tra flag out_of_stock từ backend
    const outOfStock = item?.out_of_stock ?? item?.products?.out_of_stock
    if (outOfStock === true || outOfStock === 1) {
      return true
    }

    // Kiểm tra stock = 0 hoặc stock < số lượng trong giỏ hàng
    const availableStock = item.stock ?? item.products?.quantity ?? 0
    const cartQuantity = item.quantity || 0

    // Nếu stock = 0 hoặc số lượng trong giỏ hàng lớn hơn stock hiện có
    if (availableStock === 0 || cartQuantity > availableStock) {
      return true
    }

    return false
  }

  //reduce sẽ khởi tạo sum=0 và duyệt từng item trong cartItems và cộng dồn
  // Tính tổng số lượng sản phẩm trong giỏ (loại trừ sản phẩm hết hàng hoặc ngưng kinh doanh)
  const totalItems = computed(() => {
    return cartItems.value.reduce((sum, item) => {
      // Bỏ qua sản phẩm hết hàng hoặc ngưng kinh doanh
      if (isItemOutOfStockOrDeleted(item)) {
        return sum
      }
      return sum + item.quantity
    }, 0)
  })

  // Tính tổng tiền
  const totalPrice = computed(() => {
    return cartItems.value.reduce((sum, item) => {
      const price = item.price 
      return sum + price * totalItems.value
    }, 0)
  })

  // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
  const isInCart = (productId) => {
    return cartItems.value.some((item) => item.product_id  === productId)
  }

  // Lấy số lượng sản phẩm trong giỏ hàng theo productId
  const getCartQuantity = (productId) => {
    const item = cartItems.value.find((item) => item.product_id === productId)
    return item ? item.quantity : 0
  }

  return {
    cartItems,
    cartId,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
    isInCart,
    getCartQuantity,
    loadCartFromBackend,
  }
})
