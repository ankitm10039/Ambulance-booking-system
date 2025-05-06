<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5">Vehicles Management</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Add New Vehicle" class="text-capitalize" @click="openAddVehicleDialog" />
    </div>

    <!-- Filters -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.type"
          :options="vehicleTypeOptions"
          label="Vehicle Type"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="fetchVehicles"
        />
      </div>
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
          @update:model-value="fetchVehicles"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.assigned"
          :options="assignmentOptions"
          label="Assignment"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="fetchVehicles"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          v-model="filters.search"
          label="Search"
          outlined
          dense
          clearable
          @update:model-value="fetchVehicles"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Vehicles Table -->
    <q-card>
      <q-card-section class="q-pb-none">
        <div class="text-subtitle1 q-mb-sm">
          Total Vehicles: {{ pagination.rowsNumber }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-table
          :rows="vehicles"
          :columns="columns"
          row-key="_id"
          :loading="loading"
          :pagination="pagination"
          @request="onRequest"
          binary-state-sort
          :rows-per-page-options="[5, 10, 15, 20, 50]"
          v-model:pagination="pagination"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          
          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md text-grey-7">
              <q-icon name="directions_car" size="2em" class="q-mr-sm" />
              No vehicles found
            </div>
          </template>

          <template v-slot:body-cell-image="props">
            <q-td :props="props">
              <q-img
                :src="getImageUrl(props.row.image, getDefaultVehicleImage())"
                style="width: 40px; height: 40px"
                fit="cover"
                class="rounded-borders"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.row.status)"
                text-color="white"
                size="sm"
              >
                {{ props.row.status }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-assigned="props">
            <q-td :props="props">
              <q-badge :color="props.row.driver ? 'positive' : 'grey'">
                {{ props.row.driver ? 'Assigned' : 'Unassigned' }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn-group flat>
                <q-btn flat round color="primary" icon="visibility" @click="viewVehicle(props.row)">
                  <q-tooltip>View Details</q-tooltip>
                </q-btn>
                <q-btn flat round color="secondary" icon="edit" @click="editVehicle(props.row)">
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn flat round :color="props.row.status === 'active' ? 'negative' : 'positive'" 
                  :icon="props.row.status === 'active' ? 'block' : 'check'" 
                  @click="toggleVehicleStatus(props.row)">
                  <q-tooltip>{{ props.row.status === 'active' ? 'Deactivate' : 'Activate' }}</q-tooltip>
                </q-btn>
                <q-btn flat round color="negative" icon="delete" @click="confirmDeleteVehicle(props.row)">
                  <q-tooltip>Delete</q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>

          <template v-slot:bottom="scope">
            <div class="row items-center justify-between q-pa-sm full-width">
              <div class="col-6">
                <div class="q-table__control">
                  <span class="q-table__bottom-item">
                    {{ scope.pagination.rowsPerPage === 0 ? 'All' : scope.pagination.rowsPerPage }} rows per page
                  </span>
                  <q-select
                    v-model="pagination.rowsPerPage"
                    :options="[5, 10, 15, 20, 50]"
                    dense
                    borderless
                    emit-value
                    map-options
                    options-dense
                    style="min-width: 75px"
                    @update:model-value="() => scope.setPagination(pagination)"
                  />
                </div>
              </div>
              <div class="col-6 row justify-end">
                <q-pagination
                  v-model="pagination.page"
                  :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
                  :max-pages="6"
                  boundary-links
                  direction-links
                  @update:model-value="() => scope.setPagination(pagination)"
                />
              </div>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Vehicle Details Dialog -->
    <q-dialog v-model="vehicleDetailsDialog" persistent>
      <q-card style="min-width: 350px; max-width: 80vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">Vehicle Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedVehicle">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-img
                :src="getImageUrl(selectedVehicle.image, getDefaultVehicleImage())"
                style="height: 200px"
                fit="contain"
                class="rounded-borders"
              />
              <div class="q-mt-md">
                <q-chip
                  :color="getStatusColor(selectedVehicle.status)"
                  text-color="white"
                >
                  {{ selectedVehicle.status }}
                </q-chip>
                <q-chip
                  :color="selectedVehicle.driver ? 'positive' : 'grey'"
                  text-color="white"
                >
                  {{ selectedVehicle.driver ? 'Assigned' : 'Unassigned' }}
                </q-chip>
              </div>
            </div>

            <div class="col-12 col-md-8">
              <div class="text-h6">{{ selectedVehicle.make }} {{ selectedVehicle.model }}</div>
              <div class="text-subtitle2">Registration: {{ selectedVehicle.registrationNumber }}</div>

              <q-separator class="q-my-md" />

              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2">Vehicle Type</div>
                  <div>{{ selectedVehicle.type }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2">Year</div>
                  <div>{{ selectedVehicle.year }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2">Capacity</div>
                  <div>{{ selectedVehicle.capacity }} passengers</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2">Last Maintenance</div>
                  <div>{{ formatDate(selectedVehicle.lastMaintenance) }}</div>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2">Features</div>
              <div class="row q-gutter-xs">
                <q-chip v-for="feature in selectedVehicle.features" :key="feature">
                  {{ feature }}
                </q-chip>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2">Assigned Driver</div>
              <div v-if="selectedVehicle.driver">
                <div class="row items-center">
                  <q-avatar>
                    <img :src="getImageUrl(selectedVehicle.driver.user?.profileImage, getDefaultAvatar())">
                  </q-avatar>
                  <div class="q-ml-md">
                    <div>{{ selectedVehicle.driver.user?.name }}</div>
                    <div class="text-caption">License: {{ selectedVehicle.driver.licenseNumber }}</div>
                  </div>
                </div>
              </div>
              <div v-else>No driver assigned</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add/Edit Vehicle Dialog -->
    <q-dialog v-model="vehicleFormDialog" persistent>
      <q-card style="min-width: 350px; max-width: 80vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ isEditing ? 'Edit Vehicle' : 'Add New Vehicle' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveVehicle" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="vehicleForm.manufacturer"
                  label="Manufacturer"
                  :rules="[val => !!val || 'Manufacturer is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="vehicleForm.make"
                  label="Make"
                  :rules="[val => !!val || 'Make is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="vehicleForm.model"
                  label="Model"
                  :rules="[val => !!val || 'Model is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="vehicleForm.registrationNumber"
                  label="Registration Number"
                  :rules="[val => !!val || 'Registration number is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="vehicleForm.type"
                  :options="vehicleTypeOptions"
                  label="Vehicle Type"
                  :rules="[val => !!val || 'Vehicle type is required']"
                  outlined
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="vehicleForm.year"
                  label="Year"
                  type="number"
                  :rules="[val => !!val || 'Year is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="vehicleForm.capacity"
                  label="Capacity"
                  type="number"
                  :rules="[val => !!val || 'Capacity is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="vehicleForm.lastMaintenance"
                  label="Last Maintenance"
                  type="date"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="vehicleForm.insuranceExpiry"
                  label="Insurance Expiry Date"
                  type="date"
                  :rules="[val => !!val || 'Insurance expiry date is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="vehicleForm.status"
                  :options="statusOptions"
                  label="Status"
                  :rules="[val => !!val || 'Status is required']"
                  outlined
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12">
                <q-select
                  v-model="vehicleForm.features"
                  :options="featureOptions"
                  label="Features"
                  multiple
                  use-chips
                  outlined
                />
              </div>
              <div class="col-12">
                <q-file
                  v-model="vehicleForm.imageFile"
                  label="Vehicle Image"
                  outlined
                  accept="image/*"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
              </div>
            </div>

            <div class="row justify-end">
              <q-btn label="Cancel" color="negative" flat v-close-popup />
              <q-btn label="Save" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { date } from 'quasar'
import { api } from 'src/boot/axios'
import { getImageUrl, getDefaultVehicleImage, getDefaultAvatar } from 'src/utils/image'

const $q = useQuasar()
const loading = ref(false)
const vehicles = ref([])
const selectedVehicle = ref(null)
const vehicleDetailsDialog = ref(false)
const vehicleFormDialog = ref(false)
const isEditing = ref(false)

// Pagination
const pagination = ref({
  sortBy: 'createdAt',
  descending: true,
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0
})

// Filters
const filters = reactive({
  type: null,
  status: null,
  assigned: null,
  search: ''
})

// Options for filters
const vehicleTypeOptions = [
  { label: 'Basic Life Support', value: 'Basic Life Support' },
  { label: 'Advanced Life Support', value: 'Advanced Life Support' },
  { label: 'Patient Transport', value: 'Patient Transport' },
  { label: 'Neonatal', value: 'Neonatal' }
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Out of Service', value: 'out-of-service' }
]

const assignmentOptions = [
  { label: 'Assigned', value: true },
  { label: 'Unassigned', value: false }
]

const featureOptions = [
  'Oxygen',
  'Ventilator',
  'Defibrillator',
  'Stretcher',
  'Wheelchair',
  'ECG Monitor',
  'Suction Unit'
]

// Table columns
const columns = [
  { name: 'image', label: '', field: 'image', align: 'center', sortable: false },
  { name: 'registrationNumber', label: 'Registration', field: 'registrationNumber', sortable: true },
  // { name: 'make', label: 'Make', field: 'make', sortable: true },
  { name: 'model', label: 'Model', field: 'model', sortable: true },
  { name: 'type', label: 'Type', field: 'type', sortable: true },
  { name: 'status', label: 'Status', field: 'status', sortable: true },
  { name: 'assigned', label: 'Assigned', field: 'driver', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center', sortable: false }
]

// Vehicle form
const vehicleForm = reactive({
  make: '',
  model: '',
  manufacturer: '',
  registrationNumber: '',
  type: 'Basic Life Support',
  year: new Date().getFullYear(),
  capacity: 2,
  lastMaintenance: '',
  insuranceExpiry: '',
  status: 'active',
  features: [],
  imageFile: null
})

// Fetch vehicles from API
const fetchVehicles = async () => {
  try {
    loading.value = true
    
    // Build query parameters
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      sortDesc: pagination.value.descending
    }
    
    // Add filters if they exist
    if (filters.type) params.type = filters.type
    if (filters.status) params.status = filters.status
    if (filters.assigned !== null) params.assigned = filters.assigned
    if (filters.search) params.search = filters.search
    
    const response = await api.get('/admin/vehicles', { params })
    
    vehicles.value = response.data.data
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to load vehicles',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Handle pagination and sorting
const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  
  // Update pagination values
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy || 'createdAt'
  pagination.value.descending = descending
  
  // Fetch data with new pagination
  fetchVehicles()
}

// View vehicle details
const viewVehicle = (vehicle) => {
  selectedVehicle.value = vehicle
  vehicleDetailsDialog.value = true
}

// Edit vehicle
const editVehicle = (vehicle) => {
  isEditing.value = true
  selectedVehicle.value = vehicle
  
  // Populate form with vehicle data
  vehicleForm.make = vehicle.make
  vehicleForm.model = vehicle.model
  vehicleForm.manufacturer = vehicle.manufacturer
  vehicleForm.registrationNumber = vehicle.registrationNumber
  vehicleForm.type = vehicle.type
  vehicleForm.year = vehicle.year
  vehicleForm.capacity = vehicle.capacity
  vehicleForm.lastMaintenance = formatDateForInput(vehicle.lastMaintenance)
  vehicleForm.insuranceExpiry = formatDateForInput(vehicle.insuranceExpiry)
  vehicleForm.status = vehicle.status
  vehicleForm.features = vehicle.features || []
  vehicleForm.imageFile = null
  
  vehicleFormDialog.value = true
}

// Open add vehicle dialog
const openAddVehicleDialog = () => {
  isEditing.value = false
  selectedVehicle.value = null
  
  // Reset form
  vehicleForm.make = ''
  vehicleForm.model = ''
  vehicleForm.manufacturer = ''
  vehicleForm.registrationNumber = ''
  vehicleForm.type = 'Basic Life Support'
  vehicleForm.year = new Date().getFullYear()
  vehicleForm.capacity = 2
  vehicleForm.lastMaintenance = ''
  vehicleForm.insuranceExpiry = ''
  vehicleForm.status = 'active'
  vehicleForm.features = []
  vehicleForm.imageFile = null
  
  vehicleFormDialog.value = true
}

// Save vehicle (create or update)
const saveVehicle = async () => {
  try {
    loading.value = true
    
    const formData = new FormData()
    formData.append('make', vehicleForm.make)
    formData.append('model', vehicleForm.model)
    formData.append('manufacturer', vehicleForm.manufacturer)
    formData.append('registrationNumber', vehicleForm.registrationNumber)
    formData.append('type', vehicleForm.type)
    formData.append('year', vehicleForm.year)
    formData.append('capacity', vehicleForm.capacity)
    formData.append('status', vehicleForm.status)
    formData.append('features', JSON.stringify(vehicleForm.features))
    
    // Required field - insurance expiry
    if (vehicleForm.insuranceExpiry) {
      formData.append('insuranceExpiry', vehicleForm.insuranceExpiry)
    } else {
      // Default to 1 year from now if not provided
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
      formData.append('insuranceExpiry', oneYearFromNow.toISOString().split('T')[0])
    }
    
    if (vehicleForm.lastMaintenance) {
      formData.append('lastMaintenance', vehicleForm.lastMaintenance)
    }
    
    if (vehicleForm.imageFile) {
      formData.append('image', vehicleForm.imageFile)
    }
    
    if (isEditing.value) {
      // Update existing vehicle
      await api.put(`/admin/vehicles/${selectedVehicle.value._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      $q.notify({
        color: 'positive',
        message: 'Vehicle updated successfully',
        icon: 'check'
      })
    } else {
      // Create new vehicle
      await api.post('/admin/vehicles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      $q.notify({
        color: 'positive',
        message: 'Vehicle created successfully',
        icon: 'check'
      })
    }
    
    vehicleFormDialog.value = false
    fetchVehicles()
  } catch (error) {
    console.error('Error saving vehicle:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to save vehicle',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Toggle vehicle status
const toggleVehicleStatus = async (vehicle) => {
  try {
    const newStatus = vehicle.status === 'active' ? 'out-of-service' : 'active'
    await api.put(`/admin/vehicles/${vehicle._id}/status`, { status: newStatus })
    $q.notify({
      color: 'positive',
      message: `Vehicle ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      icon: 'check'
    })
    fetchVehicles()
  } catch (error) {
    console.error('Error updating vehicle status:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to update vehicle status',
      icon: 'error'
    })
  }
}

// Confirm delete vehicle
const confirmDeleteVehicle = (vehicle) => {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete vehicle ${vehicle.registrationNumber}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/admin/vehicles/${vehicle._id}`)
      $q.notify({
        color: 'positive',
        message: 'Vehicle deleted successfully',
        icon: 'check'
      })
      fetchVehicles()
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      $q.notify({
        color: 'negative',
        message: 'Failed to delete vehicle',
        icon: 'error'
      })
    }
  })
}

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return date.formatDate(new Date(dateString), 'MMMM D, YYYY')
}

// Format date for input field
const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  return date.formatDate(new Date(dateString), 'YYYY-MM-DD')
}



// Get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'positive'
    case 'maintenance':
      return 'warning'
    case 'out-of-service':
      return 'negative'
    default:
      return 'grey'
  }
}

// Load vehicles on component mount
onMounted(() => {
  fetchVehicles()
})
</script>