<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5">Users Management</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Add New User" class="text-capitalize" @click="openAddUserDialog" />
    </div>

    <!-- Filters -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.role"
          :options="roleOptions"
          label="Role"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="fetchUsers"
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
          @update:model-value="fetchUsers"
        />
      </div>
      <div class="col-12 col-md-6">
        <q-input
          v-model="filters.search"
          label="Search (Name, Email, Phone)"
          outlined
          dense
          clearable
          @update:model-value="fetchUsers"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Users Table -->
    <q-card>
      <q-card-section class="q-pb-none">
        <div class="text-subtitle1 q-mb-sm">
          Total Users: {{ pagination.rowsNumber }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-table
          :rows="users"
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

          <template v-slot:body-cell-avatar="props">
            <q-td :props="props">
              <q-avatar>
                <img :src="getProfileImageUrl(props.row.profileImage)" />
              </q-avatar>
            </q-td>
          </template>

          <template v-slot:body-cell-role="props">
            <q-td :props="props">
              <q-badge :color="getRoleColor(props.value)">
                {{ formatRole(props.value) }}
              </q-badge>
            </q-td>
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

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn-group flat>
                <q-btn flat round color="primary" icon="visibility" @click="viewUser(props.row)">
                  <q-tooltip>View Details</q-tooltip>
                </q-btn>
                <q-btn flat round color="secondary" icon="edit" @click="editUser(props.row)">
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn flat round :color="props.row.status === 'active' ? 'negative' : 'positive'" 
                  :icon="props.row.status === 'active' ? 'block' : 'check'" 
                  @click="toggleUserStatus(props.row)">
                  <q-tooltip>{{ props.row.status === 'active' ? 'Block' : 'Activate' }}</q-tooltip>
                </q-btn>
                <q-btn flat round color="accent" icon="vpn_key" @click="resetPassword(props.row)">
                  <q-tooltip>Reset Password</q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md text-grey-7">
              <q-icon name="people" size="2em" class="q-mr-sm" />
              No users found
            </div>
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

    <!-- User Details Dialog -->
    <q-dialog v-model="userDetailsDialog" persistent>
      <q-card style="min-width: 350px; max-width: 80vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">User Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedUser">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-img
                :src="getProfileImageUrl(selectedUser.profileImage)"
                style="height: 200px"
              />
              <div class="q-mt-md">
                <q-chip
                  :color="getStatusColor(selectedUser.status)"
                  text-color="white"
                >
                  {{ selectedUser.status }}
                </q-chip>
                <q-badge :color="getRoleColor(selectedUser.role)">
                  {{ formatRole(selectedUser.role) }}
                </q-badge>
              </div>
            </div>

            <div class="col-12 col-md-8">
              <div class="text-h6">{{ selectedUser.name }}</div>
              <div class="text-subtitle2">{{ selectedUser.email }}</div>
              <div class="text-subtitle2">{{ selectedUser.phone || 'No phone number' }}</div>

              <q-separator class="q-my-md" />

              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2">User ID</div>
                  <div>{{ selectedUser._id }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2">Created At</div>
                  <div>{{ formatDateTime(selectedUser.createdAt) }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2">Last Login</div>
                  <div>{{ selectedUser.lastLogin ? formatDateTime(selectedUser.lastLogin) : 'Never' }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2">Email Verified</div>
                  <div>
                    <q-badge :color="selectedUser.isEmailVerified ? 'positive' : 'negative'">
                      {{ selectedUser.isEmailVerified ? 'Verified' : 'Not Verified' }}
                    </q-badge>
                  </div>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2">Address</div>
              <div>{{ selectedUser.address || 'No address provided' }}</div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2">Bookings</div>
              <q-list bordered separator>
                <q-item v-for="booking in userBookings" :key="booking._id">
                  <q-item-section>
                    <q-item-label>{{ booking._id }}</q-item-label>
                    <q-item-label caption>
                      {{ formatDateTime(booking.createdAt) }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-chip
                      :color="getBookingStatusColor(booking.status)"
                      text-color="white"
                      size="sm"
                    >
                      {{ booking.status }}
                    </q-chip>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat round color="primary" icon="visibility" @click="viewUserBooking(booking)">
                      <q-tooltip>View Booking</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
                <q-item v-if="!userBookings.length">
                  <q-item-section>
                    <q-item-label>No bookings found</q-item-label>
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

    <!-- Add/Edit User Dialog -->
    <q-dialog v-model="userFormDialog" persistent>
      <q-card style="min-width: 350px; max-width: 80vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ isEditing ? 'Edit User' : 'Add New User' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveUser" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="userForm.name"
                  label="Name"
                  :rules="[val => !!val || 'Name is required']"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="userForm.email"
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
                  v-model="userForm.phone"
                  label="Phone"
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="userForm.role"
                  :options="roleOptions"
                  label="Role"
                  :rules="[val => !!val || 'Role is required']"
                  outlined
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="userForm.status"
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
                  v-model="userForm.isEmailVerified"
                  label="Email Verified"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="userForm.address"
                  label="Address"
                  type="textarea"
                  outlined
                />
              </div>
              <div class="col-12" v-if="!isEditing">
                <q-input
                  v-model="userForm.password"
                  label="Password"
                  type="password"
                  :rules="[val => !!val || 'Password is required']"
                  outlined
                />
              </div>
              <div class="col-12">
                <q-file
                  v-model="userForm.profileImageFile"
                  label="Profile Image"
                  outlined
                  accept="image/*"
                  @update:model-value="onProfileImageSelected"
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

    <!-- Reset Password Dialog -->
    <q-dialog v-model="resetPasswordDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Reset Password</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedUser">
          <div class="text-subtitle1 q-mb-md">
            Reset password for {{ selectedUser.name }}
          </div>
          
          <q-input
            v-model="newPassword"
            label="New Password"
            type="password"
            :rules="[val => !!val || 'Password is required']"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Reset" color="negative" @click="confirmResetPassword" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { date } from 'quasar'
import { api } from 'src/boot/axios'
import { apiBaseUrl } from 'src/config'

const $q = useQuasar()
const loading = ref(false)
const users = ref([])
const selectedUser = ref(null)
const userDetailsDialog = ref(false)
const userFormDialog = ref(false)
const resetPasswordDialog = ref(false)
const isEditing = ref(false)
const userBookings = ref([])
const newPassword = ref('')

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
  role: null,
  status: null,
  search: ''
})

// Options for filters
const roleOptions = [
  { label: 'User', value: 'user' },
  { label: 'Driver', value: 'driver' },
  { label: 'Admin', value: 'admin' }
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Blocked', value: 'blocked' }
]

// Table columns
const columns = [
  { name: 'avatar', label: '', field: 'profileImage', align: 'center', sortable: false },
  { name: 'name', label: 'Name', field: 'name', sortable: true },
  { name: 'email', label: 'Email', field: 'email', sortable: true },
  { name: 'phone', label: 'Phone', field: 'phone', sortable: true },
  { name: 'role', label: 'Role', field: 'role', sortable: true },
  { name: 'status', label: 'Status', field: 'status', sortable: true },
  { name: 'createdAt', label: 'Joined', field: 'createdAt', sortable: true, 
    format: val => formatDate(val) },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center', sortable: false }
]

// User form
const userForm = reactive({
  name: '',
  email: '',
  phone: '',
  role: 'user',
  status: 'active',
  address: '',
  password: '',
  isEmailVerified: false,
  profileImageFile: null
})

// Handle profile image selection
const onProfileImageSelected = (file) => {
  if (file) {
    console.log('Profile image selected:', file)
  }
}

// Helper function to get profile image URL
const getProfileImageUrl = (profileImage) => {
  if (!profileImage) {
    return 'https://cdn.quasar.dev/img/avatar.png'
  }
  
  // If the image path is already a full URL, return it
  if (profileImage.startsWith('http')) {
    return profileImage
  }
  
  // Otherwise, prepend the API base URL
  return `${apiBaseUrl}${profileImage}`
}

// Fetch users from API
const fetchUsers = async () => {
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
    if (filters.role) params.role = filters.role
    if (filters.status) params.status = filters.status
    if (filters.search) params.search = filters.search
    
    const response = await api.get('/admin/users', { params })
    
    users.value = response.data.data
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error fetching users:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to load users',
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
  fetchUsers()
}

// View user details
const viewUser = async (user) => {
  try {
    selectedUser.value = user
    userDetailsDialog.value = true
    
    // Fetch user's bookings
    const response = await api.get(`/admin/users/${user._id}/bookings`)
    userBookings.value = response.data.data
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to load user bookings',
      icon: 'error'
    })
  }
}

// View user booking
const viewUserBooking = (booking) => {
  // Implement view booking functionality
  console.log('View booking:', booking._id)
}

// Edit user
const editUser = (user) => {
  isEditing.value = true
  selectedUser.value = user
  
  // Populate form with user data
  userForm.name = user.name
  userForm.email = user.email
  userForm.phone = user.phone || ''
  userForm.role = user.role
  userForm.status = user.status
  userForm.address = user.address || ''
  userForm.isEmailVerified = user.isEmailVerified || false
  userForm.profileImageFile = null
  userForm.password = ''
  
  userFormDialog.value = true
}

// Open add user dialog
const openAddUserDialog = () => {
  isEditing.value = false
  selectedUser.value = null
  
  // Reset form
  userForm.name = ''
  userForm.email = ''
  userForm.phone = ''
  userForm.role = 'user'
  userForm.status = 'active'
  userForm.address = ''
  userForm.isEmailVerified = false
  userForm.profileImageFile = null
  userForm.password = ''
  
  userFormDialog.value = true
}

// Save user (create or update)
const saveUser = async () => {
  try {
    loading.value = true
    
    const formData = new FormData()
    formData.append('name', userForm.name)
    formData.append('email', userForm.email)
    formData.append('role', userForm.role)
    formData.append('status', userForm.status)
    formData.append('isEmailVerified', userForm.isEmailVerified)
    
    if (userForm.phone) {
      formData.append('phone', userForm.phone)
    }
    
    if (userForm.address) {
      formData.append('address', userForm.address)
    }
    
    if (!isEditing.value && userForm.password) {
      formData.append('password', userForm.password)
    }
    
    if (userForm.profileImageFile) {
      formData.append('profileImage', userForm.profileImageFile)
    }
    
    if (isEditing.value) {
      // Update existing user
      await api.put(`/admin/users/${selectedUser.value._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      $q.notify({
        color: 'positive',
        message: 'User updated successfully',
        icon: 'check'
      })
    } else {
      // Create new user
      await api.post('/admin/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      $q.notify({
        color: 'positive',
        message: 'User created successfully',
        icon: 'check'
      })
    }
    
    userFormDialog.value = false
    fetchUsers()
  } catch (error) {
    console.error('Error saving user:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to save user',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Toggle user status
const toggleUserStatus = async (user) => {
  try {
    const newStatus = user.status === 'active' ? 'blocked' : 'active'
    await api.put(`/admin/users/${user._id}/status`, { status: newStatus })
    $q.notify({
      color: 'positive',
      message: `User ${newStatus === 'active' ? 'activated' : 'blocked'} successfully`,
      icon: 'check'
    })
    fetchUsers()
  } catch (error) {
    console.error('Error updating user status:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to update user status',
      icon: 'error'
    })
  }
}

// Reset password
const resetPassword = (user) => {
  selectedUser.value = user
  newPassword.value = ''
  resetPasswordDialog.value = true
}

// Confirm password reset
const confirmResetPassword = async () => {
  try {
    loading.value = true
    
    await api.put(`/admin/users/${selectedUser.value._id}/reset-password`, {
      password: newPassword.value
    })
    
    $q.notify({
      color: 'positive',
      message: 'Password reset successfully',
      icon: 'check'
    })
    
    resetPasswordDialog.value = false
  } catch (error) {
    console.error('Error resetting password:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to reset password',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return date.formatDate(new Date(dateString), 'MMM D, YYYY')
}

// Format date and time for display
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  return date.formatDate(new Date(dateString), 'MMM D, YYYY h:mm A')
}

// Get role color
const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'negative'
    case 'driver':
      return 'warning'
    case 'user':
      return 'primary'
    default:
      return 'grey'
  }
}

// Get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'positive'
    case 'inactive':
      return 'warning'
    case 'blocked':
      return 'negative'
    default:
      return 'grey'
  }
}

// Get booking status color
const getBookingStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'blue'
    case 'confirmed':
      return 'orange'
    case 'in-progress':
      return 'warning'
    case 'completed':
      return 'positive'
    case 'cancelled':
      return 'negative'
    default:
      return 'grey'
  }
}

// Format role for display
const formatRole = (role) => {
  if (!role) return 'Unknown'
  
  return role.charAt(0).toUpperCase() + role.slice(1)
}

// Load users on component mount
onMounted(() => {
  fetchUsers()
})
</script>