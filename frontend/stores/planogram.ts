import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Asset {
  id: number; name: string; type: string; shelves: number
  w: number; h: number; d: number; region: string; img: string
  status: 'active' | 'draft'
}

export interface SKU {
  id: number; name: string; brand: string; cat: string; variant: string
  w: number; h: number; d: number; minF: number; maxF: number
  defaultF: number; mandatory: boolean; color: string
  // packshot / extended fields
  sku_code: string
  mandatory_flag: boolean
  front_packshot_url: string | null
  back_packshot_url:  string | null
  left_packshot_url:  string | null
}

export interface Planogram {
  id: number; name: string; asset: string; assetType: string; assetImg: string
  racks: number; shelves: number; skuCount: number
  status: 'active' | 'draft' | 'pending' | 'inactive' | 'archived'
  region: string; createdBy: string; modified: string; published: string | null
  compliance: number; utilization: number; approvalStage: number
}

export const ASSETS: Asset[] = [
  { id:1, name:'Beer Cooler BC-6D',     type:'Visicooler', shelves:6, w:90,  h:180, d:60,  region:'North', img:'🍺', status:'active' },
  { id:2, name:'Gondola G-4S',          type:'Gondola',    shelves:4, w:120, h:160, d:45,  region:'South', img:'🗄️', status:'active' },
  { id:3, name:'End Cap EC-2',          type:'End Cap',    shelves:3, w:80,  h:140, d:40,  region:'West',  img:'🏷️', status:'draft'  },
  { id:4, name:'Counter Display CD-1',  type:'Counter',    shelves:2, w:60,  h:80,  d:30,  region:'East',  img:'🔲', status:'active' },
  { id:5, name:'Rack R-6S',             type:'Rack',       shelves:6, w:100, h:200, d:50,  region:'North', img:'📦', status:'active' },
  { id:6, name:'Shelf Unit SU-3',       type:'Shelf',      shelves:3, w:75,  h:120, d:35,  region:'South', img:'🏪', status:'draft'  },
]

function skuCode(name: string, brand: string) {
  return `${brand.substring(0,3).toUpperCase()}-${name.replace(/\s+/g,'').substring(0,8).toUpperCase()}`
}

