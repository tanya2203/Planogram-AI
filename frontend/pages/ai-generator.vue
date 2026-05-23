<template>
  <div style="display:flex;flex-direction:column;min-height:calc(100vh - 56px);">

    <!-- ===== STICKY HEADER ===== -->
    <div style="background:white;border-bottom:1px solid #E2E8F0;padding:13px 28px;display:flex;align-items:center;gap:16px;position:sticky;top:56px;z-index:20;flex-wrap:wrap;">
      <button @click="router.push('/configs')" style="display:flex;align-items:center;gap:5px;background:transparent;border:none;cursor:pointer;font-size:13px;color:#64748B;font-weight:500;padding:4px 0;flex-shrink:0;">
        <ChevronLeft :size="15"/> Back
      </button>
      <div style="width:1px;height:20px;background:#E2E8F0;flex-shrink:0;"></div>
      <div style="display:flex;align-items:center;gap:7px;flex-shrink:0;">
        <Sparkles :size="14" color="#3B82F6"/>
        <span style="font-size:14px;font-weight:700;color:#0F172A;">AI Planogram Generator</span>
      </div>
      <!-- Mode toggle -->
      <div style="display:flex;background:#F1F5F9;border-radius:8px;padding:3px;gap:2px;margin-left:16px;flex-shrink:0;">
        <button v-for="[m,label] in [['form','📝 Step-by-step'],['chat','✦ Chat with AI']]" :key="m"
          @click="generatorMode=m"
          :style="`padding:6px 14px;border-radius:6px;border:none;font-size:12px;font-weight:${generatorMode===m?600:400};cursor:pointer;background:${generatorMode===m?(m==='chat'?'#0F172A':'white'):'transparent'};color:${generatorMode===m?(m==='chat'?'white':'#0F172A'):'#64748B'};box-shadow:${generatorMode===m?'0 1px 3px rgba(0,0,0,0.1)':'none'};transition:all 0.15s;white-space:nowrap;`">
          {{ label }}
        </button>
      </div>
      <!-- Step progress (form mode) -->
      <template v-if="generatorMode==='form'">
        <div style="display:flex;align-items:center;gap:0;margin-left:16px;">
          <template v-for="(s,i) in STEPS" :key="s">
            <div style="display:flex;align-items:center;">
              <div :style="`display:flex;align-items:center;gap:5px;cursor:${step>i+1?'pointer':'default'};`"
                @click="step>i+1 ? step=i+1 : null">
                <div :style="`width:22px;height:22px;border-radius:50%;background:${step>i+1?'#3B82F6':step===i+1?'#0F172A':'#F1F5F9'};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:${step>i+1||step===i+1?'white':'#94A3B8'};flex-shrink:0;`">
                  <Check v-if="step>i+1" :size="11"/>
                  <span v-else>{{ i+1 }}</span>
                </div>
                <span :style="`font-size:12px;font-weight:${step===i+1?600:400};color:${step===i+1?'#0F172A':step>i+1?'#3B82F6':'#94A3B8'};white-space:nowrap;`">{{ s }}</span>
              </div>
              <div v-if="i<STEPS.length-1" :style="`width:24px;height:2px;background:${step>i+1?'#3B82F6':'#E2E8F0'};margin:0 6px;border-radius:2px;flex-shrink:0;`"></div>
            </div>
          </template>
        </div>
      </template>
      <div v-if="generatorMode==='chat'" style="font-size:12px;color:#94A3B8;margin-left:8px;">Answer a few questions — AI configures and generates your planogram</div>
      <button @click="router.push('/configs')" style="margin-left:auto;background:transparent;border:1px solid #E2E8F0;border-radius:6px;padding:6px 14px;font-size:12px;cursor:pointer;color:#64748B;flex-shrink:0;">Cancel</button>
    </div>

    <!-- ===== CHAT MODE ===== -->
    <div v-if="generatorMode==='chat'" style="flex:1;display:grid;grid-template-columns:1fr 360px;background:#F8FAFC;">

      <!-- Left: Chat panel -->
      <div style="display:flex;flex-direction:column;border-right:1px solid #E2E8F0;background:white;">
        <div style="padding:20px 28px;border-bottom:1px solid #F1F5F9;">
          <div style="font-size:16px;font-weight:700;color:#0F172A;margin-bottom:4px;">Configure with AI</div>
          <div style="font-size:13px;color:#64748B;">Answer questions in plain business language. AI translates your answers into planogram inputs and generates candidates automatically.</div>
        </div>
        <!-- Not started -->
        <div v-if="!fullChatStarted" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:40px;">
          <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#3B82F6,#7C3AED);display:flex;align-items:center;justify-content:center;">
            <Sparkles :size="28" color="white"/>
          </div>
          <div style="text-align:center;max-width:400px;">
            <div style="font-size:18px;font-weight:700;color:#0F172A;margin-bottom:8px;">Configure with AI Chat</div>
            <div style="font-size:14px;color:#64748B;line-height:1.7;">Answer a few questions in plain business language. The AI will set up your asset, SKU pool, objective weights, and placement rules — then generate 3 planogram candidates for you.</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;width:100%;max-width:400px;">
            <button v-for="ex in QUICK_STARTS" :key="ex" @click="startFullChat(ex)"
              style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:10px 14px;font-size:13px;color:#334155;cursor:pointer;text-align:left;transition:all 0.12s;"
              @mouseenter="($event.currentTarget as HTMLElement).style.borderColor='#3B82F6'"
              @mouseleave="($event.currentTarget as HTMLElement).style.borderColor='#E2E8F0'">
              "{{ ex }}"
            </button>
          </div>
          <button @click="startFullChat(null)" style="background:#0F172A;color:white;border:none;border-radius:8px;padding:11px 28px;font-size:13px;font-weight:600;cursor:pointer;">Start from scratch →</button>
        </div>
        <!-- Chat active -->
        <template v-else>
          <div v-if="fullChatReady" style="background:#F0FDF4;border-bottom:1px solid #BBF7D0;padding:8px 24px;display:flex;align-items:center;gap:8px;">
            <CheckCircle :size="14" color="#10B981"/>
            <span style="font-size:12px;color:#065F46;font-weight:500;">Configuration ready — AI has enough to generate planograms</span>
            <button @click="triggerGenerate" style="margin-left:auto;display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,#3B82F6,#7C3AED);color:white;border:none;border-radius:7px;padding:7px 16px;font-size:12px;font-weight:600;cursor:pointer;">
              <Sparkles :size="12"/> Generate now
            </button>
          </div>
          <div ref="fullChatScrollRef" style="flex:1;overflow-y:auto;padding:20px 28px;display:flex;flex-direction:column;gap:14px;">
            <div v-for="(m,i) in fullChatMessages" :key="i"
              :style="`display:flex;gap:10px;align-items:flex-start;justify-content:${m.role==='user'?'flex-end':'flex-start'};`">
              <div v-if="m.role==='assistant'" style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#3B82F6,#7C3AED);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
                <Sparkles :size="12" color="white"/>
              </div>
              <div :style="`max-width:72%;padding:11px 16px;line-height:1.6;font-size:14px;border-radius:${m.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px'};background:${m.role==='user'?'#0F172A':'white'};color:${m.role==='user'?'white':'#334155'};border:${m.role==='assistant'?'1px solid #E2E8F0':'none'};box-shadow:${m.role==='assistant'?'0 1px 4px rgba(0,0,0,0.06)':'none'};`">{{ m.content }}</div>
              <div v-if="m.role==='user'" style="width:28px;height:28px;border-radius:50%;background:#E2E8F0;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;font-size:11px;font-weight:700;color:#475569;">U</div>
            </div>
            <div v-if="fullChatLoading" style="display:flex;gap:10px;align-items:flex-start;">
              <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#3B82F6,#7C3AED);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><Sparkles :size="12" color="white"/></div>
              <div style="background:white;border:1px solid #E2E8F0;border-radius:14px 14px 14px 4px;padding:12px 16px;display:flex;gap:5px;align-items:center;">
                <div v-for="i in 3" :key="i" :style="`width:7px;height:7px;border-radius:50%;background:#3B82F6;opacity:${0.3+i*0.3};`"></div>
              </div>
            </div>
          </div>
          <div style="padding:16px 24px;border-top:1px solid #E2E8F0;background:white;display:flex;gap:10px;">
            <input v-model="fullChatInput" @keydown.enter.prevent="sendFullChat(fullChatInput)" placeholder="Type your answer…" :disabled="fullChatLoading"
              style="flex:1;border:1px solid #E2E8F0;border-radius:9px;padding:11px 16px;font-size:14px;color:#0F172A;outline:none;background:#FAFAFA;"/>
            <button @click="sendFullChat(fullChatInput)" :disabled="fullChatLoading||!fullChatInput.trim()"
              :style="`background:${fullChatLoading||!fullChatInput.trim()?'#E2E8F0':'#0F172A'};color:${fullChatLoading||!fullChatInput.trim()?'#94A3B8':'white'};border:none;border-radius:9px;padding:11px 20px;font-size:13px;font-weight:600;cursor:${fullChatLoading||!fullChatInput.trim()?'not-allowed':'pointer'};`">Send</button>
          </div>
        </template>
      </div>

      <!-- Right: Live config panel -->
      <div style="padding:24px 20px;overflow-y:auto;">
        <div style="font-size:12px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:16px;">Configured so far</div>
        <div v-if="selectedAsset" style="background:white;border:1px solid #E2E8F0;border-radius:9px;padding:12px 14px;margin-bottom:10px;display:flex;gap:10px;align-items:center;">
          <span style="font-size:20px;">{{ selectedAsset.img }}</span>
          <div><div style="font-size:12px;font-weight:600;color:#0F172A;">{{ selectedAsset.name }}</div><div style="font-size:11px;color:#64748B;">{{ selectedAsset.type }}</div></div>
          <CheckCircle :size="14" color="#10B981" style="margin-left:auto;"/>
        </div>
        <div style="background:#0F172A;border-radius:9px;padding:12px 14px;margin-bottom:10px;">
          <div v-for="wd in WEIGHT_DISPLAY" :key="wd.key" style="margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
              <span style="font-size:11px;color:#64748B;">{{ wd.label }}</span>
              <span style="font-size:11px;font-weight:700;color:white;">{{ (weights as Record<string,number>)[wd.key] }}%</span>
            </div>
            <div style="height:4px;background:#1E293B;border-radius:2px;overflow:hidden;">
              <div :style="`height:100%;width:${(weights as Record<string,number>)[wd.key]}%;background:${wd.color};border-radius:2px;transition:width 0.4s;`"></div>
            </div>
          </div>
        </div>
        <template v-for="tm in SKU_TIER_META" :key="tm.field">
          <div v-if="objConfig[tm.field]?.length" style="margin-bottom:10px;">
            <div style="font-size:10px;font-weight:600;color:#94A3B8;margin-bottom:5px;">{{ tm.label }}</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              <span v-for="id in objConfig[tm.field]" :key="id"
                :style="`background:${tm.bg};color:${tm.color};border:1px solid ${tm.color}33;border-radius:4px;padding:3px 8px;font-size:10px;font-weight:500;`">
                {{ store.skus.find(s=>s.id===id)?.name.split(' ').slice(0,2).join(' ') }}
              </span>
            </div>
          </div>
        </template>
        <div v-if="objConfig.rsmMode" style="background:#EFF6FF;color:#1D4ED8;border-radius:6px;padding:6px 10px;font-size:11px;font-weight:600;margin-bottom:6px;">✓ RSM Visit Mode on</div>
        <div v-if="objConfig.competitorCounter" style="background:#EFF6FF;color:#1D4ED8;border-radius:6px;padding:6px 10px;font-size:11px;font-weight:600;margin-bottom:6px;">✓ Competitor Counter on</div>
        <div v-if="!selectedAsset&&!objConfig.mandatoryIds?.length" style="text-align:center;color:#CBD5E1;font-size:12px;padding-top:20px;">Chat to start configuring</div>
      </div>
    </div>

    <!-- ===== FORM MODE ===== -->
    <div v-if="generatorMode==='form'" style="flex:1;overflow-y:auto;background:#F8FAFC;">
      <div style="max-width:960px;margin:0 auto;padding:36px 28px;">

        <!-- STEP 1: Asset -->
        <div v-if="step===1">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="font-size:22px;font-weight:700;color:#0F172A;margin-bottom:8px;">Which fixture are you building for?</div>
            <div style="font-size:15px;color:#64748B;">Select the retail asset. AI will suggest a relevant SKU pool based on your choice.</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
            <button v-for="asset in store.assets" :key="asset.id" @click="selectAsset(asset)"
              :style="`display:flex;align-items:center;gap:14px;padding:18px 20px;border:1.5px solid ${selectedAsset?.id===asset.id?'#3B82F6':'#E2E8F0'};border-radius:12px;background:${selectedAsset?.id===asset.id?'#EFF6FF':'white'};cursor:pointer;text-align:left;transition:all 0.13s;box-shadow:${selectedAsset?.id===asset.id?'0 0 0 3px #BFDBFE':'none'};width:100%;`"
              @mouseenter="e => { if(selectedAsset?.id!==asset.id){(e.currentTarget as HTMLElement).style.borderColor='#CBD5E1';(e.currentTarget as HTMLElement).style.background='#FAFAFA';} }"
              @mouseleave="e => { if(selectedAsset?.id!==asset.id){(e.currentTarget as HTMLElement).style.borderColor='#E2E8F0';(e.currentTarget as HTMLElement).style.background='white';} }">
              <span style="font-size:28px;line-height:1;">{{ asset.img }}</span>
              <div style="flex:1;">
                <div :style="`font-size:14px;font-weight:600;color:${selectedAsset?.id===asset.id?'#1D4ED8':'#0F172A'};margin-bottom:3px;`">{{ asset.name }}</div>
                <div style="font-size:12px;color:#64748B;">{{ asset.type }}</div>
                <div style="font-size:11px;color:#94A3B8;margin-top:2px;">{{ asset.shelves }} shelves · {{ asset.w }}×{{ asset.h }}cm · {{ asset.region }}</div>
              </div>
              <Check v-if="selectedAsset?.id===asset.id" :size="18" color="#3B82F6" style="flex-shrink:0;"/>
            </button>
          </div>
        </div>

        <!-- STEP 2: SKU Pool -->
        <div v-if="step===2">
          <div style="margin-bottom:28px;">
            <div style="font-size:22px;font-weight:700;color:#0F172A;margin-bottom:8px;">Build your SKU pool</div>
            <div style="font-size:15px;color:#64748B;">AI will only arrange SKUs from this pool. Suggested categories are pre-selected based on <strong>{{ selectedAsset?.type }}</strong>.</div>
          </div>
          <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;">
            <div>
              <div style="display:flex;gap:8px;align-items:center;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:10px 14px;margin-bottom:16px;">
                <Sparkles :size="13" color="#3B82F6"/>
                <span style="font-size:12px;color:#1D4ED8;">Suggested for <strong>{{ selectedAsset?.type }}</strong> — adjust as needed</span>
              </div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                <button v-for="cat in CATS" :key="cat" @click="selectedCats[cat]=!selectedCats[cat]"
                  :style="`display:flex;flex-direction:column;gap:6px;padding:14px;border:1.5px solid ${selectedCats[cat]?'#3B82F6':'#E2E8F0'};border-radius:10px;background:${selectedCats[cat]?'#EFF6FF':'white'};cursor:pointer;text-align:left;transition:all 0.12s;`">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div :style="`width:18px;height:18px;border-radius:4px;border:2px solid ${selectedCats[cat]?'#3B82F6':'#CBD5E1'};background:${selectedCats[cat]?'#3B82F6':'white'};display:flex;align-items:center;justify-content:center;flex-shrink:0;`">
                      <Check v-if="selectedCats[cat]" :size="10" color="white"/>
                    </div>
                    <span :style="`font-size:13px;font-weight:${selectedCats[cat]?600:500};color:${selectedCats[cat]?'#1D4ED8':'#0F172A'};`">{{ cat }}</span>
                  </div>
                  <div style="font-size:11px;color:#94A3B8;">{{ store.skus.filter(s=>s.cat===cat).length }} SKUs</div>
                  <div style="display:flex;gap:3px;">
                    <div v-for="s in store.skus.filter(s2=>s2.cat===cat).slice(0,4)" :key="s.id" :style="`width:8px;height:8px;border-radius:50%;background:${s.color};`"></div>
                  </div>
                </button>
              </div>
            </div>
            <!-- Pool summary -->
            <div>
              <div style="background:white;border:1px solid #E2E8F0;border-radius:10px;padding:16px;position:sticky;top:80px;">
                <div style="font-size:13px;font-weight:600;color:#0F172A;margin-bottom:12px;">Pool summary</div>
                <div style="font-size:32px;font-weight:800;color:#3B82F6;margin-bottom:2px;">{{ poolIds.length }}</div>
                <div style="font-size:12px;color:#64748B;margin-bottom:12px;">SKUs selected</div>
                <div style="height:5px;background:#F1F5F9;border-radius:3px;overflow:hidden;margin-bottom:5px;">
                  <div :style="`height:100%;width:${Math.min(100,poolIds.length/((selectedAsset?.shelves||5)*6)*100)}%;background:#3B82F6;border-radius:3px;`"></div>
                </div>
                <div style="font-size:11px;color:#94A3B8;margin-bottom:14px;">of ~{{ (selectedAsset?.shelves||5)*6 }} slots</div>
                <div v-if="poolIds.length===0" style="font-size:12px;color:#EF4444;font-weight:500;">Select at least one category</div>
                <div v-else-if="poolIds.length<4" style="font-size:12px;color:#D97706;font-weight:500;">Add more for better results</div>
                <div v-else style="font-size:12px;color:#10B981;font-weight:500;">✓ Good pool size</div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:14px;">
                  <span v-for="id in poolIds" :key="id" style="display:flex;align-items:center;gap:3px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:4px;padding:3px 7px;font-size:10px;color:#334155;">
                    <div :style="`width:6px;height:6px;border-radius:50%;background:${store.skus.find(s=>s.id===id)?.color};`"></div>
                    {{ store.skus.find(s=>s.id===id)?.name.split(' ').slice(0,2).join(' ') }}
                    <span v-if="mustHaveIds.includes(id)" style="color:#EF4444;font-weight:700;font-size:8px;">M</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 3: Objective -->
        <div v-if="step===3">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
            <div>
              <div style="font-size:22px;font-weight:700;color:#0F172A;margin-bottom:6px;">Define your objective</div>
              <div style="font-size:15px;color:#64748B;">Tell the AI what matters most — through a form or a conversation.</div>
            </div>
            <div style="display:flex;background:#F1F5F9;border-radius:8px;padding:3px;gap:2px;flex-shrink:0;">
              <button v-for="[m,label] in [['form','📝 Form'],['chat','✦ Chat with AI']]" :key="m" @click="objMode=m"
                :style="`padding:7px 16px;border-radius:6px;border:none;font-size:13px;font-weight:${objMode===m?600:400};cursor:pointer;background:${objMode===m?(m==='chat'?'#0F172A':'white'):'transparent'};color:${objMode===m?(m==='chat'?'white':'#0F172A'):'#64748B'};box-shadow:${objMode===m?'0 1px 3px rgba(0,0,0,0.1)':'none'};transition:all 0.15s;`">
                {{ label }}
              </button>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 320px;gap:20px;align-items:start;">
            <!-- Left -->
            <div>
              <!-- FORM MODE -->
              <div v-if="objMode==='form'" style="display:flex;flex-direction:column;gap:20px;">
                <!-- KPI Weights -->
                <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:20px;">
                  <div style="font-size:13px;font-weight:600;color:#0F172A;margin-bottom:14px;">KPI Weights</div>
                  <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:20px;">
                    <button v-for="name in Object.keys(WEIGHT_PRESETS)" :key="name" @click="applyPreset(name)"
                      :style="`padding:6px 14px;border-radius:20px;border:1.5px solid ${activePreset===name?'#3B82F6':'#E2E8F0'};background:${activePreset===name?'#EFF6FF':'white'};color:${activePreset===name?'#1D4ED8':'#475569'};font-size:12px;font-weight:${activePreset===name?600:400};cursor:pointer;`">
                      {{ name }}
                    </button>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:16px;">
                    <div v-for="ws in WEIGHT_SLIDERS" :key="ws.key">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <div>
                          <span style="font-size:13px;font-weight:500;color:#0F172A;">{{ ws.label }}</span>
                          <span style="font-size:11px;color:#94A3B8;margin-left:8px;">{{ ws.hint }}</span>
                        </div>
                        <div style="background:#EFF6FF;border-radius:5px;padding:2px 12px;font-size:13px;font-weight:700;color:#1D4ED8;min-width:46px;text-align:center;">{{ (weights as Record<string,number>)[ws.key] }}%</div>
                      </div>
                      <input type="range" :min="5" :max="80" :value="(weights as Record<string,number>)[ws.key]" @input="updateWeight(ws.key, ($event.target as HTMLInputElement).valueAsNumber)" style="width:100%;"/>
                    </div>
                  </div>
                </div>
                <!-- SKU Tiers -->
                <div v-for="tier in SKU_TIERS" :key="tier.field" style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:16px 20px;">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                    <div :style="`width:8px;height:8px;border-radius:50%;background:${tier.color};flex-shrink:0;`"></div>
                    <div style="font-size:13px;font-weight:600;color:#0F172A;">{{ tier.label }}</div>
                  </div>
                  <div style="font-size:12px;color:#64748B;margin-bottom:12px;">{{ tier.desc }}</div>
                  <div style="display:flex;flex-wrap:wrap;gap:6px;">
                    <button v-for="s in store.skus.filter(sk=>poolIds.includes(sk.id))" :key="s.id"
                      @click="toggleTier(tier.field, s.id)"
                      :disabled="isUsedElsewhere(tier.field, s.id) && !objConfig[tier.field]?.includes(s.id)"
                      :style="`display:flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;border:1.5px solid ${objConfig[tier.field]?.includes(s.id)?tier.border:'#E2E8F0'};background:${objConfig[tier.field]?.includes(s.id)?tier.bg:'white'};color:${objConfig[tier.field]?.includes(s.id)?tier.color:'#475569'};font-size:11px;font-weight:${objConfig[tier.field]?.includes(s.id)?600:400};cursor:${(isUsedElsewhere(tier.field,s.id)&&!objConfig[tier.field]?.includes(s.id))?'not-allowed':'pointer'};opacity:${(isUsedElsewhere(tier.field,s.id)&&!objConfig[tier.field]?.includes(s.id))?0.4:1};transition:all 0.12s;`">
                      <div :style="`width:6px;height:6px;border-radius:50%;background:${s.color};flex-shrink:0;`"></div>
                      {{ s.name }}
                      <X v-if="objConfig[tier.field]?.includes(s.id)" :size="10" :color="tier.color"/>
                    </button>
                  </div>
                </div>
                <!-- Brand blocking + category caps -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                  <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:16px 18px;">
                    <div style="font-size:13px;font-weight:600;color:#0F172A;margin-bottom:4px;">Brand Arrangement</div>
                    <div style="font-size:11px;color:#64748B;margin-bottom:12px;">How should same-brand SKUs be grouped?</div>
                    <label v-for="[val,lbl] in [['free','Free placement'],['block','Block by brand'],['category','Block by category']]" :key="val"
                      style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer;">
                      <input type="radio" name="blocking" :value="val" v-model="objConfig.brandBlocking" style="accent-color:#3B82F6;"/>
                      <span style="font-size:12px;color:#334155;">{{ lbl }}</span>
                    </label>
                  </div>
                  <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:16px 18px;">
                    <div style="font-size:13px;font-weight:600;color:#0F172A;margin-bottom:4px;">Category Caps</div>
                    <div style="font-size:11px;color:#64748B;margin-bottom:12px;">Max % of shelf per category</div>
                    <div v-for="cat in poolCats" :key="cat" style="margin-bottom:10px;">
                      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span style="font-size:12px;color:#334155;">{{ cat }}</span>
                        <span style="font-size:12px;font-weight:600;color:#1D4ED8;">{{ objConfig.categoryCaps[cat]||50 }}%</span>
                      </div>
                      <input type="range" min="10" max="80" :value="objConfig.categoryCaps[cat]||50"
                        @input="objConfig.categoryCaps = {...objConfig.categoryCaps, [cat]: ($event.target as HTMLInputElement).valueAsNumber}" style="width:100%;"/>
                    </div>
                  </div>
                </div>
                <!-- Business context toggles -->
                <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:16px 20px;">
                  <div style="font-size:13px;font-weight:600;color:#0F172A;margin-bottom:12px;">Business Context</div>
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    <div v-for="ct in CONTEXT_TOGGLES" :key="ct.field"
                      :style="`display:flex;align-items:center;gap:12px;padding:10px 14px;border:1px solid ${objConfig[ct.field]?'#BFDBFE':'#F1F5F9'};border-radius:9px;background:${objConfig[ct.field]?'#EFF6FF':'#FAFAFA'};cursor:pointer;transition:all 0.12s;`"
                      @click="objConfig[ct.field]=!objConfig[ct.field]">
                      <div :style="`width:36px;height:20px;border-radius:10px;background:${objConfig[ct.field]?'#3B82F6':'#E2E8F0'};position:relative;flex-shrink:0;transition:all 0.2s;`">
                        <div :style="`position:absolute;top:2px;left:${objConfig[ct.field]?18:2}px;width:16px;height:16px;border-radius:50%;background:white;transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2);`"></div>
                      </div>
                      <div>
                        <div :style="`font-size:12px;font-weight:600;color:${objConfig[ct.field]?'#1D4ED8':'#334155'};`">{{ ct.label }}</div>
                        <div style="font-size:11px;color:#94A3B8;">{{ ct.desc }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- OBJECTIVE CHAT MODE -->
              <div v-if="objMode==='chat'">
                <div v-if="!objChatStarted" style="background:#0F172A;border-radius:12px;padding:36px 28px;text-align:center;min-height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;">
                  <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#3B82F6,#7C3AED);display:flex;align-items:center;justify-content:center;"><Sparkles :size="24" color="white"/></div>
                  <div>
                    <div style="font-size:16px;font-weight:700;color:white;margin-bottom:6px;">Configure with AI</div>
                    <div style="font-size:13px;color:#64748B;max-width:380px;">Answer a few questions in plain business language. The AI will translate your answers into planogram configuration inputs automatically.</div>
                  </div>
                  <button @click="startObjChat" style="background:linear-gradient(135deg,#3B82F6,#7C3AED);color:white;border:none;border-radius:8px;padding:10px 24px;font-size:13px;font-weight:600;cursor:pointer;margin-top:8px;">Start conversation →</button>
                </div>
                <div v-else style="background:#0F172A;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;height:480px;">
                  <div style="padding:12px 16px;border-bottom:1px solid #1E293B;display:flex;align-items:center;gap:8px;">
                    <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#3B82F6,#7C3AED);display:flex;align-items:center;justify-content:center;"><Sparkles :size="12" color="white"/></div>
                    <div>
                      <div style="font-size:12px;font-weight:600;color:white;">Planogram AI Assistant</div>
                      <div style="font-size:10px;color:#475569;">Configuring objective for {{ poolIds.length }} SKUs</div>
                    </div>
                    <div v-if="objChatReady" style="margin-left:auto;background:#10B981;color:white;border-radius:4px;padding:3px 9px;font-size:10px;font-weight:600;">Ready ✓</div>
                  </div>
                  <div ref="objChatScrollRef" style="flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px;">
                    <div v-for="(m,i) in objChatMessages" :key="i" :style="`display:flex;justify-content:${m.role==='user'?'flex-end':'flex-start'};`">
                      <div :style="`max-width:82%;padding:9px 13px;border-radius:${m.role==='user'?'12px 12px 2px 12px':'12px 12px 12px 2px'};background:${m.role==='user'?'#3B82F6':'#1E293B'};color:white;font-size:13px;line-height:1.55;`">{{ m.content }}</div>
                    </div>
                    <div v-if="objChatLoading" style="display:flex;justify-content:flex-start;">
                      <div style="background:#1E293B;border-radius:12px 12px 12px 2px;padding:10px 14px;display:flex;gap:5px;align-items:center;">
                        <div v-for="i in 3" :key="i" :style="`width:6px;height:6px;border-radius:50%;background:#3B82F6;opacity:${0.4+i*0.3};`"></div>
                      </div>
                    </div>
                  </div>
                  <div style="padding:10px 12px;border-top:1px solid #1E293B;display:flex;gap:8px;">
                    <input v-model="objChatInput" @keydown.enter="objChatInput.trim()&&!objChatLoading ? sendObjChat(objChatInput) : null"
                      :placeholder="objChatReady?'Type anything to refine further…':'Type your answer…'" :disabled="objChatLoading"
                      style="flex:1;background:#1E293B;border:1px solid #334155;border-radius:8px;padding:9px 13px;font-size:13px;color:white;outline:none;"/>
                    <button @click="objChatInput.trim()&&!objChatLoading ? sendObjChat(objChatInput) : null"
                      :disabled="objChatLoading||!objChatInput.trim()"
                      :style="`background:#3B82F6;color:white;border:none;border-radius:8px;padding:9px 14px;font-size:13px;font-weight:600;cursor:${objChatLoading||!objChatInput.trim()?'not-allowed':'pointer'};opacity:${objChatLoading||!objChatInput.trim()?0.5:1};`">Send</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Objective preview -->
            <div style="position:sticky;top:80px;">
              <div style="background:#0F172A;border-radius:12px;padding:18px 16px;margin-bottom:12px;">
                <div style="font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:14px;">Objective preview</div>
                <div v-for="wd in WEIGHT_DISPLAY" :key="wd.key" style="margin-bottom:10px;">
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span style="font-size:12px;color:#94A3B8;">{{ wd.label }}</span>
                    <span style="font-size:12px;font-weight:700;color:white;">{{ (weights as Record<string,number>)[wd.key] }}%</span>
                  </div>
                  <div style="height:5px;background:#1E293B;border-radius:3px;overflow:hidden;">
                    <div :style="`height:100%;width:${(weights as Record<string,number>)[wd.key]}%;background:${wd.color};border-radius:3px;transition:width 0.4s;`"></div>
                  </div>
                </div>
              </div>
              <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:14px;">
                <div style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:12px;">Configured inputs</div>
                <template v-for="tm in SKU_TIER_META" :key="tm.field">
                  <div v-if="objConfig[tm.field]?.length" style="margin-bottom:10px;">
                    <div style="font-size:10px;font-weight:600;color:#94A3B8;margin-bottom:4px;">{{ tm.label }}</div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;">
                      <span v-for="id in objConfig[tm.field]" :key="id"
                        :style="`display:flex;align-items:center;gap:3px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:4px;padding:2px 7px;font-size:10px;color:${tm.color};font-weight:500;`">
                        <div :style="`width:5px;height:5px;border-radius:50%;background:${store.skus.find(s=>s.id===id)?.color};`"></div>
                        {{ store.skus.find(s=>s.id===id)?.name.split(' ').slice(0,2).join(' ') }}
                      </span>
                    </div>
                  </div>
                </template>
                <div v-if="objConfig.rsmMode" style="font-size:11px;color:#1D4ED8;font-weight:500;margin-top:6px;">✓ RSM Visit Mode on</div>
                <div v-if="objConfig.competitorCounter" style="font-size:11px;color:#1D4ED8;font-weight:500;margin-top:4px;">✓ Competitor Counter on</div>
                <div v-if="objConfig.brandBlocking!=='free'" style="font-size:11px;color:#475569;margin-top:6px;">Blocks: {{ objConfig.brandBlocking }}</div>
                <div v-if="!hasAnyInputs" style="font-size:12px;color:#CBD5E1;text-align:center;padding:12px 0;">No inputs configured yet</div>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 4: Generate/Candidates -->
        <div v-if="step===4">
          <!-- Generating spinner -->
          <div v-if="generating" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 0;gap:20px;">
            <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#3B82F6,#7C3AED);display:flex;align-items:center;justify-content:center;"><Sparkles :size="28" color="white"/></div>
            <div style="text-align:center;">
              <div style="font-size:20px;font-weight:700;color:#0F172A;margin-bottom:8px;">Generating planogram configurations…</div>
              <div style="font-size:14px;color:#64748B;">Analysing {{ poolIds.length }} SKUs · Applying business rules · Optimising for your objective</div>
            </div>
          </div>
          <!-- Candidates -->
          <div v-else-if="candidates">
            <div style="margin-bottom:24px;">
              <div style="font-size:22px;font-weight:700;color:#0F172A;margin-bottom:8px;">Choose your starting point</div>
              <div style="font-size:14px;color:#64748B;">3 configurations generated · <strong>{{ selectedAsset?.name }}</strong> · {{ poolIds.length }} SKUs · Revenue {{ weights.revenue }}% / SOS {{ weights.sos }}% / Compliance {{ weights.compliance }}%</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;">
              <div v-for="c in candidates" :key="c.id"
                :style="`border:2px solid ${c.recommended?'#3B82F6':'#E2E8F0'};border-radius:14px;overflow:hidden;background:white;display:flex;flex-direction:column;box-shadow:${c.recommended?'0 0 0 3px #BFDBFE, 0 4px 20px rgba(59,130,246,0.12)':'0 1px 4px rgba(15,23,42,0.06)'};`">
                <div style="padding:16px 18px 12px;border-bottom:1px solid #F1F5F9;">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
                    <div style="font-size:14px;font-weight:700;color:#0F172A;">{{ c.label }}</div>
                    <span v-if="c.recommended" style="font-size:10px;background:#EFF6FF;color:#1D4ED8;border-radius:4px;padding:3px 8px;font-weight:700;">★ Recommended</span>
                  </div>
                  <div style="font-size:12px;color:#64748B;">{{ c.desc }}</div>
                </div>
                <!-- Mini shelf preview -->
                <div style="padding:12px 18px;background:#F8FAFC;border-bottom:1px solid #F1F5F9;">
                  <div style="font-size:10px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:7px;">Shelf layout preview</div>
                  <div style="background:#1E293B;border-radius:6px;padding:5px 4px;margin:10px 0;">
                    <div v-for="(row,ri) in c.placements" :key="ri" :style="`display:flex;gap:1.5px;margin-bottom:${(ri as number)<c.placements.length-1?'2.5':'0'}px;`">
                      <div v-for="(id,ci) in row" :key="ci"
                        :style="`flex:1;height:9px;border-radius:1.5px;background:${id?store.skus.find(s=>s.id===id)?.color||'#334155':'#334155'};opacity:${id?0.88:0.25};`"></div>
                    </div>
                  </div>
                  <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;">
                    <span v-for="id in ([...new Set((c.placements||[]).flat().filter(Boolean))] as number[]).slice(0,5)" :key="id"
                      style="display:flex;align-items:center;gap:3px;font-size:9px;color:#64748B;">
                      <div :style="`width:6px;height:6px;border-radius:2px;background:${store.skus.find(s=>s.id===id)?.color};`"></div>
                      {{ store.skus.find(s=>s.id===id)?.brand }}
                    </span>
                  </div>
                </div>
                <!-- Scores -->
                <div style="padding:12px 18px;">
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                    <div style="background:#F8FAFC;border-radius:8px;padding:10px 12px;">
                      <div style="font-size:24px;font-weight:800;color:#0F172A;">{{ c.totalScore }}</div>
                      <div style="font-size:10px;color:#94A3B8;margin-top:1px;">Overall score</div>
                    </div>
                    <div :style="`background:${c.revenueIndex>=0?'#F0FDF4':'#FEF2F2'};border-radius:8px;padding:10px 12px;`">
                      <div :style="`font-size:24px;font-weight:800;color:${c.revenueIndex>=0?'#059669':'#DC2626'};`">{{ c.revenueIndex>=0?'+':'' }}{{ Math.max(-20,c.revenueIndex) }}%</div>
                      <div style="font-size:10px;color:#94A3B8;margin-top:1px;">Revenue index</div>
                    </div>
                  </div>
                  <div v-for="sc in [{label:'SOS fill',val:c.sosScore,color:'#3B82F6'},{label:'Compliance',val:c.complianceScore,color:'#8B5CF6'},{label:'Eye-level',val:c.eyeLevelScore,color:'#F59E0B'}]" :key="sc.label"
                    style="display:flex;align-items:center;gap:8px;margin-bottom:7px;">
                    <div style="font-size:11px;color:#64748B;width:70px;flex-shrink:0;">{{ sc.label }}</div>
                    <div style="flex:1;height:5px;background:#F1F5F9;border-radius:3px;overflow:hidden;">
                      <div :style="`height:100%;width:${sc.val}%;background:${sc.color};border-radius:3px;`"></div>
                    </div>
                    <div style="font-size:11px;font-weight:600;color:#334155;min-width:26px;text-align:right;">{{ sc.val }}</div>
                  </div>
                </div>
                <div style="padding:14px 18px;border-top:1px solid #F1F5F9;margin-top:auto;">
                  <button @click="handleSelect(c)"
                    :style="`width:100%;background:${c.recommended?'linear-gradient(135deg,#3B82F6,#7C3AED)':'#0F172A'};color:white;border:none;border-radius:8px;padding:11px 0;font-size:13px;font-weight:600;cursor:pointer;`">
                    Use this layout →
                  </button>
                </div>
              </div>
            </div>
            <div style="text-align:center;">
              <button @click="step=3" style="background:transparent;border:none;cursor:pointer;font-size:13px;color:#64748B;text-decoration:underline;">← Adjust objective and regenerate</button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ===== STICKY FOOTER (form mode, steps 1-3) ===== -->
    <div v-if="generatorMode==='form'&&step<4" style="background:white;border-top:1px solid #E2E8F0;padding:14px 28px;display:flex;align-items:center;gap:10px;">
      <button @click="step===1 ? router.push('/configs') : step--"
        style="background:transparent;border:1px solid #E2E8F0;border-radius:7px;padding:9px 20px;font-size:13px;font-weight:500;cursor:pointer;color:#475569;">
        {{ step===1 ? 'Cancel' : '← Back' }}
      </button>
      <div style="margin-left:auto;">
        <button v-if="step===3" @click="handleGenerate"
          style="display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,#3B82F6,#7C3AED);color:white;border:none;border-radius:8px;padding:11px 28px;font-size:14px;font-weight:700;cursor:pointer;">
          <Sparkles :size="15"/> Generate 3 Planograms
        </button>
        <button v-else @click="step++" :disabled="!canNext"
          :style="`background:${canNext?'#0F172A':'#E2E8F0'};color:${canNext?'white':'#94A3B8'};border:none;border-radius:8px;padding:11px 28px;font-size:14px;font-weight:600;cursor:${canNext?'pointer':'not-allowed'};`">
          Continue →
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Sparkles, ChevronLeft, Check, X, CheckCircle } from 'lucide-vue-next'
import { usePlanogramStore } from '~/stores/planogram'

