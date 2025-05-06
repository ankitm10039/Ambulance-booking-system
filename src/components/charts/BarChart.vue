<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, toRefs } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  chartData: {
    type: Array,
    required: true
  },
  chartLabels: {
    type: Array,
    required: true
  },
  chartTitle: {
    type: String,
    default: ''
  },
  chartColor: {
    type: String,
    default: '#1976D2' // Primary color
  }
})

const { chartData, chartLabels } = toRefs(props)
const chartCanvas = ref(null)
let chart = null

const createChart = () => {
  if (chart) {
    chart.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels.value,
      datasets: [
        {
          label: props.chartTitle,
          data: chartData.value,
          backgroundColor: props.chartColor + '99', // Add transparency
          borderColor: props.chartColor,
          borderWidth: 1,
          borderRadius: 4,
          hoverBackgroundColor: props.chartColor
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              return `₹${context.raw}`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + value
            }
          }
        }
      }
    }
  })
}

onMounted(() => {
  if (chartLabels.value.length > 0 && chartData.value.length > 0) {
    createChart()
  }
})

watch([chartData, chartLabels], () => {
  if (chartLabels.value.length > 0 && chartData.value.length > 0) {
    createChart()
  }
}, { deep: true })
</script>