<template>
  <div style="padding:24px;" @click="activeMenu=null;showTierMenu=null">

    <!-- Toast -->
    <div v-if="toastMsg"
      style="position:fixed;bottom:24px;right:24px;background:#10B981;color:white;border-radius:10px;padding:12px 20px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(16,185,129,0.3);z-index:200;pointer-events:none;">
      {{ toastMsg }}
    </div>

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
          <div style="font-weight:700;font-size:16px;color:#0F172A;">{{ skuModalMode==='add' ? 'Add New SKU' : 'Edit SKU' }}</div>
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
            <!-- Tier selector -->
            <div style="margin-bottom:24px;">
              <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:10px;">Tier</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                <button v-for="t in TIERS" :key="t.value" @click="skuTier=t.value"
                  :style="`display:flex;align-items:center;gap:5px;padding:5px 12px;border-radius:20px;border:1.5px solid ${skuTier===t.value?t.color:'#E2E8F0'};background:${skuTier===t.value?t.color+'18':'white'};color:${skuTier===t.value?t.color:'#475569'};font-size:12px;font-weight:${skuTier===t.value?600:400};cursor:pointer;transition:all 0.12s;`">
                  <div :style="`width:7px;height:7px;border-radius:50%;background:${t.color};flex-shrink:0;`"/>
                  {{ t.label }}
                </button>
              </div>
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
            <!-- isActive toggle -->
            <div style="grid-column:1/-1;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;display:flex;align-items:center;gap:14px;">
              <div style="flex:1;">
                <div style="font-size:13px;font-weight:700;color:#0F172A;margin-bottom:2px;">Active Status</div>
                <div style="font-size:12px;color:#64748B;">Mark this SKU as active and available for planogram assignment.</div>
              </div>
              <button @click="skuIsActive=!skuIsActive" style="background:transparent;border:none;cursor:pointer;padding:0;">
                <ToggleRight v-if="skuIsActive" :size="36" color="#3B82F6"/>
                <ToggleLeft v-else :size="36" color="#CBD5E1"/>
              </button>
            </div>
          </div>
        </div>

        <!-- Modal footer -->
        <div style="padding:14px 22px;border-top:1px solid #E2E8F0;display:flex;gap:10px;align-items:center;">
          <button @click="closeModal" style="background:transparent;border:1px solid #E2E8F0;border-radius:8px;padding:8px 18px;font-size:13px;cursor:pointer;color:#475569;">Cancel</button>
          <div v-if="saveError" style="font-size:12px;color:#EF4444;margin-left:4px;">{{ saveError }}</div>
          <div style="margin-left:auto;display:flex;gap:8px;">
            <button v-if="skuModalMode==='add'" @click="saveDraft" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:8px 16px;font-size:13px;cursor:pointer;color:#475569;font-weight:500;">Save Draft</button>
            <button @click="addSKU" :disabled="blob.frontState.uploading||blob.backState.uploading||blob.leftState.uploading"
              style="background:#3B82F6;color:white;border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:600;cursor:pointer;">
              {{ blob.frontState.uploading||blob.backState.uploading||blob.leftState.uploading ? 'Uploading…' : skuModalMode==='edit' ? 'Save Changes' : 'Add SKU' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
      <div style="font-size:15px;font-weight:700;color:#0F172A;">Library</div>
      <div style="display:flex;align-items:center;gap:8px;background:white;border:1px solid #E2E8F0;border-radius:8px;padding:6px 12px;flex:1;max-width:280px;">
        <Search :size="14" color="#94A3B8"/>
        <input v-model="search" placeholder="Search SKUs..."
          style="border:none;background:transparent;font-size:13px;outline:none;flex:1;color:#334155;"/>
      </div>
      <button @click="openModal()"
        style="display:flex;align-items:center;gap:6px;background:#3B82F6;color:white;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;">
        <Plus :size="14"/> Add SKU
      </button>
    </div>

    <!-- SKUs tab -->
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;">

      <!-- Left: SKU card grid -->
      <div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;">
          <div v-for="s in filteredSKUs" :key="s.id"
            @click="selSku=s"
            :style="`background:white;border:1.5px solid ${selSku?.id===s.id?'#3B82F6':'#E2E8F0'};border-radius:10px;padding:14px;cursor:pointer;transition:all 0.15s;`"
            @mouseenter="e=>(e.currentTarget as HTMLElement).style.borderColor=(selSku?.id===s.id?'#3B82F6':'#CBD5E1')"
            @mouseleave="e=>(e.currentTarget as HTMLElement).style.borderColor=(selSku?.id===s.id?'#3B82F6':'#E2E8F0')">
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
                </div>
                <div style="font-size:11px;color:#64748B;margin-bottom:6px;">{{ s.brand }} · {{ s.cat }} · {{ s.variant }}</div>
                <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;">
                  <span style="background:#F8FAFC;color:#475569;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;">{{ s.w }}W×{{ s.h }}H×{{ s.d }}D cm</span>
                  <span style="background:#EFF6FF;color:#1D4ED8;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;">×{{ s.defaultF }} facing</span>
                  <span style="background:#F8FAFC;color:#475569;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;">{{ s.minF }}–{{ s.maxF }} range</span>
                  <!-- Tier chip with dropdown -->
                  <div style="position:relative;" @click.stop>
                    <span @click="showTierMenu===s.id ? showTierMenu=null : showTierMenu=s.id"
                      :style="`cursor:pointer;background:${tierStyle(s.tier).bg};color:${tierStyle(s.tier).text};font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;user-select:none;`">
                      {{ s.tier || 'STANDARD' }}
                    </span>
                    <div v-if="showTierMenu===s.id"
                      style="position:absolute;top:calc(100% + 4px);left:0;background:white;border:1px solid #E2E8F0;border-radius:8px;box-shadow:0 8px 24px rgba(15,23,42,0.12);z-index:60;min-width:160px;overflow:hidden;">
                      <button v-for="t in TIERS" :key="t.value" @click.stop="updateTier(s.id, t.value)"
                        style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;border:none;background:transparent;cursor:pointer;font-size:12px;color:#334155;text-align:left;"
                        @mouseenter="(e)=>(e.currentTarget as HTMLElement).style.background='#F8FAFC'"
                        @mouseleave="(e)=>(e.currentTarget as HTMLElement).style.background='transparent'">
                        <div :style="`width:8px;height:8px;border-radius:50%;background:${t.color};flex-shrink:0;`"/>
                        {{ t.label }}
                      </button>
                    </div>
                  </div>
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

      <!-- Right: SKU detail panel -->
      <div>
        <div v-if="selSku" style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:20px;position:sticky;top:80px;">
          <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
            <button @click="selSku=null" style="background:transparent;border:none;cursor:pointer;"><X :size="16" color="#94A3B8"/></button>
          </div>
          <!-- Packshot image or placeholder -->
          <div :style="`width:100%;height:120px;border-radius:10px;overflow:hidden;margin-bottom:14px;border:1.5px solid ${selSku.color}33;`">
            <img v-if="selSku.front_packshot_url" :src="appendSas(selSku.front_packshot_url)!"
              style="width:100%;height:100%;object-fit:contain;display:block;background:#F8FAFC;"
              @error="e=>(e.target as HTMLImageElement).style.display='none'"/>
            <div v-else :style="`width:100%;height:100%;background:${selSku.color}18;display:flex;align-items:center;justify-content:center;`">
              <div :style="`width:36px;height:88px;border-radius:5px;background:${selSku.color};opacity:0.85;`"/>
            </div>
          </div>
          <!-- Name + brand -->
          <div style="font-weight:700;font-size:16px;color:#0F172A;margin-bottom:4px;">{{ selSku.name }}</div>
          <div style="font-size:12px;color:#64748B;margin-bottom:10px;">{{ selSku.brand }}</div>
          <!-- Tier badge -->
          <span :style="`display:inline-block;background:${tierStyle(selSku.tier).bg};color:${tierStyle(selSku.tier).text};font-size:11px;font-weight:600;padding:3px 10px;border-radius:4px;margin-bottom:14px;`">
            {{ selSku.tier || 'STANDARD' }}
          </span>
          <!-- Divider -->
          <div style="height:1px;background:#E2E8F0;margin-bottom:14px;"/>
          <!-- 2-column attribute grid -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
            <div style="background:#F8FAFC;border-radius:8px;padding:10px;">
              <div style="font-size:11px;color:#94A3B8;margin-bottom:2px;">Category</div>
              <div style="font-size:13px;font-weight:700;color:#0F172A;">{{ selSku.cat }}</div>
            </div>
            <div style="background:#F8FAFC;border-radius:8px;padding:10px;">
              <div style="font-size:11px;color:#94A3B8;margin-bottom:2px;">Unit</div>
              <div style="font-size:13px;font-weight:700;color:#0F172A;">{{ selSku.variant }}</div>
            </div>
            <div style="background:#F8FAFC;border-radius:8px;padding:10px;">
              <div style="font-size:11px;color:#94A3B8;margin-bottom:2px;">Dimensions</div>
              <div style="font-size:13px;font-weight:700;color:#0F172A;">{{ selSku.w }}×{{ selSku.h }}×{{ selSku.d }} cm</div>
            </div>
            <div style="background:#F8FAFC;border-radius:8px;padding:10px;">
              <div style="font-size:11px;color:#94A3B8;margin-bottom:2px;">ERP Code</div>
              <div style="font-size:13px;font-weight:700;color:#0F172A;">{{ selSku.faErpCode || '—' }}</div>
            </div>
            <div style="background:#F8FAFC;border-radius:8px;padding:10px;">
              <div style="font-size:11px;color:#94A3B8;margin-bottom:2px;">Min Facings</div>
              <div style="font-size:13px;font-weight:700;color:#0F172A;">{{ selSku.minF }}</div>
            </div>
            <div style="background:#F8FAFC;border-radius:8px;padding:10px;">
              <div style="font-size:11px;color:#94A3B8;margin-bottom:2px;">Default Facings</div>
              <div style="font-size:13px;font-weight:700;color:#0F172A;">{{ selSku.defaultF }}</div>
            </div>
            <div style="background:#F8FAFC;border-radius:8px;padding:10px;">
              <div style="font-size:11px;color:#94A3B8;margin-bottom:2px;">Max Facings</div>
              <div style="font-size:13px;font-weight:700;color:#0F172A;">{{ selSku.maxF }}</div>
            </div>
            <div style="background:#F8FAFC;border-radius:8px;padding:10px;">
              <div style="font-size:11px;color:#94A3B8;margin-bottom:2px;">Status</div>
              <div style="font-size:13px;font-weight:700;color:#0F172A;">{{ selSku.isActive !== false ? 'Active' : 'Inactive' }}</div>
            </div>
          </div>
          <!-- Action buttons -->
          <div style="display:flex;flex-direction:column;gap:8px;">
            <button @click="openModal(selSku)"
              style="width:100%;background:white;color:#334155;border:1px solid #E2E8F0;border-radius:8px;padding:9px 0;font-size:13px;font-weight:600;cursor:pointer;">
              Edit SKU
            </button>
            <button @click="useInPlanogram(selSku)"
              style="width:100%;background:#3B82F6;color:white;border:none;border-radius:8px;padding:9px 0;font-size:13px;font-weight:600;cursor:pointer;">
              Use in Planogram
            </button>
          </div>
        </div>
        <div v-else style="background:#F8FAFC;border:1.5px dashed #E2E8F0;border-radius:12px;padding:40px;text-align:center;color:#94A3B8;">
          <Package :size="32" style="margin:0 auto 12px;display:block;"/>
          <div style="font-size:14px;font-weight:500;margin-bottom:4px;">Select a SKU</div>
          <div style="font-size:12px;">Click a card to view details</div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- OUTLET MODAL                                                      -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <div v-if="showOutletModal" style="position:fixed;inset:0;background:rgba(15,23,42,0.5);z-index:100;display:flex;align-items:center;justify-content:center;" @click.self="closeOutletModal">
      <div style="background:white;border-radius:16px;width:620px;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(15,23,42,0.2);overflow:hidden;">

        <!-- Modal header -->
        <div style="padding:18px 22px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;gap:12px;">
          <Store :size="18" color="#3B82F6"/>
          <div style="font-weight:700;font-size:16px;color:#0F172A;">{{ outletModalMode==='add'?'Add New Store':'Edit Store' }}</div>
          <button @click="closeOutletModal" style="margin-left:auto;background:transparent;border:none;cursor:pointer;"><X :size="18" color="#94A3B8"/></button>
        </div>

        <!-- Tab bar -->
        <div style="display:flex;border-bottom:1px solid #E2E8F0;padding:0 22px;">
          <button v-for="t in outletTabs" :key="t.id" @click="outletTab=t.id"
            :style="`padding:11px 14px;border:none;border-bottom:2px solid ${outletTab===t.id?'#3B82F6':'transparent'};background:transparent;color:${outletTab===t.id?'#1D4ED8':'#64748B'};font-size:13px;font-weight:${outletTab===t.id?600:400};cursor:pointer;margin-right:4px;`">
            {{ t.label }}
          </button>
        </div>

        <!-- Tab body -->
        <div style="flex:1;overflow-y:auto;padding:20px 22px;">

          <!-- ── PROFILE TAB ─────────────────────────────────────────────── -->
          <div v-if="outletTab==='profile'">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
              <div style="grid-column:1/-1;">
                <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">Store Name <span style="color:#EF4444;">*</span></label>
                <input v-model="outletForm.name" placeholder="e.g. Reliance Smart Koramangala"
                  style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:9px 12px;font-size:13px;color:#0F172A;outline:none;box-sizing:border-box;"/>
              </div>
              <div>
                <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">Store Code</label>
                <input v-model="outletForm.code" placeholder="e.g. RLN-KRM-001"
                  style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:9px 12px;font-size:13px;color:#0F172A;outline:none;box-sizing:border-box;font-family:monospace;"/>
              </div>
              <div>
                <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">Channel</label>
                <div style="display:flex;gap:8px;">
                  <button v-for="ch in ['MT','GT']" :key="ch" @click="outletForm.channel=ch as 'MT'|'GT'"
                    :style="`flex:1;padding:9px 0;border-radius:8px;border:1.5px solid ${outletForm.channel===ch?'#3B82F6':'#E2E8F0'};background:${outletForm.channel===ch?'#EFF6FF':'white'};color:${outletForm.channel===ch?'#1D4ED8':'#475569'};font-size:13px;font-weight:${outletForm.channel===ch?700:400};cursor:pointer;`">
                    {{ ch }}
                  </button>
                </div>
              </div>
              <div>
                <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">Tier</label>
                <div style="display:flex;gap:8px;">
                  <button v-for="t in ['A','B','C']" :key="t" @click="outletForm.tier=t as 'A'|'B'|'C'"
                    :style="`flex:1;padding:9px 0;border-radius:8px;border:1.5px solid ${outletForm.tier===t?'#7C3AED':'#E2E8F0'};background:${outletForm.tier===t?'#F5F3FF':'white'};color:${outletForm.tier===t?'#6D28D9':'#475569'};font-size:13px;font-weight:${outletForm.tier===t?700:400};cursor:pointer;`">
                    Tier {{ t }}
                  </button>
                </div>
              </div>
              <div>
                <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">Region</label>
                <input v-model="outletForm.region" placeholder="e.g. South"
                  style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:9px 12px;font-size:13px;color:#0F172A;outline:none;box-sizing:border-box;"/>
              </div>
              <div>
                <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">City</label>
                <input v-model="outletForm.city" placeholder="e.g. Bangalore"
                  style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:9px 12px;font-size:13px;color:#0F172A;outline:none;box-sizing:border-box;"/>
              </div>
              <div>
                <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">Format</label>
                <select v-model="outletForm.format"
                  style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:9px 12px;font-size:13px;color:#0F172A;outline:none;box-sizing:border-box;">
                  <option v-for="f in OUTLET_FORMATS" :key="f" :value="f">{{ f }}</option>
                </select>
              </div>
              <div>
                <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">Store Manager</label>
                <input v-model="outletForm.manager" placeholder="e.g. Rahul Verma"
                  style="width:100%;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:9px 12px;font-size:13px;color:#0F172A;outline:none;box-sizing:border-box;"/>
              </div>
              <div style="grid-column:1/-1;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;display:flex;align-items:center;gap:14px;">
                <div style="flex:1;">
                  <div style="font-size:13px;font-weight:700;color:#0F172A;margin-bottom:2px;">Active Status</div>
                  <div style="font-size:12px;color:#64748B;">Mark this store as active and available for planogram deployment.</div>
                </div>
                <button @click="outletForm.status=(outletForm.status==='active'?'inactive':'active')" style="background:transparent;border:none;cursor:pointer;padding:0;">
                  <ToggleRight v-if="outletForm.status==='active'" :size="36" color="#3B82F6"/>
                  <ToggleLeft v-else :size="36" color="#CBD5E1"/>
                </button>
              </div>
            </div>
          </div>

          <!-- ── ASSETS TAB ──────────────────────────────────────────────── -->
          <div v-if="outletTab==='assets'">
            <div style="font-size:13px;color:#64748B;margin-bottom:16px;">Select which fixture types are physically installed in this store and set their quantity.</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <div v-for="item in outletAssetPicker" :key="item.assetId"
                style="display:flex;align-items:center;gap:12px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;">
                <input type="checkbox" :checked="item.checked" @change="item.checked=!item.checked"
                  style="width:16px;height:16px;accent-color:#3B82F6;cursor:pointer;flex-shrink:0;"/>
                <span style="font-size:20px;flex-shrink:0;">{{ item.img }}</span>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:13px;font-weight:600;color:#0F172A;">{{ item.name }}</div>
                  <div style="font-size:11px;color:#94A3B8;">{{ item.type }}</div>
                </div>
                <div v-if="item.checked" style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                  <button @click="item.quantity=Math.max(1,item.quantity-1)"
                    style="width:26px;height:26px;border-radius:6px;border:1px solid #E2E8F0;background:white;cursor:pointer;font-size:14px;color:#475569;display:flex;align-items:center;justify-content:center;">−</button>
                  <div style="background:white;border:1px solid #E2E8F0;border-radius:6px;padding:4px 0;font-size:13px;font-weight:700;color:#0F172A;min-width:36px;text-align:center;">{{ item.quantity }}</div>
                  <button @click="item.quantity=Math.min(10,item.quantity+1)"
                    style="width:26px;height:26px;border-radius:6px;border:1px solid #E2E8F0;background:white;cursor:pointer;font-size:14px;color:#475569;display:flex;align-items:center;justify-content:center;">+</button>
                </div>
                <div v-else style="width:88px;text-align:center;font-size:11px;color:#CBD5E1;flex-shrink:0;">not installed</div>
              </div>
            </div>
          </div>

          <!-- ── PLANOGRAMS TAB ──────────────────────────────────────────── -->
          <div v-if="outletTab==='planograms'">
            <div style="font-size:13px;color:#64748B;margin-bottom:16px;">
              Showing planograms that match this store's installed fixtures or region. Check to assign.
            </div>
            <div v-if="suggestedPlanograms.length" style="display:flex;flex-direction:column;gap:6px;">
              <div v-for="p in suggestedPlanograms" :key="p.id"
                style="display:flex;align-items:center;gap:10px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:11px 14px;">
                <input type="checkbox" :checked="outletPlanogramPicker.includes(p.id)" @change="togglePlanogram(p.id)"
                  style="width:16px;height:16px;accent-color:#3B82F6;cursor:pointer;flex-shrink:0;"/>
                <span style="font-size:18px;flex-shrink:0;">{{ p.assetImg }}</span>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:13px;font-weight:600;color:#0F172A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ p.name }}</div>
                  <div style="font-size:11px;color:#94A3B8;">{{ p.assetType }} · {{ p.region }}</div>
                </div>
                <span :style="`font-size:10px;font-weight:600;padding:2px 7px;border-radius:4px;${p.status==='active'?'background:#F0FDF4;color:#065F46;':'p.status===\'draft\'?\'background:#F1F5F9;color:#64748B;\':\'\background:#FFFBEB;color:#92400E;\''}background:${p.status==='active'?'#F0FDF4':p.status==='draft'?'#F1F5F9':'#FFFBEB'};color:${p.status==='active'?'#065F46':p.status==='draft'?'#64748B':'#92400E'};`">
                  {{ p.status }}
                </span>
                <span style="font-size:11px;font-weight:700;color:#0F172A;flex-shrink:0;">{{ p.compliance }}%</span>
              </div>
            </div>
            <div v-else style="text-align:center;padding:32px;color:#94A3B8;">
              <div style="font-size:13px;font-weight:500;margin-bottom:4px;">No matching planograms</div>
              <div style="font-size:12px;">Add assets first to see relevant suggestions</div>
            </div>
          </div>

        </div>

        <!-- Modal footer -->
        <div style="padding:14px 22px;border-top:1px solid #E2E8F0;display:flex;gap:10px;align-items:center;">
          <button @click="closeOutletModal" style="background:transparent;border:1px solid #E2E8F0;border-radius:8px;padding:8px 18px;font-size:13px;cursor:pointer;color:#475569;">Cancel</button>
          <div v-if="outletSaveError" style="font-size:12px;color:#EF4444;margin-left:4px;">{{ outletSaveError }}</div>
          <div style="margin-left:auto;display:flex;gap:8px;">
            <button v-if="outletTab!=='planograms'" @click="outletTab=outletTab==='profile'?'assets':'planograms'"
              style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:8px 16px;font-size:13px;cursor:pointer;color:#475569;font-weight:500;">
              Next →
            </button>
            <button @click="saveOutlet"
              style="background:#3B82F6;color:white;border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:600;cursor:pointer;">
              {{ outletModalMode==='add'?'Add Store':'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Package, Search, Plus, Upload, X, ToggleLeft, ToggleRight, MoreHorizontal, Pencil, Copy, Trash2 } from 'lucide-vue-next'
import { usePlanogramStore, appendSas } from '~/stores/planogram'
import { useOutletStore, OUTLET_FORMATS } from '~/stores/outlets'
import { useAzureBlob } from '~/composables/useAzureBlob'

definePageMeta({ layout: 'default' })

const store       = usePlanogramStore()
const outletStore = useOutletStore()
const blob        = useAzureBlob()

const ASSET_TYPES = ['Visicooler', 'Gondola', 'End Cap', 'Counter', 'Rack', 'Shelf']

const TIERS = [
  { value: 'MANDATORY',      label: 'MANDATORY',      color: '#EF4444' },
  { value: 'EYE_LEVEL_HERO', label: 'EYE_LEVEL_HERO', color: '#F59E0B' },
  { value: 'NEW_LAUNCH',     label: 'NEW_LAUNCH',     color: '#3B82F6' },
  { value: 'PRIORITY',       label: 'PRIORITY',       color: '#7C3AED' },
  { value: 'EXCLUDED',       label: 'EXCLUDED',       color: '#475569' },
  { value: 'STANDARD',       label: 'STANDARD',       color: '#94A3B8' },
]

const TIER_STYLE: Record<string, { bg: string; text: string }> = {
  MANDATORY:      { bg: '#FEF2F2', text: '#991B1B' },
  EYE_LEVEL_HERO: { bg: '#FFFBEB', text: '#92400E' },
  NEW_LAUNCH:     { bg: '#EFF6FF', text: '#1D4ED8' },
  PRIORITY:       { bg: '#F5F3FF', text: '#6D28D9' },
  EXCLUDED:       { bg: '#F1F5F9', text: '#475569' },
  STANDARD:       { bg: '#F8FAFC', text: '#64748B' },
}

function tierStyle(tier: string | undefined) {
  return TIER_STYLE[tier || 'STANDARD'] || TIER_STYLE.STANDARD
}

// ── page state ────────────────────────────────────────────────────────────────
const tab          = ref('skus')
const search       = ref('')
const selAsset     = ref<any>(null)
const selSku       = ref<any>(null)
const showModal    = ref(false)
const primaryFilter    = ref('')
const secondaryFilter  = ref('')
const displayCatFilter = ref('')
const skuTab       = ref('packshot')
const saveError    = ref('')
const activeMenu   = ref<number|null>(null)
const showTierMenu = ref<number|null>(null)

// toast
const toastMsg = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(msg: string, duration = 3000) {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, duration)
}

// ── SKU modal mode ─────────────────────────────────────────────────────────────
const skuModalMode = ref<'add'|'edit'>('add')
const editingSkuId = ref<number|null>(null)
const skuTier      = ref('STANDARD')
const skuIsActive  = ref(true)

// ── asset modal state ─────────────────────────────────────────────────────────
const showAssetModal  = ref(false)
const assetModalMode  = ref<'add'|'edit'>('add')
const assetSaveError  = ref('')
const editingAssetId  = ref<number|null>(null)
const assetForm = reactive({ name: '', type: 'Visicooler', img: '🏬', shelves: 5, w: 90, h: 180, d: 60, region: '', status: 'active' as 'active'|'draft' })

// ── delete confirm state ──────────────────────────────────────────────────────
const showDeleteConfirm = ref(false)
const deletingItem      = ref<{id:number;name:string}|null>(null)
const deletingItemType  = ref<'asset'|'sku'|'outlet'>('asset')

// ── outlet state ──────────────────────────────────────────────────────────────
const selOutlet            = ref<any>(null)
const showOutletModal      = ref(false)
const outletModalMode      = ref<'add'|'edit'>('add')
const editingOutletId      = ref<number|null>(null)
const outletSaveError      = ref('')
const outletTab            = ref('profile')
const outletChannelFilter  = ref('All')
const outletRegionFilter   = ref('All')

const outletForm = reactive({
  name: '', code: '', channel: 'MT' as 'MT'|'GT',
  region: '', city: '', tier: 'A' as 'A'|'B'|'C',
  format: 'Supermarket', manager: '',
  status: 'active' as 'active'|'inactive',
})

const outletAssetPicker = ref<Array<{ assetId: number; name: string; img: string; type: string; checked: boolean; quantity: number }>>([])
const outletPlanogramPicker = ref<number[]>([])

const outletTabs = [
  { id: 'profile',    label: 'Profile' },
  { id: 'assets',     label: 'Assets' },
  { id: 'planograms', label: 'Planograms' },
]

// ── modal form ────────────────────────────────────────────────────────────────
const form = reactive({ name:'', brand:'', cat:'', variant:'', faErpCode:'' })
const modalMinF      = ref(1)
const modalMaxF      = ref(4)
const modalDefF      = ref(2)
const modalMandatory = ref(false)

// last-picked files per side (for retry)
const lastFile = { front: null as File|null, back: null as File|null, left: null as File|null }

const skuFolder = computed(() =>
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
  { label:'Min Facings',     val:modalMinF.value, hint:'Compliance floor',   inc:()=>{ modalMinF.value=Math.min(4,modalMinF.value+1) }, dec:()=>{ modalMinF.value=Math.max(1,modalMinF.value-1) } },
  { label:'Max Facings',     val:modalMaxF.value, hint:'Shelf capacity cap', inc:()=>{ modalMaxF.value=Math.min(8,modalMaxF.value+1) }, dec:()=>{ modalMaxF.value=Math.max(2,modalMaxF.value-1) } },
  { label:'Default Facings', val:modalDefF.value, hint:'AI default',          inc:()=>{ modalDefF.value=Math.min(6,modalDefF.value+1) }, dec:()=>{ modalDefF.value=Math.max(1,modalDefF.value-1) } },
])

const metaInputs = [
  { key:'name',        label:'SKU Name',         placeholder:'e.g. Amstel 330ml' },
  { key:'brand',       label:'Brand',             placeholder:'e.g. Amstel' },
  { key:'cat',         label:'Category',          placeholder:'e.g. Lager' },
  { key:'variant',     label:'Variant',           placeholder:'e.g. 330ml can' },
  { key:'primaryCat',  label:'Primary',           placeholder:'e.g. Beer' },
  { key:'secondaryCat',label:'Secondary',         placeholder:'e.g. Premium Lager' },
  { key:'displayCat',  label:'Display Category',  placeholder:'e.g. Cold Shelf' },
  { key:'faErpCode',   label:'ERP Code',          placeholder:'e.g. FA-12345' },
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
function confirmDelete(item: {id:number;name:string}, type: 'asset'|'sku'|'outlet') {
  deletingItem.value = item
  deletingItemType.value = type
  showDeleteConfirm.value = true
}

function doDelete() {
  if (!deletingItem.value) return
  if (deletingItemType.value === 'asset') {
    store.deleteAsset(deletingItem.value.id)
    if (selAsset.value?.id === deletingItem.value.id) selAsset.value = null
  } else if (deletingItemType.value === 'outlet') {
    outletStore.deleteOutlet(deletingItem.value.id)
    if (selOutlet.value?.id === deletingItem.value.id) selOutlet.value = null
  }
  showDeleteConfirm.value = false
  deletingItem.value = null
}

// ── outlet modal ──────────────────────────────────────────────────────────────
function openOutletModal(outlet?: any) {
  if (outlet) {
    outletModalMode.value = 'edit'
    editingOutletId.value = outlet.id
    Object.assign(outletForm, {
      name: outlet.name, code: outlet.code, channel: outlet.channel,
      region: outlet.region, city: outlet.city, tier: outlet.tier,
      format: outlet.format, manager: outlet.manager, status: outlet.status,
    })
    outletAssetPicker.value = store.assets.map(a => ({
      assetId: a.id, name: a.name, img: a.img, type: a.type,
      checked: outlet.assets.some((oa: any) => oa.assetId === a.id),
      quantity: outlet.assets.find((oa: any) => oa.assetId === a.id)?.quantity ?? 1,
    }))
    outletPlanogramPicker.value = [...outlet.planogramIds]
  } else {
    outletModalMode.value = 'add'
    editingOutletId.value = null
    Object.assign(outletForm, { name: '', code: '', channel: 'MT', region: '', city: '', tier: 'A', format: 'Supermarket', manager: '', status: 'active' })
    outletAssetPicker.value = store.assets.map(a => ({ assetId: a.id, name: a.name, img: a.img, type: a.type, checked: false, quantity: 1 }))
    outletPlanogramPicker.value = []
  }
  outletSaveError.value = ''
  outletTab.value = 'profile'
  showOutletModal.value = true
}

function closeOutletModal() {
  showOutletModal.value = false
}

function saveOutlet() {
  outletSaveError.value = ''
  if (!outletForm.name.trim()) { outletSaveError.value = 'Store name is required'; outletTab.value = 'profile'; return }

  const assets = outletAssetPicker.value
    .filter(a => a.checked)
    .map(a => ({ assetId: a.assetId, quantity: a.quantity }))

  const data = {
    name: outletForm.name.trim(),
    code: outletForm.code.trim() || `OUT-${Date.now()}`,
    channel: outletForm.channel,
    region: outletForm.region.trim(),
    city: outletForm.city.trim(),
    tier: outletForm.tier,
    format: outletForm.format as any,
    manager: outletForm.manager.trim(),
    status: outletForm.status,
    assets,
    planogramIds: [...outletPlanogramPicker.value],
  }

  if (outletModalMode.value === 'edit' && editingOutletId.value !== null) {
    outletStore.updateOutlet(editingOutletId.value, data)
    selOutlet.value = outletStore.outlets.find(o => o.id === editingOutletId.value) ?? null
    showToast('Store updated successfully')
  } else {
    outletStore.addOutlet({ ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    showToast('Store added successfully')
  }
  closeOutletModal()
}

function togglePlanogram(id: number) {
  const idx = outletPlanogramPicker.value.indexOf(id)
  if (idx >= 0) outletPlanogramPicker.value.splice(idx, 1)
  else outletPlanogramPicker.value.push(id)
}

// ── SKU modal open/close ──────────────────────────────────────────────────────
function openModal(sku?: any) {
  blob.reset()
  if (sku) {
    skuModalMode.value = 'edit'
    editingSkuId.value = sku.id
    Object.assign(form, { name: sku.name, brand: sku.brand, cat: sku.cat, variant: sku.variant, faErpCode: sku.faErpCode || '' })
    dimVals.w = sku.w; dimVals.h = sku.h; dimVals.d = sku.d
    modalMinF.value = sku.minF; modalMaxF.value = sku.maxF; modalDefF.value = sku.defaultF
    modalMandatory.value = sku.mandatory || false
    skuTier.value = sku.tier || 'STANDARD'
    skuIsActive.value = sku.isActive !== false
    if (sku.front_packshot_url) {
      blob.frontState.preview = appendSas(sku.front_packshot_url)
      blob.frontState.url = sku.front_packshot_url
    }
    if (sku.back_packshot_url) {
      blob.backState.preview = appendSas(sku.back_packshot_url)
      blob.backState.url = sku.back_packshot_url
    }
    if (sku.left_packshot_url) {
      blob.leftState.preview = appendSas(sku.left_packshot_url)
      blob.leftState.url = sku.left_packshot_url
    }
  } else {
    skuModalMode.value = 'add'
    editingSkuId.value = null
    Object.assign(form, { name:'', brand:'', cat:'', variant:'', faErpCode:'' })
    dimVals.h = 22; dimVals.w = 7; dimVals.d = 7
    modalMinF.value = 1; modalMaxF.value = 4; modalDefF.value = 2; modalMandatory.value = false
    skuTier.value = 'STANDARD'
    skuIsActive.value = true
    lastFile.front = null; lastFile.back = null; lastFile.left = null
  }
  showModal.value = true
  skuTab.value = 'packshot'
  saveError.value = ''
}

function closeModal() {
  showModal.value = false
  blob.reset()
}

// ── save SKU (handles both add and edit) ──────────────────────────────────────
function addSKU() {
  saveError.value = ''
  if (!form.name.trim())  { saveError.value = 'SKU Name is required'; skuTab.value = 'meta'; return }
  if (!form.brand.trim()) { saveError.value = 'Brand is required';    skuTab.value = 'meta'; return }
  if (!form.cat.trim())   { saveError.value = 'Category is required'; skuTab.value = 'meta'; return }

  if (skuModalMode.value === 'edit' && editingSkuId.value !== null) {
    store.updateSKU(editingSkuId.value, {
      name: form.name.trim(),
      brand: form.brand.trim(),
      cat: form.cat.trim(),
      variant: form.variant.trim(),
      faErpCode: form.faErpCode.trim(),
      w: dimVals.w, h: dimVals.h, d: dimVals.d,
      minF: modalMinF.value, maxF: modalMaxF.value, defaultF: modalDefF.value,
      mandatory: modalMandatory.value,
      mandatory_flag: modalMandatory.value,
      tier: skuTier.value,
      isActive: skuIsActive.value,
      sku_code: autoSkuCode.value,
      front_packshot_url: blob.frontState.url,
      back_packshot_url:  blob.backState.url,
      left_packshot_url:  blob.leftState.url,
    })
    selSku.value = store.skus.find(s => s.id === editingSkuId.value) ?? null
    closeModal()
    showToast('SKU updated successfully')
  } else {
    const COLORS = ['#1D4ED8','#16A34A','#DC2626','#7C3AED','#F59E0B','#059669','#EC4899']
    const color  = COLORS[store.skus.length % COLORS.length]

    store.addSKU({
      name: form.name.trim(),
      brand: form.brand.trim(),
      cat: form.cat.trim(),
      variant: form.variant.trim(),
      faErpCode: form.faErpCode.trim(),
      w: dimVals.w, h: dimVals.h, d: dimVals.d,
      minF: modalMinF.value, maxF: modalMaxF.value, defaultF: modalDefF.value,
      mandatory: modalMandatory.value,
      color,
      sku_code: autoSkuCode.value,
      mandatory_flag: modalMandatory.value,
      tier: skuTier.value,
      isActive: skuIsActive.value,
      front_packshot_url: blob.frontState.url,
      back_packshot_url:  blob.backState.url,
      left_packshot_url:  blob.leftState.url,
    })
    closeModal()
  }
}

function saveDraft() { addSKU() }

// ── tier chip update ──────────────────────────────────────────────────────────
function updateTier(skuId: number, tier: string) {
  store.updateSKU(skuId, { tier })
  showTierMenu.value = null
  if (selSku.value?.id === skuId) {
    selSku.value = store.skus.find(s => s.id === skuId) ?? null
  }
  showToast('Tier updated', 2000)
}

// ── use in planogram ──────────────────────────────────────────────────────────
function useInPlanogram(sku: any) {
  store.preselectedSkuId = sku.id
  navigateTo('/generator')
}

// ── filtered data ─────────────────────────────────────────────────────────────
const primaryCats    = computed(() => Array.from(new Set(store.skus.map(s => s.primaryCat).filter(Boolean))))
const secondaryCats  = computed(() => Array.from(new Set(store.skus.map(s => s.secondaryCat).filter(Boolean))))
const displayCats    = computed(() => Array.from(new Set(store.skus.map(s => s.displayCat).filter(Boolean))))

const outletRegions = computed(() =>
  Array.from(new Set(outletStore.outlets.map(o => o.region))).sort()
)

const filteredOutlets = computed(() =>
  outletStore.outlets.filter(o => {
    const matchChannel = outletChannelFilter.value === 'All' || o.channel === outletChannelFilter.value
    const matchRegion  = outletRegionFilter.value === 'All' || o.region === outletRegionFilter.value
    const matchSearch  = !search.value || o.name.toLowerCase().includes(search.value.toLowerCase()) || o.city.toLowerCase().includes(search.value.toLowerCase())
    return matchChannel && matchRegion && matchSearch
  })
)

const suggestedPlanograms = computed(() => {
  const installedTypes = new Set(
    outletAssetPicker.value
      .filter(a => a.checked)
      .map(a => a.type)
  )
  return store.planograms.filter(p =>
    installedTypes.has(p.assetType) || p.region === outletForm.region
  )
})

const filteredAssets = computed(() =>
  store.assets.filter(a => a.name.toLowerCase().includes(search.value.toLowerCase()))
)

const filteredSKUs = computed(() =>
  store.skus.filter(s =>
    (!primaryFilter.value    || s.primaryCat    === primaryFilter.value) &&
    (!secondaryFilter.value  || s.secondaryCat  === secondaryFilter.value) &&
    (!displayCatFilter.value || s.displayCat    === displayCatFilter.value) &&
    (s.name.toLowerCase().includes(search.value.toLowerCase()) || s.brand.toLowerCase().includes(search.value.toLowerCase()))
  )
)
</script>