definePageMeta({ layout: 'default' })

const store = usePlanogramStore()
const router = useRouter()

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Asset', 'SKU Pool', 'Objective', 'Generate']
const CATS = [...new Set(store.skus.map(s => s.cat))]

const ASSET_CAT_MAP: Record<string, string[]> = {
  'Visicooler': ['Lager', 'Premium', 'Light'],
  'Gondola':    ['Lager', 'Strong', 'Radler'],
  'End Cap':    ['Lager', 'Premium'],
  'Counter':    ['Premium', 'Radler'],
  'Rack':       ['Strong', 'Lager', 'Draught', 'N/A'],
  'Shelf':      ['Draught', 'N/A', 'Radler'],
}

const WEIGHT_PRESETS: Record<string, Record<string,number>> = {
  'Balanced':     { revenue:25, sos:25, compliance:25, eyeLevel:25 },
  'Launch Mode':  { revenue:15, sos:50, compliance:20, eyeLevel:15 },
  'Audit Ready':  { revenue:15, sos:15, compliance:55, eyeLevel:15 },
  'Revenue Push': { revenue:55, sos:20, compliance:15, eyeLevel:10 },
}

const WEIGHT_DISPLAY = [
  { key:'revenue',    label:'Revenue',    color:'#10B981' },
  { key:'sos',        label:'SOS',        color:'#3B82F6' },
  { key:'compliance', label:'Compliance', color:'#8B5CF6' },
  { key:'eyeLevel',   label:'Eye-Level',  color:'#F59E0B' },
]

