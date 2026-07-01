<template>
  <div style="display:flex;flex-direction:column;min-height:100vh;" @click="closeAllDropdowns">

    <!-- ── Custom header bar ── -->
    <div style="position:sticky;top:0;z-index:20;height:56px;background:white;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 24px;">
      <!-- Breadcrumb -->
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#4F46E5,#7C3AED);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <LayoutGrid :size="14" color="white"/>
        </div>
        <span style="font-size:14px;font-weight:700;color:#0F172A;">FieldAssist</span>
        <ChevronRight :size="14" color="#CBD5E1"/>
        <NuxtLink to="/configs" style="font-size:13px;color:#64748B;text-decoration:none;font-weight:400;">Planogram Configurations</NuxtLink>
        <ChevronRight :size="14" color="#CBD5E1"/>
        <span style="font-size:13px;color:#0F172A;font-weight:500;">New Planogram</span>
        <template v-if="step===2 && planogramName">
          <ChevronRight :size="14" color="#CBD5E1"/>
          <span style="font-size:13px;color:#0F172A;font-weight:500;">{{ planogramName }}</span>
        </template>
      </div>
      <!-- Stepper + avatar -->
      <div style="margin-left:auto;display:flex;align-items:center;gap:14px;">
        <div style="display:flex;align-items:center;gap:7px;">
          <div :style="`width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${step===1?'#4F46E5':'#10B981'};`">
            <Check v-if="step===2" :size="13" color="white"/>
            <span v-else style="font-size:11px;font-weight:700;color:white;">1</span>
          </div>
          <span :style="`font-size:13px;font-weight:${step===1?700:500};color:${step===1?'#0F172A':'#10B981'};`">Configuration</span>
        </div>
        <div style="width:36px;height:1.5px;background:#E2E8F0;"/>
        <div style="display:flex;align-items:center;gap:7px;">
          <div :style="`width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;background:${step===2?'#4F46E5':'#E2E8F0'};color:${step===2?'white':'#94A3B8'};`">2</div>
          <span :style="`font-size:13px;font-weight:${step===2?700:400};color:${step===2?'#0F172A':'#94A3B8'};`">SKU Placement</span>
        </div>
        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#7C3AED);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;margin-left:8px;cursor:pointer;">TV</div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- STEP 1: Configuration                                  -->
    <!-- ══════════════════════════════════════════════════════ -->
    <div v-if="step===1" style="flex:1;padding:28px;display:grid;grid-template-columns:1fr 340px;gap:20px;max-width:1180px;width:100%;margin:0 auto;align-items:start;">

      <!-- Left: Form card -->
      <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:28px;">
        <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;margin-bottom:22px;">Planogram Details</div>

        <!-- Name field -->
        <div style="margin-bottom:26px;">
          <div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">
            Planogram Name <span style="color:#EF4444;">*</span>
          </div>
          <input
            v-model="planogramName"
            placeholder="e.g. Mie Sedaap — Gondola Q3 2026"
            style="width:100%;border:1.5px solid #E2E8F0;border-radius:8px;padding:11px 14px;font-size:13px;color:#0F172A;outline:none;transition:border-color 0.15s;font-family:inherit;"
            @focus="nameFieldFocused=true"
            @blur="nameFieldFocused=false"
          />
        </div>

        <!-- Rule Status -->
        <div style="margin-bottom:30px;">
          <div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:5px;">Rule Status</div>
          <div style="font-size:12px;color:#64748B;margin-bottom:12px;">Planogram will be live for field agents once active</div>
          <div style="display:flex;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;width:fit-content;">
            <button @click.stop="ruleStatus='inactive'" :style="`padding:9px 22px;border:none;font-size:13px;font-weight:500;cursor:pointer;background:${ruleStatus==='inactive'?'#E2E8F0':'white'};color:${ruleStatus==='inactive'?'#0F172A':'#94A3B8'};transition:all 0.15s;font-family:inherit;`">Inactive</button>
            <button @click.stop="ruleStatus='active'" :style="`padding:9px 22px;border:none;font-size:13px;font-weight:600;cursor:pointer;background:${ruleStatus==='active'?'#4F46E5':'white'};color:${ruleStatus==='active'?'white':'#94A3B8'};transition:all 0.15s;font-family:inherit;`">Active</button>
          </div>
        </div>

        <!-- Scene Definition -->
        <div style="border-top:1px solid #F1F5F9;padding-top:26px;">
          <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;margin-bottom:22px;">Scene Definition</div>

          <!-- Scene dropdown -->
          <div style="margin-bottom:20px;">
            <div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">
              Scene / Asset <span style="font-size:10px;color:#94A3B8;font-weight:400;text-transform:none;">(select multiple)</span>
            </div>
            <div style="position:relative;" @click.stop>
              <button @click="showSceneDD=!showSceneDD;showSubDD=false"
                style="width:100%;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #E2E8F0;border-radius:8px;padding:10px 14px;font-size:13px;background:white;cursor:pointer;text-align:left;font-family:inherit;color:#94A3B8;">
                <span>Select scenes...</span>
                <ChevronDown :size="14" color="#94A3B8" :style="`transition:transform 0.15s;transform:rotate(${showSceneDD?'180deg':'0'});`"/>
              </button>
              <div v-if="showSceneDD" style="position:absolute;top:calc(100% + 4px);left:0;right:0;background:white;border:1px solid #E2E8F0;border-radius:9px;box-shadow:0 4px 20px rgba(15,23,42,0.1);z-index:30;overflow:hidden;">
                <button v-for="s in SCENES" :key="s" @click="toggleScene(s)"
                  :style="`display:flex;align-items:center;gap:9px;width:100%;padding:10px 14px;border:none;background:${selectedScenes.includes(s)?'#EEF2FF':'transparent'};color:#334155;font-size:13px;cursor:pointer;text-align:left;font-family:inherit;`">
                  <div :style="`width:15px;height:15px;border-radius:3px;border:1.5px solid ${selectedScenes.includes(s)?'#4F46E5':'#CBD5E1'};background:${selectedScenes.includes(s)?'#4F46E5':'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;`">
                    <Check v-if="selectedScenes.includes(s)" :size="9" color="white"/>
                  </div>
                  {{ s }}
                </button>
              </div>
            </div>
            <!-- Selected scene tags -->
            <div v-if="selectedScenes.length" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">
              <span v-for="s in selectedScenes" :key="s"
                style="display:inline-flex;align-items:center;gap:5px;background:#EEF2FF;color:#4F46E5;border:1px solid #C7D2FE;font-size:12px;font-weight:500;padding:4px 10px;border-radius:20px;">
                {{ s }}
                <button @click.stop="toggleScene(s)" style="background:transparent;border:none;cursor:pointer;padding:0;display:flex;align-items:center;color:#818CF8;line-height:1;">
                  <X :size="12" color="#818CF8"/>
                </button>
              </span>
            </div>
          </div>

          <!-- Subscene dropdown -->
          <div>
            <div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">
              Subscene <span style="font-size:10px;color:#94A3B8;font-weight:400;text-transform:none;">(select multiple)</span>
            </div>
            <div style="position:relative;" @click.stop>
              <button
                @click="selectedScenes.length&&(showSubDD=!showSubDD,showSceneDD=false)"
                :style="`width:100%;display:flex;align-items:center;justify-content:space-between;border:1.5px solid #E2E8F0;border-radius:8px;padding:10px 14px;font-size:13px;background:${selectedScenes.length===0?'#F8FAFC':'white'};cursor:${selectedScenes.length===0?'not-allowed':'pointer'};text-align:left;font-family:inherit;color:${selectedScenes.length===0?'#CBD5E1':'#94A3B8'};`">
                <span>{{ selectedScenes.length===0 ? 'Select a scene first' : 'Select subscenes...' }}</span>
                <ChevronDown :size="14" color="#CBD5E1" :style="`transition:transform 0.15s;transform:rotate(${showSubDD?'180deg':'0'});`"/>
              </button>
              <div v-if="showSubDD && selectedScenes.length>0" style="position:absolute;top:calc(100% + 4px);left:0;right:0;background:white;border:1px solid #E2E8F0;border-radius:9px;box-shadow:0 4px 20px rgba(15,23,42,0.1);z-index:30;overflow:hidden;">
                <button v-for="s in availableSubscenes" :key="s" @click="toggleSubscene(s)"
                  :style="`display:flex;align-items:center;gap:9px;width:100%;padding:10px 14px;border:none;background:${selectedSubscenes.includes(s)?'#EEF2FF':'transparent'};color:#334155;font-size:13px;cursor:pointer;text-align:left;font-family:inherit;`">
                  <div :style="`width:15px;height:15px;border-radius:3px;border:1.5px solid ${selectedSubscenes.includes(s)?'#4F46E5':'#CBD5E1'};background:${selectedSubscenes.includes(s)?'#4F46E5':'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;`">
                    <Check v-if="selectedSubscenes.includes(s)" :size="9" color="white"/>
                  </div>
                  {{ s }}
                </button>
              </div>
            </div>
            <!-- Selected subscene tags -->
            <div v-if="selectedSubscenes.length" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">
              <span v-for="s in selectedSubscenes" :key="s"
                style="display:inline-flex;align-items:center;gap:5px;background:#EEF2FF;color:#4F46E5;border:1px solid #C7D2FE;font-size:12px;font-weight:500;padding:4px 10px;border-radius:20px;">
                {{ s }}
                <button @click.stop="toggleSubscene(s)" style="background:transparent;border:none;cursor:pointer;padding:0;display:flex;align-items:center;">
                  <X :size="12" color="#818CF8"/>
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Preview card -->
      <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:22px;display:flex;flex-direction:column;">
        <div style="margin-bottom:18px;">
          <div style="font-size:14px;font-weight:700;color:#0F172A;margin-bottom:3px;">Preview</div>
          <div style="font-size:12px;color:#94A3B8;">Live summary of your config</div>
        </div>

        <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">Planogram Name</div>
        <div :style="`font-size:13px;margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid #F1F5F9;color:${planogramName?'#0F172A':'#CBD5E1'};`">{{ planogramName || 'Not set yet' }}</div>

        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid #F1F5F9;">
          <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;">Status</div>
          <div style="display:flex;align-items:center;gap:5px;">
            <div :style="`width:6px;height:6px;border-radius:50%;background:${ruleStatus==='active'?'#10B981':'#94A3B8'};`"/>
            <span :style="`font-size:12px;font-weight:600;color:${ruleStatus==='active'?'#059669':'#64748B'};`">{{ ruleStatus==='active' ? 'Active' : 'Inactive' }}</span>
          </div>
        </div>

        <div style="margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid #F1F5F9;">
          <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:7px;">Scenes</div>
          <div v-if="!selectedScenes.length" style="font-size:13px;color:#CBD5E1;">No scenes selected</div>
          <div v-else style="display:flex;flex-wrap:wrap;gap:5px;">
            <span v-for="s in selectedScenes" :key="s" style="display:inline-flex;align-items:center;gap:4px;background:#EEF2FF;color:#4F46E5;border:1px solid #C7D2FE;font-size:11px;font-weight:500;padding:3px 8px;border-radius:20px;">{{ s }}</span>
          </div>
        </div>

        <div style="margin-bottom:22px;">
          <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:7px;">Subscenes</div>
          <div v-if="!selectedSubscenes.length" style="font-size:13px;color:#CBD5E1;">No subscenes selected</div>
          <div v-else style="display:flex;flex-wrap:wrap;gap:5px;">
            <span v-for="s in selectedSubscenes" :key="s" style="display:inline-flex;align-items:center;gap:4px;background:#EEF2FF;color:#4F46E5;border:1px solid #C7D2FE;font-size:11px;font-weight:500;padding:3px 8px;border-radius:20px;">{{ s }}</span>
          </div>
        </div>

        <!-- CTA -->
        <button @click.stop="planogramName.trim()&&(step=2)"
          :style="`display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:11px;border-radius:8px;border:none;font-size:13px;font-weight:600;cursor:${planogramName.trim()?'pointer':'not-allowed'};background:${planogramName.trim()?'#E2E8F0':'#F1F5F9'};color:${planogramName.trim()?'#0F172A':'#CBD5E1'};margin-bottom:12px;font-family:inherit;transition:all 0.15s;`">
          Open SKU Editor <ChevronRight :size="14"/>
        </button>
        <button @click.stop="router.push('/configs')" style="background:transparent;border:none;font-size:13px;color:#94A3B8;cursor:pointer;font-family:inherit;">Cancel</button>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- STEP 2: SKU Placement                                  -->
    <!-- ══════════════════════════════════════════════════════ -->
    <div v-else style="flex:1;display:flex;flex-direction:column;height:calc(100vh - 56px);">

      <!-- AI draft banner -->
      <div v-if="isAiDraft" style="background:#1E1A06;border-bottom:1px solid #78350F;padding:10px 24px;display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <AlertTriangle :size="14" color="#F59E0B"/>
        <span style="font-size:13px;color:#FCD34D;font-weight:500;">AI Draft — SKUs auto-placed from ideal image. Click any slot to edit.</span>
      </div>

      <!-- 3-col layout -->
      <div style="flex:1;display:flex;overflow:hidden;background:#0D1117;">

        <!-- ── LEFT: SKU Library ── -->
        <div style="width:234px;min-width:234px;background:white;border-right:1px solid #E2E8F0;display:flex;flex-direction:column;overflow:hidden;">

          <div style="padding:14px 14px 10px;border-bottom:1px solid #F1F5F9;">
            <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;">Planogram Name</div>
            <div style="font-size:13px;font-weight:600;color:#0F172A;">{{ planogramName }}</div>
          </div>

          <div style="padding:12px 14px 8px;border-bottom:1px solid #F1F5F9;">
            <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;">SKU Library</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:5px;">
              <div>
                <div style="font-size:9px;color:#94A3B8;font-weight:600;text-transform:uppercase;margin-bottom:3px;">Division</div>
                <select v-model="libDivFilter" style="width:100%;border:1px solid #E2E8F0;border-radius:5px;padding:4px 6px;font-size:11px;color:#374151;outline:none;background:white;cursor:pointer;">
                  <option value="All">All</option>
                  <option v-for="d in libDivisions" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
              <div>
                <div style="font-size:9px;color:#94A3B8;font-weight:600;text-transform:uppercase;margin-bottom:3px;">Primary</div>
                <select v-model="libPrimaryFilter" style="width:100%;border:1px solid #E2E8F0;border-radius:5px;padding:4px 6px;font-size:11px;color:#374151;outline:none;background:white;cursor:pointer;">
                  <option value="All">All</option>
                  <option v-for="p in libPrimaries" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:8px;">
              <div>
                <div style="font-size:9px;color:#94A3B8;font-weight:600;text-transform:uppercase;margin-bottom:3px;">Secondary</div>
                <select style="width:100%;border:1px solid #E2E8F0;border-radius:5px;padding:4px 6px;font-size:11px;color:#374151;outline:none;background:white;cursor:pointer;"><option>All</option></select>
              </div>
              <div>
                <div style="font-size:9px;color:#94A3B8;font-weight:600;text-transform:uppercase;margin-bottom:3px;">Short Name</div>
                <input placeholder="e.g. MSO..." style="width:100%;border:1px solid #E2E8F0;border-radius:5px;padding:4px 6px;font-size:11px;color:#374151;outline:none;font-family:inherit;"/>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;border:1px solid #E2E8F0;border-radius:6px;padding:6px 9px;background:#F8FAFC;">
              <Search :size="12" color="#CBD5E1"/>
              <input v-model="skuSearch" placeholder="Search SKUs" style="flex:1;border:none;background:transparent;font-size:12px;color:#334155;outline:none;font-family:inherit;"/>
            </div>
          </div>

          <div style="flex:1;overflow-y:auto;padding:6px 8px;">
            <div v-for="sku in filteredLibrary" :key="sku.id"
              draggable="true"
              @dragstart="dragSkuId=sku.id"
              @dragend="dragSkuId=null"
              style="display:flex;align-items:center;gap:8px;padding:7px 6px;border-radius:7px;margin-bottom:2px;cursor:grab;border:1px solid #F1F5F9;background:white;transition:background 0.12s;"
              @mouseenter="(e) => (e.currentTarget as HTMLElement).style.background='#F8FAFC'"
              @mouseleave="(e) => (e.currentTarget as HTMLElement).style.background='white'">
              <div :style="`width:30px;height:34px;border-radius:5px;background:${sku.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;`">
                <span style="font-size:8px;font-weight:800;color:white;letter-spacing:0.3px;">{{ sku.code }}</span>
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:11px;font-weight:600;color:#0F172A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ sku.name }}</div>
                <div style="font-size:10px;color:#94A3B8;margin-top:1px;">{{ sku.cat }}</div>
              </div>
              <GripVertical :size="12" color="#CBD5E1" style="flex-shrink:0;"/>
            </div>
          </div>
        </div>

        <!-- ── CENTER: Canvas ── -->
        <div style="flex:1;overflow-y:auto;padding:20px 16px;display:flex;flex-direction:column;gap:10px;">

          <div v-for="rack in racks" :key="rack.id" style="background:#161B22;border:1px solid #30363D;border-radius:10px;overflow:hidden;">

            <div style="padding:10px 14px;background:#0D1117;border-bottom:1px solid #21262D;display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:10px;font-weight:700;color:#6E7681;text-transform:uppercase;letter-spacing:1px;">Rack {{ rack.id }}</span>
              <button v-if="racks.length>1" @click="removeRack(rack.id)"
                style="background:transparent;border:none;cursor:pointer;padding:2px;color:#F85149;opacity:0.5;display:flex;align-items:center;"
                @mouseenter="(e) => (e.currentTarget as HTMLElement).style.opacity='1'"
                @mouseleave="(e) => (e.currentTarget as HTMLElement).style.opacity='0.5'">
                <X :size="12" color="#F85149"/>
              </button>
            </div>

            <div style="padding:12px 14px;">
              <div v-for="subrack in rack.subracks" :key="subrack.id" style="margin-bottom:8px;">
                <div style="font-size:9px;font-weight:700;color:#6E7681;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Subrack</div>
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">

                  <div v-for="(posSkuId, pi) in subrack.positions" :key="pi"
                    @dragover.prevent
                    @drop.prevent="dropOnPosition(rack.id, subrack.id, pi)"
                    style="width:72px;height:56px;border-radius:6px;cursor:default;position:relative;">
                    <!-- Filled position -->
                    <div v-if="posSkuId"
                      :style="`width:100%;height:100%;border-radius:6px;background:${skuById(posSkuId)?.color||'#475569'};display:flex;align-items:center;justify-content:center;border:1.5px solid ${skuById(posSkuId)?.color||'#475569'};`">
                      <button @click.stop="removeFromPosition(rack.id, subrack.id, pi)"
                        style="position:absolute;top:3px;right:3px;width:16px;height:16px;border-radius:50%;background:rgba(0,0,0,0.4);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                        <X :size="8" color="white"/>
                      </button>
                      <span style="font-size:9px;font-weight:800;color:white;letter-spacing:0.3px;">{{ skuById(posSkuId)?.code }}</span>
                    </div>
                    <!-- Empty position -->
                    <div v-else style="width:100%;height:100%;border-radius:6px;border:1.5px dashed #30363D;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.02);">
                      <Plus :size="14" color="#484F58"/>
                    </div>
                  </div>

                  <!-- Add position -->
                  <button @click="addPosition(rack.id, subrack.id)"
                    style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;width:60px;height:56px;border-radius:6px;border:none;background:transparent;cursor:pointer;transition:background 0.15s;"
                    @mouseenter="(e) => (e.currentTarget as HTMLElement).style.background='rgba(79,70,229,0.12)'"
                    @mouseleave="(e) => (e.currentTarget as HTMLElement).style.background='transparent'">
                    <Plus :size="16" color="#4F46E5"/>
                    <span style="font-size:8px;font-weight:700;color:#4F46E5;letter-spacing:0.5px;">POSITION</span>
                  </button>
                </div>
              </div>

              <!-- Add subrack -->
              <button @click="addSubrack(rack.id)"
                style="display:flex;align-items:center;gap:5px;padding:7px 12px;border:1px dashed #30363D;border-radius:6px;background:transparent;cursor:pointer;font-size:11px;color:#6E7681;font-family:inherit;transition:all 0.15s;margin-top:4px;"
                @mouseenter="(e) => { (e.currentTarget as HTMLElement).style.borderColor='#4F46E5'; (e.currentTarget as HTMLElement).style.color='#818CF8'; }"
                @mouseleave="(e) => { (e.currentTarget as HTMLElement).style.borderColor='#30363D'; (e.currentTarget as HTMLElement).style.color='#6E7681'; }">
                <Plus :size="12"/>+ Add Subrack
              </button>
            </div>
          </div>

          <!-- Add rack -->
          <button @click="addRack"
            style="display:flex;align-items:center;justify-content:center;gap:6px;padding:14px;border:1.5px dashed #30363D;border-radius:10px;background:transparent;cursor:pointer;font-size:12px;color:#6E7681;font-family:inherit;transition:all 0.15s;"
            @mouseenter="(e) => { (e.currentTarget as HTMLElement).style.borderColor='#4F46E5'; (e.currentTarget as HTMLElement).style.color='#818CF8'; }"
            @mouseleave="(e) => { (e.currentTarget as HTMLElement).style.borderColor='#30363D'; (e.currentTarget as HTMLElement).style.color='#6E7681'; }">
            <Plus :size="14"/>+ Add Rack
          </button>
        </div>

        <!-- ── RIGHT: Summary panel ── -->
        <div style="width:270px;min-width:270px;background:white;border-left:1px solid #E2E8F0;display:flex;flex-direction:column;overflow-y:auto;">

          <!-- Ideal Planogram -->
          <div style="padding:16px;border-bottom:1px solid #F1F5F9;">
            <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px;">Ideal Planogram</div>

            <label v-if="!idealImageUrl"
              style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:1.5px dashed #E2E8F0;border-radius:8px;padding:20px 12px;cursor:pointer;background:#F8FAFC;transition:all 0.15s;"
              @mouseenter="(e) => { (e.currentTarget as HTMLElement).style.borderColor='#4F46E5'; (e.currentTarget as HTMLElement).style.background='#EEF2FF'; }"
              @mouseleave="(e) => { (e.currentTarget as HTMLElement).style.borderColor='#E2E8F0'; (e.currentTarget as HTMLElement).style.background='#F8FAFC'; }">
              <div style="width:40px;height:40px;border-radius:8px;background:#E2E8F0;display:flex;align-items:center;justify-content:center;">
                <Upload :size="18" color="#94A3B8"/>
              </div>
              <div style="text-align:center;">
                <div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:2px;">Upload Ideal Image</div>
                <div style="font-size:11px;color:#94A3B8;">AI will auto-detect &amp; place SKUs</div>
              </div>
              <input type="file" accept="image/*" style="display:none;" @change="handleImageUpload"/>
            </label>

            <div v-else style="position:relative;border-radius:8px;overflow:hidden;">
              <img :src="idealImageUrl" alt="Ideal" style="width:100%;display:block;max-height:140px;object-fit:cover;background:#F8FAFC;"/>
              <div v-if="isAiDraft" style="position:absolute;top:6px;left:6px;background:rgba(79,70,229,0.9);border-radius:4px;padding:2px 7px;">
                <span style="font-size:9px;font-weight:800;color:white;letter-spacing:0.5px;">AI DRAFT</span>
              </div>
              <label style="position:absolute;bottom:6px;right:6px;background:rgba(15,23,42,0.75);border-radius:5px;padding:4px 10px;font-size:10px;font-weight:600;color:white;cursor:pointer;">
                Replace
                <input type="file" accept="image/*" style="display:none;" @change="handleImageUpload"/>
              </label>
              <div v-if="aiLoading" style="position:absolute;inset:0;background:rgba(13,17,23,0.7);display:flex;align-items:center;justify-content:center;">
                <div style="width:28px;height:28px;border:2px solid rgba(79,70,229,0.3);border-top-color:#4F46E5;border-radius:50%;animation:spin 0.7s linear infinite;"/>
              </div>
            </div>
          </div>

          <!-- Configuration Summary -->
          <div style="padding:16px;border-bottom:1px solid #F1F5F9;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
              <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;">Configuration Summary</div>
              <span :style="`font-size:14px;font-weight:800;color:${fillRate>0?'#0F172A':'#CBD5E1'};`">{{ fillRate }}%</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
              <div style="background:#EFF6FF;border-radius:7px;padding:10px;">
                <div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;">
                  <LayoutGrid :size="12" color="#3B82F6"/>
                  <span style="font-size:9px;font-weight:700;color:#3B82F6;text-transform:uppercase;letter-spacing:0.5px;">Total Racks</span>
                </div>
                <div style="font-size:22px;font-weight:800;color:#1D4ED8;">{{ racks.length }}</div>
              </div>
              <div style="background:#F0FDF4;border-radius:7px;padding:10px;">
                <div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;">
                  <Plus :size="12" color="#10B981"/>
                  <span style="font-size:9px;font-weight:700;color:#10B981;text-transform:uppercase;letter-spacing:0.5px;">Total SKU Slots</span>
                </div>
                <div style="font-size:22px;font-weight:800;color:#065F46;">{{ totalSlots }}</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-size:11px;color:#64748B;">Fill rate</span>
              <span :style="`font-size:11px;font-weight:700;color:${fillRate>0?'#3B82F6':'#CBD5E1'};`">{{ fillRate }}%</span>
            </div>
            <div style="height:4px;background:#F1F5F9;border-radius:2px;overflow:hidden;">
              <div :style="`height:100%;width:${fillRate}%;background:#3B82F6;border-radius:2px;transition:width 0.4s;`"/>
            </div>
          </div>

          <!-- Capacity Estimate -->
          <div style="padding:16px;border-bottom:1px solid #F1F5F9;flex:1;">
            <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px;">Capacity Estimate</div>
            <div v-for="rack in racks" :key="rack.id" style="margin-bottom:12px;">
              <div style="font-size:11px;font-weight:600;color:#374151;margin-bottom:6px;">Rack {{ rack.id }}</div>
              <div v-for="subrack in rack.subracks" :key="subrack.id" style="margin-bottom:5px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;">
                  <span style="font-size:10px;color:#94A3B8;">Subrack {{ subrack.id }}</span>
                  <span :style="`font-size:10px;font-weight:700;color:${subrackFill(subrack)>0?'#374151':'#CBD5E1'};`">{{ subrackFill(subrack) }}%</span>
                </div>
                <div style="height:3px;background:#F1F5F9;border-radius:2px;overflow:hidden;">
                  <div :style="`height:100%;width:${subrackFill(subrack)}%;background:${subrackFill(subrack)>60?'#3B82F6':'#F59E0B'};border-radius:2px;transition:width 0.4s;`"/>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Draft review panel -->
          <div v-if="isAiDraft && !aiApproved" style="margin:12px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:12px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="font-size:12px;color:#92400E;">✦</span>
              <span style="font-size:12px;font-weight:700;color:#92400E;">AI Draft — Pending Review</span>
            </div>
            <div style="font-size:11px;color:#92400E;line-height:1.55;">SKUs have been auto-placed from the ideal image. Review the canvas, make edits if needed, then approve.</div>
          </div>

          <!-- Publish / Approve -->
          <div style="padding:14px 16px 16px;">
            <div v-if="!isAiDraft || aiApproved" style="font-size:11px;color:#64748B;margin-bottom:9px;line-height:1.5;">Place all SKUs and publish to make it live for all outlets.</div>

            <button v-if="isAiDraft && !aiApproved" @click="approvePlanogram"
              style="display:flex;align-items:center;justify-content:center;gap:7px;width:100%;padding:12px;border-radius:8px;border:none;background:#059669;color:white;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:10px;transition:background 0.15s;"
              @mouseenter="(e) => (e.currentTarget as HTMLElement).style.background='#047857'"
              @mouseleave="(e) => (e.currentTarget as HTMLElement).style.background='#059669'">
              <Check :size="14"/> Approve Planogram
            </button>

            <button v-else @click="publishPlanogram"
              :style="`display:flex;align-items:center;justify-content:center;gap:7px;width:100%;padding:12px;border-radius:8px;border:none;color:white;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:10px;transition:background 0.15s;background:${aiApproved?'#10B981':'#3B82F6'};`">
              <Check v-if="aiApproved" :size="14"/>
              {{ aiApproved ? 'Published!' : 'Publish Planogram' }}
            </button>

            <button @click="step=1"
              style="display:flex;align-items:center;justify-content:center;gap:4px;width:100%;background:transparent;border:none;font-size:12px;color:#94A3B8;cursor:pointer;font-family:inherit;">
              <ChevronLeft :size="13"/> Edit Configuration
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0F172A;color:white;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:500;z-index:999;box-shadow:0 4px 16px rgba(0,0,0,0.18);white-space:nowrap;pointer-events:none;">
      {{ toast }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  LayoutGrid, ChevronRight, ChevronDown, ChevronLeft,
  Check, X, Plus, Search, GripVertical, AlertTriangle, Upload
} from 'lucide-vue-next'

