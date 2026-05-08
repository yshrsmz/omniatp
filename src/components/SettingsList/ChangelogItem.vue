<script setup lang="ts">
import { ref } from 'vue'
import SettingsListItem from './SettingsListItem.vue'
import ChangelogDialog from './ChangelogDialog.vue'
import changelogSource from '../../../CHANGELOG.md?raw'
import { parseChangelog } from '../../data/model/Changelog'

const changelog = parseChangelog(changelogSource)
const latestVersion = changelog.releases[0]?.version

const showDialog = ref(false)

const handleClick = () => {
  showDialog.value = true
}
</script>

<template>
  <SettingsListItem
    as="button"
    inner-class="w-full text-left"
    @click="handleClick"
  >
    <p>Changelog</p>
    <template v-if="latestVersion" #subtext
      >Latest: {{ latestVersion }}</template
    >
  </SettingsListItem>
  <ChangelogDialog
    v-if="showDialog"
    v-model:show="showDialog"
    :changelog="changelog"
  />
</template>
