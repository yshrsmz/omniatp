<script setup lang="ts">
import { DialogPanel, DialogTitle } from '@headlessui/vue'
import BaseDialog from '../BaseDialog.vue'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (event: 'update:show', value: boolean): void
  (event: 'signout'): void
}>()

const handleSignOutClick = () => {
  emit('signout')
  emit('update:show', false)
}

const handleCloseClick = () => {
  emit('update:show', false)
}
</script>

<template>
  <BaseDialog :show="show" @update:show="emit('update:show', $event)">
    <DialogPanel
      class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
    >
      <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
        Confirm
      </DialogTitle>
      <div class="mt-2">
        <p class="text-sm text-gray-500">Are you sure to sign out?</p>
      </div>

      <div class="mt-4">
        <button
          type="button"
          class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mr-2"
          @click="handleCloseClick"
        >
          CLOSE
        </button>
        <button
          type="button"
          class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          @click="handleSignOutClick"
        >
          Sign out
        </button>
      </div>
    </DialogPanel>
  </BaseDialog>
</template>
