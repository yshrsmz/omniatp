<script setup lang="ts">
import AuthItem from './AuthItem.vue'
import SettingsListHeader from './SettingsListHeader.vue'
import { AppBskyActorDefs } from '@atproto/api'

const props = defineProps<{
  isAuthorized: boolean
  service: string
  profile?: AppBskyActorDefs.ProfileView
}>()

const COMPONENT_NAME = 'SettingsList'
</script>

<template>
  <div :class="[COMPONENT_NAME, $style.module]">
    <ul role="list">
      <SettingsListHeader title="Auth" />
      <AuthItem
        :is-authorized="isAuthorized"
        :profile="profile"
        :service="service"
      />
    </ul>
  </div>
</template>

<style lang="postcss" module>
.module {
  @apply overflow-hidden rounded-md bg-white shadow;
}
</style>
