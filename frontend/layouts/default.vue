<template>
  <div style="font-family:'DM Sans',system-ui,-apple-system,sans-serif;background:#F1F5F9;min-height:100vh;">
    <AppSidebar />
    <TopBar />
    <main style="margin-left:220px;padding-top:56px;min-height:100vh;background:#F1F5F9;">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '~/components/layout/AppSidebar.vue'
import TopBar from '~/components/layout/TopBar.vue'
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
input[type=range] { -webkit-appearance: none; height: 4px; background: #E2E8F0; border-radius: 2px; outline: none; width: 100%; }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #3B82F6; cursor: pointer; border: 2px solid white; box-shadow: 0 1px 4px rgba(59,130,246,0.4); }
</style>