const WEIGHT_SLIDERS = [
  { key:'revenue',    label:'Revenue Uplift',    hint:'High-velocity, high-margin placement' },
  { key:'sos',        label:'UB SOS',            hint:'Maximise KF/Heineken shelf share' },
  { key:'compliance', label:'Compliance',        hint:'Mandatory SKUs and facing rules' },
  { key:'eyeLevel',   label:'Eye-Level Premium', hint:'Prime zone for brand-building SKUs' },
]

const SKU_TIERS = [
  { field:'mandatoryIds', label:'Mandatory SKUs',          desc:'Must be placed. Eye-level first. Validation error if missing.',  color:'#EF4444', bg:'#FEF2F2', border:'#FECDD3' },
  { field:'eyeLevelIds',  label:'Eye-Level Heroes',        desc:'Must appear specifically at eye level. Preferred over standard.', color:'#F59E0B', bg:'#FFFBEB', border:'#FDE68A' },
  { field:'newLaunchIds', label:'New Launch SKUs',         desc:'Recently launched. Gets priority zone + automatic facing boost.', color:'#3B82F6', bg:'#EFF6FF', border:'#BFDBFE' },
  { field:'priorityIds',  label:'Priority SKUs',           desc:'Preferred placement. Not mandatory — no validation error.',       color:'#8B5CF6', bg:'#F5F3FF', border:'#DDD6FE' },
  { field:'excludedIds',  label:'Exclude from planogram',  desc:'Supply issue, regional or seasonal restriction.',                color:'#94A3B8', bg:'#F8FAFC', border:'#E2E8F0' },
]

