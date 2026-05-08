<script setup lang="ts">
import { ref } from 'vue'
import { DialogPanel, DialogTitle } from '@headlessui/vue'
import BaseDialog from './BaseDialog.vue'
import TextField from './forms/TextField.vue'

const props = withDefaults(
  defineProps<{
    show: boolean
    text: string
    title: string
    name: string
    type: string
    label: string
    placeholder?: string
    cancelable?: boolean
  }>(),
  {
    placeholder: undefined,
    cancelable: true,
  }
)

const emit = defineEmits<{
  (event: 'update:show', value: boolean): void
  (event: 'update:text', value: string): void
}>()

const textRef = ref(props.text)

const onSave = () => {
  emit('update:show', false)
  emit('update:text', textRef.value)
  textRef.value = ''
}
</script>

<template>
  <BaseDialog
    :show="show"
    :static="!cancelable"
    @update:show="emit('update:show', $event)"
  >
    <DialogPanel
      class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
    >
      <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
        {{ title }}
      </DialogTitle>
      <div class="mt-2">
        <TextField
          v-model:value="textRef"
          :title="title"
          :name="name"
          :type="type"
          :label="label"
          :placeholder="placeholder"
        />
      </div>

      <div class="mt-4">
        <button
          v-if="cancelable"
          type="button"
          class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mr-2"
          @click="emit('update:show', false)"
        >
          CLOSE
        </button>
        <button
          type="button"
          class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          @click="onSave"
        >
          SAVE
        </button>
      </div>
    </DialogPanel>
  </BaseDialog>
</template>
