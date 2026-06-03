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
        <div v-if="!fullChatStarted" style="flex:1;overflow-y:auto;padding:28px 24px;">
          <div style="max-width:500px;margin:0 auto;">
            <div style="margin-bottom:20px;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#3B82F6,#7C3AED);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <Sparkles :size="14" color="white"/>
                </div>
                <div style="font-size:16px;font-weight:700;color:#0F172A;">What would you like to do?</div>
              </div>
              <div style="font-size:13px;color:#64748B;padding-left:42px;">Pick a category below or start from scratch.</div>
            </div>

            <!-- Accordion sections -->
            <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">
              <div v-for="sec in CHAT_SECTIONS" :key="sec.key"
                :style="`border:1px solid ${activeSection===sec.key?'#3B82F6':'#E2E8F0'};border-radius:10px;overflow:hidden;transition:border-color 0.15s;`">
                <!-- Header -->
                <button @click="activeSection=activeSection===sec.key?null:sec.key"
                  style="width:100%;display:flex;align-items:center;gap:10px;padding:11px 14px;background:white;border:none;cursor:pointer;text-align:left;"
                  :style="activeSection===sec.key?'background:#EFF6FF;':''">
                  <span style="font-size:16px;line-height:1;flex-shrink:0;">{{ sec.icon }}</span>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:600;color:#0F172A;">{{ sec.label }}</div>
                    <div style="font-size:11px;color:#94A3B8;margin-top:1px;">{{ sec.desc }}</div>
                  </div>
                  <ChevronDown :size="13" :style="`flex-shrink:0;color:#94A3B8;transition:transform 0.15s;transform:rotate(${activeSection===sec.key?'0':'−90'}deg)`"/>
                </button>
                <!-- Items -->
                <div v-if="activeSection===sec.key" style="border-top:1px solid #E2E8F0;">
                  <button v-for="item in sec.items" :key="item.prompt" @click="startFullChat(item.prompt)"
                    style="width:100%;display:flex;align-items:flex-start;gap:10px;padding:9px 14px;background:white;border:none;border-top:1px solid #F8FAFC;cursor:pointer;text-align:left;transition:background 0.1s;"
                    @mouseenter="($event.currentTarget as HTMLElement).style.background='#F8FAFC'"
                    @mouseleave="($event.currentTarget as HTMLElement).style.background='white'">
                    <span style="font-size:15px;line-height:1;flex-shrink:0;margin-top:1px;">{{ item.icon }}</span>
                    <div>
                      <div style="font-size:13px;font-weight:500;color:#334155;">{{ item.label }}</div>
                      <div style="font-size:11px;color:#94A3B8;margin-top:1px;">{{ item.hint }}</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <button @click="startFullChat(null)"
              style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:#0F172A;color:white;border:none;border-radius:9px;padding:12px;font-size:13px;font-weight:600;cursor:pointer;">
              <Sparkles :size="13"/> Start from scratch
            </button>
          </div>
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

              <!-- Sales signal nudge -->
              <div v-if="!salesNudgeDismissed && salesNudge.length > 0"
                style="display:flex;align-items:flex-start;gap:10px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:10px 12px;margin-bottom:14px;">
                <TrendingUp :size="14" color="#D97706" style="flex-shrink:0;margin-top:1px;"/>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:12px;font-weight:600;color:#92400E;margin-bottom:4px;">Sales signal — high performers not in your pool</div>
                  <div style="display:flex;flex-wrap:wrap;gap:6px;">
                    <button v-for="s in salesNudge" :key="s.cat"
                      @click="selectedCats[s.cat]=true;salesNudgeDismissed=true"
                      style="display:flex;align-items:center;gap:5px;background:white;border:1px solid #FCD34D;border-radius:5px;padding:3px 9px;font-size:11px;font-weight:600;color:#78350F;cursor:pointer;">
                      <div :style="`width:6px;height:6px;border-radius:50%;background:${s.color};`"></div>
                      {{ s.name }} · <span style="color:#D97706;">Add {{ s.cat }}</span>
                    </button>
                  </div>
                </div>
                <button @click="salesNudgeDismissed=true"
                  style="background:transparent;border:none;cursor:pointer;color:#D97706;padding:0;flex-shrink:0;">
                  <X :size="13"/>
                </button>
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
import { Sparkles, ChevronLeft, Check, X, CheckCircle, TrendingUp } from 'lucide-vue-next'
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

