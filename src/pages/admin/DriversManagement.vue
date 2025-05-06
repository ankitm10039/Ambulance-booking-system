<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5">Drivers Management</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Add New Driver" @click="openAddDriverDialog" class="text-capitalize"/>
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
          @update:model-value="fetchDrivers"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.isVerified"
          :options="verificationOptions"
          label="Verification"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="fetchDrivers"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.isAvailable"
          :options="availabilityOptions"
          label="Availability"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="fetchDrivers"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          v-model="filters.search"
          label="Search"
          outlined
          dense
          clearable
          @update:model-value="fetchDrivers"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Drivers Table -->
    <q-card>
      <q-card-section>
        <q-table
          :rows="drivers"
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

          <template v-slot:body-cell-avatar="props">
            <q-td :props="props">
              <q-avatar>
                <img :src="props.row.user?.profileImage || 'https://cdn.quasar.dev/img/avatar.png'">
              </q-avatar>
            </q-td>
          </template>

          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              {{ props.row.user?.name || 'N/A' }}
              <div class="text-caption">{{ props.row.user?.email || 'N/A' }}</div>
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

          <template v-slot:body-cell-isVerified="props">
            <q-td :props="props">
              <q-badge :color="props.row.isVerified ? 'positive' : 'negative'">
                {{ props.row.isVerified ? 'Verified' : 'Not Verified' }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-isAvailable="props">
            <q-td :props="props">
              <q-badge :color="props.row.isAvailable ? 'positive' : 'negative'">
                {{ props.row.isAvailable ? 'Available' : 'Unavailable' }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn-group flat>
                <q-btn flat round color="primary" icon="visibility" @click="viewDriver(props.row)">
                  <q-tooltip>View Details</q-tooltip>
                </q-btn>
                <q-btn flat round color="secondary" icon="edit" @click="editDriver(props.row)">
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn flat round color="accent" icon="check_circle" @click="verifyDriver(props.row)" v-if="!props.row.isVerified">
                  <q-tooltip>Verify</q-tooltip>
                </q-btn>
                <q-btn flat round :color="props.row.status === 'active' ? 'negative' : 'positive'" 
                  :icon="props.row.status === 'active' ? 'block' : 'check'" 
                  @click="toggleDriverStatus(props.row)">
                  <q-tooltip>{{ props.row.status === 'active' ? 'Suspend' : 'Activate' }}</q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Driver Details Dialog -->
    <q-dialog v-model="driverDetailsDialog" persistent>
      <q-card style="min-width: 350px; max-width: 80vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">Driver Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedDriver">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-img
                :src="selectedDriver.user?.profileImage || 'https://cdn.quasar.dev/img/avatar.png'"
                style="height: 200px"
              />
              <div class="q-mt-md">
                <q-chip
                  :color="getStatusColor(selectedDriver.status)"
                  text-color="white"
                >
                  {{ selectedDriver.status }}
                </q-chip>
                <q-chip
                  :color="selectedDriver.isVerified ? 'positive' : 'negative'"
                  text-color="white"
                >
                  {{ selectedDriver.isVerified ? 'Verified' : 'Not Verified' }}
                </q-chip>
                <q-chip
                  :color="selectedDriver.isAvailable ? 'positive' : 'negative'"
                  text-color="white"
                >
                  {{ selectedDriver.isAvailable ? 'Available' : 'Unavailable' }}
                </q-chip>
              </div>
            </div>

            <div class="col-12 col-md-8">
              <div class="text-h6">{{ selectedDriver.user?.name }}</div>
              <div class="text-subtitle2">{{ selectedDriver.user?.email }}</div>
              <div class="text-subtitle2">{{ selectedDriver.user?.phone }}</div>

              <q-separator class="q-my-md" />

              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2">License Number</div>
                  <div>{{ selectedDriver.licenseNumber }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2">License Expiry</div>
                  <div>{{ formatDate(selectedDriver.licenseExpiry) }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2">Rating</div>
                  <div>
                    <q-rating
                      v-model="selectedDriver.rating"
                      max="5"
                      size="1.5em"
                      color="amber"
                      readonly
                    />
                    ({{ selectedDriver.rating }}/5)
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2">Total Trips</div>
                  <div>{{ selectedDriver.totalTrips }}</div>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2">Vehicle Details</div>
              <div v-if="selectedDriver.vehicle">
                <div>{{ selectedDriver.vehicle.make }} {{ selectedDriver.vehicle.model }}</div>
                <div>Registration: {{ selectedDriver.vehicle.registrationNumber }}</div>
                <div>Type: {{ selectedDriver.vehicle.type }}</div>
              </div>
              <div v-else>No vehicle assigned</div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2">Documents</div>
              <q-list bordered separator>
                <q-item v-for="(doc, index) in selectedDriver.documents" :key="index">
                  <q-item-section>
                    <q-item-label>{{ doc.documentType }}</q-item-label>
                    <q-item-label caption>Uploaded: {{ formatDate(doc.uploadedAt) }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge :color="doc.verified ? 'positive' : 'negative'">
                      {{ doc.verified ? 'Verified' : 'Not Verified' }}
                    </q-badge>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat round color="primary" icon="visibility" @click="viewDocument(doc)">
                      <q-tooltip>View Document</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add/Edit Driver Dialog -->
    <q-dialog v-model="driverFormDialog" persistent>
      <q-card style="min-width: 350px; max-width: 80vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ isEditing ? 'Edit Driver' : 'Add New Driver' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveDriver" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="driverForm.name"
                  label="Name"
                  :rules="[val => !!val || 'Name is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="driverForm.email"
                  label="Email"
                  type="email"
                  :rules="[
                    val => !!val || 'Email is required',
                    val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email format'
                  ]"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="driverForm.phone"
                  label="Phone"
                  :rules="[val => !!val || 'Phone is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="driverForm.licenseNumber"
                  label="License Number"
                  :rules="[val => !!val || 'License number is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="driverForm.licenseExpiry"
                  label="License Expiry"
                  type="date"
                  :rules="[val => !!val || 'License expiry is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="driverForm.status"
                  :options="statusOptions"
                  label="Status"
                  :rules="[val => !!val || 'Status is required']"
                  outlined
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="driverForm.isVerified"
                  label="Verified"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="driverForm.isAvailable"
                  label="Available"
                />
              </div>
            </div>

            <q-separator />

            <div class="text-subtitle2">Vehicle Details</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="driverForm.vehicle.manufacturer"
                  label="Manufacturer"
                  :rules="[val => !!val || 'Manufacturer is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="driverForm.vehicle.make"
                  label="Make"
                  :rules="[val => !!val || 'Make is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="driverForm.vehicle.model"
                  label="Model"
                  :rules="[val => !!val || 'Model is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="driverForm.vehicle.registrationNumber"
                  label="Registration Number"
                  :rules="[val => !!val || 'Registration number is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="driverForm.vehicle.type"
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
                  v-model="driverForm.vehicle.year"
                  label="Year"
                  type="number"
                  :rules="[val => !!val || 'Year is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="driverForm.vehicle.insuranceExpiry"
                  label="Insurance Expiry Date"
                  type="date"
                  :rules="[val => !!val || 'Insurance expiry date is required']"
                  outlined
                />
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

const $q = useQuasar()
const loading = ref(false)
const drivers = ref([])
const selectedDriver = ref(null)
const driverDetailsDialog = ref(false)
const driverFormDialog = ref(false)
const isEditing = ref(false)

// Pagination
const pagination = ref({
  sortBy: 'createdAt',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// Filters
const filters = reactive({
  status: null,
  isVerified: null,
  isAvailable: null,
  search: ''
})

// Options for filters
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Pending', value: 'pending' }
]

const verificationOptions = [
  { label: 'Verified', value: true },
  { label: 'Not Verified', value: false }
]

const availabilityOptions = [
  { label: 'Available', value: true },
  { label: 'Unavailable', value: false }
]

const vehicleTypeOptions = [
  { label: 'Basic Life Support', value: 'Basic Life Support' },
  { label: 'Advanced Life Support', value: 'Advanced Life Support' },
  { label: 'Patient Transport', value: 'Patient Transport' },
  { label: 'Neonatal', value: 'Neonatal' }
]

// Table columns
const columns = [
  { name: 'avatar', label: '', field: 'user', align: 'center', sortable: false },
  { name: 'name', label: 'Driver', field: 'user', sortable: true },
  { name: 'licenseNumber', label: 'License', field: 'licenseNumber', sortable: true },
  { name: 'status', label: 'Status', field: 'status', sortable: true },
  { name: 'isVerified', label: 'Verification', field: 'isVerified', sortable: true },
  { name: 'isAvailable', label: 'Availability', field: 'isAvailable', sortable: true },
  { name: 'rating', label: 'Rating', field: 'rating', sortable: true },
  { name: 'totalTrips', label: 'Trips', field: 'totalTrips', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center', sortable: false }
]

// Driver form
const driverForm = reactive({
  name: '',
  email: '',
  phone: '',
  licenseNumber: '',
  licenseExpiry: '',
  status: 'pending',
  isVerified: false,
  isAvailable: false,
  vehicle: {
    make: '',
    model: '',
    manufacturer: '',
    registrationNumber: '',
    type: 'Basic Life Support',
    year: new Date().getFullYear(),
    insuranceExpiry: date.formatDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'YYYY-MM-DD')
  }
})

// Fetch drivers from API
const fetchDrivers = async () => {
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
    if (filters.status) params.status = filters.status
    if (filters.isVerified !== null) params.isVerified = filters.isVerified
    if (filters.isAvailable !== null) params.isAvailable = filters.isAvailable
    if (filters.search) params.search = filters.search
    
    const response = await api.get('/admin/drivers', { params })
    
    drivers.value = response.data.data
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error fetching drivers:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to load drivers',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Handle pagination and sorting
const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  
  fetchDrivers()
}

// View driver details
const viewDriver = (driver) => {
  selectedDriver.value = driver
  driverDetailsDialog.value = true
}

// Edit driver
const editDriver = (driver) => {
  isEditing.value = true
  
  // Populate form with driver data
  driverForm.name = driver.user?.name || ''
  driverForm.email = driver.user?.email || ''
  driverForm.phone = driver.user?.phone || ''
  driverForm.licenseNumber = driver.licenseNumber
  driverForm.licenseExpiry = formatDateForInput(driver.licenseExpiry)
  driverForm.status = driver.status
  driverForm.isVerified = driver.isVerified
  driverForm.isAvailable = driver.isAvailable
  
  // Populate vehicle data if exists
  if (driver.vehicle) {
    driverForm.vehicle.manufacturer = driver.vehicle.manufacturer || ''
    driverForm.vehicle.make = driver.vehicle.make || ''
    driverForm.vehicle.model = driver.vehicle.model || ''
    driverForm.vehicle.registrationNumber = driver.vehicle.registrationNumber || ''
    driverForm.vehicle.type = driver.vehicle.type || 'Basic Life Support'
    driverForm.vehicle.year = driver.vehicle.year || new Date().getFullYear()
    driverForm.vehicle.insuranceExpiry = driver.vehicle.insuranceExpiry ? 
      formatDateForInput(driver.vehicle.insuranceExpiry) : 
      date.formatDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'YYYY-MM-DD')
  }
  
  driverFormDialog.value = true
}

// Open add driver dialog
const openAddDriverDialog = () => {
  isEditing.value = false
  
  // Reset form
  driverForm.name = ''
  driverForm.email = ''
  driverForm.phone = ''
  driverForm.licenseNumber = ''
  driverForm.licenseExpiry = ''
  driverForm.status = 'pending'
  driverForm.isVerified = false
  driverForm.isAvailable = false
  driverForm.vehicle.manufacturer = ''
  driverForm.vehicle.make = ''
  driverForm.vehicle.model = ''
  driverForm.vehicle.registrationNumber = ''
  driverForm.vehicle.type = 'Basic Life Support'
  driverForm.vehicle.year = new Date().getFullYear()
  driverForm.vehicle.insuranceExpiry = date.formatDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'YYYY-MM-DD')
  
  driverFormDialog.value = true
}

// Save driver (create or update)
const saveDriver = async () => {
  try {
    loading.value = true
    
    const driverData = {
      user: {
        name: driverForm.name,
        email: driverForm.email,
        phone: driverForm.phone
      },
      licenseNumber: driverForm.licenseNumber,
      licenseExpiry: driverForm.licenseExpiry,
      status: driverForm.status,
      isVerified: driverForm.isVerified,
      isAvailable: driverForm.isAvailable,
      vehicle: driverForm.vehicle
    }
    
    if (isEditing.value) {
      // Update existing driver
      await api.put(`/admin/drivers/${selectedDriver.value._id}`, driverData)
      $q.notify({
        color: 'positive',
        message: 'Driver updated successfully',
        icon: 'check'
      })
    } else {
      // Create new driver
      await api.post('/admin/drivers', driverData)
      $q.notify({
        color: 'positive',
        message: 'Driver created successfully',
        icon: 'check'
      })
    }
    
    driverFormDialog.value = false
    fetchDrivers()
  } catch (error) {
    console.error('Error saving driver:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to save driver',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Verify driver
const verifyDriver = async (driver) => {
  try {
    await api.put(`/admin/drivers/${driver._id}/verify`, { isVerified: true })
    $q.notify({
      color: 'positive',
      message: 'Driver verified successfully',
      icon: 'check'
    })
    fetchDrivers()
  } catch (error) {
    console.error('Error verifying driver:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to verify driver',
      icon: 'error'
    })
  }
}

// Toggle driver status (activate/suspend)
const toggleDriverStatus = async (driver) => {
  try {
    const newStatus = driver.status === 'active' ? 'suspended' : 'active'
    await api.put(`/admin/drivers/${driver._id}/status`, { status: newStatus })
    $q.notify({
      color: 'positive',
      message: `Driver ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`,
      icon: 'check'
    })
    fetchDrivers()
  } catch (error) {
    console.error('Error updating driver status:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to update driver status',
      icon: 'error'
    })
  }
}

// View document
const viewDocument = (doc) => {
  // Implement document viewing logic
  window.open(doc.url, '_blank')
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
    case 'inactive':
      return 'grey'
    case 'suspended':
      return 'negative'
    case 'pending':
      return 'warning'
    default:
      return 'grey'
  }
}

// Load drivers on component mount
onMounted(() => {
  fetchDrivers()
})
</script>