import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { register as authRegister, login as authLogin, getProfile, updateProfile as authUpdateProfile, changePassword as authChangePassword } from 'src/services/auth.service'
import { setAuthToken } from 'src/services/api.service'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => user.value?.name || '')

  // Actions
  const login = async (credentials) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await authLogin(credentials)
      console.log('Login response:', response.data)
      
      if (response.data.success && response.data.token) {
        user.value = response.data.user
        token.value = response.data.token
        
        // Store token, user role, and user data in localStorage
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userRole', response.data.user.role)
        localStorage.setItem('userData', JSON.stringify(response.data.user))
        
        // Set auth token for API requests
        setAuthToken(response.data.token)
        
        return true
      } else {
        throw new Error(response.data.message || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to login'
      return false
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await authRegister(userData)
      user.value = response.data.user
      token.value = response.data.token
      
      // Store token, user role, and user data in localStorage
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('userRole', response.data.user.role)
      localStorage.setItem('userData', JSON.stringify(response.data.user))
      
      // Set auth token for API requests
      setAuthToken(response.data.token)
      
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to register'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userData')
    setAuthToken(null)
  }

  const checkAuth = async () => {
    const storedToken = token.value || localStorage.getItem('token')
    if (storedToken) {
      try {
        console.log('Checking auth with token:', storedToken)
        token.value = storedToken
        setAuthToken(storedToken)
        
        // Try to get user data from localStorage first
        const storedUserData = localStorage.getItem('userData')
        if (storedUserData) {
          try {
            user.value = JSON.parse(storedUserData)
          } catch (e) {
            console.error('Error parsing stored user data:', e)
          }
        }
        
        // Then verify with the server
        const response = await getProfile()
        console.log('Profile response:', response.data)
        
        if (response.data.success && response.data.user) {
          user.value = response.data.user
          localStorage.setItem('userRole', response.data.user.role)
          localStorage.setItem('userData', JSON.stringify(response.data.user))
          return true
        } else {
          throw new Error('Invalid user data')
        }
      } catch (err) {
        console.error('Auth check error:', err)
        // Don't immediately logout on network errors
        if (err.message === 'Network Error' && user.value) {
          console.log('Network error but using cached user data')
          return true
        }
        logout()
        error.value = 'Session expired'
        return false
      }
    }
    return false
  }

  const updateProfile = async (profileData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await authUpdateProfile(profileData)
      user.value = response.data.user
      
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update profile'
      return false
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (passwordData) => {
    try {
      loading.value = true
      error.value = null
      
      await authChangePassword(passwordData)
      
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to change password'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    userRole,
    userName,
    
    // Actions
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
    changePassword
  }
})