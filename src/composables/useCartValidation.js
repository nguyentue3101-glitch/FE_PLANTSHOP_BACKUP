import { useCartStore } from '@/stores/cart'

/**
 * Composable để kiểm tra số lượng sản phẩm trong giỏ hàng
 * @returns {Object} Các hàm và state để kiểm tra số lượng
 */
export function useCartValidation() {
  const cartStore = useCartStore()

  /**
   * Kiểm tra số lượng sản phẩm có thể thêm vào giỏ hàng
   * @param {Object} product - Sản phẩm cần kiểm tra
   * @param {number} quantityToAdd - Số lượng muốn thêm
   * @returns {Object} Kết quả kiểm tra
   *   - canAdd: boolean - Có thể thêm vào giỏ hàng không
   *   - isMaxQuantity: boolean - Đã đạt số lượng tối đa trong kho chưa
   *   - willExceed: boolean - Thêm vào sẽ vượt quá stock không
   *   - currentCartQuantity: number - Số lượng hiện có trong giỏ hàng
   *   - maxStock: number - Số lượng tối đa trong kho
   *   - totalQuantity: number - Tổng số lượng sau khi thêm
   */
  const validateCartQuantity = (product, quantityToAdd = 1) => {
    if (!product || !product.product_id) {
      return {
        canAdd: false,
        isMaxQuantity: false,
        willExceed: false,
        currentCartQuantity: 0,
        maxStock: 0,
        totalQuantity: 0
      }
    }

    const currentCartQuantity = cartStore.getCartQuantity(product.product_id)
    const maxStock = product.quantity || 0
    const totalQuantity = currentCartQuantity + quantityToAdd

    // Đã đạt số lượng tối đa trong kho
    const isMaxQuantity = currentCartQuantity >= maxStock

    // Thêm vào sẽ vượt quá stock
    const willExceed = totalQuantity > maxStock

    // Có thể thêm vào giỏ hàng
    const canAdd = !isMaxQuantity && !willExceed

    return {
      canAdd,
      isMaxQuantity,
      willExceed,
      currentCartQuantity,
      maxStock,
      totalQuantity
    }
  }

  return {
    validateCartQuantity
  }
}

