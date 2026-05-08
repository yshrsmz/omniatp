<script setup lang="ts">
import { TransitionRoot, TransitionChild, Dialog } from '@headlessui/vue'

const props = withDefaults(
  defineProps<{
    show: boolean
    static?: boolean
  }>(),
  {
    static: false,
  }
)

const emit = defineEmits<{
  (event: 'update:show', value: boolean): void
}>()

const handleClose = () => {
  if (!props.static) {
    emit('update:show', false)
  }
}
</script>

<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog
      as="div"
      :static="static"
      class="relative z-10"
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
        <div class="fixed inset-0 bg-black/25" />
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
            <slot />
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
