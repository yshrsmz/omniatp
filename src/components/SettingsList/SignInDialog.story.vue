<script setup lang="ts">
import SignInDialog from './SignInDialog.vue'
import { BskyConfig } from '../../Configs'
import { logEvent } from 'histoire/client'
import { AuthProgress } from '../../data/model/AuthProgress'

const service = BskyConfig.service
</script>

<template>
  <Story>
    <Variant title="UNAUTHORIZED">
      <SignInDialog
        :show="true"
        :service="service"
        :progress="AuthProgress.UNAUTHORIZED()"
        @signin="logEvent('signin', $event)"
      />
    </Variant>
    <Variant title="IN_PROGRESS">
      <SignInDialog
        :show="true"
        :service="service"
        :progress="AuthProgress.IN_PROGRESS()"
        @signin="logEvent('signin', $event)"
      />
    </Variant>
  </Story>
</template>
