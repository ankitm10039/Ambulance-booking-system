<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Driver Status Card -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-center">
              <q-avatar size="100px">
                <img :src="driverProfile.profilePicture || 'https://cdn.quasar.dev/img/boy-avatar.png'">
              </q-avatar>
              <div class="text-h6 q-mt-sm">{{ driverProfile.name }}</div>
              <div class="text-subtitle2">ID: {{ driverProfile.id }}</div>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle1">Status</div>
              <q-toggle
                v-model="isOnline"
                color="positive"
                :label="isOnline ? 'Online' : 'Offline'"
                @update:model-value="toggleStatus"
              />
            </div>

            <!-- Today's Stats -->
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-card class="text-center bg-blue-1">
                  <q-card-section>
                    <div class="text-h6">{{ todayStats.trips }}</div>
                    <div class="text-subtitle2">Trips Today</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-6">
                <q-card class="text-center bg-green-1">
                  <q-card-section>
                    <div class="text-h6">₹{{ todayStats.earnings }}</div>
                    <div class="text-subtitle2">Today's Earnings</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-list>
            <q-item clickable v-ripple to="/driver/profile">
              <q-item-section avatar>
                <q-icon name="person" color="primary" />
              </q-item-section>
              <q-item-section>Profile</q-item-section>
            </q-item>

            <q-expansion-item
              icon="directions_car"
              label="Vehicle Details"
              header-class="text-primary"
            >
              <q-card>
                <q-card-section>
                  <div class="row q-col-gutter-sm">
                    <div class="col-12">
                      <div class="text-subtitle2">Registration</div>
                      <div>{{ vehicleDetails.registrationNumber }}</div>
                    </div>
                    <div class="col-12">
                      <div class="text-subtitle2">Model</div>
                      <div>{{ vehicleDetails.model }}</div>
                    </div>
                    <div class="col-12">
                      <div class="text-subtitle2">Type</div>
                      <div>{{ vehicleDetails.type }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-item clickable v-ripple to="/driver/earnings">
              <q-item-section avatar>
                <q-icon name="account_balance_wallet" color="primary" />
              </q-item-section>
              <q-item-section>Earnings</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/driver/trip-history">
              <q-item-section avatar>
                <q-icon name="history" color="primary" />
              </q-item-section>
              <q-item-section>Trip History</q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <!-- Performance Card -->
        <q-card class="q-mt-md">
          <q-card-section class="bg-secondary text-white">
            <div class="text-h6">Performance</div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <div class="text-subtitle2">Rating</div>
                <div class="row items-center">
                  <q-rating
                    v-model="performance.rating"
                    max="5"
                    size="1.5em"
                    color="amber"
                    readonly
                  />
                  <div class="q-ml-sm text-h6">{{ performance.rating.toFixed(1) }}</div>
                </div>
              </div>
              <div class="col-12">
                <div class="text-subtitle2">Acceptance Rate</div>
                <q-linear-progress
                  :value="performance.acceptanceRate / 100"
                  color="positive"
                  class="q-mt-sm"
                  style="height: 10px"
                />
                <div class="row justify-between q-mt-xs">
                  <div class="text-caption">{{ performance.acceptanceRate }}%</div>
                  <div class="text-caption">Target: 90%</div>
                </div>
              </div>
              <div class="col-12">
                <div class="text-subtitle2">Completion Rate</div>
                <q-linear-progress
                  :value="performance.completionRate / 100"
                  color="info"
                  class="q-mt-sm"
                  style="height: 10px"
                />
                <div class="row justify-between q-mt-xs">
                  <div class="text-caption">{{ performance.completionRate }}%</div>
                  <div class="text-caption">Target: 95%</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Main Content Section -->
      <div class="col-12 col-md-8">
        <!-- New Trip Request Card -->
        <q-card v-if="newTripRequest" class="q-mb-md bg-blue-1">
          <q-card-section>
            <div class="text-h6">New Trip Request</div>
            <q-badge color="warning" class="q-ml-sm">
              Expires in {{ tripRequestCountdown }}s
            </q-badge>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="text-subtitle2">Patient Details</div>
                <div>Name: {{ newTripRequest.patientName }}</div>
                <div>Age: {{ newTripRequest.patientAge }}</div>
                <div>Emergency Type: {{ newTripRequest.emergencyType }}</div>
              </div>
              <div class="col-12 col-md-6">
                <div class="text-subtitle2">Trip Details</div>
                <div>Distance: {{ newTripRequest.distance }} km</div>
                <div>Estimated Fare: ₹{{ newTripRequest.estimatedFare }}</div>
                <div>Estimated Time: {{ newTripRequest.estimatedTime }} min</div>
              </div>
              <div class="col-12">
                <div class="text-subtitle2">Pickup Location</div>
                <div>{{ newTripRequest.pickupAddress }}</div>
              </div>
              <div class="col-12">
                <div class="text-subtitle2">Destination</div>
                <div>{{ newTripRequest.destinationAddress }}</div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn color="negative" label="Decline" @click="declineTripRequest" />
            <q-btn color="positive" label="Accept" @click="acceptTripRequest" />
          </q-card-actions>
        </q-card>

        <!-- Current Trip Card (if any) -->
        <q-card v-if="currentTrip" class="q-mb-md bg-yellow-1">
          <q-card-section>
            <div class="text-h6">Current Trip</div>
            <q-badge :color="getTripStatusColor(currentTrip.status)" class="q-ml-sm">
              {{ currentTrip.status }}
            </q-badge>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="text-subtitle2">Patient Details</div>
                <div>Name: {{ currentTrip.patientName }}</div>
                <div>Age: {{ currentTrip.patientAge }}</div>
                <div>Contact: {{ currentTrip.contactNumber }}</div>
                <div>Emergency Type: {{ currentTrip.emergencyType }}</div>
              </div>
              <div class="col-12 col-md-6">
                <div class="text-subtitle2">Trip Details</div>
                <div>Distance: {{ currentTrip.distance }} km</div>
                <div>Fare: ₹{{ currentTrip.fare }}</div>
                <div>Booking Time: {{ formatDateTime(currentTrip.bookingTime) }}</div>
              </div>
              <div class="col-12">
                <div class="text-subtitle2">Pickup Location</div>
                <div>{{ currentTrip.pickup }}</div>
              </div>
              <div class="col-12">
                <div class="text-subtitle2">Destination</div>
                <div>{{ currentTrip.destination }}</div>
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-stepper
                  v-model="tripStep"
                  vertical
                  color="primary"
                  :contracted="$q.screen.lt.md"
                >
                  <q-step
                    :name="1"
                    title="Accepted"
                    icon="check_circle"
                    :done="tripStep > 1"
                  >
                    <div class="text-caption">Trip accepted at {{ formatDateTime(currentTrip.acceptedTime) }}</div>
                  </q-step>

                  <q-step
                    :name="2"
                    title="En Route to Pickup"
                    icon="directions_car"
                    :done="tripStep > 2"
                  >
                    <div v-if="tripStep === 2">
                      <q-btn color="primary" label="Arrived at Pickup" @click="arrivedAtPickup" />
                    </div>
                  </q-step>

                  <q-step
                    :name="3"
                    title="Patient Picked Up"
                    icon="person_add"
                    :done="tripStep > 3"
                  >
                    <div v-if="tripStep === 3">
                      <q-btn color="primary" label="Start Journey" @click="startJourney" />
                    </div>
                  </q-step>

                  <q-step
                    :name="4"
                    title="En Route to Destination"
                    icon="local_hospital"
                    :done="tripStep > 4"
                  >
                    <div v-if="tripStep === 4">
                      <q-btn color="primary" label="Arrived at Destination" @click="arrivedAtDestination" />
                    </div>
                  </q-step>

                  <q-step
                    :name="5"
                    title="Trip Completed"
                    icon="done_all"
                  >
                    <div v-if="tripStep === 5">
                      <q-btn color="positive" label="Complete Trip" @click="completeTrip" />
                    </div>
                  </q-step>
                </q-stepper>
              </div>
            </div>
          </q-card-section>

          <q-card-actions>
            <q-btn-group spread>
              <q-btn color="primary" icon="navigation" label="Navigate" @click="openNavigation" />
              <q-btn color="secondary" icon="call" label="Contact" @click="contactPatient" />
              <q-btn color="negative" icon="cancel" label="Emergency Cancel" @click="showCancelDialog = true" />
            </q-btn-group>
          </q-card-actions>
        </q-card>

        <!-- Map Card -->
        <q-card v-if="currentTrip" class="q-mb-md">
          <q-card-section>
            <div class="text-h6">Trip Map</div>
          </q-card-section>
          <q-card-section class="map-container">
            <!-- Map placeholder - would be replaced with actual map component -->
            <div class="map-placeholder">
              <q-icon name="map" size="50px" color="grey-7" />
              <div class="text-subtitle1 text-grey-7">Map view would be displayed here</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Recent Trips -->
        <q-card>
          <q-card-section>
            <div class="text-h6">Recent Trips</div>
          </q-card-section>

          <q-card-section>
            <q-table
              :rows="recentTrips"
              :columns="tripColumns"
              row-key="id"
              :pagination="{ rowsPerPage: 5 }"
              :loading="loading"
            >
              <template v-slot:body-cell-amount="props">
                <q-td :props="props">
                  ₹{{ props.value }}
                </q-td>
              </template>

              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="getTripStatusColor(props.value)"
                    text-color="white"
                    size="sm"
                  >
                    {{ props.value }}
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="visibility"
                    @click="viewTripDetails(props.row)"
                  >
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>
                </q-td>
              </template>

              <template v-slot:bottom>
                <div class="row full-width justify-center q-mt-md">
                  <q-btn
                    color="primary"
                    label="View All Trips"
                    icon="history"
                    to="/driver/trip-history"
                  />
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Trip Details Dialog -->
    <q-dialog v-model="showTripDetails" persistent>
      <q-card style="min-width: 350px; max-width: 700px;">
        <q-card-section class="row items-center">
          <div class="text-h6">Trip Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedTrip">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-subtitle2 q-mb-xs">Trip ID</div>
              <div class="text-body2 q-mb-md">{{ selectedTrip.id }}</div>

              <div class="text-subtitle2 q-mb-xs">Date & Time</div>
              <div class="text-body2 q-mb-md">{{ formatDateTime(selectedTrip.date) }}</div>

              <div class="text-subtitle2 q-mb-xs">Status</div>
              <q-chip
                :color="getTripStatusColor(selectedTrip.status)"
                text-color="white"
                class="q-mb-md"
              >
                {{ selectedTrip.status }}
              </q-chip>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-subtitle2 q-mb-xs">Pickup Location</div>
              <div class="text-body2 q-mb-md">{{ selectedTrip.pickup }}</div>

              <div class="text-subtitle2 q-mb-xs">Drop Location</div>
              <div class="text-body2 q-mb-md">{{ selectedTrip.destination }}</div>

              <div class="text-subtitle2 q-mb-xs">Fare</div>
              <div class="text-body2 q-mb-md">₹{{ selectedTrip.amount }}</div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 q-mb-xs">Patient Details</div>
          <div class="text-body2 q-mb-md">
            <div><strong>Name:</strong> {{ selectedTrip.patientName || 'N/A' }}</div>
            <div><strong>Age:</strong> {{ selectedTrip.patientAge || 'N/A' }}</div>
            <div><strong>Emergency Type:</strong> {{ selectedTrip.emergencyType || 'N/A' }}</div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Cancel Trip Dialog -->
    <q-dialog v-model="showCancelDialog" persistent>
      <q-card>
        <q_card-section class="row items-center">
          <div class="text-h6">Cancel Trip</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q_card-section>

        <q-card-section>
          <p>Are you sure you want to cancel this trip? This should only be done in emergency situations.</p>
          <q-select
            v-model="cancelReason"
            :options="cancelReasons"
            label="Reason for cancellation *"
            filled
            :rules="[val => !!val || 'Please select a reason']"
          />
          <q-input
            v-if="cancelReason === 'Other'"
            v-model="otherCancelReason"
            label="Please specify"
            filled
            type="textarea"
            :rules="[val => !!val || 'Please provide details']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Back" color="primary" v-close-popup />
          <q-btn label="Confirm Cancellation" color="negative" @click="cancelTrip" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useDriverStore } from 'stores/driver'
