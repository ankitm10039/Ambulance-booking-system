<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-10">
        <!-- Help & Support Card -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h5">Help & Support</div>
            <div class="text-subtitle2 text-grey">Get assistance and support for your queries</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-card class="cursor-pointer" @click="openFAQ">
                  <q-card-section class="bg-primary text-white">
                    <div class="text-h6">
                      <q-icon name="help" class="q-mr-sm" />
                      Frequently Asked Questions
                    </div>
                  </q-card-section>
                  <q-card-section>
                    <div class="text-body1">Find answers to common questions about the platform, payments, and more.</div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-6">
                <q-card class="cursor-pointer" @click="openContactSupport">
                  <q-card-section class="bg-secondary text-white">
                    <div class="text-h6">
                      <q-icon name="contact_support" class="q-mr-sm" />
                      Contact Support
                    </div>
                  </q-card-section>
                  <q-card-section>
                    <div class="text-body1">Reach out to our support team for personalized assistance with your issues.</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- FAQ Section -->
        <q-card v-if="showFAQ" class="q-mb-md">
          <q-card-section>
            <div class="text-h6">Frequently Asked Questions</div>
          </q-card-section>

          <q-card-section>
            <q-list>
              <q-expansion-item
                v-for="(faq, index) in faqs"
                :key="index"
                :label="faq.question"
                header-class="text-primary"
                expand-separator
              >
                <q-card>
                  <q-card-section>
                    {{ faq.answer }}
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Contact Support Form -->
        <q-card v-if="showContactForm">
          <q-card-section>
            <div class="text-h6">Contact Support</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="submitSupportRequest" class="q-gutter-md">
              <q-select
                filled
                v-model="supportRequest.category"
                :options="supportCategories"
                label="Issue Category *"
                :rules="[val => !!val || 'Please select a category']"
              />

              <q-input
                filled
                v-model="supportRequest.subject"
                label="Subject *"
                :rules="[val => !!val || 'Please enter a subject']"
              />

              <q-input
                filled
                v-model="supportRequest.message"
                label="Message *"
                type="textarea"
                rows="5"
                :rules="[val => !!val || 'Please enter your message']"
              />

              <q-file
                filled
                v-model="supportRequest.attachments"
                label="Attachments (optional)"
                multiple
                accept=".jpg, .png, .pdf"
                max-files="3"
                max-file-size="5242880"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>

              <div class="row justify-end q-mt-md">
                <q-btn
                  label="Cancel"
                  color="grey"
                  flat
                  class="q-mr-sm"
                  @click="showContactForm = false"
                />
                <q-btn
                  type="submit"
                  label="Submit Request"
                  color="primary"
                  :loading="submitting"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Support Tickets -->
        <q-card>
          <q-card-section>
            <div class="text-h6">My Support Tickets</div>
          </q-card-section>

          <q-card-section>
            <q-table
              :rows="supportTickets"
              :columns="ticketColumns"
              row-key="_id"
              :loading="loading"
              :pagination="{ rowsPerPage: 5 }"
            >
              <template v-slot:loading>
                <q-inner-loading showing color="primary" />
              </template>

              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="getTicketStatusColor(props.value)"
                    text-color="white"
                    size="sm"
                  >
                    {{ props.value }}
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="visibility"
                    @click="viewTicketDetails(props.row)"
                  >
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>
                </q-td>
              </template>

              <template v-slot:no-data>
                <div class="full-width row flex-center q-pa-md text-grey">
                  <q-icon name="support" size="2rem" class="q-mr-sm" />
                  No support tickets found
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>

        <!-- Ticket Details Dialog -->
        <q-dialog v-model="showTicketDetails" persistent>
          <q-card style="min-width: 350px; max-width: 700px;">
            <q-card-section class="row items-center">
              <div class="text-h6">Ticket Details</div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section v-if="selectedTicket">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 q-mb-xs">Ticket ID</div>
                  <div class="text-body2 q-mb-md">{{ selectedTicket._id }}</div>

                  <div class="text-subtitle2 q-mb-xs">Date Created</div>
                  <div class="text-body2 q-mb-md">{{ formatDate(selectedTicket.createdAt) }}</div>

                  <div class="text-subtitle2 q-mb-xs">Status</div>
                  <q-chip
                    :color="getTicketStatusColor(selectedTicket.status)"
                    text-color="white"
                    class="q-mb-md"
                  >
                    {{ selectedTicket.status }}
                  </q-chip>
                </div>

                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 q-mb-xs">Category</div>
                  <div class="text-body2 q-mb-md">{{ selectedTicket.category }}</div>

                  <div class="text-subtitle2 q-mb-xs">Subject</div>
                  <div class="text-body2 q-mb-md">{{ selectedTicket.subject }}</div>

                  <div class="text-subtitle2 q-mb-xs">Last Updated</div>
                  <div class="text-body2 q-mb-md">{{ formatDate(selectedTicket.updatedAt) }}</div>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 q-mb-xs">Message</div>
              <div class="text-body2 q-mb-md">{{ selectedTicket.message }}</div>

              <div v-if="selectedTicket.responses && selectedTicket.responses.length > 0">
                <div class="text-subtitle2 q-mb-xs">Responses</div>
                <q-timeline color="secondary">
                  <q-timeline-entry
                    v-for="(response, index) in selectedTicket.responses"
                    :key="index"
                    :title="response.from"
                    :subtitle="formatDate(response.timestamp)"
                  >
                    <div>{{ response.message }}</div>
                  </q-timeline-entry>
                </q-timeline>
              </div>

              <q-separator class="q-my-md" />

              <div v-if="selectedTicket.status !== 'closed'">
                <div class="text-subtitle2 q-mb-xs">Add Response</div>
                <q-input
                  v-model="ticketResponse"
                  type="textarea"
                  rows="3"
                  filled
                  label="Your response"
                />
                <div class="row justify-end q-mt-sm">
                  <q-btn
                    color="primary"
                    label="Send"
                    @click="addTicketResponse"
                    :loading="submitting"
                  />
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                v-if="selectedTicket && selectedTicket.status !== 'closed'"
                flat
                label="Close Ticket"
                color="negative"
                @click="closeTicket"
              />
              <q-btn flat label="Done" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useDriverStore } from 'stores/driver'
