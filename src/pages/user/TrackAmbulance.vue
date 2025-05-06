<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Map Section -->
      <div class="col-12 col-md-8">
        <q-card class="map-container">
          <q-card-section class="row items-center">
            <div class="text-h6">Live Tracking</div>
            <q-space />
            <q-spinner v-if="loading" color="primary" size="2em" />
          </q-card-section>
          
          <q-card-section class="map-placeholder q-pa-none">
            <div id="tracking-map" class="map-frame">
              <div v-if="!mapLoaded" class="text-center text-grey q-pa-md">
                <q-spinner size="50px" color="primary" />
                <div class="q-mt-sm">Loading map...</div>
              </div>
            </div>
            <div v-if="mapError" class="text-negative q-pa-md">
              {{ mapError }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Details Section -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Ambulance Details</div>
          </q-card-section>

          <q-card-section>
            <div class="text-subtitle2 text-weight-bold">Status</div>
            <q-chip
              :color="getStatusColor(booking?.status)"
              text-color="white"
              icon="local_shipping"
            >
              {{ booking?.status ? formatStatus(booking.status) : 'Loading...' }}
            </q-chip>

            <div class="q-mt-md">
              <div class="text-subtitle2 text-weight-bold">Estimated Time</div>
              <div class="text-h5 text-primary">{{ estimatedArrival || (booking?.estimatedTime ? `${booking.estimatedTime} mins` : 'Calculating...') }}</div>
              <div class="text-caption">Distance: {{ distance || (booking?.distance ? `${booking.distance} km` : 'Calculating...') }}</div>
            </div>

            <q-separator class="q-my-md" />

            <div class="text-subtitle2 text-weight-bold">Driver Information</div>
            <div v-if="booking?.driver" class="row items-center q-mt-sm">
              <q-avatar size="48px">
                <img src="https://cdn.quasar.dev/img/avatar.png">
              </q-avatar>
              <div class="q-ml-md">
                <div class="text-weight-medium">{{ booking.driver.user?.name || 'Driver Assigned' }}</div>
                <div class="text-caption">License: {{ booking.driver.licenseNumber || 'N/A' }}</div>
              </div>
            </div>
            <div v-else class="text-body2 q-mt-sm">
              <q-skeleton v-if="loading" type="text" />
              <div v-else>Driver will be assigned shortly</div>
            </div>

            <div class="q-mt-md">
              <div class="text-subtitle2 text-weight-bold">Vehicle Details</div>
              <div v-if="booking?.vehicle" class="text-body2">
                <div>Vehicle No: {{ booking.vehicle.registrationNumber }}</div>
                <div>Type: {{ booking.vehicle.type }}</div>
                <div>Model: {{ booking.vehicle.model }}</div>
              </div>
              <div v-else class="text-body2">
                <q-skeleton v-if="loading" type="text" />
                <div v-else>Vehicle will be assigned shortly</div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="text-subtitle2 text-weight-bold">Emergency Contact</div>
            <div class="row q-mt-sm">
              <q-btn
                flat
                color="primary"
                icon="phone"
                label="Call Driver"
                class="full-width q-mb-sm"
              />
              <q-btn
                flat
                color="negative"
                icon="warning"
                label="Emergency Helpline"
                class="full-width"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Trip Details -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-subtitle2 text-weight-bold">Trip Details</div>
            <div v-if="booking" class="q-mt-sm">
              <div class="row items-center q-mb-sm">
                <q-icon name="location_on" color="primary" size="sm" />
                <div class="q-ml-sm">Pickup: {{ booking.pickupLocation?.address || 'Loading...' }}</div>
              </div>
              <div class="row items-center">
                <q-icon name="local_hospital" color="negative" size="sm" />
                <div class="q-ml-sm">Drop: {{ booking.dropLocation?.address || 'To be determined' }}</div>
              </div>
              <div class="row items-center q-mt-sm">
                <q-icon name="person" color="secondary" size="sm" />
                <div class="q-ml-sm">Patient: {{ booking.patientDetails?.name || 'Not specified' }}</div>
              </div>
            </div>
            <div v-else>
              <q-skeleton v-if="loading" type="text" />
              <div v-else class="text-body2">Trip details not available</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useBookingStore } from 'stores/booking'