const SKU_TIER_META = SKU_TIERS.map(({ field, label, color, bg }) => ({ field, label, color, bg }))

const CONTEXT_TOGGLES = [
  { field:'rsmMode',          label:'RSM Visit Mode',     desc:'Forces all mandatory + priority SKUs to eye level. Max facings on heroes.' },
  { field:'competitorCounter', label:'Counter Competitor', desc:'Boosts KF/Heineken hero SKUs in zones where competitor presence is high.' },
]

const QUICK_STARTS = [
  'New launch — KF Ultra needs strong visibility',
  'RSM visit next week — need full compliance',
  'Counter competitor gaining shelf space',
  'Seasonal push — premium lager priority',
]

// ─── State ────────────────────────────────────────────────────────────────────

const step = ref(1)
const generatorMode = ref('form')
const selectedAsset = ref<any>(null)
const selectedCats = reactive<Record<string,boolean>>({})
const weights = ref({ revenue:35, sos:30, compliance:20, eyeLevel:15 })
const activePreset = ref<string|null>(null)
const mustHaveIds = ref(store.skus.filter(s => s.mandatory).map(s => s.id))
const objMode = ref('form')
const objConfig = reactive<Record<string,any>>({
  mandatoryIds:      store.skus.filter(s => s.mandatory).map(s => s.id),
  eyeLevelIds:       [],
  newLaunchIds:      [],
  priorityIds:       [],
  excludedIds:       [],
  brandBlocking:     'block',
  categoryCaps:      {},
  rsmMode:           false,
  competitorCounter: false,
})
const candidates = ref<any[]|null>(null)
const generating = ref(false)

