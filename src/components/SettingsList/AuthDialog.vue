<script setup lang="ts">
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'
import TextField from '../forms/TextField.vue'
import { ref } from 'vue'

defineProps<{ show: boolean; service: string }>()

const emit = defineEmits<{
  (event: 'update:show', value: boolean): void
  (event: 'submit'): void
}>()

const passwordRef = ref('')
const handleRef = ref('')

const handleCancel = () => {
  emit('update:show', false)
}
const handleFormSubmit = () => {
  console.log('form submitted')
}
</script>

<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" :static="true" class="TwitterPinCodeDialog relative z-10">
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
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900"
              >
                Login to Bluesky
              </DialogTitle>
              <form
                method="post"
                class="space-y-6 mt-6"
                @submit.prevent="handleFormSubmit"
              >
                <TextField
                  type="text"
                  name="service"
                  title="Service"
                  readonly
                  :value="service"
                />
                <TextField
                  v-model:value="handleRef"
                  type="text"
                  name="handle"
                  title="Handle"
                />
                <TextField
                  v-model:value="passwordRef"
                  type="password"
                  name="password"
                  title="Password"
                />

                <div class="mt-6 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    class="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    @click="handleCancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
