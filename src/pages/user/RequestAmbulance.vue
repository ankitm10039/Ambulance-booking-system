<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-8">
        <q-card class="q-pa-md">
          <q-card-section>
            <div class="text-h5">Request Ambulance</div>
            <div class="text-subtitle2 text-grey">Please provide emergency details</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <!-- Emergency Type Selection -->
              <div>
                <div class="text-subtitle2 q-mb-sm">Emergency Type</div>
                <q-option-group
                  v-model="emergencyType"
                  :options="[
                    { label: 'Medical Emergency', value: 'medical' },
                    { label: 'Accident', value: 'accident' },
                    { label: 'Critical Care Transfer', value: 'transfer' }
                  ]"
                  color="primary"
                  type="radio"
                />
              </div>

              <!-- Location Details -->
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    filled
                    v-model="pickupLocation"
                    label="Pickup Location"
                    :rules="[val => !!val || 'Pickup location is required']"
                    ref="pickupInput"
                    id="pickup-input"
                  >
                    <template v-slot:append>
                      <q-icon name="location_on" class="cursor-pointer" @click="getCurrentLocation" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12">
                  <q-input
                    filled
                    v-model="dropLocation"
                    label="Hospital/Drop Location (Optional)"
                    ref="dropInput"
                    id="drop-input"
                  />
                </div>
                
                <!-- Map for location selection -->
                <div class="col-12 q-mt-md">
                  <q-card>
                    <q-card-section class="q-pa-none">
                      <div id="map-container" style="height: 300px; width: 100%"></div>
                    </q-card-section>
                    <q-card-section v-if="mapError" class="text-negative">
                      {{ mapError }}
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- Patient Details -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    v-model="patientName"
                    label="Patient Name"
                    :rules="[val => !!val || 'Patient name is required']"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    v-model="patientAge"
                    label="Patient Age"
                    type="number"
                    :rules="[val => !!val || 'Patient age is required']"
                  />
                </div>
              </div>

              <!-- Additional Requirements -->
              <div>
                <div class="text-subtitle2 q-mb-sm">Additional Requirements</div>
                <q-option-group
                  v-model="requirements"
                  :options="[
                    { label: 'Oxygen Support', value: 'oxygen' },
                    { label: 'Stretcher', value: 'stretcher' },
                    { label: 'Wheelchair', value: 'wheelchair' },
                    { label: 'Medical Staff', value: 'staff' }
                  ]"
                  color="primary"
                  type="checkbox"
                />
              </div>

              <!-- Emergency Description -->
              <q-input
                filled
                v-model="description"
                label="Emergency Description"
                type="textarea"
                :rules="[val => !!val || 'Please provide emergency description']"
              />

              <!-- Contact Information -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    v-model="contactName"
                    label="Contact Person Name"
                    :rules="[val => !!val || 'Contact name is required']"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    v-model="contactPhone"
                    label="Contact Phone Number"
                    :rules="[val => !!val || 'Contact phone is required']"
                  />
                </div>
              </div>

              <!-- Submit Button -->
              <div class="row justify-center q-mt-md">
                <q-btn
                  type="submit"
                  color="negative"
                  label="Request Emergency Ambulance"
                  class="full-width"
                  size="lg"
                  :loading="loading"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useBookingStore } from 'stores/booking'
import { loadGoogleMapsApi, geocodeAddress, reverseGeocode } from 'src/services/map.service'

const $q = useQuasar()
const router = useRouter()
const bookingStore = useBookingStore()
const loading = ref(false)
const mapLoaded = ref(false)
const mapError = ref(null)
const pickupCoordinates = ref([0, 0])
const dropCoordinates = ref([0, 0])
const map = ref(null)
const pickupMarker = ref(null)
const dropMarker = ref(null)
const autocompletePickup = ref(null)
const autocompleteDrop = ref(null)

