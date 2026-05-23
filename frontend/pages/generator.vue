<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200">
      <div>
        <h1 class="text-xl font-semibold text-slate-900">AI Planogram Generator</h1>
        <p class="text-sm text-slate-500 mt-0.5">4-step wizard to generate optimised planograms</p>
      </div>
      <div class="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200 font-medium">
        <Sparkles :size="13" /> Powered by Claude AI
      </div>
    </div>

    <!-- Stepper -->
    <div class="flex items-center px-8 py-4 bg-white border-b border-slate-200">
      <template v-for="(step, idx) in steps" :key="step.id">
        <div class="flex items-center">
          <button
            @click="idx < currentStep ? currentStep = idx : null"
            class="flex items-center gap-2"
          >
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
              :class="currentStep > idx ? 'bg-emerald-500 text-white' : currentStep === idx ? 'text-white' : 'bg-slate-100 text-slate-400'"
              :style="currentStep === idx ? 'background:#7C3AED' : ''"
            >
              <Check v-if="currentStep > idx" :size="14" />
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <span class="text-sm font-medium" :class="currentStep === idx ? 'text-purple-700' : currentStep > idx ? 'text-emerald-600' : 'text-slate-400'">
              {{ step.label }}
            </span>
          </button>
        </div>
        <div v-if="idx < steps.length - 1" class="flex-1 mx-3 h-px" :style="{ background: currentStep > idx ? '#10B981' : '#E2E8F0' }"></div>
      </template>
    </div>

    <!-- Step content -->
    <div class="flex-1 overflow-auto px-8 py-6">

      <!-- Step 0: Select Asset -->
      <div v-if="currentStep === 0">
        <h2 class="text-base font-semibold text-slate-800 mb-1">Select Asset</h2>
        <p class="text-sm text-slate-400 mb-5">Choose the fixture type to generate a planogram for</p>
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="asset in store.assets"
            :key="asset.id"
            @click="selectedAsset = asset"
            class="bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-md"
            :class="selectedAsset?.id === asset.id ? 'border-purple-500 shadow-md bg-purple-50' : 'border-slate-200 hover:border-slate-300'"
          >
            <div class="text-4xl mb-3">{{ asset.img }}</div>
            <div class="font-semibold text-slate-900">{{ asset.name }}</div>
            <div class="text-xs text-slate-400 mt-0.5">{{ asset.type }} · {{ asset.shelves }}S · {{ asset.region }}</div>
            <div class="mt-3 text-xs font-medium" :class="asset.status === 'active' ? 'text-emerald-600' : 'text-slate-400'">
              ● {{ asset.status }}
            </div>
          </div>
        </div>
      </div>

      <!-- Step 1: SKU Pool -->
      <div v-if="currentStep === 1">
        <h2 class="text-base font-semibold text-slate-800 mb-1">SKU Pool</h2>
        <p class="text-sm text-slate-400 mb-5">Select which SKUs to include in the generated planogram</p>
        <div class="flex items-center gap-3 mb-4">
          <button @click="selectedSKUs = store.skus.map(s => s.id)" class="text-xs px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50">Select All</button>
          <button @click="selectedSKUs = store.skus.filter(s => s.mandatory).map(s => s.id)" class="text-xs px-3 py-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50">Mandatory Only</button>
          <button @click="selectedSKUs = []" class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Clear</button>
          <span class="ml-auto text-xs text-slate-400">{{ selectedSKUs.length }} SKUs selected</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <label
            v-for="sku in store.skus"
            :key="sku.id"
            class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
            :class="selectedSKUs.includes(sku.id) ? 'border-purple-300 bg-purple-50' : 'border-slate-200 hover:border-slate-300 bg-white'"
          >
            <input type="checkbox" :value="sku.id" v-model="selectedSKUs" class="accent-purple-600 w-4 h-4" />
            <div class="w-3 h-8 rounded" :style="{ background: sku.color }"></div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-slate-900 truncate">{{ sku.name }}</div>
              <div class="text-xs text-slate-400">{{ sku.brand }} · {{ sku.cat }}</div>
            </div>
            <span v-if="sku.mandatory" class="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">Req</span>
          </label>
        </div>
      </div>

      <!-- Step 2: Objective -->
      <div v-if="currentStep === 2">
        <h2 class="text-base font-semibold text-slate-800 mb-1">Optimisation Objective</h2>
        <p class="text-sm text-slate-400 mb-5">Tell the AI what to optimise for</p>

        <div class="space-y-3 mb-6">
          <label
            v-for="obj in objectives"
            :key="obj.value"
            class="flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all"
            :class="objective === obj.value ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300 bg-white'"
          >
            <input type="radio" :value="obj.value" v-model="objective" class="mt-0.5 accent-purple-600" />
            <div>
              <div class="font-semibold text-slate-800 text-sm">{{ obj.label }}</div>
              <div class="text-xs text-slate-400 mt-0.5">{{ obj.desc }}</div>
            </div>
          </label>
        </div>

        <div>
          <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Additional Instructions (optional)</label>
          <textarea
            v-model="instructions"
            placeholder="e.g. Place Kingfisher at eye level. Separate non-alcoholic section at bottom shelf…"
            rows="4"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Step 3: Generate & results -->
      <div v-if="currentStep === 3">
        <div v-if="!generated && !generating" class="text-center py-12">
          <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style="background:#7C3AED20;">
            <Sparkles :size="36" style="color:#7C3AED;" />
          </div>
          <h2 class="text-xl font-semibold text-slate-900 mb-2">Ready to Generate</h2>
          <p class="text-sm text-slate-400 mb-2">Asset: <span class="font-medium text-slate-700">{{ selectedAsset?.name }}</span></p>
          <p class="text-sm text-slate-400 mb-2">SKUs: <span class="font-medium text-slate-700">{{ selectedSKUs.length }} selected</span></p>
          <p class="text-sm text-slate-400 mb-8">Objective: <span class="font-medium text-slate-700">{{ objectives.find(o => o.value === objective)?.label }}</span></p>
          <button @click="generate" class="px-8 py-3 rounded-2xl text-white font-semibold text-sm" style="background:#7C3AED;">
            Generate Planogram
          </button>
        </div>

        <!-- Generating animation -->
        <div v-else-if="generating" class="text-center py-16">
          <div class="w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto mb-6"></div>
          <p class="text-slate-600 font-medium">Generating optimised planogram…</p>
          <p class="text-xs text-slate-400 mt-2">Analysing {{ selectedSKUs.length }} SKUs · Applying {{ objectives.find(o => o.value === objective)?.label }} rules</p>
        </div>

        <!-- Results -->
        <div v-else-if="generated">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-base font-semibold text-slate-800">Generated Candidates</h2>
            <button @click="generate" class="text-xs px-3 py-1.5 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50">Regenerate</button>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div
              v-for="(candidate, idx) in candidates"
              :key="idx"
              class="bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all"
              :class="selectedCandidate === idx ? 'border-purple-500 shadow-lg' : 'border-slate-200 hover:border-purple-300'"
              @click="selectedCandidate = idx"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold text-slate-400">OPTION {{ idx + 1 }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full" :style="{ background: candidate.score >= 85 ? '#D1FAE5' : '#FEF3C7', color: candidate.score >= 85 ? '#065F46' : '#92400E' }">
                  Score: {{ candidate.score }}
                </span>
              </div>
              <div class="font-semibold text-slate-900 text-sm mb-1">{{ candidate.name }}</div>
              <div class="text-xs text-slate-400 mb-3">{{ candidate.desc }}</div>
              <div class="space-y-1.5">
                <div class="flex justify-between text-xs">
                  <span class="text-slate-400">Compliance</span>
                  <span class="font-medium text-slate-700">{{ candidate.compliance }}%</span>
                </div>
                <div class="h-1.5 bg-slate-100 rounded-full">
                  <div class="h-1.5 rounded-full bg-emerald-500" :style="{ width: candidate.compliance + '%' }"></div>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-slate-400">Utilization</span>
                  <span class="font-medium text-slate-700">{{ candidate.utilization }}%</span>
                </div>
                <div class="h-1.5 bg-slate-100 rounded-full">
                  <div class="h-1.5 rounded-full bg-blue-500" :style="{ width: candidate.utilization + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="selectedCandidate !== null" class="mt-5 flex gap-3">
            <button @click="applyCandidate" class="px-6 py-2.5 rounded-xl text-sm font-medium text-white" style="background:#3B82F6;">
              Apply to Workspace
            </button>
            <button class="px-6 py-2.5 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50">Save as Draft</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer nav -->
    <div class="flex items-center justify-between px-8 py-4 bg-white border-t border-slate-200">
      <button
        v-if="currentStep > 0"
        @click="currentStep--"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50"
      >
        <ChevronLeft :size="16" /> Back
      </button>
      <div v-else></div>
      <button
        v-if="currentStep < 3"
        @click="nextStep"
        :disabled="!canProceed"
        class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
        style="background:#7C3AED;"
      >
        Next <ChevronRight :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { usePlanogramStore } from '~/stores/planogram'
