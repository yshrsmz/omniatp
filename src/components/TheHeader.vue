<script setup lang="ts">
const COMPONENT_NAME = 'TheHeader'
</script>

<template>
  <header :class="[COMPONENT_NAME]">
    <div class="mx-auto max-w-7xl py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-lg font-semibold text-indigo-600">OmniATP</h1>
        <h2
          class="mt-1 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
        >
          Settings
        </h2>
      </div>
    </div>
  </header>
</template>
