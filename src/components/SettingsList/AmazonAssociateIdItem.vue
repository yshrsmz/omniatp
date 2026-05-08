<script setup lang="ts">
import { computed, ref } from 'vue'
import SettingsListItem from './SettingsListItem.vue'
import TextInputDialog from '../TextInputDialog.vue'

const props = defineProps<{ associateId: string }>()

const emit = defineEmits<{
  (event: 'update:associateId', value: string): void
}>()

const showDialogRef = ref(false)

const associateIdRef = computed({
  get: () => props.associateId,
  set: (value) => emit('update:associateId', value),
})

const handleClick = () => {
  showDialogRef.value = true
}
</script>

<template>
  <SettingsListItem as="a" href="#" @click.prevent="handleClick">
    <p>Amazon Associate ID</p>
    <template #subtext>{{ associateId || '(not set)' }}</template>
    <TextInputDialog
      v-model:show="showDialogRef"
      v-model:text="associateIdRef"
      type="text"
      name="amazonAssociateId"
      title="Edit Amazon Associate ID"
      label="Associate ID"
      placeholder="ex. xxxxxxxx-22"
    />
  </SettingsListItem>
</template>
