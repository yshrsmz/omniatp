<script setup lang="ts">
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'
import { ExclamationCircleIcon } from '@heroicons/vue/20/solid'
import TextField from '../forms/TextField.vue'
import { computed, ref } from 'vue'
import { suite, LoginCredential } from '../../data/model/LoginCredential'
import { AuthProgress } from '../../data/model/AuthProgress'
import LoadingSpinner from '../LoadingSpinner.vue'

const props = defineProps<{
  show: boolean
  service: string
  progress: AuthProgress
}>()

const emit = defineEmits<{
  (event: 'update:show', value: boolean): void
  (event: 'signin', value: LoginCredential): void
}>()

const identifierRef = ref('')
const passwordRef = ref('')

const identifierErrorRef = ref('')
const passwordErrorRef = ref('')

const canSubmit = ref(false)

const shouldDisableInput = computed(() => props.progress.type === 'IN_PROGRESS')

console.log('SignInDialog', identifierRef.value, passwordRef.value)

const handleCancel = () => {
  emit('update:show', false)
}

const handleFormInput = () => {
  const result = suite({
    identifier: identifierRef.value,
    password: passwordRef.value,
  })

  if (result.hasErrors('identifier')) {
    identifierErrorRef.value = result.getErrors('identifier').join(', ')
  } else {
    identifierErrorRef.value = ''
  }

  if (result.hasErrors('password')) {
    passwordErrorRef.value = result.getErrors('password').join(', ')
  } else {
    passwordErrorRef.value = ''
  }

  canSubmit.value = result.isValid()
}

const handleFormSubmit = () => {
  const credential = {
    identifier: identifierRef.value,
    password: passwordRef.value,
  } satisfies LoginCredential

  const result = suite(credential)

  if (result.isValid()) {
    emit('signin', credential)
  }
}
</script>

<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" :static="true" class="SignInDialog relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900"
              >
                Login to Bluesky
              </DialogTitle>
              <form
                method="post"
                class="space-y-1 mt-6"
                @submit.prevent="handleFormSubmit"
                @input="handleFormInput"
              >
                <TextField
                  type="text"
                  name="service"
                  title="Service"
                  readonly
                  disabled
                  :value="service"
                />
                <TextField
                  v-model:value="identifierRef"
                  type="text"
                  name="identifier"
                  title="Identifier"
                  placeholder="your@email.address, @your_handle, or did:plc:yourdid"
                  :disabled="shouldDisableInput"
                  :error="identifierErrorRef"
                />
                <TextField
                  v-model:value="passwordRef"
                  type="password"
                  name="password"
                  title="Password"
                  :disabled="shouldDisableInput"
                  :error="passwordErrorRef"
                />
                <p v-if="progress.type === 'ERROR'" class="flex flex-row">
                  <ExclamationCircleIcon
                    class="h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                  <span class="text-sm text-red-600 ml-2">{{
                    progress.message
                  }}</span>
                </p>
                <div class="!mt-6 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    :disabled="shouldDisableInput"
                    class="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    @click="handleCancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="!canSubmit || shouldDisableInput"
                    class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                  >
                    Sign in
                  </button>
                </div>
              </form>
              <div
                v-if="progress.type === 'IN_PROGRESS'"
                class="fixed inset-0 block h-full w-full bg-gray-500 opacity-60"
              >
                <div class="flex min-h-full justify-center items-center">
                  <LoadingSpinner class="m-auto" />
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