export const SKUS: SKU[] = [
  { id:1,  name:'Kingfisher Prem 650ml', brand:'Kingfisher', cat:'Lager',   variant:'650ml', w:7,  h:22, d:7,  minF:2, maxF:6, defaultF:3, mandatory:true,  color:'#1D4ED8', sku_code:'KIN-KINGFISHE', mandatory_flag:true,  front_packshot_url:null, back_packshot_url:null, left_packshot_url:null },
  { id:2,  name:'Kingfisher Strong 650', brand:'Kingfisher', cat:'Strong',  variant:'650ml', w:7,  h:22, d:7,  minF:2, maxF:6, defaultF:3, mandatory:true,  color:'#2563EB', sku_code:'KIN-KINGFISHE', mandatory_flag:true,  front_packshot_url:null, back_packshot_url:null, left_packshot_url:null },
  { id:3,  name:'Heineken 330ml',        brand:'Heineken',   cat:'Lager',   variant:'330ml', w:6,  h:18, d:6,  minF:2, maxF:8, defaultF:4, mandatory:true,  color:'#16A34A', sku_code:'HEI-HEINEKEN3', mandatory_flag:true,  front_packshot_url:null, back_packshot_url:null, left_packshot_url:null },
  { id:4,  name:'Heineken 650ml',        brand:'Heineken',   cat:'Lager',   variant:'650ml', w:7,  h:24, d:7,  minF:1, maxF:4, defaultF:2, mandatory:false, color:'#15803D', sku_code:'HEI-HEINEKEN6', mandatory_flag:false, front_packshot_url:null, back_packshot_url:null, left_packshot_url:null },
  { id:5,  name:'KF Ultra 330ml',        brand:'Kingfisher', cat:'Premium', variant:'330ml', w:6,  h:18, d:6,  minF:2, maxF:6, defaultF:3, mandatory:false, color:'#7C3AED', sku_code:'KIN-KFULTRA33', mandatory_flag:false, front_packshot_url:null, back_packshot_url:null, left_packshot_url:null },
  { id:6,  name:'KF Premium 330ml',      brand:'Kingfisher', cat:'Lager',   variant:'330ml', w:6,  h:18, d:6,  minF:2, maxF:8, defaultF:4, mandatory:false, color:'#3B82F6', sku_code:'KIN-KFPREMIUM', mandatory_flag:false, front_packshot_url:null, back_packshot_url:null, left_packshot_url:null },
  { id:7,  name:'Amstel 330ml',          brand:'Amstel',     cat:'Lager',   variant:'330ml', w:6,  h:18, d:6,  minF:1, maxF:6, defaultF:3, mandatory:false, color:'#DC2626', sku_code:'AMS-AMSTEL330', mandatory_flag:false, front_packshot_url:'https://faiimagedetection.blob.core.windows.net/planogrammaster/packshots/amstel/Amster_330ml.jpg?sv=2023-01-03&st=2026-05-16T13%3A25%3A16Z&se=2027-06-17T13%3A25%3A00Z&sr=c&sp=racwdxlf&sig=Fca2jLmC6eRjORcDc%2FJ5Md5rDpugey1uxT2Becuo4lg%3D', back_packshot_url:null, left_packshot_url:null },
  { id:8,  name:'Heineken 0.0 330ml',    brand:'Heineken',   cat:'N/A',     variant:'330ml', w:6,  h:18, d:6,  minF:1, maxF:4, defaultF:2, mandatory:false, color:'#059669', sku_code:'HEI-HEINEKEN0', mandatory_flag:false, front_packshot_url:null, back_packshot_url:null, left_packshot_url:null },
  { id:9,  name:'KF Storm 500ml',        brand:'Kingfisher', cat:'Strong',  variant:'500ml', w:6,  h:20, d:6,  minF:1, maxF:4, defaultF:2, mandatory:false, color:'#1E40AF', sku_code:'KIN-KFSTORM50', mandatory_flag:false, front_packshot_url:null, back_packshot_url:null, left_packshot_url:null },
  { id:10, name:'KF Draught 330ml',      brand:'Kingfisher', cat:'Draught', variant:'330ml', w:6,  h:18, d:6,  minF:2, maxF:6, defaultF:3, mandatory:false, color:'#1E3A8A', sku_code:'KIN-KFDRAUGH3', mandatory_flag:false, front_packshot_url:null, back_packshot_url:null, left_packshot_url:null },
  { id:11, name:'Heineken Silver 330ml', brand:'Heineken',   cat:'Light',   variant:'330ml', w:6,  h:18, d:6,  minF:1, maxF:4, defaultF:2, mandatory:false, color:'#6EE7B7', sku_code:'HEI-HNKSilver', mandatory_flag:false, front_packshot_url:'https://faiimagedetection.blob.core.windows.net/planogrammaster/packshots/HNKSilver/HNK%20Silver%20330%20ml%20can.jpg?sv=2023-01-03&st=2026-05-16T13%3A25%3A16Z&se=2027-06-17T13%3A25%3A00Z&sr=c&sp=racwdxlf&sig=Fca2jLmC6eRjORcDc%2FJ5Md5rDpugey1uxT2Becuo4lg%3D', back_packshot_url:null, left_packshot_url:null },
  { id:12, name:'KF Radler 330ml',       brand:'Kingfisher', cat:'Radler',  variant:'330ml', w:6,  h:18, d:6,  minF:1, maxF:4, defaultF:2, mandatory:false, color:'#FCD34D', sku_code:'KIN-KFRADLER3', mandatory_flag:false, front_packshot_url:'https://faiimagedetection.blob.core.windows.net/planogrammaster/packshots/KFPremium/KF%20330_PREMIUM.png?sv=2023-01-03&st=2026-05-16T13%3A25%3A16Z&se=2027-06-17T13%3A25%3A00Z&sr=c&sp=racwdxlf&sig=Fca2jLmC6eRjORcDc%2FJ5Md5rDpugey1uxT2Becuo4lg%3D', back_packshot_url:null, left_packshot_url:null },
]

