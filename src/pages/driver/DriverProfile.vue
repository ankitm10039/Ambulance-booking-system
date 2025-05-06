<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-10">
        <!-- Profile Card -->
        <q-card class="q-mb-md">
          <q-card-section class="bg-primary text-white">
            <div class="text-h5">Driver Profile</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4 flex flex-center">
                <div class="text-center">
                  <q-avatar size="150px" class="q-mb-md">
                    <img :src="profileImage || 'https://cdn.quasar.dev/img/boy-avatar.png'" />
                  </q-avatar>
                  <div>
                    <q-file
                      v-model="imageFile"
                      accept=".jpg, .jpeg, .png"
                      style="display: none"
                      ref="fileInput"
                      @update:model-value="onFileSelected"
                    />
                    <q-btn
                      color="primary"
                      label="Change Photo"
                      size="sm"
                      @click="$refs.fileInput.pickFiles()"
                    />
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-8">
                <q-form @submit="updateProfile" class="q-gutter-md">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        filled
                        v-model="profileForm.name"
                        label="Full Name *"
                        :rules="[val => !!val || 'Name is required']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        filled
                        v-model="profileForm.email"
                        label="Email *"
                        type="email"
                        readonly
                      />
                    </div>
                  </div>

                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        filled
                        v-model="profileForm.phone"
                        label="Phone Number *"
                        :rules="[val => !!val || 'Phone number is required']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        filled
                        v-model="profileForm.address"
                        label="Address"
                      />
                    </div>
                  </div>

                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input
                        filled
                        v-model="profileForm.licenseNumber"
                        label="License Number *"
                        :rules="[val => !!val || 'License number is required']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        filled
                        v-model="profileForm.licenseExpiry"
                        label="License Expiry Date *"
                        type="date"
                        :rules="[val => !!val || 'Expiry date is required']"
                      />
                    </div>
                  </div>

                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-select
                        filled
                        v-model="profileForm.experience"
                        :options="experienceOptions"
                        label="Driving Experience *"
                        :rules="[val => !!val || 'Experience is required']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        filled
                        v-model="profileForm.emergencyContact"
                        label="Emergency Contact"
                      />
                    </div>
                  </div>

                  <div class="row justify-end">
                    <q-btn
                      type="submit"
                      color="primary"
                      label="Save Changes"
                      :loading="loading"
                    />
                  </div>
                </q-form>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Vehicle Information Card -->
        <q-card class="q-mb-md">
          <q-card-section class="bg-secondary text-white">
            <div class="text-h5">Vehicle Information</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="updateVehicle" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    v-model="vehicleForm.registrationNumber"
                    label="Registration Number *"
                    :rules="[val => !!val || 'Registration number is required']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    v-model="vehicleForm.model"
                    label="Vehicle Model *"
                    :rules="[val => !!val || 'Vehicle model is required']"
                  />
                </div>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    v-model="vehicleForm.year"
                    label="Manufacturing Year *"
                    type="number"
                    :rules="[val => !!val || 'Year is required']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    filled
                    v-model="vehicleForm.type"
                    :options="vehicleTypeOptions"
                    label="Vehicle Type *"
                    :rules="[val => !!val || 'Vehicle type is required']"
                  />
                </div>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    v-model="vehicleForm.insuranceNumber"
                    label="Insurance Policy Number *"
                    :rules="[val => !!val || 'Insurance number is required']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    v-model="vehicleForm.insuranceExpiry"
                    label="Insurance Expiry Date *"
                    type="date"
                    :rules="[val => !!val || 'Insurance expiry date is required']"
                  />
                </div>
              </div>

              <div class="row justify-end">
                <q-btn
                  type="submit"
                  color="secondary"
                  label="Update Vehicle Info"
                  :loading="loading"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Change Password Card -->
        <q-card>
          <q-card-section class="bg-grey-8 text-white">
            <div class="text-h5">Change Password</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="changePassword" class="q-gutter-md">
              <q-input
                filled
                v-model="passwordForm.currentPassword"
                label="Current Password *"
                type="password"
                :rules="[val => !!val || 'Current password is required']"
              />

              <q-input
                filled
                v-model="passwordForm.newPassword"
                label="New Password *"
                type="password"
                :rules="[
                  val => !!val || 'New password is required',
                  val => val.length >= 8 || 'Password must be at least 8 characters'
                ]"
              />

              <q-input
                filled
                v-model="passwordForm.confirmPassword"
                label="Confirm New Password *"
                type="password"
                :rules="[
                  val => !!val || 'Please confirm your password',
                  val => val === passwordForm.newPassword || 'Passwords do not match'
                ]"
              />

              <div class="row justify-end">
                <q-btn
                  type="submit"
                  color="grey-8"
                  label="Change Password"
                  :loading="loading"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'
import { useDriverStore } from 'stores/driver'