// Obj chat
const objChatStarted = ref(false)
const objChatMessages = ref<{role:string,content:string}[]>([])
const objChatInput = ref('')
const objChatLoading = ref(false)
const objChatReady = ref(false)
const objChatScrollRef = ref<HTMLElement|null>(null)

// Full chat
const fullChatStarted = ref(false)
const fullChatMessages = ref<{role:string,content:string}[]>([])
const fullChatInput = ref('')
const fullChatLoading = ref(false)
const fullChatReady = ref(false)
const fullChatScrollRef = ref<HTMLElement|null>(null)

// ─── Computed ─────────────────────────────────────────────────────────────────

const poolIds = computed(() => {
  const ids = new Set<number>()
  store.skus.forEach(s => { if (selectedCats[s.cat]) ids.add(s.id) })
  return [...ids]
})

const poolCats = computed(() => [...new Set(store.skus.filter(s => poolIds.value.includes(s.id)).map(s => s.cat))])

const canNext = computed(() => {
  if (step.value === 1) return !!selectedAsset.value
  if (step.value === 2) return poolIds.value.length > 0
  return true
})

const hasAnyInputs = computed(() =>
  ['mandatoryIds','eyeLevelIds','newLaunchIds','priorityIds','excludedIds'].some(f => objConfig[f]?.length > 0)
  || objConfig.rsmMode || objConfig.competitorCounter
)

