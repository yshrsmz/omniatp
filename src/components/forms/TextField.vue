<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: string
    title: string
    name: string
    placeholder?: string
    type: string
    readonly?: boolean
  }>(),
  {
    placeholder: undefined,
    readonly: false,
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
    <div class="mt-2">
      <input
        :id="`textfield_${name}`"
        v-model="valueRef"
        :type="type"
        :name="name"
        :readonly="readonly"
        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        :placeholder="placeholder"
      />
    </div>
  </fieldset>
</template>
