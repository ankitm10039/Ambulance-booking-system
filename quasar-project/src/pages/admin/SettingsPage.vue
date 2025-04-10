<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">System Settings</div>

    <q-card>
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="general" label="General" icon="settings" />
        <q-tab name="pricing" label="Pricing" icon="attach_money" />
        <q-tab name="notifications" label="Notifications" icon="notifications" />
        <q-tab name="appearance" label="Appearance" icon="palette" />
        <q-tab name="backup" label="Backup & Restore" icon="backup" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <!-- General Settings -->
        <q-tab-panel name="general">
          <div class="text-h6">General Settings</div>
          
          <q-form @submit="saveGeneralSettings" class="q-gutter-md q-mt-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="generalSettings.appName"
                  label="Application Name"
                  outlined
                  :rules="[val => !!val || 'Application name is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="generalSettings.contactEmail"
                  label="Contact Email"
                  type="email"
                  outlined
                  :rules="[
                    val => !!val || 'Contact email is required',
                    val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email format'
                  ]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="generalSettings.contactPhone"
                  label="Contact Phone"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="generalSettings.emergencyNumber"
                  label="Emergency Number"
                  outlined
                  :rules="[val => !!val || 'Emergency number is required']"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="generalSettings.address"
                  label="Company Address"
                  type="textarea"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="generalSettings.timezone"
                  :options="timezoneOptions"
                  label="Default Timezone"
                  outlined
                  :rules="[val => !!val || 'Timezone is required']"
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="generalSettings.dateFormat"
                  :options="dateFormatOptions"
                  label="Date Format"
                  outlined
                  :rules="[val => !!val || 'Date format is required']"
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="generalSettings.enableRegistration"
                  label="Enable User Registration"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="generalSettings.requireEmailVerification"
                  label="Require Email Verification"
                />
              </div>
            </div>

            <div class="row justify-end q-mt-md">
              <q-btn label="Save Changes" type="submit" color="primary" :loading="loading" />
            </div>
          </q-form>
        </q-tab-panel>

        <!-- Pricing Settings -->
        <q-tab-panel name="pricing">
          <div class="text-h6">Pricing Settings</div>
          
          <q-form @submit="savePricingSettings" class="q-gutter-md q-mt-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="pricingSettings.basePrice"
                  label="Base Price"
                  type="number"
                  outlined
                  :rules="[val => val >= 0 || 'Base price cannot be negative']"
                  prefix="₹"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="pricingSettings.pricePerKm"
                  label="Price Per Kilometer"
                  type="number"
                  outlined
                  :rules="[val => val >= 0 || 'Price per km cannot be negative']"
                  prefix="₹"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="pricingSettings.emergencySurcharge"
                  label="Emergency Surcharge"
                  type="number"
                  outlined
                  :rules="[val => val >= 0 || 'Surcharge cannot be negative']"
                  prefix="₹"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="pricingSettings.nightSurcharge"
                  label="Night Surcharge (10 PM - 6 AM)"
                  type="number"
                  outlined
                  :rules="[val => val >= 0 || 'Surcharge cannot be negative']"
                  prefix="₹"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="pricingSettings.waitingChargePerMinute"
                  label="Waiting Charge Per Minute"
                  type="number"
                  outlined
                  :rules="[val => val >= 0 || 'Waiting charge cannot be negative']"
                  prefix="₹"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="pricingSettings.cancellationFee"
                  label="Cancellation Fee"
                  type="number"
                  outlined
                  :rules="[val => val >= 0 || 'Cancellation fee cannot be negative']"
                  prefix="₹"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="pricingSettings.currency"
                  :options="currencyOptions"
                  label="Currency"
                  outlined
                  :rules="[val => !!val || 'Currency is required']"
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="pricingSettings.enableDynamicPricing"
                  label="Enable Dynamic Pricing"
                />
              </div>
              
              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm">Additional Services Pricing</div>
                <q-list bordered separator>
                  <q-item v-for="(service, index) in pricingSettings.additionalServices" :key="index">
                    <q-item-section>
                      <q-input
                        v-model="service.name"
                        label="Service Name"
                        dense
                        outlined
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-input
                        v-model.number="service.price"
                        label="Price"
                        type="number"
                        dense
                        outlined
                        prefix="₹"
                      />
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat round color="negative" icon="delete" @click="removeAdditionalService(index)" />
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-btn color="primary" icon="add" label="Add Service" @click="addAdditionalService" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>

            <div class="row justify-end q-mt-md">
              <q-btn label="Save Changes" type="submit" color="primary" :loading="loading" />
            </div>
          </q-form>
        </q-tab-panel>

        <!-- Notification Settings -->
        <q-tab-panel name="notifications">
          <div class="text-h6">Notification Settings</div>
          
          <q-form @submit="saveNotificationSettings" class="q-gutter-md q-mt-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="notificationSettings.enableEmailNotifications"
                  label="Enable Email Notifications"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="notificationSettings.enableSmsNotifications"
                  label="Enable SMS Notifications"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="notificationSettings.enablePushNotifications"
                  label="Enable Push Notifications"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="notificationSettings.adminAlertNewBooking"
                  label="Alert Admin on New Booking"
                />
              </div>
              
              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm">Email Notification Templates</div>
                <q-expansion-item
                  group="templates"
                  icon="mail"
                  label="Booking Confirmation"
                  header-class="text-primary"
                >
                  <q-card>
                    <q-card-section>
                      <q-input
                        v-model="notificationSettings.emailTemplates.bookingConfirmation.subject"
                        label="Subject"
                        outlined
                      />
                      <q-input
                        v-model="notificationSettings.emailTemplates.bookingConfirmation.body"
                        label="Body"
                        type="textarea"
                        outlined
                        class="q-mt-md"
                        rows="5"
                      />
                      <div class="text-caption q-mt-sm">
                        Available variables: {userName}, {bookingId}, {pickupLocation}, {dropLocation}, {scheduledTime}, {fare}
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
                
                <q-expansion-item
                  group="templates"
                  icon="mail"
                  label="Driver Assignment"
                  header-class="text-primary"
                >
                  <q-card>
                    <q-card-section>
                      <q-input
                        v-model="notificationSettings.emailTemplates.driverAssignment.subject"
                        label="Subject"
                        outlined
                      />
                      <q-input
                        v-model="notificationSettings.emailTemplates.driverAssignment.body"
                        label="Body"
                        type="textarea"
                        outlined
                        class="q-mt-md"
                        rows="5"
                      />
                      <div class="text-caption q-mt-sm">
                        Available variables: {userName}, {bookingId}, {driverName}, {driverPhone}, {vehicleDetails}, {estimatedArrival}
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
                
                <q-expansion-item
                  group="templates"
                  icon="mail"
                  label="Booking Cancellation"
                  header-class="text-primary"
                >
                  <q-card>
                    <q-card-section>
                      <q-input
                        v-model="notificationSettings.emailTemplates.bookingCancellation.subject"
                        label="Subject"
                        outlined
                      />
                      <q-input
                        v-model="notificationSettings.emailTemplates.bookingCancellation.body"
                        label="Body"
                        type="textarea"
                        outlined
                        class="q-mt-md"
                        rows="5"
                      />
                      <div class="text-caption q-mt-sm">
                        Available variables: {userName}, {bookingId}, {cancellationReason}, {refundAmount}
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </div>
              
              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm">SMS Notification Templates</div>
                <q-expansion-item
                  group="sms-templates"
                  icon="sms"
                  label="Booking Confirmation SMS"
                  header-class="text-primary"
                >
                  <q-card>
                    <q-card-section>
                      <q-input
                        v-model="notificationSettings.smsTemplates.bookingConfirmation"
                        label="Message"
                        type="textarea"
                        outlined
                        rows="3"
                      />
                      <div class="text-caption q-mt-sm">
                        Available variables: {userName}, {bookingId}, {pickupLocation}, {scheduledTime}
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
                
                <q-expansion-item
                  group="sms-templates"
                  icon="sms"
                  label="Driver Assignment SMS"
                  header-class="text-primary"
                >
                  <q-card>
                    <q-card-section>
                      <q-input
                        v-model="notificationSettings.smsTemplates.driverAssignment"
                        label="Message"
                        type="textarea"
                        outlined
                        rows="3"
                      />
                      <div class="text-caption q-mt-sm">
                        Available variables: {userName}, {driverName}, {driverPhone}, {vehicleNumber}, {estimatedArrival}
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </div>
            </div>

            <div class="row justify-end q-mt-md">
              <q-btn label="Save Changes" type="submit" color="primary" :loading="loading" />
            </div>
          </q-form>
        </q-tab-panel>

        <!-- Appearance Settings -->
        <q-tab-panel name="appearance">
          <div class="text-h6">Appearance Settings</div>
          
          <q-form @submit="saveAppearanceSettings" class="q-gutter-md q-mt-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="text-subtitle2">Primary Color</div>
                <q-color v-model="appearanceSettings.primaryColor" />
              </div>
              <div class="col-12 col-md-6">
                <div class="text-subtitle2">Secondary Color</div>
                <q-color v-model="appearanceSettings.secondaryColor" />
              </div>
              <div class="col-12 col-md-6">
                <div class="text-subtitle2">Accent Color</div>
                <q-color v-model="appearanceSettings.accentColor" />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="appearanceSettings.theme"
                  :options="themeOptions"
                  label="Default Theme"
                  outlined
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="appearanceSettings.enableDarkMode"
                  label="Enable Dark Mode Option"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="appearanceSettings.showLogo"
                  label="Show Logo in Header"
                />
              </div>
              
              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm">Logo</div>
                <div class="row items-center">
                  <div class="col-auto">
                    <q-img
                      :src="appearanceSettings.logoUrl || 'https://via.placeholder.com/200x80?text=Logo'"
                      style="height: 80px; max-width: 200px"
                    />
                  </div>
                  <div class="col q-ml-md">
                    <q-file
                      v-model="logoFile"
                      label="Upload Logo"
                      outlined
                      accept="image/*"
                    >
                      <template v-slot:prepend>
                        <q-icon name="attach_file" />
                      </template>
                    </q-file>
                  </div>
                </div>
              </div>
              
              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm">Favicon</div>
                <div class="row items-center">
                  <div class="col-auto">
                    <q-img
                      :src="appearanceSettings.faviconUrl || 'https://via.placeholder.com/32x32?text=Icon'"
                      style="height: 32px; width: 32px"
                    />
                  </div>
                  <div class="col q-ml-md">
                    <q-file
                      v-model="faviconFile"
                      label="Upload Favicon"
                      outlined
                      accept="image/*"
                    >
                      <template v-slot:prepend>
                        <q-icon name="attach_file" />
                      </template>
                    </q-file>
                  </div>
                </div>
              </div>
            </div>

            <div class="row justify-end q-mt-md">
              <q-btn label="Save Changes" type="submit" color="primary" :loading="loading" />
            </div>
          </q-form>
        </q-tab-panel>

        <!-- Backup & Restore -->
        <q-tab-panel name="backup">
          <div class="text-h6">Backup & Restore</div>
          
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12 col-md-6">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Backup Database</div>
                  <p>Create a backup of your entire database. This includes all users, bookings, drivers, vehicles, and settings.</p>
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn color="primary" label="Create Backup" @click="createBackup" :loading="backupLoading" />
                </q-card-actions>
              </q-card>
            </div>
            
            <div class="col-12 col-md-6">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Restore Database</div>
                  <p>Restore your database from a previous backup file. This will overwrite your current data.</p>
                  <q-file
                    v-model="backupFile"
                    label="Select Backup File"
                    outlined
                    accept=".json"
                    class="q-mt-md"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_file" />
                    </template>
                  </q-file>
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn color="negative" label="Restore" @click="confirmRestore" :disable="!backupFile" :loading="restoreLoading" />
                </q-card-actions>
              </q-card>
            </div>
            
            <div class="col-12">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Backup History</div>
                  <q-table
                    :rows="backupHistory"
                    :columns="backupColumns"
                    row-key="id"
                    :loading="backupHistoryLoading"
                    :pagination="{ rowsPerPage: 5 }"
                  >
                    <template v-slot:body-cell-actions="props">
                      <q-td :props="props">
                        <q-btn flat round color="primary" icon="download" @click="downloadBackup(props.row)">
                          <q-tooltip>Download</q-tooltip>
                        </q-btn>
                        <q-btn flat round color="negative" icon="delete" @click="deleteBackup(props.row)">
                          <q-tooltip>Delete</q-tooltip>
                        </q-btn>
                      </q-td>
                    </template>
                  </q-table>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()
