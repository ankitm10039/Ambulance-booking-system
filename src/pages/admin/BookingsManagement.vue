<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5">Bookings Management</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Create Booking" class="text-capitalize" @click="openCreateBookingDialog" />
    </div>

    <!-- Filters -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.status"
          :options="statusOptions"
          label="Status"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="handleFilterChange"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.bookingType"
          :options="bookingTypeOptions"
          label="Booking Type"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="handleFilterChange"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          v-model="filters.dateRange.from"
          label="From Date"
          outlined
          dense
          type="date"
          @update:model-value="handleFilterChange"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          v-model="filters.dateRange.to"
          label="To Date"
          outlined
          dense
          type="date"
          @update:model-value="handleFilterChange"
        />
      </div>
      <div class="col-12 col-md-9">
        <q-input
          v-model="filters.search"
          label="Search (Patient, Driver, Location)"
          outlined
          dense
          clearable
          @update:model-value="handleFilterChange"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-3">
        <q-btn 
          color="primary" 
          label="Reset Filters" 
          icon="refresh" 
          class="full-width text-capitalize" 
          @click="resetFilters" 
        />
      </div>
    </div>

    <!-- Bookings Table -->
    <q-card>
      <q-card-section>
        <q-table
          :rows="bookings"
          :columns="columns"
          row-key="_id"
          :loading="loading"
          :pagination="pagination"
          @request="onRequest"
          binary-state-sort
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>

          <template v-slot:body-cell-bookingType="props">
            <q-td :props="props">
              <q-chip
                :color="getBookingTypeColor(props.value)"
                text-color="white"
                size="sm"
              >
                {{ formatBookingType(props.value) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.value)"
                text-color="white"
                size="sm"
              >
                {{ formatStatus(props.value) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-user="props">
            <q-td :props="props">
              {{ props.row.user?.name || 'N/A' }}
              <div class="text-caption">{{ props.row.user?.phone || 'N/A' }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-patient="props">
            <q-td :props="props">
              {{ props.row.patientDetails?.name || 'N/A' }}
              <div class="text-caption">Age: {{ props.row.patientDetails?.age || 'N/A' }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-vehicle="props">
            <q-td :props="props">
              <q-img
                v-if="props.row.vehicle"
                :src="getImageUrl(props.row.vehicle.image, getDefaultVehicleImage())"
                style="width: 80px; height: 50px"
                fit="cover"
                class="rounded-borders"
              >
                <q-tooltip>
                  {{ props.row.vehicle.manufacturer }} {{ props.row.vehicle.model }}
                </q-tooltip>
              </q-img>
              <div v-else class="text-caption text-grey">No vehicle</div>
            </q-td>
          </template>

          <template v-slot:body-cell-driver="props">
            <q-td :props="props">
              {{ props.row.driver?.user?.name || 'Not Assigned' }}
              <div v-if="props.row.driver" class="text-caption">
                {{ props.row.vehicle?.registrationNumber || 'N/A' }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-fare="props">
            <q-td :props="props">
              ₹{{ props.row.fare?.amount || 0 }}
              <div class="text-caption">
                {{ props.row.fare?.paymentStatus || 'pending' }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn-group flat>
                <q-btn flat round color="primary" icon="visibility" @click="viewBooking(props.row)">
                  <q-tooltip>View Details</q-tooltip>
                </q-btn>
                <q-btn flat round color="secondary" icon="edit" @click="editBooking(props.row)">
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn flat round color="accent" icon="assignment_ind" @click="assignDriver(props.row)" v-if="props.row.status === 'pending'">
                  <q-tooltip>Assign Driver</q-tooltip>
                </q-btn>
                <q-btn flat round color="negative" icon="cancel" @click="cancelBooking(props.row)" v-if="['pending', 'confirmed'].includes(props.row.status)">
                  <q-tooltip>Cancel</q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Booking Details Dialog -->
    <q-dialog v-model="bookingDetailsDialog" persistent>
      <q-card style="min-width: 350px; max-width: 80vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">Booking Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedBooking">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Status</div>
                  <q-chip
                    :color="getStatusColor(selectedBooking.status)"
                    text-color="white"
                    class="q-mt-sm"
                  >
                    {{ formatStatus(selectedBooking.status) }}
                  </q-chip>
                  
                  <div class="text-subtitle2 q-mt-md">Booking Type</div>
                  <q-chip
                    :color="getBookingTypeColor(selectedBooking.bookingType)"
                    text-color="white"
                  >
                    {{ formatBookingType(selectedBooking.bookingType) }}
                  </q-chip>
                  
                  <div class="text-subtitle2 q-mt-md">Booking ID</div>
                  <div>{{ selectedBooking._id }}</div>
                  
                  <div class="text-subtitle2 q-mt-md">Created At</div>
                  <div>{{ formatDateTime(selectedBooking.createdAt) }}</div>
                  
                  <div class="text-subtitle2 q-mt-md">Scheduled Time</div>
                  <div>{{ selectedBooking.scheduledTime ? formatDateTime(selectedBooking.scheduledTime) : 'N/A' }}</div>
                </q-card-section>
              </q-card>
              
              <q-card class="q-mt-md">
                <q-card-section>
                  <div class="text-h6">Payment</div>
                  <div class="text-subtitle2 q-mt-sm">Amount</div>
                  <div class="text-h5">₹{{ selectedBooking.fare?.amount || 0 }}</div>
                  
                  <div class="text-subtitle2 q-mt-sm">Payment Status</div>
                  <q-chip
                    :color="getPaymentStatusColor(selectedBooking.fare?.paymentStatus)"
                    text-color="white"
                  >
                    {{ formatPaymentStatus(selectedBooking.fare?.paymentStatus) }}
                  </q-chip>
                  
                  <div class="text-subtitle2 q-mt-sm">Payment Method</div>
                  <div>{{ selectedBooking.fare?.paymentMethod || 'Not specified' }}</div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-8">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Trip Details</div>
                  
                  <div class="row q-col-gutter-md q-mt-sm">
                    <div class="col-12 col-md-6">
                      <div class="text-subtitle2">Pickup Location</div>
                      <div>{{ selectedBooking.pickupLocation?.address }}</div>
                      <div class="text-caption" v-if="selectedBooking.pickupLocation?.coordinates?.length === 2">
                        Coordinates: {{ selectedBooking.pickupLocation.coordinates[1] }}, {{ selectedBooking.pickupLocation.coordinates[0] }}
                      </div>
                    </div>
                    
                    <div class="col-12 col-md-6">
                      <div class="text-subtitle2">Drop Location</div>
                      <div>{{ selectedBooking.dropLocation?.address || 'Not specified' }}</div>
                      <div class="text-caption" v-if="selectedBooking.dropLocation?.coordinates?.length === 2 && 
                        (selectedBooking.dropLocation.coordinates[0] !== 0 || selectedBooking.dropLocation.coordinates[1] !== 0)">
                        Coordinates: {{ selectedBooking.dropLocation.coordinates[1] }}, {{ selectedBooking.dropLocation.coordinates[0] }}
                      </div>
                    </div>
                    
                    <div class="col-12 col-md-6">
                      <div class="text-subtitle2">Distance</div>
                      <div>{{ selectedBooking.distance ? `${selectedBooking.distance} km` : 'Not calculated' }}</div>
                    </div>
                    
                    <div class="col-12 col-md-6">
                      <div class="text-subtitle2">Estimated Time</div>
                      <div>{{ selectedBooking.estimatedTime ? `${selectedBooking.estimatedTime} mins` : 'Not calculated' }}</div>
                    </div>
                    
                    <div class="col-12 col-md-6">
                      <div class="text-subtitle2">Start Time</div>
                      <div>{{ selectedBooking.startTime ? formatDateTime(selectedBooking.startTime) : 'Not started' }}</div>
                    </div>
                    
                    <div class="col-12 col-md-6">
                      <div class="text-subtitle2">End Time</div>
                      <div>{{ selectedBooking.endTime ? formatDateTime(selectedBooking.endTime) : 'Not completed' }}</div>
                    </div>
                    
                    <div class="col-12 col-md-6">
                      <div class="text-subtitle2">Actual Time</div>
                      <div>{{ selectedBooking.actualTime ? `${selectedBooking.actualTime} mins` : 'Not completed' }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
              
              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-12 col-md-6">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6">Patient Details</div>
                      <div class="text-subtitle2 q-mt-sm">Name</div>
                      <div>{{ selectedBooking.patientDetails?.name }}</div>
                      
                      <div class="text-subtitle2 q-mt-sm">Age</div>
                      <div>{{ selectedBooking.patientDetails?.age || 'Not specified' }}</div>
                      
                      <div class="text-subtitle2 q-mt-sm">Gender</div>
                      <div>{{ selectedBooking.patientDetails?.gender || 'Not specified' }}</div>
                      
                      <div class="text-subtitle2 q-mt-sm">Medical Condition</div>
                      <div>{{ selectedBooking.patientDetails?.medicalCondition || 'Not specified' }}</div>
                      
                      <div class="text-subtitle2 q-mt-sm">Additional Notes</div>
                      <div>{{ selectedBooking.patientDetails?.additionalNotes || 'None' }}</div>
                    </q-card-section>
                  </q-card>
                </div>
                
                <div class="col-12 col-md-6">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6">User & Driver</div>
                      
                      <div class="text-subtitle2 q-mt-sm">User</div>
                      <div v-if="selectedBooking.user">
                        <div>{{ selectedBooking.user.name }}</div>
                        <div>{{ selectedBooking.user.email }}</div>
                        <div>{{ selectedBooking.user.phone || 'No phone' }}</div>
                      </div>
                      <div v-else>User information not available</div>
                      
                      <div class="text-subtitle2 q-mt-md">Driver</div>
                      <div v-if="selectedBooking.driver">
                        <div>{{ selectedBooking.driver.user?.name }}</div>
                        <div>License: {{ selectedBooking.driver.licenseNumber }}</div>
                        <div>Phone: {{ selectedBooking.driver.user?.phone || 'No phone' }}</div>
                      </div>
                      <div v-else>No driver assigned</div>
                      
                      <div class="text-subtitle2 q-mt-md">Vehicle</div>
                      <div v-if="selectedBooking.vehicle" class="row items-center">
                        <div class="col-4">
                          <q-img
                            :src="getImageUrl(selectedBooking.vehicle.image, getDefaultVehicleImage())"
                            style="width: 100%; max-width: 120px; height: 80px"
                            fit="cover"
                            class="rounded-borders"
                          />
                        </div>
                        <div class="col-8">
                          <div>{{ selectedBooking.vehicle.manufacturer }} {{ selectedBooking.vehicle.model }}</div>
                          <div>Reg: {{ selectedBooking.vehicle.registrationNumber }}</div>
                          <div>Type: {{ selectedBooking.vehicle.type }}</div>
                        </div>
                      </div>
                      <div v-else>No vehicle assigned</div>
                      
                      <div class="text-subtitle2 q-mt-md">Vehicle</div>
                      <div v-if="selectedBooking.vehicle">
                        <div>{{ selectedBooking.vehicle.make }} {{ selectedBooking.vehicle.model }}</div>
                        <div>Registration: {{ selectedBooking.vehicle.registrationNumber }}</div>
                        <div>Type: {{ selectedBooking.vehicle.type }}</div>
                      </div>
                      <div v-else>No vehicle assigned</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
              
              <q-card class="q-mt-md">
                <q-card-section>
                  <div class="text-h6">Requirements</div>
                  <div class="row q-gutter-xs q-mt-sm">
                    <q-chip v-for="req in selectedBooking.requirements" :key="req">
                      {{ req }}
                    </q-chip>
                    <div v-if="!selectedBooking.requirements || selectedBooking.requirements.length === 0">
                      No special requirements
                    </div>
                  </div>
                </q-card-section>
              </q-card>
              
              <q-card class="q-mt-md" v-if="selectedBooking.status === 'cancelled'">
                <q-card-section>
                  <div class="text-h6">Cancellation Details</div>
                  <div class="text-subtitle2 q-mt-sm">Cancelled By</div>
                  <div>{{ selectedBooking.cancelledBy || 'Not specified' }}</div>
                  
                  <div class="text-subtitle2 q-mt-sm">Cancellation Reason</div>
                  <div>{{ selectedBooking.cancellationReason || 'No reason provided' }}</div>
                </q-card-section>
              </q-card>
              
              <q-card class="q-mt-md" v-if="selectedBooking.rating && selectedBooking.rating.value">
                <q-card-section>
                  <div class="text-h6">Rating & Feedback</div>
                  <div class="text-subtitle2 q-mt-sm">Rating</div>
                  <div>
                    <q-rating
                      v-model="selectedBooking.rating.value"
                      max="5"
                      size="1.5em"
                      color="amber"
                      readonly
                    />
                    ({{ selectedBooking.rating.value }}/5)
                  </div>
                  
                  <div class="text-subtitle2 q-mt-sm">Comment</div>
                  <div>{{ selectedBooking.rating.comment || 'No comment provided' }}</div>
                  
                  <div class="text-subtitle2 q-mt-sm">Date</div>
                  <div>{{ selectedBooking.rating.createdAt ? formatDateTime(selectedBooking.rating.createdAt) : 'Not available' }}</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Assign Driver Dialog -->
    <q-dialog v-model="assignDriverDialog" persistent>
      <q-card style="min-width: 350px; max-width: 80vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">Assign Driver</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedBooking">
          <div class="text-subtitle1 q-mb-md">
            Booking ID: {{ selectedBooking._id }}
          </div>
          
          <q-select
            v-model="selectedDriver"
            :options="availableDrivers"
            label="Select Driver"
            option-label="label"
            option-value="_id"
            emit-value
            map-options
            :loading="loadingDrivers"
            outlined
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="scope.opt.user?.profileImage || 'https://cdn.quasar.dev/img/avatar.png'">
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.user?.name }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.vehicle?.registrationNumber }} - {{ scope.opt.vehicle?.type }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-img
                    v-if="scope.opt.vehicle?.image"
                    :src="scope.opt.vehicle.image"
                    style="width: 60px; height: 40px"
                    fit="cover"
                    class="rounded-borders"
                  />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="negative" v-close-popup />
          <q-btn flat label="Assign" color="primary" @click="confirmAssignDriver" :disable="!selectedDriver" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Cancel Booking Dialog -->
    <q-dialog v-model="cancelBookingDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Cancel Booking</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedBooking">
          <div class="text-subtitle1 q-mb-md">
            Are you sure you want to cancel this booking?
          </div>
          
          <q-input
            v-model="cancellationReason"
            label="Cancellation Reason"
            type="textarea"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="No" color="primary" v-close-popup />
          <q-btn flat label="Yes, Cancel" color="negative" @click="confirmCancelBooking" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch, defineAsyncComponent } from 'vue'
import { useQuasar } from 'quasar'
import { date } from 'quasar'
import { useAdminStore } from 'src/stores/admin'
import { getImageUrl, getDefaultVehicleImage, getDefaultAvatar } from 'src/utils/image'

// Import the dialog component using defineAsyncComponent for better performance
const CreateBookingDialog = defineAsyncComponent(() => 
  import('src/components/dialogs/CreateBookingDialog.vue')
)

const $q = useQuasar()
const adminStore = useAdminStore()
const loadingDrivers = ref(false)
const bookingDetailsDialog = ref(false)
const assignDriverDialog = ref(false)
const cancelBookingDialog = ref(false)
const selectedDriver = ref(null)
const availableDrivers = ref([])
const cancellationReason = ref('')

// Computed properties from store
const loading = computed(() => adminStore.loading)
const bookings = computed(() => adminStore.bookings)
const selectedBooking = computed({
  get: () => adminStore.selectedBooking,
  set: (value) => { adminStore.selectedBooking = value }
})
const pagination = computed({
  get: () => adminStore.pagination,
  set: (value) => adminStore.updatePagination(value)
})
const filters = computed(() => adminStore.filters)
const error = computed(() => adminStore.error)

// Watch for errors
watch(error, (newError) => {
  if (newError) {
    $q.notify({
      color: 'negative',
      message: newError,
      icon: 'error'
    })
  }
})

// Options for filters
const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
]

const bookingTypeOptions = [
  { label: 'Emergency', value: 'emergency' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Transfer', value: 'transfer' }
]

// Table columns
const columns = [
  { name: 'bookingType', label: 'Type', field: 'bookingType', sortable: true },
  { name: 'user', label: 'User', field: 'user', sortable: true },
  { name: 'patient', label: 'Patient', field: 'patientDetails', sortable: true },
  { name: 'pickup', label: 'Pickup', field: row => row.pickupLocation?.address, sortable: false },
  { name: 'scheduledTime', label: 'Scheduled', field: 'scheduledTime', sortable: true, 
    format: val => val ? formatDate(val) : 'ASAP' },
  { name: 'vehicle', label: 'Vehicle', field: 'vehicle', sortable: false, align: 'center' },
  { name: 'driver', label: 'Driver', field: 'driver', sortable: true },
  { name: 'status', label: 'Status', field: 'status', sortable: true },
  { name: 'fare', label: 'Fare', field: 'fare', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center', sortable: false }
]

// Fetch bookings from API
const fetchBookings = async () => {
  await adminStore.fetchBookings()
}

// Handle pagination and sorting
const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  
  adminStore.updatePagination({
    page,
    rowsPerPage,
    sortBy,
    descending
  })
  
  fetchBookings()
}

// View booking details
const viewBooking = (booking) => {
  adminStore.selectedBooking = booking
  bookingDetailsDialog.value = true
}

// Edit booking
const editBooking = (booking) => {
  // Implement edit booking functionality
  console.log('Edit booking:', booking._id)
}

// Open create booking dialog
const openCreateBookingDialog = () => {
  $q.dialog({
    component: CreateBookingDialog,
    // You can pass props to the dialog component if needed
    componentProps: {
      // Add any props you want to pass to the dialog
    }
  }).onOk(newBooking => {
    // Add the new booking to the list and refresh
    if (newBooking) {
      fetchBookings()
    }
  }).onCancel(() => {
    // Handle dialog cancel if needed
    console.log('Dialog cancelled')
  }).onDismiss(() => {
    // Handle dialog dismiss if needed
    console.log('Dialog dismissed')
  })
}

// Assign driver to booking
const assignDriver = async (booking) => {
  try {
    adminStore.selectedBooking = booking
    loadingDrivers.value = true
    
    // Fetch available drivers
    const drivers = await adminStore.fetchAvailableDrivers()
    
    // Format drivers for select
    availableDrivers.value = drivers.map(driver => ({
      ...driver,
      label: `${driver.user?.name} (${driver.vehicle?.registrationNumber})`
    }))
    
    assignDriverDialog.value = true
  } catch (error) {
    console.error('Error fetching available drivers:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to load available drivers',
      icon: 'error'
    })
  } finally {
    loadingDrivers.value = false
  }
}

// Confirm driver assignment
const confirmAssignDriver = async () => {
  try {
    const result = await adminStore.assignDriver(selectedBooking.value._id, selectedDriver.value)
    
    if (result) {
      $q.notify({
        color: 'positive',
        message: 'Driver assigned successfully',
        icon: 'check'
      })
      
      assignDriverDialog.value = false
      selectedDriver.value = null
    }
  } catch (error) {
    console.error('Error assigning driver:', error)
  }
}

// Cancel booking
const cancelBooking = (booking) => {
  adminStore.selectedBooking = booking
  cancellationReason.value = ''
  cancelBookingDialog.value = true
}

// Confirm booking cancellation
const confirmCancelBooking = async () => {
  try {
    const result = await adminStore.cancelBooking(selectedBooking.value._id, cancellationReason.value)
    
    if (result) {
      $q.notify({
        color: 'positive',
        message: 'Booking cancelled successfully',
        icon: 'check'
      })
      
      cancelBookingDialog.value = false
    }
  } catch (error) {
    console.error('Error cancelling booking:', error)
  }
}

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return date.formatDate(new Date(dateString), 'MMM D, YYYY')
}

// Format date and time for display
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  return date.formatDate(new Date(dateString), 'MMM D, YYYY h:mm A')
}

// Get status color
const getStatusColor = (status) => {
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

// Get booking type color
const getBookingTypeColor = (type) => {
  switch (type) {
    case 'emergency':
      return 'negative'
    case 'scheduled':
      return 'primary'
    case 'transfer':
      return 'accent'
    default:
      return 'grey'
  }
}

// Get payment status color
const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'paid':
      return 'positive'
    case 'pending':
      return 'warning'
    case 'failed':
      return 'negative'
    default:
      return 'grey'
  }
}

// Format status for display
const formatStatus = (status) => {
  if (!status) return 'Unknown'
  
  // Convert from kebab-case to Title Case
  return status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Format booking type for display
const formatBookingType = (type) => {
  if (!type) return 'Unknown'
  
  return type.charAt(0).toUpperCase() + type.slice(1)
}

// Format payment status for display
const formatPaymentStatus = (status) => {
  if (!status) return 'Pending'
  
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Handle filter changes
const handleFilterChange = () => {
  // Reset to first page when filters change
  adminStore.updatePagination({
    ...pagination.value,
    page: 1
  })
  fetchBookings()
}

// Reset all filters
const resetFilters = () => {
  adminStore.resetFilters()
  fetchBookings()
}

// Load bookings on component mount
onMounted(() => {
  fetchBookings()
})
</script>