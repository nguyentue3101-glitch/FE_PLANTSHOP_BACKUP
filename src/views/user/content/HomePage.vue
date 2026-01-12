<template>
  <div class="space-y-20 bg-green-50">
    <section class="relative h-[550px]">
      <img src="/img/footer.png" alt="Mow Garden Banner" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
        <div class="text-center text-white px-6">
          <h1 class="text-4xl md:text-6xl font-bold mb-4">
            Mang Xanh Vào Không Gian Sống
          </h1>
          <p class="text-lg md:text-2xl mb-6 max-w-xl mx-auto">
            Cây cảnh đẹp – chất lượng – giao hàng nhanh
          </p>
          <router-link to="/product"
            class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition">
            Xem sản phẩm
          </router-link>
        </div>
      </div>
    </section>


    <section class="px-10 relative">
      <h2 class="text-3xl font-semibold text-green-700 mb-8 text-center">
        Danh Mục
      </h2>
      <div class="relative overflow-hidden">
        <!-- tính toán index slide sau khi kéo -->
        <div class="flex transition-transform duration-300  gap-6" :style="{
          transform: `translateX(calc(-${currentSlide * (100 / itemsPerSlide)}% - ${currentSlide * 1.5}rem))`
        }">
          <router-link v-for="cat in categoriesWithImages" :key="cat.category_id"
            :to="{ path: '/product', query: { category: cat.category_id } }"
            class="flex-shrink-0 flex flex-col items-center bg-white shadow hover:shadow-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 rounded-lg overflow-hidden cursor-pointer no-underline text-inherit"
            :style="{ width: `calc(${100 / itemsPerSlide}% - ${6 * (itemsPerSlide - 1) / itemsPerSlide / 4}rem)` }">
            <!-- tính toán chiều rộng item -->
            <div class="w-full bg-gray-100 flex items-center justify-center p-4"
              style="min-height: 200px; aspect-ratio: 1;"> <!--aspect-ratio: 1 -> hình vuông-->
              <img :src="cat.image" :alt="cat.category_name" class="max-w-full max-h-full w-auto h-auto object-contain"
                @error="handleImageError($event)" />
            </div>
            <div class="p-4 text-center">
              <h3 class="font-medium text-green-800">{{ cat.category_name }}</h3>
            </div>
          </router-link>
        </div>

        <!-- Navigation Arrows -->
        <button v-if="categoriesWithImages.length > itemsPerSlide" @click="prevSlide" :disabled="currentSlide === 0"
          :class="[
            'absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-green-50 transition-colors',
            currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          ]">
          <ChevronLeft class="w-6 h-6 text-green-700" />
        </button>

        <button v-if="categoriesWithImages.length > itemsPerSlide" @click="nextSlide"
          :disabled="currentSlide >= maxSlide" :class="[
            'absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-green-50 transition-colors',
            currentSlide >= maxSlide ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          ]">
          <ChevronRight class="w-6 h-6 text-green-700" />
        </button>
      </div>
    </section>

    <!-- Section: Sản phẩm nổi bật -->
    <section class="px-10 py-12 relative">
      <h2 class="text-3xl font-semibold text-green-700 mb-8 text-center">
        Sản Phẩm Nổi Bật
      </h2>

      <div class="flex transition-transform duration-300 ease-in-out gap-6 px-10">
        <router-link v-for="product in featuredProducts" :key="product.product_id"
          :to="`/product-detail/${product.product_id}`"
          class="flex-shrink-0 flex flex-col items-center bg-white shadow hover:shadow-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 rounded-lg overflow-hidden cursor-pointer no-underline text-inherit"
          :style="{ width: `calc(${100 / featuredProductsPerSlide}% - ${6 * (featuredProductsPerSlide - 1) / featuredProductsPerSlide / 4}rem)` }">
          <div class="w-full bg-gray-100 flex items-center justify-center p-4"
            style="min-height: 200px; aspect-ratio: 1;">
            <img :src="getProductImage(product)" :alt="getProductName(product)"
              class="max-w-full max-h-full w-auto h-auto object-contain" @error="handleImageError($event)" />
          </div>
          <div class="p-4 text-center w-full">
            <h3 class="font-medium text-green-800 mb-2 line-clamp-2">{{ getProductName(product) }}</h3>
            <p class="text-lg font-bold text-green-600">{{ formatPrice(product.price) }}</p>
          </div>
        </router-link>
      </div>

    </section>

    <!-- Giới thiệu về shop -->
    <section class="px-10 py-12">
      <div class="flex items-center justify-center gap-3 mb-8">
        <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h2 class="text-3xl font-semibold text-green-700">
          Giới thiệu về Cỏ Ba Lá
        </h2>
        <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div class="text-gray-700 leading-relaxed space-y-6">
            <div class="flex gap-4">
              <div class="flex-shrink-0 mt-1">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-lg">
                Cỏ Ba Lá là địa chỉ tin cậy hàng đầu chuyên cung cấp các loại cây cảnh, cây văn phòng chất lượng cao
                với
                giá cả hợp lý. Chúng tôi tự hào là một trong những cửa hàng cây
                cảnh uy tín nhất, mang đến cho khách hàng những sản phẩm tươi tốt, khỏe mạnh và đa dạng về chủng loại.
              </p>
            </div>
            <div class="flex gap-4">
              <div class="flex-shrink-0 mt-1">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-lg">
                Chúng tôi cam kết mang đến những sản phẩm cây cảnh được lựa chọn kỹ càng từ các vườn ươm uy tín, đảm bảo
                chất lượng và sức khỏe của từng cây. Đội ngũ chuyên gia giàu kinh nghiệm của chúng tôi luôn sẵn sàng tư
                vấn miễn phí, giúp bạn chọn được loại cây phù hợp với không gian sống, điều kiện ánh sáng và sở thích cá
                nhân.
              </p>
            </div>
            <div class="flex gap-4">
              <div class="flex-shrink-0 mt-1">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-lg">
                Cỏ Ba Lá không chỉ là nơi mua sắm mà còn là người bạn đồng hành trong hành trình tạo nên không gian
                xanh
                cho ngôi nhà của bạn. Chúng tôi cung cấp dịch vụ giao hàng nhanh chóng, an toàn, đảm bảo cây đến tay bạn
                trong tình trạng tốt nhất. Ngoài ra, chúng tôi còn có chính sách đổi trả linh hoạt và hỗ trợ chăm sóc
                cây
                sau khi mua, giúp bạn yên tâm trong quá trình chăm sóc cây cảnh.
              </p>
            </div>
            <div class="flex gap-4">
              <div class="flex-shrink-0 mt-1">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-lg">
                Hãy đến với Cỏ Ba Lá để khám phá thế giới cây cảnh đầy màu sắc và tìm cho mình những người bạn xanh phù
                hợp nhất!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Lý do chọn Cỏ Ba Lá -->
    <section class="px-10 py-16 bg-[#f5f5f0]">
      <div class="max-w-7xl mx-auto">
        <div class="grid  lg:grid-cols-2 gap-12 items-center">
          <!-- Hình ảnh bên trái -->
          <div class="order-2 lg:order-1">
            <img src="/img/footer.png" alt="Cỏ Ba Lá" class="w-full h-auto rounded-lg shadow-lg object-cover" />
          </div>

          <!-- Nội dung bên phải -->
          <div class="order-1 lg:order-2">
            <h2 class="text-3xl md:text-4xl font-bold text-green-700 mb-8 text-center lg:text-left">
              Lý do chọn Cỏ Ba Lá?
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Lý do 1: Tuyển chọn -->
              <div class="flex gap-4">
                <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  <CheckCircle class="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 class="font-bold text-green-700 uppercase text-sm mb-1">Tuyển chọn</h3>
                  <p class="text-gray-700 text-sm">Mọi cây xanh đều phải được chọn lọc kỹ lưỡng</p>
                </div>
              </div>

              <!-- Lý do 2: Đa dạng -->
              <div class="flex gap-4">
                <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  <Layers class="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 class="font-bold text-green-700 uppercase text-sm mb-1">Đa dạng</h3>
                  <p class="text-gray-700 text-sm">Dễ dàng tìm được sản phẩm mà bạn mong muốn</p>
                </div>
              </div>

              <!-- Lý do 3: Đồng hành -->
              <div class="flex gap-4">
                <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  <Users class="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 class="font-bold text-green-700 uppercase text-sm mb-1">Đồng hành</h3>
                  <p class="text-gray-700 text-sm">Luôn đồng hành và giúp đỡ bạn về mặt kỹ thuật</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  <Image class="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 class="font-bold text-green-700 uppercase text-sm mb-1">Đúng chuẩn</h3>
                  <p class="text-gray-700 text-sm">Sử dụng hình ảnh chụp thực tế giúp dễ hình dung</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  <ShieldCheck class="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 class="font-bold text-green-700 uppercase text-sm mb-1">Tin cậy</h3>
                  <p class="text-gray-700 text-sm">Gửi ảnh thực tế và cụ thể trước khi giao hàng</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  <TrendingUp class="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 class="font-bold text-green-700 uppercase text-sm mb-1">Cạnh tranh</h3>
                  <p class="text-gray-700 text-sm">Tối ưu hóa ngân sách nhờ mức giá cực kì cạnh tranh</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