const activeTab = ref('general')
const loading = ref(false)
const backupLoading = ref(false)
const restoreLoading = ref(false)
const backupHistoryLoading = ref(false)
const logoFile = ref(null)
const faviconFile = ref(null)
const backupFile = ref(null)

// General Settings
const generalSettings = reactive({
  appName: 'Ambulance Booking System',
  contactEmail: 'contact@ambulancebooking.com',
  contactPhone: '+91 1234567890',
  emergencyNumber: '108',
  address: '123 Healthcare Street, Medical District, City - 110001',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  enableRegistration: true,
  requireEmailVerification: true
})

// Pricing Settings
const pricingSettings = reactive({
  basePrice: 200,
  pricePerKm: 15,
  emergencySurcharge: 100,
  nightSurcharge: 50,
  waitingChargePerMinute: 2,
  cancellationFee: 100,
  currency: 'INR',
  enableDynamicPricing: false,
  additionalServices: [
    { name: 'Oxygen Support', price: 150 },
    { name: 'Medical Staff', price: 300 },
    { name: 'Advanced Life Support', price: 500 }
  ]
})

// Notification Settings
const notificationSettings = reactive({
  enableEmailNotifications: true,
  enableSmsNotifications: true,
  enablePushNotifications: false,
  adminAlertNewBooking: true,
  emailTemplates: {
    bookingConfirmation: {
      subject: 'Your Ambulance Booking Confirmation - {bookingId}',
      body: 'Dear {userName},\n\nYour ambulance booking has been confirmed. Your booking ID is {bookingId}.\n\nPickup Location: {pickupLocation}\nDrop Location: {dropLocation}\nScheduled Time: {scheduledTime}\nEstimated Fare: {fare}\n\nWe will notify you once a driver is assigned to your booking.\n\nThank you for using our service.\n\nRegards,\nAmbulance Booking Team'
    },
    driverAssignment: {
      subject: 'Driver Assigned for Your Ambulance Booking - {bookingId}',
      body: 'Dear {userName},\n\nA driver has been assigned to your ambulance booking {bookingId}.\n\nDriver Name: {driverName}\nDriver Phone: {driverPhone}\nVehicle Details: {vehicleDetails}\nEstimated Arrival: {estimatedArrival}\n\nYou can track your ambulance in real-time through our app.\n\nRegards,\nAmbulance Booking Team'
    },
    bookingCancellation: {
      subject: 'Your Ambulance Booking Has Been Cancelled - {bookingId}',
      body: 'Dear {userName},\n\nYour ambulance booking {bookingId} has been cancelled.\n\nCancellation Reason: {cancellationReason}\nRefund Amount: {refundAmount}\n\nIf you did not request this cancellation, please contact our support team immediately.\n\nRegards,\nAmbulance Booking Team'
    }
  },
  smsTemplates: {
    bookingConfirmation: 'Your ambulance booking is confirmed. Booking ID: {bookingId}. Pickup: {pickupLocation}. Time: {scheduledTime}.',
    driverAssignment: 'Driver {driverName} ({driverPhone}) has been assigned to your booking. Vehicle: {vehicleNumber}. ETA: {estimatedArrival}.'
  }
})