import { date } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const driverStore = useDriverStore()

// Loading state
const loading = ref(false)

// Driver Profile
const driverProfile = ref({
  name: 'David Smith',
  id: 'DRV123456',
  profilePicture: null,
  phone: '+91 9876543210',
  email: 'david.smith@example.com'
})

// Vehicle Details
const vehicleDetails = ref({
  registrationNumber: 'MH-01-AB-1234',
  model: 'Toyota Hiace 2020',
  type: 'Basic Ambulance'
})

// Performance Metrics
const performance = ref({
  rating: 4.8,
  acceptanceRate: 95,
  completionRate: 98,
  totalTrips: 156
})

// Online Status
const isOnline = ref(true)

// Today's Stats
const todayStats = ref({
  trips: 5,
  earnings: 2500
})

// New Trip Request
const newTripRequest = ref(null)
const tripRequestCountdown = ref(30)
let countdownTimer = null

// Current Trip
const currentTrip = ref(null)
const tripStep = ref(1)

// Recent Trips Data
const tripColumns = [
  {
    name: 'date',
    label: 'Date',
    field: 'date',
    align: 'left',
    sortable: true
  },
  {
    name: 'pickup',
    label: 'Pickup',
    field: 'pickup',
    align: 'left'
  },
  {
    name: 'destination',
    label: 'Destination',
    field: 'destination',
    align: 'left'
  },
  {
    name: 'amount',
    label: 'Amount',
    field: 'amount',
    align: 'right',
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center'
  }
]

