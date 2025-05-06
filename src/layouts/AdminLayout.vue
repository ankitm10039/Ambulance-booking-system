<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-teal-7 text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title color="teal-9">
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
    <div class="q-pa-md flex items-center  bg-transparent text-center">
      <q-avatar size="110px" class="q-mb-sm q-mx-auto">
        <img src="~assets/ambulance.png" alt="User Avatar" />
      </q-avatar>
      <div class="q-ml-sm">
        <div class="text-h6">Ambulance Booking System</div>
        <div class="text-caption">Admin Pannel</div>
      </div>
    </div>

    

    <q-separator />
      <q-list>
        <!-- <div class="flex items-center">
          <img src="~assets/ambulance.png" style="width: 40px; height: auto;" alt="Ambulance Logo" />
          <q-item-label header class="q-ml-md">Ambulance Booking System</q-item-label>
        </div> -->

        <q-item 
          clickable 
          v-ripple 
          :to="{ name: 'admin-dashboard' }" 
          exact
          active-class="bg-teal-7 text-white"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item 
          clickable 
          v-ripple 
          :to="{ name: 'admin-drivers' }" 
          exact
          active-class="bg-teal-7 text-white"
        >
          <q-item-section avatar>
            <q-icon name="drive_eta" />
          </q-item-section>
          <q-item-section>Drivers</q-item-section>
        </q-item>

        <q-item 
          clickable 
          v-ripple 
          :to="{ name: 'admin-vehicles' }" 
          exact
          active-class="bg-teal-7 text-white"
        >
          <q-item-section avatar>
            <q-icon name="local_taxi" />
          </q-item-section>
          <q-item-section>Vehicles</q-item-section>
        </q-item>

        <q-item 
          clickable 
          v-ripple 
          :to="{ name: 'admin-bookings' }" 
          exact
          active-class="bg-teal-7 text-white"
        >
          <q-item-section avatar>
            <q-icon name="book_online" />
          </q-item-section>
          <q-item-section>Bookings</q-item-section>
        </q-item>

        <q-item 
          clickable 
          v-ripple 
          :to="{ name: 'admin-users' }" 
          exact
          active-class="bg-teal-7 text-white"
        >
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>User Management</q-item-section>
        </q-item>

        <q-separator />

        <q-item 
          clickable 
          v-ripple 
          :to="{ name: 'admin-reports' }" 
          exact
          active-class="bg-teal-7 text-white"
        >
          <q-item-section avatar>
            <q-icon name="assessment" />
          </q-item-section>
          <q-item-section>Reports</q-item-section>
        </q-item>

        <q-item 
          clickable 
          v-ripple 
          :to="{ name: 'admin-settings' }" 
          exact
          active-class="bg-teal-7 text-white"
        >
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