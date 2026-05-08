<script setup lang="ts">
import { computed } from 'vue'
import { Switch } from '@headlessui/vue'
import SettingsListItem from './SettingsListItem.vue'

const props = defineProps<{ enabled: boolean }>()

const emit = defineEmits<{
  (event: 'update:enabled', value: boolean): void
}>()

const enabledRef = computed({
  get: () => props.enabled,
  set: (value) => emit('update:enabled', value),
})
</script>

<template>
  <SettingsListItem inner-class="!flex items-center justify-between">
    <div>
      <p>Copy to clipboard on post</p>
      <div class="text-gray-600 text-sm">
        Copy the posted message text to your clipboard after a successful post.
      </div>
    </div>
    <Switch
      v-model="enabledRef"
      :class="[
        enabledRef ? 'bg-blue-600' : 'bg-gray-200',
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      ]"
    >
      <span class="sr-only">Toggle copy to clipboard on post</span>
      <span
        aria-hidden="true"
        :class="[
          enabledRef ? 'translate-x-5' : 'translate-x-0',
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
        ]"
      />
    </Switch>
  </SettingsListItem>
</template>
