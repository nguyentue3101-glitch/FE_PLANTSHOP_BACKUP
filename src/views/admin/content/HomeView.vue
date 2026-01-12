<template>
  <div class="p-8">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p class="mt-4 text-gray-600">Đang tải dữ liệu...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <div class="flex items-center justify-between">
        <span>{{ errorMessage }}</span>
        <button @click="resetError" class="text-red-700 hover:text-red-900">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Data Display -->
    <div v-else class="flex-1 items-center justify-between mb-4">
      <h1 class="text-3xl font-bold mb-6 text-center">THỐNG KÊ</h1>

      <!-- Filter Section -->
      <div class="mb-6 flex justify-center gap-4 items-center flex-wrap">
        <div class="flex items-center gap-2">
          <label for="viewType" class="text-sm font-medium text-gray-700">Xem theo:</label>
          <select id="viewType" v-model="viewType" @change="onViewTypeChange"
            class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="month">Theo Tháng</option>
            <option value="year">Theo Năm</option>
          </select>
        </div>
        <div v-if="viewType === 'month'" class="flex items-center gap-2">
          <label for="monthPicker" class="text-sm font-medium text-gray-700">Chọn tháng:</label>
          <input id="monthPicker" type="month" v-model="selectedMonthYear" @change="loadStatistics"
            class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div v-else class="flex items-center gap-2">
          <label for="yearPicker" class="text-sm font-medium text-gray-700">Chọn năm:</label>
          <input id="yearPicker" type="number" v-model.number="selectedYear" @change="loadStatistics"
            :min="availableYears[0]" :max="availableYears[availableYears.length - 1]"
            class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-24"
            placeholder="Năm" />
        </div>
        <button @click="loadStatistics"
          class="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Tải Lại
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        <!-- Tổng Người Dùng -->
        <div
          class="relative p-6 rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
          <div class="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-20"></div>
          <div class="relative">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-blue-800">Người Dùng</h2>
              <div class="p-3 bg-blue-500 rounded-lg shadow-md">
                <Users class="w-6 h-6 text-white" />
              </div>
            </div>
            <p class="text-3xl font-bold text-blue-700">{{ formatNumber(totalUsers) }}</p>
          </div>
        </div>

        <!-- Tổng Sản Phẩm Bán Được -->
        <div
          class="relative p-6 rounded-xl shadow-lg bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
          <div class="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full -mr-10 -mt-10 opacity-20"></div>
          <div class="relative">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-lg font-semibold text-green-800">
                  Tổng Sản Phẩm
                </h2>
                <p class="text-sm text-green-600 mt-1">
                  {{ viewType === 'year' ? selectedYear :
                    `${selectedMonth}/${selectedYear}` }}
                </p>
              </div>
              <div class="p-3 bg-green-500 rounded-lg shadow-md">
                <Package class="w-6 h-6 text-white" />
              </div>
            </div>
            <p class="text-3xl font-bold text-green-700">{{ formatNumber(totalProductsSold) }}</p>
          </div>
        </div>

        <!-- Tổng Doanh Thu -->
        <div
          class="relative p-6 rounded-xl shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
          <div class="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full -mr-10 -mt-10 opacity-20"></div>
          <div class="relative">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-lg font-semibold text-purple-800">
                  Doanh Thu
                </h2>

                <p class="text-sm text-purple-600 mt-1">
                  {{ viewType === 'year' ? selectedYear :
                    `${selectedMonth}/${selectedYear}` }}
                </p>
              </div>

              <div class="p-3 bg-purple-500 rounded-lg shadow-md">
                <DollarSign class="w-6 h-6 text-white" />
              </div>

            </div>
            <p class="text-3xl font-bold text-purple-700">{{ formatCurrency(statistics?.totalRevenue || 0) }}</p>

          </div>
        </div>

        <!-- Tổng Đơn Hàng -->
        <div
          class="relative p-6 rounded-xl shadow-lg bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
          <div class="absolute top-0 right-0 w-20 h-20 bg-red-200 rounded-full -mr-10 -mt-10 opacity-20"></div>
          <div class="relative">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-lg font-semibold text-red-800">
                  Tổng Đơn
                </h2>

                <p class="text-sm text-red-600 mt-1">
                  {{ viewType === 'year' ? selectedYear :
                    `${selectedMonth}/${selectedYear}` }}
                </p>
              </div>

              <div class="p-3 bg-red-500 rounded-lg shadow-md">
                <ShoppingCart class="w-6 h-6 text-white" />
              </div>
            </div>
            <p class="text-3xl font-bold text-red-700">{{ formatNumber(statistics?.totalOrders || 0) }}</p>

          </div>
        </div>
      </div>
      <div class="mt-8 bg-white p-6 rounded-lg shadow-md">
        <div>
          <div>
            <h3 class="text-lg font-medium mb-2 text-center">
              {{ viewType === 'year' ? 'Sơ Đồ Doanh Thu Theo Năm' :
                `Sơ Đồ Doanh Thu Theo Tháng (${selectedMonth}/${selectedYear})` }}
            </h3>
            <div class="h-[500px] w-[1000px]">
              <Bar v-if="barData" :data="barData" :options="barOptions" />
            </div>
          </div>
          <!-- <div class="mt-10">
            <h3 class="text-lg font-medium mb-2 ">TOP 10 Sản Phẩm Bán Chạy</h3>
            <div class="h-[500px] w-[600px]  mx-auto">
              <Pie v-if="pieData"
                :key="`pie-${topProducts.length}-${selectedYear}-${selectedMonth}-${selectedDay}-${viewType}`"
                :data="pieData" :options="pieOptions" />
              <div v-else class="flex items-center justify-center h-full text-gray-500">
                Đang tải dữ liệu...
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { storeToRefs } from "pinia"
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js"
import { Bar } from "vue-chartjs"
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, LineElement, PointElement)


