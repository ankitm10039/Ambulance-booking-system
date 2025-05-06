<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Reports & Analytics</div>

    <!-- Report Filters -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.reportType"
              :options="reportTypeOptions"
              label="Report Type"
              outlined
              dense
              @update:model-value="generateReport"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.timeFrame"
              :options="timeFrameOptions"
              label="Time Frame"
              outlined
              dense
              @update:model-value="handleTimeFrameChange"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="filters.startDate"
              label="Start Date"
              outlined
              dense
              type="date"
              :disable="filters.timeFrame !== 'custom'"
              @update:model-value="generateReport"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="filters.endDate"
              label="End Date"
              outlined
              dense
              type="date"
              :disable="filters.timeFrame !== 'custom'"
              @update:model-value="generateReport"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" class="text-capitalize" icon="refresh" label="Refresh" @click="generateReport" :loading="loading" />
        <q-btn color="secondary" class="text-capitalize" icon="download" label="Export" @click="exportReport" :disable="loading" />
      </q-card-actions>
    </q-card>

    <!-- Dashboard Stats -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="text-h6">Total Bookings</div>
            <div class="text-h4">{{ reportData.totalBookings }}</div>
            <div class="text-caption">{{ getComparisonText(reportData.bookingGrowth) }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-secondary text-white">
          <q-card-section>
            <div class="text-h6">Revenue</div>
            <div class="text-h4">₹{{ formatNumber(reportData.totalRevenue) }}</div>
            <div class="text-caption">{{ getComparisonText(reportData.revenueGrowth) }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-accent text-white">
          <q-card-section>
            <div class="text-h6">Avg. Response Time</div>
            <div class="text-h4">{{ reportData.avgResponseTime }} min</div>
            <div class="text-caption">{{ getComparisonText(reportData.responseTimeChange, true) }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-dark text-white">
          <q-card-section>
            <div class="text-h6">Completion Rate</div>
            <div class="text-h4">{{ reportData.completionRate }}%</div>
            <div class="text-caption">{{ getComparisonText(reportData.completionRateChange) }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Main Chart -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Bookings Over Time</div>
      </q-card-section>
      <q-card-section>
        <div style="height: 400px" id="main-chart">
          <q-spinner v-if="loading" size="50px" color="primary" class="absolute-center" />
          <canvas ref="mainChart"></canvas>
        </div>
      </q-card-section>
    </q-card>

    <!-- Secondary Charts Row -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Bookings by Type</div>
          </q-card-section>
          <q-card-section>
            <div style="height: 300px" id="booking-types-chart">
              <q-spinner v-if="loading" size="40px" color="primary" class="absolute-center" />
              <canvas ref="bookingTypesChart"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Top Areas</div>
          </q-card-section>
          <q-card-section>
            <div style="height: 300px" id="areas-chart">
              <q-spinner v-if="loading" size="40px" color="primary" class="absolute-center" />
              <canvas ref="areasChart"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Detailed Report Table -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Detailed Report</div>
      </q-card-section>
      <q-card-section>
        <q-table
          :rows="tableData"
          :columns="getTableColumns()"
          row-key="id"
          :loading="loading"
          :pagination="{ rowsPerPage: 5 }"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useQuasar, date } from 'quasar'
import { api } from 'src/boot/axios'
import Chart from 'chart.js/auto'

const $q = useQuasar()
const loading = ref(false)
const mainChart = ref(null)
const bookingTypesChart = ref(null)
const areasChart = ref(null)
const mainChartInstance = ref(null)
const bookingTypesChartInstance = ref(null)
const areasChartInstance = ref(null)

// Filters
const filters = reactive({
  reportType: 'bookings',
  timeFrame: 'month',
  startDate: date.formatDate(date.subtractFromDate(new Date(), { month: 1 }), 'YYYY-MM-DD'),
  endDate: date.formatDate(new Date(), 'YYYY-MM-DD')
})

// Report options
const reportTypeOptions = [
  { label: 'Bookings', value: 'bookings' },
  { label: 'Revenue', value: 'revenue' },
  { label: 'Response Time', value: 'response-time' },
  { label: 'Driver Performance', value: 'driver-performance' }
]

const timeFrameOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last Month', value: 'last-month' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom Range', value: 'custom' }
]

// Report data
const reportData = reactive({
  totalBookings: 0,
  bookingGrowth: 0,
  totalRevenue: 0,
  revenueGrowth: 0,
  avgResponseTime: 0,
  responseTimeChange: 0,
  completionRate: 0,
  completionRateChange: 0
})

// Chart data
const chartData = reactive({
  labels: [],
  datasets: []
})

const pieChartData = reactive({
  labels: [],
  datasets: []
})

const barChartData = reactive({
  labels: [],
  datasets: []
})

// Table data
const tableData = ref([])

// Handle time frame change
const handleTimeFrameChange = () => {
  const now = new Date()
  
  switch (filters.timeFrame) {
    case 'today':
      filters.startDate = date.formatDate(now, 'YYYY-MM-DD')
      filters.endDate = date.formatDate(now, 'YYYY-MM-DD')
      break
    case 'yesterday':
      const yesterday = date.subtractFromDate(now, { day: 1 })
      filters.startDate = date.formatDate(yesterday, 'YYYY-MM-DD')
      filters.endDate = date.formatDate(yesterday, 'YYYY-MM-DD')
      break
    case 'week':
      filters.startDate = date.formatDate(date.subtractFromDate(now, { day: now.getDay() }), 'YYYY-MM-DD')
      filters.endDate = date.formatDate(now, 'YYYY-MM-DD')
      break
    case 'month':
      filters.startDate = date.formatDate(new Date(now.getFullYear(), now.getMonth(), 1), 'YYYY-MM-DD')
      filters.endDate = date.formatDate(now, 'YYYY-MM-DD')
      break
    case 'last-month':
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      filters.startDate = date.formatDate(firstDayLastMonth, 'YYYY-MM-DD')
      filters.endDate = date.formatDate(lastDayLastMonth, 'YYYY-MM-DD')
      break
    case 'year':
      filters.startDate = date.formatDate(new Date(now.getFullYear(), 0, 1), 'YYYY-MM-DD')
      filters.endDate = date.formatDate(now, 'YYYY-MM-DD')
      break
    // For 'custom', we don't change the dates
  }
  
  generateReport()
}

// Static data for reports
const staticReportData = {
  bookings: {
    summary: {
      totalBookings: 248,
      bookingGrowth: 15,
      totalRevenue: 124500,
      revenueGrowth: 12,
      avgResponseTime: 8,
      responseTimeChange: -5,
      completionRate: 92,
      completionRateChange: 3
    },
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Total Bookings',
          data: [65, 78, 82, 75, 90, 95, 88, 85, 92, 98, 105, 110],
          borderColor: '#1976D2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Emergency',
          data: [25, 30, 28, 32, 38, 42, 35, 30, 36, 40, 45, 48],
          borderColor: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Scheduled',
          data: [35, 40, 45, 38, 42, 45, 43, 48, 50, 52, 55, 58],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Transfer',
          data: [5, 8, 9, 5, 10, 8, 10, 7, 6, 6, 5, 4],
          borderColor: '#FF9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    bookingTypes: {
      labels: ['Emergency', 'Scheduled', 'Transfer', 'ICU Transfer', 'Special Care'],
      datasets: [
        {
          data: [350, 420, 80, 45, 25],
          backgroundColor: ['#F44336', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'],
          borderWidth: 1
        }
      ]
    },
    topAreas: {
      labels: ['Downtown', 'Westside', 'Northside', 'Eastside', 'Southside', 'Central'],
      datasets: [
        {
          label: 'Bookings',
          data: [145, 120, 95, 85, 65, 40],
          backgroundColor: [
            'rgba(156, 39, 176, 0.8)',
            'rgba(156, 39, 176, 0.7)',
            'rgba(156, 39, 176, 0.6)',
            'rgba(156, 39, 176, 0.5)',
            'rgba(156, 39, 176, 0.4)',
            'rgba(156, 39, 176, 0.3)'
          ],
          borderColor: 'rgba(156, 39, 176, 1)',
          borderWidth: 1
        }
      ]
    },
    tableData: [
      { date: '2023-05-01', total: 8, emergency: 3, scheduled: 4, transfer: 1, completed: 7, cancelled: 1 },
      { date: '2023-05-02', total: 10, emergency: 4, scheduled: 5, transfer: 1, completed: 9, cancelled: 1 },
      { date: '2023-05-03', total: 7, emergency: 2, scheduled: 4, transfer: 1, completed: 6, cancelled: 1 },
      { date: '2023-05-04', total: 9, emergency: 3, scheduled: 5, transfer: 1, completed: 8, cancelled: 1 },
      { date: '2023-05-05', total: 12, emergency: 5, scheduled: 6, transfer: 1, completed: 11, cancelled: 1 },
      { date: '2023-05-06', total: 8, emergency: 3, scheduled: 4, transfer: 1, completed: 7, cancelled: 1 },
      { date: '2023-05-07', total: 6, emergency: 2, scheduled: 3, transfer: 1, completed: 5, cancelled: 1 },
      { date: '2023-05-08', total: 9, emergency: 4, scheduled: 4, transfer: 1, completed: 8, cancelled: 1 },
      { date: '2023-05-09', total: 11, emergency: 5, scheduled: 5, transfer: 1, completed: 10, cancelled: 1 },
      { date: '2023-05-10', total: 8, emergency: 3, scheduled: 4, transfer: 1, completed: 7, cancelled: 1 },
      { date: '2023-05-11', total: 7, emergency: 2, scheduled: 4, transfer: 1, completed: 6, cancelled: 1 },
      { date: '2023-05-12', total: 10, emergency: 4, scheduled: 5, transfer: 1, completed: 9, cancelled: 1 },
      { date: '2023-05-13', total: 12, emergency: 5, scheduled: 6, transfer: 1, completed: 11, cancelled: 1 },
      { date: '2023-05-14', total: 9, emergency: 3, scheduled: 5, transfer: 1, completed: 8, cancelled: 1 },
      { date: '2023-05-15', total: 8, emergency: 2, scheduled: 5, transfer: 1, completed: 7, cancelled: 1 },
      { date: '2023-05-16', total: 7, emergency: 3, scheduled: 3, transfer: 1, completed: 6, cancelled: 1 },
      { date: '2023-05-17', total: 10, emergency: 4, scheduled: 5, transfer: 1, completed: 9, cancelled: 1 },
      { date: '2023-05-18', total: 11, emergency: 5, scheduled: 5, transfer: 1, completed: 10, cancelled: 1 },
      { date: '2023-05-19', total: 9, emergency: 3, scheduled: 5, transfer: 1, completed: 8, cancelled: 1 },
      { date: '2023-05-20', total: 8, emergency: 2, scheduled: 5, transfer: 1, completed: 7, cancelled: 1 },
      { date: '2023-05-21', total: 7, emergency: 3, scheduled: 3, transfer: 1, completed: 6, cancelled: 1 },
      { date: '2023-05-22', total: 9, emergency: 4, scheduled: 4, transfer: 1, completed: 8, cancelled: 1 },
      { date: '2023-05-23', total: 10, emergency: 3, scheduled: 6, transfer: 1, completed: 9, cancelled: 1 },
      { date: '2023-05-24', total: 8, emergency: 2, scheduled: 5, transfer: 1, completed: 7, cancelled: 1 },
      { date: '2023-05-25', total: 7, emergency: 3, scheduled: 3, transfer: 1, completed: 6, cancelled: 1 },
      { date: '2023-05-26', total: 9, emergency: 4, scheduled: 4, transfer: 1, completed: 8, cancelled: 1 },
      { date: '2023-05-27', total: 11, emergency: 5, scheduled: 5, transfer: 1, completed: 10, cancelled: 1 },
      { date: '2023-05-28', total: 8, emergency: 3, scheduled: 4, transfer: 1, completed: 7, cancelled: 1 },
      { date: '2023-05-29', total: 7, emergency: 2, scheduled: 4, transfer: 1, completed: 6, cancelled: 1 },
      { date: '2023-05-30', total: 9, emergency: 4, scheduled: 4, transfer: 1, completed: 8, cancelled: 1 },
      { date: '2023-05-31', total: 10, emergency: 3, scheduled: 6, transfer: 1, completed: 9, cancelled: 1 }
    ]
  },
  revenue: {
    summary: {
      totalBookings: 248,
      bookingGrowth: 15,
      totalRevenue: 124500,
      revenueGrowth: 12,
      avgResponseTime: 8,
      responseTimeChange: -5,
      completionRate: 92,
      completionRateChange: 3
    },
    chartData: {
      labels: ['2023-05-01', '2023-05-02', '2023-05-03', '2023-05-04', '2023-05-05', '2023-05-06', '2023-05-07', 
               '2023-05-08', '2023-05-09', '2023-05-10', '2023-05-11', '2023-05-12', '2023-05-13', '2023-05-14',
               '2023-05-15', '2023-05-16', '2023-05-17', '2023-05-18', '2023-05-19', '2023-05-20', '2023-05-21',
               '2023-05-22', '2023-05-23', '2023-05-24', '2023-05-25', '2023-05-26', '2023-05-27', '2023-05-28',
               '2023-05-29', '2023-05-30', '2023-05-31'],
      datasets: [
        {
          label: 'Total Revenue',
          data: [4000, 5000, 3500, 4500, 6000, 4000, 3000, 4500, 5500, 4000, 3500, 5000, 6000, 4500, 4000, 3500, 5000, 5500, 4500, 4000, 3500, 4500, 5000, 4000, 3500, 4500, 5500, 4000, 3500, 4500, 5000],
          borderColor: '#1976D2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          fill: true
        },
        {
          label: 'Emergency',
          data: [1800, 2200, 1200, 1800, 3000, 1800, 1200, 2400, 3000, 1800, 1200, 2400, 3000, 1800, 1200, 1800, 2400, 3000, 1800, 1200, 1800, 2400, 1800, 1200, 1800, 2400, 3000, 1800, 1200, 2400, 1800],
          borderColor: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          fill: true
        },
        {
          label: 'Scheduled',
          data: [1800, 2300, 1800, 2300, 2700, 1800, 1350, 1800, 2250, 1800, 1800, 2250, 2700, 2250, 2250, 1350, 2250, 2250, 2250, 2250, 1350, 1800, 2700, 2250, 1350, 1800, 2250, 1800, 1800, 1800, 2700],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true
        }
      ]
    },
    bookingTypes: {
      labels: ['Emergency', 'Scheduled', 'Transfer'],
      datasets: [
        {
          data: [58800, 60750, 4950],
          backgroundColor: ['#F44336', '#4CAF50', '#2196F3']
        }
      ]
    },
    topAreas: {
      labels: ['Downtown', 'Westside', 'Northside', 'Eastside', 'Southside'],
      datasets: [
        {
          label: 'Revenue',
          data: [22500, 19000, 16000, 14000, 11000],
          backgroundColor: '#9C27B0'
        }
      ]
    },
    tableData: [
      { date: '2023-05-01', total: 4000, emergency: 1800, scheduled: 1800, transfer: 400 },
      { date: '2023-05-02', total: 5000, emergency: 2200, scheduled: 2300, transfer: 500 },
      { date: '2023-05-03', total: 3500, emergency: 1200, scheduled: 1800, transfer: 500 },
      { date: '2023-05-04', total: 4500, emergency: 1800, scheduled: 2300, transfer: 400 },
      { date: '2023-05-05', total: 6000, emergency: 3000, scheduled: 2700, transfer: 300 },
      { date: '2023-05-06', total: 4000, emergency: 1800, scheduled: 1800, transfer: 400 },
      { date: '2023-05-07', total: 3000, emergency: 1200, scheduled: 1350, transfer: 450 },
      { date: '2023-05-08', total: 4500, emergency: 2400, scheduled: 1800, transfer: 300 },
      { date: '2023-05-09', total: 5500, emergency: 3000, scheduled: 2250, transfer: 250 },
      { date: '2023-05-10', total: 4000, emergency: 1800, scheduled: 1800, transfer: 400 },
      { date: '2023-05-11', total: 3500, emergency: 1200, scheduled: 1800, transfer: 500 },
      { date: '2023-05-12', total: 5000, emergency: 2400, scheduled: 2250, transfer: 350 },
      { date: '2023-05-13', total: 6000, emergency: 3000, scheduled: 2700, transfer: 300 },
      { date: '2023-05-14', total: 4500, emergency: 1800, scheduled: 2250, transfer: 450 },
      { date: '2023-05-15', total: 4000, emergency: 1200, scheduled: 2250, transfer: 550 },
      { date: '2023-05-16', total: 3500, emergency: 1800, scheduled: 1350, transfer: 350 },
      { date: '2023-05-17', total: 5000, emergency: 2400, scheduled: 2250, transfer: 350 },
      { date: '2023-05-18', total: 5500, emergency: 3000, scheduled: 2250, transfer: 250 },
      { date: '2023-05-19', total: 4500, emergency: 1800, scheduled: 2250, transfer: 450 },
      { date: '2023-05-20', total: 4000, emergency: 1200, scheduled: 2250, transfer: 550 },
      { date: '2023-05-21', total: 3500, emergency: 1800, scheduled: 1350, transfer: 350 },
      { date: '2023-05-22', total: 4500, emergency: 2400, scheduled: 1800, transfer: 300 },
      { date: '2023-05-23', total: 5000, emergency: 1800, scheduled: 2700, transfer: 500 },
      { date: '2023-05-24', total: 4000, emergency: 1200, scheduled: 2250, transfer: 550 },
      { date: '2023-05-25', total: 3500, emergency: 1800, scheduled: 1350, transfer: 350 },
      { date: '2023-05-26', total: 4500, emergency: 2400, scheduled: 1800, transfer: 300 },
      { date: '2023-05-27', total: 5500, emergency: 3000, scheduled: 2250, transfer: 250 },
      { date: '2023-05-28', total: 4000, emergency: 1800, scheduled: 1800, transfer: 400 },
      { date: '2023-05-29', total: 3500, emergency: 1200, scheduled: 1800, transfer: 500 },
      { date: '2023-05-30', total: 4500, emergency: 2400, scheduled: 1800, transfer: 300 },
      { date: '2023-05-31', total: 5000, emergency: 1800, scheduled: 2700, transfer: 500 }
    ]
  },
  'response-time': {
    summary: {
      totalBookings: 248,
      bookingGrowth: 15,
      totalRevenue: 124500,
      revenueGrowth: 12,
      avgResponseTime: 8,
      responseTimeChange: -5,
      completionRate: 92,
      completionRateChange: 3
    },
    chartData: {
      labels: ['2023-05-01', '2023-05-02', '2023-05-03', '2023-05-04', '2023-05-05', '2023-05-06', '2023-05-07', 
               '2023-05-08', '2023-05-09', '2023-05-10', '2023-05-11', '2023-05-12', '2023-05-13', '2023-05-14',
               '2023-05-15', '2023-05-16', '2023-05-17', '2023-05-18', '2023-05-19', '2023-05-20', '2023-05-21',
               '2023-05-22', '2023-05-23', '2023-05-24', '2023-05-25', '2023-05-26', '2023-05-27', '2023-05-28',
               '2023-05-29', '2023-05-30', '2023-05-31'],
      datasets: [
        {
          label: 'Average Response Time (min)',
          data: [9, 8, 10, 9, 7, 8, 9, 7, 6, 8, 9, 7, 6, 8, 9, 10, 8, 7, 8, 9, 10, 8, 7, 9, 10, 8, 7, 9, 10, 8, 7],
          borderColor: '#1976D2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          fill: true
        },
        {
          label: 'Emergency',
          data: [6, 5, 7, 6, 5, 6, 7, 5, 4, 6, 7, 5, 4, 6, 7, 8, 6, 5, 6, 7, 8, 6, 5, 7, 8, 6, 5, 7, 8, 6, 5],
          borderColor: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          fill: true
        },
        {
          label: 'Scheduled',
          data: [12, 11, 13, 12, 9, 10, 11, 9, 8, 10, 11, 9, 8, 10, 11, 12, 10, 9, 10, 11, 12, 10, 9, 11, 12, 10, 9, 11, 12, 10, 9],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true
        }
      ]
    },
    bookingTypes: {
      labels: ['Emergency', 'Scheduled', 'Transfer'],
      datasets: [
        {
          data: [6, 10, 12],
          backgroundColor: ['#F44336', '#4CAF50', '#2196F3']
        }
      ]
    },
    topAreas: {
      labels: ['Downtown', 'Westside', 'Northside', 'Eastside', 'Southside'],
      datasets: [
        {
          label: 'Avg. Response Time (min)',
          data: [6, 8, 9, 10, 12],
          backgroundColor: '#9C27B0'
        }
      ]
    },
    tableData: [
      { date: '2023-05-01', avgResponseTime: 9, emergency: 6, scheduled: 12, transfer: 12 },
      { date: '2023-05-02', avgResponseTime: 8, emergency: 5, scheduled: 11, transfer: 12 },
      { date: '2023-05-03', avgResponseTime: 10, emergency: 7, scheduled: 13, transfer: 12 },
      { date: '2023-05-04', avgResponseTime: 9, emergency: 6, scheduled: 12, transfer: 12 },
      { date: '2023-05-05', avgResponseTime: 7, emergency: 5, scheduled: 9, transfer: 12 },
      { date: '2023-05-06', avgResponseTime: 8, emergency: 6, scheduled: 10, transfer: 12 },
      { date: '2023-05-07', avgResponseTime: 9, emergency: 7, scheduled: 11, transfer: 12 },
      { date: '2023-05-08', avgResponseTime: 7, emergency: 5, scheduled: 9, transfer: 12 },
      { date: '2023-05-09', avgResponseTime: 6, emergency: 4, scheduled: 8, transfer: 12 },
      { date: '2023-05-10', avgResponseTime: 8, emergency: 6, scheduled: 10, transfer: 12 },
      { date: '2023-05-11', avgResponseTime: 9, emergency: 7, scheduled: 11, transfer: 12 },
      { date: '2023-05-12', avgResponseTime: 7, emergency: 5, scheduled: 9, transfer: 12 },
      { date: '2023-05-13', avgResponseTime: 6, emergency: 4, scheduled: 8, transfer: 12 },
      { date: '2023-05-14', avgResponseTime: 8, emergency: 6, scheduled: 10, transfer: 12 },
      { date: '2023-05-15', avgResponseTime: 9, emergency: 7, scheduled: 11, transfer: 12 },
      { date: '2023-05-16', avgResponseTime: 10, emergency: 8, scheduled: 12, transfer: 12 },
      { date: '2023-05-17', avgResponseTime: 8, emergency: 6, scheduled: 10, transfer: 12 },
      { date: '2023-05-18', avgResponseTime: 7, emergency: 5, scheduled: 9, transfer: 12 },
      { date: '2023-05-19', avgResponseTime: 8, emergency: 6, scheduled: 10, transfer: 12 },
      { date: '2023-05-20', avgResponseTime: 9, emergency: 7, scheduled: 11, transfer: 12 },
      { date: '2023-05-21', avgResponseTime: 10, emergency: 8, scheduled: 12, transfer: 12 },
      { date: '2023-05-22', avgResponseTime: 8, emergency: 6, scheduled: 10, transfer: 12 },
      { date: '2023-05-23', avgResponseTime: 7, emergency: 5, scheduled: 9, transfer: 12 },
      { date: '2023-05-24', avgResponseTime: 9, emergency: 7, scheduled: 11, transfer: 12 },
      { date: '2023-05-25', avgResponseTime: 10, emergency: 8, scheduled: 12, transfer: 12 },
      { date: '2023-05-26', avgResponseTime: 8, emergency: 6, scheduled: 10, transfer: 12 },
      { date: '2023-05-27', avgResponseTime: 7, emergency: 5, scheduled: 9, transfer: 12 },
      { date: '2023-05-28', avgResponseTime: 9, emergency: 7, scheduled: 11, transfer: 12 },
      { date: '2023-05-29', avgResponseTime: 10, emergency: 8, scheduled: 12, transfer: 12 },
      { date: '2023-05-30', avgResponseTime: 8, emergency: 6, scheduled: 10, transfer: 12 },
      { date: '2023-05-31', avgResponseTime: 7, emergency: 5, scheduled: 9, transfer: 12 }
    ]
  },
  'driver-performance': {
    summary: {
      totalBookings: 248,
      bookingGrowth: 15,
      totalRevenue: 124500,
      revenueGrowth: 12,
      avgResponseTime: 8,
      responseTimeChange: -5,
      completionRate: 92,
      completionRateChange: 3
    },
    chartData: {
      labels: ['Rajesh Kumar', 'Amit Singh', 'Priya Sharma', 'Vikram Patel', 'Sanjay Gupta', 'Neha Verma', 'Rahul Mehta', 'Deepak Joshi'],
      datasets: [
        {
          label: 'Bookings Completed',
          data: [42, 38, 35, 32, 30, 28, 25, 18],
          backgroundColor: '#1976D2'
        },
        {
          label: 'Avg. Rating',
          data: [4.8, 4.7, 4.9, 4.6, 4.5, 4.8, 4.7, 4.4],
          backgroundColor: '#4CAF50'
        },
        {
          label: 'Avg. Response Time (min)',
          data: [6, 7, 5, 8, 9, 6, 7, 10],
          backgroundColor: '#F44336'
        }
      ]
    },
    bookingTypes: {
      labels: ['5 Star', '4 Star', '3 Star', '2 Star', '1 Star'],
      datasets: [
        {
          data: [180, 50, 12, 5, 1],
          backgroundColor: ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336']
        }
      ]
    },
    topAreas: {
      labels: ['Rajesh Kumar', 'Amit Singh', 'Priya Sharma', 'Vikram Patel', 'Sanjay Gupta'],
      datasets: [
        {
          label: 'Revenue Generated',
          data: [21000, 19000, 17500, 16000, 15000],
          backgroundColor: '#9C27B0'
        }
      ]
    },
    tableData: [
      { driverName: 'Rajesh Kumar', bookingsCompleted: 42, avgRating: 4.8, avgResponseTime: 6, revenue: 21000, cancellationRate: 2 },
      { driverName: 'Amit Singh', bookingsCompleted: 38, avgRating: 4.7, avgResponseTime: 7, revenue: 19000, cancellationRate: 3 },
      { driverName: 'Priya Sharma', bookingsCompleted: 35, avgRating: 4.9, avgResponseTime: 5, revenue: 17500, cancellationRate: 1 },
      { driverName: 'Vikram Patel', bookingsCompleted: 32, avgRating: 4.6, avgResponseTime: 8, revenue: 16000, cancellationRate: 4 },
      { driverName: 'Sanjay Gupta', bookingsCompleted: 30, avgRating: 4.5, avgResponseTime: 9, revenue: 15000, cancellationRate: 5 },
      { driverName: 'Neha Verma', bookingsCompleted: 28, avgRating: 4.8, avgResponseTime: 6, revenue: 14000, cancellationRate: 2 },
      { driverName: 'Rahul Mehta', bookingsCompleted: 25, avgRating: 4.7, avgResponseTime: 7, revenue: 12500, cancellationRate: 3 },
      { driverName: 'Deepak Joshi', bookingsCompleted: 18, avgRating: 4.4, avgResponseTime: 10, revenue: 9000, cancellationRate: 6 }
    ]
  }
};

// Generate report
const generateReport = () => {
  console.log('Generating report for:', filters.reportType);
  loading.value = true;
  
  try {
    // Use static data based on report type
    const data = staticReportData[filters.reportType];
    
    // Update report data
    reportData.totalBookings = data.summary.totalBookings;
    reportData.bookingGrowth = data.summary.bookingGrowth;
    reportData.totalRevenue = data.summary.totalRevenue;
    reportData.revenueGrowth = data.summary.revenueGrowth;
    reportData.avgResponseTime = data.summary.avgResponseTime;
    reportData.responseTimeChange = data.summary.responseTimeChange;
    reportData.completionRate = data.summary.completionRate;
    reportData.completionRateChange = data.summary.completionRateChange;
    
    // Update table data
    tableData.value = data.tableData;
    
    // Simulate API delay
    setTimeout(() => {
      // Update charts
      updateCharts();
      loading.value = false;
    }, 500);
    
  } catch (error) {
    console.error('Error generating report:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to generate report',
      icon: 'error'
    });
    loading.value = false;
  }
}

