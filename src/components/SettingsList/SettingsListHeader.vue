<script setup lang="ts">
import SettingsListItem from './SettingsListItem.vue'

defineProps<{ title: string }>()

const COMPONENT_NAME = 'SettingsListHeader'
</script>

<template>
  <SettingsListItem :class="COMPONENT_NAME" inner-class="!pb-2">
    <p class="text-gray-400 font-semibold">{{ title }}</p>
  </SettingsListItem>
</template>
