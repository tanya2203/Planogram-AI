<template>
  <div style="padding:24px;" @click="activeMenu=null">

    <!-- Asset Modal (Add / Edit) -->
    <div v-if="showAssetModal" style="position:fixed;inset:0;background:rgba(15,23,42,0.5);z-index:100;display:flex;align-items:center;justify-content:center;" @click.self="closeAssetModal">
      <div style="background:white;border-radius:16px;width:560px;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(15,23,42,0.2);overflow:hidden;">
        <div style="padding:18px 22px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;gap:12px;">
          <Package :size="18" color="#3B82F6"/>
          <div style="font-weight:700;font-size:16px;color:#0F172A;">{{ assetModalMode==='add'?'Add New Asset':'Edit Asset' }}</div>
          <button @click="closeAssetModal" style="margin-left:auto;background:transparent;border:none;cursor:pointer;"><X :size="18" color="#94A3B8"/></button>
        </div>
        <div style="flex:1;overflow-y:auto;padding:20px 22px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="grid-column:1/-1;">
              <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">Asset Name <span style="color:#EF4444;">*</span></label>
              <input v-model="assetForm.name" placeholder="e.g. Beer Cooler BC-6D"
                style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:9px 12px;font-size:13px;color:#0F172A;outline:none;box-sizing:border-box;"/>
            </div>
            <div>
              <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">Type <span style="color:#EF4444;">*</span></label>
              <select v-model="assetForm.type"
                style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:9px 12px;font-size:13px;color:#0F172A;outline:none;box-sizing:border-box;">
                <option v-for="t in ASSET_TYPES" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">Icon (emoji)</label>
              <input v-model="assetForm.img" placeholder="🍺"
                style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:9px 12px;font-size:16px;color:#0F172A;outline:none;box-sizing:border-box;"/>
            </div>
            <div>
              <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">Shelves</label>
              <input v-model.number="assetForm.shelves" type="number" min="1" max="20" placeholder="5"
                style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:9px 12px;font-size:13px;color:#0F172A;outline:none;box-sizing:border-box;"/>
            </div>
            <div>
              <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">Region</label>
              <input v-model="assetForm.region" placeholder="e.g. North"
                style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:9px 12px;font-size:13px;color:#0F172A;outline:none;box-sizing:border-box;"/>
            </div>
            <div v-for="df in [{key:'w',label:'Width (cm)'},{key:'h',label:'Height (cm)'},{key:'d',label:'Depth (cm)'}]" :key="df.key">
              <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">{{ df.label }}</label>
              <input v-model.number="(assetForm as any)[df.key]" type="number" min="1" placeholder="90"
                style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:9px 12px;font-size:13px;color:#0F172A;outline:none;box-sizing:border-box;"/>
            </div>
            <div style="grid-column:1/-1;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;display:flex;align-items:center;gap:14px;">
              <div style="flex:1;">
                <div style="font-size:13px;font-weight:700;color:#0F172A;margin-bottom:2px;">Active Status</div>
                <div style="font-size:12px;color:#64748B;">Mark this asset as active and available for planogram assignment.</div>
              </div>
              <button @click="assetForm.status=(assetForm.status==='active'?'draft':'active')" style="background:transparent;border:none;cursor:pointer;padding:0;">
                <ToggleRight v-if="assetForm.status==='active'" :size="36" color="#3B82F6"/>
                <ToggleLeft v-else :size="36" color="#CBD5E1"/>
              </button>
            </div>
          </div>
          <div v-if="assetSaveError" style="margin-top:12px;font-size:12px;color:#EF4444;">{{ assetSaveError }}</div>
        </div>
        <div style="padding:14px 22px;border-top:1px solid #E2E8F0;display:flex;gap:10px;align-items:center;">
          <button @click="closeAssetModal" style="background:transparent;border:1px solid #E2E8F0;border-radius:8px;padding:8px 18px;font-size:13px;cursor:pointer;color:#475569;">Cancel</button>
          <button @click="saveAsset" style="margin-left:auto;background:#3B82F6;color:white;border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:600;cursor:pointer;">
            {{ assetModalMode==='add'?'Add Asset':'Save Changes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" style="position:fixed;inset:0;background:rgba(15,23,42,0.5);z-index:100;display:flex;align-items:center;justify-content:center;" @click.self="showDeleteConfirm=false">
      <div style="background:white;border-radius:14px;width:400px;padding:24px;box-shadow:0 24px 64px rgba(15,23,42,0.2);">
        <div style="font-size:16px;font-weight:700;color:#0F172A;margin-bottom:8px;">Delete "{{ deletingItem?.name }}"?</div>
        <div style="font-size:13px;color:#64748B;margin-bottom:20px;">This action cannot be undone. The {{ deletingItemType }} will be permanently removed.</div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button @click="showDeleteConfirm=false" style="background:transparent;border:1px solid #E2E8F0;border-radius:8px;padding:8px 18px;font-size:13px;cursor:pointer;color:#475569;">Cancel</button>
          <button @click="doDelete" style="background:#EF4444;color:white;border:none;border-radius:8px;padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;">Delete</button>
        </div>
      </div>
    </div>

    <!-- SKU Modal -->
    <div v-if="showModal" style="position:fixed;inset:0;background:rgba(15,23,42,0.5);z-index:100;display:flex;align-items:center;justify-content:center;">
      <div style="background:white;border-radius:16px;width:680px;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(15,23,42,0.2);overflow:hidden;">

        <!-- Modal header -->
        <div style="padding:18px 22px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;gap:12px;">
          <Package :size="18" color="#3B82F6"/>
          <div style="font-weight:700;font-size:16px;color:#0F172A;">Add New SKU</div>
          <button @click="closeModal" style="margin-left:auto;background:transparent;border:none;cursor:pointer;"><X :size="18" color="#94A3B8"/></button>
        </div>

        <!-- Tab bar -->
        <div style="display:flex;border-bottom:1px solid #E2E8F0;padding:0 22px;">
          <button v-for="t in skuTabs" :key="t.id" @click="skuTab=t.id"
            :style="`display:flex;align-items:center;gap:6px;padding:11px 14px;border:none;border-bottom:2px solid ${skuTab===t.id?'#3B82F6':'transparent'};background:transparent;color:${skuTab===t.id?'#1D4ED8':'#64748B'};font-size:13px;font-weight:${skuTab===t.id?600:400};cursor:pointer;margin-right:4px;transition:color 0.12s;`">
            {{ t.label }}
          </button>
        </div>

        <!-- Tab body -->
        <div style="flex:1;overflow-y:auto;padding:20px 22px;">

          <!-- ── PACKSHOT TAB ─────────────────────────────────────────────── -->
          <div v-if="skuTab==='packshot'">

            <!-- SKU name input (drives blob folder path) -->
            <div style="margin-bottom:16px;padding:12px 14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;display:flex;align-items:center;gap:10px;">
              <div style="font-size:12px;font-weight:600;color:#374151;white-space:nowrap;">SKU Name (for folder)</div>
              <input v-model="form.name" placeholder="e.g. Amstel 330ml"
                style="flex:1;background:white;border:1px solid #E2E8F0;border-radius:6px;padding:6px 10px;font-size:13px;color:#0F172A;outline:none;"/>
              <div style="font-size:11px;color:#94A3B8;white-space:nowrap;">→ packshots/{{ skuFolder }}/</div>
            </div>

            <!-- 3 upload zones -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:16px;">
              <UploadZone
                v-for="side in (['front','back','left'] as const)" :key="side"
                :side="side"
                :label="side==='front'?'Front (required)':side==='back'?'Back (optional)':'Left (optional)'"
                :state="blobState(side)"
                @pick="file=>handleFilePick(file,side)"
                @remove="blob.removeFile(side)"
                @retry="(side==='front'?retryFront:side==='back'?retryBack:retryLeft)()"
              />
            </div>

            <!-- Shelf rendering preview -->
            <div style="margin-top:4px;">
              <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;">Shelf Rendering Preview</div>
              <div style="background:#334155;border-radius:10px;padding:10px 8px;display:flex;gap:3px;">
                <div v-for="i in 6" :key="i"
                  :style="`flex:1;height:44px;border-radius:4px;overflow:hidden;border:${i===3?'2px solid #1D4ED8':'2px dashed #64748B'};display:flex;align-items:center;justify-content:center;background:${i===3?'#1D4ED8CC':'#475569'};`">
                  <template v-if="i===3&&blob.frontState.preview">
                    <img :src="blob.frontState.preview" style="width:100%;height:100%;object-fit:cover;"/>
                  </template>
                  <template v-else-if="i===3">
                    <div style="width:12px;height:28px;border-radius:2px;background:rgba(255,255,255,0.3);"/>
                  </template>
                </div>
              </div>
              <div style="font-size:11px;color:#94A3B8;margin-top:6px;">
                Preview updates after front upload · Default facing: {{ modalDefF }}
                <span v-if="blob.frontState.url" style="color:#10B981;font-weight:600;margin-left:6px;">✓ Front uploaded</span>
              </div>
            </div>
          </div>

          <!-- ── DIMS TAB ─────────────────────────────────────────────────── -->
          <div v-if="skuTab==='dims'">
            <div style="font-size:13px;color:#64748B;margin-bottom:18px;">Physical dimensions are used for capacity calculations and shelf rendering.</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
              <div v-for="d in dimFields" :key="d.key">
                <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">{{ d.label }}</label>
                <input v-model.number="(dimVals as any)[d.key]" :placeholder="d.placeholder"
                  style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:9px 12px;font-size:13px;color:#0F172A;outline:none;box-sizing:border-box;"/>
                <div style="font-size:11px;color:#94A3B8;margin-top:4px;">{{ d.hint }}</div>
              </div>
            </div>
            <div style="margin-top:20px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:12px 16px;display:flex;gap:10px;">
              <CheckCircle :size="16" color="#10B981" style="flex-shrink:0;margin-top:1px;"/>
              <div style="font-size:12px;color:#065F46;">Dimensions are validated against selected asset shelf depth and height during planogram generation.</div>
            </div>
          </div>

          <!-- ── RULES TAB ───────────────────────────────────────────────── -->
          <div v-if="skuTab==='rules'">
            <div style="font-size:13px;color:#64748B;margin-bottom:20px;">Define facing constraints and mandatory placement rules for this SKU.</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px;">
              <div v-for="fc in facingFields" :key="fc.label">
                <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:8px;">{{ fc.label }}</label>
                <div style="display:flex;align-items:center;gap:8px;">
                  <button @click="fc.dec()" style="width:28px;height:28px;border-radius:6px;border:1px solid #E2E8F0;background:white;cursor:pointer;font-size:16px;color:#475569;display:flex;align-items:center;justify-content:center;">−</button>
                  <div style="background:#F1F5F9;border-radius:6px;padding:5px 0;font-size:16px;font-weight:700;color:#0F172A;min-width:40px;text-align:center;">{{ fc.val }}</div>
                  <button @click="fc.inc()" style="width:28px;height:28px;border-radius:6px;border:1px solid #E2E8F0;background:white;cursor:pointer;font-size:16px;color:#475569;display:flex;align-items:center;justify-content:center;">+</button>
                </div>
                <div style="font-size:11px;color:#94A3B8;margin-top:5px;">{{ fc.hint }}</div>
              </div>
            </div>
            <div style="margin-bottom:24px;">
              <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;">Facing Preview</div>
              <div style="background:#334155;border-radius:8px;padding:8px 6px;display:flex;gap:2px;">
                <div v-for="i in modalDefF" :key="'def'+i"
                  style="flex:1;height:40px;border-radius:4px;background:#1D4ED8CC;border:2px solid #1D4ED8;display:flex;align-items:center;justify-content:center;">
                  <div style="width:55%;height:60%;background:rgba(255,255,255,0.3);border-radius:2px;"/>
                </div>
                <div v-for="i in Math.max(0,modalMaxF-modalDefF)" :key="'empty'+i"
                  style="flex:1;height:40px;border-radius:4px;background:#475569;border:2px dashed #64748B;display:flex;align-items:center;justify-content:center;">
                  <Plus :size="10" color="#64748B"/>
                </div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#94A3B8;margin-top:4px;">
                <span>Min: {{ modalMinF }}</span><span>Default: {{ modalDefF }}</span><span>Max: {{ modalMaxF }}</span>
              </div>
            </div>
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;display:flex;align-items:center;gap:14px;">
              <div style="flex:1;">
                <div style="font-size:13px;font-weight:700;color:#0F172A;margin-bottom:2px;">Mandatory SKU</div>
                <div style="font-size:12px;color:#64748B;">Must appear in all planograms for configured outlet. Absence triggers a validation error.</div>
              </div>
              <button @click="modalMandatory=!modalMandatory" style="background:transparent;border:none;cursor:pointer;padding:0;">
                <ToggleRight v-if="modalMandatory" :size="36" color="#3B82F6"/>
                <ToggleLeft v-else :size="36" color="#CBD5E1"/>
              </button>
            </div>
          </div>

          <!-- ── META TAB ────────────────────────────────────────────────── -->
          <div v-if="skuTab==='meta'" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div v-for="m in metaInputs" :key="m.key">
              <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">{{ m.label }}</label>
              <input v-model="(form as any)[m.key]" :placeholder="m.placeholder"
                style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:9px 12px;font-size:13px;color:#0F172A;outline:none;box-sizing:border-box;"/>
            </div>
            <!-- SKU code preview -->
            <div style="grid-column:1 / -1;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:8px;">
              <div style="font-size:12px;color:#64748B;">Auto SKU Code:</div>
              <div style="font-size:13px;font-weight:700;color:#0F172A;font-family:monospace;">{{ autoSkuCode }}</div>
            </div>
          </div>
        </div>

        <!-- Modal footer -->
        <div style="padding:14px 22px;border-top:1px solid #E2E8F0;display:flex;gap:10px;align-items:center;">
          <button @click="closeModal" style="background:transparent;border:1px solid #E2E8F0;border-radius:8px;padding:8px 18px;font-size:13px;cursor:pointer;color:#475569;">Cancel</button>
          <!-- Validation hint -->
          <div v-if="saveError" style="font-size:12px;color:#EF4444;margin-left:4px;">{{ saveError }}</div>
          <div style="margin-left:auto;display:flex;gap:8px;">
            <button @click="saveDraft" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:8px 16px;font-size:13px;cursor:pointer;color:#475569;font-weight:500;">Save Draft</button>
            <button @click="addSKU" :disabled="blob.frontState.uploading||blob.backState.uploading||blob.leftState.uploading"
              style="background:#3B82F6;color:white;border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:600;cursor:pointer;">
              {{ blob.frontState.uploading||blob.backState.uploading||blob.leftState.uploading ? 'Uploading…' : 'Add SKU' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
      <div style="display:flex;background:#F1F5F9;border-radius:8px;padding:3px;">
        <button v-for="[id,label] in [['assets','Retail Assets'],['skus','SKU Library']]" :key="id"
          @click="tab=id"
          :style="`padding:6px 16px;border-radius:6px;border:none;cursor:pointer;font-size:13px;font-weight:${tab===id?600:400};background:${tab===id?'white':'transparent'};color:${tab===id?'#0F172A':'#64748B'};box-shadow:${tab===id?'0 1px 3px rgba(0,0,0,0.1)':'none'};transition:all 0.15s;`">
          {{ label }}
        </button>
      </div>
      <div style="display:flex;align-items:center;gap:8px;background:white;border:1px solid #E2E8F0;border-radius:8px;padding:6px 12px;flex:1;max-width:280px;">
        <Search :size="14" color="#94A3B8"/>
        <input v-model="search" :placeholder="`Search ${tab==='assets'?'assets':'SKUs'}...`"
          style="border:none;background:transparent;font-size:13px;outline:none;flex:1;color:#334155;"/>
      </div>
      <div v-if="tab==='skus'" style="display:flex;gap:5px;flex-wrap:wrap;">
        <button v-for="c in cats" :key="c" @click="catFilter=c"
          :style="`padding:5px 10px;border-radius:20px;border:1.5px solid ${catFilter===c?'#3B82F6':'#E2E8F0'};background:${catFilter===c?'#EFF6FF':'white'};color:${catFilter===c?'#1D4ED8':'#475569'};font-size:11px;font-weight:${catFilter===c?600:400};cursor:pointer;`">
          {{ c }}
        </button>
      </div>
      <button style="display:flex;align-items:center;gap:6px;background:white;border:1px solid #E2E8F0;border-radius:8px;padding:7px 12px;font-size:13px;cursor:pointer;color:#475569;">
        <Filter :size="14"/> Filter
      </button>
      <button @click="tab==='skus' ? openModal() : openAssetModal()"
        style="display:flex;align-items:center;gap:6px;background:#3B82F6;color:white;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;">
        <Plus :size="14"/> Add {{ tab==='assets'?'Asset':'SKU' }}
      </button>
    </div>

    <!-- Assets tab -->
    <div v-if="tab==='assets'" style="display:grid;grid-template-columns:2fr 1fr;gap:20px;">
      <div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;">
          <div v-for="a in filteredAssets" :key="a.id"
            @click="selAsset=a"
            :style="`background:white;border:1.5px solid ${selAsset?.id===a.id?'#3B82F6':'#E2E8F0'};border-radius:12px;padding:16px;cursor:pointer;transition:all 0.15s;box-shadow:0 1px 3px rgba(15,23,42,0.04);`"
            @mouseenter="e=>(e.currentTarget as HTMLElement).style.boxShadow='0 4px 16px rgba(15,23,42,0.08)'"
            @mouseleave="e=>(e.currentTarget as HTMLElement).style.boxShadow='0 1px 3px rgba(15,23,42,0.04)'">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
              <div style="font-size:28px;">{{ a.img }}</div>
              <div style="display:flex;align-items:center;gap:5px;">
                <span :style="`display:flex;align-items:center;gap:4px;background:${a.status==='active'?'#F0FDF4':'#FFFBEB'};padding:3px 8px;border-radius:4px;`">
                  <div :style="`width:5px;height:5px;border-radius:50%;background:${a.status==='active'?'#10B981':'#F59E0B'};`"/>
                  <span :style="`font-size:10px;font-weight:600;color:${a.status==='active'?'#065F46':'#92400E'};`">{{ a.status }}</span>
                </span>
                <!-- ··· menu -->
                <div style="position:relative;" @click.stop>
                  <button @click="activeMenu=activeMenu===a.id?null:a.id"
                    style="background:transparent;border:none;cursor:pointer;padding:3px 4px;border-radius:4px;display:flex;align-items:center;color:#94A3B8;"
                    @mouseenter="(e)=>(e.currentTarget as HTMLElement).style.background='#F1F5F9'"
                    @mouseleave="(e)=>(e.currentTarget as HTMLElement).style.background='transparent'">
                    <MoreHorizontal :size="15"/>
                  </button>
                  <div v-if="activeMenu===a.id"
                    style="position:absolute;right:0;top:calc(100% + 2px);background:white;border:1px solid #E2E8F0;border-radius:8px;box-shadow:0 8px 24px rgba(15,23,42,0.12);z-index:50;min-width:140px;overflow:hidden;">
                    <button @click="openAssetModal(a);activeMenu=null"
                      style="display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;border:none;background:transparent;cursor:pointer;font-size:13px;color:#334155;text-align:left;"
                      @mouseenter="(e)=>(e.currentTarget as HTMLElement).style.background='#F8FAFC'"
                      @mouseleave="(e)=>(e.currentTarget as HTMLElement).style.background='transparent'">
                      <Pencil :size="13" color="#64748B"/> Edit
                    </button>
                    <button @click="store.duplicateAsset(a.id);activeMenu=null"
                      style="display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;border:none;background:transparent;cursor:pointer;font-size:13px;color:#334155;text-align:left;"
                      @mouseenter="(e)=>(e.currentTarget as HTMLElement).style.background='#F8FAFC'"
                      @mouseleave="(e)=>(e.currentTarget as HTMLElement).style.background='transparent'">
                      <Copy :size="13" color="#64748B"/> Duplicate
                    </button>
                    <div style="height:1px;background:#F1F5F9;"/>
                    <button @click="confirmDelete(a,'asset');activeMenu=null"
                      style="display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;border:none;background:transparent;cursor:pointer;font-size:13px;color:#EF4444;text-align:left;"
                      @mouseenter="(e)=>(e.currentTarget as HTMLElement).style.background='#FEF2F2'"
                      @mouseleave="(e)=>(e.currentTarget as HTMLElement).style.background='transparent'">
                      <Trash2 :size="13" color="#EF4444"/> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div style="font-weight:700;font-size:14px;color:#0F172A;margin-bottom:3px;">{{ a.name }}</div>
            <div style="font-size:12px;color:#64748B;margin-bottom:10px;">{{ a.type }}</div>
            <div style="display:flex;gap:5px;flex-wrap:wrap;">
              <span style="background:#EFF6FF;color:#1D4ED8;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;">{{ a.shelves }} shelves</span>
              <span style="background:#F8FAFC;color:#475569;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;">{{ a.w }}×{{ a.h }}cm</span>
              <span style="background:#F8FAFC;color:#475569;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;">{{ a.region }}</span>
            </div>
          </div>
        </div>
        <div style="margin-top:20px;border:2px dashed #CBD5E1;border-radius:12px;padding:28px 24px;text-align:center;background:#F8FAFC;cursor:pointer;transition:all 0.15s;"
          @click="openAssetModal()"
          @mouseenter="e=>{(e.currentTarget as HTMLElement).style.borderColor='#3B82F6';(e.currentTarget as HTMLElement).style.background='#EFF6FF';}"
          @mouseleave="e=>{(e.currentTarget as HTMLElement).style.borderColor='#CBD5E1';(e.currentTarget as HTMLElement).style.background='#F8FAFC';}">
          <Upload :size="22" color="#94A3B8" style="margin:0 auto 8px;display:block;"/>
          <div style="font-size:14px;font-weight:600;color:#334155;margin-bottom:3px;">Add a new asset</div>
          <div style="font-size:12px;color:#94A3B8;">Click to fill out asset details</div>
        </div>
      </div>
      <div>
        <div v-if="selAsset" style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:20px;position:sticky;top:80px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
            <div style="font-size:28px;">{{ selAsset.img }}</div>
            <button @click="selAsset=null" style="background:transparent;border:none;cursor:pointer;"><X :size="16" color="#94A3B8"/></button>
          </div>
          <div style="font-weight:700;font-size:16px;color:#0F172A;margin-bottom:6px;">{{ selAsset.name }}</div>
          <span style="background:#EFF6FF;color:#1D4ED8;font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;">{{ selAsset.type }}</span>
          <div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div v-for="[k,v] in [['Shelves',selAsset.shelves],['Width',selAsset.w+'cm'],['Height',selAsset.h+'cm'],['Depth',selAsset.d+'cm'],['Region',selAsset.region],['Status',selAsset.status]]" :key="k"
              style="background:#F8FAFC;border-radius:8px;padding:10px;">
              <div style="font-size:11px;color:#94A3B8;margin-bottom:2px;">{{ k }}</div>
              <div style="font-size:13px;font-weight:700;color:#0F172A;">{{ v }}</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:16px;">
            <button @click="openAssetModal(selAsset)"
              style="flex:1;background:#F8FAFC;color:#334155;border:1px solid #E2E8F0;border-radius:8px;padding:8px 0;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
              <Pencil :size="13"/> Edit Asset
            </button>
            <button style="flex:1;background:#3B82F6;color:white;border:none;border-radius:8px;padding:9px 0;font-size:13px;font-weight:600;cursor:pointer;">Use in Studio</button>
          </div>
        </div>
        <div v-else style="background:#F8FAFC;border:1.5px dashed #E2E8F0;border-radius:12px;padding:40px;text-align:center;color:#94A3B8;">
          <Package :size="32" style="margin:0 auto 12px;display:block;"/>
          <div style="font-size:14px;font-weight:500;margin-bottom:4px;">Select an asset</div>
          <div style="font-size:12px;">Click a card to view details</div>
        </div>
      </div>
    </div>

    <!-- SKUs tab -->
    <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;">
      <div v-for="s in filteredSKUs" :key="s.id"
        style="background:white;border:1.5px solid #E2E8F0;border-radius:10px;padding:14px;cursor:pointer;transition:all 0.15s;"
        @mouseenter="e=>(e.currentTarget as HTMLElement).style.borderColor='#CBD5E1'"
        @mouseleave="e=>(e.currentTarget as HTMLElement).style.borderColor='#E2E8F0'">
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <!-- Packshot or color swatch -->
          <div :style="`width:48px;height:60px;border-radius:8px;overflow:hidden;flex-shrink:0;border:2px solid ${s.color}33;`">
            <img v-if="s.front_packshot_url" :src="appendSas(s.front_packshot_url)!"
              style="width:100%;height:100%;object-fit:cover;display:block;"
              @error="e=>(e.target as HTMLImageElement).style.display='none'"/>
            <div v-else
              :style="`width:100%;height:100%;background:${s.color}18;display:flex;align-items:center;justify-content:center;`">
              <div :style="`width:40%;height:75%;border-radius:3px;background:${s.color};opacity:0.85;`"/>
            </div>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;flex-wrap:wrap;">
              <div style="font-weight:700;font-size:13px;color:#0F172A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ s.name }}</div>
              <span v-if="s.mandatory" style="background:#FEF2F2;color:#991B1B;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;">Mandatory</span>
            </div>
            <div style="font-size:11px;color:#64748B;margin-bottom:6px;">{{ s.brand }} · {{ s.cat }} · {{ s.variant }}</div>
            <div style="display:flex;gap:5px;flex-wrap:wrap;">
              <span style="background:#F8FAFC;color:#475569;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;">{{ s.w }}W×{{ s.h }}H×{{ s.d }}D cm</span>
              <span style="background:#EFF6FF;color:#1D4ED8;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;">×{{ s.defaultF }} facing</span>
              <span style="background:#F8FAFC;color:#475569;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;">{{ s.minF }}–{{ s.maxF }} range</span>
            </div>
          </div>
        </div>
      </div>
      <div @click="openModal()"
        style="border:1.5px dashed #E2E8F0;border-radius:10px;padding:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;color:#94A3B8;min-height:100px;transition:all 0.15s;"
        @mouseenter="e=>{(e.currentTarget as HTMLElement).style.borderColor='#3B82F6';(e.currentTarget as HTMLElement).style.color='#3B82F6';}"
        @mouseleave="e=>{(e.currentTarget as HTMLElement).style.borderColor='#E2E8F0';(e.currentTarget as HTMLElement).style.color='#94A3B8';}">
        <Plus :size="20"/><div style="font-size:13px;font-weight:500;">Add SKU</div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Package, Search, Filter, Plus, Upload, X, CheckCircle, ToggleLeft, ToggleRight, MoreHorizontal, Pencil, Copy, Trash2 } from 'lucide-vue-next'
import { usePlanogramStore, appendSas } from '~/stores/planogram'
import { useAzureBlob } from '~/composables/useAzureBlob'

definePageMeta({ layout: 'default' })

const store = usePlanogramStore()
const blob  = useAzureBlob()

const ASSET_TYPES = ['Visicooler', 'Gondola', 'End Cap', 'Counter', 'Rack', 'Shelf']

// ── page state ────────────────────────────────────────────────────────────────
const tab       = ref('assets')
const search    = ref('')
const selAsset  = ref<any>(null)
const showModal = ref(false)
const catFilter = ref('All')
const skuTab    = ref('packshot')
const saveError = ref('')
const activeMenu = ref<number|null>(null)

// ── asset modal state ─────────────────────────────────────────────────────────
const showAssetModal  = ref(false)
const assetModalMode  = ref<'add'|'edit'>('add')
const assetSaveError  = ref('')
const editingAssetId  = ref<number|null>(null)
const assetForm = reactive({ name: '', type: 'Visicooler', img: '🏬', shelves: 5, w: 90, h: 180, d: 60, region: '', status: 'active' as 'active'|'draft' })

// ── delete confirm state ──────────────────────────────────────────────────────
const showDeleteConfirm = ref(false)
const deletingItem      = ref<{id:number;name:string}|null>(null)
const deletingItemType  = ref<'asset'|'sku'>('asset')

// ── modal form ────────────────────────────────────────────────────────────────
const form = reactive({ name:'', brand:'', cat:'', variant:'' })
const modalMinF    = ref(1)
const modalMaxF    = ref(4)
const modalDefF    = ref(2)
const modalMandatory = ref(false)

// last-picked files per side (for retry)
const lastFile = { front: null as File|null, back: null as File|null, left: null as File|null }

const skuFolder  = computed(() =>
  form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'new-sku'
)
const autoSkuCode = computed(() => {
  const b = form.brand.substring(0,3).toUpperCase()
  const n = form.name.replace(/\s+/g,'').substring(0,8).toUpperCase()
  return b && n ? `${b}-${n}` : '—'
})

// ── tabs / fields ─────────────────────────────────────────────────────────────
const skuTabs = [
  { id: 'packshot', label: 'Packshot' },
  { id: 'dims',     label: 'Dimensions' },
  { id: 'rules',    label: 'Shelf Rules' },
  { id: 'meta',     label: 'Metadata' },
]

const dimFields = [
  { key:'h', label:'Height (cm)', placeholder:'e.g. 22', hint:'Shelf clearance check' },
  { key:'w', label:'Width (cm)',  placeholder:'e.g. 7',  hint:'Facing width basis' },
  { key:'d', label:'Depth (cm)',  placeholder:'e.g. 7',  hint:'Shelf depth check' },
]
const dimVals = reactive({ h: 22, w: 7, d: 7 })

const facingFields = computed(() => [
  { label:'Min Facings',     val:modalMinF.value, hint:'Compliance floor',  inc:()=>modalMinF.value=Math.min(4,modalMinF.value+1), dec:()=>modalMinF.value=Math.max(1,modalMinF.value-1) },
  { label:'Max Facings',     val:modalMaxF.value, hint:'Shelf capacity cap', inc:()=>modalMaxF.value=Math.min(8,modalMaxF.value+1), dec:()=>modalMaxF.value=Math.max(2,modalMaxF.value-1) },
  { label:'Default Facings', val:modalDefF.value, hint:'AI default',         inc:()=>modalDefF.value=Math.min(6,modalDefF.value+1), dec:()=>modalDefF.value=Math.max(1,modalDefF.value-1) },
])

const metaInputs = [
  { key:'name',    label:'SKU Name',  placeholder:'e.g. Amstel 330ml' },
  { key:'brand',   label:'Brand',     placeholder:'e.g. Amstel' },
  { key:'cat',     label:'Category',  placeholder:'e.g. Lager' },
  { key:'variant', label:'Variant',   placeholder:'e.g. 330ml can' },
]

// ── blob state helper ─────────────────────────────────────────────────────────
function blobState(side: 'front'|'back'|'left') {
  return side === 'front' ? blob.frontState : side === 'back' ? blob.backState : blob.leftState
}

function handleFilePick(file: File, side: 'front'|'back'|'left') {
  lastFile[side] = file
  blob.uploadFile(file, side, form.name || 'new-sku')
}

function retryFront() { if (lastFile.front) blob.uploadFile(lastFile.front, 'front', form.name || 'new-sku') }
function retryBack()  { if (lastFile.back)  blob.uploadFile(lastFile.back,  'back',  form.name || 'new-sku') }
function retryLeft()  { if (lastFile.left)  blob.uploadFile(lastFile.left,  'left',  form.name || 'new-sku') }

// ── asset modal ───────────────────────────────────────────────────────────────
function openAssetModal(asset?: any) {
  if (asset) {
    assetModalMode.value = 'edit'
    editingAssetId.value = asset.id
    Object.assign(assetForm, { name: asset.name, type: asset.type, img: asset.img, shelves: asset.shelves, w: asset.w, h: asset.h, d: asset.d, region: asset.region, status: asset.status })
  } else {
    assetModalMode.value = 'add'
    editingAssetId.value = null
    Object.assign(assetForm, { name: '', type: 'Visicooler', img: '🏬', shelves: 5, w: 90, h: 180, d: 60, region: '', status: 'active' })
  }
  assetSaveError.value = ''
  showAssetModal.value = true
}

function closeAssetModal() {
  showAssetModal.value = false
}

function saveAsset() {
  assetSaveError.value = ''
  if (!assetForm.name.trim()) { assetSaveError.value = 'Asset name is required'; return }
  if (!assetForm.type)        { assetSaveError.value = 'Asset type is required'; return }
  if (assetModalMode.value === 'edit' && editingAssetId.value !== null) {
    store.updateAsset(editingAssetId.value, { ...assetForm })
    if (selAsset.value?.id === editingAssetId.value) {
      selAsset.value = store.assets.find(a => a.id === editingAssetId.value) ?? null
    }
  } else {
    store.addAsset({ ...assetForm })
  }
  closeAssetModal()
}

// ── delete confirm ────────────────────────────────────────────────────────────
function confirmDelete(item: {id:number;name:string}, type: 'asset'|'sku') {
  deletingItem.value = item
  deletingItemType.value = type
  showDeleteConfirm.value = true
}

function doDelete() {
  if (!deletingItem.value) return
  if (deletingItemType.value === 'asset') {
    store.deleteAsset(deletingItem.value.id)
    if (selAsset.value?.id === deletingItem.value.id) selAsset.value = null
  }
  showDeleteConfirm.value = false
  deletingItem.value = null
}

// ── SKU modal open/close ──────────────────────────────────────────────────────
function openModal() {
  showModal.value = true
  skuTab.value = 'packshot'
  saveError.value = ''
  Object.assign(form, { name:'', brand:'', cat:'', variant:'' })
  modalMinF.value = 1; modalMaxF.value = 4; modalDefF.value = 2; modalMandatory.value = false
  lastFile.front = null; lastFile.back = null; lastFile.left = null
  blob.reset()
}

function closeModal() {
  showModal.value = false
  blob.reset()
}

// ── save SKU ──────────────────────────────────────────────────────────────────
function addSKU() {
  saveError.value = ''
  if (!form.name.trim())  { saveError.value = 'SKU Name is required'; skuTab.value = 'meta'; return }
  if (!form.brand.trim()) { saveError.value = 'Brand is required';    skuTab.value = 'meta'; return }
  if (!form.cat.trim())   { saveError.value = 'Category is required'; skuTab.value = 'meta'; return }

  const COLORS = ['#1D4ED8','#16A34A','#DC2626','#7C3AED','#F59E0B','#059669','#EC4899']
  const color  = COLORS[store.skus.length % COLORS.length]

  store.addSKU({
    name: form.name.trim(),
    brand: form.brand.trim(),
    cat: form.cat.trim(),
    variant: form.variant.trim(),
    w: dimVals.w, h: dimVals.h, d: dimVals.d,
    minF: modalMinF.value, maxF: modalMaxF.value, defaultF: modalDefF.value,
    mandatory: modalMandatory.value,
    color,
    sku_code: autoSkuCode.value,
    mandatory_flag: modalMandatory.value,
    front_packshot_url: blob.frontState.url,
    back_packshot_url:  blob.backState.url,
    left_packshot_url:  blob.leftState.url,
  })

  closeModal()
}

function saveDraft() { addSKU() }

// ── filtered data ─────────────────────────────────────────────────────────────
const cats = computed(() => ['All', ...Array.from(new Set(store.skus.map(s => s.cat)))])

const filteredAssets = computed(() =>
  store.assets.filter(a => a.name.toLowerCase().includes(search.value.toLowerCase()))
)

const filteredSKUs = computed(() =>
  store.skus.filter(s =>
    (catFilter.value === 'All' || s.cat === catFilter.value) &&
    (s.name.toLowerCase().includes(search.value.toLowerCase()) || s.brand.toLowerCase().includes(search.value.toLowerCase()))
  )
)
</script>
