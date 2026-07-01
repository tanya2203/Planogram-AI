<template>
  <aside style="width:224px;min-width:224px;background:#0A0F1E;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;height:100vh;position:fixed;top:0;left:0;z-index:40;">

    <!-- Logo -->
    <div style="padding:18px 16px 14px;border-bottom:1px solid rgba(255,255,255,0.06);">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,#4F46E5,#7C3AED);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 12px rgba(79,70,229,0.4);">
          <LayoutGrid :size="16" color="white" />
        </div>
        <div>
          <div style="color:#F1F5F9;font-size:13px;font-weight:700;letter-spacing:0.2px;">PlanogramAI</div>
          <div style="color:#475569;font-size:10px;letter-spacing:0.8px;text-transform:uppercase;margin-top:1px;">United Breweries</div>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <nav style="flex:1;padding:10px 8px;overflow-y:auto;scrollbar-width:none;">

      <!-- Home -->
      <NuxtLink to="/"
        style="display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:7px;margin-bottom:1px;text-decoration:none;transition:all 0.12s;"
        :style="route.path==='/' ? 'background:rgba(79,70,229,0.18);color:#818CF8;' : 'color:#64748B;'"
        @mouseenter="(e:any)=>{if(route.path!=='/')e.currentTarget.style.background='rgba(255,255,255,0.04)'}"
        @mouseleave="(e:any)=>{if(route.path!=='/')e.currentTarget.style.background='transparent'}"
      >
        <Home :size="14" style="flex-shrink:0;" />
        <span style="font-size:13px;font-weight:500;">Home</span>
      </NuxtLink>

      <!-- Planograms group -->
      <div style="margin-top:6px;">
        <button @click="planogramsOpen=!planogramsOpen"
          style="width:100%;display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:7px;border:none;background:transparent;cursor:pointer;transition:all 0.12s;margin-bottom:1px;"
          :style="isPlanogramsSection ? 'color:#818CF8;' : 'color:#64748B;'"
          @mouseenter="(e:any)=>{e.currentTarget.style.background='rgba(255,255,255,0.04)'}"
          @mouseleave="(e:any)=>{e.currentTarget.style.background='transparent'}"
        >
          <LayoutGrid :size="14" style="flex-shrink:0;" />
          <span style="font-size:13px;font-weight:500;flex:1;text-align:left;">Planograms</span>
          <ChevronDown :size="12" :style="`transition:transform 0.15s;transform:rotate(${planogramsOpen?'0':'−90'}deg);`" />
        </button>

        <div v-if="planogramsOpen" style="margin-left:10px;border-left:1px solid rgba(255,255,255,0.07);padding-left:8px;margin-bottom:2px;">
          <NuxtLink v-for="sub in planogramSubs" :key="sub.to" :to="sub.to"
            style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;margin-bottom:1px;text-decoration:none;font-size:12px;transition:all 0.12s;"
            :style="isActive(sub.to)
              ? 'background:rgba(79,70,229,0.15);color:#A5B4FC;font-weight:600;'
              : sub.highlight
                ? 'color:#818CF8;font-weight:500;'
                : 'color:#475569;font-weight:400;'"
            @mouseenter="(e:any)=>{if(!isActive(sub.to))e.currentTarget.style.color='#94A3B8'}"
            @mouseleave="(e:any)=>{if(!isActive(sub.to))e.currentTarget.style.color=sub.highlight?'#818CF8':'#475569'}"
          >
            <component :is="sub.icon" :size="13" style="flex-shrink:0;" />
            {{ sub.label }}
          </NuxtLink>
        </div>
      </div>

      <!-- Main nav items -->
      <div style="margin-top:2px;">
        <NuxtLink v-for="item in mainNavItems" :key="item.to" :to="item.to"
          style="display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:7px;margin-bottom:1px;text-decoration:none;transition:all 0.12s;"
          :style="isActive(item.to) ? 'background:rgba(79,70,229,0.18);color:#818CF8;' : 'color:#64748B;'"
          @mouseenter="(e:any)=>{if(!isActive(item.to))e.currentTarget.style.background='rgba(255,255,255,0.04)'}"
          @mouseleave="(e:any)=>{if(!isActive(item.to))e.currentTarget.style.background='transparent'}"
        >
          <component :is="item.icon" :size="14" style="flex-shrink:0;" />
          <span style="font-size:13px;font-weight:500;flex:1;">{{ item.label }}</span>
        </NuxtLink>
      </div>

    </nav>

    <!-- User profile -->
    <div style="padding:10px 12px 12px;border-top:1px solid rgba(255,255,255,0.06);">
      <!-- Workspace pill -->
      <div style="display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:6px;background:rgba(79,70,229,0.1);margin-bottom:10px;">
        <div style="width:6px;height:6px;border-radius:50%;background:#4F46E5;flex-shrink:0;"></div>
        <span style="font-size:11px;color:#818CF8;font-weight:500;flex:1;">South Asia · FY26 Q1</span>
        <ChevronsUpDown :size="10" color="#475569" />
      </div>
      <div style="display:flex;align-items:center;gap:9px;">
        <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#7C3AED);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;flex-shrink:0;">AS</div>
        <div style="flex:1;min-width:0;">
          <div style="color:#CBD5E1;font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Aditi Sharma</div>
          <div style="color:#475569;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Trade Mktg Manager</div>
        </div>
        <Settings :size="13" color="#475569" style="flex-shrink:0;cursor:pointer;" />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Home, LayoutGrid, ClipboardList, Move,
  BarChart2, ChevronDown, Package, ChevronsUpDown, Sparkles, Settings
} from 'lucide-vue-next'
import { usePlanogramStore } from '~/stores/planogram'

const route = useRoute()
const store  = usePlanogramStore()
const planogramsOpen = ref(true)

const planogramSubs = [
  { to: '/library',          label: 'Library', icon: Package,       highlight: false },
  { to: '/ai-generator',     label: 'Generate with AI',    icon: Sparkles,      highlight: true  },
  { to: '/configs',          label: 'All Planograms',      icon: ClipboardList, highlight: false },
  { to: '/new-planogram',    label: 'Create Planogram',    icon: Move,          highlight: false },
]

const mainNavItems = [
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
]

const isPlanogramsSection = computed(() =>
  planogramSubs.some(s => isActive(s.to))
)

function isActive(to: string) {
  return route.path === to || (to !== '/' && route.path.startsWith(to))
}
</script>
