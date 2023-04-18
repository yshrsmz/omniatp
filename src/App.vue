<script setup lang="ts">
import TheHeader from './components/TheHeader.vue'
import SettingsList from './components/SettingsList/SettingsList.vue'

const COMPONENT_NAME = 'App'
</script>

<template>
  <div :class="[COMPONENT_NAME, $style.module]">
    <TheHeader />
    <SettingsList class="max-w-4xl w-full" />
  </div>
</template>

<style lang="postcss" module>
.module {
  @apply flex flex-col items-center min-h-screen bg-gray-50 pb-10;
}
</style>
