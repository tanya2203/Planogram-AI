<template>
  <div style="padding:24px;">

    <!-- Optimization opportunity banner -->
    <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;gap:16px;">
      <div style="width:40px;height:40px;border-radius:10px;background:#FFFBEB;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <AlertTriangle :size="18" color="#F59E0B"/>
      </div>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:600;color:#0F172A;margin-bottom:3px;">Optimization opportunity detected</div>
        <div style="font-size:12px;color:#64748B;">"Q2 MT Beer Cooler – North" score dropped 87 → 71. Primary reason: Kingfisher Prem 650ml out-of-stock in 34% of stores.</div>
      </div>
      <div style="display:flex;gap:8px;flex-shrink:0;">
        <button @click="router.push('/ai-generator')"
          style="display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,#3B82F6,#7C3AED);color:white;border:none;border-radius:7px;padding:8px 16px;font-size:12px;font-weight:600;cursor:pointer;">
          <Sparkles :size="12"/> Regenerate with AI
        </button>
        <button style="background:transparent;border:1px solid #E2E8F0;border-radius:7px;padding:8px 14px;font-size:12px;cursor:pointer;color:#475569;">
          View planogram
        </button>
      </div>
    </div>

    <!-- KPI cards -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;">
      <div v-for="kpi in kpiCards" :key="kpi.label" style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:18px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
          <div :style="`width:36px;height:36px;border-radius:9px;background:${kpi.color}18;display:flex;align-items:center;justify-content:center;`">
            <component :is="kpi.icon" :size="18" :color="kpi.color"/>
          </div>
          <span :style="`font-size:12px;font-weight:600;color:${kpi.trend==='up'?'#059669':'#DC2626'};background:${kpi.trend==='up'?'#F0FDF4':'#FEF2F2'};padding:3px 8px;border-radius:4px;`">
            {{ kpi.trend==='up'?'↑':'↓' }} {{ kpi.change }}
          </span>
        </div>
        <div style="font-size:26px;font-weight:800;color:#0F172A;margin-bottom:2px;">{{ kpi.value }}</div>
        <div style="font-size:12px;color:#64748B;">{{ kpi.label }}</div>
      </div>
    </div>

    <!-- Row 2: Area chart + Pie chart -->
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px;">

      <!-- Utilization & Compliance trend (SVG area chart) -->
      <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div style="font-size:14px;font-weight:700;color:#0F172A;">Utilization &amp; Compliance Trend</div>
          <div style="display:flex;gap:6px;">
            <button v-for="p in ['Q1 2025','Q2 2025','YTD']" :key="p" @click="period=p"
              :style="`padding:4px 10px;border-radius:6px;border:1px solid ${period===p?'#3B82F6':'#E2E8F0'};background:${period===p?'#EFF6FF':'transparent'};color:${period===p?'#1D4ED8':'#64748B'};font-size:11px;font-weight:${period===p?600:400};cursor:pointer;`">
              {{ p }}
            </button>
          </div>
        </div>
        <div style="display:flex;gap:16px;margin-bottom:10px;">
          <div v-for="leg in [{color:'#3B82F6',label:'Utilization'},{color:'#10B981',label:'Compliance'}]" :key="leg.label" style="display:flex;gap:5px;align-items:center;">
            <div :style="`width:10px;height:10px;border-radius:2px;background:${leg.color};`"/><span style="font-size:12px;color:#64748B;">{{ leg.label }}</span>
          </div>
        </div>
        <!-- SVG Area Chart -->
        <svg :width="areaChartW" height="200" style="display:block;overflow:visible;">
          <defs>
            <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stop-color="#3B82F6" stop-opacity="0.15"/>
              <stop offset="95%" stop-color="#3B82F6" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stop-color="#10B981" stop-opacity="0.15"/>
              <stop offset="95%" stop-color="#10B981" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <!-- Grid lines -->
          <line v-for="y in gridYs" :key="y" :x1="chartLeft" :y1="y" :x2="areaChartW-10" :y2="y" stroke="#F1F5F9" stroke-width="1"/>
          <!-- Utilization area -->
          <path :d="utilAreaPath" fill="url(#gu)"/>
          <path :d="utilLinePath" fill="none" stroke="#3B82F6" stroke-width="2"/>
          <!-- Compliance area -->
          <path :d="compAreaPath" fill="url(#gc)"/>
          <path :d="compLinePath" fill="none" stroke="#10B981" stroke-width="2"/>
          <!-- X axis labels -->
          <text v-for="(pt,i) in chartPoints" :key="i" :x="pt.x" y="196" text-anchor="middle" font-size="11" fill="#94A3B8" font-family="system-ui">{{ ANALYTICS_TREND[i].month }}</text>
        </svg>
      </div>

      <!-- Share of Shelf (SVG donut) -->
      <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:20px;">
        <div style="font-size:14px;font-weight:700;color:#0F172A;margin-bottom:14px;">Share of Shelf</div>
        <div style="display:flex;justify-content:center;margin-bottom:12px;">
          <svg width="160" height="160" style="display:block;">
            <g transform="translate(80,80)">
              <path v-for="(seg,i) in donutSegments" :key="i" :d="seg.d" :fill="seg.color"/>
              <circle cx="0" cy="0" r="44" fill="white"/>
              <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="700" fill="#0F172A" font-family="system-ui">SOS</text>
            </g>
          </svg>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          <div v-for="s in SOS_DATA" :key="s.name" style="display:flex;gap:4px;align-items:center;">
            <div :style="`width:8px;height:8px;border-radius:2px;background:${s.color};`"/><span style="font-size:11px;color:#64748B;">{{ s.name }} {{ s.value }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 3: Bar chart + Region table -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">

      <!-- Revenue uplift bar chart (SVG) -->
      <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:20px;">
        <div style="font-size:14px;font-weight:700;color:#0F172A;margin-bottom:14px;">Revenue Uplift Trend (₹K)</div>
        <svg :width="barChartW" height="180" style="display:block;overflow:visible;">
          <line v-for="y in barGridYs" :key="y" :x1="barLeft" :y1="y" :x2="barChartW-10" :y2="y" stroke="#F1F5F9" stroke-width="1"/>
          <g v-for="(item,i) in barData" :key="i">
            <rect :x="barLeft+i*barStep+barPad" :y="barY(item.revenue)" :width="barW" :height="barH(item.revenue)" rx="4" ry="4" fill="#8B5CF6"/>
            <text :x="barLeft+i*barStep+barPad+barW/2" y="175" text-anchor="middle" font-size="11" fill="#94A3B8" font-family="system-ui">{{ item.month }}</text>
          </g>
        </svg>
      </div>

      <!-- Region performance table -->
      <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:20px;">
        <div style="font-size:14px;font-weight:700;color:#0F172A;margin-bottom:14px;">Region-wise Performance</div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th v-for="h in ['Region','Plans','Compliance','Uplift']" :key="h"
                style="text-align:left;padding:5px 8px;font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #F1F5F9;">
                {{ h }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in REGION_DATA" :key="row.region">
              <td style="padding:9px 8px;font-size:13px;font-weight:600;color:#0F172A;">{{ row.region }}</td>
              <td style="padding:9px 8px;font-size:13px;color:#374151;">{{ row.planograms }}</td>
              <td style="padding:9px 8px;">
                <div style="display:flex;gap:6px;align-items:center;">
                  <div style="flex:1;height:5px;background:#F1F5F9;border-radius:3px;overflow:hidden;">
                    <div :style="`height:100%;width:${row.compliance}%;background:${row.compliance>85?'#10B981':'#F59E0B'};border-radius:3px;`"/>
                  </div>
                  <span :style="`font-size:11px;font-weight:600;color:${row.compliance>85?'#059669':'#D97706'};min-width:30px;`">{{ row.compliance }}%</span>
                </div>
              </td>
              <td style="padding:9px 8px;">
                <span style="background:#F0FDF4;color:#166534;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;">+{{ row.uplift }}%</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top:12px;background:#F0FDF4;border-radius:8px;padding:9px 13px;display:flex;gap:7px;align-items:center;">
          <TrendingUp :size="13" color="#10B981"/>
          <span style="font-size:12px;color:#065F46;font-weight:500;">South region leads compliance at 91%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Sparkles, AlertTriangle, Layers, CheckCircle, TrendingUp, Clock } from 'lucide-vue-next'
import { ANALYTICS_TREND, SOS_DATA, REGION_DATA } from '~/stores/planogram'

definePageMeta({ layout: 'default' })

const router = useRouter()
const period = ref('Q2 2025')

const kpiCards = [
  { label:'Active Planograms', value:'153',    change:'+12',   trend:'up',   icon:Layers,      color:'#3B82F6' },
  { label:'Avg Compliance',    value:'84.7%',  change:'+3.2%', trend:'up',   icon:CheckCircle, color:'#10B981' },
  { label:'Revenue Uplift',    value:'₹18.4L', change:'+9.8%', trend:'up',   icon:TrendingUp,  color:'#8B5CF6' },
  { label:'Pending Reviews',   value:'7',      change:'−3',    trend:'down',  icon:Clock,       color:'#F59E0B' },
]

// ─── Area chart helpers ───────────────────────────────────────────────────────
const areaChartW = 460
const chartLeft  = 28
const chartTop   = 10
const chartH     = 175

const gridYs = computed(() => [chartTop, chartTop+chartH/4, chartTop+chartH/2, chartTop+3*chartH/4, chartTop+chartH])

const chartPoints = computed(() => {
  const data = ANALYTICS_TREND
  const minU = Math.min(...data.map(d => d.utilization))
  const maxU = Math.max(...data.map(d => d.utilization), ...data.map(d => d.compliance))
  const minC = Math.min(...data.map(d => d.compliance))
  const w = areaChartW - chartLeft - 10
  return data.map((d, i) => ({
    x: chartLeft + (i / (data.length - 1)) * w,
    yu: chartTop + chartH - ((d.utilization - minU) / (maxU - minU + 1)) * chartH,
    yc: chartTop + chartH - ((d.compliance - minC) / (maxU - minC + 1)) * chartH,
  }))
})

function makeLinePath(pts: {x:number; yu?:number; yc?:number}[], key:'yu'|'yc') {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${(p as any)[key]}`).join(' ')
}
function makeAreaPath(pts: {x:number; yu?:number; yc?:number}[], key:'yu'|'yc', bottom: number) {
  const line = makeLinePath(pts, key)
  const last = pts[pts.length - 1]; const first = pts[0]
  return `${line} L${last.x},${bottom} L${first.x},${bottom} Z`
}
const utilLinePath = computed(() => makeLinePath(chartPoints.value, 'yu'))
const utilAreaPath = computed(() => makeAreaPath(chartPoints.value, 'yu', chartTop + chartH))
const compLinePath = computed(() => makeLinePath(chartPoints.value, 'yc'))
const compAreaPath = computed(() => makeAreaPath(chartPoints.value, 'yc', chartTop + chartH))

// ─── Donut chart helpers ──────────────────────────────────────────────────────
function polarToXY(deg: number, r: number) {
  const rad = (deg - 90) * Math.PI / 180
  return { x: r * Math.cos(rad), y: r * Math.sin(rad) }
}
function describeArc(startDeg: number, endDeg: number, r: number, ir: number) {
  const s = polarToXY(startDeg, r), e = polarToXY(endDeg, r)
  const si = polarToXY(startDeg, ir), ei = polarToXY(endDeg, ir)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M${s.x},${s.y} A${r},${r} 0 ${large} 1 ${e.x},${e.y} L${ei.x},${ei.y} A${ir},${ir} 0 ${large} 0 ${si.x},${si.y} Z`
}
const donutSegments = computed(() => {
  let angle = 0
  return SOS_DATA.map(s => {
    const sweep = (s.value / 100) * 360
    const seg = { d: describeArc(angle, angle + sweep - 1, 70, 44), color: s.color }
    angle += sweep
    return seg
  })
})

// ─── Bar chart helpers ────────────────────────────────────────────────────────
const barChartW = 360
const barLeft = 28
const barTop = 10
const barChartH = 155
const barData = ANALYTICS_TREND.slice(-8)
const barStep = computed(() => (barChartW - barLeft - 10) / barData.length)
const barW = computed(() => Math.max(8, barStep.value - 8))
const barPad = computed(() => (barStep.value - barW.value) / 2)
const barGridYs = computed(() => [barTop, barTop+barChartH/4, barTop+barChartH/2, barTop+3*barChartH/4, barTop+barChartH])

const minRev = computed(() => Math.min(...barData.map(d => d.revenue)))
const maxRev = computed(() => Math.max(...barData.map(d => d.revenue)))
function barY(v: number) { return barTop + barChartH - ((v - minRev.value) / (maxRev.value - minRev.value + 1)) * barChartH }
function barH(v: number) { return barTop + barChartH - barY(v) }
</script>
