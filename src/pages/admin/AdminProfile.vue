<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Admin Profile</div>

    <div class="row q-col-gutter-md">
      <!-- Profile Card -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-center">
              <q-avatar size="100px">
                <img :src="profile.profileImage || 'https://cdn.quasar.dev/img/avatar.png'">
              </q-avatar>
              <div class="text-h6 q-mt-sm">{{ profile.name }}</div>
              <div class="text-subtitle2">{{ profile.email }}</div>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-btn
                  flat
                  color="primary"
                  class="full-width"
                  icon="edit"
                  label="Edit Profile"
                  @click="editProfileDialog = true"
                />
              </div>
              <div class="col-6">
                <q-btn
                  flat
                  color="negative"
                  class="full-width"
                  icon="lock"
                  label="Change Password"
                  @click="changePasswordDialog = true"
                />
              </div>
            </div>
          </q-card-section>

          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-icon name="phone" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Phone</q-item-label>
                <q-item-label>{{ profile.phone || 'Not provided' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="badge" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Role</q-item-label>
                <q-item-label>{{ formatRole(profile.role) }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="event" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Joined</q-item-label>
                <q-item-label>{{ formatDate(profile.createdAt) }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="login" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Last Login</q-item-label>
                <q-item-label>{{ profile.lastLogin ? formatDateTime(profile.lastLogin) : 'Never' }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Activity & Settings -->
      <div class="col-12 col-md-8">
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
            <q-tab name="activity" label="Recent Activity" icon="history" />
            <q-tab name="notifications" label="Notification Settings" icon="notifications" />
            <q-tab name="security" label="Security" icon="security" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <!-- Activity Tab -->
            <q-tab-panel name="activity">
              <div class="text-h6">Recent Activity</div>
              
              <q-list separator>
                <q-item v-for="activity in recentActivity" :key="activity.id">
                  <q-item-section avatar>
                    <q-icon :name="getActivityIcon(activity.type)" :color="getActivityColor(activity.type)" />
                  </q-item-section>
                  
                  <q-item-section>
                    <q-item-label>{{ activity.description }}</q-item-label>
                    <q-item-label caption>{{ formatDateTime(activity.timestamp) }}</q-item-label>
                  </q-item-section>
                  
                  <q-item-section side v-if="activity.details">
                    <q-btn flat round color="grey" icon="info" size="sm">
                      <q-tooltip>
                        {{ activity.details }}
                      </q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
                
                <q-item v-if="!recentActivity.length">
                  <q-item-section>
                    <div class="text-center text-grey q-py-md">
                      No recent activity found
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
              
              <div class="text-center q-mt-md" v-if="recentActivity.length">
                <q-btn flat color="primary" label="View All Activity" />
              </div>
            </q-tab-panel>

            <!-- Notifications Tab -->
            <q-tab-panel name="notifications">
              <div class="text-h6">Notification Settings</div>
              
              <q-list>
                <q-item tag="label">
                  <q-item-section>
                    <q-item-label>Email Notifications</q-item-label>
                    <q-item-label caption>Receive email notifications for important events</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="notificationSettings.email" color="primary" />
                  </q-item-section>
                </q-item>
                
                <q-item tag="label">
                  <q-item-section>
                    <q-item-label>SMS Notifications</q-item-label>
                    <q-item-label caption>Receive SMS alerts for critical events</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="notificationSettings.sms" color="primary" />
                  </q-item-section>
                </q-item>
                
                <q-item tag="label">
                  <q-item-section>
                    <q-item-label>Browser Notifications</q-item-label>
                    <q-item-label caption>Receive browser push notifications</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="notificationSettings.browser" color="primary" />
                  </q-item-section>
                </q-item>
                
                <q-separator />
                
                <q-item-label header>Notification Events</q-item-label>
                
                <q-item tag="label">
                  <q-item-section>
                    <q-item-label>New Bookings</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="notificationSettings.events.newBookings" color="primary" />
                  </q-item-section>
                </q-item>
                
                <q-item tag="label">
                  <q-item-section>
                    <q-item-label>Booking Cancellations</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="notificationSettings.events.bookingCancellations" color="primary" />
                  </q-item-section>
                </q-item>
                
                <q-item tag="label">
                  <q-item-section>
                    <q-item-label>Driver Registration</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="notificationSettings.events.driverRegistration" color="primary" />
                  </q-item-section>
                </q-item>
                
                <q-item tag="label">
                  <q-item-section>
                    <q-item-label>System Alerts</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="notificationSettings.events.systemAlerts" color="primary" />
                  </q-item-section>
                </q-item>
              </q-list>
              
              <div class="row justify-end q-mt-md">
                <q-btn color="primary" label="Save Settings" @click="saveNotificationSettings" />
              </div>
            </q-tab-panel>

            <!-- Security Tab -->
            <q-tab-panel name="security">
              <div class="text-h6">Security Settings</div>
              
              <q-list>
                <q-item tag="label">
                  <q-item-section>
                    <q-item-label>Two-Factor Authentication</q-item-label>
                    <q-item-label caption>Add an extra layer of security to your account</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="securitySettings.twoFactorAuth" color="primary" />
                  </q-item-section>
                </q-item>
                
                <q-item tag="label">
                  <q-item-section>
                    <q-item-label>Login Notifications</q-item-label>
                    <q-item-label caption>Get notified when someone logs into your account</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="securitySettings.loginNotifications" color="primary" />
                  </q-item-section>
                </q-item>
                
                <q-separator />
                
                <q-item>
                  <q-item-section>
                    <q-item-label>Session Management</q-item-label>
                    <q-item-label caption>Manage your active sessions</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat color="primary" label="Manage" @click="showSessionsDialog = true" />
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label>Account Activity Log</q-item-label>
                    <q-item-label caption>View your account activity history</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat color="primary" label="View" @click="showActivityLogDialog = true" />
                  </q-item-section>
                </q-item>
              </q-list>
              
              <div class="row justify-end q-mt-md">
                <q-btn color="primary" label="Save Settings" @click="saveSecuritySettings" />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>

    <!-- Edit Profile Dialog -->
    <q-dialog v-model="editProfileDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Edit Profile</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="updateProfile" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 text-center">
                <q-avatar size="100px">
                  <img :src="editedProfile.profileImage || 'https://cdn.quasar.dev/img/avatar.png'">
                </q-avatar>
                <div class="q-mt-sm">
                  <q-file
                    v-model="profileImageFile"
                    label="Change Profile Picture"
                    outlined
                    accept="image/*"
                    style="max-width: 300px; margin: 0 auto;"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_file" />
                    </template>
                  </q-file>
                </div>
              </div>
              
              <div class="col-12">
                <q-input
                  v-model="editedProfile.name"
                  label="Name"
                  outlined
                  :rules="[val => !!val || 'Name is required']"
                />
              </div>
              
              <div class="col-12">
                <q-input
                  v-model="editedProfile.email"
                  label="Email"
                  type="email"
                  outlined
                  :rules="[
                    val => !!val || 'Email is required',
                    val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email format'
                  ]"
                />
              </div>
              
              <div class="col-12">
                <q-input
                  v-model="editedProfile.phone"
                  label="Phone"
                  outlined
                />
              </div>
            </div>

            <div class="row justify-end q-mt-md">
              <q-btn label="Cancel" color="negative" flat v-close-popup />
              <q-btn label="Save" type="submit" color="primary" :loading="loading" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Change Password Dialog -->
    <q-dialog v-model="changePasswordDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Change Password</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="updatePassword" class="q-gutter-md">
            <q-input
              v-model="passwordData.currentPassword"
              label="Current Password"
              type="password"
              outlined
              :rules="[val => !!val || 'Current password is required']"
            />
            
            <q-input
              v-model="passwordData.newPassword"
              label="New Password"
              type="password"
              outlined
              :rules="[
                val => !!val || 'New password is required',
                val => val.length >= 8 || 'Password must be at least 8 characters',
                val => /[A-Z]/.test(val) || 'Password must contain at least one uppercase letter',
                val => /[0-9]/.test(val) || 'Password must contain at least one number'
              ]"
            />
            
            <q-input
              v-model="passwordData.confirmPassword"
              label="Confirm New Password"
              type="password"
              outlined
              :rules="[
                val => !!val || 'Please confirm your password',
                val => val === passwordData.newPassword || 'Passwords do not match'
              ]"
            />

            <div class="row justify-end q-mt-md">
              <q-btn label="Cancel" color="negative" flat v-close-popup />
              <q-btn label="Update Password" type="submit" color="primary" :loading="loading" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Sessions Dialog -->
    <q-dialog v-model="showSessionsDialog">
      <q-card style="min-width: 350px; max-width: 80vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">Active Sessions</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-list separator>
            <q-item v-for="session in activeSessions" :key="session.id">
              <q-item-section avatar>
                <q-icon :name="getDeviceIcon(session.device)" color="primary" />
              </q-item-section>
              
              <q-item-section>
                <q-item-label>{{ session.device }} - {{ session.browser }}</q-item-label>
                <q-item-label caption>
                  IP: {{ session.ip }} | Location: {{ session.location }}
                  <br>
                  Last active: {{ formatDateTime(session.lastActive) }}
                </q-item-label>
              </q-item-section>
              
              <q-item-section side>
                <q-chip v-if="session.current" color="primary" text-color="white" size="sm">Current</q-chip>
                <q-btn v-else flat round color="negative" icon="logout" @click="terminateSession(session.id)">
                  <q-tooltip>Terminate Session</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Terminate All Other Sessions" color="negative" @click="terminateAllSessions" />
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Activity Log Dialog -->
    <q-dialog v-model="showActivityLogDialog">
      <q-card style="min-width: 350px; max-width: 80vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">Account Activity Log</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-table
            :rows="activityLog"
            :columns="activityColumns"
            row-key="id"
            :pagination="{ rowsPerPage: 5 }"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Export Log" color="primary" icon="download" />
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar, date } from 'quasar'
import { api } from 'src/boot/axios'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()
const loading = ref(false)
const activeTab = ref('activity')
const editProfileDialog = ref(false)
const changePasswordDialog = ref(false)
const showSessionsDialog = ref(false)
const showActivityLogDialog = ref(false)
const profileImageFile = ref(null)

// Profile data
const profile = reactive({
  name: '',
  email: '',
  phone: '',
  role: 'admin',
  profileImage: '',
  createdAt: '',
  lastLogin: ''
})

// Edited profile data
const editedProfile = reactive({
  name: '',
  email: '',
  phone: '',
  profileImage: ''
})

// Password data
const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Notification settings
const notificationSettings = reactive({
  email: true,
  sms: false,
  browser: true,
  events: {
    newBookings: true,
    bookingCancellations: true,
    driverRegistration: true,
    systemAlerts: true
  }
})

// Security settings
const securitySettings = reactive({
  twoFactorAuth: false,
  loginNotifications: true
})

// Recent activity
const recentActivity = ref([
  {
    id: 1,
    type: 'login',
    description: 'Logged in from Chrome on Windows',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    details: 'IP: 192.168.1.1, Location: New Delhi, India'
  },
  {
    id: 2,
    type: 'settings',
    description: 'Updated system settings',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    details: 'Changed pricing settings'
  },
  {
    id: 3,
    type: 'user',
    description: 'Added new admin user',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    details: 'Added user: admin2@example.com'
  },
  {
    id: 4,
    type: 'booking',
    description: 'Approved emergency booking #BK001',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    details: 'Assigned driver: John Doe'
  }
])

// Active sessions
const activeSessions = ref([
  {
    id: 1,
    device: 'Windows PC',
    browser: 'Chrome 112.0.0',
    ip: '192.168.1.1',
    location: 'New Delhi, India',
    lastActive: new Date(),
    current: true
  },
  {
    id: 2,
    device: 'iPhone',
    browser: 'Safari 16.4',
    ip: '192.168.1.2',
    location: 'Mumbai, India',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: 3,
    device: 'Android',
    browser: 'Chrome Mobile 112.0.0',
    ip: '192.168.1.3',
    location: 'Bangalore, India',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  }
])

// Activity log
const activityLog = ref([
  {
    id: 1,
    action: 'Login',
    ip: '192.168.1.1',
    device: 'Windows PC - Chrome',
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: 2,
    action: 'Password Change',
    ip: '192.168.1.1',
    device: 'Windows PC - Chrome',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 days ago
  },
  {
    id: 3,
    action: 'Profile Update',
    ip: '192.168.1.1',
    device: 'Windows PC - Chrome',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14) // 14 days ago
  },
  {
    id: 4,
    action: 'Login',
    ip: '192.168.1.2',
    device: 'iPhone - Safari',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21) // 21 days ago
  }
])