import { date, useQuasar } from 'quasar'

const $q = useQuasar()
const driverStore = useDriverStore()
const loading = computed(() => driverStore.loading)
const supportTickets = computed(() => driverStore.supportTickets)

const showFAQ = ref(false)
const showContactForm = ref(false)
const showTicketDetails = ref(false)
const selectedTicket = ref(null)
const ticketResponse = ref('')
const submitting = ref(false)

const supportRequest = reactive({
  category: null,
  subject: '',
  message: '',
  attachments: null
})

const supportCategories = [
  'Account Issues',
  'Payment Problems',
  'App Functionality',
  'Trip Issues',
  'Vehicle Problems',
  'Other'
]

const faqs = [
  {
    question: 'How do I update my profile information?',
    answer: 'You can update your profile information by navigating to your profile page and clicking on the "Edit Profile" button. From there, you can update your personal details, contact information, and profile picture.'
  },
  {
    question: 'How are my earnings calculated?',
    answer: 'Your earnings are calculated based on the base fare, distance traveled, time taken, and any applicable surge pricing. The platform fee is deducted from the total fare, and the remaining amount is credited to your account.'
  },
  {
    question: 'When will I receive my payments?',
    answer: 'Payments are processed weekly. The earnings accumulated from Monday to Sunday are processed on Monday and typically credited to your bank account within 2-3 business days.'
  },
  {
    question: 'What should I do if there\'s an emergency during a trip?',
    answer: 'In case of an emergency during a trip, you should first ensure the safety of the patient and yourself. Contact emergency services if needed, and then notify our support team through the emergency button in the app.'
  },
  {
    question: 'How do I report issues with the app?',
    answer: 'You can report any issues with the app by going to the Help & Support section and creating a new support ticket. Select "App Functionality" as the category and provide details about the issue you\'re experiencing.'
  },
  {
    question: 'Can I cancel an accepted trip?',
    answer: 'While it\'s possible to cancel an accepted trip, frequent cancellations may affect your driver rating. If you must cancel, provide a valid reason through the app. Emergency cancellations won\'t affect your rating.'
  }
]

