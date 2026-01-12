<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4 max-w-6xl">
            <BackButton />
            <h1 class="text-3xl font-bold text-green-700 mb-6 text-center">
                Đánh giá sản phẩm
                <span v-if="currentOrder" class="block text-lg text-gray-600 mt-2">
                    Đơn hàng #{{ currentOrder.order_id }}
                </span>
            </h1>

            <!-- Loading and Error State -->
            <LoadingErrorState :isLoading="isLoading" :errorMessage="errorMessage" loadingMessage="Đang tải sản phẩm..."
                @reset-error="resetError" />

            <!-- Empty State -->
            <div v-if="!isLoading && !errorMessage && productsToReview.length === 0"
                class="text-center py-16 bg-white rounded-lg shadow">
                <div class="mb-4">
                    <Star class="mx-auto h-24 w-24 text-gray-400" />
                </div>
                <p class="text-xl text-gray-600 mb-4">Đơn hàng này không có sản phẩm nào</p>
                <router-link to="/order-history"
                    class="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    Quay lại lịch sử đơn hàng
                </router-link>
            </div>

            <!-- Products to Review -->
            <div v-if="!isLoading && !errorMessage && productsToReview.length > 0" class="space-y-6">
                <div v-for="productItem in productsToReview" :key="`${productItem.product_id}-${productItem.order_id}`"
                    class="bg-white rounded-lg shadow p-6">
                    <div class="flex flex-col md:flex-row gap-4 mb-4">
                        <!-- Product Image -->
                        <img :src="getProductImage(productItem.product)" :alt="getProductName(productItem.product)"
                            class="w-24 h-24 object-contain bg-gray-100 rounded-lg" @error="handleImageError($event)" />

                        <!-- Product Info -->
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">
                                {{ getProductName(productItem.product) }}
                            </h3>
                            <p class="text-sm text-gray-600 mb-1">
                                Đơn hàng: #{{ productItem.order_id }}
                            </p>
                            <p class="text-sm text-gray-600">
                                Số lượng: {{ productItem.quantity }}
                            </p>
                        </div>
                    </div>

                    <!-- Review Form -->
                    <div v-if="!productItem.hasReview" class="border-t pt-4">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Đánh giá của bạn:
                            </label>
                            <StarRating v-model="productItem.rating" :disabled="productItem.isSubmitting" />
                        </div>

                        <div class="mb-4">
                            <label :for="`comment-${productItem.product_id}`"
                                class="block text-sm font-medium text-gray-700 mb-2">
                                Nhận xét (tùy chọn):
                            </label>
                            <textarea :id="`comment-${productItem.product_id}`" v-model="productItem.comment" rows="3"
                                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                :disabled="productItem.isSubmitting"></textarea>
                        </div>

                        <div v-if="productItem.reviewError" class="mb-2 text-red-600 text-sm">
                            {{ productItem.reviewError }}
                        </div>

                        <!-- Submit Single Review Button -->
                        <div class="flex justify-end mt-4">
                            <button type="button"
                                @click="productItem.isEditing ? handleUpdateReview(productItem) : handleCreateReview(productItem)"
                                :disabled="!canSubmitSingle(productItem) || productItem.isSubmitting"
                                class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer font-semibold">
                                {{ productItem.isSubmitting ? 'Đang gửi...' : (productItem.isEditing ? 'Cập nhật đánh giá' : 'Gửi đánh giá') }}
                            </button>
                        </div>
                    </div>

                    <!-- Already Reviewed -->
                    <div v-else class="border-t pt-4">
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <p class="text-sm text-gray-600 mb-2">Bạn đã đánh giá sản phẩm này</p>
                                <StarRating :model-value="productItem.existingReview?.rating || 0" :disabled="true" />
                                <p v-if="productItem.existingReview?.comment" class="mt-2 text-gray-700">
                                    {{ productItem.existingReview.comment }}
                                </p>
                                <div v-if="productItem.reviewError" class="mt-2 text-red-600 text-sm">
                                    {{ productItem.reviewError }}
                                </div>
                            </div>
                            <div class="flex gap-2 ml-4">
                                <button type="button" @click="handleEditReview(productItem)"
                                    class="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                                    Sửa đánh giá
                                </button>
                                <button type="button" @click="handleDeleteReview(productItem)"
                                    :disabled="productItem.isDeleting"
                                    class="px-4 py-2 text-red-600 hover:text-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                    {{ productItem.isDeleting ? 'Đang xóa...' : 'Xóa đánh giá' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrderStore } from '@/stores/orders'
