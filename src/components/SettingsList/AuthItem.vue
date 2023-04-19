<script setup lang="ts">
import { computed, ref } from 'vue'
import SettingsListItem from './SettingsListItem.vue'
import AuthDialog from './AuthDialog.vue'
import { AppBskyActorDefs } from '@atproto/api'

const props = defineProps<{
  isAuthorized: boolean
  service: string
  profile?: AppBskyActorDefs.ProfileView
}>()

const emit = defineEmits<{
  (event: 'signin'): void
  (event: 'signout'): void
}>()

const isAuthorized = computed(() => props.isAuthorized && !!props.profile)

const showAuthDialogRef = ref(false)

const handleSignInClick = () => {
  showAuthDialogRef.value = true
}
</script>

<template>
  <SettingsListItem>
    <div class="flex flex-row justify-between items-center">
      <div>
        <div v-if="!isAuthorized" class="flex py-4">
          <p>Not Authorized, please sign in first.</p>
        </div>
        <div v-else class="flex py-4">
          <img :src="profile?.avatar" class="h-10 w-10 rounded-full" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">
              @{{ profile?.handle }}
            </p>
            <p class="text-sm text-gray-500">{{ service }}</p>
          </div>
        </div>
      </div>
      <div>
        <button
          v-if="isAuthorized"
          :class="[$style.AuthButton, $style.__signout]"
          type="button"
        >
          Sign out
        </button>
        <button
          v-else
          :class="[$style.AuthButton, $style.__signin]"
          type="button"
          @click="handleSignInClick"
        >
          Sign in
        </button>
      </div>
    </div>
    <AuthDialog v-model:show="showAuthDialogRef" :service="service" />
  </SettingsListItem>
</template>

<style lang="postcss" module>
.AuthButton {
  @apply inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2;

  &.__signin {
    @apply bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500;
  }

  &.__signout {
    @apply bg-red-600 hover:bg-red-700 focus:ring-red-500;
  }
}
</style>
