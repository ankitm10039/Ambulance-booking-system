import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from 'src/services/api.service'

export const useDriverStore = defineStore('driver', () => {
  // State
  const loading = ref(false)
  const error = ref(null)
  
  // Trip History
  const trips = ref([])
  const pagination = ref({
    page: 1,
    rowsPerPage: 5,
    rowsNumber: 0,
    sortBy: 'createdAt',
    descending: true
  })
  
  // Earnings
  const earningsDetails = ref([])
  const earningsSummary = ref({
    totalEarnings: 0,
    completedTrips: 0,
    averageFare: 0,
    pendingPayouts: 0
  })
  const earningsChartData = ref([])
  
  // Support
  const supportTickets = ref([])
  
  // Driver Profile
  const driverProfile = ref(null)
  const vehicleInfo = ref(null)
  
  // Actions
  
  // Update pagination
  const updatePagination = (newPagination) => {
    pagination.value = {
      ...pagination.value,
      ...newPagination
    }
  }
  
  // Fetch trips with filters
  const fetchTrips = async (filters = {}) => {
    try {
      loading.value = true
      error.value = null
      
      // Build query parameters
      const params = {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        sortDesc: pagination.value.descending,
        ...filters
      }
      
      const response = await apiClient.get('/driver/trips', { params })
      
      trips.value = response.data.data
      pagination.value.rowsNumber = response.data.total
      
      return trips.value
    } catch (err) {
      console.error('Error fetching trips:', err)
      error.value = err.response?.data?.message || 'Failed to fetch trips'
      return []
    } finally {
      loading.value = false
    }
  }
  
  // Fetch earnings with filters
  const fetchEarnings = async (params = {}) => {
    try {
      loading.value = true
      error.value = null
      
      // Fetch earnings summary
      const summaryResponse = await apiClient.get('/driver/earnings/summary', { params })
      earningsSummary.value = summaryResponse.data
      
      // Fetch earnings details
      const detailsParams = {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        sortDesc: pagination.value.descending,
        ...params
      }
      
      const detailsResponse = await apiClient.get('/driver/earnings/details', { params: detailsParams })
      earningsDetails.value = detailsResponse.data.data
      pagination.value.rowsNumber = detailsResponse.data.total
      
      // Fetch chart data
      const chartResponse = await apiClient.get('/driver/earnings/chart', { params })
      earningsChartData.value = chartResponse.data
      
      return {
        summary: earningsSummary.value,
        details: earningsDetails.value,
        chartData: earningsChartData.value
      }
    } catch (err) {
      console.error('Error fetching earnings:', err)
      error.value = err.response?.data?.message || 'Failed to fetch earnings'
      
      // Return empty data on error
      return {
        summary: earningsSummary.value,
        details: [],
        chartData: []
      }
    } finally {
      loading.value = false
    }
  }
  
  // Fetch support tickets
  const fetchSupportTickets = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await apiClient.get('/driver/support/tickets')
      supportTickets.value = response.data
      
      return supportTickets.value
    } catch (err) {
      console.error('Error fetching support tickets:', err)
      error.value = err.response?.data?.message || 'Failed to fetch support tickets'
      return []
    } finally {
      loading.value = false
    }
  }
  
  // Create support ticket
  const createSupportTicket = async (ticketData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await apiClient.post('/driver/support/tickets', ticketData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Add the new ticket to the list
      supportTickets.value.unshift(response.data)
      
      return response.data
    } catch (err) {
      console.error('Error creating support ticket:', err)
      error.value = err.response?.data?.message || 'Failed to create support ticket'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Add response to ticket
  const addTicketResponse = async ({ ticketId, message }) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await apiClient.post(`/driver/support/tickets/${ticketId}/responses`, { message })
      
      // Update the ticket in the list
      const index = supportTickets.value.findIndex(ticket => ticket._id === ticketId)
      if (index !== -1) {
        supportTickets.value[index] = response.data
      }
      
      return response.data
    } catch (err) {
      console.error('Error adding ticket response:', err)
      error.value = err.response?.data?.message || 'Failed to add response'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Close ticket
  const closeTicket = async (ticketId) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await apiClient.put(`/driver/support/tickets/${ticketId}/close`)
      
      // Update the ticket status in the list
      const index = supportTickets.value.findIndex(ticket => ticket._id === ticketId)
      if (index !== -1) {
        supportTickets.value[index].status = 'closed'
      }
      
      return response.data
    } catch (err) {
      console.error('Error closing ticket:', err)
      error.value = err.response?.data?.message || 'Failed to close ticket'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // For development/testing - mock data
  const loadMockData = () => {
    // Mock trips data
    trips.value = [
      {
        _id: 'TRIP001',
        createdAt: new Date('2023-05-15T10:30:00'),
        completedAt: new Date('2023-05-15T11:45:00'),
        status: 'completed',
        pickupLocation: { address: '123 Main St, City' },
        dropLocation: { address: 'City Hospital, Medical District' },
        patientDetails: { name: 'John Doe', age: 45, additionalNotes: 'Heart condition' },
        fare: 450,
        distance: 12.5
      },
      {
        _id: 'TRIP002',
        createdAt: new Date('2023-05-16T14:20:00'),
        completedAt: new Date('2023-05-16T15:10:00'),
        status: 'completed',
        pickupLocation: { address: '456 Park Ave, City' },
        dropLocation: { address: 'Memorial Hospital, Downtown' },
        patientDetails: { name: 'Jane Smith', age: 32, additionalNotes: 'Pregnancy' },
        fare: 350,
        distance: 8.2
      },
      {
        _id: 'TRIP003',
        createdAt: new Date('2023-05-17T09:15:00'),
        status: 'cancelled',
        pickupLocation: { address: '789 Oak St, City' },
        dropLocation: { address: 'General Hospital, Uptown' },
        patientDetails: { name: 'Robert Brown', age: 60, additionalNotes: 'Breathing difficulty' },
        fare: 0,
        distance: 0
      },
      {
        _id: 'TRIP004',
        createdAt: new Date('2023-05-18T18:45:00'),
        completedAt: new Date('2023-05-18T19:30:00'),
        status: 'completed',
        pickupLocation: { address: '101 Pine St, City' },
        dropLocation: { address: 'St. Mary Hospital, Westside' },
        patientDetails: { name: 'Emily Wilson', age: 28, additionalNotes: 'Accident injury' },
        fare: 520,
        distance: 15.3
      },
      {
        _id: 'TRIP005',
        createdAt: new Date('2023-05-19T11:00:00'),
        status: 'in-progress',
        pickupLocation: { address: '202 Maple Ave, City' },
        dropLocation: { address: 'County Hospital, Eastside' },
        patientDetails: { name: 'Michael Johnson', age: 52, additionalNotes: 'Stroke symptoms' },
        fare: 0,
        distance: 0
      }
    ]
    
    // Mock earnings summary
    earningsSummary.value = {
      totalEarnings: 1320,
      completedTrips: 3,
      averageFare: 440,
      pendingPayouts: 520
    }
    
    // Mock earnings details (reuse trips data)
    earningsDetails.value = trips.value.filter(trip => trip.status === 'completed')
    
    // Mock chart data - last 14 days
    const today = new Date()
    earningsChartData.value = Array.from({ length: 14 }, (_, i) => {
      const date = new Date()
      date.setDate(today.getDate() - (13 - i))
      
      // Generate random earnings between 0 and 1000, with some days having 0
      const randomEarnings = Math.random() > 0.2 
        ? Math.round(Math.random() * 800 + 200) 
        : 0
        
      return {
        date: date.toISOString().split('T')[0],
        earnings: randomEarnings
      }
    })
    
    // Mock support tickets
    supportTickets.value = [
      {
        _id: 'TICKET001',
        createdAt: new Date('2023-05-10T09:30:00'),
        updatedAt: new Date('2023-05-11T14:20:00'),
        category: 'Payment Problems',
        subject: 'Missing payment for trip on May 5',
        message: 'I completed a trip on May 5th but haven\'t received payment for it yet.',
        status: 'in-progress',
        responses: [
          {
            from: 'Support Agent',
            message: 'We are looking into this issue and will get back to you shortly.',
            timestamp: new Date('2023-05-11T14:20:00')
          }
        ]
      },
      {
        _id: 'TICKET002',
        createdAt: new Date('2023-05-08T16:45:00'),
        updatedAt: new Date('2023-05-09T10:15:00'),
        category: 'App Functionality',
        subject: 'App crashes when accepting trips',
        message: 'The app keeps crashing whenever I try to accept a new trip request.',
        status: 'resolved',
        responses: [
          {
            from: 'Support Agent',
            message: 'Please update your app to the latest version which fixes this issue.',
            timestamp: new Date('2023-05-09T10:15:00')
          },
          {
            from: 'Driver',
            message: 'I updated the app and it\'s working fine now. Thank you!',
            timestamp: new Date('2023-05-09T11:30:00')
          }
        ]
      },
      {
        _id: 'TICKET003',
        createdAt: new Date('2023-05-12T13:20:00'),
        updatedAt: new Date('2023-05-12T13:20:00'),
        category: 'Vehicle Problems',
        subject: 'Need to update vehicle information',
        message: 'I recently changed my vehicle and need to update the information in the system.',
        status: 'open',
        responses: []
      }
    ]
    
    // Set pagination row number
    pagination.value.rowsNumber = trips.value.length
  }
  
  // Fetch driver profile
  const fetchDriverProfile = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await apiClient.get('/driver/profile')
      driverProfile.value = response.data
      
      if (response.data.vehicle) {
        vehicleInfo.value = response.data.vehicle
      }
      
      return driverProfile.value
    } catch (err) {
      console.error('Error fetching driver profile:', err)
      error.value = err.response?.data?.message || 'Failed to fetch driver profile'
      return null
    } finally {
      loading.value = false
    }
  }
  
  // Update driver profile
  const updateDriverProfile = async (profileData) => {
    try {
      loading.value = true
      error.value = null
      
      // If there's a profile image, use FormData
      if (profileData.profileImage) {
        const formData = new FormData()
        
        // Add all profile data to FormData
        Object.keys(profileData).forEach(key => {
          if (key === 'profileImage') {
            formData.append('profileImage', profileData.profileImage)
          } else {
            formData.append(key, profileData[key])
          }
        })
        
        const response = await apiClient.put('/driver/profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        driverProfile.value = response.data
        return true
      } else {
        // Regular JSON request without image
        const response = await apiClient.put('/driver/profile', profileData)
        driverProfile.value = response.data
        return true
      }
    } catch (err) {
      console.error('Error updating driver profile:', err)
      error.value = err.response?.data?.message || 'Failed to update driver profile'
      return false
    } finally {
      loading.value = false
    }
  }
  
  // Update vehicle information
  const updateVehicleInfo = async (vehicleData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await apiClient.put('/driver/vehicle', vehicleData)
      vehicleInfo.value = response.data
      
      // Update vehicle info in driver profile
      if (driverProfile.value) {
        driverProfile.value.vehicle = response.data
      }
      
      return true
    } catch (err) {
      console.error('Error updating vehicle information:', err)
      error.value = err.response?.data?.message || 'Failed to update vehicle information'
      return false
    } finally {
      loading.value = false
    }
  }

  // Load mock data for development
  if (process.env.NODE_ENV === 'development') {
    loadMockData()
    
    // Mock driver profile data
    driverProfile.value = {
      licenseNumber: 'DL12345678',
      licenseExpiry: '2025-12-31',
      experience: '3-5 years',
      emergencyContact: '9876543210',
      vehicle: {
        registrationNumber: 'MH01AB1234',
        model: 'Toyota Hiace',
        year: 2020,
        type: 'Basic Ambulance',
        insuranceNumber: 'INS987654321',
        insuranceExpiry: '2024-06-30'
      }
    }
    
    vehicleInfo.value = driverProfile.value.vehicle
  }
  
  return {
    // State
    loading,
    error,
    trips,
    pagination,
    earningsDetails,
    earningsSummary,
    earningsChartData,
    supportTickets,
    driverProfile,
    vehicleInfo,
    
    // Actions
    updatePagination,
    fetchTrips,
    fetchEarnings,
    fetchSupportTickets,
    createSupportTicket,
    addTicketResponse,
    closeTicket,
    fetchDriverProfile,
    updateDriverProfile,
    updateVehicleInfo,
    loadMockData
  }
})