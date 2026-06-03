<template>
  <div style="padding:28px 32px;" @click="closeRejectModal">

    <!-- Toast -->
    <Transition name="toast-fade">
      <div v-if="toastMsg"
        style="position:fixed;bottom:24px;right:24px;z-index:300;pointer-events:none;">
        <div :style="`display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:10px;font-size:13px;font-weight:600;color:white;box-shadow:0 8px 24px rgba(0,0,0,0.18);background:${toastColor};`">
          <component :is="toastIcon" :size="15"/>
          {{ toastMsg }}
        </div>
      </div>
    </Transition>

    <!-- Reject reason modal -->
    <div v-if="showRejectModal" style="position:fixed;inset:0;background:rgba(15,23,42,0.5);z-index:200;display:flex;align-items:center;justify-content:center;" @click.self="closeRejectModal">
      <div style="background:white;border-radius:14px;width:420px;padding:24px;box-shadow:0 24px 64px rgba(15,23,42,0.2);">
        <div style="font-size:15px;font-weight:700;color:#0F172A;margin-bottom:6px;">Reject Planogram</div>
        <div style="font-size:13px;color:#64748B;margin-bottom:16px;">
          "{{ rejectTarget?.name }}" will be returned to draft. Add a reason so the author knows what to fix.
        </div>
        <textarea v-model="rejectReason" placeholder="e.g. Missing mandatory SKUs on shelf 3, compliance threshold not met…"
          rows="3"
          style="width:100%;border:1px solid #E2E8F0;border-radius:8px;padding:10px 12px;font-size:13px;color:#0F172A;outline:none;resize:none;box-sizing:border-box;background:#F8FAFC;"
        />
        <div v-if="rejectError" style="font-size:12px;color:#EF4444;margin-top:6px;">{{ rejectError }}</div>
        <div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end;">
          <button @click="closeRejectModal" style="background:transparent;border:1px solid #E2E8F0;border-radius:8px;padding:8px 18px;font-size:13px;cursor:pointer;color:#475569;">Cancel</button>
          <button @click="confirmReject" style="background:#EF4444;color:white;border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:600;cursor:pointer;">Reject & Return</button>
        </div>
      </div>
    </div>

    <!-- Page header -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;">
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
          <div style="font-size:20px;font-weight:800;color:#0F172A;">Tasks & Approvals</div>
          <span v-if="pendingCount > 0"
            style="font-size:11px;font-weight:700;padding:2px 9px;border-radius:99px;background:#FFFBEB;color:#92400E;border:1px solid #FDE68A;">
            {{ pendingCount }} pending
          </span>
        </div>
        <div style="font-size:13px;color:#64748B;">Review planograms awaiting your approval before they go live.</div>
      </div>
      <NuxtLink to="/configs"
        style="display:flex;align-items:center;gap:6px;background:white;border:1px solid #E2E8F0;border-radius:8px;padding:8px 14px;font-size:13px;color:#475569;text-decoration:none;font-weight:500;">
        <LayoutGrid :size="14"/> View All Planograms
      </NuxtLink>
    </div>

    <!-- Filter tabs -->
    <div style="display:flex;background:#F1F5F9;border-radius:8px;padding:3px;width:fit-content;margin-bottom:20px;">
      <button v-for="f in filters" :key="f.id" @click="activeFilter=f.id"
        :style="`display:flex;align-items:center;gap:6px;padding:6px 16px;border-radius:6px;border:none;cursor:pointer;font-size:13px;font-weight:${activeFilter===f.id?600:400};background:${activeFilter===f.id?'white':'transparent'};color:${activeFilter===f.id?'#0F172A':'#64748B'};box-shadow:${activeFilter===f.id?'0 1px 3px rgba(0,0,0,0.1)':'none'};transition:all 0.15s;`">
        {{ f.label }}
        <span v-if="f.count > 0"
          :style="`font-size:10px;font-weight:700;padding:1px 6px;border-radius:99px;background:${activeFilter===f.id?'#F1F5F9':'#E2E8F0'};color:#475569;`">
          {{ f.count }}
        </span>
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="filteredTasks.length === 0"
      style="text-align:center;padding:64px 32px;background:white;border:1px solid #E2E8F0;border-radius:12px;">
      <CheckCircle :size="40" color="#10B981" style="margin:0 auto 12px;display:block;"/>
      <div style="font-size:15px;font-weight:600;color:#0F172A;margin-bottom:4px;">All caught up</div>
      <div style="font-size:13px;color:#64748B;">No planograms waiting for review right now.</div>
    </div>

    <!-- Task list -->
    <div v-else style="display:flex;flex-direction:column;gap:10px;">
      <div v-for="p in filteredTasks" :key="p.id"
        style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:18px 20px;display:flex;align-items:center;gap:16px;transition:box-shadow 0.15s;"
        @mouseenter="(e:any)=>e.currentTarget.style.boxShadow='0 4px 16px rgba(15,23,42,0.07)'"
        @mouseleave="(e:any)=>e.currentTarget.style.boxShadow='none'">

        <!-- Asset icon -->
        <div style="width:48px;height:48px;border-radius:10px;background:#F8FAFC;border:1px solid #E2E8F0;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">
          {{ p.assetImg }}
        </div>

        <!-- Main info -->
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
            <div style="font-size:14px;font-weight:700;color:#0F172A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ p.name }}</div>
            <span :style="`font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;${statusStyle(p.status)}`">
              {{ p.status.charAt(0).toUpperCase()+p.status.slice(1) }}
            </span>
          </div>
          <div style="font-size:12px;color:#64748B;margin-bottom:8px;">
            {{ p.assetType }} · {{ p.region }} · {{ p.skuCount }} SKUs · by {{ p.createdBy }}
          </div>

          <!-- Approval stage track -->
          <div style="display:flex;align-items:center;gap:6px;">
            <div v-for="(stage, i) in STAGE_LABELS" :key="i" style="display:flex;align-items:center;gap:4px;">
              <div style="display:flex;align-items:center;gap:4px;">
                <div :style="`width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;flex-shrink:0;${p.approvalStage > i ? 'background:#10B981;color:white;' : p.approvalStage === i ? 'background:#F59E0B;color:white;' : 'background:#F1F5F9;color:#94A3B8;'}`">
                  <Check v-if="p.approvalStage > i" :size="10"/>
                  <span v-else>{{ i+1 }}</span>
                </div>
                <span :style="`font-size:10px;font-weight:${p.approvalStage===i?600:400};color:${p.approvalStage>i?'#059669':p.approvalStage===i?'#D97706':'#94A3B8'};white-space:nowrap;`">
                  {{ stage }}
                </span>
              </div>
              <div v-if="i < STAGE_LABELS.length-1" :style="`width:20px;height:1.5px;border-radius:2px;background:${p.approvalStage>i?'#10B981':'#E2E8F0'};flex-shrink:0;`"/>
            </div>
          </div>
        </div>

        <!-- Metrics -->
        <div style="display:flex;gap:12px;flex-shrink:0;">
          <div style="text-align:center;">
            <div :style="`font-size:16px;font-weight:800;color:${complianceColor(p.compliance)};`">{{ p.compliance }}%</div>
            <div style="font-size:10px;color:#94A3B8;font-weight:500;">Compliance</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:16px;font-weight:800;color:#0F172A;">{{ p.utilization }}%</div>
            <div style="font-size:10px;color:#94A3B8;font-weight:500;">Utilization</div>
          </div>
        </div>

        <!-- Modified date -->
        <div style="text-align:right;flex-shrink:0;min-width:80px;">
          <div style="font-size:11px;color:#94A3B8;">Modified</div>
          <div style="font-size:12px;font-weight:600;color:#475569;">{{ p.modified }}</div>
        </div>

        <!-- Actions -->
        <div style="display:flex;gap:8px;flex-shrink:0;">
          <NuxtLink to="/configs"
            style="display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:7px;border:1px solid #E2E8F0;background:white;font-size:12px;font-weight:500;color:#475569;cursor:pointer;text-decoration:none;"
            @mouseenter="(e:any)=>e.currentTarget.style.background='#F8FAFC'"
            @mouseleave="(e:any)=>e.currentTarget.style.background='white'">
            <Eye :size="13"/> View
          </NuxtLink>
          <button @click.stop="openRejectModal(p)"
            style="display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:7px;border:1px solid #FECACA;background:white;font-size:12px;font-weight:500;color:#EF4444;cursor:pointer;"
            @mouseenter="(e:any)=>{e.currentTarget.style.background='#FEF2F2'}"
            @mouseleave="(e:any)=>{e.currentTarget.style.background='white'}">
            <XCircle :size="13"/> Reject
          </button>
          <button @click.stop="approve(p)"
            style="display:flex;align-items:center;gap:5px;padding:7px 14px;border-radius:7px;border:none;background:#10B981;color:white;font-size:12px;font-weight:600;cursor:pointer;"
            @mouseenter="(e:any)=>e.currentTarget.style.background='#059669'"
            @mouseleave="(e:any)=>e.currentTarget.style.background='#10B981'">
            <CheckCircle :size="13"/> Approve
          </button>
        </div>
      </div>
    </div>

    <!-- Recently actioned section -->
    <div v-if="recentlyActioned.length" style="margin-top:32px;">
      <div style="font-size:12px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px;">Recently Actioned</div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <div v-for="p in recentlyActioned" :key="p.id"
          style="background:white;border:1px solid #E2E8F0;border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:14px;opacity:0.75;">
          <span style="font-size:20px;">{{ p.assetImg }}</span>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:600;color:#334155;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ p.name }}</div>
            <div style="font-size:11px;color:#94A3B8;">{{ p.assetType }} · {{ p.region }}</div>
          </div>
          <span :style="`font-size:11px;font-weight:600;padding:3px 9px;border-radius:4px;${statusStyle(p.status)}`">
            {{ p.status.charAt(0).toUpperCase()+p.status.slice(1) }}
          </span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Check, CheckCircle, XCircle, Eye, LayoutGrid } from 'lucide-vue-next'