// ─── Methods ──────────────────────────────────────────────────────────────────

function selectAsset(asset: any) {
  selectedAsset.value = asset
  const sug = ASSET_CAT_MAP[asset.type] || []
  CATS.forEach(cat => { selectedCats[cat] = sug.includes(cat) })
}

function updateWeight(key: string, newVal: number) {
  newVal = Math.max(5, Math.min(80, Number(newVal)))
  const others = ['revenue','sos','compliance','eyeLevel'].filter(k => k !== key)
  const rem = 100 - newVal
  const tot = others.reduce((s, k) => s + weights.value[k as keyof typeof weights.value], 0)
  const nw = { ...weights.value, [key]: newVal }
  if (tot > 0) {
    others.forEach(k => { (nw as any)[k] = Math.round((weights.value as any)[k] / tot * rem) })
  } else {
    const sh = Math.floor(rem / others.length)
    others.forEach(k => { (nw as any)[k] = sh })
  }
  const sum = Object.values(nw).reduce((s, v) => s + (v as number), 0)
  if (sum !== 100) (nw as any)[others[0]] += 100 - sum
  weights.value = nw as any
  activePreset.value = null
}

function applyPreset(name: string) {
  weights.value = { ...WEIGHT_PRESETS[name] } as any
  activePreset.value = name
}

