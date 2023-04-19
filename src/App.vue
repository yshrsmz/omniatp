<script setup lang="ts">
import TheHeader from './components/TheHeader.vue'
import SettingsList from './components/SettingsList/SettingsList.vue'
import { onMounted, ref } from 'vue'
import { createOptionsComponent } from './di/factory'
import { AppBskyActorDefs } from '@atproto/api'

const component = createOptionsComponent(chrome)

const service = 'https://bsky.social'

const isAuthorized = ref<boolean>(false)

const profile = ref<AppBskyActorDefs.ProfileView>()

onMounted(async () => {
  const repo = component.bskyRepository()
  await repo.resumeSession()

  const p = await repo.getProfile()
  console.log('profile', p)
  profile.value = p
})
</script>

<template>
  <div :class="['App', $style.module]">
    profile: {{ profile }}
    <TheHeader />
    <SettingsList
      class="max-w-4xl w-full"
      :service="service"
      :is-authorized="isAuthorized"
      :profile="profile"
    />
  </div>
</template>

<style lang="postcss" module>
.module {
  @apply flex flex-col items-center min-h-screen bg-gray-50 pb-10;
}
</style>