// Appearance Settings
const appearanceSettings = reactive({
  primaryColor: '#1976D2',
  secondaryColor: '#26A69A',
  accentColor: '#9C27B0',
  theme: 'light',
  enableDarkMode: true,
  showLogo: true,
  logoUrl: '',
  faviconUrl: ''
})

// Backup History
const backupHistory = ref([
  { id: 1, name: 'Full Backup - 2023-04-15', size: '5.2 MB', date: '2023-04-15 14:30:00', type: 'full' },
  { id: 2, name: 'Full Backup - 2023-04-01', size: '4.8 MB', date: '2023-04-01 10:15:00', type: 'full' },
  { id: 3, name: 'Settings Backup - 2023-03-15', size: '0.5 MB', date: '2023-03-15 09:45:00', type: 'settings' }
])

// Options
const timezoneOptions = [
  { label: 'India (IST)', value: 'Asia/Kolkata' },
  { label: 'UTC', value: 'UTC' },
  { label: 'US Eastern', value: 'America/New_York' },
  { label: 'US Pacific', value: 'America/Los_Angeles' },
  { label: 'UK', value: 'Europe/London' },
  { label: 'Japan', value: 'Asia/Tokyo' },
  { label: 'Australia', value: 'Australia/Sydney' }
]

const dateFormatOptions = [
  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
]