// Plugin để hiển thị doanh thu trên đầu mỗi cột trong bar chart
const barRevenuePlugin = {
  id: 'barRevenuePlugin',
  afterDatasetsDraw(chart) {
    // Chỉ áp dụng cho mixed chart (bar + line)
    if (!chart.data.datasets || chart.data.datasets.length === 0) return

    const ctx = chart.ctx
    // Tìm dataset bar (dataset đầu tiên)
    const barDataset = chart.data.datasets.find(ds => ds.type === 'bar')
    if (!barDataset) return

    const barDatasetIndex = chart.data.datasets.findIndex(ds => ds.type === 'bar')
    const meta = chart.getDatasetMeta(barDatasetIndex)

    meta.data.forEach((element, index) => {
      const value = barDataset.data[index]
      if (value <= 0) return

      const { x, y } = element.tooltipPosition()
      const formattedValue = formatCurrency(value)

      ctx.save()
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 2
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1
      ctx.font = 'bold 12px Arial'
      ctx.fillStyle = '#333'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      // Hiển thị doanh thu trên đầu cột
      ctx.fillText(formattedValue, x, y - 5)
      ctx.restore()
    })
  }
}

// Đăng ký plugins
ChartJS.register(barRevenuePlugin)
import { useAsyncOperation } from '@/composables/useAsyncOperation'
import { getStatisticsByDate, getStatisticsByMonth, getStatisticsByYear } from '@/api/statistics/get'
import { getAllUser } from '@/api/user/get'
// import { getAllProducts } from '@/api/products/get'
import { useStatisticsStore } from '@/stores/statistics'
import { Users, Package, DollarSign, ShoppingCart } from "lucide-vue-next"

const { isLoading, errorMessage, resetError, executeAsync } = useAsyncOperation()
const statisticsStore = useStatisticsStore()
const { totalProductsSoldByMonth, totalProductsSoldByYear } = storeToRefs(statisticsStore)

// Filter state
const viewType = ref('month') 
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1) //vì JS trả về tháng từ 0-11


// format trung gian cho month-year input
const selectedMonthYear = computed({
  get() {
    const year = selectedYear.value
    const month = String(selectedMonth.value).padStart(2, '0')
    return `${year}-${month}`
  },
  set(value) { //chạy khi người dùng thay đổi giá trị input
    if (value) {
      const [year, month] = value.split('-')
      selectedYear.value = parseInt(year)
      selectedMonth.value = parseInt(month)
    }
  }
})