import { useReviewStore } from '@/stores/reviews'
import { useAsyncOperation } from '@/composables/useAsyncOperation'
import LoadingErrorState from '@/components/common/LoadingErrorState.vue'
import BackButton from '@/components/common/user/BackButton.vue'
import StarRating from '@/components/common/user/StarRating.vue'
import { Star } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const orderStore = useOrderStore()
const reviewStore = useReviewStore()
const { isLoading, errorMessage, executeAsync, resetError } = useAsyncOperation()

const currentOrder = ref(null)
const productsToReview = ref([])

// lấy danh sách sản phẩm trong đơn hàng để đánh giá
const loadProductsToReview = async () => {
    const userId = authStore.userId
    const orderId = route.params.orderId

    if (!userId) {
        router.push('/login')
        return
    }

    if (!orderId) {
        router.push('/order-history')
        return
    }

    await executeAsync(async () => {
        // Load order by ID
        await orderStore.getOrderByIdStore(orderId)
        const order = orderStore.currentOrder

        if (!order) {
            errorMessage.value = 'Không tìm thấy đơn hàng!'
            return
        }

        // Check if order is DELIVERED
        if (order.shipping_status !== 'DELIVERED') {
            errorMessage.value = 'Chỉ có thể đánh giá đơn hàng đã được giao thành công!'
            return
        }

        // Check if order belongs to current user
        const orderUserId = order.user_id || order.user?.user_id
        if (orderUserId && String(orderUserId) !== String(userId)) {
            errorMessage.value = 'Bạn không có quyền xem đơn hàng này!'
            return
        }

        currentOrder.value = order

        // lấy chi tiết đơn hàng nếu có lỗi
        if (!order.order_details || order.order_details.length === 0) {
            await orderStore.getOrderDetailsByOrderIdStore(order.order_id)
            order.order_details = orderStore.currentOrderDetails
        }

        // lấy danh sách đánh giá của user
        await reviewStore.getReviewsByUserIdStore(userId)
        const userReviews = reviewStore.userReviews || []

        // Tạo danh sách productsToReview
        productsToReview.value = []

        if (order.order_details && order.order_details.length > 0) {
            for (const detail of order.order_details) {
                const productId = detail.product?.product_id || detail.product_id
                const orderDetailId = detail.order_detail_id

                // Mỗi lần mua (mỗi order_detail_id) sẽ có một đánh giá riêng
                const existingReview = userReviews.find(
                    r => {
                        const reviewOrderDetailId = r.order_detail_id || r.orderDetailId
                        return reviewOrderDetailId && String(reviewOrderDetailId) === String(orderDetailId)
                    }
                )

                productsToReview.value.push({
                    product_id: productId,
                    product: detail.product,
                    order_id: order.order_id,
                    order_detail_id: orderDetailId,
                    quantity: detail.quantity,
                    rating: existingReview ? (existingReview.rating || 0) : 0,
                    comment: existingReview ? (existingReview.comment || '') : '',
                    hasReview: !!existingReview,
                    existingReview: existingReview || null,
                    isEditing: false,
                    editingReviewId: null,
                    isSubmitting: false,
                    isDeleting: false,
                    reviewError: ''
                })
            }
        }
    }, {
        defaultErrorMessage: 'Không thể tải danh sách sản phẩm!',
        onError: (error) => {
            errorMessage.value = error.response?.data?.message || error.message
        }
    })
}

// Kiểm tra xem có thể submit đánh giá cho từng sản phẩm hay không
const canSubmitSingle = (productItem) => {
    return productItem.rating > 0
}

// Hàm tạo đánh giá mới
const handleCreateReview = async (productItem) => {
    if (productItem.rating === 0) {
        productItem.reviewError = 'Vui lòng chọn số sao đánh giá!'
        return
    }

    if (!productItem.order_detail_id) {
        productItem.reviewError = 'Không tìm thấy thông tin chi tiết đơn hàng!'
        return
    }

    productItem.isSubmitting = true
    productItem.reviewError = ''

    try {
        const reviewData = {
            product_id: productItem.product_id,
            order_detail_id: productItem.order_detail_id,
            rating: productItem.rating,
            comment: productItem.comment || ''
        }


        await reviewStore.createReviewStore(reviewData)
        console.log('Đã tạo đánh giá mới thành công')

        // Reset editing state
        productItem.isEditing = false
        productItem.editingReviewId = null

        // tải lại đánh giá của user và sản phẩm để cập nhật trạng thái hasReview
        const userId = authStore.userId
        if (userId) {
            await reviewStore.getReviewsByUserIdStore(userId)
        }
        await loadProductsToReview()
    } catch (error) {
        console.error(' Lỗi khi tạo đánh giá:', error)
        productItem.reviewError = error.response?.data?.message || error.message || 'Không thể tạo đánh giá!'
    } finally {
        productItem.isSubmitting = false
    }
}

