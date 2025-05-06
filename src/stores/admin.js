import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as AdminService from 'src/services/admin.service'

export const useAdminStore = defineStore('admin', () => {
  // State
  const users = ref([])
  const drivers = ref([])
  const vehicles = ref([])
  const bookings = ref([])
  const selectedBooking = ref(null)
  const dashboardStats = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 1,
    rowsPerPage: 5,
    rowsNumber: 0,
    sortBy: 'createdAt',
    descending: true
  })
  const filters = ref({
    status: null,
    bookingType: null,
    dateRange: {
      from: '',
      to: ''
    },
    search: ''
  })

  // Getters
  const pendingBookings = computed(() => 
    bookings.value.filter(booking => booking.status === 'pending')
  )

  const confirmedBookings = computed(() => 
    bookings.value.filter(booking => booking.status === 'confirmed')
  )

  const inProgressBookings = computed(() => 
    bookings.value.filter(booking => booking.status === 'in-progress')
  )

  const completedBookings = computed(() => 
    bookings.value.filter(booking => booking.status === 'completed')
  )

  const cancelledBookings = computed(() => 
    bookings.value.filter(booking => booking.status === 'cancelled')
  )

  // Actions
  const fetchBookings = async () => {
    try {
      loading.value = true
      error.value = null

      // Build query parameters
      const params = {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        sortDesc: pagination.value.descending
      }
      
      // Add filters if they exist
      if (filters.value.status) params.status = filters.value.status
      if (filters.value.bookingType) params.bookingType = filters.value.bookingType
      if (filters.value.dateRange.from) params.fromDate = filters.value.dateRange.from
      if (filters.value.dateRange.to) params.toDate = filters.value.dateRange.to
      if (filters.value.search) params.search = filters.value.search
      
      const response = await AdminService.getBookings(params)
      
      bookings.value = response.data.data
      pagination.value.rowsNumber = response.data.total
      
      return bookings.value
    } catch (err) {
      console.error('Error fetching bookings:', err)
      error.value = err.response?.data?.message || 'Failed to load bookings'
      return []
    } finally {
      loading.value = false
    }
  }

  const getBookingById = async (bookingId) => {
    try {
      loading.value = true
      error.value = null

      // First check if we already have it in the store
      const cachedBooking = bookings.value.find(b => b._id === bookingId)
      if (cachedBooking) {
        selectedBooking.value = cachedBooking
        return cachedBooking
      }

      // If not, fetch from API
      const response = await AdminService.getBookingById(bookingId)
      const booking = response.data.data
      
      // Update in store
      selectedBooking.value = booking
      
      // Add to bookings array if not already there
      const bookingIndex = bookings.value.findIndex(b => b._id === bookingId)
      if (bookingIndex === -1) {
        bookings.value.push(booking)
      } else {
        bookings.value[bookingIndex] = booking
      }

      return booking
    } catch (err) {
      console.error('Error fetching booking:', err)
      error.value = err.response?.data?.message || 'Failed to fetch booking'
      return null
    } finally {
      loading.value = false
    }
  }

  const assignDriver = async (bookingId, driverId) => {
    try {
      loading.value = true
      error.value = null

      const response = await AdminService.assignDriver(bookingId, driverId)
      const updatedBooking = response.data.data

      // Update in local state
      const bookingIndex = bookings.value.findIndex(b => b._id === bookingId)
      if (bookingIndex !== -1) {
        bookings.value[bookingIndex] = updatedBooking
      }

      if (selectedBooking.value?._id === bookingId) {
        selectedBooking.value = updatedBooking
      }

      return updatedBooking
    } catch (err) {
      console.error('Error assigning driver:', err)
      error.value = err.response?.data?.message || 'Failed to assign driver'
      return null
    } finally {
      loading.value = false
    }
  }

  const cancelBooking = async (bookingId, cancellationReason) => {
    try {
      loading.value = true
      error.value = null

      const response = await AdminService.cancelBooking(bookingId, cancellationReason)
      const updatedBooking = response.data.data

      // Update in local state
      const bookingIndex = bookings.value.findIndex(b => b._id === bookingId)
      if (bookingIndex !== -1) {
        bookings.value[bookingIndex] = updatedBooking
      }

      if (selectedBooking.value?._id === bookingId) {
        selectedBooking.value = updatedBooking
      }

      return updatedBooking
    } catch (err) {
      console.error('Error cancelling booking:', err)
      error.value = err.response?.data?.message || 'Failed to cancel booking'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchAvailableDrivers = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await AdminService.getAvailableDrivers()
      return response.data.data
    } catch (err) {
      console.error('Error fetching available drivers:', err)
      error.value = err.response?.data?.message || 'Failed to load available drivers'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchDashboardStats = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await AdminService.getDashboardStats()
      dashboardStats.value = response.data.data
      return dashboardStats.value
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      error.value = err.response?.data?.message || 'Failed to load dashboard statistics'
      return null
    } finally {
      loading.value = false
    }
  }

  const resetFilters = () => {
    filters.value = {
      status: null,
      bookingType: null,
      dateRange: {
        from: '',
        to: ''
      },
      search: ''
    }
  }

  const updatePagination = (newPagination) => {
    pagination.value = {
      ...pagination.value,
      ...newPagination
    }
  }

  return {
    // State
    users,
    drivers,
    vehicles,
    bookings,
    selectedBooking,
    dashboardStats,
    loading,
    error,
    pagination,
    filters,

    // Getters
    pendingBookings,
    confirmedBookings,
    inProgressBookings,
    completedBookings,
    cancelledBookings,

    // Actions
    fetchBookings,
    getBookingById,
    assignDriver,
    cancelBooking,
    fetchAvailableDrivers,
    fetchDashboardStats,
    resetFilters,
    updatePagination
  }
})