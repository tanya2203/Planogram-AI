<template>
  <header style="height:56px;background:white;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 24px;gap:16px;position:fixed;top:0;left:220px;right:0;z-index:30;">
    <div>
      <div style="font-size:15px;font-weight:700;color:#0F172A;">{{ title }}</div>
      <div style="font-size:11px;color:#94A3B8;">United Breweries · Modern Trade · Q2 2025</div>
    </div>
    <div style="margin-left:auto;display:flex;align-items:center;gap:12px;">
      <div style="display:flex;align-items:center;gap:8px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:6px 12px;">
        <Search :size="14" color="#94A3B8" />
        <input placeholder="Search anything..." style="border:none;background:transparent;font-size:13px;color:#334155;outline:none;width:180px;" />
      </div>
      <button style="position:relative;background:transparent;border:none;cursor:pointer;padding:6px;">
        <Bell :size="18" color="#64748B" />
        <div style="position:absolute;top:4px;right:4px;width:7px;height:7px;border-radius:50%;background:#EF4444;border:2px solid white;"></div>
      </button>
      <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#3B82F6,#8B5CF6);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;cursor:pointer;">AS</div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Bell } from 'lucide-vue-next'

const route = useRoute()

const TITLES: Record<string, string> = {
  '/library':   'Asset & SKU Library',
  '/studio':    'Planogram Studio',
  '/workspace': 'SKU Configuration Workspace',
  '/configs':   'Planogram Configurations',
  '/generator':     'AI Planogram Generator',
  '/ai-generator':  'AI Planogram Generator',
  '/analytics': 'Analytics Dashboard',
}

const title = computed(() => TITLES[route.path] ?? 'PlanogramAI')
</script>
