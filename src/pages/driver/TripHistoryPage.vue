<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-10">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h5">Trip History</div>
            <div class="text-subtitle2 text-grey">View your past trips and details</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-4">
                <q-select
                  filled
                  v-model="filters.status"
                  :options="statusOptions"
                  label="Filter by Status"
                  clearable
                  @update:model-value="fetchTrips"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  filled
                  v-model="filters.dateFrom"
                  label="From Date"
                  type="date"
                  @update:model-value="fetchTrips"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  filled
                  v-model="filters.dateTo"
                  label="To Date"
                  type="date"
                  @update:model-value="fetchTrips"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <q-table
              :rows="trips"
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

              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="getStatusColor(props.value)"
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

              <template v-slot:no-data>
                <div class="full-width row flex-center q-pa-md text-grey">
                  <q-icon name="history" size="2rem" class="q-mr-sm" />
                  No trip history found
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>

        <!-- Trip Details Dialog -->
        <q-dialog v-model="showTripDetails" persistent>
          <q-card style="min-width: 350px; max-width: 600px;">
            <q-card-section class="row items-center">
              <div class="text-h6">Trip Details</div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section v-if="selectedTrip">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 q-mb-xs">Trip ID</div>
                  <div class="text-body2 q-mb-md">{{ selectedTrip._id }}</div>

                  <div class="text-subtitle2 q-mb-xs">Date & Time</div>
                  <div class="text-body2 q-mb-md">{{ formatDate(selectedTrip.createdAt) }}</div>

                  <div class="text-subtitle2 q-mb-xs">Status</div>
                  <q-chip
                    :color="getStatusColor(selectedTrip.status)"
                    text-color="white"
                    class="q-mb-md"
                  >
                    {{ selectedTrip.status }}
                  </q-chip>
                </div>

                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 q-mb-xs">Pickup Location</div>
                  <div class="text-body2 q-mb-md">{{ selectedTrip.pickupLocation?.address }}</div>

                  <div class="text-subtitle2 q-mb-xs">Drop Location</div>
                  <div class="text-body2 q-mb-md">{{ selectedTrip.dropLocation?.address }}</div>

                  <div class="text-subtitle2 q-mb-xs">Fare</div>
                  <div class="text-body2 q-mb-md">₹{{ selectedTrip.fare || 'N/A' }}</div>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 q-mb-xs">Patient Details</div>
              <div class="text-body2 q-mb-md">
                <div><strong>Name:</strong> {{ selectedTrip.patientDetails?.name }}</div>
                <div><strong>Age:</strong> {{ selectedTrip.patientDetails?.age }}</div>
                <div><strong>Notes:</strong> {{ selectedTrip.patientDetails?.additionalNotes || 'None' }}</div>
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Close" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useDriverStore } from 'stores/driver'
import { date } from 'quasar'

const driverStore = useDriverStore()
const loading = computed(() => driverStore.loading)
const trips = computed(() => driverStore.trips)
const pagination = computed({
  get: () => driverStore.pagination,
  set: (value) => driverStore.updatePagination(value)
})

const showTripDetails = ref(false)
const selectedTrip = ref(null)

const filters = reactive({
  status: null,
  dateFrom: null,
  dateTo: null
})

const statusOptions = [
  'pending',
  'accepted',
  'in-progress',
  'completed',
  'cancelled'
]

const columns = [
  {
    name: 'createdAt',
    required: true,
    label: 'Date & Time',
    align: 'left',
    field: row => row.createdAt,
    format: val => formatDate(val),
    sortable: true
  },
  {
    name: 'bookingId',
    required: true,
    label: 'Booking ID',
    align: 'left',
    field: '_id',
    sortable: true
  },
  {
    name: 'pickupLocation',
    required: true,
    label: 'Pickup Location',
    align: 'left',
    field: row => row.pickupLocation?.address || 'N/A'
  },
  {
    name: 'dropLocation',
    required: true,
    label: 'Drop Location',
    align: 'left',
    field: row => row.dropLocation?.address || 'N/A'
  },
  {
    name: 'status',
    required: true,
    label: 'Status',
    align: 'left',
    field: 'status',
    sortable: true
  },
  {
    name: 'fare',
    required: true,
    label: 'Fare',
    align: 'right',
    field: 'fare',
    format: val => `₹${val || 'N/A'}`,
    sortable: true
  },
  {
    name: 'actions',
    required: true,
    label: 'Actions',
    align: 'center',
    field: 'actions'
  }
]

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return date.formatDate(new Date(dateString), 'MMM D, YYYY h:mm A')
}

// Get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'orange'
    case 'accepted':
      return 'blue'
    case 'in-progress':
      return 'purple'
    case 'completed':
      return 'green'
    case 'cancelled':
      return 'red'
    default:
      return 'grey'
  }
}

// View trip details
const viewTripDetails = (trip) => {
  selectedTrip.value = trip
  showTripDetails.value = true
}

// Handle pagination and sorting
const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  
  driverStore.updatePagination({
    page,
    rowsPerPage,
    sortBy,
    descending
  })
  
  fetchTrips()
}

// Fetch trips with filters
const fetchTrips = async () => {
  const filterParams = {}
  
  if (filters.status) {
    filterParams.status = filters.status
  }
  
  if (filters.dateFrom) {
    filterParams.dateFrom = filters.dateFrom
  }
  
  if (filters.dateTo) {
    filterParams.dateTo = filters.dateTo
  }
  
  await driverStore.fetchTrips(filterParams)
}

onMounted(() => {
  fetchTrips()
})
</script>