function toggleTier(field: string, id: number) {
  const others = ['mandatoryIds','eyeLevelIds','newLaunchIds','priorityIds','excludedIds'].filter(f => f !== field)
  if (others.some(f => objConfig[f]?.includes(id)) && !objConfig[field]?.includes(id)) return
  if (objConfig[field]?.includes(id)) {
    objConfig[field] = objConfig[field].filter((x: number) => x !== id)
  } else {
    objConfig[field] = [...(objConfig[field] || []), id]
  }
}

function isUsedElsewhere(field: string, id: number): boolean {
  return ['mandatoryIds','eyeLevelIds','newLaunchIds','priorityIds','excludedIds']
    .filter(f => f !== field)
    .some(f => objConfig[f]?.includes(id))
}

// ─── Generation algorithm ─────────────────────────────────────────────────────

function buildPlacements(mandatorySKUs: any[], sortedOptional: any[], rows: number, cols: number, getFacings: (s:any)=>number, categoryCaps: Record<string,number>) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null))
  const caps = categoryCaps || {}
  const totalSlots = rows * cols
  const catCount: Record<string,number> = {}
  let col = 0
  for (const sku of mandatorySKUs) {
    const f = Math.min(getFacings(sku), cols - col)
    for (let i = 0; i < f && col < cols; i++, col++) {
      grid[0][col] = sku.id
      catCount[sku.cat] = (catCount[sku.cat] || 0) + 1
    }
  }
  let qi = 0
  const placed: Record<number,number> = {}
  for (let r = 0; r < rows; r++) {
    for (let c = (r === 0 ? col : 0); c < cols; c++) {
      while (qi < sortedOptional.length) {
        const sku = sortedOptional[qi]
        const cap = caps[sku.cat]
        const catPct = ((catCount[sku.cat] || 0) + 1) / totalSlots * 100
        if (!cap || catPct <= cap) break
        qi++
      }
      if (qi >= sortedOptional.length) break
      const sku = sortedOptional[qi]
      grid[r][c] = sku.id
      catCount[sku.cat] = (catCount[sku.cat] || 0) + 1
      placed[sku.id] = (placed[sku.id] || 0) + 1
      if (placed[sku.id] >= getFacings(sku)) qi++
    }
  }
  return grid
}

function scoreCandidate(placements: any[][], w: any, mustHaveIdsList: number[]) {
  const ZONE = [1.4, 1.15, 1.0, 0.8, 0.6]
  const flat = placements.flat().filter(Boolean)
  const total = placements.flat().length
  const placedSet = new Set(flat)
  let revRaw = 0
  placements.forEach((row, ri) => row.forEach(id => {
    const s = store.skus.find(x => x.id === id)
    if (s) revRaw += s.defaultF * ZONE[Math.min(ri, 4)]
  }))
  const revenueScore = Math.min(100, Math.round(revRaw * 2.8))
  const sosScore = Math.round((flat.length / total) * 100)
  const missing = mustHaveIdsList.filter(id => !placedSet.has(id)).length
  const complianceScore = Math.max(0, 100 - missing * 20)
  const eyeRow = placements[0] || []
  const eyeLevelScore = Math.min(100, Math.round(eyeRow.filter(Boolean).length / eyeRow.length * 100))
  const totalScore = Math.round(w.revenue * revenueScore / 100 + w.sos * sosScore / 100 + w.compliance * complianceScore / 100 + w.eyeLevel * eyeLevelScore / 100)
  const revenueIndex = Math.max(-20, Math.round((revRaw / 28 - 1) * 100))
  return { totalScore, revenueScore, sosScore, complianceScore, eyeLevelScore, revenueIndex }
}

function generateCandidatesLocal(poolIdsList: number[], w: any, mustHaveIdsList: number[], config: any, objCfg: any) {
  const rows = Math.min(config.shelvesPerRack || 5, 5)
  const cols = Math.min(config.maxSKU || 6, 7)
  const obj = objCfg || {}
  const pool = store.skus.filter(s => poolIdsList.includes(s.id))
  const mandatory = pool.filter(s => mustHaveIdsList.includes(s.id))
  const newLaunchSet = new Set(obj.newLaunchIds || [])
  const getFacings = (sku: any) => sku.defaultF + (newLaunchSet.has(sku.id) ? 1 : 0) + (obj.rsmMode && (obj.eyeLevelIds || []).includes(sku.id) ? 1 : 0)
  const optional = pool.filter(s => !mustHaveIdsList.includes(s.id))
  const applyBlocking = (arr: any[]) => {
    if (obj.brandBlocking === 'block') {
      const brands: Record<string,any[]> = {}
      arr.forEach(s => { if (!brands[s.brand]) brands[s.brand] = []; brands[s.brand].push(s) })
      return Object.values(brands).flat()
    }
    if (obj.brandBlocking === 'category') {
      const cats: Record<string,any[]> = {}
      arr.forEach(s => { if (!cats[s.cat]) cats[s.cat] = []; cats[s.cat].push(s) })
      return Object.values(cats).flat()
    }
    return arr
  }
  const byRevenue = applyBlocking([...optional].sort((a, b) => (b.defaultF * (b.w + b.h)) - (a.defaultF * (a.w + a.h))))
  const bySOS = applyBlocking([...optional].sort((a, b) => b.defaultF - a.defaultF))
  const byCompliance = applyBlocking([...optional].sort((a, b) => (b.minF - a.minF) || (b.defaultF - a.defaultF)))
  const pA = buildPlacements(mandatory, byRevenue, rows, cols, getFacings, obj.categoryCaps || {})
  const pB = buildPlacements(mandatory, bySOS, rows, cols, getFacings, obj.categoryCaps || {})
  const pC = buildPlacements(mandatory, byCompliance, rows, cols, getFacings, obj.categoryCaps || {})
  const result = [
    { id:'A', label:'Revenue Optimized',  desc:'High-velocity SKUs placed at prime zones',    placements:pA, ...scoreCandidate(pA, w, mustHaveIdsList) },
    { id:'B', label:'SOS Optimized',      desc:'Maximum UB brand range visibility',            placements:pB, ...scoreCandidate(pB, w, mustHaveIdsList) },
    { id:'C', label:'Compliance Focused', desc:'All mandatory rules and SKUs satisfied',       placements:pC, ...scoreCandidate(pC, w, mustHaveIdsList) },
  ]
  const best = result.reduce((a, b) => a.totalScore > b.totalScore ? a : b)
  result.forEach(c => { (c as any).recommended = c.id === best.id })
  return result
}

function handleGenerate() {
  generating.value = true
  candidates.value = null
  step.value = 4
  const cfg = { shelvesPerRack: selectedAsset.value?.shelves || 5, maxSKU: 6, rackCount: 2 }
  const effectivePool = poolIds.value.filter(id => !objConfig.excludedIds.includes(id))
  const allMandatory = [...new Set([...objConfig.mandatoryIds, ...objConfig.eyeLevelIds])] as number[]
  setTimeout(() => {
    candidates.value = generateCandidatesLocal(effectivePool, weights.value, allMandatory, cfg, objConfig)
    generating.value = false
  }, 1800)
}

function triggerGenerate() {
  handleGenerate()
  generatorMode.value = 'form'
}

function handleSelect(_c: any) {
  router.push('/workspace')
}

// ─── Objective chat ───────────────────────────────────────────────────────────

