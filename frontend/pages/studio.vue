<template>
  <div style="padding:24px;display:grid;grid-template-columns:300px 1fr;gap:16px;height:calc(100vh - 120px);">

    <!-- LEFT: Config panel -->
    <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;">
      <div style="padding:14px 18px;border-bottom:1px solid #F1F5F9;">
        <div style="font-size:14px;font-weight:700;color:#0F172A;margin-bottom:2px;">Planogram Configuration</div>
        <div style="font-size:12px;color:#64748B;">Asset · structure · capacity · views</div>
      </div>
      <div style="flex:1;overflow-y:auto;padding:14px 18px;">

        <!-- 1: Select Asset -->
        <div style="margin-bottom:18px;">
          <div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">1 · Select Asset</div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <button v-for="a in assets" :key="a.id" @click="globalAsset=a"
              :style="`display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:8px;border:1.5px solid ${globalAsset?.id===a.id?'#3B82F6':'#E2E8F0'};background:${globalAsset?.id===a.id?'#EFF6FF':'white'};cursor:pointer;transition:all 0.13s;text-align:left;`">
              <span style="font-size:16px;">{{ a.img }}</span>
              <div style="flex:1;min-width:0;">
                <div :style="`font-size:12px;font-weight:600;color:${globalAsset?.id===a.id?'#1D4ED8':'#0F172A'};`">{{ a.name }}</div>
                <div style="font-size:10px;color:#64748B;">{{ a.type }} · {{ a.shelves }} shelves</div>
              </div>
              <Check v-if="globalAsset?.id===a.id" :size="13" color="#3B82F6"/>
            </button>
          </div>
        </div>

        <!-- 2: Structure config (only when asset selected) -->
        <div v-if="globalAsset" style="margin-bottom:18px;">
          <div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;">
            2 · Structure — {{ activeView.charAt(0).toUpperCase()+activeView.slice(1) }} View
          </div>
          <div v-if="viewConfigs[activeView]===null" style="text-align:center;padding:16px 12px;border:1.5px dashed #E2E8F0;border-radius:8px;background:#F8FAFC;">
            <div style="font-size:12px;color:#94A3B8;margin-bottom:8px;">No {{ activeView }} view configured</div>
            <button @click="activateView()" style="background:#3B82F6;color:white;border:none;border-radius:7px;padding:7px 14px;font-size:12px;font-weight:600;cursor:pointer;">Configure View</button>
          </div>
          <template v-else>
            <div v-for="sl in sliderFields" :key="sl.key" style="margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <label style="font-size:12px;font-weight:500;color:#374151;">{{ sl.label }}</label>
                <div :style="`background:${sl.cm?'#F1F5F9':'#EFF6FF'};border-radius:4px;padding:1px 9px;font-size:12px;font-weight:700;color:${sl.cm?'#0F172A':'#1D4ED8'};`">
                  {{ cfg[sl.key] }}{{ sl.cm?'cm':'' }}
                </div>
              </div>
              <input type="range" :min="sl.min" :max="sl.max" :value="cfg[sl.key]" @input="e=>updateCfg(sl.key,+(e.target as HTMLInputElement).value)" style="width:100%;"/>
            </div>
          </template>
        </div>

        <!-- 3: Mandatory SKUs -->
        <div style="margin-bottom:18px;">
          <div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">3 · Mandatory SKUs</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;">
            <button v-for="s in mandatorySKUs" :key="s.id"
              @click="toggleMustHave(s.name)"
              :style="`padding:4px 9px;border-radius:20px;border:1.5px solid ${mustHave.includes(s.name)?'#3B82F6':'#E2E8F0'};background:${mustHave.includes(s.name)?'#EFF6FF':'white'};color:${mustHave.includes(s.name)?'#1D4ED8':'#64748B'};font-size:11px;font-weight:${mustHave.includes(s.name)?600:400};cursor:pointer;display:flex;align-items:center;gap:3px;`">
              <Check v-if="mustHave.includes(s.name)" :size="9" color="#3B82F6"/>
              {{ s.name }}
            </button>
          </div>
        </div>

        <!-- 4: Reference image toggle -->
        <div style="margin-bottom:4px;">
          <button @click="showRef=!showRef"
            style="width:100%;display:flex;align-items:center;gap:7px;padding:8px 12px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;cursor:pointer;font-size:12px;font-weight:500;color:#475569;justify-content:space-between;">
            <span style="display:flex;align-items:center;gap:6px;">
              <Upload :size="13"/> Reference Image
            </span>
            <ChevronRight :size="13" :style="`transform:${showRef?'rotate(90deg)':'none'};transition:transform 0.15s;`"/>
          </button>
          <div v-if="showRef" style="margin-top:8px;">
            <div style="background:white;border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;">
              <div style="padding:9px 14px;border-bottom:1px solid #F1F5F9;display:flex;align-items:center;justify-content:space-between;">
                <div style="font-size:12px;font-weight:600;color:#374151;">Reference Planogram</div>
                <span style="background:#F8FAFC;color:#475569;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;">{{ activeView }} view</span>
              </div>
              <div style="padding:12px;">
                <div v-if="refImages[activeView]" style="position:relative;">
                  <img :src="appendSas(refImages[activeView]) ?? undefined" alt="ref"
                    style="width:100%;border-radius:6px;border:1px solid #E2E8F0;display:block;max-height:180px;object-fit:contain;background:#F8FAFC;"
                    @error="refImages[activeView]=null"/>
                  <div v-if="refUploading" style="position:absolute;inset:0;background:rgba(255,255,255,0.75);display:flex;align-items:center;justify-content:center;border-radius:6px;">
                    <div style="width:22px;height:22px;border:2px solid #BFDBFE;border-top-color:#3B82F6;border-radius:50%;animation:spin 0.7s linear infinite;"/>
                  </div>
                  <button v-if="!refUploading" @click="refImages[activeView]=null"
                    style="position:absolute;top:6px;right:6px;background:rgba(239,68,68,0.85);border:none;border-radius:5px;padding:3px 8px;font-size:10px;color:white;cursor:pointer;">
                    Remove
                  </button>
                </div>
                <label v-else style="display:block;position:relative;border:1.5px dashed #E2E8F0;border-radius:8px;padding:18px 12px;text-align:center;background:#F8FAFC;cursor:pointer;transition:all 0.15s;"
                  @mouseenter="e=>{(e.currentTarget as HTMLElement).style.borderColor='#3B82F6';(e.currentTarget as HTMLElement).style.background='#EFF6FF';}"
                  @mouseleave="e=>{(e.currentTarget as HTMLElement).style.borderColor='#E2E8F0';(e.currentTarget as HTMLElement).style.background='#F8FAFC';}">
                  <Upload :size="18" color="#CBD5E1" style="margin:0 auto 6px;display:block;"/>
                  <div style="font-size:12px;font-weight:500;color:#94A3B8;margin-bottom:3px;">Upload reference image</div>
                  <div style="font-size:10px;color:#CBD5E1;">Ideal planogram · {{ activeView }} view</div>
                  <input type="file" accept="image/*" @change="handleRefUpload" style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;"/>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding:12px 18px;border-top:1px solid #E2E8F0;display:flex;flex-direction:column;gap:8px;">
        <div v-if="!globalAsset" style="display:flex;gap:7px;align-items:center;background:#FFFBEB;border:1px solid #FDE68A;border-radius:7px;padding:8px 11px;">
          <AlertTriangle :size="13" color="#F59E0B"/>
          <span style="font-size:12px;color:#92400E;">Select an asset to enable generation</span>
        </div>
        <button :disabled="!globalAsset" @click="router.push('/workspace')"
          :style="`display:flex;align-items:center;justify-content:center;gap:7px;background:${globalAsset?'linear-gradient(135deg,#3B82F6,#7C3AED)':'#E2E8F0'};color:${globalAsset?'white':'#94A3B8'};border:none;border-radius:9px;padding:10px 0;font-size:13px;font-weight:700;cursor:${globalAsset?'pointer':'not-allowed'};`">
          <Zap :size="14"/> Generate &amp; Open Workspace
        </button>
      </div>
    </div>

    <!-- RIGHT: Preview panel -->
    <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;">
      <div style="padding:11px 16px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <!-- View tabs -->
        <div style="display:flex;background:#F1F5F9;border-radius:7px;padding:3px;gap:2px;">
          <button v-for="v in ['front','left','right']" :key="v" @click="activeView=v"
            :style="`padding:5px 14px;border-radius:5px;border:none;font-size:12px;font-weight:${activeView===v?600:400};cursor:pointer;background:${activeView===v?'white':'transparent'};color:${activeView===v?'#0F172A':'#94A3B8'};box-shadow:${activeView===v?'0 1px 3px rgba(0,0,0,0.08)':'none'};transition:all 0.12s;display:flex;align-items:center;gap:5px;white-space:nowrap;`">
            {{ v==='front'?'Front View':v==='left'?'Left View':'Right View' }}
            <span v-if="viewConfigs[v]===null&&v!=='front'" style="font-size:9px;background:#E2E8F0;color:#94A3B8;border-radius:3px;padding:1px 5px;font-weight:500;">Empty</span>
          </button>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px;align-items:center;">
          <!-- Preview mode toggle -->
          <div style="display:flex;background:#F1F5F9;border-radius:6px;padding:3px;gap:2px;">
            <button v-for="[val,label] in [['edit','Edit'],['realistic','Preview']]" :key="val" @click="previewMode=val"
              :style="`padding:4px 12px;border-radius:4px;border:none;font-size:11px;font-weight:${previewMode===val?600:400};cursor:pointer;background:${previewMode!==val?'transparent':val==='realistic'?'#0F172A':'white'};color:${previewMode!==val?'#94A3B8':val==='realistic'?'white':'#0F172A'};box-shadow:${previewMode===val?'0 1px 2px rgba(0,0,0,0.08)':'none'};transition:all 0.12s;`">
              {{ label }}
            </button>
          </div>
          <span v-if="globalAsset" style="background:#F0FDF4;color:#166534;font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;">Live</span>
        </div>
      </div>

      <div style="flex:1;overflow:auto;background:#F8FAFC;display:flex;flex-direction:column;">
        <!-- Empty state -->
        <div v-if="!globalAsset" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:48px;">
          <div style="width:80px;height:80px;border-radius:50%;background:#F1F5F9;display:flex;align-items:center;justify-content:center;">
            <Layers :size="32" color="#CBD5E1"/>
          </div>
          <div style="text-align:center;">
            <div style="font-size:15px;font-weight:600;color:#94A3B8;margin-bottom:5px;">Start configuring shelves to generate preview</div>
            <div style="font-size:13px;color:#CBD5E1;">Select an asset from the left panel to begin</div>
          </div>
          <div style="opacity:0.25;pointer-events:none;margin-top:4px;">
            <AssetFixtureSVG asset-type="Rack" :width="220" :shelves-per-rack="4" :rack-count="2" :shelf-width="90"/>
          </div>
        </div>

        <!-- Side view not configured -->
        <div v-else-if="viewConfigs[activeView]===null&&activeView!=='front'" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:48px;">
          <div style="width:64px;height:64px;border-radius:50%;background:#F1F5F9;display:flex;align-items:center;justify-content:center;">
            <Eye :size="24" color="#CBD5E1"/>
          </div>
          <div style="text-align:center;">
            <div style="font-size:14px;font-weight:600;color:#94A3B8;margin-bottom:5px;">No {{ activeView }} view configured yet</div>
            <div style="font-size:12px;color:#CBD5E1;margin-bottom:16px;">Configure this view to generate a separate preview</div>
            <button @click="activateView()" style="background:#3B82F6;color:white;border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">
              <Plus :size="13"/> Configure View
            </button>
          </div>
        </div>

        <!-- Live fixture preview -->
        <div v-else style="padding:20px 24px;flex:1;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
            <div style="font-size:13px;font-weight:600;color:#0F172A;">{{ globalAsset.name }}</div>
            <span style="background:#EFF6FF;color:#1D4ED8;font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;">{{ globalAsset.type }}</span>
            <span style="background:#F8FAFC;color:#475569;font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;">{{ cfg.rackCount }} racks · {{ cfg.shelvesPerRack }} shelves</span>
            <span style="background:#F0FDF4;color:#166534;font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;">{{ cfg.rackCount*cfg.shelvesPerRack*Math.floor(cfg.shelfWidth/15) }} total slots</span>
          </div>

          <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:16px;">
            <div style="flex:1;">
              <div style="font-size:11px;font-weight:600;color:#94A3B8;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.7px;">
                {{ previewMode==='edit'?'Structure Preview':'Realistic Preview' }} · {{ activeView.charAt(0).toUpperCase()+activeView.slice(1) }} View
              </div>
              <div style="background:#1E293B;border-radius:10px;padding:16px 12px;display:flex;gap:12px;flex-wrap:wrap;">
                <div v-for="ri in Math.min(cfg.rackCount,3)" :key="ri">
                  <div style="font-size:9px;color:#64748B;margin-bottom:5px;text-align:center;font-weight:600;">RACK {{ ri }}</div>
                  <AssetFixtureSVG :asset-type="globalAsset.type" :width="Math.min(200,Math.floor(560/Math.min(cfg.rackCount,3))-16)" :shelves-per-rack="cfg.shelvesPerRack" :rack-count="1" :shelf-width="cfg.shelfWidth"/>
                </div>
                <div v-if="cfg.rackCount>3" style="display:flex;align-items:center;justify-content:center;padding:0 8px;">
                  <div style="text-align:center;color:#64748B;">
                    <div style="font-size:18px;font-weight:700;">+{{ cfg.rackCount-3 }}</div>
                    <div style="font-size:9px;">more</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="refImages[activeView]" style="width:200px;flex-shrink:0;">
              <div style="font-size:11px;font-weight:600;color:#94A3B8;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.7px;">Reference · {{ activeView }}</div>
              <img :src="appendSas(refImages[activeView]) ?? undefined" alt="ref"
                style="width:100%;border-radius:8px;border:1px solid #E2E8F0;display:block;object-fit:contain;max-height:280px;background:white;"
                @error="refImages[activeView]=null"/>
            </div>
          </div>

          <!-- Capacity summary -->
          <div style="background:white;border-radius:9px;padding:11px 16px;border:1px solid #E2E8F0;margin-bottom:12px;">
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
              <div v-for="[k,v] in [['Racks',cfg.rackCount],['Shelves/Rack',cfg.shelvesPerRack],['Max Slots/Shelf',cfg.maxSKU],['Total Capacity',cfg.rackCount*cfg.shelvesPerRack*cfg.maxSKU]]" :key="k" style="text-align:center;">
                <div style="font-size:18px;font-weight:800;color:#0F172A;">{{ v }}</div>
                <div style="font-size:10px;color:#94A3B8;margin-top:1px;">{{ k }}</div>
              </div>
            </div>
          </div>

          <!-- Configured views -->
          <div style="display:flex;gap:6px;">
            <div v-for="v in ['front','left','right']" :key="v"
              :style="`flex:1;padding:7px 10px;border-radius:7px;border:1px solid ${v==='front'||viewConfigs[v]!==null?'#BFDBFE':'#E2E8F0'};background:${v==='front'||viewConfigs[v]!==null?'#EFF6FF':'#F8FAFC'};text-align:center;`">
              <div :style="`font-size:11px;font-weight:600;color:${v==='front'||viewConfigs[v]!==null?'#1D4ED8':'#94A3B8'};`">{{ v.charAt(0).toUpperCase()+v.slice(1) }}</div>
              <div :style="`font-size:9px;color:${v==='front'||viewConfigs[v]!==null?'#3B82F6':'#CBD5E1'};`">{{ v==='front'||viewConfigs[v]!==null?'Configured':'Not set' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, defineComponent, h, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Check, ChevronRight, Eye, Layers, Plus, Upload, Zap, AlertTriangle } from 'lucide-vue-next'
import { usePlanogramStore, appendSas } from '~/stores/planogram'

definePageMeta({ layout: 'default' })

const router = useRouter()
const store = usePlanogramStore()

const globalAsset = ref<any>(null)
const activeView = ref('front')
const previewMode = ref('edit')
const showRef = ref(false)

const DEFAULT_CFG = { rackCount: 2, shelvesPerRack: 5, shelfWidth: 90, shelfHeight: 30, maxSKU: 6 }

const viewConfigs = reactive<Record<string,any>>({ front: { ...DEFAULT_CFG }, left: null, right: null })
const refImages    = reactive<Record<string,string|null>>({ front: null, left: null, right: null })
const refUploading = ref(false)
const mustHave    = ref<string[]>(['Kingfisher Prem 650ml','Heineken 330ml'])

// Auto-load ideal image: first from store, then fallback-check Azure
watch(globalAsset, async (asset) => {
  if (!asset) return
  refImages.front = null; refImages.left = null; refImages.right = null

  const entry = store.idealImages[asset.id]
  const views: Array<'front'|'left'> = ['front', 'left']

  for (const v of views) {
    if (entry?.[v]) {
      // already known in store (seeded or previously uploaded)
      refImages[v] = entry[v]
    } else {
      // ask server to HEAD-check Azure for this asset/view
      try {
        const data = await $fetch<{ url: string | null }>(`/api/ideal-image?assetId=${asset.id}&view=${v}`)
        if (data.url) {
          refImages[v] = data.url
          store.updateIdealImage(asset.id, v, data.url)
        }
      } catch { /* no image found */ }
    }
  }
}, { immediate: true })

const cfg = computed(() => viewConfigs[activeView.value] || DEFAULT_CFG)

const assets = computed(() => store.assets)
const mandatorySKUs = computed(() => store.skus.filter(s => s.mandatory))

const sliderFields = [
  { label: 'Racks',          key: 'rackCount',     min: 1, max: 6,   cm: false },
  { label: 'Shelves / Rack', key: 'shelvesPerRack', min: 1, max: 8,   cm: false },
  { label: 'Max SKU Slots',  key: 'maxSKU',         min: 2, max: 12,  cm: false },
  { label: 'Shelf Width (cm)',  key: 'shelfWidth',  min: 30, max: 200, cm: true },
  { label: 'Shelf Height (cm)', key: 'shelfHeight', min: 15, max: 60,  cm: true },
]

function updateCfg(key: string, val: number) {
  if (viewConfigs[activeView.value]) viewConfigs[activeView.value][key] = val
}

function activateView() {
  viewConfigs[activeView.value] = { ...DEFAULT_CFG }
}

function toggleMustHave(name: string) {
  if (mustHave.value.includes(name)) {
    mustHave.value = mustHave.value.filter(n => n !== name)
  } else {
    mustHave.value = [...mustHave.value, name]
  }
}

async function handleRefUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const view    = activeView.value
  const assetId = globalAsset.value?.id ?? 1

  // show local preview immediately
  refImages[view] = URL.createObjectURL(file)
  refUploading.value = true

  try {
    const ext      = file.name.split('.').pop() ?? 'jpg'
    const blobPath = `ideal-planograms/asset-${assetId}/${view}_${Date.now()}.${ext}`
    const fd       = new FormData()
    fd.append('file', file)
    fd.append('blobPath', blobPath)
    const res  = await fetch('/api/upload-blob', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok && data.url) {
      refImages[view] = data.url
      // persist in store so workspace also picks it up
      const storeView = view === 'right' ? 'left' : view as 'front' | 'back' | 'left'
      store.updateIdealImage(assetId, storeView, data.url)
    }
  } catch { /* keep local blob URL */ } finally {
    refUploading.value = false
  }
}