import { loadGoogleMapsApi, calculateRoute, getDriverLocation } from 'src/services/map.service'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const bookingStore = useBookingStore()

const bookingId = ref(route.params.id)
const booking = ref(null)
const loading = ref(true)
const error = ref(null)
const mapLoaded = ref(false)
const mapError = ref(null)
const map = ref(null)
const userMarker = ref(null)
const driverMarker = ref(null)
const directionsRenderer = ref(null)
const locationUpdateInterval = ref(null)
const estimatedArrival = ref(null)
const distance = ref(null)

// In a real implementation, you would:
// 1. Connect to a WebSocket or use polling to get real-time location updates
// 2. Integrate with a maps service (Google Maps, Mapbox, etc.)
// 3. Implement actual driver communication
// 4. Add real-time ETA calculations

const getStatusColor = (status) => {
  if (!status) return 'grey'
  
  switch (status) {
    case 'pending':
      return 'blue'
    case 'confirmed':
      return 'orange'
    case 'in-progress':
      return 'warning'
    case 'completed':
      return 'positive'
    case 'cancelled':
      return 'negative'
    default:
      return 'grey'
  }
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  
  // Convert from kebab-case to Title Case
  return status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Initialize Google Maps
const initializeMap = async () => {
  try {
    // Load Google Maps API
    await loadGoogleMapsApi()
    mapLoaded.value = true
    
    // Create map instance
    const mapOptions = {
      center: { lat: 20.5937, lng: 78.9629 }, // Default to center of India
      zoom: 12,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false
    }
    
    const mapElement = document.getElementById('tracking-map')
    map.value = new window.google.maps.Map(mapElement, mapOptions)
    
    // Create markers
    userMarker.value = new window.google.maps.Marker({
      map: map.value,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      },
      visible: false
    })
    
    driverMarker.value = new window.google.maps.Marker({
      map: map.value,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
      },
      visible: false
    })
    
    // Initialize directions renderer
    directionsRenderer.value = new window.google.maps.DirectionsRenderer({
      map: map.value,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#4285F4',
        strokeWeight: 5
      }
    })
    
  } catch (error) {
    console.error('Error initializing map:', error)
    mapError.value = 'Failed to load Google Maps. Please try again later.'
  }
}

