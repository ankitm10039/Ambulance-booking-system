<template>
  <q-page padding>
    <!-- Statistics Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="text-h6">Total Users</div>
            <div class="text-h4">{{ stats.totalUsers }}</div>
            <div class="text-caption">+{{ stats.newUsers }} this week</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-secondary text-white">
          <q-card-section>
            <div class="text-h6">Active Drivers</div>
            <div class="text-h4">{{ stats.activeDrivers }}</div>
            <div class="text-caption">{{ stats.totalDrivers }} total drivers</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-accent text-white">
          <q-card-section>
            <div class="text-h6">Today's Bookings</div>
            <div class="text-h4">{{ stats.todayBookings }}</div>
            <div class="text-caption">{{ stats.pendingBookings }} pending</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-dark text-white">
          <q-card-section>
            <div class="text-h6">Revenue</div>
            <div class="text-h4">₹{{ stats.revenue }}</div>
            <div class="text-caption">This month</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row q-col-gutter-md">
      <!-- Live Bookings -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6">Live Bookings</div>
          </q-card-section>

          <q-card-section>
            <q-table
              :rows="activeBookings"
              :columns="bookingColumns"
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
                  <q-btn-group flat>
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="visibility"
                      @click="viewBookingDetails(props.row.id)"
                    >
                      <q-tooltip>View Details</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="cancel"
                      @click="cancelBooking(props.row.id)"
                    >
                      <q-tooltip>Cancel Booking</q-tooltip>
                    </q-btn>
                  </q-btn-group>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>

        <!-- Analytics Chart -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6">Bookings Analytics</div>
          </q-card-section>

          <q-card-section>
            <div style="height: 300px">
              <canvas ref="analyticsChart"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quick Actions and Notifications -->
      <div class="col-12 col-md-4">
        <!-- Quick Actions -->
        <q-card>
          <q-card-section>
            <div class="text-h6">Quick Actions</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-btn
                  color="primary"
                  class="full-width"
                  icon="person_add"
                  label="Add Driver"
                  @click="addDriver"
                />
              </div>
              <div class="col-6">
                <q-btn
                  color="secondary"
                  class="full-width"
                  icon="local_taxi"
                  label="Add Vehicle"
                  @click="addVehicle"
                />
              </div>
              <div class="col-6 q-mt-sm">
                <q-btn
                  color="accent"
                  class="full-width"
                  icon="assessment"
                  label="Reports"
                  @click="viewReports"
                />
              </div>
              <div class="col-6 q-mt-sm">
                <q-btn
                  color="dark"
                  class="full-width"
                  icon="settings"
                  label="Settings"
                  @click="openSettings"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Recent Notifications -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6">Recent Notifications</div>
          </q-card-section>

          <q-card-section>
            <q-list separator>
              <q-item v-for="notification in notifications" :key="notification.id">
                <q-item-section avatar>
                  <q-icon :name="notification.icon" :color="notification.color" />
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ notification.message }}</q-item-label>
                  <q-item-label caption>{{ notification.time }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import Chart from 'chart.js/auto'

const $q = useQuasar()
const analyticsChart = ref(null)
let chartInstance = null

// Dashboard Statistics
const stats = ref({
  totalUsers: 1250,
  newUsers: 48,
  activeDrivers: 85,
  totalDrivers: 120,
  todayBookings: 45,
  pendingBookings: 12,
  revenue: '125,000'
})

// Active Bookings Table
const bookingColumns = [
  {
    name: 'id',
    label: 'Booking ID',
    field: 'id',
    align: 'left'
  },
  {
    name: 'patient',
    label: 'Patient',
    field: 'patient',
    align: 'left'
  },
  {
    name: 'driver',
    label: 'Driver',
    field: 'driver',
    align: 'left'
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

const activeBookings = ref([
  {
    id: 'BK001',
    patient: 'John Doe',
    driver: 'David Smith',
    status: 'In Progress'
  },
  {
    id: 'BK002',
    patient: 'Jane Smith',
    driver: 'Mike Johnson',
    status: 'Pending'
  },
  {
    id: 'BK003',
    patient: 'Robert Brown',
    driver: 'Chris Wilson',
    status: 'Completed'
  }
])

// Notifications
const notifications = ref([
  {
    id: 1,
    message: 'New driver registration request',
    time: '5 minutes ago',
    icon: 'person_add',
    color: 'primary'
  },
  {
    id: 2,
    message: 'Emergency booking #BK001',
    time: '15 minutes ago',
    icon: 'warning',
    color: 'negative'
  },
  {
    id: 3,
    message: 'Payment received for booking #BK002',
    time: '1 hour ago',
    icon: 'payment',
    color: 'positive'
  }
])

// Methods
const getStatusColor = (status) => {
  switch (status) {
    case 'Completed':
      return 'positive'
    case 'In Progress':
      return 'warning'
    case 'Pending':
      return 'primary'
    case 'Cancelled':
      return 'negative'
    default:
      return 'grey'
  }
}

const viewBookingDetails = (bookingId) => {
  console.log('Viewing booking:', bookingId)
  // Implement booking details view
}

const cancelBooking = (bookingId) => {
  $q.dialog({
    title: 'Confirm Cancellation',
    message: `Are you sure you want to cancel booking ${bookingId}?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    console.log('Cancelling booking:', bookingId)
    // Implement cancellation logic
  })
}

const addDriver = () => {
  console.log('Opening add driver form')
  // Implement add driver functionality
}

const addVehicle = () => {
  console.log('Opening add vehicle form')
  // Implement add vehicle functionality
}

const viewReports = () => {
  console.log('Opening reports page')
  // Implement reports view
}

const openSettings = () => {
  console.log('Opening settings page')
  // Implement settings page
}

// Initialize analytics chart
const initChart = () => {
  if (!analyticsChart.value) return
  
  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  // Chart data
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const emergencyData = [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 85, 90]
  const scheduledData = [28, 48, 40, 19, 86, 27, 90, 65, 59, 80, 81, 56]
  const transferData = [18, 28, 30, 29, 46, 37, 50, 55, 60, 50, 40, 45]
  
  // Create chart
  chartInstance = new Chart(analyticsChart.value, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Emergency',
          data: emergencyData,
          borderColor: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Scheduled',
          data: scheduledData,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Transfer',
          data: transferData,
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Bookings'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Month'
          }
        }
      }
    }
  })
}

// Initialize chart on component mount
onMounted(() => {
  initChart()
  
  // Handle window resize
  window.addEventListener('resize', initChart)
})

// Clean up on component unmount
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  window.removeEventListener('resize', initChart)
})
</script>