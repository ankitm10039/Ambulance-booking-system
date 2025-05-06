<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card style="width: 800px; max-width: 90vw;">
      <q-card-section class="row items-center">
        <div class="text-h6">Create New Booking</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup @click="onDialogCancel" />
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Booking Type -->
          <div>
            <div class="text-subtitle2 q-mb-sm">Booking Type</div>
            <q-option-group
              v-model="form.bookingType"
              :options="bookingTypeOptions"
              color="primary"
              type="radio"
              inline
            />
          </div>

          <!-- Patient Details -->
          <div class="text-subtitle2 q-mb-sm">Patient Details</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.patientDetails.name"
                label="Patient Name"
                :rules="[val => !!val || 'Patient name is required']"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.patientDetails.age"
                label="Patient Age"
                type="number"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.patientDetails.gender"
                :options="['Male', 'Female', 'Other']"
                label="Gender"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.patientDetails.medicalCondition"
                label="Medical Condition"
                outlined
                dense
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="form.patientDetails.additionalNotes"
                label="Additional Notes"
                type="textarea"
                outlined
                dense
              />
            </div>
          </div>

          <!-- Location Details -->
          <div class="text-subtitle2 q-mb-sm">Location Details</div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.pickupLocation.address"
                label="Pickup Location"
                :rules="[val => !!val || 'Pickup location is required']"
                outlined
                dense
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="form.dropLocation.address"
                label="Drop Location"
                :rules="[val => form.bookingType !== 'scheduled' || !!val || 'Drop location is required for scheduled bookings']"
                outlined
                dense
              />
            </div>
          </div>

          <!-- Scheduled Time (for scheduled bookings) -->
          <div v-if="form.bookingType === 'scheduled'">
            <div class="text-subtitle2 q-mb-sm">Scheduled Time</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.scheduledDate"
                  label="Date"
                  type="date"
                  :rules="[val => !!val || 'Date is required']"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.scheduledTime"
                  label="Time"
                  type="time"
                  :rules="[val => !!val || 'Time is required']"
                  outlined
                  dense
                />
              </div>
            </div>
          </div>

          <!-- Requirements -->
          <div>
            <div class="text-subtitle2 q-mb-sm">Requirements</div>
            <q-option-group
              v-model="form.requirements"
              :options="requirementOptions"
              color="primary"
              type="checkbox"
            />
          </div>

          <!-- User Selection -->
          <div class="text-subtitle2 q-mb-sm">User</div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="form.user"
                :options="userOptions"
                label="Select User"
                :rules="[val => !!val || 'User is required']"
                outlined
                dense
                option-label="name"
                option-value="_id"
                emit-value
                map-options
                use-input
                @filter="filterUsers"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No results
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected-item="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.name }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.email }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.name }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.email }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <!-- Emergency Contact -->
          <div class="text-subtitle2 q-mb-sm">Emergency Contact</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.emergencyContact.name"
                label="Contact Name"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.emergencyContact.phone"
                label="Contact Phone"
                outlined
                dense
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="form.emergencyContact.relationship"
                label="Relationship"
                outlined
                dense
              />
            </div>
          </div>

          <!-- Driver Assignment (optional) -->
          <div class="text-subtitle2 q-mb-sm">Driver Assignment (Optional)</div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="form.driver"
                :options="driverOptions"
                label="Assign Driver"
                outlined
                dense
                option-label="label"
                option-value="_id"
                emit-value
                map-options
                clearable
              />
            </div>
          </div>

          <div class="row justify-end q-mt-md">
            <q-btn label="Cancel" color="negative" flat @click="onDialogCancel" />
            <q-btn label="Create Booking" type="submit" color="primary" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useDialogPluginComponent } from 'quasar'
import { useBookingStore } from 'src/stores/booking'
import * as AdminService from 'src/services/admin.service'

const $q = useQuasar()
const bookingStore = useBookingStore()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

// Expose dialog methods to parent component
defineExpose({
  onDialogHide,
  onDialogOK,
  onDialogCancel
})

