<template>
  <div style="padding:24px;">

    <!-- Toast -->
    <Transition name="toast-fade">
      <div v-if="toast" style="position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#0F172A;color:white;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:500;z-index:999;box-shadow:0 4px 16px rgba(0,0,0,0.18);white-space:nowrap;pointer-events:none;">
        {{ toast }}
      </div>
    </Transition>

    <!-- Delete Modal -->
    <Transition name="modal-fade">
      <div v-if="deleteTarget" style="position:fixed;inset:0;background:rgba(15,23,42,0.4);z-index:200;display:flex;align-items:center;justify-content:center;">
        <div style="background:white;border-radius:10px;width:400px;box-shadow:0 8px 32px rgba(15,23,42,0.16);overflow:hidden;">
          <div style="padding:24px 24px 8px;">
            <div style="font-size:15px;font-weight:600;color:#0F172A;margin-bottom:8px;">Delete planogram?</div>
            <div style="font-size:13px;color:#64748B;line-height:1.6;">
              "<span style="color:#334155;font-weight:500;">{{ deleteTarget.name }}</span>" will be permanently removed. This cannot be undone.
            </div>
          </div>
          <div style="padding:16px 24px 20px;display:flex;gap:8px;justify-content:flex-end;">
            <button @click="deleteTarget = null" style="background:transparent;border:1px solid #E2E8F0;border-radius:7px;padding:8px 16px;font-size:13px;font-weight:500;cursor:pointer;color:#475569;">Cancel</button>
            <button @click="confirmDelete" style="background:#EF4444;color:white;border:none;border-radius:7px;padding:8px 16px;font-size:13px;font-weight:500;cursor:pointer;">Delete</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Details Drawer backdrop -->
    <Transition name="modal-fade">
      <div v-if="detailsTarget" @click="detailsTarget = null" style="position:fixed;inset:0;background:rgba(15,23,42,0.25);z-index:149;"></div>
    </Transition>
    <!-- Details Drawer panel -->
    <Transition name="drawer">
      <div v-if="detailsTarget" style="position:fixed;top:0;right:0;bottom:0;width:380px;background:white;border-left:1px solid #E2E8F0;display:flex;flex-direction:column;z-index:150;">
        <div style="padding:20px 24px 16px;border-bottom:1px solid #F1F5F9;display:flex;align-items:flex-start;justify-content:space-between;">
          <div>
            <div style="font-size:14px;font-weight:600;color:#0F172A;margin-bottom:6px;">{{ detailsTarget.name }}</div>
            <span :style="pillStyle(detailsTarget.status)">{{ pillLabel(detailsTarget.status) }}</span>
          </div>
          <button @click="detailsTarget = null" style="background:transparent;border:none;cursor:pointer;padding:4px;margin-top:2px;">
            <X :size="15" color="#94A3B8" />
          </button>
        </div>
        <div style="flex:1;overflow-y:auto;padding:20px 24px;">
          <template v-for="section in drawerSections" :key="section.heading">
            <div style="margin-bottom:24px;">
              <div style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px;">{{ section.heading }}</div>
              <div v-for="(row, i) in section.rows" :key="row[0]"
                :style="i < section.rows.length - 1
                  ? 'display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #F8FAFC;'
                  : 'display:flex;justify-content:space-between;align-items:center;padding:9px 0;'">
                <span style="font-size:13px;color:#94A3B8;font-weight:400;">{{ row[0] }}</span>
                <span style="font-size:13px;color:#0F172A;font-weight:500;">{{ row[1] }}</span>
              </div>
            </div>
          </template>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #F1F5F9;display:flex;gap:8px;">
          <button @click="detailsTarget = null" style="flex:1;background:transparent;border:1px solid #E2E8F0;border-radius:7px;padding:9px 0;font-size:13px;font-weight:500;cursor:pointer;color:#475569;">Close</button>
          <button @click="handleEdit" style="flex:1;background:#0F172A;color:white;border:none;border-radius:7px;padding:9px 0;font-size:13px;font-weight:500;cursor:pointer;">Edit planogram</button>
        </div>
      </div>
    </Transition>

    <!-- Row action menu (teleported to avoid overflow:hidden clipping) -->
    <Teleport to="body">
      <template v-if="openMenuId !== null && activeMenuPlano">
        <div @click="openMenuId = null" style="position:fixed;inset:0;z-index:89;"></div>
        <div :style="`position:fixed;top:${menuPos.top}px;right:${menuPos.right}px;background:white;border:1px solid #E2E8F0;border-radius:8px;box-shadow:0 4px 16px rgba(15,23,42,0.1);z-index:90;min-width:180px;overflow:hidden;padding:4px 0;`">
          <button @click.stop="detailsTarget = activeMenuPlano; openMenuId = null" class="mitem">View details</button>
          <button @click.stop="handleEdit(); openMenuId = null" class="mitem">Edit</button>
          <button @click.stop="handleDuplicate(activeMenuPlano!); openMenuId = null" class="mitem">Duplicate</button>
          <button @click.stop="handleToggle(activeMenuPlano!); openMenuId = null" class="mitem">
            {{ activeMenuPlano.status === 'active' ? 'Deactivate' : 'Activate' }}
          </button>
          <button @click.stop="handleRegenerate(); openMenuId = null" class="mitem mitem--hl">✦ Regenerate with AI</button>
          <div style="height:1px;background:#F1F5F9;margin:2px 0;"></div>
          <button @click.stop="handleDeleteRequest(activeMenuPlano!); openMenuId = null" class="mitem mitem--del">Delete</button>
        </div>
      </template>
    </Teleport>

    <!-- Split-button new-menu click-away -->
    <div v-if="showNewMenu" @click="showNewMenu = false" style="position:fixed;inset:0;z-index:88;"></div>

    <!-- ── Main content ── -->
    <div style="max-width:1040px;margin:0 auto;">

      <!-- Page header -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">
        <div>
          <div style="font-size:18px;font-weight:600;color:#0F172A;margin-bottom:3px;">Planogram Configurations</div>
          <div style="font-size:13px;color:#94A3B8;font-weight:400;">Manage and monitor all planogram layouts</div>
        </div>
        <!-- Split button -->
        <div style="position:relative;">
          <div style="display:flex;border-radius:8px;overflow:hidden;border:1px solid #E2E8F0;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <button @click="router.push('/ai-generator')" style="display:flex;align-items:center;gap:6px;background:#0F172A;color:white;border:none;padding:9px 16px;font-size:13px;font-weight:500;cursor:pointer;border-right:1px solid #1E293B;">
              <Sparkles :size="13" /> Generate with AI
            </button>
            <button @click.stop="showNewMenu = !showNewMenu" style="background:#0F172A;color:#94A3B8;border:none;padding:9px 10px;cursor:pointer;display:flex;align-items:center;">
              <ChevronDown :size="14" />
            </button>
          </div>
          <div v-if="showNewMenu" style="position:absolute;right:0;top:calc(100% + 5px);background:white;border:1px solid #E2E8F0;border-radius:9px;box-shadow:0 6px 20px rgba(15,23,42,0.12);z-index:89;min-width:210px;overflow:hidden;padding:4px 0;">
            <button @click="showNewMenu = false; router.push('/ai-generator')" class="dmitem">
              <Sparkles :size="14" color="#3B82F6" style="flex-shrink:0;" />
              <div>
                <div style="font-weight:600;font-size:13px;color:#0F172A;">Generate with AI</div>
                <div style="font-size:11px;color:#94A3B8;margin-top:1px;">Set objective · pick SKUs · get 3 options</div>
              </div>
            </button>
            <div style="height:1px;background:#F1F5F9;margin:2px 0;"></div>
            <button @click="showNewMenu = false; router.push('/studio')" class="dmitem">
              <Move :size="14" color="#64748B" style="flex-shrink:0;" />
              <div>
                <div style="font-size:13px;color:#0F172A;">Manual setup</div>
                <div style="font-size:11px;color:#94A3B8;margin-top:1px;">Configure and place SKUs yourself</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:8px;border:1px solid #E2E8F0;border-radius:7px;padding:7px 12px;background:white;min-width:220px;">
          <Search :size="13" color="#CBD5E1" />
          <input v-model="search" placeholder="Search planograms…" style="border:none;background:transparent;font-size:13px;color:#334155;outline:none;flex:1;" />
          <button v-if="search" @click="search = ''" style="background:transparent;border:none;cursor:pointer;padding:0;display:flex;">
            <X :size="12" color="#CBD5E1" />
          </button>
        </div>

        <div style="display:flex;gap:2px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:7px;padding:3px;">
          <button v-for="tab in STATUS_TABS" :key="tab.value" @click="statusFilter = tab.value"
            :style="statusFilter === tab.value
              ? 'padding:5px 12px;border-radius:5px;border:none;background:white;color:#0F172A;font-size:12px;font-weight:500;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.07);white-space:nowrap;'
              : 'padding:5px 12px;border-radius:5px;border:none;background:transparent;color:#94A3B8;font-size:12px;font-weight:400;cursor:pointer;white-space:nowrap;'">
            {{ tab.label }}
          </button>
        </div>

        <select v-model="sortKey" style="margin-left:auto;border:1px solid #E2E8F0;border-radius:7px;padding:7px 12px;font-size:12px;color:#64748B;cursor:pointer;outline:none;background:white;">
          <option value="modified">Last modified</option>
          <option value="compliance">Compliance</option>
          <option value="utilization">Utilization</option>
          <option value="skuCount">SKU count</option>
        </select>
        <span style="font-size:12px;color:#CBD5E1;">{{ filtered.length }} record{{ filtered.length !== 1 ? 's' : '' }}</span>
      </div>

      <!-- Empty state -->
      <div v-if="filtered.length === 0" style="background:white;border:1px solid #F1F5F9;border-radius:10px;padding:64px 32px;text-align:center;">
        <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#3B82F6,#7C3AED);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          <Sparkles :size="24" color="white" />
        </div>
        <div style="font-size:16px;font-weight:600;color:#0F172A;margin-bottom:8px;">
          {{ store.planograms.length === 0 ? 'No planograms yet' : 'No results' }}
        </div>
        <div style="font-size:13px;color:#64748B;max-width:360px;margin:0 auto 24px;line-height:1.6;">
          {{ store.planograms.length === 0
            ? 'Let AI generate your first planogram. Set your objective, pick SKUs, and get 3 ready-to-use configurations in under 2 minutes.'
            : 'Try a different search or filter.' }}
        </div>
        <div v-if="store.planograms.length === 0" style="display:flex;gap:10px;justify-content:center;">
          <button @click="router.push('/ai-generator')" style="display:inline-flex;align-items:center;gap:7px;background:linear-gradient(135deg,#3B82F6,#7C3AED);color:white;border:none;border-radius:8px;padding:10px 22px;font-size:13px;font-weight:600;cursor:pointer;">
            <Sparkles :size="14" /> Generate with AI
          </button>
          <button @click="router.push('/studio')" style="display:inline-flex;align-items:center;gap:7px;background:white;color:#475569;border:1px solid #E2E8F0;border-radius:8px;padding:10px 22px;font-size:13px;font-weight:500;cursor:pointer;">
            Manual setup
          </button>
        </div>
      </div>

      <!-- Table -->
      <div v-else style="background:white;border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:1px solid #F1F5F9;">
              <th class="th" style="padding-left:20px;text-align:left;">Planogram</th>
              <th class="th" style="text-align:left;">Asset</th>
              <th class="th" style="text-align:left;">Region</th>
              <th class="th" style="text-align:right;">SKUs</th>
              <th class="th" style="text-align:left;">Compliance</th>
              <th class="th" style="text-align:left;">Utilization</th>
              <th class="th" style="text-align:left;">Status</th>
              <th class="th" style="text-align:left;">Last modified</th>
              <th style="padding:10px 20px 10px 12px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(plano, idx) in filtered" :key="plano.id"
              @click="detailsTarget = plano"
              class="trow"
              :style="idx < filtered.length - 1 ? 'border-bottom:1px solid #F8FAFC;' : ''">
              <td style="padding:13px 12px 13px 20px;font-weight:500;font-size:13px;color:#0F172A;max-width:220px;">
                <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ plano.name }}</div>
              </td>
              <td style="padding:13px 12px;font-size:13px;color:#64748B;max-width:150px;">
                <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ plano.asset }}</div>
              </td>
              <td style="padding:13px 12px;font-size:13px;color:#64748B;">{{ plano.region }}</td>
              <td style="padding:13px 12px;font-size:13px;color:#334155;font-weight:500;text-align:right;">{{ plano.skuCount }}</td>
              <td style="padding:13px 12px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="width:56px;height:4px;background:#F1F5F9;border-radius:2px;overflow:hidden;flex-shrink:0;">
                    <div :style="{ width: plano.compliance + '%', height: '100%', borderRadius: '2px', background: plano.compliance >= 80 ? '#10B981' : plano.compliance >= 60 ? '#F59E0B' : '#EF4444' }"></div>
                  </div>
                  <span style="font-size:11px;font-weight:600;color:#334155;min-width:30px;">{{ plano.compliance }}%</span>
                </div>
              </td>
              <td style="padding:13px 12px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="width:56px;height:4px;background:#F1F5F9;border-radius:2px;overflow:hidden;flex-shrink:0;">
                    <div :style="{ width: plano.utilization + '%', height: '100%', borderRadius: '2px', background: '#3B82F6' }"></div>
                  </div>
                  <span style="font-size:11px;font-weight:600;color:#334155;min-width:30px;">{{ plano.utilization }}%</span>
                </div>
              </td>
              <td style="padding:13px 12px;">
                <span :style="pillStyle(plano.status)">{{ pillLabel(plano.status) }}</span>
              </td>
              <td style="padding:13px 12px;font-size:12px;color:#94A3B8;white-space:nowrap;">{{ plano.modified }}</td>
              <td style="padding:13px 20px 13px 12px;" @click.stop>
                <div style="display:flex;justify-content:flex-end;">
                  <button @click.stop="toggleMenu(plano.id, $event)"
                    style="background:transparent;border:1px solid #E2E8F0;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:13px;color:#64748B;font-weight:500;line-height:1;letter-spacing:2px;">
                    ···
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div v-if="filtered.length > 0" style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;">
        <div style="font-size:12px;color:#CBD5E1;">{{ filtered.length }} of {{ store.planograms.length }} planograms</div>
        <div style="display:flex;gap:4px;">
          <button v-for="p in ['◄','1','2','3','►']" :key="p"
            :style="p === '1'
              ? 'width:28px;height:28px;border-radius:6px;border:1px solid #F1F5F9;background:#F8FAFC;color:#334155;font-size:12px;font-weight:500;cursor:pointer;'
              : 'width:28px;height:28px;border-radius:6px;border:1px solid #F1F5F9;background:transparent;color:#94A3B8;font-size:12px;cursor:pointer;'">
            {{ p }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Sparkles, ChevronDown, X, Move } from 'lucide-vue-next'
