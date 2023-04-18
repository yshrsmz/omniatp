<script setup lang="ts">
import SettingsListHeader from './SettingsListHeader.vue'

const COMPONENT_NAME = 'SettingsList'
</script>

<template>
  <div :class="[COMPONENT_NAME, $style.module]">
    <ul role="list">
      <SettingsListHeader title="Auth" />
    </ul>
  </div>
</template>

<style lang="postcss" module>
.module {
  @apply overflow-hidden rounded-md bg-white shadow;
}
</style>