import type { Asset } from '~/stores/planogram'

const store = usePlanogramStore()
const router = useRouter()

const currentStep = ref(0)
const selectedAsset = ref<Asset | null>(null)
const selectedSKUs = ref<number[]>(store.skus.filter(s => s.mandatory).map(s => s.id))
const objective = ref('revenue')
const instructions = ref('')
const generating = ref(false)
const generated = ref(false)
const selectedCandidate = ref<number | null>(null)

const steps = [
  { id: 'asset', label: 'Asset' },
  { id: 'skus', label: 'SKU Pool' },
  { id: 'objective', label: 'Objective' },
  { id: 'generate', label: 'Generate' },
]

const objectives = [
  { value: 'revenue', label: 'Revenue Maximisation', desc: 'Prioritise high-margin SKUs with premium eye-level placement' },
  { value: 'compliance', label: 'Compliance First', desc: 'Ensure all mandatory SKUs meet minimum facing requirements' },
  { value: 'brand', label: 'Brand Block', desc: 'Group products by brand for strong brand visibility' },
  { value: 'balanced', label: 'Balanced Mix', desc: 'Optimise for category representation and consumer journey' },
]

const candidates = ref([
  { name: 'Revenue-Led Layout', desc: 'Kingfisher Premium at eye level, strong block positioning', compliance: 91, utilization: 82, score: 94 },
  { name: 'Compliance-Safe Layout', desc: 'All mandatory SKUs placed, conservative spacing', compliance: 97, utilization: 71, score: 88 },
  { name: 'Brand-Block Layout', desc: 'KF block left, Heineken center, Amstel right', compliance: 84, utilization: 79, score: 81 },
])

const canProceed = computed(() => {
  if (currentStep.value === 0) return selectedAsset.value !== null
  if (currentStep.value === 1) return selectedSKUs.value.length > 0
  return true
})

function nextStep() {
  if (canProceed.value) currentStep.value++
}

async function generate() {
  generating.value = true
  generated.value = false
  selectedCandidate.value = null
  await new Promise(r => setTimeout(r, 2200))
  generating.value = false
  generated.value = true
}

function applyCandidate() {
  router.push('/workspace')
}
</script>