import { usePlanogramStore } from '~/stores/planogram'
import type { Planogram } from '~/stores/planogram'

const store = usePlanogramStore()
const router = useRouter()

const search      = ref('')
const statusFilter = ref('all')
const sortKey     = ref('modified')
const openMenuId  = ref<number | null>(null)
const menuPos     = ref({ top: 0, right: 0 })
const detailsTarget = ref<Planogram | null>(null)
const deleteTarget  = ref<Planogram | null>(null)
const showNewMenu = ref(false)
const toast       = ref<string | null>(null)

const STATUS_TABS = [
  { value: 'all',      label: 'All' },
  { value: 'active',   label: 'Active' },
  { value: 'draft',    label: 'Draft' },
  { value: 'pending',  label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
]

const PILL_META: Record<string, { bg: string; tc: string; label: string }> = {
  active:   { bg: '#ECFDF5', tc: '#166634', label: 'Active' },
  draft:    { bg: '#F1F5F9', tc: '#64748B', label: 'Draft' },
  pending:  { bg: '#FFFBEB', tc: '#92400E', label: 'Pending' },
  inactive: { bg: '#F8FAFC', tc: '#94A3B8', label: 'Inactive' },
  archived: { bg: '#F5F3FF', tc: '#7C3AED', label: 'Archived' },
}

function pillStyle(status: string) {
  const m = PILL_META[status] ?? PILL_META.draft
  return `display:inline-block;background:${m.bg};color:${m.tc};font-size:11px;font-weight:500;padding:3px 8px;border-radius:4px;white-space:nowrap;`
}
function pillLabel(status: string) {
  return (PILL_META[status] ?? PILL_META.draft).label
}

const filtered = computed(() => {
  let r = [...store.planograms]
  if (search.value) {
    const q = search.value.toLowerCase()
    r = r.filter(p => p.name.toLowerCase().includes(q) || p.asset.toLowerCase().includes(q))
  }
  if (statusFilter.value !== 'all') r = r.filter(p => p.status === statusFilter.value)
  if (sortKey.value === 'compliance')  r.sort((a, b) => b.compliance  - a.compliance)
  if (sortKey.value === 'utilization') r.sort((a, b) => b.utilization - a.utilization)
  if (sortKey.value === 'skuCount')    r.sort((a, b) => b.skuCount    - a.skuCount)
  return r
})

const activeMenuPlano = computed(() =>
  openMenuId.value !== null ? store.planograms.find(p => p.id === openMenuId.value) ?? null : null
)

const drawerSections = computed(() => {
  const p = detailsTarget.value
  if (!p) return []
  return [
    { heading: 'Asset',         rows: [['Name', p.asset], ['Type', p.assetType], ['Region', p.region]] },
    { heading: 'Configuration', rows: [['Racks', String(p.racks)], ['Shelves per rack', String(p.shelves)], ['SKU count', String(p.skuCount)]] },
    { heading: 'Performance',   rows: [['Utilization', `${p.utilization}%`], ['Compliance', `${p.compliance}/100`], ['Approval stage', `${p.approvalStage}/3`]] },
    { heading: 'History',       rows: [['Created by', p.createdBy], ['Last modified', p.modified], ['Published', p.published ?? 'Not yet published']] },
  ]
})

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 2400)
}