// Form data
const form = ref({
  bookingType: 'emergency',
  patientDetails: {
    name: '',
    age: null,
    gender: '',
    medicalCondition: '',
    additionalNotes: ''
  },
  pickupLocation: {
    address: '',
    coordinates: [0, 0]
  },
  dropLocation: {
    address: '',
    coordinates: [0, 0]
  },
  scheduledDate: '',
  scheduledTime: '',
  requirements: [],
  user: null,
  driver: null,
  emergencyContact: {
    name: '',
    phone: '',
    relationship: ''
  }
})

// Options
const bookingTypeOptions = [
  { label: 'Emergency', value: 'emergency' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Transfer', value: 'transfer' }
]

const requirementOptions = [
  { label: 'Oxygen', value: 'Oxygen' },
  { label: 'Stretcher', value: 'Stretcher' },
  { label: 'Wheelchair', value: 'Wheelchair' },
  { label: 'Medical Staff', value: 'Medical Staff' }
]

// Users and drivers data
const users = ref([])
const filteredUsers = ref([])
const drivers = ref([])
const loading = ref(false)

// Computed options for selects
const userOptions = computed(() => {
  return filteredUsers.value.map(user => ({
    label: `${user.name} (${user.email})`,
    value: user._id,
    ...user
  }))
})

const driverOptions = computed(() => {
  return drivers.value.map(driver => ({
    label: `${driver.user?.name || 'Unknown'} (${driver.vehicle?.registrationNumber || 'No vehicle'})`,
    value: driver._id,
    ...driver
  }))
})

// Filter users for search
const filterUsers = (val, update) => {
  if (val === '') {
    update(() => {
      filteredUsers.value = users.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    filteredUsers.value = users.value.filter(
      user => user.name.toLowerCase().indexOf(needle) > -1 ||
              user.email.toLowerCase().indexOf(needle) > -1
    )
  })
}

// Fetch users and drivers
const fetchUsers = async () => {
  try {
    const response = await AdminService.getUsers({ limit: 100 })
    users.value = response.data.data
    filteredUsers.value = users.value
  } catch (error) {
    console.error('Error fetching users:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to load users',
      icon: 'error'
    })
  }
}

const fetchDrivers = async () => {
  try {
    const response = await AdminService.getDrivers({ 
      isAvailable: true,
      status: 'active',
      isVerified: true,
      limit: 100
    })
    drivers.value = response.data.data
  } catch (error) {
    console.error('Error fetching drivers:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to load drivers',
      icon: 'error'
    })
  }
}

// Submit form
const onSubmit = async () => {
  try {
    loading.value = true

    // Prepare booking data
    const bookingData = {
      bookingType: form.value.bookingType,
      patientDetails: form.value.patientDetails,
      pickupLocation: form.value.pickupLocation,
      dropLocation: form.value.dropLocation,
      requirements: form.value.requirements,
      emergencyContact: form.value.emergencyContact,
      user: form.value.user
    }

    // Add scheduled time if it's a scheduled booking
    if (form.value.bookingType === 'scheduled' && form.value.scheduledDate && form.value.scheduledTime) {
      const dateTime = new Date(`${form.value.scheduledDate}T${form.value.scheduledTime}`)
      bookingData.scheduledTime = dateTime.toISOString()
    }

    // Add driver if selected
    if (form.value.driver) {
      bookingData.driver = form.value.driver
    }

    console.log('Sending booking data:', bookingData)

    // Create booking through admin service
    const response = await AdminService.createBooking(bookingData)
    
    // Notify success
    $q.notify({
      color: 'positive',
      message: 'Booking created successfully',
      icon: 'check'
    })

    // Close dialog and return created booking
    onDialogOK(response.data.data)
  } catch (error) {
    console.error('Error creating booking:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Failed to create booking',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Load data when component mounts
onMounted(() => {
  fetchUsers()
  fetchDrivers()
})
</script>