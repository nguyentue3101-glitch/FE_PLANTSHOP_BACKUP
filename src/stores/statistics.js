import { defineStore } from "pinia"
import { ref } from "vue"
import { getTotalProductsSoldByMonth, getTotalProductsSoldByYear } from "@/api/statistics/get"

export const useStatisticsStore = defineStore("statistics", () => {
    const totalProductsSoldByMonth = ref(0)
    const totalProductsSoldByYear = ref(0)
    const loadingProductsSold = ref(false)

    /**
     * Lấy tổng số sản phẩm bán được theo tháng
     */
    const getTotalProductsSoldByMonthStore = async (year, month) => {
        loadingProductsSold.value = true
        try {
            const response = await getTotalProductsSoldByMonth(year, month)
            console.log(' Total Products Sold By Month Response:', response)
            console.log(' Response data:', response.data)
            console.log(' Response data.data:', response.data?.data)
            
            let total = 0
            
            if (response.data?.success && response.data?.data) {
                const data = response.data.data
                if (data && typeof data === 'object') {
                    total = data.totalQuantitySold || 0
                }
            }
            
            console.log(' Total products sold by month (final):', total)
            totalProductsSoldByMonth.value = Number(total) || 0
            console.log(' Store value after update:', totalProductsSoldByMonth.value)
            return response
        } catch (error) {
            console.error(" Get total products sold by month error:", error)
            totalProductsSoldByMonth.value = 0
            throw error
        } finally {
            loadingProductsSold.value = false
        }
    }

    /**
     * Lấy tổng số sản phẩm bán được theo năm
     */
    const getTotalProductsSoldByYearStore = async (year) => {
        loadingProductsSold.value = true
        try {
            const response = await getTotalProductsSoldByYear(year)
            console.log(' Total Products Sold By Year Response:', response)
            console.log(' Response data:', response.data)
            console.log(' Response data.data:', response.data?.data)
            
            let total = 0
            
            if (response.data?.success && response.data?.data) {
                const data = response.data.data
                if (data && typeof data === 'object') {
                    total = data.totalQuantitySold || 0
                }
            }
            
            console.log('Total products sold by year (final):', total)
            totalProductsSoldByYear.value = Number(total) || 0
            console.log(' Store value after update:', totalProductsSoldByYear.value)
            return response
        } catch (error) {
            console.error(" Get total products sold by year error:", error)
            totalProductsSoldByYear.value = 0
            throw error
        } finally {
            loadingProductsSold.value = false
        }
    }

    return {
        totalProductsSoldByMonth,
        totalProductsSoldByYear,
        loadingProductsSold,
        getTotalProductsSoldByMonthStore,
        getTotalProductsSoldByYearStore
    }
})