import { usePlanogramStore } from '~/stores/planogram'

definePageMeta({ layout: 'default' })

const store = usePlanogramStore()

const STAGE_LABELS = ['Draft Review', 'Brand Check', 'Final Sign-off']

const activeFilter  = ref('pending')
const showRejectModal = ref(false)
const rejectTarget  = ref<any>(null)
const rejectReason  = ref('')
const rejectError   = ref('')
const toastMsg      = ref('')
const toastColor    = ref('#10B981')
const toastIcon     = ref<any>(CheckCircle)
let toastTimer: ReturnType<typeof setTimeout> | null = null

const filters = computed(() => [
  { id: 'pending',  label: 'Pending Review',   count: store.planograms.filter(p => p.status === 'pending').length },
  { id: 'active',   label: 'Recently Approved', count: store.planograms.filter(p => p.status === 'active').length },
  { id: 'draft',    label: 'Returned to Draft', count: store.planograms.filter(p => p.status === 'draft').length },
  { id: 'all',      label: 'All',               count: store.planograms.length },
])

const pendingCount = computed(() =>
  store.planograms.filter(p => p.status === 'pending').length
)

const filteredTasks = computed(() => {
  if (activeFilter.value === 'all') return store.planograms
  return store.planograms.filter(p => p.status === activeFilter.value)
})

