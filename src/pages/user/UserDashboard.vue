<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- User Profile Section -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-center">
              <q-avatar size="100px">
                <img src="https://cdn.quasar.dev/img/avatar.png">
              </q-avatar>
              <div class="text-h6 q-mt-sm">{{ userProfile.name }}</div>
              <div class="text-subtitle2">{{ userProfile.email }}</div>
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
                />
              </div>
              <div class="col-6">
                <q-btn
                  flat
                  color="negative"
                  class="full-width"
                  icon="warning"
                  label="Emergency"
                  @click="requestEmergency"
                />
              </div>
            </div>
          </q-card-section>

          <q-list>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="person" color="primary" />
              </q-item-section>
              <q-item-section>Personal Information</q-item-section>
            </q-item>

            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="history" color="primary" />
              </q-item-section>
              <q-item-section>Booking History</q-item-section>
            </q-item>

            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="payment" color="primary" />
              </q-item-section>
              <q-item-section>Payment Methods</q-item-section>
            </q-item>

            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="settings" color="primary" />
              </q-item-section>
              <q-item-section>Settings</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Recent Bookings Section -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6">Recent Bookings</div>
          </q-card-section>

          <q-card-section>
            <q-list separator>
              <q-item v-for="booking in recentBookings" :key="booking.id">
                <q-item-section>
                  <q-item-label>{{ booking.date }}</q-item-label>
                  <q-item-label caption>
                    From: {{ booking.pickup }}
                    <br>
                    To: {{ booking.destination }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="text-grey-8">
                    <q-chip
                      :color="getStatusColor(booking.status)"
                      text-color="white"
                      size="sm"
                    >
                      {{ booking.status }}
                    </q-chip>
                  </div>
                  <q-btn
                    flat
                    color="primary"
                    label="View Details"
                    @click="viewBookingDetails(booking.id)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Quick Actions -->
        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-md-6">
            <q-card class="text-center">
              <q-card-section>
                <q-icon name="local_taxi" size="50px" color="primary" />
                <div class="text-h6 q-mt-sm">Request Ambulance</div>
                <q-btn
                  color="primary"
                  label="Book Now"
                  class="q-mt-sm"
                  @click="$router.push('/user/request-ambulance')"
                />
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-6">
            <q-card class="text-center">
              <q-card-section>
                <q-icon name="support_agent" size="50px" color="primary" />
                <div class="text-h6 q-mt-sm">Support</div>
                <q-btn
                  color="primary"
                  label="Contact Us"
                  class="q-mt-sm"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock user profile data
const userProfile = ref({
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890'
})

// Mock booking data
const recentBookings = ref([
  {
    id: 1,
    date: '2024-04-08 14:30',
    pickup: '123 Main St',
    destination: 'City Hospital',
    status: 'Completed'
  },
  {
    id: 2,
    date: '2024-04-07 09:15',
    pickup: '456 Park Ave',
    destination: 'General Hospital',
    status: 'In Progress'
  },
  {
    id: 3,
    date: '2024-04-06 18:45',
    pickup: '789 Oak Rd',
    destination: 'Emergency Care Center',
    status: 'Cancelled'
  }
])

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed':
      return 'positive'
    case 'In Progress':
      return 'warning'
    case 'Cancelled':
      return 'negative'
    default:
      return 'grey'
  }
}

const requestEmergency = () => {
  router.push('/user/request-ambulance');
}

const viewBookingDetails = (bookingId) => {
  console.log('Viewing booking:', bookingId)
  // Implement booking details view
}
</script>