const recentTrips = ref([
  {
    id: 'TRIP001',
    date: '2024-04-08 14:30',
    pickup: '123 Main St, Mumbai',
    destination: 'City Hospital, Andheri',
    amount: 800,
    status: 'Completed',
    patientName: 'John Doe',
    patientAge: 45,
    emergencyType: 'Accident'
  },
  {
    id: 'TRIP002',
    date: '2024-04-08 12:15',
    pickup: '456 Park Ave, Mumbai',
    destination: 'General Hospital, Bandra',
    amount: 650,
    status: 'Completed',
    patientName: 'Jane Smith',
    patientAge: 32,
    emergencyType: 'Medical'
  },
  {
    id: 'TRIP003',
    date: '2024-04-08 10:45',
    pickup: '789 Oak Rd, Mumbai',
    destination: 'Emergency Care, Juhu',
    amount: 750,
    status: 'Cancelled',
    patientName: 'Robert Brown',
    patientAge: 60,
    emergencyType: 'Critical'
  },
  {
    id: 'TRIP004',
    date: '2024-04-07 18:20',
    pickup: '101 Pine St, Mumbai',
    destination: 'St. Mary Hospital, Dadar',
    amount: 920,
    status: 'Completed',
    patientName: 'Emily Wilson',
    patientAge: 28,
    emergencyType: 'Accident'
  },
  {
    id: 'TRIP005',
    date: '2024-04-07 15:10',
    pickup: '202 Maple Ave, Mumbai',
    destination: 'County Hospital, Worli',
    amount: 580,
    status: 'Completed',
    patientName: 'Michael Johnson',
    patientAge: 52,
    emergencyType: 'Medical'
  }
])

