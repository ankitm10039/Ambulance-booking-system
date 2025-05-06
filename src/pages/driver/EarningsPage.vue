<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-10">
        <!-- Earnings Summary Card -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h5">Earnings</div>
            <div class="text-subtitle2 text-grey">View your earnings summary and details</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-select
                  filled
                  v-model="timeFilter"
                  :options="timeFilterOptions"
                  label="Time Period"
                  @update:model-value="fetchEarnings"
                />
              </div>
              <div class="col-12 col-md-4" v-if="timeFilter === 'custom'">
                <q-input
                  filled
                  v-model="customDateFrom"
                  label="From Date"
                  type="date"
                  @update:model-value="fetchEarnings"
                />
              </div>
              <div class="col-12 col-md-4" v-if="timeFilter === 'custom'">
                <q-input
                  filled
                  v-model="customDateTo"
                  label="To Date"
                  type="date"
                  @update:model-value="fetchEarnings"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-card class="bg-primary text-white">
                  <q-card-section>
                    <div class="text-subtitle2">Total Earnings</div>
                    <div class="text-h4">₹{{ earningsSummary.totalEarnings.toFixed(2) }}</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12 col-md-4">
                <q-card class="bg-secondary text-white">
                  <q-card-section>
                    <div class="text-subtitle2">Completed Trips</div>
                    <div class="text-h4">{{ earningsSummary.completedTrips }}</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12 col-md-4">
                <q-card class="bg-accent text-white">
                  <q-card-section>
                    <div class="text-subtitle2">Average Fare</div>
                    <div class="text-h4">₹{{ earningsSummary.averageFare.toFixed(2) }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Earnings Chart Card -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center">
              <div class="text-h6">Earnings Trend</div>
              <q-btn-toggle
                v-model="chartType"
                flat
                toggle-color="primary"
                :options="[
                  {label: 'Line', value: 'line'},
                  {label: 'Bar', value: 'bar'}
                ]"
                class="q-ml-sm"
              />
            </div>
          </q-card-section>
          <q-card-section>
            <div style="height: 300px; position: relative;">
              <div v-if="loading" class="full-width row flex-center q-pa-xl">
                <q-spinner color="primary" size="3em" />
              </div>
              <div v-else-if="!hasEarningsData" class="full-width row flex-center q-pa-xl text-grey">
                <q-icon name="show_chart" size="2rem" class="q-mr-sm" />
                No earnings data available for the selected period
              </div>
              <template v-else>
                <line-chart
                  v-if="chartType === 'line'"
                  :chart-data="chartValues"
                  :chart-labels="chartLabels"
                  chart-title="Daily Earnings"
                  chart-color="#1976D2"
                />
                <bar-chart
                  v-else
                  :chart-data="chartValues"
                  :chart-labels="chartLabels"
                  chart-title="Daily Earnings"
                  chart-color="#1976D2"
                />
              </template>
            </div>
          </q-card-section>
        </q-card>

        <!-- Earnings Details Table -->
        <q-card>
          <q-card-section>
            <div class="text-h6">Earnings Details</div>
          </q-card-section>
          <q-card-section>
            <q-table
              :rows="earningsDetails"
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

              <template v-slot:no-data>
                <div class="full-width row flex-center q-pa-md text-grey">
                  <q-icon name="account_balance_wallet" size="2rem" class="q-mr-sm" />
                  No earnings data found
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useDriverStore } from 'stores/driver'
import { date } from 'quasar'
import LineChart from 'src/components/charts/LineChart.vue'
import BarChart from 'src/components/charts/BarChart.vue'

const driverStore = useDriverStore()
const loading = computed(() => driverStore.loading)
const earningsDetails = computed(() => driverStore.earningsDetails)
const earningsSummary = computed(() => driverStore.earningsSummary)
const hasEarningsData = computed(() => earningsDetails.value.length > 0)

const pagination = computed({
  get: () => driverStore.pagination,
  set: (value) => driverStore.updatePagination(value)
})

const timeFilter = ref('week')
const customDateFrom = ref(null)
const customDateTo = ref(null)
const chartType = ref('line')

// Chart data processing
const chartLabels = computed(() => {
  return driverStore.earningsChartData.map(item => date.formatDate(new Date(item.date), 'MMM D'))
})

const chartValues = computed(() => {
  return driverStore.earningsChartData.map(item => item.earnings)
})

const timeFilterOptions = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: 'quarter' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom Range', value: 'custom' }
]

const columns = [
  {
    name: 'date',
    required: true,
    label: 'Date & Time',
    align: 'left',
    field: row => row.completedAt || row.createdAt,
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
    name: 'distance',
    required: true,
    label: 'Distance',
    align: 'right',
    field: 'distance',
    format: val => `${val ? val.toFixed(2) : 'N/A'} km`,
    sortable: true
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
    format: val => `₹${val ? val.toFixed(2) : 'N/A'}`,
    sortable: true
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

// Handle pagination and sorting
const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  
  driverStore.updatePagination({
    page,
    rowsPerPage,
    sortBy,
    descending
  })
  
  fetchEarnings()
}

// Fetch earnings with filters
const fetchEarnings = async () => {
  const params = { period: timeFilter.value }
  
  if (timeFilter.value === 'custom') {
    if (customDateFrom.value) {
      params.dateFrom = customDateFrom.value
    }
    
    if (customDateTo.value) {
      params.dateTo = customDateTo.value
    }
  }
  
  await driverStore.fetchEarnings(params)
  
  // Initialize chart after data is loaded
  if (hasEarningsData.value) {
    initChart()
  }
}

// Initialize chart
const initChart = () => {
  console.log('Chart data ready:', {
    labels: chartLabels.value,
    values: chartValues.value
  })
  
  // The chart components will automatically render with the computed data
  // No additional initialization needed as we're using Vue components
}

// Watch for time filter changes
watch(timeFilter, (newValue) => {
  if (newValue !== 'custom') {
    customDateFrom.value = null
    customDateTo.value = null
  } else {
    // Set default custom date range (last 7 days)
    const today = new Date()
    customDateTo.value = date.formatDate(today, 'YYYY-MM-DD')
    
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    customDateFrom.value = date.formatDate(lastWeek, 'YYYY-MM-DD')
  }
})

onMounted(() => {
  fetchEarnings()
})
</script>