<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Ambulance Booking System - Admin Panel
        </q-toolbar-title>

        <q-btn-dropdown flat icon="person">
          <q-list>
            <q-item clickable v-close-popup @click="viewProfile">
              <q-item-section avatar>
                <q-icon name="account_circle" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Profile</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="logout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Logout</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-1"
    >
      <q-list>
        <q-item-label header>Admin Navigation</q-item-label>

        <q-item clickable v-ripple :to="{ name: 'admin-dashboard' }" exact>
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'admin-drivers' }" exact>
          <q-item-section avatar>
            <q-icon name="drive_eta" />
          </q-item-section>
          <q-item-section>Drivers</q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'admin-vehicles' }" exact>
          <q-item-section avatar>
            <q-icon name="local_taxi" />
          </q-item-section>
          <q-item-section>Vehicles</q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'admin-bookings' }" exact>
          <q-item-section avatar>
            <q-icon name="book_online" />
          </q-item-section>
          <q-item-section>Bookings</q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'admin-users' }" exact>
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>User Management</q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable v-ripple :to="{ name: 'admin-reports' }" exact>
          <q-item-section avatar>
            <q-icon name="assessment" />
          </q-item-section>
          <q-item-section>Reports</q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'admin-settings' }" exact>
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Settings</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const leftDrawerOpen = ref(false)

const userRole = computed(() => authStore.userRole)
const isLoggedIn = computed(() => authStore.isAuthenticated)

// Ensure only admin users can access this layout
const checkAdminAccess = () => {
  if (!isLoggedIn.value) {
    router.push('/')
    return
  }
  
  if (userRole.value !== 'admin') {
    // Redirect non-admin users to their appropriate dashboard
    switch (userRole.value) {
      case 'driver':
        router.push('/driver/dashboard')
        break
      case 'user':
        router.push('/user/dashboard')
        break
      default:
        router.push('/')
    }
  }
}

// Check on component mount
onMounted(() => {
  checkAdminAccess()
})

// Watch for changes in authentication state and user role
watch([isLoggedIn, userRole], () => {
  checkAdminAccess()
})

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const viewProfile = () => {
  router.push({ name: 'admin-profile' })
}

const logout = async () => {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>