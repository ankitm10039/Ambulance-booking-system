<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="row justify-center items-center full-width">
      <div class="col-12 col-sm-8 col-md-4">
        <div class="text-center q-mb-xl">
          <img src="~assets/ambulance-logo.svg" style="width: 150px; height: auto;" alt="Logo">
          <h4 class="text-h4 text-weight-bold text-primary q-mt-md q-mb-none">Welcome Back</h4>
          <p class="text-grey-7 q-mt-sm">Sign in to continue to your account</p>
        </div>

        <q-card flat bordered class="q-pa-lg shadow-3">
          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <q-input
                v-model="email"
                label="Email"
                type="email"
                class="q-mb-md"
                outlined
                :rules="[val => !!val || 'Email is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="eva-email-outline" color="primary" />
                </template>
              </q-input>

              <q-input
                v-model="password"
                label="Password"
                :type="isPwd ? 'password' : 'text'"
                outlined
                :rules="[val => !!val || 'Password is required']"
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

              <div class="row items-center justify-between q-mt-md">
                <q-checkbox v-model="rememberMe" label="Remember me" color="primary" />
                <q-btn flat color="primary" label="Forgot Password?" class="text-caption" />
              </div>

              <q-btn
                type="submit"
                color="primary"
                class="full-width q-py-sm q-mt-lg text-weight-bold"
                size="lg"
                :loading="loading"
              >
                <template v-slot:default>
                  Sign In
                </template>
                <template v-slot:loading>
                  <q-spinner-dots />
                </template>
              </q-btn>

              <div class="text-center q-mt-sm">
                Don't have an account?
                <q-btn
                  flat
                  color="primary"
                  label="Sign Up"
                  class="q-ml-sm text-weight-bold"
                  to="/register"
                />
              </div>

              <!-- Social Login -->
              <div class="q-mt-lg">
                <div class="row items-center q-mb-md">
                  <div class="col"><q-separator /></div>
                  <div class="col-auto q-px-md text-grey">Or continue with</div>
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

const email = ref('')
const password = ref('')
const isPwd = ref(true)
const rememberMe = ref(false)
const loading = ref(false)

const onSubmit = async () => {
  try {
    loading.value = true
    const success = await authStore.login({
      email: email.value,
      password: password.value
    })

    if (success) {
      const role = authStore.userRole
      let redirectPath = '/user/dashboard'
      
      if (role === 'admin') {
        redirectPath = '/admin/dashboard'
      } else if (role === 'driver') {
        redirectPath = '/driver/dashboard'
      }

      $q.notify({
        type: 'positive',
        message: 'Login successful!',
        position: 'top'
      })

      router.push(redirectPath)
    } else {
      throw new Error('Login failed')
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Invalid email or password',
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