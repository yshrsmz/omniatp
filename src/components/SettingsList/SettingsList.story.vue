<script setup lang="ts">
import { AppBskyActorDefs } from '@atproto/api'
import SettingsList from './SettingsList.vue'
import { PostTemplate } from '../../data/model/PostTemplate'
import { AppConfig } from '../../Configs'
import { logEvent } from 'histoire/client'
import { ref } from 'vue'
import { AuthProgress } from '../../data/model/AuthProgress'

const profile: AppBskyActorDefs.ProfileViewDetailed = {
  avatar:
    'https://cdn.bsky.social/imgproxy/vuWLhEnVe5fsPWVjn3W7p8dbjc_pOJhrqmHGr8Iokig/rs:fill:1000:1000:1:0/plain/bafkreiatc54uycwuatcbjiz4q44yx2bpshe65w3wfdikum7j7twrxg5isu@jpeg',
  did: 'did:plc:64nvfmwx7tqzr7i7bq5woiby',
  handle: 'yshrsmz.bsky.social',
}

const service = 'https://bsky.social'

const appVersion = '1.0.0'

const postTemplate = new PostTemplate('NowBrowsing: ')
const authProgress = ref<AuthProgress>({ type: 'UNAUTHORIZED' })
const storeUrl =
  'https://chrome.google.com/webstore/detail/omniatp/ngfefjjphfmafhmhbpjccedmkbbcmngf'
</script>

<template>
  <Story title="components/SettingsList/SettingsList">
    <Variant title="authorized">
      <SettingsList
        :is-authorized="true"
        :service="service"
        :profile="profile"
        :app-version="appVersion"
        :post-template="postTemplate"
        :developer="AppConfig.developer"
        :store-url="storeUrl"
        :auth-progress="authProgress"
        @signin="logEvent('signin', $event)"
        @signout="logEvent('signout', $event)"
        @update:post-template="logEvent('update:post-template', $event)"
      />
    </Variant>
    <Variant title="unahthorized">
      <SettingsList
        :is-authorized="false"
        :service="service"
        :profile="profile"
        :post-template="postTemplate"
        :app-version="appVersion"
        :developer="AppConfig.developer"
        :store-url="storeUrl"
        :auth-progress="authProgress"
        @signin="logEvent('signin', $event)"
        @signout="logEvent('signout', $event)"
        @update:post-template="logEvent('update:post-template', $event)"
      />
    </Variant>
  </Story>
</template>