const PLANOGRAMS_SEED: Planogram[] = [
  { id:1,  name:'Q2 MT Beer Cooler – KF Block',     asset:'Beer Cooler BC-6D',    assetType:'Visicooler', assetImg:'🍺', racks:2, shelves:6, skuCount:9,  status:'active',   region:'North', createdBy:'Aditi S.',  modified:'May 12, 2025', published:'May 13, 2025', compliance:87, utilization:74, approvalStage:3 },
  { id:2,  name:'South Gondola Premium Lager',       asset:'Gondola G-4S',         assetType:'Gondola',    assetImg:'🗄️',racks:3, shelves:4, skuCount:11, status:'active',   region:'South', createdBy:'Rajan M.',  modified:'May 10, 2025', published:'May 11, 2025', compliance:91, utilization:82, approvalStage:3 },
  { id:3,  name:'West End Cap Lager Display',        asset:'End Cap EC-2',          assetType:'End Cap',    assetImg:'🏷️',racks:1, shelves:3, skuCount:5,  status:'draft',    region:'West',  createdBy:'Sneha P.',  modified:'May 14, 2025', published:null,            compliance:62, utilization:48, approvalStage:0 },
  { id:4,  name:'East Counter Radler Display',       asset:'Counter Display CD-1',  assetType:'Counter',    assetImg:'🔲',racks:1, shelves:2, skuCount:7,  status:'pending',  region:'East',  createdBy:'Vivek T.',  modified:'May 11, 2025', published:null,            compliance:78, utilization:65, approvalStage:1 },
  { id:5,  name:'North Rack Beverages Q2',           asset:'Rack R-6S',             assetType:'Rack',       assetImg:'📦',racks:4, shelves:6, skuCount:12, status:'active',   region:'North', createdBy:'Aditi S.',  modified:'May 9, 2025',  published:'May 10, 2025', compliance:84, utilization:79, approvalStage:3 },
  { id:6,  name:'South Shelf NA Options',            asset:'Shelf Unit SU-3',       assetType:'Shelf',      assetImg:'🏪',racks:2, shelves:3, skuCount:4,  status:'inactive', region:'South', createdBy:'Kiran D.',  modified:'Apr 28, 2025', published:'May 1, 2025',  compliance:71, utilization:55, approvalStage:3 },
  { id:7,  name:'North Cooler Strong Push',          asset:'Beer Cooler BC-6D',     assetType:'Visicooler', assetImg:'🍺',racks:2, shelves:6, skuCount:6,  status:'draft',    region:'North', createdBy:'Rajan M.',  modified:'May 14, 2025', published:null,            compliance:54, utilization:41, approvalStage:0 },
  { id:8,  name:'Pan-India Gondola Planogram',       asset:'Gondola G-4S',          assetType:'Gondola',    assetImg:'🗄️',racks:3, shelves:4, skuCount:10, status:'pending',  region:'West',  createdBy:'Sneha P.',  modified:'May 13, 2025', published:null,            compliance:80, utilization:70, approvalStage:2 },
  { id:9,  name:'Q1 Archive – Lager Block',          asset:'End Cap EC-2',          assetType:'End Cap',    assetImg:'🏷️',racks:1, shelves:3, skuCount:4,  status:'archived', region:'East',  createdBy:'Vivek T.',  modified:'Mar 3, 2025',  published:'Mar 5, 2025',  compliance:76, utilization:60, approvalStage:3 },
]

export const SHELF_LABELS = ['Eye Level','Top Shelf','Mid Shelf','Lower Mid','Bottom Shelf']

export const INIT_PLACEMENTS: (number|null)[][] = [
  [1, 2, 3, null, null, 6, 6],
  [4, 4, null, 5, 5, null, null],
  [7, null, null, null, 11, 11, 11],
  [8, 8, 9, 9, null, 12, null],
  [10, 10, null, null, 3, 3, 3],
]

export const ANALYTICS_TREND = Array.from({ length:12 }, (_,i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  utilization: 55 + Math.round(Math.sin(i/2)*12 + i*1.3),
  compliance: 60 + Math.round(i*2.5),
  revenue: 1200 + Math.round(i*80),
}))

export const SOS_DATA = [
  { name:'Kingfisher', value:38, color:'#1D4ED8' },
  { name:'Heineken',   value:28, color:'#16A34A' },
  { name:'Amstel',     value:14, color:'#DC2626' },
  { name:'Others',     value:20, color:'#94A3B8' },
]

export const REGION_DATA = [
  { region:'North', planograms:48, compliance:87, uplift:12.4 },
  { region:'South', planograms:35, compliance:91, uplift:9.8  },
  { region:'East',  planograms:29, compliance:78, uplift:7.2  },
  { region:'West',  planograms:41, compliance:83, uplift:11.1 },
]

export interface IdealViewUrls {
  front: string | null
  back:  string | null
  left:  string | null
}

