<script setup lang="ts">
import { computed, ref } from 'vue'
import SettingsListItem from './SettingsListItem.vue'
import SignInDialog from './SignInDialog.vue'
import { AppBskyActorDefs } from '@atproto/api'
import SignOutDialog from './SignOutDialog.vue'
import { AuthProgress } from '../../data/model/AuthProgress'
import { LoginCredential } from '../../data/model/LoginCredential'

const props = defineProps<{
  service: string
  profile?: AppBskyActorDefs.ProfileView
  progress: AuthProgress
}>()

const emit = defineEmits<{
  (event: 'signin', value: LoginCredential): void
  (event: 'signout'): void
  (event: 'update:progress', value: AuthProgress): void
}>()

const showSignInDialogRef = ref(false)
const showSignOutDialogRef = ref(false)

const showSignInDialog = computed({
  get: () => {
    if (props.progress.type === 'IN_PROGRESS') return true
    if (props.progress.type === 'AUTHORIZED') return false

    return showSignInDialogRef.value
  },
  set: (v) => {
    showSignInDialogRef.value = v
    emit('update:progress', AuthProgress.UNAUTHORIZED())
  },
})

const handleSignInClick = () => {
  showSignInDialogRef.value = true
}

const handleSignOutClick = () => {
  showSignOutDialogRef.value = true
}

const handleSignIn = (value: LoginCredential) => {
  emit('signin', value)
}

const handleSignOut = () => {
  emit('signout')
}
</script>

<template>
  <SettingsListItem>
    <div class="flex flex-row justify-between items-center">
      <div>
        <div v-if="progress.type === 'INITIALIZING'" class="flex py-4">
          <p>Loading, please wait...</p>
        </div>
        <div v-if="progress.type !== 'AUTHORIZED'" class="flex py-4">
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
      <div v-if="progress.type !== 'INITIALIZING'">
        <button
          v-if="progress.type === 'AUTHORIZED'"
          :class="[$style.AuthButton, $style.__signout]"
          type="button"
          @click="handleSignOutClick"
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
    <SignInDialog
      v-if="showSignInDialog"
      v-model:show="showSignInDialog"
      :service="service"
      :progress="progress"
      @signin="handleSignIn"
    />
    <SignOutDialog
      v-if="showSignOutDialogRef"
      v-model:show="showSignOutDialogRef"
      @signout="handleSignOut"
    />
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