definePageMeta({ layout: 'planogram-create' })

const router = useRouter()

// ── Step 1 state ──────────────────────────────────────────────────────────────
const step            = ref(1)
const planogramName   = ref('')
const ruleStatus      = ref<'active'|'inactive'>('active')
const selectedScenes  = ref<string[]>([])
const selectedSubscenes = ref<string[]>([])
const showSceneDD     = ref(false)
const showSubDD       = ref(false)
const nameFieldFocused = ref(false)

const SCENES = ['Beverage', 'Instant Foods', 'Noodles', 'Confectionery', 'Biscuits & Wafers', 'Coffee & Tea']
const SUBSCENE_MAP: Record<string, string[]> = {
  'Beverage':          ['Carbonated', 'Juice', 'Water', 'Energy Drink'],
  'Instant Foods':     ['Ready to Eat', 'Cup Noodles', 'Porridge'],
  'Noodles':           ['Fried Noodles', 'Soup Noodles', 'Cup'],
  'Confectionery':     ['Candy', 'Gum', 'Chocolate'],
  'Biscuits & Wafers': ['Wafer', 'Crackers', 'Cookies'],
  'Coffee & Tea':      ['Instant Coffee', '3-in-1', 'Tea Bags'],
}

const availableSubscenes = computed(() => {
  const subs = new Set<string>()
  selectedScenes.value.forEach(s => SUBSCENE_MAP[s]?.forEach(sub => subs.add(sub)))
  return Array.from(subs)
})