// ─── Asset Fixture SVG Component ─────────────────────────────────────────────
const AssetFixtureSVG = defineComponent({
  props: {
    assetType: String,
    width: { type: Number, default: 280 },
    shelvesPerRack: { type: Number, default: 5 },
    rackCount: { type: Number, default: 2 },
    shelfWidth: { type: Number, default: 90 },
  },
  setup(props) {
    return () => {
      const sw = Math.max(80, props.width!)
      const ns = Math.min(Math.max(1, props.shelvesPerRack!), 7)
      const sh = Math.min(320, Math.max(180, ns * 46 + 60))
      const gap = Math.floor((sh - 44) / ns)
      const slots = Math.max(3, Math.floor(props.shelfWidth! / 18))
      const t = props.assetType

      if (t === 'Visicooler') {
        const nd = Math.min(Math.max(1, props.rackCount!), 3)
        const dw = Math.max(18, Math.floor((sw - 16 - 6 * (nd - 1)) / nd))
        return h('svg', { width: sw, height: sh, style: 'display:block' }, [
          h('rect', { x: 1, y: 1, width: sw - 2, height: sh - 2, rx: 5, fill: '#1E293B', stroke: '#334155', 'stroke-width': 1.5 }),
          ...Array.from({ length: nd }, (_, i) => {
            const dx = 8 + i * (dw + 6)
            return h('g', { key: i }, [
              h('rect', { x: dx, y: 10, width: dw, height: sh - 30, rx: 3, fill: '#0F172A', stroke: '#334155', 'stroke-width': 1 }),
              h('rect', { x: dx + 2, y: 12, width: Math.max(0, dw - 4), height: Math.max(0, sh - 34), rx: 2, fill: '#38BDF8', 'fill-opacity': 0.05 }),
              ...Array.from({ length: ns }, (_, si) =>
                h('rect', { key: si, x: dx + 4, y: 12 + (si + 1) * Math.floor((sh - 40) / ns), width: Math.max(0, dw - 8), height: 2, rx: 1, fill: '#334155', 'fill-opacity': 0.8 })
              ),
              h('rect', { x: dx + Math.floor(dw / 2) - 2, y: Math.floor(sh / 2) - 12, width: 4, height: 24, rx: 2, fill: '#64748B' }),
            ])
          }),
          h('rect', { x: 4, y: sh - 18, width: sw - 8, height: 14, rx: 2, fill: '#1E293B', stroke: '#334155', 'stroke-width': 1 }),
          h('rect', { x: 4, y: 3, width: sw - 8, height: 5, rx: 2, fill: '#3B82F6', 'fill-opacity': 0.25 }),
        ])
      }

      if (t === 'Gondola') {
        const hw = Math.max(16, Math.floor(sw / 2) - 10)
        return h('svg', { width: sw, height: sh, style: 'display:block' }, [
          h('rect', { x: 0, y: sh - 10, width: sw, height: 10, rx: 2, fill: '#334155' }),
          h('rect', { x: Math.floor(sw / 2) - 4, y: 0, width: 8, height: sh - 10, fill: '#475569' }),
          h('rect', { x: 0, y: 0, width: 6, height: sh - 10, fill: '#475569' }),
          h('rect', { x: sw - 6, y: 0, width: 6, height: sh - 10, fill: '#475569' }),
          ...Array.from({ length: ns }, (_, si) => {
            const y = 14 + si * gap
            return h('g', { key: si }, [
              h('rect', { x: 6, y: y + gap - 4, width: hw, height: 3, rx: 1, fill: '#64748B' }),
              h('rect', { x: Math.floor(sw / 2) + 4, y: y + gap - 4, width: hw, height: 3, rx: 1, fill: '#64748B' }),
            ])
          }),
          h('text', { x: Math.floor(sw / 2), y: sh - 2, 'text-anchor': 'middle', fill: '#64748B', 'font-size': 7, 'font-family': 'system-ui' }, 'GONDOLA'),
        ])
      }

      if (t === 'End Cap') {
        const dp = Math.max(20, Math.floor((sw - 28) * 0.85))
        return h('svg', { width: sw, height: sh, style: 'display:block' }, [
          h('rect', { x: 8, y: 4, width: sw - 16, height: 24, rx: 3, fill: '#334155' }),
          h('text', { x: Math.floor(sw / 2), y: 20, 'text-anchor': 'middle', fill: '#94A3B8', 'font-size': 8, 'font-family': 'system-ui' }, 'HEADER'),
          h('rect', { x: 8, y: 30, width: sw - 16, height: sh - 46, rx: 2, fill: '#1E293B' }),
          h('rect', { x: 4, y: 30, width: 4, height: sh - 44, fill: '#475569' }),
          h('rect', { x: sw - 8, y: 30, width: 4, height: sh - 44, fill: '#475569' }),
          ...Array.from({ length: Math.min(ns, 5) }, (_, si) => {
            const usable = sh - 70; const step = Math.max(8, Math.floor(usable / Math.min(ns, 5))); const y = 34 + si * step
            return h('rect', { key: si, x: 12, y: y + step - 4, width: dp, height: 4, rx: 1, fill: '#475569' })
          }),
          h('rect', { x: 4, y: sh - 14, width: sw - 8, height: 10, rx: 2, fill: '#334155' }),
        ])
      }

      if (t === 'Counter') {
        const cH = Math.floor(sh * 0.52); const topH = Math.max(16, sh - cH - 22); const topStep = Math.max(8, Math.floor(topH / Math.min(ns, 3)))
        return h('svg', { width: sw, height: sh, style: 'display:block' }, [
          h('rect', { x: 4, y: sh - cH, width: sw - 8, height: cH, rx: 4, fill: '#1E293B', stroke: '#334155', 'stroke-width': 1.5 }),
          h('rect', { x: 2, y: sh - cH - 6, width: sw - 4, height: 8, rx: 2, fill: '#334155' }),
          h('rect', { x: 6, y: 4, width: 8, height: Math.max(0, sh - cH - 16), fill: '#334155' }),
          h('rect', { x: sw - 14, y: 4, width: 8, height: Math.max(0, sh - cH - 16), fill: '#334155' }),
          ...Array.from({ length: Math.min(ns, 3) }, (_, si) =>
            h('rect', { key: si, x: 16, y: 8 + si * topStep + topStep - 4, width: Math.max(0, sw - 32), height: 4, rx: 1, fill: '#475569' })
          ),
          h('circle', { cx: Math.floor(sw / 2) - 10, cy: sh - Math.floor(cH / 2), r: 3, fill: 'none', stroke: '#475569', 'stroke-width': 1.5 }),
          h('circle', { cx: Math.floor(sw / 2) + 10, cy: sh - Math.floor(cH / 2), r: 3, fill: 'none', stroke: '#475569', 'stroke-width': 1.5 }),
        ])
      }

      if (t === 'Rack') {
        const nr = Math.min(Math.max(1, props.rackCount!), 3)
        const rw = Math.max(20, Math.floor((sw - 8 * (nr + 1)) / nr))
        return h('svg', { width: sw, height: sh, style: 'display:block' }, [
          h('rect', { x: 4, y: sh - 10, width: sw - 8, height: 8, rx: 2, fill: '#334155' }),
          ...Array.from({ length: nr }, (_, ri) => {
            const rx = 8 + ri * (rw + 8)
            const slotW = Math.max(4, Math.floor((rw - 8) / Math.min(slots, 7)))
            return h('g', { key: ri }, [
              h('rect', { x: rx, y: 4, width: 4, height: sh - 18, rx: 1, fill: '#334155' }),
              h('rect', { x: rx + rw - 4, y: 4, width: 4, height: sh - 18, rx: 1, fill: '#334155' }),
              ...Array.from({ length: ns }, (_, si) => {
                const y = 14 + si * gap
                return h('g', { key: si }, [
                  h('rect', { x: rx + 4, y: y + gap - 5, width: Math.max(0, rw - 8), height: 4, rx: 1, fill: '#475569' }),
                  ...Array.from({ length: Math.min(slots, 7) }, (_, ci) =>
                    h('line', { key: ci, x1: rx + 4 + ci * slotW + 1, y1: y + 2, x2: rx + 4 + ci * slotW + 1, y2: y + gap - 6, stroke: '#334155', 'stroke-width': 0.8, 'stroke-opacity': 0.6 })
                  ),
                ])
              }),
            ])
          }),
        ])
      }

      // Default: Wall Shelf
      return h('svg', { width: sw, height: sh, style: 'display:block' }, [
        h('rect', { x: 0, y: 0, width: 6, height: sh, fill: '#E2E8F0' }),
        h('rect', { x: sw - 6, y: 0, width: 6, height: sh, fill: '#E2E8F0' }),
        ...Array.from({ length: ns }, (_, si) => {
          const y = 14 + si * gap
          return h('g', { key: si }, [
            h('rect', { x: 6, y: y + gap - 4, width: Math.max(0, sw - 12), height: 4, rx: 1, fill: '#94A3B8' }),
            h('line', { x1: 8, y1: y + gap - 4, x2: 8, y2: y + 4, stroke: '#CBD5E1', 'stroke-width': 1.5 }),
            h('line', { x1: sw - 8, y1: y + gap - 4, x2: sw - 8, y2: y + 4, stroke: '#CBD5E1', 'stroke-width': 1.5 }),
          ])
        }),
        h('text', { x: Math.floor(sw / 2), y: sh - 3, 'text-anchor': 'middle', fill: '#94A3B8', 'font-size': 7, 'font-family': 'system-ui' }, 'WALL SHELF'),
      ])
    }
  },
})
</script>
