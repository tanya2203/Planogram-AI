<template>
  <div style="padding:0;min-height:calc(100vh - 56px);" @click="onPageClick">

    <!-- Floating AI orb -->
    <button @click.stop="showCopilot = !showCopilot"
      :style="`position:fixed;bottom:28px;right:${showCopilot?'388px':'28px'};z-index:160;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);border:none;cursor:pointer;box-shadow:0 0 0 ${showCopilot?'8px':'4px'} rgba(79,70,229,0.2),0 8px 28px rgba(79,70,229,0.45);display:flex;align-items:center;justify-content:center;transition:all 0.25s;`">
      <Sparkles :size="20" color="white"/>
    </button>

    <!-- Toast -->
    <Transition name="toast-fade">
      <div v-if="toast" style="position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#0F172A;color:white;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:500;z-index:999;box-shadow:0 4px 16px rgba(0,0,0,0.18);white-space:nowrap;pointer-events:none;">
        {{ toast }}
      </div>
    </Transition>

    <!-- Delete Modal -->
    <Transition name="modal-fade">
      <div v-if="deleteTarget" style="position:fixed;inset:0;background:rgba(15,23,42,0.4);z-index:200;display:flex;align-items:center;justify-content:center;">
        <div style="background:white;border-radius:14px;width:400px;box-shadow:0 8px 40px rgba(15,23,42,0.18);overflow:hidden;">
          <div style="padding:24px 24px 8px;">
            <div style="font-size:15px;font-weight:700;color:#0F172A;margin-bottom:8px;">Delete planogram?</div>
            <div style="font-size:13px;color:#64748B;line-height:1.6;">"<span style="color:#334155;font-weight:500;">{{ deleteTarget.name }}</span>" will be permanently removed. This cannot be undone.</div>
          </div>
          <div style="padding:16px 24px 20px;display:flex;gap:8px;justify-content:flex-end;">
            <button @click="deleteTarget = null" style="background:transparent;border:1px solid #E2E8F0;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:500;cursor:pointer;color:#475569;">Cancel</button>
            <button @click="confirmDelete" style="background:#EF4444;color:white;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;">Delete</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Details Drawer backdrop -->
    <Transition name="modal-fade">
      <div v-if="detailsTarget" @click="detailsTarget = null" style="position:fixed;inset:0;background:rgba(15,23,42,0.25);z-index:149;"></div>
    </Transition>
    <!-- Details Drawer panel -->
    <Transition name="drawer">
      <div v-if="detailsTarget" style="position:fixed;top:56px;right:0;bottom:0;width:380px;background:white;border-left:1px solid #E2E8F0;display:flex;flex-direction:column;z-index:150;box-shadow:-4px 0 32px rgba(15,23,42,0.1);">
        <div style="padding:20px 24px 16px;border-bottom:1px solid #F1F5F9;display:flex;align-items:flex-start;justify-content:space-between;">
          <div>
            <div style="font-size:14px;font-weight:700;color:#0F172A;margin-bottom:6px;">{{ detailsTarget.name }}</div>
            <span :style="pillStyle(detailsTarget.status)">
              <span :style="`width:5px;height:5px;border-radius:50%;background:${PILL_META[detailsTarget.status]?.dot??'#94A3B8'};display:inline-block;`"/>
              {{ pillLabel(detailsTarget.status) }}
            </span>
          </div>
          <button @click="detailsTarget = null" style="background:transparent;border:none;cursor:pointer;padding:4px;margin-top:2px;"><X :size="15" color="#94A3B8"/></button>
        </div>
        <div style="flex:1;overflow-y:auto;padding:20px 24px;">
          <template v-for="section in drawerSections" :key="section.heading">
            <div style="margin-bottom:24px;">
              <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">{{ section.heading }}</div>
              <div v-for="(row, i) in section.rows" :key="row[0]"
                :style="i < section.rows.length-1 ? 'display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #F8FAFC;' : 'display:flex;justify-content:space-between;padding:9px 0;'">
                <span style="font-size:13px;color:#94A3B8;">{{ row[0] }}</span>
                <span style="font-size:13px;color:#0F172A;font-weight:500;">{{ row[1] }}</span>
              </div>
            </div>
          </template>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #F1F5F9;display:flex;gap:8px;">
          <button @click="detailsTarget = null" style="flex:1;background:transparent;border:1px solid #E2E8F0;border-radius:8px;padding:9px 0;font-size:13px;font-weight:500;cursor:pointer;color:#475569;">Close</button>
          <button @click="handleEdit" style="flex:1;background:#0F172A;color:white;border:none;border-radius:8px;padding:9px 0;font-size:13px;font-weight:600;cursor:pointer;">Edit Planogram</button>
        </div>
      </div>
    </Transition>

    <!-- Row action menu -->
    <Teleport to="body">
      <template v-if="openMenuId !== null && activeMenuPlano">
        <div @click="openMenuId = null" style="position:fixed;inset:0;z-index:89;"></div>
        <div :style="`position:fixed;top:${menuPos.top}px;right:${menuPos.right}px;background:white;border:1px solid #E2E8F0;border-radius:10px;box-shadow:0 4px 24px rgba(15,23,42,0.12);z-index:90;min-width:192px;overflow:hidden;padding:4px 0;`">
          <button @click.stop="detailsTarget = activeMenuPlano; openMenuId = null" class="mitem">View details</button>
          <button @click.stop="handleEdit(); openMenuId = null" class="mitem">Edit</button>
          <button @click.stop="handleDuplicate(activeMenuPlano!); openMenuId = null" class="mitem">Duplicate</button>
          <button @click.stop="handleToggle(activeMenuPlano!); openMenuId = null" class="mitem">{{ activeMenuPlano.status === 'active' ? 'Deactivate' : 'Activate' }}</button>
          <button @click.stop="handleRegenerate(); openMenuId = null" class="mitem mitem--ai">✦ Regenerate with AI</button>
          <div style="height:1px;background:#F1F5F9;margin:2px 0;"></div>
          <button @click.stop="handleDeleteRequest(activeMenuPlano!); openMenuId = null" class="mitem mitem--del">Delete</button>
        </div>
      </template>
    </Teleport>

    <!-- showNewMenu click-away -->
    <div v-if="showNewMenu" @click="showNewMenu = false" style="position:fixed;inset:0;z-index:88;"></div>

    <!-- ── AI Copilot Panel ────────────────────────────────────────────── -->
    <Transition name="copilot">
      <div v-if="showCopilot"
        style="position:fixed;top:56px;right:0;bottom:0;width:360px;background:white;border-left:1px solid #E2E8F0;z-index:130;display:flex;flex-direction:column;box-shadow:-4px 0 40px rgba(79,70,229,0.1);">

        <!-- Copilot header -->
        <div style="padding:16px 18px 14px;border-bottom:1px solid #F1F5F9;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#4F46E5,#7C3AED);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(79,70,229,0.35);">
              <Sparkles :size="15" color="white"/>
            </div>
            <div>
              <div style="font-size:13px;font-weight:700;color:#0F172A;">AI Copilot</div>
              <div style="font-size:11px;color:#10B981;display:flex;align-items:center;gap:4px;">
                <span style="width:5px;height:5px;border-radius:50%;background:#10B981;display:inline-block;"/>
                Retail Intelligence Mode
              </div>
            </div>
            <button @click="showCopilot = false" style="margin-left:auto;background:transparent;border:none;cursor:pointer;padding:4px;"><X :size="14" color="#94A3B8"/></button>
          </div>
        </div>

        <!-- Copilot scrollable body -->
        <div ref="copilotBody" style="flex:1;overflow-y:auto;padding:14px 16px;">

          <!-- AI Insights -->
          <div style="margin-bottom:16px;">
            <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Live Insights</div>
            <div v-for="ins in aiInsights" :key="ins.id"
              style="background:#F8FAFC;border:1px solid #F1F5F9;border-radius:9px;padding:10px 12px;margin-bottom:6px;cursor:pointer;transition:background 0.15s;"
              @mouseenter="(e)=>(e.currentTarget as HTMLElement).style.background='#EEF2FF'"
              @mouseleave="(e)=>(e.currentTarget as HTMLElement).style.background='#F8FAFC'">
              <div style="display:flex;gap:8px;align-items:flex-start;">
                <span :style="`width:6px;height:6px;border-radius:50%;background:${ins.color};flex-shrink:0;margin-top:4px;`"/>
                <div>
                  <div style="font-size:12px;font-weight:600;color:#0F172A;margin-bottom:2px;">{{ ins.title }}</div>
                  <div style="font-size:11px;color:#64748B;line-height:1.5;">{{ ins.desc }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Suggested prompts -->
          <div style="margin-bottom:16px;">
            <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Suggested Prompts</div>
            <div style="display:flex;flex-direction:column;gap:5px;">
              <button v-for="p in suggestedPrompts" :key="p" @click="sendPrompt(p)"
                style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:white;border:1px solid #E2E8F0;border-radius:8px;cursor:pointer;font-size:11px;color:#334155;text-align:left;transition:all 0.12s;width:100%;"
                @mouseenter="(e)=>(e.currentTarget as HTMLElement).style.background='#F5F3FF'"
                @mouseleave="(e)=>(e.currentTarget as HTMLElement).style.background='white'">
                <Sparkles :size="11" color="#7C3AED" style="flex-shrink:0;"/>
                {{ p }}
              </button>
            </div>
          </div>

          <!-- Chat messages -->
          <div v-if="copilotMessages.length > 0">
            <div style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Conversation</div>
            <div v-for="msg in copilotMessages" :key="msg.id" style="margin-bottom:10px;">
              <div v-if="msg.role==='user'" style="display:flex;justify-content:flex-end;">
                <div style="background:#4F46E5;color:white;border-radius:10px 10px 2px 10px;padding:8px 12px;font-size:12px;max-width:82%;line-height:1.55;">{{ msg.text }}</div>
              </div>
              <div v-else style="display:flex;gap:8px;align-items:flex-start;">
                <div style="width:22px;height:22px;border-radius:6px;background:linear-gradient(135deg,#4F46E5,#7C3AED);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
                  <Sparkles :size="11" color="white"/>
                </div>
                <div style="background:#F8FAFC;border:1px solid #F1F5F9;border-radius:2px 10px 10px 10px;padding:8px 12px;font-size:12px;color:#334155;max-width:82%;line-height:1.55;">{{ msg.text }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Copilot input -->
        <div style="padding:12px 16px;border-top:1px solid #F1F5F9;">
          <div style="display:flex;align-items:center;gap:8px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:8px 10px;">
            <input v-model="copilotInput" @keydown.enter="sendMessage"
              placeholder="Ask about planograms, compliance, SKUs…"
              style="flex:1;border:none;background:transparent;font-size:12px;color:#334155;outline:none;"/>
            <button @click="sendMessage" :disabled="!copilotInput.trim()"
              :style="`background:${copilotInput.trim()?'linear-gradient(135deg,#4F46E5,#7C3AED)':'#E2E8F0'};border:none;border-radius:7px;width:28px;height:28px;cursor:${copilotInput.trim()?'pointer':'default'};display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.15s;`">
              <ArrowUp :size="13" :color="copilotInput.trim()?'white':'#94A3B8'"/>
            </button>
          </div>
          <div style="font-size:10px;color:#CBD5E1;text-align:center;margin-top:6px;">Powered by PlanogramAI · Retail Intelligence</div>
        </div>
      </div>
    </Transition>

    <!-- ── Main content ───────────────────────────────────────────────── -->
    <div :style="`padding:28px 32px;transition:padding-right 0.25s;padding-right:${showCopilot?'392px':'32px'};`">

      <!-- Header -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;gap:16px;flex-wrap:wrap;">
        <div>
          <div style="font-size:22px;font-weight:700;color:#0F172A;letter-spacing:-0.4px;margin-bottom:4px;">Planogram Configurations</div>
          <div style="font-size:13px;color:#64748B;">Create, optimize, monitor and deploy planograms across MT &amp; GT stores.</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
          <!-- Ask AI -->
          <button @click.stop="showCopilot = !showCopilot"
            :style="`display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;border:1.5px solid ${showCopilot?'#4F46E5':'#E2E8F0'};background:${showCopilot?'#EEF2FF':'white'};color:${showCopilot?'#4F46E5':'#64748B'};font-size:13px;font-weight:500;cursor:pointer;transition:all 0.15s;`">
            <MessageSquare :size="14"/>Ask AI
          </button>
          <!-- Import -->
          <button style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;border:1px solid #E2E8F0;background:white;color:#64748B;font-size:13px;font-weight:500;cursor:pointer;">
            <Upload :size="14"/>Import
          </button>
          <!-- Generate with AI -->
          <button @click="router.push('/ai-generator')"
            style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;border:1px solid #E2E8F0;background:white;color:#4F46E5;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;"
            @mouseenter="(e)=>(e.currentTarget as HTMLElement).style.background='#EEF2FF'"
            @mouseleave="(e)=>(e.currentTarget as HTMLElement).style.background='white'">
            <Sparkles :size="14"/>Generate with AI
          </button>
          <!-- Create Planogram PRIMARY -->
          <div style="position:relative;">
            <div style="display:flex;border-radius:9px;overflow:hidden;box-shadow:0 2px 8px rgba(79,70,229,0.3);">
              <button @click="router.push('/new-planogram')"
                style="display:flex;align-items:center;gap:7px;background:linear-gradient(135deg,#4F46E5,#6366F1);color:white;border:none;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;border-right:1px solid rgba(255,255,255,0.15);">
                <Plus :size="14"/>Create Planogram
              </button>
              <button @click.stop="showNewMenu = !showNewMenu"
                style="background:linear-gradient(135deg,#4F46E5,#6366F1);color:rgba(255,255,255,0.75);border:none;padding:9px 10px;cursor:pointer;display:flex;align-items:center;">
                <ChevronDown :size="13"/>
              </button>
            </div>
            <div v-if="showNewMenu" style="position:absolute;right:0;top:calc(100% + 6px);background:white;border:1px solid #E2E8F0;border-radius:10px;box-shadow:0 6px 28px rgba(15,23,42,0.14);z-index:89;min-width:224px;overflow:hidden;padding:4px 0;">
              <button @click="showNewMenu=false;router.push('/new-planogram')" class="dmitem">
                <Move :size="14" color="#64748B" style="flex-shrink:0;"/>
                <div><div style="font-weight:600;font-size:13px;color:#0F172A;">Manual Setup</div><div style="font-size:11px;color:#94A3B8;margin-top:1px;">Configure and place SKUs yourself</div></div>
              </button>
              <button @click="showNewMenu=false;router.push('/ai-generator')" class="dmitem">
                <Sparkles :size="14" color="#4F46E5" style="flex-shrink:0;"/>
                <div><div style="font-weight:600;font-size:13px;color:#0F172A;">Generate with AI</div><div style="font-size:11px;color:#94A3B8;margin-top:1px;">Set objective · pick SKUs · 3 options</div></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── KPI Cards ────────────────────────────────────────────────── -->
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:26px;">
        <div v-for="kpi in kpiCards" :key="kpi.label"
          style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:16px 18px;cursor:pointer;transition:box-shadow 0.15s;position:relative;overflow:hidden;"
          @mouseenter="(e)=>(e.currentTarget as HTMLElement).style.boxShadow='0 4px 20px rgba(15,23,42,0.08)'"
          @mouseleave="(e)=>(e.currentTarget as HTMLElement).style.boxShadow='none'">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;">
            <div style="font-size:10px;font-weight:700;color:#94A3B8;letter-spacing:0.5px;text-transform:uppercase;">{{ kpi.label }}</div>
            <div :style="`font-size:10px;font-weight:700;display:flex;align-items:center;gap:2px;color:${kpi.trend >= 0?'#10B981':'#EF4444'};`">
              <TrendingUp v-if="kpi.trend >= 0" :size="11"/>
              <TrendingDown v-else :size="11"/>
              {{ Math.abs(kpi.trend) }}%
            </div>
          </div>
          <div style="font-size:26px;font-weight:800;color:#0F172A;letter-spacing:-0.8px;margin-bottom:10px;">{{ kpi.value }}</div>
          <svg width="80" height="26" style="display:block;overflow:visible;">
            <polyline :points="sparkline(kpi.data)" fill="none" :stroke="kpi.color" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div :style="`position:absolute;bottom:0;left:0;right:0;height:2px;background:${kpi.color};opacity:0.25;`"/>
        </div>
      </div>

      <!-- ── Filter bar ───────────────────────────────────────────────── -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:8px;border:1px solid #E2E8F0;border-radius:8px;padding:7px 12px;background:white;min-width:200px;max-width:260px;">
          <Search :size="13" color="#CBD5E1"/>
          <input v-model="search" placeholder="Search planograms…" style="border:none;background:transparent;font-size:13px;color:#334155;outline:none;flex:1;"/>
          <button v-if="search" @click="search=''" style="background:transparent;border:none;cursor:pointer;padding:0;display:flex;"><X :size="11" color="#CBD5E1"/></button>
        </div>

        <div style="display:flex;gap:2px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:3px;">
          <button v-for="t in STATUS_TABS" :key="t.value" @click="statusFilter=t.value"
            :style="statusFilter===t.value
              ? 'padding:5px 11px;border-radius:6px;border:none;background:white;color:#0F172A;font-size:12px;font-weight:600;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.07);white-space:nowrap;'
              : 'padding:5px 11px;border-radius:6px;border:none;background:transparent;color:#94A3B8;font-size:12px;cursor:pointer;white-space:nowrap;'">
            {{ t.label }}
          </button>
        </div>

        <select v-model="mtGtFilter" style="border:1px solid #E2E8F0;border-radius:8px;padding:7px 12px;font-size:12px;color:#64748B;cursor:pointer;outline:none;background:white;">
          <option value="all">MT &amp; GT</option>
          <option value="MT">MT Only</option>
          <option value="GT">GT Only</option>
        </select>

        <select v-model="regionFilter" style="border:1px solid #E2E8F0;border-radius:8px;padding:7px 12px;font-size:12px;color:#64748B;cursor:pointer;outline:none;background:white;">
          <option value="all">All Regions</option>
          <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
        </select>

        <select v-model="sortKey" style="border:1px solid #E2E8F0;border-radius:8px;padding:7px 12px;font-size:12px;color:#64748B;cursor:pointer;outline:none;background:white;">
          <option value="modified">Last modified</option>
          <option value="compliance">Compliance ↓</option>
          <option value="utilization">Utilization ↓</option>
          <option value="skuCount">SKU count ↓</option>
          <option value="aiScore">AI Score ↓</option>
        </select>

        <div style="margin-left:auto;font-size:12px;color:#94A3B8;">{{ filtered.length }} planogram{{ filtered.length!==1?'s':'' }}</div>
      </div>

      <!-- Empty state -->
      <div v-if="filtered.length === 0" style="background:white;border:1px solid #E2E8F0;border-radius:14px;padding:72px 32px;text-align:center;">
        <div style="width:62px;height:62px;border-radius:16px;background:linear-gradient(135deg,#4F46E5,#7C3AED);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;box-shadow:0 4px 20px rgba(79,70,229,0.3);">
          <Sparkles :size="28" color="white"/>
        </div>
        <div style="font-size:17px;font-weight:700;color:#0F172A;margin-bottom:8px;">{{ store.planograms.length===0?'No planograms yet':'No results found' }}</div>
        <div style="font-size:13px;color:#64748B;max-width:380px;margin:0 auto 24px;line-height:1.7;">
          {{ store.planograms.length===0 ? 'Let AI generate your first planogram, or create one manually in the Studio.' : 'Try adjusting your search or filters.' }}
        </div>
        <div v-if="store.planograms.length===0" style="display:flex;gap:10px;justify-content:center;">
          <button @click="router.push('/ai-generator')" style="display:inline-flex;align-items:center;gap:7px;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:white;border:none;border-radius:9px;padding:10px 22px;font-size:13px;font-weight:600;cursor:pointer;">
            <Sparkles :size="14"/>Generate with AI
          </button>
          <button @click="router.push('/new-planogram')" style="display:inline-flex;align-items:center;gap:7px;background:white;color:#475569;border:1px solid #E2E8F0;border-radius:9px;padding:10px 22px;font-size:13px;font-weight:500;cursor:pointer;">
            <Plus :size="14"/>Create Manually
          </button>
        </div>
      </div>

      <!-- ── Table ──────────────────────────────────────────────────── -->
      <div v-else style="background:white;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;box-shadow:0 1px 6px rgba(15,23,42,0.04);">
        <div style="overflow-x:auto;">
          <table style="width:100%;min-width:1020px;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid #F1F5F9;background:#FAFAFA;">
                <th class="th" style="padding-left:20px;width:48px;"></th>
                <th class="th" style="text-align:left;min-width:190px;">Planogram</th>
                <th class="th" style="text-align:left;min-width:140px;">Asset / Category</th>
                <th class="th" style="text-align:center;width:58px;">MT/GT</th>
                <th class="th" style="text-align:left;width:70px;">Region</th>
                <th class="th" style="text-align:left;min-width:104px;">Utilization</th>
                <th class="th" style="text-align:left;min-width:104px;">Compliance</th>
                <th class="th" style="text-align:center;width:72px;">AI Score</th>
                <th class="th" style="text-align:left;width:110px;">Status</th>
                <th class="th" style="text-align:left;width:90px;">Updated</th>
                <th class="th" style="text-align:left;width:100px;">Owner</th>
                <th style="width:44px;padding:11px 20px 11px 8px;"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(plano, idx) in filtered" :key="plano.id"
                @click="detailsTarget = plano"
                class="trow"
                :style="idx < filtered.length-1 ? 'border-bottom:1px solid #F8FAFC;' : ''">

                <!-- Thumbnail -->
                <td style="padding:11px 6px 11px 20px;">
                  <div :style="`width:30px;height:38px;border-radius:6px;background:linear-gradient(160deg,#EEF2FF,#E0E7FF);border:1px solid #E2E8F0;display:flex;align-items:center;justify-content:center;flex-shrink:0;`">
                    <span style="font-size:15px;line-height:1;">{{ plano.assetImg }}</span>
                  </div>
                </td>

                <!-- Name + version tags -->
                <td style="padding:11px 10px;">
                  <div style="font-weight:600;font-size:13px;color:#0F172A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;margin-bottom:3px;">{{ plano.name }}</div>
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span :style="`background:${plano.approvalStage===3?'#EFF6FF':'#F8FAFC'};color:${plano.approvalStage===3?'#1D4ED8':'#94A3B8'};font-size:10px;font-weight:600;padding:1px 5px;border-radius:3px;`">
                      {{ plano.approvalStage===3?'v2.1':'v1.0' }}
                    </span>
                    <span style="background:#F5F3FF;color:#7C3AED;font-size:10px;font-weight:600;padding:1px 5px;border-radius:3px;">{{ plano.skuCount }} SKUs</span>
                  </div>
                </td>

                <!-- Asset / Category -->
                <td style="padding:11px 10px;">
                  <div style="font-size:12px;color:#334155;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;">{{ plano.asset }}</div>
                  <div style="font-size:11px;color:#94A3B8;margin-top:1px;">{{ plano.assetType }}</div>
                </td>

                <!-- MT/GT -->
                <td style="padding:11px 10px;text-align:center;">
                  <span :style="`display:inline-flex;align-items:center;justify-content:center;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;background:${getMtGt(plano.assetType)==='MT'?'#DBEAFE':'#D1FAE5'};color:${getMtGt(plano.assetType)==='MT'?'#1E40AF':'#065F46'};`">
                    {{ getMtGt(plano.assetType) }}
                  </span>
                </td>

                <!-- Region -->
                <td style="padding:11px 10px;font-size:12px;color:#64748B;white-space:nowrap;">{{ plano.region }}</td>

                <!-- Utilization -->
                <td style="padding:11px 10px;">
                  <div style="display:flex;align-items:center;gap:7px;">
                    <div style="flex:1;height:4px;background:#F1F5F9;border-radius:2px;overflow:hidden;min-width:52px;">
                      <div :style="`width:${plano.utilization}%;height:100%;border-radius:2px;background:#3B82F6;`"/>
                    </div>
                    <span style="font-size:11px;font-weight:600;color:#334155;min-width:26px;">{{ plano.utilization }}%</span>
                  </div>
                </td>

                <!-- Compliance -->
                <td style="padding:11px 10px;">
                  <div style="display:flex;align-items:center;gap:7px;">
                    <div style="flex:1;height:4px;background:#F1F5F9;border-radius:2px;overflow:hidden;min-width:52px;">
                      <div :style="`width:${plano.compliance}%;height:100%;border-radius:2px;background:${plano.compliance>=80?'#10B981':plano.compliance>=60?'#F59E0B':'#EF4444'};`"/>
                    </div>
                    <span :style="`font-size:11px;font-weight:700;min-width:26px;color:${plano.compliance>=80?'#059669':plano.compliance>=60?'#D97706':'#DC2626'};`">{{ plano.compliance }}%</span>
                  </div>
                </td>

                <!-- AI Score -->
                <td style="padding:11px 10px;text-align:center;">
                  <div style="display:inline-flex;flex-direction:column;align-items:center;gap:3px;">
                    <span :style="`font-size:14px;font-weight:800;letter-spacing:-0.3px;color:${getAiScore(plano)>=80?'#4F46E5':getAiScore(plano)>=60?'#F59E0B':'#EF4444'};`">{{ getAiScore(plano) }}</span>
                    <div style="display:flex;gap:2px;">
                      <div v-for="i in 5" :key="i" :style="`width:5px;height:3px;border-radius:1px;background:${i<=Math.round(getAiScore(plano)/20)?'#4F46E5':'#E2E8F0'};`"/>
                    </div>
                  </div>
                </td>

                <!-- Status -->
                <td style="padding:11px 10px;">
                  <span :style="pillStyle(plano.status)">
                    <span :style="`width:5px;height:5px;border-radius:50%;background:${PILL_META[plano.status]?.dot??'#94A3B8'};display:inline-block;flex-shrink:0;`"/>
                    {{ pillLabel(plano.status) }}
                  </span>
                </td>

                <!-- Updated -->
                <td style="padding:11px 10px;font-size:11px;color:#94A3B8;white-space:nowrap;">{{ plano.modified }}</td>

                <!-- Owner -->
                <td style="padding:11px 10px;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#7C3AED);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:white;flex-shrink:0;letter-spacing:0.3px;">
                      {{ initials(plano.createdBy) }}
                    </div>
                    <span style="font-size:11px;color:#64748B;white-space:nowrap;">{{ plano.createdBy.split(' ')[0] }}</span>
                  </div>
                </td>

                <!-- Actions -->
                <td style="padding:11px 20px 11px 6px;" @click.stop>
                  <button @click.stop="toggleMenu(plano.id, $event)"
                    style="background:transparent;border:1px solid #E2E8F0;border-radius:6px;padding:4px 9px;cursor:pointer;font-size:13px;color:#94A3B8;line-height:1;letter-spacing:2px;transition:all 0.1s;"
                    @mouseenter="(e)=>{(e.currentTarget as HTMLElement).style.background='#F8FAFC';(e.currentTarget as HTMLElement).style.color='#475569';}"
                    @mouseleave="(e)=>{(e.currentTarget as HTMLElement).style.background='transparent';(e.currentTarget as HTMLElement).style.color='#94A3B8';}">
                    ···
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="filtered.length > 0" style="display:flex;align-items:center;justify-content:space-between;margin-top:14px;">
        <div style="font-size:12px;color:#CBD5E1;">Showing {{ filtered.length }} of {{ store.planograms.length }} planograms</div>
        <div style="display:flex;gap:4px;">
          <button v-for="p in ['←','1','2','3','→']" :key="p"
            :style="p==='1'
              ? 'min-width:30px;height:30px;border-radius:7px;border:1px solid #4F46E5;background:#EEF2FF;color:#4F46E5;font-size:12px;font-weight:600;cursor:pointer;padding:0 8px;'
              : 'min-width:30px;height:30px;border-radius:7px;border:1px solid #F1F5F9;background:white;color:#94A3B8;font-size:12px;cursor:pointer;padding:0 8px;'">
            {{ p }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Sparkles, ChevronDown, X, Move, Plus, MessageSquare, Upload, ArrowUp, TrendingUp, TrendingDown } from 'lucide-vue-next'
import { usePlanogramStore, ANALYTICS_TREND } from '~/stores/planogram'
import type { Planogram } from '~/stores/planogram'

const store  = usePlanogramStore()
const router = useRouter()

// ── state ─────────────────────────────────────────────────────────────────────
const search        = ref('')
const statusFilter  = ref('all')
const sortKey       = ref('modified')
const openMenuId    = ref<number|null>(null)
const menuPos       = ref({ top: 0, right: 0 })
const detailsTarget = ref<Planogram|null>(null)
const deleteTarget  = ref<Planogram|null>(null)
const showNewMenu   = ref(false)
const toast         = ref<string|null>(null)
const showCopilot   = ref(false)
const copilotInput  = ref('')
const mtGtFilter    = ref('all')
const regionFilter  = ref('all')
const copilotBody   = ref<HTMLElement|null>(null)
const copilotMessages = ref<{id:number;role:'user'|'ai';text:string}[]>([])
let msgId = 0

const STATUS_TABS = [
  { value:'all',      label:'All' },
  { value:'active',   label:'Active' },
  { value:'draft',    label:'Draft' },
  { value:'pending',  label:'Pending' },
  { value:'inactive', label:'Inactive' },
  { value:'archived', label:'Archived' },
]

const PILL_META: Record<string, {bg:string;tc:string;dot:string;label:string}> = {
  active:   { bg:'#ECFDF5', tc:'#166634', dot:'#10B981', label:'Active' },
  draft:    { bg:'#F1F5F9', tc:'#64748B', dot:'#94A3B8', label:'Draft' },
  pending:  { bg:'#FFFBEB', tc:'#92400E', dot:'#F59E0B', label:'Pending' },
  inactive: { bg:'#F8FAFC', tc:'#94A3B8', dot:'#CBD5E1', label:'Inactive' },
  archived: { bg:'#F5F3FF', tc:'#7C3AED', dot:'#8B5CF6', label:'Archived' },
}

function pillStyle(status: string) {
  const m = PILL_META[status] ?? PILL_META.draft
  return `display:inline-flex;align-items:center;gap:5px;background:${m.bg};color:${m.tc};font-size:11px;font-weight:600;padding:3px 8px;border-radius:5px;white-space:nowrap;`
}
function pillLabel(s: string) { return (PILL_META[s] ?? PILL_META.draft).label }

function getMtGt(assetType: string): 'MT'|'GT' {
  return ['Visicooler','Gondola','End Cap'].includes(assetType) ? 'MT' : 'GT'
}
function getAiScore(p: Planogram): number {
  return Math.round(p.compliance * 0.6 + p.utilization * 0.4)
}
function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
}

// ── sparkline ─────────────────────────────────────────────────────────────────
function sparkline(values: number[], w = 80, h = 26): string {
  if (values.length < 2) return ''
  const mn = Math.min(...values), mx = Math.max(...values), rng = mx - mn || 1
  return values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - mn) / rng) * (h - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

// ── KPI Cards ─────────────────────────────────────────────────────────────────
const kpiCards = computed(() => {
  const pl = store.planograms
  const avgC  = pl.length ? Math.round(pl.reduce((s,p)=>s+p.compliance,0)/pl.length) : 0
  const avgU  = pl.length ? Math.round(pl.reduce((s,p)=>s+p.utilization,0)/pl.length) : 0
  const avgAI = pl.length ? Math.round(pl.reduce((s,p)=>s+getAiScore(p),0)/pl.length) : 0
  const risk  = pl.filter(p=>p.compliance<70).length
  const pend  = pl.filter(p=>p.status==='pending').length
  const T = ANALYTICS_TREND.slice(-8)
  return [
    { label:'AVG COMPLIANCE',    value:`${avgC}%`,   trend:8,  color:'#10B981', data: T.map(t=>t.compliance) },
    { label:'AVG UTILIZATION',   value:`${avgU}%`,   trend:5,  color:'#3B82F6', data: T.map(t=>t.utilization) },
    { label:'AI OPT SCORE',      value:`${avgAI}`,   trend:12, color:'#4F46E5', data: T.map(t=>Math.round((t.compliance+t.utilization)/2)) },
    { label:'STORES AT RISK',    value:`${risk}`,    trend:-3, color:'#EF4444', data:[4,6,5,7,5,4,5,risk] },
    { label:'PENDING APPROVALS', value:`${pend}`,    trend:-2, color:'#F59E0B', data:[3,4,2,5,3,4,3,pend] },
  ]
})

// ── AI Copilot ────────────────────────────────────────────────────────────────
const aiInsights = computed(() => {
  const atRisk = store.planograms.filter(p=>p.compliance<70)
  const pend   = store.planograms.filter(p=>p.status==='pending')
  return [
    { id:1, color:'#EF4444', title:`${atRisk.length} planogram${atRisk.length!==1?'s':''} below 70% compliance`, desc: atRisk.length>0 ? `${[...new Set(atRisk.map(p=>p.region))].join(', ')} regions need attention.` : 'All planograms within compliance thresholds.' },
    { id:2, color:'#F59E0B', title:`${pend.length} pending approval${pend.length!==1?'s':''}`, desc:'Approval bottleneck detected. Consider escalating Q2 configurations to manager.' },
    { id:3, color:'#4F46E5', title:'Eye-level shelf underutilised by 28%', desc:'Beer Cooler BC-6D North has below-optimal SKU density on shelf row 2.' },
  ]
})

const suggestedPrompts = [
  'Suggest layout for summer beer campaign',
  'Optimize shelf for premium SKUs',
  'Show low-performing north region planograms',
  'Compare Q1 vs Q2 compliance trends',
]

function sendPrompt(p: string) { copilotInput.value = p; sendMessage() }

const AI_RESPONSES: Record<string, string> = {
  'summer beer': 'For a summer beer campaign, place Kingfisher Prem and Heineken 330ml at eye level with 4–6 facings each. Shift seasonal SKUs to rows 2–3. Expected compliance uplift: +18% based on Q2 2024 patterns.',
  'premium sku': 'Premium SKUs (KF Ultra, Heineken Silver) should occupy rows 2–3 at eye level. Current placement shows a 23% facing deficit vs category guidelines. A reflow saves ~12% shelf real estate.',
  'low-performing': `${store.planograms.filter(p=>p.compliance<70).length} planogram(s) flagged: ${store.planograms.filter(p=>p.compliance<70).map(p=>p.name).slice(0,2).join(', ')}. Root cause: SKU misalignment on bottom shelves. Recommend an AI reflow.`,
  'q1 vs q2': 'Q2 avg compliance is 81% vs Q1 at 74% — a +9.5% improvement. North region drove the largest gain (+12%). West region at 62% is lagging; recommend reviewing End Cap configurations.',
}

function sendMessage() {
  const text = copilotInput.value.trim()
  if (!text) return
  copilotMessages.value.push({ id: msgId++, role:'user', text })
  copilotInput.value = ''
  setTimeout(async () => {
    const key = Object.keys(AI_RESPONSES).find(k => text.toLowerCase().includes(k))
    const reply = key
      ? AI_RESPONSES[key]
      : `I've analysed your ${store.planograms.length} planograms. ${store.planograms.filter(p=>p.compliance<80).length} have optimisation opportunities. Would you like region-specific or SKU-specific recommendations?`
    copilotMessages.value.push({ id: msgId++, role:'ai', text: reply })
    await nextTick()
    if (copilotBody.value) copilotBody.value.scrollTop = copilotBody.value.scrollHeight
  }, 640)
}

// ── regions ───────────────────────────────────────────────────────────────────
const regions = computed(() => [...new Set(store.planograms.map(p=>p.region))])

// ── filtered / sorted ─────────────────────────────────────────────────────────
const filtered = computed(() => {
  let r = [...store.planograms]
  if (search.value) { const q=search.value.toLowerCase(); r=r.filter(p=>p.name.toLowerCase().includes(q)||p.asset.toLowerCase().includes(q)) }
  if (statusFilter.value!=='all') r=r.filter(p=>p.status===statusFilter.value)
  if (mtGtFilter.value!=='all')   r=r.filter(p=>getMtGt(p.assetType)===mtGtFilter.value)
  if (regionFilter.value!=='all') r=r.filter(p=>p.region===regionFilter.value)
  if (sortKey.value==='compliance')  r.sort((a,b)=>b.compliance-a.compliance)
  if (sortKey.value==='utilization') r.sort((a,b)=>b.utilization-a.utilization)
  if (sortKey.value==='skuCount')    r.sort((a,b)=>b.skuCount-a.skuCount)
  if (sortKey.value==='aiScore')     r.sort((a,b)=>getAiScore(b)-getAiScore(a))
  return r
})

const activeMenuPlano = computed(() =>
  openMenuId.value!==null ? store.planograms.find(p=>p.id===openMenuId.value)??null : null
)

const drawerSections = computed(() => {
  const p = detailsTarget.value; if (!p) return []
  return [
    { heading:'Asset',         rows:[['Name',p.asset],['Type',p.assetType],['Region',p.region],['Channel',getMtGt(p.assetType)]] },
    { heading:'Configuration', rows:[['Racks',String(p.racks)],['Shelves per rack',String(p.shelves)],['SKU count',String(p.skuCount)]] },
    { heading:'Performance',   rows:[['Utilization',`${p.utilization}%`],['Compliance',`${p.compliance}%`],['AI Score',String(getAiScore(p))],['Approval stage',`${p.approvalStage}/3`]] },
    { heading:'History',       rows:[['Created by',p.createdBy],['Last modified',p.modified],['Published',p.published??'Not yet published']] },
  ]
})

// ── helpers ───────────────────────────────────────────────────────────────────
function showToast(msg: string) { toast.value=msg; setTimeout(()=>{toast.value=null},2400) }
function onPageClick() { showNewMenu.value=false }

function toggleMenu(id: number, e: MouseEvent) {
  if (openMenuId.value===id) { openMenuId.value=null; return }
  const r=(e.currentTarget as HTMLElement).getBoundingClientRect()
  menuPos.value={ top:r.bottom+4, right:window.innerWidth-r.right }
  openMenuId.value=id
}

function handleEdit() { detailsTarget.value=null; router.push('/new-planogram') }
function handleToggle(p: Planogram) {
  const next=p.status==='active'?'inactive':'active'
  store.updatePlanogram(p.id,{status:next as Planogram['status']})
  showToast(`"${p.name}" ${next==='active'?'activated':'deactivated'}`)
}
function handleDuplicate(p: Planogram) { store.duplicatePlanogram(p.id); showToast(`"${p.name}" duplicated`) }
function handleDeleteRequest(p: Planogram) { detailsTarget.value=null; deleteTarget.value=p }
function confirmDelete() { if(!deleteTarget.value) return; store.deletePlanogram(deleteTarget.value.id); showToast('Planogram deleted'); deleteTarget.value=null }
function handleRegenerate() { router.push('/ai-generator') }
</script>

<style scoped>
.th {
  padding: 11px 10px;
  font-size: 10px;
  font-weight: 700;
  color: #94A3B8;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  white-space: nowrap;
}
.trow { cursor: pointer; transition: background 0.1s; }
.trow:hover { background: #FAFBFF; }
.mitem { width:100%;display:block;padding:8px 14px;border:none;background:transparent;font-size:13px;font-weight:400;color:#334155;cursor:pointer;text-align:left;line-height:1.4; }
.mitem:hover { background:#F8FAFC; }
.mitem--ai  { font-weight:600;color:#4F46E5; }
.mitem--del { color:#DC2626; }
.mitem--del:hover { background:#FEF2F2; }
.dmitem { width:100%;display:flex;align-items:flex-start;gap:10px;padding:10px 14px;border:none;background:transparent;cursor:pointer;text-align:left; }
.dmitem:hover { background:#F8FAFC; }
.drawer-enter-active,.drawer-leave-active { transition:transform 0.25s ease; }
.drawer-enter-from,.drawer-leave-to { transform:translateX(100%); }
.copilot-enter-active,.copilot-leave-active { transition:transform 0.25s ease; }
.copilot-enter-from,.copilot-leave-to { transform:translateX(100%); }
.modal-fade-enter-active,.modal-fade-leave-active { transition:opacity 0.2s; }
.modal-fade-enter-from,.modal-fade-leave-to { opacity:0; }
.toast-fade-enter-active,.toast-fade-leave-active { transition:opacity 0.2s; }
.toast-fade-enter-from,.toast-fade-leave-to { opacity:0; }
</style>