// Update charts
const updateCharts = () => {
  try {
    console.log('Updating charts...');
    console.log('Main chart ref:', mainChart.value);
    console.log('Booking types chart ref:', bookingTypesChart.value);
    console.log('Areas chart ref:', areasChart.value);
    
    // Destroy existing chart instances
    if (mainChartInstance.value) {
      mainChartInstance.value.destroy();
      mainChartInstance.value = null;
    }
    
    if (bookingTypesChartInstance.value) {
      bookingTypesChartInstance.value.destroy();
      bookingTypesChartInstance.value = null;
    }
    
    if (areasChartInstance.value) {
      areasChartInstance.value.destroy();
      areasChartInstance.value = null;
    }
    
    // Create main chart
    if (mainChart.value) {
      console.log('Creating main chart...');
      const ctx = mainChart.value.getContext('2d');
      
      // Create simple line chart
      mainChartInstance.value = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Total Bookings',
              data: [65, 78, 82, 75, 90, 95, 88, 85, 92, 98, 105, 110],
              borderColor: '#1976D2',
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Emergency',
              data: [25, 30, 28, 32, 38, 42, 35, 30, 36, 40, 45, 48],
              borderColor: '#F44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Scheduled',
              data: [35, 40, 45, 38, 42, 45, 43, 48, 50, 52, 55, 58],
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
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
              position: 'top'
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
    
    // Create booking types chart
    if (bookingTypesChart.value) {
      console.log('Creating booking types chart...');
      const ctx = bookingTypesChart.value.getContext('2d');
      
      // Create simple pie chart
      bookingTypesChartInstance.value = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Emergency', 'Scheduled', 'Transfer', 'ICU Transfer', 'Special Care'],
          datasets: [
            {
              data: [350, 420, 80, 45, 25],
              backgroundColor: ['#F44336', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'],
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      });
    }
    
    // Create areas chart
    if (areasChart.value) {
      console.log('Creating areas chart...');
      const ctx = areasChart.value.getContext('2d');
      
      // Create simple bar chart
      areasChartInstance.value = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Downtown', 'Westside', 'Northside', 'Eastside', 'Southside', 'Central'],
          datasets: [
            {
              label: 'Bookings',
              data: [145, 120, 95, 85, 65, 40],
              backgroundColor: '#9C27B0'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
    
    console.log('Charts updated successfully!');
  } catch (error) {
    console.error('Error updating charts:', error);
  }
}

// Get chart type based on report type
const getChartType = () => {
  switch (filters.reportType) {
    case 'bookings':
    case 'revenue':
      return 'line'
    case 'response-time':
      return 'line'
    case 'driver-performance':
      return 'bar'
    default:
      return 'line'
  }
}

// Get report title
const getReportTitle = () => {
  const reportTypeMap = {
    'bookings': 'Bookings Over Time',
    'revenue': 'Revenue Trend',
    'response-time': 'Average Response Time',
    'driver-performance': 'Driver Performance'
  }
  
  return reportTypeMap[filters.reportType] || 'Report'
}

// Get table columns based on report type
const getTableColumns = () => {
  const commonColumns = [
    { name: 'date', label: 'Date', field: 'date', sortable: true, align: 'left' }
  ]
  
  switch (filters.reportType) {
    case 'bookings':
      return [
        ...commonColumns,
        { name: 'total', label: 'Total Bookings', field: 'total', sortable: true, align: 'center' },
        { name: 'emergency', label: 'Emergency', field: 'emergency', sortable: true, align: 'center' },
        { name: 'scheduled', label: 'Scheduled', field: 'scheduled', sortable: true, align: 'center' },
        { name: 'transfer', label: 'Transfer', field: 'transfer', sortable: true, align: 'center' },
        { name: 'completed', label: 'Completed', field: 'completed', sortable: true, align: 'center' },
        { name: 'cancelled', label: 'Cancelled', field: 'cancelled', sortable: true, align: 'center' }
      ]
    case 'revenue':
      return [
        ...commonColumns,
        { name: 'total', label: 'Total Revenue', field: 'total', sortable: true, align: 'center',
          format: val => `₹${formatNumber(val)}` },
        { name: 'emergency', label: 'Emergency', field: 'emergency', sortable: true, align: 'center',
          format: val => `₹${formatNumber(val)}` },
        { name: 'scheduled', label: 'Scheduled', field: 'scheduled', sortable: true, align: 'center',
          format: val => `₹${formatNumber(val)}` },
        { name: 'transfer', label: 'Transfer', field: 'transfer', sortable: true, align: 'center',
          format: val => `₹${formatNumber(val)}` }
      ]
    case 'response-time':
      return [
        ...commonColumns,
        { name: 'avgResponseTime', label: 'Avg. Response Time (min)', field: 'avgResponseTime', sortable: true, align: 'center' },
        { name: 'emergency', label: 'Emergency (min)', field: 'emergency', sortable: true, align: 'center' },
        { name: 'scheduled', label: 'Scheduled (min)', field: 'scheduled', sortable: true, align: 'center' },
        { name: 'transfer', label: 'Transfer (min)', field: 'transfer', sortable: true, align: 'center' }
      ]
    case 'driver-performance':
      return [
        { name: 'driverName', label: 'Driver Name', field: 'driverName', sortable: true, align: 'left' },
        { name: 'bookingsCompleted', label: 'Bookings Completed', field: 'bookingsCompleted', sortable: true, align: 'center' },
        { name: 'avgRating', label: 'Avg. Rating', field: 'avgRating', sortable: true, align: 'center' },
        { name: 'avgResponseTime', label: 'Avg. Response Time (min)', field: 'avgResponseTime', sortable: true, align: 'center' },
        { name: 'revenue', label: 'Revenue Generated', field: 'revenue', sortable: true, align: 'center',
          format: val => `₹${formatNumber(val)}` },
        { name: 'cancellationRate', label: 'Cancellation Rate (%)', field: 'cancellationRate', sortable: true, align: 'center' }
      ]
    default:
      return commonColumns
  }
}

// Format number with commas
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Get comparison text
const getComparisonText = (value, isInverse = false) => {
  if (value === 0) return 'No change'
  
  const prefix = isInverse ? (value < 0 ? '+' : '-') : (value > 0 ? '+' : '')
  const absValue = Math.abs(value)
  
  return `${prefix}${absValue}% vs previous period`
}

// Export report
const exportReport = () => {
  // Show notification
  $q.notify({
    color: 'info',
    message: 'Exporting report...',
    icon: 'download'
  })
  
  // In a real implementation, you would generate a CSV/Excel file
  // For now, we'll just simulate the export
  
  // Get report title for the filename
  const reportTitle = getReportTitle().replace(/\s+/g, '-').toLowerCase()
  const dateRange = `${filters.startDate}_to_${filters.endDate}`
  const filename = `${reportTitle}_${dateRange}.csv`
  
  // Simulate download delay
  setTimeout(() => {
    $q.notify({
      color: 'positive',
      message: `Report exported as ${filename}`,
      icon: 'check'
    })
  }, 1500)
}

// Watch for changes in report type
watch(() => filters.reportType, () => {
  generateReport()
})

// Initialize report on component mount
onMounted(() => {
  console.log('Component mounted');
  
  // Set initial data
  const data = staticReportData['bookings'];
  
  // Update report data
  reportData.totalBookings = data.summary.totalBookings;
  reportData.bookingGrowth = data.summary.bookingGrowth;
  reportData.totalRevenue = data.summary.totalRevenue;
  reportData.revenueGrowth = data.summary.revenueGrowth;
  reportData.avgResponseTime = data.summary.avgResponseTime;
  reportData.responseTimeChange = data.summary.responseTimeChange;
  reportData.completionRate = data.summary.completionRate;
  reportData.completionRateChange = data.summary.completionRateChange;
  
  // Update table data
  tableData.value = data.tableData;
  
  // Wait for DOM to be ready
  setTimeout(() => {
    console.log('Initializing charts after timeout');
    updateCharts();
    loading.value = false;
  }, 500);
  
  // Add window resize event listener to redraw charts when window size changes
  window.addEventListener('resize', () => {
    console.log('Window resized, updating charts');
    updateCharts();
  });
})

// Clean up event listeners when component is unmounted
onUnmounted(() => {
  window.removeEventListener('resize', updateCharts)
  
  // Destroy chart instances
  if (mainChartInstance.value) {
    mainChartInstance.value.destroy()
  }
  
  if (bookingTypesChartInstance.value) {
    bookingTypesChartInstance.value.destroy()
  }
  
  if (areasChartInstance.value) {
    areasChartInstance.value.destroy()
  }
})
</script>

<style scoped>
.full-height {
  height: 100%;
}

.column {
  display: flex;
  flex-direction: column;
}

.flex-center {
  align-items: center;
  justify-content: center;
}

#main-chart, #booking-types-chart, #areas-chart {
  position: relative;
  width: 100%;
  height: 100%;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>