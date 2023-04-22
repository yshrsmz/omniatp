<script setup lang="ts">
import SettingsListItem from './SettingsListItem.vue'
import TextInputDialog from '../TextInputDialog.vue'
import { computed, ref } from 'vue'

const props = defineProps<{ prefix: string }>()

const emit = defineEmits<{
  (event: 'update:prefix', value: string): void
}>()

const showDialogRef = ref(false)

const prefixRef = computed({
  get: () => props.prefix,
  set: (value) => emit('update:prefix', value),
})

const handleClick = () => {
  showDialogRef.value = true
}
</script>

<template>
  <SettingsListItem as="a" href="#" @click.prevent="handleClick">
    <p>Post Prefix</p>
    <template #subtext>{{ prefix }}</template>
    <TextInputDialog
      v-model:show="showDialogRef"
      v-model:text="prefixRef"
      type="text"
      name="prefix"
      title="Edit Post Prefix"
      label="Prefix"
      placeholder="ex. Watching"
    />
  </SettingsListItem>
</template>
