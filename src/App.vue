<script setup lang="ts">
import TheHeader from './components/TheHeader.vue'
import SettingsList from './components/SettingsList/SettingsList.vue'
import { computed, onMounted, ref } from 'vue'
import { createOptionsComponent } from './di/factory'
import { AppBskyActorDefs } from '@atproto/api'
import { AuthProgress } from './data/model/AuthProgress'
import { AppConfig, BskyConfig } from './Configs'
import { PostTemplate } from './data/model/PostTemplate'
import { LoginCredential } from './data/model/LoginCredential'

const component = createOptionsComponent(chrome)

const _postTemplate = ref<PostTemplate>(PostTemplate.empty())

const service = BskyConfig.service
const appVersion = component.chromeDelegate().appVersion()
const developer = AppConfig.developer

const isAuthorized = ref<boolean>(false)

const profile = ref<AppBskyActorDefs.ProfileView>()

const authProgress = ref<AuthProgress>(AuthProgress.INITIALIZING())

const postTemplate = computed<PostTemplate>({
  get: () => _postTemplate.value,
  set: (value) => {
    _postTemplate.value = value
    component.postTemplateRepository().save(value)
  },
})

const handleSignIn = async (value: LoginCredential) => {
  authProgress.value = AuthProgress.IN_PROGRESS()
  try {
    await component.bskyRepository().signIn(value)
    const p = await component.bskyRepository().getProfile()
    profile.value = p
    authProgress.value = AuthProgress.AUTHORIZED()
  } catch (e) {
    console.error('SignInError', e)
    authProgress.value = AuthProgress.ERROR(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e as any)?.message ?? 'Something went wrong, please try again.'
    )
  }
}

const handleSignOut = async () => {
  await component.bskyRepository().signOut()
  authProgress.value = AuthProgress.UNAUTHORIZED()
}

onMounted(async () => {
  const repo = component.bskyRepository()
  await repo.resumeSession()

  const p = await repo.getProfile()
  console.log('profile', p)
  profile.value = p

  authProgress.value = p
    ? AuthProgress.AUTHORIZED()
    : AuthProgress.UNAUTHORIZED()

  _postTemplate.value = await component.postTemplateRepository().get()
})
</script>

<template>
  <div
    class="App flex flex-col items-center min-h-screen bg-gray-50 pb-10 min-h-screen"
  >
    <TheHeader />
    <main class="max-w-4xl w-full flex-grow">
      <SettingsList
        v-model:post-template="postTemplate"
        v-model:auth-progress="authProgress"
        class="w-full"
        :service="service"
        :app-version="appVersion"
        :developer="developer"
        :is-authorized="isAuthorized"
        :profile="profile"
        @signin="handleSignIn"
        @signout="handleSignOut"
      />
    </main>
  </div>
</template>
