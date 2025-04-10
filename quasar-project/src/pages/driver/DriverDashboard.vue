<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Driver Status Card -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-center">
              <q-avatar size="100px">
                <img src="https://cdn.quasar.dev/img/avatar.png">
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
                    <div class="text-subtitle2">Trips</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-6">
                <q-card class="text-center bg-green-1">
                  <q-card-section>
                    <div class="text-h6">₹{{ todayStats.earnings }}</div>
                    <div class="text-subtitle2">Earnings</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>

          <q-list>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="person" color="primary" />
              </q-item-section>
              <q-item-section>Profile</q-item-section>
            </q-item>

            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="directions_car" color="primary" />
              </q-item-section>
              <q-item-section>Vehicle Details</q-item-section>
            </q-item>

            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="account_balance_wallet" color="primary" />
              </q-item-section>
              <q-item-section>Earnings</q-item-section>
            </q-item>

            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="settings" color="primary" />
              </q-item-section>
              <q-item-section>Settings</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Current/Recent Trips Section -->
      <div class="col-12 col-md-8">
        <!-- Current Trip Card (if any) -->
        <q-card v-if="currentTrip" class="q-mb-md bg-yellow-1">
          <q-card-section>
            <div class="text-h6">Current Trip</div>
            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12">
                <div class="text-subtitle2">Patient Details</div>
                <div>Name: {{ currentTrip.patientName }}</div>
                <div>Contact: {{ currentTrip.contactNumber }}</div>
              </div>
              <div class="col-12">
                <div class="text-subtitle2">Location</div>
                <div>Pickup: {{ currentTrip.pickup }}</div>
                <div>Destination: {{ currentTrip.destination }}</div>
              </div>
              <div class="col-12">
                <q-btn-group spread>
                  <q-btn color="primary" icon="navigation" label="Navigate" />
                  <q-btn color="positive" icon="call" label="Contact" />
                  <q-btn color="negative" icon="cancel" label="Cancel Trip" />
                </q-btn-group>
              </div>
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
            >
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
                    @click="viewTripDetails(props.row.id)"
                  >
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Driver Profile
const driverProfile = ref({
  name: 'David Smith',
  id: 'DRV123456',
  vehicle: 'MH-01-AB-1234'
})

// Online Status
const isOnline = ref(true)

// Today's Stats
const todayStats = ref({
  trips: 5,
  earnings: 2500
})

// Current Trip
const currentTrip = ref({
  patientName: 'John Doe',
  contactNumber: '+1234567890',
  pickup: '123 Main St',
  destination: 'City Hospital',
  status: 'In Progress'
})

// Recent Trips Data
const tripColumns = [
  {
    name: 'date',
    label: 'Date',
    field: 'date',
    align: 'left'
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
    align: 'right'
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center'
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
    id: 1,
    date: '2024-04-08 14:30',
    pickup: '123 Main St',
    destination: 'City Hospital',
    amount: 800,
    status: 'Completed'
  },
  {
    id: 2,
    date: '2024-04-08 12:15',
    pickup: '456 Park Ave',
    destination: 'General Hospital',
    amount: 650,
    status: 'Completed'
  },
  {
    id: 3,
    date: '2024-04-08 10:45',
    pickup: '789 Oak Rd',
    destination: 'Emergency Care',
    amount: 750,
    status: 'Cancelled'
  }
])

// Methods
const toggleStatus = (status) => {
  $q.notify({
    message: `You are now ${status ? 'online' : 'offline'}`,
    color: status ? 'positive' : 'grey',
    icon: status ? 'check_circle' : 'offline_bolt'
  })
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed':
      return 'positive'
    case 'In Progress':
      return 'warning'
    case 'Cancelled':
      return 'negative'
    default:
      return 'grey'
  }
}

const viewTripDetails = (tripId) => {
  console.log('Viewing trip:', tripId)
  // Implement trip details view
}
</script>