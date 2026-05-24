<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{ as?: string; innerClass?: string }>(),
  {
    as: 'div',
    innerClass: '',
  }
)

const isInteractive = computed(() => props.as === 'button' || props.as === 'a')
</script>

<template>
  <li class="SettingsListItem">
    <component
      :is="as"
      v-bind="$attrs"
      :class="[
        'block px-6 py-4 text-base',
        isInteractive
          ? 'cursor-pointer hover:bg-gray-50 transition-colors'
          : '',
        innerClass,
      ]"
    >
      <slot />
      <div v-if="$slots.subtext" class="text-gray-600 text-sm">
        <slot name="subtext"></slot>
      </div>
    </component>
  </li>
</template>