// import { useOrderStore } from '@/stores/orders'
// import { usePaymentStore } from '@/stores/payments'
import { ChevronLeft, ChevronRight, CheckCircle, Layers, Users, Image, ShieldCheck, TrendingUp } from 'lucide-vue-next'

const productStore = useProductStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
// const orderStore = useOrderStore()
// const paymentStore = usePaymentStore()

const categories = ref([])
const products = ref([])


//===================================Category Featured===================================
const itemsPerSlide = ref(5)
const currentSlide = ref(0)

// Tính toán max slide
const maxSlide = computed(() => {
  return Math.max(0, categoriesWithImages.value.length - itemsPerSlide.value)
})

// Điều hướng slide
const nextSlide = () => {
  if (currentSlide.value < maxSlide.value) {
    currentSlide.value++
  }
}
const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

// Lấy hình ảnh random cho mỗi category
const getRandomProductImage = (categoryId) => {
  const categoryProducts = products.value.filter(product => {
    const productCategoryId = product.category_id
    return productCategoryId == categoryId && product.img_url
  })
  if (categoryProducts.length === 0) {
    return '/img/footer.png'
  }

  //floor là làm tròn xuống
  const randomIndex = Math.floor(Math.random() * categoryProducts.length)
  return categoryProducts[randomIndex].img_url || '/img/footer.png'
}