const recentlyActioned = computed(() =>
  store.planograms.filter(p => p.status === 'active' || p.status === 'draft').slice(0, 3)
)

function statusStyle(s: string) {
  const map: Record<string, string> = {
    active:   'background:#F0FDF4;color:#065F46;',
    draft:    'background:#F1F5F9;color:#64748B;',
    pending:  'background:#FFFBEB;color:#92400E;',
    inactive: 'background:#F8FAFC;color:#94A3B8;',
    archived: 'background:#F5F3FF;color:#7C3AED;',
  }
  return map[s] || map.draft
}

function complianceColor(v: number) {
  if (v >= 80) return '#059669'
  if (v >= 65) return '#D97706'
  return '#DC2626'
}

function showToast(msg: string, color = '#10B981', icon: any = CheckCircle) {
  toastMsg.value = msg
  toastColor.value = color
  toastIcon.value = icon
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 3000)
}

function approve(p: any) {
  store.updatePlanogram(p.id, { status: 'active', approvalStage: 3, published: 'Today' })
  showToast(`"${p.name}" approved and published`, '#10B981', CheckCircle)
}

function openRejectModal(p: any) {
  rejectTarget.value = p
  rejectReason.value = ''
  rejectError.value  = ''
  showRejectModal.value = true
}

function closeRejectModal() {
  showRejectModal.value = false
  rejectTarget.value = null
}

function confirmReject() {
  if (!rejectReason.value.trim()) { rejectError.value = 'Please provide a reason'; return }
  store.updatePlanogram(rejectTarget.value.id, { status: 'draft', approvalStage: 0 })
  showToast(`"${rejectTarget.value.name}" returned to draft`, '#EF4444', XCircle)
  closeRejectModal()
}
</script>

<style scoped>
.toast-fade-enter-active, .toast-fade-leave-active { transition: all 0.25s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(8px); }
</style>