function toggleScene(s: string) {
  if (selectedScenes.value.includes(s)) {
    selectedScenes.value = selectedScenes.value.filter(x => x !== s)
  } else {
    selectedScenes.value = [...selectedScenes.value, s]
  }
  selectedSubscenes.value = selectedSubscenes.value.filter(sub => availableSubscenes.value.includes(sub))
}

function toggleSubscene(s: string) {
  if (selectedSubscenes.value.includes(s)) {
    selectedSubscenes.value = selectedSubscenes.value.filter(x => x !== s)
  } else {
    selectedSubscenes.value = [...selectedSubscenes.value, s]
  }
}

function closeAllDropdowns() {
  showSceneDD.value = false
  showSubDD.value   = false
}

// ── SKU Library ───────────────────────────────────────────────────────────────
interface LibSKU { id: number; code: string; name: string; cat: string; color: string; div: string; primary: string }

const SKU_LIBRARY: LibSKU[] = [
  { id:1,  code:'MSO', name:'Mie Sedaap Original',   cat:'Noodles',           color:'#F97316', div:'Foods',     primary:'Noodles'  },
  { id:2,  code:'MSG', name:'Mie Sedaap Goreng',      cat:'Noodles',           color:'#EA580C', div:'Foods',     primary:'Noodles'  },
  { id:3,  code:'MSC', name:'Mie Sedaap Cup',         cat:'Noodles',           color:'#D97706', div:'Foods',     primary:'Noodles'  },
  { id:4,  code:'TKC', name:'Torabika Cappuccino',    cat:'Coffee & Tea',      color:'#92400E', div:'Beverages', primary:'Coffee'   },
  { id:5,  code:'TK3', name:'Torabika 3in1',          cat:'Coffee & Tea',      color:'#78350F', div:'Beverages', primary:'Coffee'   },
  { id:6,  code:'RSC', name:'Roma Sandwich Choco',    cat:'Biscuits & Wafers', color:'#DC2626', div:'Snacks',    primary:'Biscuits' },
  { id:7,  code:'RMG', name:'Roma Marie Gold',        cat:'Biscuits & Wafers', color:'#D97706', div:'Snacks',    primary:'Biscuits' },
  { id:8,  code:'BB',  name:'Beng-Beng Wafer',        cat:'Biscuits & Wafers', color:'#16A34A', div:'Snacks',    primary:'Wafers'   },
  { id:9,  code:'KPC', name:'Kopiko Coffee Candy',    cat:'Confectionery',     color:'#2563EB', div:'Snacks',    primary:'Candy'    },
  { id:10, code:'ENC', name:'Energen Cereal',         cat:'Instant Foods',     color:'#0891B2', div:'Foods',     primary:'Cereal'   },
]

