<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">User Management</div>
      <q-btn color="primary" icon="add" label="Add User" @click="openAddUserDialog" />
    </div>

    <!-- Filters -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-4 col-md-3">
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
          <div class="col-12 col-sm-4 col-md-3">
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
          <div class="col-12 col-sm-4 col-md-6">
            <q-input
              v-model="filters.search"
              outlined
              dense
              label="Search"
              placeholder="Search by name, email or phone"
              clearable
              @update:model-value="fetchUsers"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Users Table -->
    <q-card>
      <q-card-section>
        <q-table
          :rows="users"
          :columns="columns"
          row-key="_id"
          :loading="loading"
          :pagination.sync="pagination"
          @request="onRequest"
          binary-state-sort
        >
          <!-- Profile Image Column -->
          <template v-slot:body-cell-profileImage="props">
            <q-td :props="props">
              <q-avatar size="40px">
                <img v-if="props.row.profileImage" :src="getImageUrl(props.row.profileImage)" />
                <q-icon v-else name="person" size="40px" color="grey-7" />
              </q-avatar>
            </q-td>
          </template>

          <!-- Status Column -->
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

          <!-- Role Column -->
          <template v-slot:body-cell-role="props">
            <q-td :props="props">
              <q-badge :color="getRoleColor(props.value)">
                {{ formatRole(props.value) }}
              </q-badge>
            </q-td>
          </template>

          <!-- Actions Column -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-xs">
              <q-btn
                flat
                round
                color="primary"
                icon="visibility"
                size="sm"
                @click="viewUser(props.row)"
              >
                <q-tooltip>View Details</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="secondary"
                icon="edit"
                size="sm"
                @click="editUser(props.row)"
              >
                <q-tooltip>Edit User</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                :color="props.row.status === 'active' ? 'negative' : 'positive'"
                :icon="props.row.status === 'active' ? 'block' : 'check_circle'"
                size="sm"
                @click="toggleUserStatus(props.row)"
              >
                <q-tooltip>{{ props.row.status === 'active' ? 'Deactivate' : 'Activate' }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="orange"
                icon="key"
                size="sm"
                @click="resetPassword(props.row)"
              >
                <q-tooltip>Reset Password</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Add/Edit User Dialog -->
    <q-dialog v-model="userDialog.show" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ userDialog.isEdit ? 'Edit User' : 'Add New User' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit="saveUser" ref="userForm">
            <div class="row q-col-gutter-md">
              <!-- Profile Image Upload -->
              <div class="col-12 flex flex-center q-mb-md">
                <q-avatar size="100px" class="cursor-pointer" @click="triggerImageUpload">
                  <img v-if="userDialog.form.profileImagePreview" :src="userDialog.form.profileImagePreview" />
                  <img v-else-if="userDialog.form.profileImage" :src="getImageUrl(userDialog.form.profileImage)" />
                  <q-icon v-else name="person" size="80px" color="grey-7" />
                  <q-file
                    v-model="userDialog.form.profileImageFile"
                    accept=".jpg, .jpeg, .png"
                    @update:model-value="onImageSelected"
                    style="display: none"
                    ref="imageInput"
                  />
                </q-avatar>
                <q-btn
                  round
                  color="primary"
                  icon="camera_alt"
                  size="sm"
                  class="absolute"
                  style="margin-top: 70px; margin-left: 70px"
                  @click="triggerImageUpload"
                />
              </div>

              <!-- Name -->
              <div class="col-12">
                <q-input
                  v-model="userDialog.form.name"
                  label="Full Name *"
                  outlined
                  :rules="[val => !!val || 'Name is required']"
                />
              </div>

              <!-- Email -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="userDialog.form.email"
                  label="Email *"
                  outlined
                  type="email"
                  :rules="[
                    val => !!val || 'Email is required',
                    val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email format'
                  ]"
                />
              </div>

              <!-- Phone -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="userDialog.form.phone"
                  label="Phone *"
                  outlined
                  :rules="[val => !!val || 'Phone is required']"
                />
              </div>

              <!-- Password (only for new users) -->
              <div class="col-12" v-if="!userDialog.isEdit">
                <q-input
                  v-model="userDialog.form.password"
                  label="Password *"
                  outlined
                  type="password"
                  :rules="[val => !!val || 'Password is required', val => val.length >= 6 || 'Password must be at least 6 characters']"
                />
              </div>

              <!-- Role -->
              <div class="col-12 col-md-6">
                <q-select
                  v-model="userDialog.form.role"
                  :options="roleOptions"
                  label="Role *"
                  outlined
                  emit-value
                  map-options
                  :rules="[val => !!val || 'Role is required']"
                />
              </div>

              <!-- Status -->
              <div class="col-12 col-md-6">
                <q-select
                  v-model="userDialog.form.status"
                  :options="statusOptions"
                  label="Status *"
                  outlined
                  emit-value
                  map-options
                  :rules="[val => !!val || 'Status is required']"
                />
              </div>

              <!-- Address -->
              <div class="col-12">
                <q-input
                  v-model="userDialog.form.address"
                  label="Address"
                  outlined
                  type="textarea"
                  autogrow
                />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancel" color="negative" flat v-close-popup />
          <q-btn
            label="Save"
            color="primary"
            @click="saveUser"
            :loading="userDialog.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- View User Dialog -->
    <q-dialog v-model="viewDialog.show">
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">User Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="viewDialog.user">
          <div class="row justify-center q-mb-md">
            <q-avatar size="100px">
              <img v-if="viewDialog.user.profileImage" :src="getImageUrl(viewDialog.user.profileImage)" />
              <q-icon v-else name="person" size="80px" color="grey-7" />
            </q-avatar>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Name</q-item-label>
                  <q-item-label>{{ viewDialog.user.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12 col-md-6">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Email</q-item-label>
                  <q-item-label>{{ viewDialog.user.email }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12 col-md-6">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Phone</q-item-label>
                  <q-item-label>{{ viewDialog.user.phone }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12 col-md-6">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Role</q-item-label>
                  <q-item-label>
                    <q-badge :color="getRoleColor(viewDialog.user.role)">
                      {{ formatRole(viewDialog.user.role) }}
                    </q-badge>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12 col-md-6">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Status</q-item-label>
                  <q-item-label>
                    <q-chip
                      :color="getStatusColor(viewDialog.user.status)"
                      text-color="white"
                      size="sm"
                    >
                      {{ viewDialog.user.status }}
                    </q-chip>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12 col-md-6">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Registered On</q-item-label>
                  <q-item-label>{{ formatDate(viewDialog.user.createdAt) }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Address</q-item-label>
                  <q-item-label>{{ viewDialog.user.address || 'Not provided' }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="Edit"
            color="primary"
            icon="edit"
            @click="editUser(viewDialog.user)"
          />
          <q-btn
            :label="viewDialog.user && viewDialog.user.status === 'active' ? 'Deactivate' : 'Activate'"
            :color="viewDialog.user && viewDialog.user.status === 'active' ? 'negative' : 'positive'"
            :icon="viewDialog.user && viewDialog.user.status === 'active' ? 'block' : 'check_circle'"
            @click="toggleUserStatus(viewDialog.user)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Reset Password Dialog -->
    <q-dialog v-model="resetPasswordDialog.show" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">Reset Password</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit="confirmResetPassword" ref="resetPasswordForm">
            <q-input
              v-model="resetPasswordDialog.password"
              label="New Password *"
              outlined
              type="password"
              :rules="[
                val => !!val || 'Password is required',
                val => val.length >= 6 || 'Password must be at least 6 characters'
              ]"
            />
            <q-input
              v-model="resetPasswordDialog.confirmPassword"
              label="Confirm Password *"
              outlined
              type="password"
              :rules="[
                val => !!val || 'Please confirm password',
                val => val === resetPasswordDialog.password || 'Passwords do not match'
              ]"
              class="q-mt-md"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancel" color="negative" flat v-close-popup />
          <q-btn
            label="Reset Password"
            color="primary"
            @click="confirmResetPassword"
            :loading="resetPasswordDialog.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar, date } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()
const loading = ref(false)
const users = ref([])
const userForm = ref(null)
const resetPasswordForm = ref(null)
const imageInput = ref(null)

// Table pagination
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

// Table columns
const columns = [
  {
    name: 'profileImage',
    label: '',
    field: 'profileImage',
    align: 'center',
    sortable: false
  },
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    align: 'left',
    sortable: true
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    align: 'left',
    sortable: true
  },
  {
    name: 'phone',
    label: 'Phone',
    field: 'phone',
    align: 'left',
    sortable: true
  },
  {
    name: 'role',
    label: 'Role',
    field: 'role',
    align: 'center',
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    sortable: true
  },
  {
    name: 'createdAt',
    label: 'Registered On',
    field: 'createdAt',
    format: val => formatDate(val),
    align: 'left',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
    sortable: false
  }
]

// Options for dropdowns
const roleOptions = [
  { label: 'User', value: 'user' },
  { label: 'Driver', value: 'driver' },
  { label: 'Admin', value: 'admin' }
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending', value: 'pending' },
  { label: 'Blocked', value: 'blocked' }
]

// Dialog states
const userDialog = reactive({
  show: false,
  isEdit: false,
  loading: false,
  form: {
    _id: null,
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    status: 'active',
    address: '',
    profileImage: '',
    profileImageFile: null,
    profileImagePreview: null
  }
})

const viewDialog = reactive({
  show: false,
  user: null
})

const resetPasswordDialog = reactive({
  show: false,
  userId: null,
  password: '',
  confirmPassword: '',
  loading: false
})

// Fetch users on component mount
onMounted(() => {
  fetchUsers()
})

// Fetch users with pagination and filters
const fetchUsers = async () => {
  try {
    loading.value = true
    
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

// Handle pagination and sorting changes
const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  
  await fetchUsers()
}

// Open add user dialog
const openAddUserDialog = () => {
  userDialog.isEdit = false
  userDialog.form = {
    _id: null,
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    status: 'active',
    address: '',
    profileImage: '',
    profileImageFile: null,
    profileImagePreview: null
  }
  userDialog.show = true
}

// Open edit user dialog
const editUser = (user) => {
  userDialog.isEdit = true
  userDialog.form = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    address: user.address || '',
    profileImage: user.profileImage || '',
    profileImageFile: null,
    profileImagePreview: null
  }
  userDialog.show = true
  
  // Close view dialog if open
  viewDialog.show = false
}

// View user details
const viewUser = (user) => {
  viewDialog.user = user
  viewDialog.show = true
}

// Toggle user status
const toggleUserStatus = (user) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active'
  const action = user.status === 'active' ? 'deactivate' : 'activate'
  
  $q.dialog({
    title: `Confirm ${action}`,
    message: `Are you sure you want to ${action} this user?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.put(`/admin/users/${user._id}/status`, { status: newStatus })
      
      // Update user in the list
      const index = users.value.findIndex(u => u._id === user._id)
      if (index !== -1) {
        users.value[index].status = newStatus
      }
      
      // Update in view dialog if open
      if (viewDialog.show && viewDialog.user && viewDialog.user._id === user._id) {
        viewDialog.user.status = newStatus
      }
      
      $q.notify({
        color: 'positive',
        message: `User ${action}d successfully`,
        icon: 'check_circle'
      })
    } catch (error) {
      console.error(`Error ${action}ing user:`, error)
      $q.notify({
        color: 'negative',
        message: `Failed to ${action} user`,
        icon: 'error'
      })
    }
  })
}

// Reset user password
const resetPassword = (user) => {
  resetPasswordDialog.userId = user._id
  resetPasswordDialog.password = ''
  resetPasswordDialog.confirmPassword = ''
  resetPasswordDialog.show = true
}

// Confirm password reset
const confirmResetPassword = async () => {
  try {
    // Validate form
    const isValid = await resetPasswordForm.value.validate()
    if (!isValid) return
    
    resetPasswordDialog.loading = true
    
    await api.put(`/admin/users/${resetPasswordDialog.userId}/reset-password`, {
      password: resetPasswordDialog.password
    })
    
    resetPasswordDialog.show = false
    
    $q.notify({
      color: 'positive',
      message: 'Password reset successfully',
      icon: 'check_circle'
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to reset password',
      icon: 'error'
    })
  } finally {
    resetPasswordDialog.loading = false
  }
}

// Save user (create or update)
const saveUser = async () => {
  try {
    // Validate form
    const isValid = await userForm.value.validate()
    if (!isValid) return
    
    userDialog.loading = true
    
    // Create form data for file upload
    const formData = new FormData()
    formData.append('name', userDialog.form.name)
    formData.append('email', userDialog.form.email)
    formData.append('phone', userDialog.form.phone)
    formData.append('role', userDialog.form.role)
    formData.append('status', userDialog.form.status)
    
    if (userDialog.form.address) {
      formData.append('address', userDialog.form.address)
    }
    
    // Add password for new users
    if (!userDialog.isEdit) {
      formData.append('password', userDialog.form.password)
    }
    
    // Add profile image if selected
    if (userDialog.form.profileImageFile) {
      formData.append('profileImage', userDialog.form.profileImageFile)
    }
    
    let response
    
    if (userDialog.isEdit) {
      // Update existing user
      response = await api.put(`/admin/users/${userDialog.form._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Update user in the list
      const index = users.value.findIndex(u => u._id === userDialog.form._id)
      if (index !== -1) {
        users.value[index] = response.data.data
      }
      
      $q.notify({
        color: 'positive',
        message: 'User updated successfully',
        icon: 'check_circle'
      })
    } else {
      // Create new user
      response = await api.post('/admin/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Refresh the user list
      fetchUsers()
      
      $q.notify({
        color: 'positive',
        message: 'User created successfully',
        icon: 'check_circle'
      })
    }
    
    userDialog.show = false
  } catch (error) {
    console.error('Error saving user:', error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Failed to save user',
      icon: 'error'
    })
  } finally {
    userDialog.loading = false
  }
}

// Trigger image upload dialog
const triggerImageUpload = () => {
  imageInput.value.pickFiles()
}

// Handle image selection
const onImageSelected = (file) => {
  if (!file) return
  
  // Create preview URL
  userDialog.form.profileImagePreview = URL.createObjectURL(file)
}

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return date.formatDate(new Date(dateString), 'MMM D, YYYY')
}

const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'positive'
    case 'inactive':
      return 'grey'
    case 'pending':
      return 'warning'
    case 'blocked':
      return 'negative'
    default:
      return 'grey'
  }
}

const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'purple'
    case 'driver':
      return 'blue'
    case 'user':
      return 'green'
    default:
      return 'grey'
  }
}

const formatRole = (role) => {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const getImageUrl = (path) => {
  if (!path) return null
  
  // If path is a full URL, return it as is
  if (path.startsWith('http')) {
    return path
  }
  
  // Otherwise, prepend the API base URL
  return `${process.env.API_URL || 'http://localhost:5000'}${path}`
}
</script>