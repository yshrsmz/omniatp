<script setup lang="ts">
import { computed } from 'vue'
import { ExclamationCircleIcon } from '@heroicons/vue/20/solid'

const props = withDefaults(
  defineProps<{
    value: string
    error?: string
    title: string
    name: string
    placeholder?: string
    type: string
    readonly?: boolean
    disabled?: boolean
  }>(),
  {
    error: undefined,
    placeholder: undefined,
    readonly: false,
    disabled: false,
  }
)

const emit = defineEmits<{
  (event: 'update:value', value: string): void
}>()

const valueRef = computed({
  get: () => props.value,
  set: (value) => emit('update:value', value),
})
</script>

<template>
  <fieldset>
    <label
      :for="`textfield_${name}`"
      class="block text-sm font-medium leading-6 text-gray-900"
      >{{ title }}</label
    >
    <div class="mt-2 relative">
      <input
        :id="`textfield_${name}`"
        v-model="valueRef"
        :type="type"
        :name="name"
        :readonly="readonly"
        :disabled="disabled"
        class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
        :class="{
          'text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600':
            !error,
          'text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500':
            !!error,
        }"
        :placeholder="placeholder"
        :aria-invalid="!!error"
        :aria-discribedby="!!error ? `textfield_${name}_error` : undefined"
      />
      <div
        v-if="!!error"
        class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
      >
        <ExclamationCircleIcon
          class="h-5 w-5 text-red-500"
          aria-hidden="true"
        />
      </div>
    </div>
    <p :id="`textfield_${name}_error`" class="mt-2 text-sm text-red-600 h-5">
      {{ error }}
    </p>
  </fieldset>
</template>