const ticketColumns = [
  {
    name: 'createdAt',
    required: true,
    label: 'Date',
    align: 'left',
    field: 'createdAt',
    format: val => formatDate(val),
    sortable: true
  },
  {
    name: 'ticketId',
    required: true,
    label: 'Ticket ID',
    align: 'left',
    field: '_id',
    sortable: true
  },
  {
    name: 'category',
    required: true,
    label: 'Category',
    align: 'left',
    field: 'category',
    sortable: true
  },
  {
    name: 'subject',
    required: true,
    label: 'Subject',
    align: 'left',
    field: 'subject'
  },
  {
    name: 'status',
    required: true,
    label: 'Status',
    align: 'left',
    field: 'status',
    sortable: true
  },
  {
    name: 'actions',
    required: true,
    label: 'Actions',
    align: 'center',
    field: 'actions'
  }
]

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return date.formatDate(new Date(dateString), 'MMM D, YYYY h:mm A')
}

// Get ticket status color
const getTicketStatusColor = (status) => {
  switch (status) {
    case 'open':
      return 'blue'
    case 'in-progress':
      return 'orange'
    case 'resolved':
      return 'green'
    case 'closed':
      return 'grey'
    default:
      return 'grey'
  }
}

// Open FAQ section
const openFAQ = () => {
  showFAQ.value = true
  showContactForm.value = false
}

// Open contact support form
const openContactSupport = () => {
  showContactForm.value = true
  showFAQ.value = false
}

// Submit support request
const submitSupportRequest = async () => {
  try {
    submitting.value = true
    
    // Prepare form data for file uploads
    const formData = new FormData()
    formData.append('category', supportRequest.category)
    formData.append('subject', supportRequest.subject)
    formData.append('message', supportRequest.message)
    
    if (supportRequest.attachments) {
      for (let i = 0; i < supportRequest.attachments.length; i++) {
        formData.append('attachments', supportRequest.attachments[i])
      }
    }
    
    await driverStore.createSupportTicket(formData)
    
    // Reset form
    supportRequest.category = null
    supportRequest.subject = ''
    supportRequest.message = ''
    supportRequest.attachments = null
    
    showContactForm.value = false
    
    $q.notify({
      type: 'positive',
      message: 'Support ticket created successfully'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to create support ticket'
    })
  } finally {
    submitting.value = false
  }
}

// View ticket details
const viewTicketDetails = (ticket) => {
  selectedTicket.value = ticket
  showTicketDetails.value = true
  ticketResponse.value = ''
}

// Add response to ticket
const addTicketResponse = async () => {
  if (!ticketResponse.value.trim()) {
    $q.notify({
      type: 'warning',
      message: 'Please enter a response'
    })
    return
  }
  
  try {
    submitting.value = true
    
    await driverStore.addTicketResponse({
      ticketId: selectedTicket.value._id,
      message: ticketResponse.value
    })
    
    // Update the selected ticket with the new response
    const updatedTicket = supportTickets.value.find(t => t._id === selectedTicket.value._id)
    if (updatedTicket) {
      selectedTicket.value = updatedTicket
    }
    
    ticketResponse.value = ''
    
    $q.notify({
      type: 'positive',
      message: 'Response added successfully'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to add response'
    })
  } finally {
    submitting.value = false
  }
}

// Close ticket
const closeTicket = async () => {
  try {
    submitting.value = true
    
    await driverStore.closeTicket(selectedTicket.value._id)
    
    // Update the selected ticket status
    selectedTicket.value.status = 'closed'
    
    $q.notify({
      type: 'positive',
      message: 'Ticket closed successfully'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to close ticket'
    })
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await driverStore.fetchSupportTickets()
})
</script>