<script setup lang="ts">
import { computed } from 'vue'
import { DialogPanel, DialogTitle } from '@headlessui/vue'
import { parseInline, type Changelog } from '../../data/model/Changelog'
import BaseDialog from '../BaseDialog.vue'

const props = defineProps<{
  show: boolean
  changelog: Changelog
}>()

const emit = defineEmits<{
  (event: 'update:show', value: boolean): void
}>()

const tokenizedReleases = computed(() =>
  props.changelog.releases.map((release) => ({
    ...release,
    sections: release.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        descriptionTokens: parseInline(item.description),
      })),
    })),
  }))
)

const handleClose = () => {
  emit('update:show', false)
}
</script>

<template>
  <BaseDialog :show="show" @update:show="emit('update:show', $event)">
    <DialogPanel
      class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col max-h-[80vh]"
    >
      <DialogTitle
        as="h3"
        class="text-lg font-medium leading-6 text-gray-900 px-6 pt-6"
      >
        Changelog
      </DialogTitle>
      <div class="my-4 px-6 overflow-y-auto flex-1">
        <p v-if="changelog.releases.length === 0" class="text-sm text-gray-500">
          No releases yet.
        </p>
        <ul v-else class="space-y-6">
          <li v-for="release in tokenizedReleases" :key="release.version">
            <h4 class="text-base font-semibold text-gray-900">
              <a
                v-if="release.versionUrl"
                :href="release.versionUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-indigo-600 hover:underline"
              >
                {{ release.version }}
              </a>
              <span v-else>{{ release.version }}</span>
              <span
                v-if="release.date"
                class="ml-2 text-sm font-normal text-gray-500"
              >
                {{ release.date }}
              </span>
            </h4>
            <div
              v-for="section in release.sections"
              :key="section.title"
              class="mt-3"
            >
              <h5
                class="text-sm font-medium text-gray-700 uppercase tracking-wide"
              >
                {{ section.title }}
              </h5>
              <ul class="mt-1 space-y-1 text-sm text-gray-700">
                <li
                  v-for="(item, index) in section.items"
                  :key="`${section.title}-${index}`"
                  class="flex"
                >
                  <span class="mr-2 text-gray-400">•</span>
                  <span class="flex-1">
                    <strong v-if="item.scope" class="font-semibold"
                      >{{ item.scope }}:</strong
                    >
                    <span :class="{ 'ml-1': item.scope }">
                      <template
                        v-for="(token, tokenIndex) in item.descriptionTokens"
                        :key="`${tokenIndex}-${token.type}`"
                      >
                        <code
                          v-if="token.type === 'code'"
                          class="rounded-sm bg-gray-100 px-1 font-mono text-xs"
                          >{{ token.text }}</code
                        >
                        <strong
                          v-else-if="token.type === 'bold'"
                          class="font-semibold"
                          >{{ token.text }}</strong
                        >
                        <template v-else>{{ token.text }}</template>
                      </template>
                    </span>
                    <template v-for="link in item.links" :key="link.url">
                      <span class="text-gray-400"> (</span>
                      <a
                        :href="link.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-indigo-600 hover:underline"
                        >{{ link.text }}</a
                      >
                      <span class="text-gray-400">)</span>
                    </template>
                  </span>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
      <div class="px-6 py-4 border-t border-gray-200 text-right">
        <button
          type="button"
          class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          @click="handleClose"
        >
          Close
        </button>
      </div>
    </DialogPanel>
  </BaseDialog>
</template>
