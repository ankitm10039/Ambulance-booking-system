import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as BookingService from 'src/services/booking.service'
import * as UserService from 'src/services/user.service'
import * as DriverService from 'src/services/driver.service'

export const useBookingStore = defineStore('booking', () => {
  // State
  const bookings = ref([])
  const currentBooking = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const activeBookings = computed(() => 
    bookings.value.filter(booking => 
      ['pending', 'confirmed', 'in-progress'].includes(booking.status)
    )
  )

  const completedBookings = computed(() => 
    bookings.value.filter(booking => booking.status === 'completed')
  )

  const userBookings = computed(() => 
    bookings.value.filter(booking => booking.user?._id === currentBooking.value?.user?._id)
  )

  const driverBookings = computed(() => 
    bookings.value.filter(booking => booking.driver?._id === currentBooking.value?.driver?._id)
  )

  // Actions
  const createBooking = async (bookingData) => {
    try {
      loading.value = true
      error.value = null

      const response = await BookingService.createBooking(bookingData)
      const newBooking = response.data.data

      bookings.value.push(newBooking)
      currentBooking.value = newBooking

      return newBooking
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create booking'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateBookingStatus = async (bookingId, status, cancellationReason) => {
    try {
      loading.value = true
      error.value = null

      const response = await BookingService.updateBookingStatus(bookingId, status, cancellationReason)
      const updatedBooking = response.data.data

      // Update in local state
      const bookingIndex = bookings.value.findIndex(b => b._id === bookingId)
      if (bookingIndex !== -1) {
        bookings.value[bookingIndex] = updatedBooking
      }

      if (currentBooking.value?._id === bookingId) {
        currentBooking.value = updatedBooking
      }

      return updatedBooking
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update booking status'
      return null
    } finally {
      loading.value = false
    }
  }

  const rateBooking = async (bookingId, rating, comment) => {
    try {
      loading.value = true
      error.value = null

      const response = await BookingService.rateBooking(bookingId, rating, comment)
      const updatedBooking = response.data.data

      // Update in local state
      const bookingIndex = bookings.value.findIndex(b => b._id === bookingId)
      if (bookingIndex !== -1) {
        bookings.value[bookingIndex] = updatedBooking
      }

      if (currentBooking.value?._id === bookingId) {
        currentBooking.value = updatedBooking
      }

      return updatedBooking
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to rate booking'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchActiveBookings = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await BookingService.getActiveBookings()
      const activeBookings = response.data.data

      // Update active bookings in the store
      bookings.value = bookings.value.filter(b => b.status === 'completed' || b.status === 'cancelled')
      bookings.value.push(...activeBookings)

      return activeBookings
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch active bookings'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchAllBookings = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await BookingService.getAllBookings()
      bookings.value = response.data.data
      return bookings.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch bookings'
      return []
    } finally {
      loading.value = false
    }
  }
  
  const fetchUserBookings = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await UserService.getUserBookings()
      const userBookings = response.data.data
      
      // Update user bookings in the store
      bookings.value = userBookings
      
      return userBookings
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch user bookings'
      return []
    } finally {
      loading.value = false
    }
  }
  
  const fetchDriverBookings = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await DriverService.getDriverBookings()
      const driverBookings = response.data.data
      
      // Update driver bookings in the store
      bookings.value = driverBookings
      
      return driverBookings
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch driver bookings'
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
        currentBooking.value = cachedBooking
        return cachedBooking
      }

      // If not, fetch from API
      const response = await BookingService.getBookingById(bookingId)
      const booking = response.data.data
      
      // Update in store
      currentBooking.value = booking
      
      // Add to bookings array if not already there
      const bookingIndex = bookings.value.findIndex(b => b._id === bookingId)
      if (bookingIndex === -1) {
        bookings.value.push(booking)
      } else {
        bookings.value[bookingIndex] = booking
      }

      return booking
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch booking'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    bookings,
    currentBooking,
    loading,
    error,

    // Getters
    activeBookings,
    completedBookings,
    userBookings,
    driverBookings,

    // Actions
    createBooking,
    updateBookingStatus,
    rateBooking,
    fetchActiveBookings,
    fetchAllBookings,
    fetchUserBookings,
    fetchDriverBookings,
    getBookingById
  }
})