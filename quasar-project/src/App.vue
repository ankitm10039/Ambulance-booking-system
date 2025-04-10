<template>
  <router-view v-if="!loading" />
  <div v-else class="fullscreen flex flex-center">
    <q-spinner-dots size="50px" color="primary" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useBookingStore } from 'stores/booking'
import { setAuthToken } from 'src/services/api.service'

const router = useRouter()
const authStore = useAuthStore()
const bookingStore = useBookingStore()
const loading = ref(true)

// Public routes that don't require authentication
const publicRoutes = ['login', 'register']

// Route guards
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = authStore.isAuthenticated
  const isPublicRoute = publicRoutes.includes(to.name)

  if (!isAuthenticated && !isPublicRoute) {
    // Redirect to login if trying to access protected route without authentication
    next({ name: 'login' })
  } else if (isAuthenticated && isPublicRoute) {
    // Redirect to appropriate dashboard if trying to access public route while authenticated
    switch (authStore.userRole) {
      case 'admin':
        next({ name: 'admin-dashboard' })
        break
      case 'driver':
        next({ name: 'driver-dashboard' })
        break
      default:
        next({ name: 'user-dashboard' })
    }
  } else {
    // Check role-based access
    const userRole = authStore.userRole
    const path = to.path

    if (
      (path.startsWith('/admin') && userRole !== 'admin') ||
      (path.startsWith('/driver') && userRole !== 'driver') ||
      (path.startsWith('/user') && userRole !== 'user')
    ) {
      // Redirect to appropriate dashboard if trying to access unauthorized role's routes
      switch (userRole) {
        case 'admin':
          next({ name: 'admin-dashboard' })
          break
        case 'driver':
          next({ name: 'driver-dashboard' })
          break
        default:
          next({ name: 'user-dashboard' })
      }
    } else {
      next()
    }
  }
})

onMounted(async () => {
  try {
    console.log('App mounted, checking authentication...')
    
    // Initialize auth token from localStorage
    const token = localStorage.getItem('token')
    if (token) {
      console.log('Found token in localStorage')
      setAuthToken(token)
    } else {
      console.log('No token found in localStorage')
    }
    
    // Check authentication status
    const isAuthenticated = await authStore.checkAuth()
    console.log('Authentication check result:', isAuthenticated)

    // If authenticated, fetch initial data based on user role
    if (isAuthenticated) {
      const userRole = authStore.userRole
      console.log('User role:', userRole)
      
      try {
        if (userRole === 'admin') {
          await bookingStore.fetchAllBookings()
        } else if (userRole === 'driver') {
          await bookingStore.fetchDriverBookings()
        } else {
          await bookingStore.fetchUserBookings()
        }
      } catch (fetchError) {
        console.error('Error fetching initial data:', fetchError)
      }
    }
  } catch (error) {
    console.error('Error during app initialization:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style>
/* Add any global styles here */
</style>
