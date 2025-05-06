const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // Auth routes
      {
        path: '',
        name: 'login',
        component: () => import('pages/auth/LoginPage.vue')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('pages/auth/RegisterPage.vue')
      },

      // User routes
      {
        path: 'user',
        children: [
          {
            path: 'dashboard',
            name: 'user-dashboard',
            component: () => import('pages/user/UserDashboard.vue')
          },
          {
            path: 'request-ambulance',
            name: 'request-ambulance',
            component: () => import('pages/user/RequestAmbulance.vue')
          },
          {
            path: 'track-ambulance/:id',
            name: 'track-ambulance',
            component: () => import('pages/user/TrackAmbulance.vue')
          }
        ]
      },

      // Driver routes
      {
        path: 'driver',
        children: [
          {
            path: 'dashboard',
            name: 'driver-dashboard',
            component: () => import('pages/driver/DriverDashboard.vue')
          },
          {
            path: 'trip-history',
            name: 'driver-trip-history',
            component: () => import('pages/driver/TripHistoryPage.vue')
          },
          {
            path: 'earnings',
            name: 'driver-earnings',
            component: () => import('pages/driver/EarningsPage.vue')
          },
          {
            path: 'help-support',
            name: 'driver-help-support',
            component: () => import('pages/driver/HelpSupportPage.vue')
          },
          {
            path: 'profile',
            name: 'driver-profile',
            component: () => import('pages/driver/DriverProfile.vue')
          }
        ]
      },

      // Admin routes
      {
        path: 'admin',
        component: () => import('layouts/AdminLayout.vue'),
        meta: { requiresAuth: true, role: 'admin' },
        beforeEnter: (to, from, next) => {
          const userRole = localStorage.getItem('userRole')
          if (userRole !== 'admin') {
            next('/')
          } else {
            next()
          }
        },
        children: [
          {
            path: '',
            redirect: { name: 'admin-dashboard' }
          },
          {
            path: 'dashboard',
            name: 'admin-dashboard',
            component: () => import('pages/admin/AdminDashboard.vue')
          },
          {
            path: 'drivers',
            name: 'admin-drivers',
            component: () => import('pages/admin/DriversManagement.vue')
          },
          {
            path: 'vehicles',
            name: 'admin-vehicles',
            component: () => import('pages/admin/VehiclesManagement.vue')
          },
          {
            path: 'bookings',
            name: 'admin-bookings',
            component: () => import('pages/admin/BookingsManagement.vue')
          },
          {
            path: 'users',
            name: 'admin-users',
            component: () => import('pages/admin/UsersManagement.vue')
          },
          {
            path: 'reports',
            name: 'admin-reports',
            component: () => import('pages/admin/ReportsPage.vue')
          },
          {
            path: 'settings',
            name: 'admin-settings',
            component: () => import('pages/admin/SettingsPage.vue')
          },
          {
            path: 'profile',
            name: 'admin-profile',
            component: () => import('pages/admin/AdminProfile.vue')
          }
        ]
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