// Activity columns
const activityColumns = [
  { name: 'action', label: 'Action', field: 'action', sortable: true, align: 'left' },
  { name: 'ip', label: 'IP Address', field: 'ip', sortable: true, align: 'left' },
  { name: 'device', label: 'Device', field: 'device', sortable: true, align: 'left' },
  { name: 'timestamp', label: 'Timestamp', field: 'timestamp', sortable: true, align: 'left',
    format: val => formatDateTime(val) }
]

// Fetch profile data
const fetchProfile = async () => {
  try {
    loading.value = true
    
    // Get profile from auth store or API
    const userData = authStore.user || {}
    
    // Update profile data
    profile.name = userData.name || ''
    profile.email = userData.email || ''
    profile.phone = userData.phone || ''
    profile.role = userData.role || 'admin'
    profile.profileImage = userData.profileImage || ''
    profile.createdAt = userData.createdAt || new Date()
    profile.lastLogin = userData.lastLogin || null
    
    // Initialize edited profile
    editedProfile.name = profile.name
    editedProfile.email = profile.email
    editedProfile.phone = profile.phone
    editedProfile.profileImage = profile.profileImage
  } catch (error) {
    console.error('Error fetching profile:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to load profile',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Update profile
const updateProfile = async () => {
  try {
    loading.value = true
    
    const formData = new FormData()
    formData.append('name', editedProfile.name)
    formData.append('email', editedProfile.email)
    
    if (editedProfile.phone) {
      formData.append('phone', editedProfile.phone)
    }
    
    if (profileImageFile.value) {
      formData.append('profileImage', profileImageFile.value)
    }
    
    // Call API to update profile
    await api.put('/admin/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    // Update local profile data
    profile.name = editedProfile.name
    profile.email = editedProfile.email
    profile.phone = editedProfile.phone
    
    if (profileImageFile.value) {
      // In a real app, the API would return the new image URL
      // For now, we'll use a placeholder
      profile.profileImage = URL.createObjectURL(profileImageFile.value)
    }
    
    // Update auth store
    authStore.updateProfile({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      profileImage: profile.profileImage
    })
    
    $q.notify({
      color: 'positive',
      message: 'Profile updated successfully',
      icon: 'check'
    })
    
    editProfileDialog.value = false
  } catch (error) {
    console.error('Error updating profile:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to update profile',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Update password
const updatePassword = async () => {
  try {
    loading.value = true
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new Error('Passwords do not match')
    }
    
    // Call API to update password
    await api.put('/admin/change-password', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
    
    $q.notify({
      color: 'positive',
      message: 'Password updated successfully',
      icon: 'check'
    })
    
    // Reset form
    passwordData.currentPassword = ''
    passwordData.newPassword = ''
    passwordData.confirmPassword = ''
    
    changePasswordDialog.value = false
  } catch (error) {
    console.error('Error updating password:', error)
    $q.notify({
      color: 'negative',
      message: error.message || 'Failed to update password',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Save notification settings
const saveNotificationSettings = async () => {
  try {
    loading.value = true
    
    // Call API to update notification settings
    await api.put('/admin/notification-settings', notificationSettings)
    
    $q.notify({
      color: 'positive',
      message: 'Notification settings saved',
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

// Save security settings
const saveSecuritySettings = async () => {
  try {
    loading.value = true
    
    // Call API to update security settings
    await api.put('/admin/security-settings', securitySettings)
    
    $q.notify({
      color: 'positive',
      message: 'Security settings saved',
      icon: 'check'
    })
  } catch (error) {
    console.error('Error saving security settings:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to save security settings',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Terminate session
const terminateSession = async (sessionId) => {
  try {
    // Call API to terminate session
    await api.delete(`/admin/sessions/${sessionId}`)
    
    // Remove session from list
    activeSessions.value = activeSessions.value.filter(session => session.id !== sessionId)
    
    $q.notify({
      color: 'positive',
      message: 'Session terminated',
      icon: 'check'
    })
  } catch (error) {
    console.error('Error terminating session:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to terminate session',
      icon: 'error'
    })
  }
}

// Terminate all sessions
const terminateAllSessions = async () => {
  try {
    // Call API to terminate all sessions except current
    await api.delete('/admin/sessions')
    
    // Keep only current session
    activeSessions.value = activeSessions.value.filter(session => session.current)
    
    $q.notify({
      color: 'positive',
      message: 'All other sessions terminated',
      icon: 'check'
    })
  } catch (error) {
    console.error('Error terminating sessions:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to terminate sessions',
      icon: 'error'
    })
  }
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return date.formatDate(new Date(dateString), 'MMMM D, YYYY')
}

// Format date and time
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  return date.formatDate(new Date(dateString), 'MMM D, YYYY h:mm A')
}

// Format role
const formatRole = (role) => {
  if (!role) return 'Unknown'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

// Get activity icon
const getActivityIcon = (type) => {
  switch (type) {
    case 'login':
      return 'login'
    case 'logout':
      return 'logout'
    case 'settings':
      return 'settings'
    case 'user':
      return 'person'
    case 'booking':
      return 'book_online'
    default:
      return 'history'
  }
}

// Get activity color
const getActivityColor = (type) => {
  switch (type) {
    case 'login':
      return 'positive'
    case 'logout':
      return 'grey'
    case 'settings':
      return 'primary'
    case 'user':
      return 'secondary'
    case 'booking':
      return 'accent'
    default:
      return 'grey'
  }
}

// Get device icon
const getDeviceIcon = (device) => {
  if (device.includes('Windows') || device.includes('Mac')) {
    return 'computer'
  } else if (device.includes('iPhone') || device.includes('iPad')) {
    return 'phone_iphone'
  } else if (device.includes('Android')) {
    return 'smartphone'
  } else {
    return 'devices'
  }
}

// Load profile on component mount
onMounted(() => {
  fetchProfile()
})
</script>