// Trip Details Dialog
const showTripDetails = ref(false)
const selectedTrip = ref(null)

// Cancel Trip Dialog
const showCancelDialog = ref(false)
const cancelReason = ref(null)
const otherCancelReason = ref('')
const cancelReasons = [
  'Vehicle breakdown',
  'Medical emergency',
  'Unsafe conditions',
  'Patient requested cancellation',
  'Unable to locate pickup',
  'Other'
]

// Methods
const toggleStatus = (status) => {
  if (status) {
    // If going online, simulate a trip request after a short delay
    setTimeout(() => {
      simulateNewTripRequest()
    }, 5000)
  } else if (currentTrip.value) {
    // If going offline with an active trip
    $q.dialog({
      title: 'Active Trip',
      message: 'You have an active trip. Please complete or cancel it before going offline.',
      cancel: true,
      persistent: true
    }).onOk(() => {
      isOnline.value = true
    })
    return
  }
  
  $q.notify({
    message: `You are now ${status ? 'online' : 'offline'}`,
    color: status ? 'positive' : 'grey',
    icon: status ? 'check_circle' : 'offline_bolt'
  })
}

const getTripStatusColor = (status) => {
  switch (status) {
    case 'Completed':
      return 'positive'
    case 'In Progress':
    case 'Accepted':
      return 'info'
    case 'Cancelled':
      return 'negative'
    case 'Pending':
      return 'warning'
    default:
      return 'grey'
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  return date.formatDate(new Date(dateString), 'MMM D, YYYY h:mm A')
}

const viewTripDetails = (trip) => {
  selectedTrip.value = trip
  showTripDetails.value = true
}

// Trip request handling
const simulateNewTripRequest = () => {
  if (!isOnline.value || currentTrip.value || newTripRequest.value) return
  
  newTripRequest.value = {
    id: 'REQ' + Math.floor(Math.random() * 1000000),
    patientName: 'Rahul Sharma',
    patientAge: 42,
    emergencyType: 'Cardiac',
    pickupAddress: '567 Linking Road, Bandra, Mumbai',
    destinationAddress: 'Lilavati Hospital, Bandra West, Mumbai',
    distance: 5.2,
    estimatedFare: 650,
    estimatedTime: 15
  }
  
  // Play notification sound
  const audio = new Audio('/notification.mp3')
  audio.play().catch(e => console.log('Audio play failed:', e))
  
  // Show notification
  $q.notify({
    message: 'New trip request received',
    color: 'primary',
    icon: 'notifications_active',
    position: 'top',
    timeout: 5000,
    actions: [
      { label: 'View', color: 'white', handler: () => {} }
    ]
  })
  
  // Start countdown
  tripRequestCountdown.value = 30
  countdownTimer = setInterval(() => {
    tripRequestCountdown.value--
    if (tripRequestCountdown.value <= 0) {
      clearInterval(countdownTimer)
      if (newTripRequest.value) {
        declineTripRequest(true)
      }
    }
  }, 1000)
}

const acceptTripRequest = () => {
  clearInterval(countdownTimer)
  
  // Convert request to current trip
  currentTrip.value = {
    ...newTripRequest.value,
    status: 'Accepted',
    contactNumber: '+91 9876543210',
    pickup: newTripRequest.value.pickupAddress,
    destination: newTripRequest.value.destinationAddress,
    fare: newTripRequest.value.estimatedFare,
    bookingTime: new Date().toISOString(),
    acceptedTime: new Date().toISOString()
  }
  
  newTripRequest.value = null
  tripStep.value = 1
  
  $q.notify({
    message: 'Trip accepted successfully',
    color: 'positive',
    icon: 'check_circle'
  })
}

const declineTripRequest = (timeout = false) => {
  clearInterval(countdownTimer)
  
  if (timeout) {
    $q.notify({
      message: 'Trip request expired',
      color: 'negative',
      icon: 'timer_off'
    })
  } else {
    $q.notify({
      message: 'Trip request declined',
      color: 'grey',
      icon: 'close'
    })
  }
  
  newTripRequest.value = null
  
  // After a delay, simulate another request
  if (isOnline.value) {
    setTimeout(() => {
      simulateNewTripRequest()
    }, 10000)
  }
}

// Trip progress functions
const arrivedAtPickup = () => {
  tripStep.value = 3
  currentTrip.value.status = 'At Pickup'
  
  $q.notify({
    message: 'Arrived at pickup location',
    color: 'info'
  })
}

const startJourney = () => {
  tripStep.value = 4
  currentTrip.value.status = 'In Progress'
  
  $q.notify({
    message: 'Journey started',
    color: 'info'
  })
}

const arrivedAtDestination = () => {
  tripStep.value = 5
  currentTrip.value.status = 'At Destination'
  
  $q.notify({
    message: 'Arrived at destination',
    color: 'info'
  })
}

const completeTrip = () => {
  // Add trip to recent trips
  recentTrips.value.unshift({
    id: currentTrip.value.id,
    date: new Date().toISOString(),
    pickup: currentTrip.value.pickup,
    destination: currentTrip.value.destination,
    amount: currentTrip.value.fare,
    status: 'Completed',
    patientName: currentTrip.value.patientName,
    patientAge: currentTrip.value.patientAge,
    emergencyType: currentTrip.value.emergencyType
  })
  
  // Update stats
  todayStats.value.trips++
  todayStats.value.earnings += currentTrip.value.fare
  
  // Clear current trip
  currentTrip.value = null
  
  $q.notify({
    message: 'Trip completed successfully',
    color: 'positive',
    icon: 'check_circle'
  })
  
  // After a delay, simulate another request
  if (isOnline.value) {
    setTimeout(() => {
      simulateNewTripRequest()
    }, 5000)
  }
}

const cancelTrip = () => {
  // Add trip to recent trips with cancelled status
  recentTrips.value.unshift({
    id: currentTrip.value.id,
    date: new Date().toISOString(),
    pickup: currentTrip.value.pickup,
    destination: currentTrip.value.destination,
    amount: 0,
    status: 'Cancelled',
    patientName: currentTrip.value.patientName,
    patientAge: currentTrip.value.patientAge,
    emergencyType: currentTrip.value.emergencyType
  })
  
  // Clear current trip
  currentTrip.value = null
  showCancelDialog.value = false
  
  $q.notify({
    message: 'Trip cancelled',
    color: 'negative',
    icon: 'cancel'
  })
  
  // After a delay, simulate another request
  if (isOnline.value) {
    setTimeout(() => {
      simulateNewTripRequest()
    }, 5000)
  }
}

// Navigation and contact functions
const openNavigation = () => {
  const destination = encodeURIComponent(
    currentTrip.value.status === 'Accepted' ? 
    currentTrip.value.pickup : 
    currentTrip.value.destination
  )
  
  // Open in Google Maps
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank')
}

const contactPatient = () => {
  // In a real app, this would initiate a call
  $q.dialog({
    title: 'Contact Patient',
    message: `Calling ${currentTrip.value.patientName} at ${currentTrip.value.contactNumber}`,
    cancel: true,
    persistent: true
  })
}

// Load driver profile data
const loadDriverData = async () => {
  try {
    loading.value = true
    
    // In a real app, this would fetch data from the API
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // If we had a real API, we would do something like:
    // const profile = await driverStore.fetchDriverProfile()
    // driverProfile.value = profile
    
    loading.value = false
  } catch (error) {
    console.error('Error loading driver data:', error)
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  loadDriverData()
  
  // Simulate a trip request after a short delay if online
  if (isOnline.value) {
    setTimeout(() => {
      simulateNewTripRequest()
    }, 3000)
  }
})

onBeforeUnmount(() => {
  // Clear any timers
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.map-container {
  height: 300px;
  position: relative;
}

.map-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style>