<script setup lang="ts">
import { computed, defineComponent, useAttrs } from 'vue'

withDefaults(defineProps<{ as?: string; innerClass?: string }>(), {
  as: 'div',
  innerClass: '',
})

const COMPONENT_NAME = 'SettingsListItem'

const attrs = useAttrs()

const excludedAttrs = computed(() => {
  const { ['class']: c, ...excluded } = attrs
  return excluded
})
</script>

<script lang="ts">
export default defineComponent({
  inheritAttrs: false,
})
</script>

<template>
  <li :class="[COMPONENT_NAME, $attrs.class]">
    <component
      :is="as"
      v-bind="excludedAttrs"
      :class="['block px-6 py-4 text-base', innerClass]"
    >
      <slot />
      <div v-if="$slots.subtext" class="text-gray-600 text-sm">
        <slot name="subtext"></slot>
      </div>
    </component>
  </li>
</template>
