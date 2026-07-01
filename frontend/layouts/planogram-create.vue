<template>
  <div style="font-family:'DM Sans',system-ui,-apple-system,sans-serif;min-height:100vh;background:#F1F5F9;">
    <AppSidebar />
    <main style="margin-left:224px;min-height:100vh;">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '~/components/layout/AppSidebar.vue'
</script>
