<template>
  <aside style="width:220px;min-width:220px;background:#0F172A;border-right:1px solid #1E293B;display:flex;flex-direction:column;height:100vh;position:fixed;top:0;left:0;z-index:40;">

    <!-- Logo -->
    <div style="padding:20px 18px 16px;border-bottom:1px solid #1E293B;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#3B82F6,#8B5CF6);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <LayoutGrid :size="16" color="white" />
        </div>
        <div>
          <div style="color:#F1F5F9;font-size:13px;font-weight:700;letter-spacing:0.3px;">PlanogramAI</div>
          <div style="color:#64748B;font-size:10px;letter-spacing:0.5px;text-transform:uppercase;">United Breweries</div>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <nav style="flex:1;padding:12px 10px;overflow-y:auto;">
      <div style="color:#475569;font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:8px 8px 6px;">Workflow</div>
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        style="width:100%;display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;border:none;cursor:pointer;margin-bottom:2px;transition:all 0.15s;text-decoration:none;"
        :style="isActive(item.to)
          ? 'background:rgba(59,130,246,0.15);color:#60A5FA;'
          : 'background:transparent;color:#94A3B8;'"
      >
        <div style="width:20px;height:20px;display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;">
          <div :style="`position:absolute;top:-2px;right:-2px;width:5px;height:5px;border-radius:50%;background:${item.dot};`"></div>
          <component :is="item.icon" :size="15" />
        </div>
        <span :style="isActive(item.to) ? 'font-size:13px;font-weight:600;' : 'font-size:13px;font-weight:400;'">{{ item.label }}</span>
        <ChevronRight v-if="isActive(item.to)" :size="12" style="margin-left:auto;" />
      </NuxtLink>

      <div style="color:#475569;font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:14px 8px 6px;">System</div>
      <button v-for="sys in sysItems" :key="sys.label"
        style="width:100%;display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;border:none;cursor:pointer;margin-bottom:2px;background:transparent;color:#475569;font-size:13px;">
        <component :is="sys.icon" :size="15" />
        {{ sys.label }}
      </button>
    </nav>

    <!-- User profile -->
    <div style="padding:12px 14px;border-top:1px solid #1E293B;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#3B82F6,#8B5CF6);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;flex-shrink:0;">AS</div>
        <div style="flex:1;min-width:0;">
          <div style="color:#CBD5E1;font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Aditi Sharma</div>
          <div style="color:#475569;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Trade Mktg Manager</div>
        </div>
        <Settings :size="14" color="#475569" style="flex-shrink:0;cursor:pointer;" />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Package, BarChart2, SlidersHorizontal, Move, ClipboardList, LayoutGrid, ChevronRight, Settings, Database } from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { to: '/library',   label: 'Asset & SKU Library',      icon: Package,          dot: '#10B981' },
  { to: '/studio',    label: 'Planogram Studio',          icon: SlidersHorizontal,dot: '#3B82F6' },
  { to: '/workspace', label: 'SKU Workspace',             icon: Move,             dot: '#8B5CF6' },
  { to: '/configs',   label: 'Planogram Configurations',  icon: ClipboardList,    dot: '#EC4899' },
  { to: '/analytics', label: 'Analytics',                 icon: BarChart2,        dot: '#F59E0B' },
]

const sysItems = [
  { label: 'Settings',     icon: Settings  },
  { label: 'Integrations', icon: Database  },
]

function isActive(to: string) {
  return route.path === to || (to !== '/' && route.path.startsWith(to))
}
</script>
