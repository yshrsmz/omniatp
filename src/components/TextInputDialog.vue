<script setup lang="ts">
import { ref } from 'vue'
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'
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

const handleClose = () => {
  if (props.cancelable) {
    emit('update:show', false)
  }
}

const onSave = () => {
  emit('update:show', false)
  emit('update:text', textRef.value)
  textRef.value = ''
}
</script>

<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog
      as="div"
      :static="!cancelable"
      class="TwitterPinCodeDialog relative z-10"
      @close="handleClose"
    >
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
      s
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
                  class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mr-2"
                  @click="emit('update:show', false)"
                >
                  CLOSE
                </button>
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="onSave"
                >
                  SAVE
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