// Update driver location on map
const updateDriverLocation = async () => {
  if (!booking.value || !booking.value.driver || !mapLoaded.value) return
  
  try {
    // In a real app, you would fetch the driver's current location from the server
    // For now, we'll simulate it by using the driver's last known location
    const driverId = booking.value.driver._id
    
    // This would be a real API call in production
    // const response = await getDriverLocation(driverId)
    // const driverLocation = response.data.location
    
    // For demo purposes, we'll use the driver's current location from the booking
    // or simulate movement if not available
    let driverLocation
    
    if (booking.value.driver.currentLocation && 
        booking.value.driver.currentLocation.coordinates && 
        booking.value.driver.currentLocation.coordinates.length === 2) {
      // Use the driver's current location
      driverLocation = {
        lng: booking.value.driver.currentLocation.coordinates[0],
        lat: booking.value.driver.currentLocation.coordinates[1]
      }
    } else {
      // Simulate driver location (moving towards pickup)
      const pickupCoords = booking.value.pickupLocation.coordinates
      
      if (!pickupCoords || pickupCoords.length !== 2 || 
          (pickupCoords[0] === 0 && pickupCoords[1] === 0)) {
        // No valid coordinates, can't simulate movement
        return
      }
      
      // If we don't have a previous position, start a bit away from the pickup
      if (!driverMarker.value.getVisible()) {
        // Start 1-2 km away from pickup in a random direction
        const angle = Math.random() * Math.PI * 2 // Random angle
        const distance = 0.01 + Math.random() * 0.01 // ~1-2 km in coordinates
        
        driverLocation = {
          lng: pickupCoords[0] + Math.cos(angle) * distance,
          lat: pickupCoords[1] + Math.sin(angle) * distance
        }
      } else {
        // Move towards pickup location
        const currentPos = driverMarker.value.getPosition()
        const pickupPos = userMarker.value.getPosition()
        
        // Move 5% of the remaining distance
        driverLocation = {
          lng: currentPos.lng() + (pickupPos.lng() - currentPos.lng()) * 0.05,
          lat: currentPos.lat() + (pickupPos.lat() - currentPos.lat()) * 0.05
        }
      }
    }
    
    // Update driver marker
    const driverLatLng = new window.google.maps.LatLng(driverLocation.lat, driverLocation.lng)
    driverMarker.value.setPosition(driverLatLng)
    driverMarker.value.setVisible(true)
    
    // Calculate route between driver and pickup
    if (userMarker.value.getVisible()) {
      const directionsService = new window.google.maps.DirectionsService()
      
      directionsService.route({
        origin: driverLatLng,
        destination: userMarker.value.getPosition(),
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === 'OK') {
          directionsRenderer.value.setDirections(result)
          
          // Update ETA and distance
          const route = result.routes[0]
          if (route && route.legs && route.legs.length > 0) {
            const leg = route.legs[0]
            estimatedArrival.value = leg.duration.text
            distance.value = leg.distance.text
          }
        }
      })
    }
    
  } catch (error) {
    console.error('Error updating driver location:', error)
  }
}

const fetchBookingDetails = async () => {
  try {
    loading.value = true
    error.value = null
    
    if (!bookingId.value) {
      throw new Error('Booking ID is missing')
    }
    
    const result = await bookingStore.getBookingById(bookingId.value)
    
    if (result) {
      booking.value = result
      console.log('Booking details:', booking.value)
      
      // Update map with booking locations
      if (mapLoaded.value && booking.value) {
        // Set user marker at pickup location
        if (booking.value.pickupLocation && 
            booking.value.pickupLocation.coordinates && 
            booking.value.pickupLocation.coordinates.length === 2 &&
            booking.value.pickupLocation.coordinates[0] !== 0 && 
            booking.value.pickupLocation.coordinates[1] !== 0) {
          
          const pickupLatLng = new window.google.maps.LatLng(
            booking.value.pickupLocation.coordinates[1], 
            booking.value.pickupLocation.coordinates[0]
          )
          
          userMarker.value.setPosition(pickupLatLng)
          userMarker.value.setVisible(true)
          map.value.setCenter(pickupLatLng)
        }
        
        // Start location updates
        updateDriverLocation()
        
        // Set up interval for location updates (every 5 seconds)
        locationUpdateInterval.value = setInterval(updateDriverLocation, 5000)
      }
    } else {
      throw new Error('Failed to fetch booking details')
    }
  } catch (err) {
    console.error('Error fetching booking:', err)
    error.value = err.message || 'Failed to load booking details'
    
    $q.notify({
      color: 'negative',
      message: error.value,
      timeout: 5000
    })
    
    // Redirect back to dashboard if booking not found
    router.push({ name: 'user-dashboard' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Initialize map and tracking functionality
  console.log('Tracking component mounted with booking ID:', bookingId.value)
  
  // Initialize map first
  await initializeMap()
  
  // Then fetch booking details
  fetchBookingDetails()
})

onUnmounted(() => {
  // Clean up resources
  if (locationUpdateInterval.value) {
    clearInterval(locationUpdateInterval.value)
  }
  
  map.value = null
  userMarker.value = null
  driverMarker.value = null
  directionsRenderer.value = null
})
</script>

<style scoped>
.map-container {
  height: 80vh;
}

.map-frame {
  height: 100%;
  min-height: 400px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-placeholder {
  height: calc(80vh - 50px);
}
</style>