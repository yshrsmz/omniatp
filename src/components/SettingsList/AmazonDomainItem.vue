<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
import { computed } from 'vue'
import SettingsListItem from './SettingsListItem.vue'

const PLACEHOLDER = 'Select your Amazon domain'

const props = defineProps<{
  domain: string
  amazonDomains: readonly string[]
}>()

const emit = defineEmits<{
  (event: 'update:domain', value: string): void
}>()

const selected = computed<string>({
  get: () => props.domain || PLACEHOLDER,
  set: (value) => emit('update:domain', value === PLACEHOLDER ? '' : value),
})

const options = computed(() => [PLACEHOLDER, ...props.amazonDomains])
</script>

<template>
  <SettingsListItem>
    <p>Amazon Domain</p>
    <template #subtext>
      <Listbox v-model="selected" class="mt-1 w-72">
        <div class="relative">
          <ListboxButton
            class="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span class="block truncate">{{ selected }}</span>
            <span
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
            >
              <ChevronUpDownIcon
                class="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </ListboxButton>
          <transition
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <ListboxOptions
              class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-hidden"
            >
              <ListboxOption
                v-for="option in options"
                v-slot="{ active, selected: isSelected }"
                :key="option"
                :value="option"
                as="template"
              >
                <li
                  :class="[
                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900',
                    'relative cursor-default select-none py-2 pl-10 pr-4',
                  ]"
                >
                  <span
                    :class="[
                      isSelected ? 'font-medium' : 'font-normal',
                      'block truncate',
                    ]"
                    >{{ option }}</span
                  >
                  <span
                    v-if="isSelected"
                    class="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600"
                  >
                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                  </span>
                </li>
              </ListboxOption>
            </ListboxOptions>
          </transition>
        </div>
      </Listbox>
    </template>
  </SettingsListItem>
</template>
