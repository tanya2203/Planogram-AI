<template>
  <div style="padding:0 24px 24px;display:flex;height:calc(100vh - 120px);gap:0;position:relative;">

    <!-- Toast -->
    <div v-if="toast" style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#065F46;color:white;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:600;z-index:999;display:flex;gap:8px;align-items:center;box-shadow:0 8px 24px rgba(0,0,0,0.2);">
      <Check :size="14"/> {{ toast }}
    </div>

    <!-- LEFT: SKU Library panel -->
    <div style="width:210px;min-width:210px;background:white;border:1px solid #E2E8F0;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;margin-right:14px;margin-top:24px;">
      <div style="padding:12px 12px 9px;border-bottom:1px solid #F1F5F9;">
        <div style="font-size:12px;font-weight:700;color:#0F172A;margin-bottom:8px;">SKU Library</div>
        <div style="display:flex;gap:5px;background:#F1F5F9;border-radius:7px;padding:5px 8px;margin-bottom:7px;">
          <Search :size="13" color="#94A3B8"/>
          <input v-model="search" placeholder="Search SKUs..." style="border:none;background:transparent;font-size:12px;outline:none;flex:1;"/>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:3px;">
          <button v-for="c in cats" :key="c" @click="catFilter=c"
            :style="`padding:3px 7px;border-radius:4px;border:none;background:${catFilter===c?'#EFF6FF':'transparent'};color:${catFilter===c?'#1D4ED8':'#64748B'};font-size:10px;font-weight:${catFilter===c?600:400};cursor:pointer;`">
            {{ c }}
          </button>
        </div>
      </div>
      <div style="flex:1;overflow-y:auto;padding:8px;">
        <div v-for="sku in filteredSKUs" :key="sku.id"
          draggable="true"
          @dragstart="fromPanel=sku.id"
          @dragend="fromPanel=null"
          :style="`display:flex;gap:8px;align-items:center;padding:7px;border-radius:7px;margin-bottom:3px;cursor:${isViewEmpty?'not-allowed':'grab'};border:1px solid #E2E8F0;background:white;opacity:${isPlaced(sku.id)?0.5:1};transition:all 0.15s;`">
          <div :style="`width:24px;height:32px;border-radius:4px;background:${sku.color}20;border:1.5px solid ${sku.color}44;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;`">
            <img v-if="sku.front_packshot_url" :src="appendSas(sku.front_packshot_url) ?? undefined" :alt="sku.name" style="width:100%;height:100%;object-fit:cover;" @error="(e)=>(e.target as HTMLImageElement).style.display='none'"/>
            <div v-else :style="`width:8px;height:19px;border-radius:2px;background:${sku.color};opacity:0.85;`"/>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:10px;font-weight:700;color:#0F172A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ sku.name }}</div>
            <div style="font-size:9px;color:#94A3B8;">{{ sku.cat }} · ×{{ sku.defaultF }}</div>
            <div v-if="sku.mandatory" style="font-size:8px;font-weight:700;color:#EF4444;">Mandatory</div>
          </div>
          <Check v-if="isPlaced(sku.id)" :size="10" color="#10B981"/>
        </div>
      </div>
      <div style="padding:8px 11px;border-top:1px solid #F1F5F9;font-size:10px;color:#94A3B8;">Drag SKUs onto shelf slots</div>
    </div>

    <!-- CENTER: Workspace -->
    <div style="flex:1;background:white;border:1px solid #E2E8F0;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;margin-top:24px;" :style="reviewOpen?'margin-right:14px':''">
      <div style="padding:10px 16px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <!-- View tabs -->
        <div style="display:flex;background:#F1F5F9;border-radius:7px;padding:3px;gap:2px;">
          <button v-for="v in ['front','left','right']" :key="v"
            @click="activeView=v;selectedShelf=null"
            :style="`padding:5px 14px;border-radius:5px;border:none;font-size:12px;font-weight:${activeView===v?600:400};cursor:pointer;background:${activeView===v?'white':'transparent'};color:${activeView===v?'#0F172A':'#94A3B8'};box-shadow:${activeView===v?'0 1px 3px rgba(0,0,0,0.08)':'none'};transition:all 0.12s;display:flex;align-items:center;gap:5px;`">
            {{ v==='front'?'Front View':v==='left'?'Left View':'Right View' }}
            <span v-if="viewPlacements[v]===null&&v!=='front'" style="font-size:9px;background:#E2E8F0;color:#94A3B8;border-radius:3px;padding:1px 5px;">Empty</span>
          </button>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-left:auto;">
          <div v-if="!isViewEmpty" style="font-size:12px;color:#64748B;">Util: <strong :style="`color:${util>70?'#10B981':'#F59E0B'};`">{{ util }}%</strong></div>
          <!-- Preview mode toggle -->
          <div style="display:flex;background:#F1F5F9;border-radius:6px;padding:3px;gap:2px;">
            <button v-for="[val,label] in [['edit','Edit'],['realistic','Preview']]" :key="val" @click="previewMode=val"
              :style="`padding:4px 12px;border-radius:4px;border:none;font-size:11px;font-weight:${previewMode===val?600:400};cursor:pointer;background:${previewMode!==val?'transparent':val==='realistic'?'#0F172A':'white'};color:${previewMode!==val?'#94A3B8':val==='realistic'?'white':'#0F172A'};transition:all 0.12s;`">
              {{ label }}
            </button>
          </div>
          <button @click="showRef=!showRef"
            :style="`padding:5px 10px;border-radius:6px;border:1px solid ${showRef?'#BFDBFE':'#E2E8F0'};background:${showRef?'#EFF6FF':'#F8FAFC'};font-size:11px;font-weight:500;cursor:pointer;color:${showRef?'#1D4ED8':'#64748B'};display:flex;align-items:center;gap:5px;`">
            <Image :size="12"/> Ref
          </button>
          <button v-if="!isViewEmpty" @click="resetPlacements()"
            style="background:transparent;border:1px solid #E2E8F0;border-radius:6px;padding:5px 9px;font-size:12px;cursor:pointer;color:#475569;display:flex;gap:4px;align-items:center;">
            <RotateCcw :size="11"/> Reset
          </button>
          <button @click="reviewOpen=!reviewOpen"
            :style="`display:flex;align-items:center;gap:5px;background:${reviewOpen?'#EFF6FF':'#F8FAFC'};border:1px solid ${reviewOpen?'#BFDBFE':'#E2E8F0'};border-radius:7px;padding:6px 11px;font-size:12px;font-weight:600;cursor:pointer;color:${reviewOpen?'#1D4ED8':'#475569'};`">
            <PanelRightClose v-if="reviewOpen" :size="13"/>
            <PanelRight v-else :size="13"/>
            Review &amp; Publish
          </button>
        </div>
      </div>

      <div style="flex:1;padding:16px 20px;overflow-y:auto;background:#F8FAFC;display:flex;flex-direction:column;gap:14px;">

        <!-- Reference images row -->
        <div v-if="showRef" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
          <div v-for="view in ['front','left','right']" :key="view" style="background:white;border:1px solid #E2E8F0;border-radius:9px;overflow:hidden;">
            <div style="padding:8px 12px;border-bottom:1px solid #F1F5F9;display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:11px;font-weight:600;color:#374151;">{{ view.charAt(0).toUpperCase()+view.slice(1) }} Reference</span>
              <div style="display:flex;align-items:center;gap:6px;">
                <span v-if="refUploading[view]" style="font-size:9px;color:#3B82F6;font-weight:600;">Uploading…</span>
                <button v-if="refImages[view]&&!refUploading[view]" @click="refImages[view]=null" style="background:transparent;border:none;cursor:pointer;padding:0;font-size:9px;color:#EF4444;">remove</button>
              </div>
            </div>
            <div v-if="refImages[view]" style="position:relative;">
              <img :src="appendSas(refImages[view])!" :alt="`${view} ref`"
                style="width:100%;display:block;max-height:120px;object-fit:contain;background:#F8FAFC;padding:4px;"
                @error="refImages[view]=null"/>
              <div v-if="refUploading[view]" style="position:absolute;inset:0;background:rgba(255,255,255,0.7);display:flex;align-items:center;justify-content:center;">
                <div style="width:24px;height:24px;border:2px solid #BFDBFE;border-top-color:#3B82F6;border-radius:50%;animation:spin 0.7s linear infinite;"/>
              </div>
            </div>
            <label v-else style="display:block;padding:14px 12px;text-align:center;cursor:pointer;background:#F8FAFC;">
              <Upload :size="14" color="#CBD5E1" style="margin:0 auto 4px;display:block;"/>
              <div style="font-size:10px;color:#CBD5E1;">Upload {{ view }} reference</div>
              <input type="file" accept="image/*" style="display:none;" @change="e=>uploadRef(view,e)"/>
            </label>
          </div>
        </div>

        <!-- Side view empty state -->
        <div v-if="isViewEmpty" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:32px 24px;background:white;border-radius:10px;border:1.5px dashed #E2E8F0;min-height:240px;">
          <Eye :size="28" color="#CBD5E1"/>
          <div style="text-align:center;">
            <div style="font-size:14px;font-weight:600;color:#94A3B8;margin-bottom:4px;">No {{ activeView }} view configured</div>
            <div style="font-size:12px;color:#CBD5E1;margin-bottom:14px;">Initialize this view to start placing SKUs</div>
            <button @click="initView()" style="background:#3B82F6;color:white;border:none;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">
              <Plus :size="13"/> Initialize {{ activeView.charAt(0).toUpperCase()+activeView.slice(1) }} View
            </button>
          </div>
        </div>

        <div v-else style="width:100%;max-width:560px;">
          <!-- Shelf grid: edit mode -->
          <div v-if="previewMode==='edit'" style="background:#F8FAFC;border-radius:12px;padding:14px;border:1px solid #E2E8F0;">
            <div style="background:#334155;border-radius:10px;padding:10px 5px;position:relative;">
              <div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#0F172A;border-radius:6px;padding:3px 12px;font-size:10px;color:#94A3B8;font-weight:600;letter-spacing:0.5px;white-space:nowrap;">
                Beer Cooler BC-6D · 90cm
              </div>
              <div v-for="(row,ri) in placements" :key="ri" style="margin-bottom:3px;">
                <div style="display:flex;align-items:center;gap:4px;padding:2px 5px;">
                  <div style="font-size:8px;color:#64748B;font-weight:600;letter-spacing:0.3px;text-transform:uppercase;width:58px;">{{ SHELF_LABELS[ri] }}</div>
                  <div style="flex:1;height:1px;background:#475569;"/>
                </div>
                <div @click="selectedShelf=(selectedShelf===ri?null:ri)"
                  @dragover.prevent
                  @drop.prevent="handleDrop(ri,null)"
                  :style="`display:flex;gap:2px;padding:5px 4px 6px;background:${selectedShelf===ri?'rgba(59,130,246,0.1)':'transparent'};border-radius:5px;cursor:pointer;border:${selectedShelf===ri?'1px solid rgba(59,130,246,0.25)':'1px solid transparent'};min-height:50px;transition:background 0.15s;`">
                  <div v-for="(skuId,ci) in row" :key="ci"
                    :draggable="!!skuId"
                    @dragstart="skuId&&(draggingId={skuId,fromRow:ri,fromCol:ci})"
                    @dragend="draggingId=null"
                    @dragover.prevent
                    @drop.prevent.stop="handleDrop(ri,ci)"
                    :title="skuId?skuName(skuId):'Empty slot'"
                    :style="`flex:1;min-width:0;height:44px;border-radius:4px;background:${skuId?(skuById(skuId)?.front_packshot_url?'#1E293B':skuColor(skuId)+'DD'):'#475569'};border:${skuId?'2px solid '+skuColor(skuId):'2px dashed #64748B'};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;cursor:${skuId?'grab':'copy'};transition:all 0.15s;opacity:${draggingId?.fromRow===ri&&draggingId?.fromCol===ci?0.4:1};box-shadow:${skuId?'0 2px 4px '+skuColor(skuId)+'44':'none'};position:relative;overflow:hidden;`">
                    <template v-if="skuId">
                      <img v-if="skuById(skuId)?.front_packshot_url"
                        :src="appendSas(skuById(skuId)!.front_packshot_url) ?? undefined"
                        :alt="skuById(skuId)?.name"
                        style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:3px;"
                        @error="(e)=>(e.target as HTMLImageElement).style.display='none'"/>
                      <template v-else>
                        <div style="width:58%;height:65%;background:rgba(255,255,255,0.25);border-radius:2px;"/>
                        <div style="font-size:6px;color:white;font-weight:700;text-align:center;padding:0 1px;line-height:1.1;overflow:hidden;">
                          {{ skuShortName(skuId) }}
                        </div>
                      </template>
                    </template>
                    <Plus v-else :size="10" color="#64748B"/>
                  </div>
                </div>
                <div style="height:4px;background:#64748B;border-radius:0 0 3px 3px;margin:0 3px;"/>
              </div>
              <div style="height:10px;background:#1E293B;border-radius:0 0 8px 8px;margin-top:2px;"/>
            </div>
          </div>

          <!-- Realistic view -->
          <div v-else style="background:#1E293B;border-radius:10px;padding:10px 6px;position:relative;">
            <div style="position:absolute;top:-9px;left:50%;transform:translateX(-50%);background:#0F172A;border-radius:4px;padding:2px 10px;font-size:9px;color:#64748B;font-weight:600;letter-spacing:0.5px;white-space:nowrap;">
              Beer Cooler BC-6D · Realistic View
            </div>
            <div v-for="(row,ri) in placements" :key="ri" :style="`margin-bottom:${ri<placements.length-1?2:0}px;`">
              <div style="display:flex;align-items:center;gap:4px;padding:2px 5px;">
                <div style="font-size:7px;color:#475569;width:58px;text-transform:uppercase;font-weight:600;letter-spacing:0.3px;">{{ SHELF_LABELS[ri] }}</div>
                <div style="flex:1;height:1px;background:#334155;"/>
              </div>
              <div style="display:flex;padding:3px 3px 0;min-height:52px;gap:1px;align-items:flex-end;">
                <div v-for="(skuId,ci) in row" :key="ci" style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;">
                  <template v-if="skuId">
                    <div style="display:flex;gap:0;justify-content:center;">
                      <div v-for="fi in Math.min(skuById(skuId)?.defaultF||1,2)" :key="fi"
                        :style="`width:${Math.floor(100/Math.min(skuById(skuId)?.defaultF||1,2))-1}%;min-width:14px;height:${Math.min(48,Math.max(24,Math.round((skuById(skuId)?.h||18)*1.9)))}px;background:${skuById(skuId)?.front_packshot_url?'#0F172A':'linear-gradient(160deg,'+skuColor(skuId)+'ee 0%,'+skuColor(skuId)+'99 100%)'};border-radius:2px 2px 0 0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:2px 1px 0;position:relative;`">
                        <img v-if="skuById(skuId)?.front_packshot_url"
                          :src="appendSas(skuById(skuId)!.front_packshot_url) ?? undefined"
                          :alt="skuById(skuId)?.name"
                          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"
                          @error="(e)=>(e.target as HTMLImageElement).style.display='none'"/>
                        <template v-else>
                          <div style="width:60%;height:40%;background:rgba(255,255,255,0.2);border-radius:1px;margin-top:1px;"/>
                          <div style="width:100%;background:rgba(255,255,255,0.9);padding:1px 0;text-align:center;">
                            <div :style="`font-size:5px;font-weight:700;color:${skuColor(skuId)};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:0 1px;`">{{ skuBrand(skuId) }}</div>
                          </div>
                        </template>
                      </div>
                    </div>
                  </template>
                  <div v-else style="flex:1;height:48px;background:transparent;"/>
                </div>
              </div>
              <div style="height:4px;background:#475569;margin:0 3px;border-radius:0 0 2px 2px;"/>
            </div>
            <div style="height:10px;background:#0F172A;border-radius:0 0 8px 8px;margin-top:2px;"/>
          </div>

          <!-- Utilization bar (edit mode) -->
          <div v-if="previewMode==='edit'" style="margin-top:12px;background:white;border-radius:10px;padding:10px 14px;border:1px solid #E2E8F0;">
            <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
              <span style="font-size:12px;font-weight:600;color:#374151;">Shelf Utilization</span>
              <span :style="`font-size:13px;font-weight:700;color:${util>70?'#059669':'#D97706'};`">{{ util }}%</span>
            </div>
            <div style="height:5px;background:#F1F5F9;border-radius:3px;overflow:hidden;margin-bottom:8px;">
              <div :style="`height:100%;width:${util}%;background:${util>70?'#10B981':'#F59E0B'};border-radius:3px;transition:width 0.5s;`"/>
            </div>
            <div style="display:flex;gap:8px;">
              <div v-for="(row,i) in placements" :key="i"
                style="text-align:center;cursor:pointer;"
                @click="selectedShelf=(selectedShelf===i?null:i)">
                <div :style="`font-size:9px;color:${selectedShelf===i?'#1D4ED8':'#94A3B8'};font-weight:${selectedShelf===i?700:400};`">S{{ i+1 }}</div>
                <div :style="`font-size:11px;font-weight:700;color:${shelfPct(row)>70?'#059669':shelfPct(row)>40?'#D97706':'#EF4444'};`">{{ shelfPct(row) }}%</div>
              </div>
            </div>
          </div>

          <!-- Validations -->
          <div style="margin-top:10px;">
            <div v-if="validationIssues.length===0" style="display:flex;gap:6px;align-items:center;padding:8px 12px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;">
              <CheckCircle :size="13" color="#10B981"/>
              <span style="font-size:12px;color:#065F46;font-weight:500;">All validations passed</span>
            </div>
            <div v-else style="background:#FAFAFA;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
              <div v-for="(v,i) in validationIssues.slice(0,4)" :key="i"
                :style="`display:flex;gap:8px;align-items:center;padding:7px 12px;border-bottom:${i<Math.min(validationIssues.length,4)-1?'1px solid #F1F5F9':'none'};`">
                <AlertCircle v-if="v.type==='error'" :size="12" color="#EF4444"/>
                <AlertTriangle v-else :size="12" color="#F59E0B"/>
                <span :style="`font-size:11px;color:${v.type==='error'?'#991B1B':'#92400E'};`">{{ v.msg }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Recommendations -->
        <div v-if="!isViewEmpty" style="width:100%;max-width:560px;">
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:9px;">
            <Sparkles :size="13" color="#7C3AED"/>
            <div style="font-size:13px;font-weight:700;color:#0F172A;">AI Recommendations</div>
            <div style="background:#EEE8FD;border-radius:8px;padding:2px 7px;font-size:11px;font-weight:700;color:#5B21B6;">{{ RECS.length }}</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div v-for="r in RECS" :key="r.id"
              :style="`background:${r.priority==='high'?'#FFF1F2':'#F5F3FF'};border:1px solid ${r.priority==='high'?'#FECDD3':'#DDD6FE'};border-radius:9px;padding:11px;`">
              <div style="display:flex;gap:6px;margin-bottom:3px;">
                <span style="font-size:13px;">{{ r.icon }}</span>
                <div style="font-size:11px;font-weight:700;color:#0F172A;flex:1;">{{ r.title }}</div>
                <span :style="`background:${r.priority==='high'?'#FEF2F2':r.priority==='medium'?'#FFFBEB':'#F8FAFC'};color:${r.priority==='high'?'#991B1B':r.priority==='medium'?'#92400E':'#475569'};font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;`">{{ r.priority }}</span>
              </div>
              <div style="font-size:10px;color:#64748B;line-height:1.5;margin-bottom:5px;">{{ r.desc }}</div>
              <button style="font-size:10px;font-weight:600;color:#7C3AED;background:transparent;border:none;cursor:pointer;padding:0;">Apply →</button>
            </div>
          </div>
        </div>
      </div>

      <div style="padding:9px 16px;border-top:1px solid #E2E8F0;display:flex;align-items:center;gap:10px;">
        <span style="font-size:12px;color:#64748B;">{{ totalPlaced }} placed · {{ totalSlots-totalPlaced }} empty · {{ activeView }} view</span>
        <div style="display:flex;gap:5px;align-items:center;margin-left:auto;">
          <Cpu :size="12" color="#7C3AED"/>
          <span style="font-size:11px;color:#5B21B6;">AI validates every change</span>
        </div>
      </div>
    </div>

    <!-- RIGHT: Review drawer -->
    <div v-if="reviewOpen" style="width:296px;min-width:296px;background:white;border:1px solid #E2E8F0;border-left:none;border-radius:0 12px 12px 0;display:flex;flex-direction:column;height:calc(100% - 24px);margin-top:24px;overflow:hidden;">
      <div style="padding:13px 16px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;gap:8px;">
        <CheckCircle :size="14" color="#3B82F6"/>
        <div style="font-size:13px;font-weight:700;color:#0F172A;">Review &amp; Publish</div>
        <button @click="reviewOpen=false" style="margin-left:auto;background:transparent;border:none;cursor:pointer;">
          <PanelRightClose :size="16" color="#94A3B8"/>
        </button>
      </div>
      <div style="flex:1;overflow-y:auto;">
        <div v-if="published" style="margin:12px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:10px 13px;display:flex;gap:8px;">
          <CheckCircle :size="14" color="#10B981" style="flex-shrink:0;"/>
          <div style="font-size:12px;color:#065F46;font-weight:600;">Published to 48 stores — North India</div>
        </div>

        <div style="padding:12px 14px;border-bottom:1px solid #F1F5F9;">
          <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:9px;">Summary</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
            <div v-for="kpi in kpiItems" :key="kpi.label" :style="`background:${kpi.bg};border-radius:8px;padding:9px 10px;`">
              <div :style="`font-size:16px;font-weight:800;color:${kpi.color};`">{{ kpi.value }}</div>
              <div style="font-size:10px;color:#64748B;margin-top:1px;">{{ kpi.label }}</div>
            </div>
          </div>
        </div>

        <div style="padding:12px 14px;border-bottom:1px solid #F1F5F9;">
          <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:7px;">Validation</div>
          <div v-for="v in VALIDATIONS" :key="v.id" style="display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-bottom:1px solid #F8FAFC;">
            <CheckCircle v-if="v.type==='success'" :size="13" color="#10B981" style="flex-shrink:0;margin-top:1px;"/>
            <AlertCircle v-else-if="v.type==='error'" :size="13" color="#EF4444" style="flex-shrink:0;margin-top:1px;"/>
            <AlertTriangle v-else :size="13" color="#F59E0B" style="flex-shrink:0;margin-top:1px;"/>
            <div>
              <div :style="`font-size:11px;color:${v.type==='error'?'#991B1B':v.type==='warning'?'#92400E':'#065F46'};font-weight:500;`">{{ v.msg }}</div>
              <div style="font-size:10px;color:#94A3B8;">{{ v.shelf }}</div>
            </div>
          </div>
        </div>

        <div style="padding:12px 14px;border-bottom:1px solid #F1F5F9;">
          <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:7px;">Share of Shelf</div>
          <div v-for="s in SOS_DATA" :key="s.name" style="display:flex;gap:6px;align-items:center;margin-bottom:5px;">
            <div :style="`width:7px;height:7px;border-radius:2px;background:${s.color};flex-shrink:0;`"/>
            <div style="font-size:11px;color:#374151;flex:1;">{{ s.name }}</div>
            <div style="flex:2;height:5px;background:#F1F5F9;border-radius:3px;overflow:hidden;">
              <div :style="`height:100%;width:${s.value}%;background:${s.color};border-radius:3px;`"/>
            </div>
            <div style="font-size:11px;font-weight:700;color:#0F172A;min-width:26px;text-align:right;">{{ s.value }}%</div>
          </div>
        </div>

        <div style="padding:12px 14px;">
          <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:9px;">Approval Flow</div>
          <div v-for="(stage,i) in ['Category Mgr','Regional Lead','Trade Mktg']" :key="stage" style="display:flex;align-items:center;gap:8px;margin-bottom:7px;">
            <div :style="`width:22px;height:22px;border-radius:50%;background:${i<approvalStep?'#10B981':i===approvalStep?'#3B82F6':'#F1F5F9'};display:flex;align-items:center;justify-content:center;flex-shrink:0;`">
              <Check v-if="i<approvalStep" :size="11" color="white"/>
              <span v-else :style="`font-size:10px;font-weight:700;color:${i===approvalStep?'white':'#94A3B8'};`">{{ i+1 }}</span>
            </div>
            <div :style="`flex:1;font-size:12px;color:${i<approvalStep?'#065F46':i===approvalStep?'#1D4ED8':'#94A3B8'};font-weight:${i<=approvalStep?600:400};`">{{ stage }}</div>
            <div :style="`font-size:10px;color:${i<approvalStep?'#10B981':i===approvalStep?'#3B82F6':'#CBD5E1'};`">
              {{ i<approvalStep?'Approved':i===approvalStep?'Pending':'—' }}
            </div>
          </div>
        </div>
      </div>

      <div style="padding:12px 14px;border-top:1px solid #E2E8F0;display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;gap:6px;">
          <button style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:7px;padding:7px 0;font-size:11px;cursor:pointer;color:#475569;font-weight:500;">
            <Save :size="11"/> Draft
          </button>
          <button style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:7px;padding:7px 0;font-size:11px;cursor:pointer;color:#475569;font-weight:500;">
            <Download :size="11"/> Export
          </button>
        </div>
        <button @click="advanceApproval()"
          :style="`display:flex;align-items:center;justify-content:center;gap:7px;background:${approvalStep>=3?'#10B981':'linear-gradient(135deg,#3B82F6,#7C3AED)'};color:white;border:none;border-radius:8px;padding:10px 0;font-size:13px;font-weight:700;cursor:pointer;`">
          <Send :size="13"/> {{ approvalStep>=2?'Publish Planogram':'Approve &amp; Forward' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { Check, Search, Plus, Eye, Upload, RotateCcw, CheckCircle, AlertCircle, AlertTriangle, PanelRight, PanelRightClose, Sparkles, Cpu, Save, Download, Send, Image } from 'lucide-vue-next'
import { usePlanogramStore, INIT_PLACEMENTS, SHELF_LABELS, SOS_DATA, appendSas } from '~/stores/planogram'

definePageMeta({ layout: 'default' })

const route = useRoute()
const store = usePlanogramStore()

const currentAssetId = computed(() => Number(route.query.assetId) || 1)

const RECS = [
  { id:1, priority:'high',   icon:'⚡', title:'Move KF Prem to Eye Level',  desc:'Eye-level placement can increase KF Prem 650ml sales by ~18%.' },
  { id:2, priority:'medium', icon:'📊', title:'Balance Shelf 3 Loading',    desc:'Shelf 3 at 42%. Add 2 Heineken facings to improve SOS.' },
  { id:3, priority:'high',   icon:'⚠️', title:'Missing Mandatory SKU',      desc:'Kingfisher Prem 650ml is mandatory for Modern Trade — not placed.' },
  { id:4, priority:'low',    icon:'💡', title:'Group Heineken Variants',    desc:'Adjacency grouping can improve basket size by 8%.' },
]

const VALIDATIONS = [
  { id:1, type:'error',   msg:'Kingfisher Prem 650ml not placed (mandatory)', shelf:'—' },
  { id:2, type:'warning', msg:'Shelf 3 utilization below 50%',                shelf:'Shelf 3' },
  { id:3, type:'success', msg:'Shelf 1 within dimension limits',               shelf:'Shelf 1' },
  { id:4, type:'success', msg:'Brand SOS targets met for Kingfisher',          shelf:'All' },
]

const activeView = ref('front')
const previewMode = ref('edit')
const draggingId = ref<any>(null)
const fromPanel = ref<number|null>(null)
const selectedShelf = ref<number|null>(null)
const search = ref('')
const catFilter = ref('All')
const reviewOpen = ref(false)
const showRef = ref(false)
const toast = ref<string|null>(null)
const approvalStep = ref(0)
const published = ref(false)

const viewPlacements = reactive<Record<string,any>>({
  front: INIT_PLACEMENTS.map(r => [...r]),
  left:  null,
  right: null,
})

const refImages    = reactive<Record<string,string|null>>({ front: null, left: null, right: null })
const refUploading = reactive<Record<string,boolean>>({ front: false, left: false, right: false })

function loadIdealImages(assetId: number) {
  const entry = store.idealImages[assetId]
  if (!entry) return
  for (const view of ['front', 'left', 'right'] as const) {
    const viewKey = view === 'right' ? 'left' : view  // right view falls back to left ideal
    const url = view === 'right' ? (entry.left ?? null) : entry[view as 'front'|'back'|'left']
    if (url && !refImages[view]) refImages[view] = url
  }
}

onMounted(() => loadIdealImages(currentAssetId.value))
watch(currentAssetId, (id) => {
  refImages.front = null; refImages.left = null; refImages.right = null
  loadIdealImages(id)
})

const placements = computed<(number|null)[][]>(() => viewPlacements[activeView.value] || [])
const isViewEmpty = computed(() => viewPlacements[activeView.value] === null)

const cats = computed(() => ['All', ...Array.from(new Set(store.skus.map(s => s.cat)))])
const filteredSKUs = computed(() =>
  store.skus.filter(s =>
    (catFilter.value === 'All' || s.cat === catFilter.value) &&
    s.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

const totalPlaced = computed(() => isViewEmpty.value ? 0 : placements.value.flat().filter(Boolean).length)
const totalSlots  = computed(() => isViewEmpty.value ? 0 : placements.value.flat().length)
const util        = computed(() => totalSlots.value ? Math.round((totalPlaced.value / totalSlots.value) * 100) : 0)

const kpiItems = computed(() => [
  { label:'Utilization',    value:`${util.value}%`, color: util.value>70?'#10B981':'#F59E0B', bg: util.value>70?'#F0FDF4':'#FFFBEB' },
  { label:'Compliance',     value:'87/100',          color:'#3B82F6', bg:'#EFF6FF' },
  { label:'Share of Shelf', value:'38%',             color:'#8B5CF6', bg:'#F5F3FF' },
  { label:'Rev. Impact',    value:'₹2.4L',           color:'#10B981', bg:'#F0FDF4' },
])

const validationIssues = computed(() => {
  if (isViewEmpty.value) return []
  const issues: { type:string; msg:string }[] = []
  const flat = placements.value.flat().filter(Boolean)
  const placedSet = new Set(flat)
  store.skus.filter(s => s.mandatory).forEach(s => {
    if (!placedSet.has(s.id)) issues.push({ type:'error', msg:`${s.name} is mandatory but not placed` })
  })
  placements.value.forEach((row: any[], ri: number) => {
    if (row.filter(Boolean).length === 0) issues.push({ type:'warning', msg:`Shelf ${ri+1} (${SHELF_LABELS[ri]}) is empty` })
  })
  return issues
})

function isPlaced(id: number) { return !isViewEmpty.value && placements.value.flat().some((x: any) => x === id) }
function skuById(id: number) { return store.skus.find(s => s.id === id) }
function skuColor(id: number) { return skuById(id)?.color ?? '#475569' }
function skuName(id: number)  { return skuById(id)?.name ?? '' }
function skuShortName(id: number) { return (skuById(id)?.name ?? '').split(' ').slice(0,2).join(' ') }
function skuBrand(id: number) { return skuById(id)?.brand ?? '' }
function shelfPct(row: any[]) { return Math.round(row.filter(Boolean).length / row.length * 100) }

function showToastMsg(msg: string) { toast.value = msg; setTimeout(() => toast.value = null, 2200) }

function handleDrop(ri: number, ci: number|null) {
  if (isViewEmpty.value) return
  const newP = placements.value.map((r: any[]) => [...r])
  if (fromPanel.value !== null) {
    if (ci != null) { newP[ri][ci] = fromPanel.value }
    else { const ei = newP[ri].findIndex((x: any) => !x); if (ei >= 0) newP[ri][ei] = fromPanel.value }
    const sku = skuById(fromPanel.value)
    showToastMsg(`${sku?.name} → ${SHELF_LABELS[ri]}`)
    fromPanel.value = null
  } else if (draggingId.value) {
    const { skuId, fromRow, fromCol } = draggingId.value
    const moving = newP[fromRow][fromCol]
    if (ci != null) { const ex = newP[ri][ci]; newP[fromRow][fromCol] = ex; newP[ri][ci] = moving }
    else { const ei = newP[ri].findIndex((x: any) => !x); if (ei >= 0) { newP[fromRow][fromCol] = null; newP[ri][ei] = moving } }
    draggingId.value = null
  }
  viewPlacements[activeView.value] = newP
}

function resetPlacements() { viewPlacements[activeView.value] = INIT_PLACEMENTS.map(r => [...r]) }
function initView() { viewPlacements[activeView.value] = INIT_PLACEMENTS.map(r => Array(r.length).fill(null)) }
async function uploadRef(view: string, e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  refImages[view] = URL.createObjectURL(f)
  refUploading[view] = true
  try {
    const assetId  = currentAssetId.value
    const ext      = f.name.split('.').pop() ?? 'jpg'
    const blobPath = `ideal-planograms/asset-${assetId}/${view}_${Date.now()}.${ext}`
    const fd       = new FormData()
    fd.append('file', f)
    fd.append('blobPath', blobPath)
    const res  = await fetch('/api/upload-blob', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok && data.url) {
      refImages[view] = data.url
      const storeView = view === 'right' ? 'left' : view as 'front' | 'back' | 'left'
      store.updateIdealImage(assetId, storeView, data.url)
    }
  } catch { /* keep local blob URL as fallback */ } finally {
    refUploading[view] = false
  }
}
function advanceApproval() {
  approvalStep.value = Math.min(3, approvalStep.value + 1)
  if (approvalStep.value >= 3) published.value = true
}
</script>