const CHAT_SECTIONS = [
  {
    key: 'build',
    icon: '🏗️',
    label: 'Build a new planogram',
    desc: 'AI guides you through fixture, SKU pool and objectives — config appears on the right',
    items: [
      { icon: '💰', label: 'Revenue push',           hint: 'Maximize margin on premium SKUs',                      prompt: 'Revenue push — maximize margin on premium SKUs' },
      { icon: '🚀', label: 'New product launch',     hint: 'KF Ultra needs strong shelf visibility',               prompt: 'New launch — KF Ultra needs strong shelf visibility' },
      { icon: '✅', label: 'RSM audit visit',        hint: 'Full compliance, mandatory SKUs at eye level',         prompt: 'RSM visit next week — full compliance, mandatory SKUs at eye level' },
      { icon: '⚔️', label: 'Counter competitor',     hint: 'Rival gaining shelf space in South region',            prompt: 'Counter competitor gaining shelf space in South region' },
    ],
  },
  {
    key: 'insights',
    icon: '📊',
    label: 'Get insights & analytics',
    desc: 'Ask about planogram performance, SKU coverage and compliance gaps',
    items: [
      { icon: '🏆', label: 'Top performing planograms',   hint: 'Ranked by compliance score and utilization',           prompt: 'What are my top performing planograms?' },
      { icon: '🔍', label: 'Missing high-value SKUs',     hint: 'Trending SKUs absent from active planograms',          prompt: 'Which high-performing SKUs are missing from my active planograms?' },
      { icon: '📍', label: 'Compliance by region',        hint: 'Compliance score overview across North/South/East/West', prompt: 'Show me compliance status across all regions' },
    ],
  },
  {
    key: 'edit',
    icon: '✏️',
    label: 'Edit or update a planogram',
    desc: 'Modify an existing layout, add SKUs or adjust facings',
    items: [
      { icon: '🔧', label: 'How to edit a planogram',       hint: 'Step-by-step guide to modifying an active layout',   prompt: 'How do I edit an existing planogram?' },
      { icon: '➕', label: 'Add a new SKU to a planogram',  hint: 'Walk me through adding a SKU to an existing layout', prompt: 'How do I add a new SKU to an existing planogram?' },
      { icon: '📐', label: 'Adjust SKU facings',            hint: 'Increase or decrease facing counts',                 prompt: 'How do I adjust SKU facings in a planogram?' },
    ],
  },
  {
    key: 'ask',
    icon: '💬',
    label: 'Ask a question',
    desc: 'Get answers about strategy, AI scoring or shelf best practices',
    items: [
      { icon: '🤖', label: 'How does AI scoring work?',          hint: 'Understand how the algorithm arranges SKUs',       prompt: 'How does the AI scoring algorithm work?' },
      { icon: '📦', label: 'Visicooler vs Gondola — which to use?', hint: 'When to use each fixture type',               prompt: 'What is the difference between a Visicooler and Gondola?' },
      { icon: '👁️', label: 'Eye-level placement best practices', hint: 'Which SKUs should go at eye level and why',      prompt: 'What are best practices for eye-level SKU placement?' },
    ],
  },
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
const salesNudgeDismissed = ref(false)

const salesNudge = computed(() =>
  store.skus.filter(s => s.trending && !selectedCats[s.cat])
    .filter((s, i, arr) => arr.findIndex(x => x.cat === s.cat) === i)
)

// Obj chat
const objChatStarted = ref(false)
const objChatMessages = ref<{role:string,content:string}[]>([])
const objChatInput = ref('')
const objChatLoading = ref(false)
const objChatReady = ref(false)
const objChatScrollRef = ref<HTMLElement|null>(null)
const objChatTurn = ref(0)

// Full chat
const fullChatStarted = ref(false)
const fullChatMessages = ref<{role:string,content:string}[]>([])
const fullChatInput = ref('')
const fullChatLoading = ref(false)
const fullChatReady = ref(false)
const fullChatScrollRef = ref<HTMLElement|null>(null)
const fullChatTurn = ref(0)
const activeSection = ref<string|null>(null)
const chatIntent = ref<'build'|'insights'|'edit'|'ask'>('build')

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

const OBJ_CHAT_SCRIPT = [
  { delay: 800,  msg: "What's the main business goal for this planogram — revenue push, RSM audit, new launch, or compliance?" },
  { delay: 1100, msg: "Revenue push — got it. I'll optimize for margin and sell-through. Should Kingfisher Prem 650ml and Heineken 330ml be mandatory must-haves placed at eye level?",
    apply: () => { objConfig.mandatoryIds = [1, 3]; objConfig.eyeLevelIds = [1, 3] } },
  { delay: 1000, msg: "KF Ultra 330ml is trending in recent sales data — not currently in the mandatory list but outperforming its category. Flag it as a new launch with a +1 facing boost?",
    apply: () => { objConfig.newLaunchIds = [5] } },
  { delay: 900,  msg: "Any SKUs to exclude — supply constraints, regional restrictions, seasonal delists? If nothing, I'll keep the full pool active.",
    apply: () => { objConfig.excludedIds = [] } },
  { delay: 1200, msg: "Setting KPI weights to Revenue 55%, SOS 20%, Compliance 15%, Eye-level 10%. Blocking same brands together on shelf — lifts brand visibility ~12%. Locking that in.",
    apply: () => { weights.value = { revenue: 55, sos: 20, compliance: 15, eyeLevel: 10 }; objConfig.brandBlocking = 'block' } },
  { delay: 1000, msg: "Objective configured. Mandatory heroes at eye level, KF Ultra boosted, revenue-first weights, brand blocking on. Ready to generate your planogram candidates.",
    ready: true },
]

async function startObjChat() {
  objChatStarted.value = true
  objChatTurn.value = 0
  await mockObjChatStep()
}

async function sendObjChat(userText: string) {
  if (!userText.trim()) return
  objChatMessages.value = [...objChatMessages.value, { role: 'user', content: userText }]
  objChatInput.value = ''
  await mockObjChatStep()
}

async function mockObjChatStep() {
  objChatLoading.value = true
  const turn = objChatTurn.value
  const script = OBJ_CHAT_SCRIPT[Math.min(turn, OBJ_CHAT_SCRIPT.length - 1)]
  await new Promise(r => setTimeout(r, script.delay))
  if (script.apply) script.apply()
  if (script.ready) objChatReady.value = true
  objChatMessages.value = [...objChatMessages.value, { role: 'assistant', content: script.msg }]
  objChatTurn.value = Math.min(turn + 1, OBJ_CHAT_SCRIPT.length - 1)
  objChatLoading.value = false
  await nextTick()
  if (objChatScrollRef.value) objChatScrollRef.value.scrollTop = objChatScrollRef.value.scrollHeight
}

// ─── Full page chat ───────────────────────────────────────────────────────────

const chatCtx = reactive({ goal: 'revenue', assetId: 1, assetName: 'Beer Cooler BC-6D', assetType: 'Visicooler' })

type FlowFn = (text: string) => { msg: string; apply?: () => void; ready?: boolean }

const CHAT_FLOW: FlowFn[] = [
  // 0: parse goal → ask fixture
  (text) => {
    let goal = 'revenue'
    let ack = "Revenue push — I'll optimize for margin and sell-through velocity."
    if (/launch|new.?product|introduc/i.test(text))  { goal = 'launch';     ack = "New launch — launch SKUs will get facing boosts and priority zones."        }
    else if (/rsm|visit/i.test(text))                { goal = 'rsm';        ack = "RSM visit mode on — mandatory SKUs get guaranteed eye-level placement."      }
    else if (/compli|audit/i.test(text))             { goal = 'compliance'; ack = "Compliance-first — I'll prioritize an audit-ready shelf arrangement."        }
    chatCtx.goal = goal
    return {
      msg: `${ack}\n\nWhich fixture are you building for?\n\n• Beer Cooler BC-6D — Visicooler, 6 shelves (North)\n• Gondola G-4S — 4 shelves (South)\n• End Cap EC-2 — 3 shelves (West)\n• Counter Display CD-1 — 2 shelves (East)\n• Rack R-6S — 6 shelves (North)`,
      apply: () => { if (goal === 'rsm') objConfig.rsmMode = true },
    }
  },
  // 1: parse fixture → confirm SKU pool
  (text) => {
    let id = 1; let name = 'Beer Cooler BC-6D'; let type = 'Visicooler'
    if (/gondola/i.test(text))        { id = 2; name = 'Gondola G-4S';         type = 'Gondola'  }
    else if (/end.?cap/i.test(text))  { id = 3; name = 'End Cap EC-2';         type = 'End Cap'  }
    else if (/counter/i.test(text))   { id = 4; name = 'Counter Display CD-1'; type = 'Counter'  }
    else if (/rack/i.test(text))      { id = 5; name = 'Rack R-6S';            type = 'Rack'     }
    chatCtx.assetId = id; chatCtx.assetName = name; chatCtx.assetType = type
    const cats = ASSET_CAT_MAP[type] || ['Lager', 'Premium']
    const count = store.skus.filter(s => cats.includes(s.cat)).length
    return {
      msg: `${name} — great choice for premium visibility. For a ${type}, I'm suggesting ${cats.join(', ')} as the SKU pool — ${count} SKUs to arrange.\n\nWant to add any other categories? Options: Draught, Radler, N/A. Or say "looks good" to continue.`,
      apply: () => { const a = store.assets.find(a => a.id === id); if (a) selectAsset(a) },
    }
  },
  // 2: handle pool additions → ask mandatory SKUs
  (text) => {
    const extra: string[] = []
    if (/draught/i.test(text))               extra.push('Draught')
    if (/radler/i.test(text))                extra.push('Radler')
    if (/n[\/.\\-]?a|non.?alc/i.test(text)) extra.push('N/A')
    const base = ASSET_CAT_MAP[chatCtx.assetType] || ['Lager', 'Premium']
    const count = store.skus.filter(s => [...base, ...extra].includes(s.cat)).length
    const poolNote = extra.length ? `Added ${extra.join(', ')} — pool is now ${count} SKUs.` : `Pool confirmed at ${count} SKUs.`
    return {
      msg: `${poolNote}\n\nFor mandatory SKUs, I'm flagging Kingfisher Prem 650ml and Heineken 330ml as must-haves. KF Ultra 330ml is also trending in recent sales data but underrepresented on shelf.\n\nShould I add KF Ultra as an eye-level hero? (yes / no)`,
      apply: () => { extra.forEach(c => { selectedCats[c] = true }) },
    }
  },
  // 3: handle hero → suggest KPI weights
  (text) => {
    const addHero = !/\bno\b|skip|don.?t/i.test(text)
    const heroNote = addHero ? "KF Ultra flagged as eye-level hero." : "Mandatory set: Kingfisher Prem + Heineken."
    const wMap: Record<string, { revenue:number; sos:number; compliance:number; eyeLevel:number }> = {
      revenue:    { revenue: 55, sos: 20, compliance: 15, eyeLevel: 10 },
      launch:     { revenue: 15, sos: 50, compliance: 20, eyeLevel: 15 },
      rsm:        { revenue: 20, sos: 15, compliance: 55, eyeLevel: 10 },
      compliance: { revenue: 15, sos: 15, compliance: 60, eyeLevel: 10 },
    }
    const w = wMap[chatCtx.goal]
    return {
      msg: `${heroNote}\n\nFor KPI weights, I'm suggesting Revenue ${w.revenue}%, SOS ${w.sos}%, Compliance ${w.compliance}%, Eye-level ${w.eyeLevel}% — tuned for your goal. Does that work, or want to adjust any?`,
      apply: () => {
        objConfig.mandatoryIds = [1, 3]
        objConfig.eyeLevelIds  = addHero ? [5] : []
        if (addHero) objConfig.priorityIds = [2]
      },
    }
  },
  // 4: handle weight confirmation → ask brand arrangement
  (text) => {
    const wMap: Record<string, { revenue:number; sos:number; compliance:number; eyeLevel:number }> = {
      revenue:    { revenue: 55, sos: 20, compliance: 15, eyeLevel: 10 },
      launch:     { revenue: 15, sos: 50, compliance: 20, eyeLevel: 15 },
      rsm:        { revenue: 20, sos: 15, compliance: 55, eyeLevel: 10 },
      compliance: { revenue: 15, sos: 15, compliance: 60, eyeLevel: 10 },
    }
    return {
      msg: `KPI weights locked in.\n\nLast thing — brand arrangement:\n\n• Block by brand — Kingfisher and Heineken in dedicated shelf zones (better brand impact)\n• Arrange freely — sorted by category for natural shopper flow\n\nWhich do you prefer?`,
      apply: () => { weights.value = wMap[chatCtx.goal] },
    }
  },
  // 5: handle brand → summary + ready
  (text) => {
    const blocking = /free|open|categor/i.test(text) ? 'free' : 'block'
    const blockNote = blocking === 'block'
      ? 'Brand blocking on — dedicated zones for Kingfisher and Heineken.'
      : 'Free arrangement — SKUs sorted by category flow.'
    const cats = Object.keys(selectedCats).filter(c => selectedCats[c])
    const skuCount = store.skus.filter(s => cats.includes(s.cat)).length
    return {
      msg: `${blockNote}\n\nAll configured! Here's your summary:\n\n• Fixture: ${chatCtx.assetName}\n• SKU pool: ${skuCount} SKUs (${cats.join(', ')})\n• Mandatory: Kingfisher Prem 650ml + Heineken 330ml\n• KPI: goal-optimized weights\n• Brand: ${blocking === 'block' ? 'blocked by brand' : 'free arrangement'}\n\nHit "Generate now" above to create your planogram candidates.`,
      apply: () => { objConfig.brandBlocking = blocking },
      ready: true,
    }
  },
]

const STATIC_RESPONSES: Record<string, string> = {
  'What are my top performing planograms?':
    `Here are your top planograms by compliance score:\n\n🥇 KF Premium Beer Cooler — 94% compliance, 87% utilization (North, Active)\n🥈 Heineken Gondola South — 91% compliance, 82% utilization (South, Active)\n🥉 Premium Shelf Q1 FY26 — 88% compliance, 79% utilization (West, Active)\n\nKF Premium Beer Cooler leads because all mandatory SKUs are placed and utilization is near-optimal. The South planogram is slightly behind — 2 priority SKUs are at sub-optimal positions.\n\nWant me to build a similar high-compliance planogram for another region?`,

  'Which high-performing SKUs are missing from my active planograms?':
    `Based on sales signal data, 2 trending SKUs have no active planogram coverage:\n\n📈 KF Ultra 330ml (Premium) — trending in South region, absent from all active planograms\n📈 KF Radler 330ml (Radler) — rising velocity in West, only in 1 draft (not yet live)\n\nThese 2 SKUs represent an estimated 8–12% revenue opportunity if added to active layouts. Want me to build a planogram that includes them as eye-level heroes?`,

  'Show me compliance status across all regions':
    `Regional compliance overview — Q1 FY26:\n\n• 🟢 North — 91% avg (3 active planograms)\n• 🟡 South — 86% avg (2 active planograms)\n• 🔴 East — 78% avg (1 active planogram) ← lowest\n• 🟡 West — 83% avg (2 active planograms)\n\nEast is your weakest region — the single active planogram there is missing 3 mandatory SKUs. Want me to generate an updated planogram for the East region?`,

  'How do I edit an existing planogram?':
    `To edit a planogram:\n\n1. Go to All Planograms → find your planogram → click the ✏️ Edit button\n2. This opens Planogram Studio where you can drag SKUs, adjust facings and reorganize shelves\n3. Changes auto-save as drafts — nothing goes live until approved\n4. When ready, click Submit for Approval to push it through the review queue\n\nTip: Use the AI Recommendations panel in Studio to get instant placement suggestions after edits.\n\nWant me to open a specific planogram for editing, or walk you through a particular change?`,

  'How do I add a new SKU to an existing planogram?':
    `To add a new SKU:\n\n1. Open the planogram in Planogram Studio\n2. In the right panel → go to the SKU Library tab\n3. Search for your SKU by name, brand or category\n4. Drag it onto any shelf slot — the AI highlights the best position in green\n5. Adjust facings using the + / − controls\n6. Save draft → submit for approval when ready\n\nIf the SKU doesn't appear in the library, you'll need to add it first via Asset & SKU Library → SKU Library → + Add SKU.\n\nWhich planogram and SKU do you want to add?`,

  'How do I adjust SKU facings in a planogram?':
    `To adjust facings:\n\n1. Open the planogram in Planogram Studio\n2. Click any SKU slot on the shelf\n3. In the inspector panel on the right, use the Facings slider or type a number directly\n4. Min/max facing limits are enforced — the AI won't let you go below the compliance minimum\n5. The utilization bar at the top updates live as you adjust\n\nFor bulk adjustments across a category, use the Category Caps slider in Step 3 when generating a new planogram.\n\nWant me to generate a new planogram with specific facing targets?`,

  'How does the AI scoring algorithm work?':
    `The AI uses a weighted scoring model across 4 KPIs:\n\n• 💰 Revenue — maximizes facings for high-margin, fast-moving SKUs\n• 📊 SOS (Share of Shelf) — ensures brand representation proportional to market share targets\n• ✅ Compliance — enforces mandatory SKU placement rules and minimums\n• 👁️ Eye-Level — prioritizes hero SKUs at the highest-attention shelf rows\n\nYou set the weights in Step 3 (or via chat). The algorithm places SKUs to maximize the combined weighted score. Higher revenue weight = more facing for premium SKUs. Higher compliance weight = stricter mandatory placement.\n\nWant me to build a planogram with a specific weight configuration?`,

  'What is the difference between a Visicooler and Gondola?':
    `Key differences:\n\n🍺 Visicooler (Beer Cooler)\n• Refrigerated, 6 shelves, 90×180cm\n• Best for chilled beverages — higher impulse-buy conversion\n• Typically near checkout or store entrance\n• UB portfolio: drives ~40% more volume per slot vs Gondola\n\n🗄️ Gondola\n• Ambient temperature, 4 shelves, 120×160cm\n• Best for ambient/canned products and gifting packs\n• Usually in the main store aisle — planned purchase behaviour\n\nRule of thumb: premium chilled beer → Visicooler. Premium ambient / gifting → Gondola.\n\nWant me to build a planogram for either fixture?`,

  'What are best practices for eye-level SKU placement?':
    `Eye-level (shelf rows 2–3 of 6) captures 60–70% of shopper attention. Best practices:\n\n👁️ Always place your mandatory SKUs here (Kingfisher Prem, Heineken 330ml)\n🚀 New launches benefit most — 2–3× more trial vs bottom shelf\n🔲 Keep hero SKU facings at 3+ at eye level for visual block impact\n⛔ Never place slow-moving or excluded SKUs at eye level\n✅ RSM visit rule: ALL mandatory SKUs must be at eye level minimum\n\nTip: use the Eye-Level weight slider in Step 3 to tell the AI how strictly to enforce this.\n\nWant me to build a compliance-ready planogram with strong eye-level configuration?`,
}

function detectIntent(text: string): 'build' | 'insights' | 'edit' | 'ask' {
  if (/top perform|missing sku|compliance.*region|region.*compli|insights|analytics/i.test(text)) return 'insights'
  if (/how do i|how to|edit.*plano|add.*sku|adjust.*facing|update.*plano/i.test(text)) return 'edit'
  if (/how does|what is|difference|best pract|algorithm|scoring/i.test(text)) return 'ask'
  return 'build'
}

async function startFullChat(initialText: string|null) {
  fullChatStarted.value = true
  fullChatTurn.value = 0
  fullChatMessages.value = []
  activeSection.value = null
  fullChatLoading.value = true
  await new Promise(r => setTimeout(r, 700))
  if (initialText) {
    chatIntent.value = detectIntent(initialText)
    fullChatMessages.value = [{ role: 'user', content: initialText }]
    fullChatLoading.value = false
    await runChatFlow(initialText)
  } else {
    chatIntent.value = 'build'
    fullChatMessages.value = [{ role: 'assistant', content: "Hi! I'm your AI planogram assistant. Let's build a new planogram together — I'll ask a few questions and configure everything.\n\nWhat's the main business goal: revenue push, new product launch, RSM audit visit, or compliance?" }]
    fullChatLoading.value = false
    await nextTick()
    if (fullChatScrollRef.value) fullChatScrollRef.value.scrollTop = fullChatScrollRef.value.scrollHeight
  }
}

async function sendFullChat(userText: string) {
  if (!userText.trim() || fullChatLoading.value) return
  fullChatMessages.value = [...fullChatMessages.value, { role: 'user', content: userText }]
  fullChatInput.value = ''
  await runChatFlow(userText)
}

async function runChatFlow(userText: string) {
  fullChatLoading.value = true
  await new Promise(r => setTimeout(r, 800 + Math.random() * 500))

  // Static response intents (insights / edit / ask)
  if (chatIntent.value !== 'build') {
    const staticReply = STATIC_RESPONSES[userText]
    const reply = staticReply || "Great question! To get the most accurate answer, check the relevant section in the app — or start a planogram build and I'll configure everything step by step.\n\nWant to build a planogram now?"
    fullChatMessages.value = [...fullChatMessages.value, { role: 'assistant', content: reply }]
    // After answering, offer to build
    if (!staticReply) chatIntent.value = 'build'
    fullChatLoading.value = false
    await nextTick()
    if (fullChatScrollRef.value) fullChatScrollRef.value.scrollTop = fullChatScrollRef.value.scrollHeight
    return
  }

  // Build intent — step through CHAT_FLOW
  const step = fullChatTurn.value
  if (step >= CHAT_FLOW.length) {
    fullChatLoading.value = false
    return
  }
  const result = CHAT_FLOW[step](userText)
  if (result.apply) result.apply()
  if (result.ready) fullChatReady.value = true
  fullChatMessages.value = [...fullChatMessages.value, { role: 'assistant', content: result.msg }]
  fullChatTurn.value = step + 1
  fullChatLoading.value = false
  await nextTick()
  if (fullChatScrollRef.value) fullChatScrollRef.value.scrollTop = fullChatScrollRef.value.scrollHeight
}
</script>
