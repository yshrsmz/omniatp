<script setup lang="ts">
import { computed, defineComponent, useAttrs } from 'vue'

withDefaults(defineProps<{ as?: string }>(), { as: 'div' })

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
  <li :class="[COMPONENT_NAME, $style.module, $attrs.class]">
    <component :is="as" v-bind="excludedAttrs" class="block">
      <slot />
      <div v-if="$slots.subtext" :class="$style.subtext">
        <slot name="subtext"></slot>
      </div>
    </component>
  </li>
</template>
<style lang="postcss" module>
.module > * {
  @apply px-6 py-4 text-base;
}

.subtext {
  @apply text-gray-600 text-sm;
}
</style>
