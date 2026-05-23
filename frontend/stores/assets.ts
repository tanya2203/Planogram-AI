import { defineStore } from 'pinia'
import { ref } from 'vue'

export type AssetType = 'Visicooler' | 'Gondola' | 'End Cap' | 'Counter' | 'Rack' | 'Shelf'

export const ASSET_TYPES: AssetType[] = ['Visicooler', 'Gondola', 'End Cap', 'Counter', 'Rack', 'Shelf']

export const COMPLIANCE_BY_TYPE: Record<AssetType, number> = {
  Visicooler: 80,
  Gondola:    75,
  'End Cap':  70,
  Counter:    70,
  Rack:       75,
  Shelf:      70,
}

export const TYPE_EMOJI: Record<AssetType, string> = {
  Visicooler: '🍺',
  Gondola:    '🏪',
  'End Cap':  '🗂️',
  Counter:    '🛒',
  Rack:       '📦',
  Shelf:      '🗃️',
}

export interface Asset {
  id: number
  name: string
  type: AssetType
  shelves: number
  max_racks: number
  width_cm: number
  height_cm: number
  depth_cm: number
  region: string
  status: 'active' | 'draft'
  img: string
  is_ir_asset: boolean
  outlet_type: string
  compliance_threshold: number
  ideal_planogram_image_url: string | null
  erp_id: string
  notes: string
  created_at: string
  updated_at: string
}

const NOW = new Date().toISOString()

const INITIAL_ASSETS: Asset[] = [
  { id:1, name:'Beer Cooler BC-6D',    type:'Visicooler', shelves:6, max_racks:2, width_cm:90,  height_cm:180, depth_cm:60, region:'North', status:'active', img:'🍺', is_ir_asset:true,  outlet_type:'Modern Trade',   compliance_threshold:80, ideal_planogram_image_url:null, erp_id:'BC6D-001', notes:'', created_at:NOW, updated_at:NOW },
  { id:2, name:'Gondola G-4S',         type:'Gondola',    shelves:4, max_racks:3, width_cm:120, height_cm:160, depth_cm:45, region:'South', status:'active', img:'🏪', is_ir_asset:false, outlet_type:'Modern Trade',   compliance_threshold:75, ideal_planogram_image_url:null, erp_id:'G4S-001',  notes:'', created_at:NOW, updated_at:NOW },
  { id:3, name:'End Cap EC-2',         type:'End Cap',    shelves:3, max_racks:1, width_cm:80,  height_cm:140, depth_cm:40, region:'West',  status:'draft',  img:'🗂️', is_ir_asset:false, outlet_type:'Modern Trade',   compliance_threshold:70, ideal_planogram_image_url:null, erp_id:'EC2-001',  notes:'', created_at:NOW, updated_at:NOW },
  { id:4, name:'Counter Display CD-1', type:'Counter',    shelves:2, max_racks:1, width_cm:60,  height_cm:80,  depth_cm:30, region:'East',  status:'active', img:'🛒', is_ir_asset:false, outlet_type:'General Trade',  compliance_threshold:70, ideal_planogram_image_url:null, erp_id:'CD1-001',  notes:'', created_at:NOW, updated_at:NOW },
  { id:5, name:'Rack R-6S',            type:'Rack',       shelves:6, max_racks:4, width_cm:100, height_cm:200, depth_cm:50, region:'North', status:'active', img:'📦', is_ir_asset:false, outlet_type:'Modern Trade',   compliance_threshold:75, ideal_planogram_image_url:null, erp_id:'R6S-001',  notes:'', created_at:NOW, updated_at:NOW },
  { id:6, name:'Shelf Unit SU-3',      type:'Shelf',      shelves:3, max_racks:2, width_cm:75,  height_cm:120, depth_cm:35, region:'South', status:'draft',  img:'🗃️', is_ir_asset:false, outlet_type:'General Trade',  compliance_threshold:70, ideal_planogram_image_url:null, erp_id:'SU3-001',  notes:'', created_at:NOW, updated_at:NOW },
]

export const useAssetStore = defineStore('assets', () => {
  const assets = ref<Asset[]>(JSON.parse(JSON.stringify(INITIAL_ASSETS)))

  function addAsset(data: Omit<Asset, 'id'>): Asset {
    const a: Asset = { ...data, id: Date.now() }
    assets.value.unshift(a)
    return a
  }

  function updateAsset(id: number, updates: Partial<Omit<Asset, 'id'>>) {
    const idx = assets.value.findIndex(a => a.id === id)
    if (idx >= 0) assets.value[idx] = { ...assets.value[idx], ...updates }
  }

  function deleteAsset(id: number) {
    assets.value = assets.value.filter(a => a.id !== id)
  }

  function duplicateAsset(id: number): Asset | null {
    const src = assets.value.find(a => a.id === id)
    if (!src) return null
    const clone: Asset = {
      ...src, id: Date.now(),
      name: `${src.name} (Copy)`,
      status: 'draft',
      ideal_planogram_image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    assets.value.unshift(clone)
    return clone
  }

  return { assets, addAsset, updateAsset, deleteAsset, duplicateAsset }
})