const $q = useQuasar()
const authStore = useAuthStore()
const driverStore = useDriverStore()

const loading = computed(() => authStore.loading || driverStore.loading)
const error = computed(() => authStore.error || driverStore.error)

// Profile image handling
const profileImage = ref(null)
const imageFile = ref(null)
const fileInput = ref(null)

// Form data
const profileForm = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  licenseNumber: '',
  licenseExpiry: '',
  experience: null,
  emergencyContact: ''
})

const vehicleForm = reactive({
  registrationNumber: '',
  model: '',
  year: null,
  type: null,
  insuranceNumber: '',
  insuranceExpiry: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Options for dropdowns
const experienceOptions = [
  '< 1 year',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '> 10 years'
]

const vehicleTypeOptions = [
  'Basic Ambulance',
  'Advanced Life Support',
  'Patient Transport',
  'Neonatal',
  'Mobile ICU'
]

// Load profile data
const loadProfileData = async () => {
  try {
    // Get user data from auth store
    const userData = authStore.user
    
    if (userData) {
      profileForm.name = userData.name || ''
      profileForm.email = userData.email || ''
      profileForm.phone = userData.phone || ''
      profileForm.address = userData.address || ''
      
      // If there's a profile picture
      if (userData.profilePicture) {
        profileImage.value = userData.profilePicture
      }
    }
    
    // Get driver-specific data
    const driverData = await driverStore.fetchDriverProfile()
    
    if (driverData) {
      // Update driver-specific profile fields
      profileForm.licenseNumber = driverData.licenseNumber || ''
      profileForm.licenseExpiry = driverData.licenseExpiry || ''
      profileForm.experience = driverData.experience || null
      profileForm.emergencyContact = driverData.emergencyContact || ''
      
      // Update vehicle information
      if (driverData.vehicle) {
        vehicleForm.registrationNumber = driverData.vehicle.registrationNumber || ''
        vehicleForm.model = driverData.vehicle.model || ''
        vehicleForm.year = driverData.vehicle.year || null
        vehicleForm.type = driverData.vehicle.type || null
        vehicleForm.insuranceNumber = driverData.vehicle.insuranceNumber || ''
        vehicleForm.insuranceExpiry = driverData.vehicle.insuranceExpiry || ''
      }
    }
  } catch (err) {
    console.error('Error loading profile data:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to load profile data'
    })
  }
}

// Handle file selection for profile image
const onFileSelected = () => {
  if (!imageFile.value) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    profileImage.value = e.target.result
  }
  reader.readAsDataURL(imageFile.value)
}

// Update profile information
const updateProfile = async () => {
  try {
    const profileData = {
      name: profileForm.name,
      phone: profileForm.phone,
      address: profileForm.address,
      licenseNumber: profileForm.licenseNumber,
      licenseExpiry: profileForm.licenseExpiry,
      experience: profileForm.experience,
      emergencyContact: profileForm.emergencyContact
    }
    
    // If there's a new profile image
    if (imageFile.value) {
      profileData.profileImage = imageFile.value
    }
    
    const success = await driverStore.updateDriverProfile(profileData)
    
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Profile updated successfully'
      })
    } else {
      throw new Error('Failed to update profile')
    }
  } catch (err) {
    console.error('Error updating profile:', err)
    $q.notify({
      type: 'negative',
      message: error.value || 'Failed to update profile'
    })
  }
}

// Update vehicle information
const updateVehicle = async () => {
  try {
    const vehicleData = {
      registrationNumber: vehicleForm.registrationNumber,
      model: vehicleForm.model,
      year: vehicleForm.year,
      type: vehicleForm.type,
      insuranceNumber: vehicleForm.insuranceNumber,
      insuranceExpiry: vehicleForm.insuranceExpiry
    }
    
    const success = await driverStore.updateVehicleInfo(vehicleData)
    
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Vehicle information updated successfully'
      })
    } else {
      throw new Error('Failed to update vehicle information')
    }
  } catch (err) {
    console.error('Error updating vehicle information:', err)
    $q.notify({
      type: 'negative',
      message: error.value || 'Failed to update vehicle information'
    })
  }
}

// Change password
const changePassword = async () => {
  try {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      $q.notify({
        type: 'warning',
        message: 'Passwords do not match'
      })
      return
    }
    
    const passwordData = {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    }
    
    const success = await authStore.changePassword(passwordData)
    
    if (success) {
      // Reset password form
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      
      $q.notify({
        type: 'positive',
        message: 'Password changed successfully'
      })
    } else {
      throw new Error('Failed to change password')
    }
  } catch (err) {
    console.error('Error changing password:', err)
    $q.notify({
      type: 'negative',
      message: error.value || 'Failed to change password'
    })
  }
}

// Load profile data on component mount
onMounted(() => {
  loadProfileData()
})
</script>