const skuSearch        = ref('')
const libDivFilter     = ref('All')
const libPrimaryFilter = ref('All')

const libDivisions = computed(() => [...new Set(SKU_LIBRARY.map(s => s.div))])
const libPrimaries = computed(() => [...new Set(SKU_LIBRARY.map(s => s.primary))])

const filteredLibrary = computed(() =>
  SKU_LIBRARY.filter(s => {
    const q = skuSearch.value.toLowerCase()
    return (!q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
      && (libDivFilter.value === 'All' || s.div === libDivFilter.value)
      && (libPrimaryFilter.value === 'All' || s.primary === libPrimaryFilter.value)
  })
)

function skuById(id: number) { return SKU_LIBRARY.find(s => s.id === id) }

// ── Rack / Subrack / Position state ──────────────────────────────────────────
interface Subrack { id: number; positions: (number|null)[] }
interface Rack    { id: number; subracks: Subrack[] }

let nextRackId    = 4
let nextSubrackId = 4

const racks = ref<Rack[]>([
  { id:1, subracks:[{ id:1, positions:[null,null,null,null] }] },
  { id:2, subracks:[{ id:2, positions:[null,null,null,null] }] },
  { id:3, subracks:[{ id:3, positions:[null,null,null,null] }] },
])

const totalSlots = computed(() =>
  racks.value.reduce((a, r) => a + r.subracks.reduce((b, sr) => b + sr.positions.length, 0), 0)
)
const totalFilled = computed(() =>
  racks.value.reduce((a, r) => a + r.subracks.reduce((b, sr) => b + sr.positions.filter(Boolean).length, 0), 0)
)
const fillRate = computed(() =>
  totalSlots.value ? Math.round((totalFilled.value / totalSlots.value) * 100) : 0
)

function subrackFill(sr: Subrack) {
  return sr.positions.length ? Math.round((sr.positions.filter(Boolean).length / sr.positions.length) * 100) : 0
}

function addRack() {
  racks.value.push({ id: nextRackId++, subracks: [{ id: nextSubrackId++, positions: [null,null,null,null] }] })
}
function removeRack(id: number) {
  racks.value = racks.value.filter(r => r.id !== id)
}
function addSubrack(rackId: number) {
  const rack = racks.value.find(r => r.id === rackId)
  if (rack) rack.subracks.push({ id: nextSubrackId++, positions: [null,null,null,null] })
}
function addPosition(rackId: number, subrackId: number) {
  const sr = racks.value.find(r => r.id === rackId)?.subracks.find(s => s.id === subrackId)
  if (sr) sr.positions.push(null)
}
function removeFromPosition(rackId: number, subrackId: number, pi: number) {
  const sr = racks.value.find(r => r.id === rackId)?.subracks.find(s => s.id === subrackId)
  if (sr) sr.positions[pi] = null
}

// ── Drag & drop ───────────────────────────────────────────────────────────────
const dragSkuId = ref<number|null>(null)

function dropOnPosition(rackId: number, subrackId: number, pi: number) {
  if (dragSkuId.value === null) return
  const sr = racks.value.find(r => r.id === rackId)?.subracks.find(s => s.id === subrackId)
  if (sr) {
    sr.positions[pi] = dragSkuId.value
    showToast(`${skuById(dragSkuId.value)?.name} placed`)
  }
  dragSkuId.value = null
}

// ── Ideal image + AI draft ────────────────────────────────────────────────────
const idealImageUrl = ref<string|null>(null)
const isAiDraft     = ref(false)
const aiLoading     = ref(false)
const aiApproved    = ref(false)

async function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  idealImageUrl.value = URL.createObjectURL(file)
  aiLoading.value     = true
  isAiDraft.value     = false
  aiApproved.value    = false

  await new Promise<void>(r => setTimeout(r, 1200))

  // Simulate AI placing SKUs: KPC,MSG,ENC | MSO,BB | TK3,TKC
  racks.value[0].subracks[0].positions = [9, 2, 10, null]
  racks.value[1].subracks[0].positions = [1, 8, null, null]
  racks.value[2].subracks[0].positions = [5, 4, null, null]

  aiLoading.value = false
  isAiDraft.value = true
}

function approvePlanogram() {
  aiApproved.value = true
  isAiDraft.value  = false
  showToast('Planogram approved and published!')
  setTimeout(() => router.push('/configs'), 1800)
}

function publishPlanogram() {
  showToast('Planogram published to all outlets!')
  setTimeout(() => router.push('/configs'), 1800)
}

// ── Toast ─────────────────────────────────────────────────────────────────────
const toast = ref<string|null>(null)
function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 2200)
}
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
</style>