function plannerPrompt() {
  const poolNames = store.skus.filter(s => poolIds.value.includes(s.id)).map(s => s.name).join(', ')
  const w = weights.value
  const skuMap = JSON.stringify(Object.fromEntries(store.skus.map(s => [s.name, s.id])))
  return `You are a planogram objective assistant for United Breweries' modern trade merchandising platform. Your job: gather planogram configuration inputs through a focused, friendly conversation.

SKUs available in this planogram's pool: ${poolNames}
Current KPI weights: Revenue ${w.revenue}%, SOS ${w.sos}%, Compliance ${w.compliance}%, Eye-Level ${w.eyeLevel}%

Collect these inputs through conversation:
1. Business goal / context (new launch? RSM visit? counter competitor? seasonal push?)
2. Mandatory SKUs — must be placed, eye-level priority, validation error if missing
3. Eye-Level Heroes — must appear specifically at row 0 (eye level)
4. New Launch SKUs — recently launched, gets +1 facing boost and zone priority
5. Priority SKUs — preferred but not mandatory
6. Excluded SKUs — supply issue, regional, seasonal
7. Brand arrangement — should same brand be blocked together?

Rules:
- Ask ONE short question at a time
- Use business language, not technical terms
- Keep each response to 1-2 sentences + your question
- When you identify a config value, output on its own line exactly:
  CONFIG:{"field":"mandatoryIds","value":[1,2],"label":"Kingfisher Prem, Heineken 330ml"}
  Field names: mandatoryIds, eyeLevelIds, newLaunchIds, priorityIds, excludedIds, brandBlocking (free/block/category), rsmMode (true/false), competitorCounter (true/false)
  Values for *Ids fields must be arrays of SKU IDs from this map: ${skuMap}
- After 5-6 productive exchanges output: READY:true

Start by asking what the main business goal is for this planogram.`
}

function parseAndApplyObjConfig(text: string) {
  const configRe = /CONFIG:\{[^\n]+\}/g
  const actions = text.match(configRe) || []
  actions.forEach(a => {
    try {
      const data = JSON.parse(a.replace('CONFIG:', ''))
      if (data.field) objConfig[data.field] = data.value
    } catch {}
  })
  if (text.includes('READY:true')) objChatReady.value = true
  return text.replace(/CONFIG:\{[^\n]+\}/g, '').replace('READY:true', '').trim()
}

async function startObjChat() {
  objChatStarted.value = true
  await sendObjChatApi([{ role: 'user', content: "Let's start." }], true)
}

async function sendObjChat(userText: string) {
  if (!userText.trim()) return
  const history = [...objChatMessages.value]
  objChatMessages.value = [...history, { role: 'user', content: userText }]
  objChatInput.value = ''
  await sendObjChatApi([...history, { role: 'user', content: userText }], false)
}

async function sendObjChatApi(apiMessages: any[], _isInit: boolean) {
  objChatLoading.value = true
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 400, system: plannerPrompt(), messages: apiMessages })
    })
    const data = await res.json()
    const raw = data.content?.[0]?.text || 'Sorry, something went wrong. Please try again.'
    const clean = parseAndApplyObjConfig(raw)
    objChatMessages.value = [...objChatMessages.value, { role: 'assistant', content: clean }]
  } catch {
    objChatMessages.value = [...objChatMessages.value, { role: 'assistant', content: 'Connection issue — please try again.' }]
  }
  objChatLoading.value = false
  await nextTick()
  if (objChatScrollRef.value) objChatScrollRef.value.scrollTop = objChatScrollRef.value.scrollHeight
}

// ─── Full page chat ───────────────────────────────────────────────────────────

function fullChatSystemPrompt() {
  const assetList = store.assets.map(a => `${a.name}(id:${a.id},type:${a.type})`).join(', ')
  const skuList = store.skus.map(s => `${s.name}(id:${s.id},cat:${s.cat})`).join(', ')
  const w = weights.value
  return `You are an expert planogram configuration assistant for United Breweries' AI merchandising platform.
Your job is to configure a planogram through a friendly, focused conversation — asking one short question at a time.

Available assets: ${assetList}
Available SKUs: ${skuList}
Current KPI weights: Revenue ${w.revenue}%, SOS ${w.sos}%, Compliance ${w.compliance}%, Eye-Level ${w.eyeLevel}%

COLLECT THESE INPUTS (in order, one question per message):
1. Business context / goal
2. Which asset/fixture to use
3. Which SKU categories to include in the pool
4. Mandatory SKUs (must place, eye level first)
5. Eye-level hero SKUs
6. New launch SKUs (gets +1 facing boost)
7. Priority SKUs
8. Excluded SKUs
9. KPI priority adjustment
10. Brand arrangement preference (free / block by brand / block by category)
11. Any special flags (RSM visit mode, counter competitor)

RULES:
- Ask ONE question at a time — keep each response under 3 sentences
- Use plain business language
- When you've captured a value, output CONFIG action on its own line:
  CONFIG:{"field":"assetId","value":1}
  CONFIG:{"field":"mandatoryIds","value":[1,2,3]}
  Field reference: assetId (number), selectedCatKeys (array of category names from ["Lager","Strong","Premium","N/A","Draught","Light","Radler"]), mandatoryIds/eyeLevelIds/newLaunchIds/priorityIds/excludedIds (arrays of SKU IDs), weights ({revenue,sos,compliance,eyeLevel} summing to 100), brandBlocking ("free"|"block"|"category"), rsmMode/competitorCounter (boolean)
  SKU IDs: ${skuList}
- After collecting essential inputs (asset + pool + mandatory), output: READY:true
- If user says "generate", output: GENERATE:true

Start by warmly greeting the user and asking about the business context/goal for this planogram.`
}

function parseAndApplyFullConfig(text: string) {
  const configRe = /CONFIG:(\{[^\n]+\})/g
  let match
  while ((match = configRe.exec(text)) !== null) {
    try {
      const data = JSON.parse(match[1])
      Object.entries(data).forEach(([field, value]) => {
        if (field === 'assetId') {
          const asset = store.assets.find(a => a.id === value)
          if (asset) selectAsset(asset)
        } else if (field === 'selectedCatKeys') {
          ;(value as string[]).forEach(cat => { selectedCats[cat] = true })
        } else if (field === 'weights') {
          weights.value = value as any
        } else if (field in objConfig) {
          objConfig[field] = value
        }
      })
    } catch {}
  }
  if (text.includes('READY:true')) fullChatReady.value = true
  if (text.includes('GENERATE:true')) triggerGenerate()
  return text.replace(/CONFIG:(\{[^\n]+\})/g, '').replace('READY:true', '').replace('GENERATE:true', '').trim()
}

async function startFullChat(initialText: string|null) {
  fullChatStarted.value = true
  if (initialText) {
    fullChatMessages.value = [{ role: 'user', content: initialText }]
    await sendFullChatApi([{ role: 'user', content: initialText }])
  } else {
    await sendFullChatApi([{ role: 'user', content: 'start' }])
  }
}

async function sendFullChat(userText: string) {
  if (!userText.trim() || fullChatLoading.value) return
  const history = [...fullChatMessages.value]
  fullChatMessages.value = [...history, { role: 'user', content: userText }]
  fullChatInput.value = ''
  await sendFullChatApi([...history, { role: 'user', content: userText }])
}

async function sendFullChatApi(apiMessages: any[]) {
  fullChatLoading.value = true
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 500, system: fullChatSystemPrompt(), messages: apiMessages })
    })
    const data = await res.json()
    const raw = data.content?.[0]?.text || 'Sorry, I had trouble connecting. Please try again.'
    const clean = parseAndApplyFullConfig(raw)
    if (clean) fullChatMessages.value = [...fullChatMessages.value, { role: 'assistant', content: clean }]
  } catch {
    fullChatMessages.value = [...fullChatMessages.value, { role: 'assistant', content: 'Connection issue — please try again.' }]
  }
  fullChatLoading.value = false
  await nextTick()
  if (fullChatScrollRef.value) fullChatScrollRef.value.scrollTop = fullChatScrollRef.value.scrollHeight
}
</script>