// Statistics data
const statistics = ref(null)

// Total counts
const totalUsers = ref(0)
// const totalProducts = ref(0)

// Computed property để lấy tổng số lượng sản phẩm đã bán từ store
const totalProductsSold = computed(() => {
  const value = viewType.value === 'month'
    ? totalProductsSoldByMonth.value
    : totalProductsSoldByYear.value
 
  return value || 0
})

// lấy 2 năm trước, năm hiện tại và năm sau
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]
})

// Format number with thousand separator
const formatNumber = (num) => {
  return new Intl.NumberFormat('vi-VN').format(num)
}

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}



// Handle view type change
const onViewTypeChange = () => {
  // Reset store values khi thay đổi viewType
  statisticsStore.totalProductsSoldByMonth = 0
  statisticsStore.totalProductsSoldByYear = 0
  loadStatistics()
}

// lấy doanh thu từng ngày trong tháng
const dailyRevenueData = ref([])
const loadDailyDataForMonth = async () => {
  dailyRevenueData.value = []
  const year = selectedYear.value
  const month = selectedMonth.value

  // Lấy số ngày trong tháng
  const daysInMonth = new Date(year, month, 0).getDate()
  const promises = []

  // Load tất cả các ngày trong tháng
  for (let day = 1; day <= daysInMonth; day++) {
    promises.push(
      getStatisticsByDate(year, month, day)
        .then(response => {
          if (response.data?.success && response.data?.data) {
            return {
              day,
              revenue: response.data.data.totalRevenue || 0,
              orders: response.data.data.totalOrders || 0
            }
          }
          return { day, revenue: 0, orders: 0 }
        })
        .catch(() => ({ day, revenue: 0, orders: 0 }))
    )
  }

  const results = await Promise.all(promises)
  dailyRevenueData.value = results.sort((a, b) => a.day - b.day) //sắp theo ngày tăng dần
}

// Load statistics data
const loadStatistics = async () => {
  await executeAsync(async () => {
    if (viewType.value === 'month') {
      // lấy doanh thu theo tháng
      const statsResponse = await getStatisticsByMonth(selectedYear.value, selectedMonth.value)
      if (statsResponse.data?.success && statsResponse.data?.data) {
        statistics.value = statsResponse.data.data
      }
      // lấy tổng sản phẩm bán được theo tháng
      await statisticsStore.getTotalProductsSoldByMonthStore(selectedYear.value, selectedMonth.value)

      // lấy doanh thu từng ngày trong tháng
      await loadDailyDataForMonth()
    } else {
      // lấy doanh thu theo năm
      const statsResponse = await getStatisticsByYear(selectedYear.value)
      if (statsResponse.data?.success && statsResponse.data?.data) {
        statistics.value = statsResponse.data.data
      }

      //  lấy tổng sản phẩm bán được theo năm
      await statisticsStore.getTotalProductsSoldByYearStore(selectedYear.value)

      // lấy doanh thu từng ngày trong năm
      await loadMonthlyDataForYear()
    }
  }, {
    defaultErrorMessage: 'Không thể tải dữ liệu thống kê. Vui lòng thử lại!'
  })
}

// lấy doanh thu từng tháng trong năm
const monthlyRevenueData = ref([])
const loadMonthlyDataForYear = async () => {
  monthlyRevenueData.value = []
  const promises = []

  for (let month = 1; month <= 12; month++) {
    promises.push(
      getStatisticsByMonth(selectedYear.value, month)
        .then(response => {
          if (response.data?.success && response.data?.data) {
            return {
              month,
              revenue: response.data.data.totalRevenue || 0,
              orders: response.data.data.totalOrders || 0
            }
          }
          return { month, revenue: 0, orders: 0 }
        })
        .catch(() => ({ month, revenue: 0, orders: 0 }))
    )
  }

  const results = await Promise.all(promises)
  monthlyRevenueData.value = results.sort((a, b) => a.month - b.month)
}