// Hàm cập nhật đánh giá
const handleUpdateReview = async (productItem) => {
    if (productItem.rating === 0) {
        productItem.reviewError = 'Vui lòng chọn số sao đánh giá!'
        return
    }

    // Validate order_detail_id
    if (!productItem.order_detail_id) {
        productItem.reviewError = 'Không tìm thấy thông tin chi tiết đơn hàng!'
        return
    }

    // Lấy review_id từ editingReviewId hoặc existingReview
    const reviewId = productItem.editingReviewId ||
        productItem.existingReview?.review_id 

    if (!reviewId) {
        productItem.reviewError = 'Không tìm thấy mã đánh giá để cập nhật!'
        return
    }

    productItem.isSubmitting = true
    productItem.reviewError = ''

    try {
        const reviewData = {
            product_id: productItem.product_id,
            order_detail_id: productItem.order_detail_id,
            rating: productItem.rating,
            comment: productItem.comment || ''
        }

        await reviewStore.updateReviewStore(reviewId, reviewData)
        console.log(' Đã cập nhật đánh giá thành công')

        // Reset editing state
        productItem.isEditing = false
        productItem.editingReviewId = null

        // tải lại đánh giá của user và sản phẩm để cập nhật trạng thái hasReview
        const userId = authStore.userId
        if (userId) {
            await reviewStore.getReviewsByUserIdStore(userId)
        }
        await loadProductsToReview()
    } catch (error) {
        console.error('Lỗi khi cập nhật đánh giá:', error)
        productItem.reviewError = error.response?.data?.message || error.message || 'Không thể cập nhật đánh giá!'
    } finally {
        productItem.isSubmitting = false
    }
}

// Handle edit review
const handleEditReview = (productItem) => {
    if (productItem.existingReview) {
        const reviewId = productItem.existingReview.review_id || productItem.existingReview.id
        console.log('Bắt đầu sửa đánh giá:', {
            review_id: reviewId,
            existingReview: productItem.existingReview
        })

        // Lưu review_id vào productItem để đảm bảo không bị mất
        productItem.editingReviewId = reviewId

        // Set flag isEditing để phân biệt create và update
        productItem.isEditing = true

        // Giữ nguyên existingReview để đảm bảo có review_id khi submit
        // Chỉ cập nhật rating và comment để hiển thị trong form
        productItem.rating = productItem.existingReview.rating
        productItem.comment = productItem.existingReview.comment || ''

        // Set hasReview = false để hiển thị form edit
        productItem.hasReview = false

        console.log(' Đã chuẩn bị sửa đánh giá:', {
            review_id: reviewId,
            editingReviewId: productItem.editingReviewId,
            isEditing: productItem.isEditing,
            existingReview: productItem.existingReview,
            rating: productItem.rating,
            comment: productItem.comment
        })
    } else {
        console.warn(' Không tìm thấy existingReview để sửa')
    }
}

// Handle delete review
const handleDeleteReview = async (productItem) => {
    if (!productItem.existingReview || !productItem.existingReview.review_id) {
        return
    }


    productItem.isDeleting = true
    productItem.reviewError = ''

    try {
        await reviewStore.deleteReviewStore(productItem.existingReview.review_id)

        // Reload to update hasReview status
        await loadProductsToReview()
    } catch (error) {
        productItem.reviewError = error.response?.data?.message || error.message || 'Không thể xóa đánh giá!'
        console.error('Delete review error:', error)
    } finally {
        productItem.isDeleting = false
    }
}


const getProductImage = (product) => {
    if (!product) return '/img/footer.png'
    if (product.img_url) return product.img_url
    if (product.images && product.images.length > 0) return product.images[0]
    return '/img/footer.png'
}

const getProductName = (product) => {
    if (!product) return 'Sản phẩm không xác định'
    return product.product_name || product.name || 'Sản phẩm'
}

const handleImageError = (event) => {
    if (!event.target.src.includes('footer.png')) {
        event.target.src = '/img/footer.png'
    }
}

onMounted(() => {
    // Xóa flag order_completed để tránh redirect về home khi đang ở trang review
    // (flag này có thể còn sót từ lần thanh toán trước)
    sessionStorage.removeItem('order_completed')
    sessionStorage.removeItem('completed_order_id')

    loadProductsToReview()
})
</script>