const currencyOptions = [
  { label: 'Indian Rupee (₹)', value: 'INR' },
  { label: 'US Dollar ($)', value: 'USD' },
  { label: 'Euro (€)', value: 'EUR' },
  { label: 'British Pound (£)', value: 'GBP' }
]

const themeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Auto (System)', value: 'auto' }
]

// Backup columns
const backupColumns = [
  { name: 'name', label: 'Backup Name', field: 'name', sortable: true },
  { name: 'size', label: 'Size', field: 'size', sortable: true },
  { name: 'date', label: 'Date', field: 'date', sortable: true },
  { name: 'type', label: 'Type', field: 'type', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center', sortable: false }
]

// Save General Settings
const saveGeneralSettings = async () => {
  try {
    loading.value = true
    
    await api.put('/admin/settings/general', generalSettings)
    
    $q.notify({
      color: 'positive',
      message: 'General settings saved successfully',
      icon: 'check'
    })
  } catch (error) {
    console.error('Error saving general settings:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to save general settings',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Save Pricing Settings
const savePricingSettings = async () => {
  try {
    loading.value = true
    
    await api.put('/admin/settings/pricing', pricingSettings)
    
    $q.notify({
      color: 'positive',
      message: 'Pricing settings saved successfully',
      icon: 'check'
    })
  } catch (error) {
    console.error('Error saving pricing settings:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to save pricing settings',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Save Notification Settings
const saveNotificationSettings = async () => {
  try {
    loading.value = true
    
    await api.put('/admin/settings/notifications', notificationSettings)
    
    $q.notify({
      color: 'positive',
      message: 'Notification settings saved successfully',
      icon: 'check'
    })
  } catch (error) {
    console.error('Error saving notification settings:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to save notification settings',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Save Appearance Settings
const saveAppearanceSettings = async () => {
  try {
    loading.value = true
    
    const formData = new FormData()
    formData.append('primaryColor', appearanceSettings.primaryColor)
    formData.append('secondaryColor', appearanceSettings.secondaryColor)
    formData.append('accentColor', appearanceSettings.accentColor)
    formData.append('theme', appearanceSettings.theme)
    formData.append('enableDarkMode', appearanceSettings.enableDarkMode)
    formData.append('showLogo', appearanceSettings.showLogo)
    
    if (logoFile.value) {
      formData.append('logo', logoFile.value)
    }
    
    if (faviconFile.value) {
      formData.append('favicon', faviconFile.value)
    }
    
    await api.put('/admin/settings/appearance', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    $q.notify({
      color: 'positive',
      message: 'Appearance settings saved successfully',
      icon: 'check'
    })
  } catch (error) {
    console.error('Error saving appearance settings:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to save appearance settings',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Add additional service
const addAdditionalService = () => {
  pricingSettings.additionalServices.push({ name: '', price: 0 })
}

// Remove additional service
const removeAdditionalService = (index) => {
  pricingSettings.additionalServices.splice(index, 1)
}

// Create backup
const createBackup = async () => {
  try {
    backupLoading.value = true
    
    await api.post('/admin/backup/create')
    
    $q.notify({
      color: 'positive',
      message: 'Backup created successfully',
      icon: 'check'
    })
    
    // Refresh backup history
    fetchBackupHistory()
  } catch (error) {
    console.error('Error creating backup:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to create backup',
      icon: 'error'
    })
  } finally {
    backupLoading.value = false
  }
}

// Confirm restore
const confirmRestore = () => {
  $q.dialog({
    title: 'Confirm Restore',
    message: 'Are you sure you want to restore from this backup? This will overwrite your current data.',
    cancel: true,
    persistent: true
  }).onOk(() => {
    restoreBackup()
  })
}

// Restore backup
const restoreBackup = async () => {
  try {
    restoreLoading.value = true
    
    const formData = new FormData()
    formData.append('backupFile', backupFile.value)
    
    await api.post('/admin/backup/restore', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    $q.notify({
      color: 'positive',
      message: 'Backup restored successfully',
      icon: 'check'
    })
    
    // Reset file input
    backupFile.value = null
  } catch (error) {
    console.error('Error restoring backup:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to restore backup',
      icon: 'error'
    })
  } finally {
    restoreLoading.value = false
  }
}

// Download backup
const downloadBackup = (backup) => {
  window.open(`/api/admin/backup/download/${backup.id}`, '_blank')
}

// Delete backup
const deleteBackup = (backup) => {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete the backup "${backup.name}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/admin/backup/${backup.id}`)
      
      $q.notify({
        color: 'positive',
        message: 'Backup deleted successfully',
        icon: 'check'
      })
      
      // Refresh backup history
      fetchBackupHistory()
    } catch (error) {
      console.error('Error deleting backup:', error)
      $q.notify({
        color: 'negative',
        message: 'Failed to delete backup',
        icon: 'error'
      })
    }
  })
}

// Fetch backup history
const fetchBackupHistory = async () => {
  try {
    backupHistoryLoading.value = true
    
    const response = await api.get('/admin/backup/history')
    backupHistory.value = response.data.data
  } catch (error) {
    console.error('Error fetching backup history:', error)
  } finally {
    backupHistoryLoading.value = false
  }
}

// Fetch settings on component mount
const fetchSettings = async () => {
  try {
    loading.value = true
    
    // Fetch general settings
    const generalResponse = await api.get('/admin/settings/general')
    Object.assign(generalSettings, generalResponse.data.data)
    
    // Fetch pricing settings
    const pricingResponse = await api.get('/admin/settings/pricing')
    Object.assign(pricingSettings, pricingResponse.data.data)
    
    // Fetch notification settings
    const notificationResponse = await api.get('/admin/settings/notifications')
    Object.assign(notificationSettings, notificationResponse.data.data)
    
    // Fetch appearance settings
    const appearanceResponse = await api.get('/admin/settings/appearance')
    Object.assign(appearanceSettings, appearanceResponse.data.data)
    
    // Fetch backup history
    fetchBackupHistory()
  } catch (error) {
    console.error('Error fetching settings:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to load settings',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Load settings on component mount
onMounted(() => {
  fetchSettings()
})
</script>