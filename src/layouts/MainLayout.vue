<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white" v-if="isLoggedIn && (userRole === 'driver' || userRole === 'user')">
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
          <div class="flex items-center">
            <q-icon name="local_hospital" color="white" size="28px" class="q-mr-sm" />
            Ambulance Booking System
          </div>
        </q-toolbar-title>

        <q-btn-dropdown flat icon="person">
          <q-list>
            <q-item clickable v-close-popup @click="handleProfile">
              <q-item-section avatar>
                <q-icon name="account_circle" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Profile</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="handleLogout">
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
      v-if="isLoggedIn && !isAuthRoute && userRole !== 'admin'"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <div class="flex items-center">
          <q-icon name="local_hospital" color="primary" size="40px" />
          <q-item-label header class="q-ml-md">
            Ambulance Booking System
          </q-item-label>
        </div>

        <!-- User Menu Items -->
        <template v-if="userRole === 'user'">
          <q-item
            clickable
            v-ripple
            to="/user/dashboard"
            exact
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/user/request-ambulance"
            exact
            active-class="bg-indigo-10 text-white"
          >
            <q-item-section avatar>
              <q-icon name="local_taxi" />
            </q-item-section>
            <q-item-section>Request Ambulance</q-item-section>
          </q-item>
        </template>

        <!-- Driver Menu Items -->
        <template v-if="userRole === 'driver'">
          <q-item
            clickable
            v-ripple
            to="/driver/dashboard"
            exact
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/driver/trip-history"
            exact
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="history" />
            </q-item-section>
            <q-item-section>Trip History</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/driver/earnings"
            exact
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="account_balance_wallet" />
            </q-item-section>
            <q-item-section>Earnings</q-item-section>
          </q-item>
        </template>

        <!-- Common Menu Items -->
        <q-separator />

        <q-item
          clickable
          v-ripple
          to="/driver/help-support"
          exact
          active-class="bg-primary text-white"
          v-if="userRole === 'driver'"
        >
          <q-item-section avatar>
            <q-icon name="help" />
          </q-item-section>
          <q-item-section>Help & Support</q-item-section>
        </q-item>
        
        <q-item
          clickable
          v-ripple
          active-class="bg-primary text-white"
          v-if="userRole === 'user'"
        >
          <q-item-section avatar>
            <q-icon name="help" />
          </q-item-section>
          <q-item-section>Help & Support</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const leftDrawerOpen = ref(false)
const isLoggedIn = computed(() => authStore.isAuthenticated)
const userRole = computed(() => authStore.userRole)

// Check if current route is an auth route (login/register)
const isAuthRoute = computed(() => {
  return route.path === '/' || route.path === '/register'
})

// Redirect admin users to admin layout
const redirectAdminToAdminLayout = () => {
  if (isLoggedIn.value && userRole.value === 'admin' && !route.path.startsWith('/admin')) {
    router.push('/admin/dashboard')
  }
}

// Watch for changes in authentication state and user role
watch([isLoggedIn, userRole], () => {
  redirectAdminToAdminLayout()
})

// Check on component mount
onMounted(() => {
  redirectAdminToAdminLayout()
})

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const handleProfile = () => {
  // Handle profile navigation based on user role
  switch (userRole.value) {
    case 'user':
      router.push('/user/dashboard')
      break
    case 'driver':
      router.push('/driver/profile')
      break
    case 'admin':
      router.push('/admin/dashboard')
      break
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>