// Form Data
const emergencyType = ref('medical')
const pickupLocation = ref('')
const dropLocation = ref('')
const patientName = ref('')
const patientAge = ref('')
const requirements = ref([])
const description = ref('')
const contactName = ref('')
const contactPhone = ref('')

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
      streetViewControl: false
    }
    
    const mapElement = document.getElementById('map-container')
    map.value = new window.google.maps.Map(mapElement, mapOptions)
    
    // Create markers
    pickupMarker.value = new window.google.maps.Marker({
      map: map.value,
      draggable: true,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      }
    })
    
    dropMarker.value = new window.google.maps.Marker({
      map: map.value,
      draggable: true,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      },
      visible: false
    })
    
    // Add event listeners for marker drag
    window.google.maps.event.addListener(pickupMarker.value, 'dragend', async function() {
      const position = pickupMarker.value.getPosition()
      pickupCoordinates.value = [position.lng(), position.lat()]
      
      try {
        const result = await reverseGeocode(position.lat(), position.lng())
        pickupLocation.value = result.address
      } catch (error) {
        console.error('Reverse geocoding error:', error)
      }
    })
    
    window.google.maps.event.addListener(dropMarker.value, 'dragend', async function() {
      const position = dropMarker.value.getPosition()
      dropCoordinates.value = [position.lng(), position.lat()]
      
      try {
        const result = await reverseGeocode(position.lat(), position.lng())
        dropLocation.value = result.address
      } catch (error) {
        console.error('Reverse geocoding error:', error)
      }
    })
    
    // Initialize autocomplete for pickup and drop inputs
    const pickupInputElement = document.getElementById('pickup-input')
    if (pickupInputElement) {
      autocompletePickup.value = new window.google.maps.places.Autocomplete(pickupInputElement)
      autocompletePickup.value.addListener('place_changed', () => {
        const place = autocompletePickup.value.getPlace()
        if (place.geometry) {
          const location = place.geometry.location
          pickupCoordinates.value = [location.lng(), location.lat()]
          
          map.value.setCenter(location)
          pickupMarker.value.setPosition(location)
          pickupMarker.value.setVisible(true)
          
          pickupLocation.value = place.formatted_address
        }
      })
    }
    
    const dropInputElement = document.getElementById('drop-input')
    if (dropInputElement) {
      autocompleteDrop.value = new window.google.maps.places.Autocomplete(dropInputElement)
      autocompleteDrop.value.addListener('place_changed', () => {
        const place = autocompleteDrop.value.getPlace()
        if (place.geometry) {
          const location = place.geometry.location
          dropCoordinates.value = [location.lng(), location.lat()]
          
          dropMarker.value.setPosition(location)
          dropMarker.value.setVisible(true)
          
          dropLocation.value = place.formatted_address
        }
      })
    }
    
  } catch (error) {
    console.error('Error initializing map:', error)
    mapError.value = 'Failed to load Google Maps. Please try again later.'
  }
}

// Get Current Location
const getCurrentLocation = () => {
  if ('geolocation' in navigator) {
    $q.loading.show()
    navigator.geolocation.getCurrentPosition(
      async position => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        pickupCoordinates.value = [lng, lat]
        
        // Update map if loaded
        if (mapLoaded.value && map.value && pickupMarker.value) {
          const latLng = new window.google.maps.LatLng(lat, lng)
          map.value.setCenter(latLng)
          pickupMarker.value.setPosition(latLng)
          pickupMarker.value.setVisible(true)
        }
        
        // Get address from coordinates
        try {
          const result = await reverseGeocode(lat, lng)
          pickupLocation.value = result.address
        } catch (error) {
          console.error('Reverse geocoding error:', error)
          pickupLocation.value = `${lat}, ${lng}`
        }
        
        $q.loading.hide()
      },
      error => {
        $q.loading.hide()
        $q.notify({
          color: 'negative',
          message: 'Could not get location: ' + error.message
        })
      },
      { enableHighAccuracy: true }
    )
  } else {
    $q.notify({
      color: 'negative',
      message: 'Geolocation is not supported by your browser'
    })
  }
}

// Form Submit
// Add lifecycle hooks
onMounted(() => {
  // Initialize map
  initializeMap()
})

onUnmounted(() => {
  // Clean up map resources
  map.value = null
  pickupMarker.value = null
  dropMarker.value = null
  autocompletePickup.value = null
  autocompleteDrop.value = null
})

const onSubmit = async () => {
  try {
    loading.value = true
    
    // Format the data according to the backend model
    const bookingData = {
      bookingType: 'emergency',
      patientDetails: {
        name: patientName.value,
        age: parseInt(patientAge.value),
        additionalNotes: description.value
      },
      pickupLocation: {
        address: pickupLocation.value,
        coordinates: pickupCoordinates.value
      },
      dropLocation: {
        address: dropLocation.value || 'To be determined',
        coordinates: dropLocation.value ? dropCoordinates.value : [0, 0]
      },
      scheduledTime: new Date(),
      requirements: requirements.value,
      emergencyContact: {
        name: contactName.value,
        phone: contactPhone.value
      }
    }

    console.log('Sending booking data to backend:', bookingData)
    
    // Call the createBooking action from the store
    const result = await bookingStore.createBooking(bookingData)
    
    if (result) {
      // Show success notification
      $q.notify({
        color: 'positive',
        message: 'Emergency request submitted. An ambulance will be dispatched shortly.',
        timeout: 5000
      })
      
      // Redirect to tracking page or dashboard
      router.push({
        name: 'track-ambulance',
        params: { id: result._id }
      })
    } else {
      throw new Error('Failed to create booking')
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    
    $q.notify({
      color: 'negative',
      message: 'Failed to submit request. Please try again.',
      timeout: 5000
    })
  } finally {
    loading.value = false
  }
}
</script>