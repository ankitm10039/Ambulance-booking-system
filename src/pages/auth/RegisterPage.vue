<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="row justify-center items-center full-width q-py-lg">
      <div class="col-12 col-sm-8 col-md-6">
        <div class="text-center q-mb-xl">
          <img src="~assets/ambulance-logo.svg" style="width: 150px; height: auto;" alt="Logo">
          <h4 class="text-h4 text-weight-bold text-primary q-mt-md q-mb-none">Create Account</h4>
          <p class="text-grey-7 q-mt-sm">Join us and start saving lives</p>
        </div>

        <q-card flat bordered class="q-pa-lg shadow-3">
          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="firstName"
                    label="First Name"
                    outlined
                    :rules="[val => !!val || 'First name is required']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="eva-person-outline" color="primary" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-6">
                  <q-input
                    v-model="lastName"
                    label="Last Name"
                    outlined
                    :rules="[val => !!val || 'Last name is required']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="eva-person-outline" color="primary" />
                    </template>
                  </q-input>
                </div>
              </div>

              <q-input
                v-model="email"
                label="Email"
                type="email"
                outlined
                :rules="[
                  val => !!val || 'Email is required',
                  val => /^[^@]+@[^@]+\.[^@]+$/.test(val) || 'Invalid email format'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="eva-email-outline" color="primary" />
                </template>
              </q-input>

              <q-input
                v-model="phone"
                label="Phone Number"
                outlined
                mask="(###) ###-####"
                :rules="[val => !!val || 'Phone number is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="eva-phone-outline" color="primary" />
                </template>
              </q-input>

              
              <q-select
                v-model="userRole"
                :options="[
                  { label: 'User', value: 'user' },
                  { label: 'Admin', value: 'admin' },
                  { label: 'Driver', value: 'driver' }
                ]"
                label="Select Role"
                outlined
                :rules="[val => !!val || 'Please select a role']"
              >
                <template v-slot:prepend>
                  <q-icon name="person_outline" color="primary" />
                </template>
              </q-select>

              <q-input
                v-model="password"
                label="Password"
                :type="isPwd ? 'password' : 'text'"
                outlined
                :rules="[
                  val => !!val || 'Password is required',
                  val => val.length >= 8 || 'Password must be at least 8 characters',
                  val => /[A-Z]/.test(val) || 'Password must contain at least one uppercase letter',
                  val => /[0-9]/.test(val) || 'Password must contain at least one number'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="eva-lock-outline" color="primary" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'eva-eye-off-outline' : 'eva-eye-outline'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>

              <q-input
                v-model="confirmPassword"
                label="Confirm Password"
                :type="isPwd ? 'password' : 'text'"
                outlined
                :rules="[
                  val => !!val || 'Please confirm your password',
                  val => val === password || 'Passwords do not match'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="eva-lock-outline" color="primary" />
                </template>
              </q-input>

              <div class="q-mt-md">
                <q-checkbox
                  v-model="acceptTerms"
                  label="I agree to the Terms of Service and Privacy Policy"
                  color="primary"
                  :rules="[val => val || 'You must agree to the terms']"
                />
              </div>

              <q-btn
                type="submit"
                color="primary"
                class="full-width q-py-sm q-mt-lg text-weight-bold"
                size="lg"
                :loading="loading"
              >
                <template v-slot:default>
                  Create Account
                </template>
                <template v-slot:loading>
                  <q-spinner-dots />
                </template>
              </q-btn>

              <div class="text-center q-mt-sm">
                Already have an account?
                <q-btn
                  flat
                  color="primary"
                  label="Sign In"
                  class="q-ml-sm text-weight-bold"
                  to="/"
                />
              </div>

              <!-- Social Registration -->
              <div class="q-mt-lg">
                <div class="row items-center q-mb-md">
                  <div class="col"><q-separator /></div>
                  <div class="col-auto q-px-md text-grey">Or register with</div>
                  <div class="col"><q-separator /></div>
                </div>

                <div class="row q-col-gutter-sm">
                  <div class="col-4">
                    <q-btn
                      outline
                      color="primary"
                      class="full-width"
                      icon="fab fa-google"
                      label="Google"
                    />
                  </div>
                  <div class="col-4">
                    <q-btn
                      outline
                      color="primary"
                      class="full-width"
                      icon="fab fa-facebook"
                      label="Facebook"
                    />
                  </div>
                  <div class="col-4">
                    <q-btn
                      outline
                      color="primary"
                      class="full-width"
                      icon="fab fa-apple"
                      label="Apple"
                    />
                  </div>
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const isPwd = ref(true)
const acceptTerms = ref(false)
const loading = ref(false)

const userRole = ref('')

const onSubmit = async () => {
  try {
    loading.value = true
    const userData = {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      phone: phone.value,
      password: password.value,
      role: userRole.value // यूज़र रोल को रजिस्ट्रेशन डेटा में शामिल करें
    }
    
    await authStore.register(userData)
    $q.notify({
      type: 'positive',
      message: 'Registration successful!'
    })
    router.push('/login')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Registration failed. Please try again.',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.q-card {
  border-radius: 12px;
  background: white;
}

.q-btn {
  border-radius: 8px;
}

.q-input {
  .q-field__control {
    border-radius: 8px;
  }
}
</style>