// Categories với hình ảnh random
const categoriesWithImages = computed(() => {
  return categories.value.map(cat => {
    const categoryId = cat.category_id
    return {
      ...cat,
      image: getRandomProductImage(categoryId)
    }
  })
})
// Update itemsPerSlide khi resize
if (typeof window !== 'undefined') {
  const updateItemsPerSlide = () => {
    if (window.innerWidth >= 1024) {
      itemsPerSlide.value = 5 // lg
    } else if (window.innerWidth >= 640) {
      itemsPerSlide.value = 3 // sm
    } else {
      itemsPerSlide.value = 2 // mobile
    }
  }

  updateItemsPerSlide()
  window.addEventListener('resize', updateItemsPerSlide)
}

//===================================products featured ===================================
const featuredProductsPerSlide = ref(6)

// Lấy sản phẩm random
const featuredProducts = computed(() => {
  if (products.value.length === 0) return []

  // Tạo một mảng copy và xáo trộn để lấy random
  const shuffled = [...products.value].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 6)
})


// Lấy hình ảnh sản phẩm
const getProductImage = (product) => {
  const imageUrl = product?.img_url
  if (!imageUrl || imageUrl.trim() === '') {
    return '/img/footer.png'
  }
  return imageUrl
}

// Lấy tên sản phẩm
const getProductName = (product) => {
  return product?.product_name || 'Không có tên'
}

// Format giá tiền
const formatPrice = (price) => {
  if (!price) return '0 ₫'
  const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) : price
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numPrice)
}


// Xử lý lỗi hình ảnh
const handleImageError = (event) => {
  if (!event.target.src.includes('footer.png')) {
    event.target.src = '/img/footer.png'
  }
}

// Update featuredProductsPerSlide khi resize
if (typeof window !== 'undefined') {
  const updateFeaturedProductsPerSlide = () => {
    if (window.innerWidth >= 1024) {
      featuredProductsPerSlide.value = 6 // lg
    } else if (window.innerWidth >= 640) {
      featuredProductsPerSlide.value = 3 // sm
    } else {
      featuredProductsPerSlide.value = 2 // mobile
    }
  }

  updateFeaturedProductsPerSlide()
  window.addEventListener('resize', updateFeaturedProductsPerSlide)
}
const clearMoMoFlags = () => {
  sessionStorage.removeItem('momo_payment_order_id')
  sessionStorage.removeItem('momo_payment_timestamp')
}