// khoi tạo dữ liệu cho biểu đồ cột và tự động tính toán khi dữ liệu thay đổi
const barData = computed(() => {
  const labels = []
  const revenueData = []

  if (viewType.value === 'month') {
    // Hiển thị doanh thu theo tất cả các ngày trong tháng
    //0 => lấy ngày cuối cùng của tháng trước đó
    //.getDate() => lấy ngày trong tháng
    const daysInMonth = new Date(selectedYear.value, selectedMonth.value, 0).getDate() 

    if (dailyRevenueData.value.length > 0) {
      // Tạo map để dễ tìm kiếm
      const revenueMap = new Map()
      dailyRevenueData.value.forEach(item => {
        revenueMap.set(item.day, item.revenue)
      })

      // Hiển thị tất cả các ngày trong tháng
      for (let day = 1; day <= daysInMonth; day++) {
        labels.push(`Ngày ${day}`)
        revenueData.push(revenueMap.get(day) || 0)
      }
    } else {
      // Fallback: hiển thị tất cả các ngày với giá trị 0
      for (let day = 1; day <= daysInMonth; day++) {
        labels.push(`Ngày ${day}`)
        revenueData.push(0)
      }
    }
  } else if (viewType.value === 'year') {
    // Hiển thị doanh thu theo 12 tháng trong năm
    if (monthlyRevenueData.value.length > 0) {
      monthlyRevenueData.value.forEach(item => {
        labels.push(`Tháng ${item.month}`)
        revenueData.push(item.revenue)
      })
    } else {
      // Fallback: hiển thị 12 tháng với giá trị 0
      for (let month = 1; month <= 12; month++) {
        labels.push(`Tháng ${month}`)
        revenueData.push(0)
      }
    }
  }

  return {
    labels, //trục x
    datasets: [ 
      {
        type: 'bar',
        label: "Doanh Thu (VNĐ)",
        data: revenueData, //trục y
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        yAxisID: 'y',
      },
    ],
  }
})



const barOptions = computed(() => ({
  responsive: true, // Tự động điều chỉnh kích thước để phù hợp với container
  maintainAspectRatio: false, // Cho phép thay đổi tỉ lệ khung hình
  plugins: {
    legend: { //chú thích
      position: "top",
    },
    title: { 
      display: false, 
    }, 
    tooltip: { // hiển thị thông tin khi hover
      callbacks: {
        label: function (context) {
          return `Doanh Thu: ${formatCurrency(context.parsed.y)}` // Hiển thị doanh thu dưới dạng tiền tệ
        }
      }
    }
  },
  scales: {
    y: {
      type: 'linear', // trục y dạng tuyến tính
      position: 'left',// vị trí bên trái
      beginAtZero: true,// bắt đầu từ 0
      ticks: { // định dạng trục y
        callback: function (value) {
          return formatCurrency(value)
        }
      },
      title: {
        display: true,
        text: 'Doanh Thu Theo Mốc (VNĐ)'
      }
    },
    x: {
      ticks: {
        // Hiển thị tất cả các labels, không tự động ẩn
        maxRotation: 45,
        minRotation: 45,
        autoSkip: false, // Quan trọng: không tự động bỏ qua labels
        maxTicksLimit: undefined // Không giới hạn số lượng ticks
      }
    }
  }
}))



// Load total users
const loadTotalUsers = async () => {
  try {
    const token = localStorage.getItem('accessToken') 
    if (!token) {
      totalUsers.value = 0
      return
    }

    const response = await getAllUser(token)
    if (response.data?.success) {
      totalUsers.value = response.data.data.length
    } else {
      totalUsers.value = 0
    }
  } catch (error) {
    console.error('Error loading total users:', error)
    totalUsers.value = 0
  }
}

// Load total products
// const loadTotalProducts = async () => {
//   try {
//     const response = await getAllProducts()
//     if (response.data?.success ) {
//       totalProducts.value = response.data.data.length
//     } else {
//       totalProducts.value = 0
//     }
//   } catch (error) {
//     console.error('Error loading total products:', error)
//     totalProducts.value = 0
//   }
// }

// Load all initial data
const loadInitialData = async () => {
  await Promise.all([
    loadTotalUsers(),
    // loadTotalProducts(),
    loadStatistics()
  ])
}

// Load data on mount
onMounted(() => {
  loadInitialData()
})
</script>
