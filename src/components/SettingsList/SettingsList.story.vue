<script setup lang="ts">
import { AppBskyActorDefs } from '@atproto/api'
import SettingsList from './SettingsList.vue'

const profile = {
  avatar:
    'https://cdn.bsky.social/imgproxy/vuWLhEnVe5fsPWVjn3W7p8dbjc_pOJhrqmHGr8Iokig/rs:fill:1000:1000:1:0/plain/bafkreiatc54uycwuatcbjiz4q44yx2bpshe65w3wfdikum7j7twrxg5isu@jpeg',
  did: 'did:plc:64nvfmwx7tqzr7i7bq5woiby',
  handle: 'yshrsmz.bsky.social',
} satisfies AppBskyActorDefs.ProfileView
const service = 'https://bsky.social'
</script>

<template>
  <Story title="components/SettingsList/SettingsList">
    <Variant title="authorized">
      <SettingsList
        :is-authorized="true"
        :service="service"
        :profile="profile"
      />
    </Variant>
    <Variant title="unahthorized">
      <SettingsList
        :is-authorized="false"
        :service="service"
        :profile="profile"
      />
    </Variant>
  </Story>
</template>