// const ensureOrderStatus = async (orderId, desiredStatus) => {
//   try {
//     const orderResp = await orderStore.getOrderByIdStore(orderId)
//     if (orderResp?.data?.success && orderResp.data.data) {
//       const currentStatus = orderResp.data.data.status
//       if (currentStatus !== desiredStatus) {
//         await orderStore.updateOrderStatusStore(orderId, desiredStatus)
//       }
//     }
//   } catch (error) {
//     console.error(` HomePage - Lỗi khi cập nhật trạng thái đơn hàng ${orderId} -> ${desiredStatus}:`, error)
//   }
// }

// const updatePaymentStatusIfNeeded = async (payment, targetStatus) => {
//   if (!payment) return
//   const paymentId = payment.payment_id || payment.id || payment.paymentId
//   const currentStatus = payment.status || payment.payment_status
//   if (paymentId && currentStatus !== targetStatus) {
//     await paymentStore.updatePaymentStatusStore(paymentId, targetStatus)
//   }
// }

// // Hàm xử lý kết quả MoMo dựa trên trạng thái thực tế từ backend
// const handleMoMoPaymentReturn = async () => {
//   const momoOrderId = sessionStorage.getItem('momo_payment_order_id')
//   const momoTimestamp = sessionStorage.getItem('momo_payment_timestamp')

//   if (!momoOrderId || !momoTimestamp) return

//   const orderIdNum = parseInt(momoOrderId)
//   if (!orderIdNum) {
//     clearMoMoFlags()
//     return
//   }

//   try {
//     console.log(' HomePage - Kiểm tra trạng thái MoMo cho order:', orderIdNum)
//     const paymentResponse = await paymentStore.getPaymentByOrderIdStore(orderIdNum)
//     const payment = paymentResponse?.data?.data || null
//     const paymentStatus = payment?.status || payment?.payment_status

//     if (paymentStatus === 'SUCCESS') {
//       // Backend đã tự động cập nhật order status, không cần cập nhật ở frontend
//       // await ensureOrderStatus(orderIdNum, 'PENDING_CONFIRMATION')
//       clearMoMoFlags()
//       return
//     }

//     if (paymentStatus === 'FAILED') {
//       console.log(' HomePage - Payment FAILED, hủy đơn hàng')
//       await ensureOrderStatus(orderIdNum, 'CANCELLED')
//       await updatePaymentStatusIfNeeded(payment, 'FAILED')
//       clearMoMoFlags()
//       return
//     }

//     // Nếu payment chưa có trạng thái cuối cùng, kiểm tra order status
//     const orderResp = await orderStore.getOrderByIdStore(orderIdNum)
//     const orderStatus = orderResp?.data?.data?.status

//     if (orderStatus === 'CONFIRMED' || orderStatus === 'DELIVERED') {
//       console.log(' HomePage - Order đã ở trạng thái hoàn tất, không hủy.')
//       clearMoMoFlags()
//       return
//     }

//     if (orderStatus === 'CANCELLED') {
//       console.log(' HomePage - Order đã bị hủy trước đó.')
//       clearMoMoFlags()
//       return
//     }

//     console.log(' HomePage - Payment chưa có kết quả cuối, giữ nguyên đơn hàng.')
//     // Không xóa flags để PaymentReturnPage hoặc lần tải sau tiếp tục xử lý
//   } catch (error) {
//     console.error(' HomePage - Lỗi khi lấy trạng thái MoMo:', error)
//   }
// }

//===================================khởi tạo gọi api===================================
// Load categories và products
onMounted(async () => {
  // Kiểm tra và xử lý MoMo payment return trước
  // await handleMoMoPaymentReturn()
  clearMoMoFlags()

  try {
    await productStore.getCategories()
    const storeCategories = productStore.categories
    categories.value = storeCategories

    await productStore.getProducts()
    const storeProducts = productStore.products
    products.value = storeProducts

    // Load cart nếu user đã đăng nhập
    const userId = authStore.userId
    if (userId) {
      try {
        await cartStore.loadCartFromBackend(userId)
      } catch (error) {
        console.log(error)
      }
    }
  } catch (error) {
    console.log(error)
  }
})


</script>