function toggleMenu(planoId: number, event: MouseEvent) {
  if (openMenuId.value === planoId) { openMenuId.value = null; return }
  const btn = event.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  menuPos.value = { top: rect.bottom + 4, right: window.innerWidth - rect.right }
  openMenuId.value = planoId
}

function handleEdit() {
  detailsTarget.value = null
  router.push('/studio')
}
function handleToggle(plano: Planogram) {
  const next = plano.status === 'active' ? 'inactive' : 'active'
  store.updatePlanogram(plano.id, { status: next as Planogram['status'] })
  showToast(`"${plano.name}" ${next === 'active' ? 'activated' : 'deactivated'}`)
}
function handleDuplicate(plano: Planogram) {
  store.duplicatePlanogram(plano.id)
  showToast(`"${plano.name}" duplicated`)
}
function handleDeleteRequest(plano: Planogram) {
  detailsTarget.value = null
  deleteTarget.value = plano
}
function confirmDelete() {
  if (!deleteTarget.value) return
  store.deletePlanogram(deleteTarget.value.id)
  showToast('Planogram deleted')
  deleteTarget.value = null
}
function handleRegenerate() {
  router.push('/ai-generator')
}
</script>

<style scoped>
.th {
  padding: 10px 12px;
  font-size: 11px;
  font-weight: 500;
  color: #CBD5E1;
  letter-spacing: 0.3px;
  white-space: nowrap;
}
.trow {
  cursor: pointer;
  background: white;
  transition: background 0.1s;
}
.trow:hover { background: #FAFAFA; }
.mitem {
  width: 100%; display: block;
  padding: 8px 14px; border: none;
  background: transparent; font-size: 13px;
  font-weight: 400; color: #334155;
  cursor: pointer; text-align: left; line-height: 1;
}
.mitem:hover { background: #F8FAFC; }
.mitem--hl { font-weight: 600; color: #3B82F6; }
.mitem--del { color: #DC2626; }
.mitem--del:hover { background: #FEF2F2; }
.dmitem {
  width: 100%; display: flex; align-items: flex-start;
  gap: 10px; padding: 10px 14px;
  border: none; background: transparent; cursor: pointer; text-align: left;
}
.dmitem:hover { background: #F8FAFC; }
.drawer-enter-active, .drawer-leave-active { transition: transform 0.25s ease; }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.2s; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; }
</style>