const SAS = '?sv=2023-01-03&st=2026-05-16T13%3A25%3A16Z&se=2027-06-17T13%3A25%3A00Z&sr=c&sp=racwdxlf&sig=Fca2jLmC6eRjORcDc%2FJ5Md5rDpugey1uxT2Becuo4lg%3D'
const BASE = 'https://faiimagedetection.blob.core.windows.net/planogrammaster'

export function appendSas(url: string | null): string | null {
  if (!url) return null
  if (url.includes('?sv=')) return url  // already has SAS
  return url + SAS
}

export const IDEAL_IMAGES: Record<number, IdealViewUrls> = {
  1: {
    front: `${BASE}/ideal-planograms/asset-1/front.jpg${SAS}`,
    back:  null,
    left:  null,
  },
  2: {
    front: `${BASE}/ideal-planograms/asset-2/front.jpg${SAS}`,
    back:  null,
    left:  null,
  },
}

export const usePlanogramStore = defineStore('planogram', () => {
  const planograms = ref<Planogram[]>(JSON.parse(JSON.stringify(PLANOGRAMS_SEED)))
  const assets = ref<Asset[]>(ASSETS)
  const skus = ref<SKU[]>(SKUS)
  const idealImages = ref<Record<number, IdealViewUrls>>(
    JSON.parse(JSON.stringify(IDEAL_IMAGES))
  )

  function addPlanogram(p: Planogram) {
    planograms.value.unshift(p)
  }

  function updatePlanogram(id: number, changes: Partial<Planogram>) {
    const idx = planograms.value.findIndex(p => p.id === id)
    if (idx >= 0) planograms.value[idx] = { ...planograms.value[idx], ...changes }
  }

  function deletePlanogram(id: number) {
    planograms.value = planograms.value.filter(p => p.id !== id)
  }

  function duplicatePlanogram(id: number): Planogram | null {
    const src = planograms.value.find(p => p.id === id)
    if (!src) return null
    const clone: Planogram = { ...src, id: Date.now(), name: `${src.name} (Copy)`, status: 'draft', modified: 'Today', published: null }
    planograms.value.unshift(clone)
    return clone
  }

  function toggleStatus(id: number) {
    const p = planograms.value.find(p => p.id === id)
    if (!p) return
    p.status = p.status === 'active' ? 'inactive' : 'active'
  }

  function addAsset(a: Omit<Asset, 'id'>) {
    const newId = Math.max(0, ...assets.value.map(x => x.id)) + 1
    assets.value.push({ ...a, id: newId })
  }

  function updateAsset(id: number, changes: Partial<Asset>) {
    const idx = assets.value.findIndex(a => a.id === id)
    if (idx >= 0) assets.value[idx] = { ...assets.value[idx], ...changes }
  }

  function deleteAsset(id: number) {
    assets.value = assets.value.filter(a => a.id !== id)
  }

  function duplicateAsset(id: number) {
    const src = assets.value.find(a => a.id === id)
    if (!src) return
    const newId = Math.max(0, ...assets.value.map(x => x.id)) + 1
    assets.value.push({ ...src, id: newId, name: `${src.name} (Copy)`, status: 'draft' })
  }

  function addSKU(s: Omit<SKU, 'id'>) {
    const newId = Math.max(0, ...skus.value.map(x => x.id)) + 1
    skus.value.unshift({ ...s, id: newId })
  }

  function updateSKUPackshots(id: number, urls: { front?: string|null; back?: string|null; left?: string|null }) {
    const sku = skus.value.find(s => s.id === id)
    if (!sku) return
    if (urls.front !== undefined) sku.front_packshot_url = urls.front
    if (urls.back  !== undefined) sku.back_packshot_url  = urls.back
    if (urls.left  !== undefined) sku.left_packshot_url  = urls.left
  }

  function updateIdealImage(assetId: number, view: 'front' | 'back' | 'left', url: string) {
    if (!idealImages.value[assetId]) {
      idealImages.value[assetId] = { front: null, back: null, left: null }
    }
    idealImages.value[assetId][view] = url
  }

  return { planograms, assets, skus, idealImages, addPlanogram, updatePlanogram, deletePlanogram, duplicatePlanogram, toggleStatus, addAsset, updateAsset, deleteAsset, duplicateAsset, addSKU, updateSKUPackshots, updateIdealImage }
})
