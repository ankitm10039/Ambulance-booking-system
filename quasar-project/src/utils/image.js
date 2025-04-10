/**
 * Utility functions for handling images
 */

// Base URL for the backend server (without /api since static files are served from root)
const API_BASE_URL = 'http://localhost:5000'

/**
 * Format image URL by adding the backend base URL if needed
 * @param {string} imagePath - The image path from the API
 * @param {string} defaultImage - The default image to use if no image is provided
 * @returns {string} - The complete image URL
 */
export function getImageUrl(imagePath, defaultImage = 'https://via.placeholder.com/150?text=No+Image') {
  if (!imagePath) return defaultImage
  
  // Check if the image path is already a full URL
  if (imagePath.startsWith('http')) return imagePath
  
  // If the path starts with a slash, use it as is, otherwise add one
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  
  // Prepend the backend URL
  return `${API_BASE_URL}${normalizedPath}`
}

/**
 * Get a default avatar image
 * @returns {string} - The default avatar URL
 */
export function getDefaultAvatar() {
  return 'https://cdn.quasar.dev/img/avatar.png'
}

/**
 * Get a default vehicle image
 * @returns {string} - The default vehicle URL
 */
export function getDefaultVehicleImage() {
  return 'https://via.placeholder.com/150?text=Ambulance'
}