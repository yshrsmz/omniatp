<script setup lang="ts">
import { PostTemplate } from '../../data/model/PostTemplate'
import { AmazonAssociate } from '../../data/model/AmazonAssociate'
import AuthItem from './AuthItem.vue'
import PostPrefixItem from './PostPrefixItem.vue'
import CopyToClipboardItem from './CopyToClipboardItem.vue'
import AmazonDomainItem from './AmazonDomainItem.vue'
import AmazonAssociateIdItem from './AmazonAssociateIdItem.vue'
import ChangelogItem from './ChangelogItem.vue'
import SettingsListHeader from './SettingsListHeader.vue'
import { AppBskyActorDefs } from '@atproto/api'
import SettingsListItem from './SettingsListItem.vue'
import { Developer } from '../../data/model/Developer'
import { AuthProgress } from '../../data/model/AuthProgress'
import { LoginCredential } from '../../data/model/LoginCredential'
import { computed } from 'vue'

const props = defineProps<{
  isAuthorized: boolean
  service: string
  profile?: AppBskyActorDefs.ProfileViewDetailed
  postTemplate: PostTemplate
  copyToClipboardOnPost: boolean
  amazonAssociate: AmazonAssociate
  amazonDomains: readonly string[]
  appVersion: string
  developer: Developer
  privacyPolicyUrl: string
  storeUrl: string
  authProgress: AuthProgress
}>()

const emit = defineEmits<{
  (event: 'signin', value: LoginCredential): void
  (event: 'signout'): void
  (event: 'update:postTemplate', value: PostTemplate): void
  (event: 'update:copyToClipboardOnPost', value: boolean): void
  (event: 'update:amazonAssociate', value: AmazonAssociate): void
  (event: 'update:authProgress', value: AuthProgress): void
}>()

const authProgress = computed({
  get: () => props.authProgress,
  set: (v) => emit('update:authProgress', v),
})

const handleUpdatePrefix = (prefix: string) => {
  const newTemplate = new PostTemplate(prefix)
  emit('update:postTemplate', newTemplate)
}

const handleUpdateCopyToClipboard = (value: boolean) => {
  emit('update:copyToClipboardOnPost', value)
}

const handleUpdateAmazonDomain = (domain: string) => {
  emit(
    'update:amazonAssociate',
    new AmazonAssociate(domain, props.amazonAssociate.associateId)
  )
}

const handleUpdateAmazonAssociateId = (id: string) => {
  emit(
    'update:amazonAssociate',
    new AmazonAssociate(props.amazonAssociate.domain, id)
  )
}
</script>

<template>
  <div class="SettingsList overflow-hidden rounded-md bg-white shadow-sm">
    <ul role="list">
      <SettingsListHeader title="Auth" />
      <AuthItem
        v-model:progress="authProgress"
        :is-authorized="isAuthorized"
        :profile="profile"
        :service="service"
        @signin="emit('signin', $event)"
        @signout="emit('signout')"
      />
      <SettingsListHeader title="General" />
      <PostPrefixItem
        :prefix="postTemplate.prefix"
        @update:prefix="handleUpdatePrefix"
      />
      <CopyToClipboardItem
        :enabled="copyToClipboardOnPost"
        @update:enabled="handleUpdateCopyToClipboard"
      />
      <SettingsListHeader title="Amazon Associate" />
      <AmazonDomainItem
        :domain="amazonAssociate.domain"
        :amazon-domains="amazonDomains"
        @update:domain="handleUpdateAmazonDomain"
      />
      <AmazonAssociateIdItem
        :associate-id="amazonAssociate.associateId"
        @update:associate-id="handleUpdateAmazonAssociateId"
      />
      <SettingsListHeader title="Others" />
      <SettingsListItem class="!border-t-0">
        <p>App Version</p>
        <template #subtext>{{ appVersion }}</template>
      </SettingsListItem>
      <ChangelogItem />
      <SettingsListItem as="a" :href="developer.url" target="_blank">
        <p>Developer</p>
        <template #subtext>{{ developer.name }}</template>
      </SettingsListItem>
      <SettingsListItem as="a" :href="storeUrl" target="_blank">
        <p>Rate on Chrome Web Store</p>
      </SettingsListItem>
      <SettingsListItem
        as="a"
        :href="privacyPolicyUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        <p>Privacy Policy</p>
      </SettingsListItem>
    </ul>
  </div>
</template>
