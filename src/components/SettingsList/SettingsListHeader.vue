<script setup lang="ts">
import SettingsListItem from './SettingsListItem.vue'

defineProps<{ title: string }>()

const COMPONENT_NAME = 'SettingsListHeader'
</script>

<template>
  <SettingsListItem :class="[COMPONENT_NAME, $style.module]">
    <p>{{ title }}</p></SettingsListItem
  >
</template>

<style lang="postcss" module>
.module > * {
  @apply pb-2 text-gray-400 font-semibold;
}
</style>
