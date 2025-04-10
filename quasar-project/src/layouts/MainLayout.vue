<template>
  <q-layout view="lHh Lpr lFf">
 
    <q-drawer
      v-if="isLoggedIn && !isAuthRoute && userRole !== 'admin'"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          Navigation
        </q-item-label>

        <!-- User Menu Items -->
        <template v-if="userRole === 'user'">
          <q-item
            clickable
            v-ripple
            to="/user/dashboard"
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
          >
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="history" />
            </q-item-section>
            <q-item-section>Trip History</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
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
      router.push('/driver/dashboard')
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
