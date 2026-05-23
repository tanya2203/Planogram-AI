<template>
  <div>
    <div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:6px;display:flex;align-items:center;gap:5px;">
      {{ label }}
      <span v-if="state.url" style="width:14px;height:14px;border-radius:50%;background:#10B981;display:inline-flex;align-items:center;justify-content:center;">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
      </span>
    </div>

    <!-- SUCCESS state -->
    <div v-if="state.url && state.preview" style="position:relative;border-radius:10px;overflow:hidden;border:2px solid #10B981;">
      <img :src="state.preview" style="width:100%;height:120px;object-fit:cover;display:block;"/>
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg>
        <div style="font-size:10px;color:white;font-weight:600;text-align:center;padding:0 6px;">Uploaded</div>
      </div>
      <button @click="$emit('remove')"
        style="position:absolute;top:6px;right:6px;background:rgba(239,68,68,0.9);border:none;border-radius:5px;padding:3px 8px;font-size:10px;color:white;cursor:pointer;font-weight:600;">
        Remove
      </button>
    </div>

    <!-- UPLOADING state -->
    <div v-else-if="state.uploading" style="border:2px solid #3B82F6;border-radius:10px;padding:20px 16px;background:#EFF6FF;text-align:center;">
      <div style="font-size:12px;font-weight:600;color:#1D4ED8;margin-bottom:8px;">Uploading… {{ state.progress }}%</div>
      <div style="height:6px;background:#BFDBFE;border-radius:3px;overflow:hidden;">
        <div :style="'height:100%;border-radius:3px;background:#3B82F6;transition:width 0.2s;width:'+state.progress+'%'"/>
      </div>
      <div v-if="state.preview" style="margin-top:8px;">
        <img :src="state.preview" style="width:60px;height:50px;object-fit:cover;border-radius:5px;margin:0 auto;display:block;opacity:0.6;"/>
      </div>
    </div>

    <!-- ERROR state -->
    <div v-else-if="state.error" style="border:2px solid #FCA5A5;border-radius:10px;padding:16px;background:#FEF2F2;text-align:center;">
      <div style="font-size:11px;color:#DC2626;font-weight:600;margin-bottom:8px;">{{ state.error }}</div>
      <button @click="$emit('retry')" style="background:#EF4444;color:white;border:none;border-radius:6px;padding:5px 12px;font-size:11px;font-weight:600;cursor:pointer;">Retry</button>
    </div>

    <!-- IDLE state -->
    <div v-else
      @dragenter.prevent="dragging=true"
      @dragleave.prevent="dragging=false"
      @dragover.prevent
      @drop.prevent="onDrop"
      @click="fileInput?.click()"
      :style="'border:2px dashed '+(dragging?'#3B82F6':'#CBD5E1')+';border-radius:10px;padding:20px 12px;text-align:center;background:'+(dragging?'#EFF6FF':'#F8FAFC')+';cursor:pointer;transition:all 0.15s;'"
      @mouseenter="(e:any)=>{e.currentTarget.style.borderColor='#3B82F6';e.currentTarget.style.background='#EFF6FF';}"
      @mouseleave="(e:any)=>{if(!dragging){e.currentTarget.style.borderColor='#CBD5E1';e.currentTarget.style.background='#F8FAFC';}}"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5" style="margin:0 auto 7px;display:block;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      <div style="font-size:11px;font-weight:600;color:#475569;margin-bottom:2px;">Drop or click to upload</div>
      <div style="font-size:10px;color:#94A3B8;">JPG, PNG, WebP · max 10 MB</div>
      <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" style="display:none;" @change="onInput"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { UploadState } from '~/composables/useAzureBlob'

defineProps<{
  side: 'front' | 'back' | 'left'
  label: string
  state: UploadState
}>()

const emit = defineEmits<{
  pick: [file: File]
  remove: []
  retry: []
}>()

const dragging  = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function onDrop(e: DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) emit('pick', file)
}

function onInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) emit('pick', file)
  ;(e.target as HTMLInputElement).value = ''
}
</script>
