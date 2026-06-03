import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface OutletAsset {
  assetId: number
  quantity: number
}

export const OUTLET_FORMATS = ['Hypermarket', 'Supermarket', 'Convenience', 'Bar', 'Restaurant', 'Kiosk'] as const
export type OutletFormat = typeof OUTLET_FORMATS[number]

export interface Outlet {
  id:           number
  name:         string
  code:         string
  channel:      'MT' | 'GT'
  region:       string
  city:         string
  tier:         'A' | 'B' | 'C'
  format:       OutletFormat
  manager:      string
  status:       'active' | 'inactive'
  assets:       OutletAsset[]
  planogramIds: number[]
  created_at:   string
  updated_at:   string
}

const NOW = new Date().toISOString()

const INITIAL_OUTLETS: Outlet[] = [
  {
    id: 1, name: 'Reliance Smart Koramangala', code: 'RLN-KRM-001',
    channel: 'MT', region: 'South', city: 'Bangalore', tier: 'A', format: 'Supermarket',
    manager: 'Rahul Verma', status: 'active',
    assets: [{ assetId: 1, quantity: 2 }, { assetId: 2, quantity: 1 }],
    planogramIds: [2], created_at: NOW, updated_at: NOW,
  },
  {
    id: 2, name: 'DMart Andheri West', code: 'DMT-ANW-001',
    channel: 'MT', region: 'West', city: 'Mumbai', tier: 'A', format: 'Hypermarket',
    manager: 'Priya Shah', status: 'active',
    assets: [{ assetId: 1, quantity: 3 }, { assetId: 5, quantity: 2 }],
    planogramIds: [5], created_at: NOW, updated_at: NOW,
  },
  {
    id: 3, name: 'Sharma General Store', code: 'SGS-PNE-001',
    channel: 'GT', region: 'West', city: 'Pune', tier: 'B', format: 'Convenience',
    manager: 'Rohit Sharma', status: 'active',
    assets: [{ assetId: 4, quantity: 1 }],
    planogramIds: [], created_at: NOW, updated_at: NOW,
  },
  {
    id: 4, name: 'Star Bazaar Connaught Place', code: 'STR-CPL-001',
    channel: 'MT', region: 'North', city: 'Delhi', tier: 'A', format: 'Supermarket',
    manager: 'Anita Gupta', status: 'active',
    assets: [{ assetId: 2, quantity: 2 }, { assetId: 3, quantity: 1 }],
    planogramIds: [1, 8], created_at: NOW, updated_at: NOW,
  },
  {
    id: 5, name: 'Local Bar MG Road', code: 'LBR-MGR-001',
    channel: 'GT', region: 'South', city: 'Bangalore', tier: 'C', format: 'Bar',
    manager: 'Suresh Kumar', status: 'active',
    assets: [{ assetId: 4, quantity: 2 }],
    planogramIds: [], created_at: NOW, updated_at: NOW,
  },
  {
    id: 6, name: 'More Megastore Salt Lake', code: 'MRE-SLK-001',
    channel: 'MT', region: 'East', city: 'Kolkata', tier: 'B', format: 'Hypermarket',
    manager: 'Debashish Roy', status: 'inactive',
    assets: [{ assetId: 1, quantity: 1 }, { assetId: 2, quantity: 1 }, { assetId: 5, quantity: 1 }],
    planogramIds: [5, 6], created_at: NOW, updated_at: NOW,
  },
]

export const useOutletStore = defineStore('outlets', () => {
  const outlets = ref<Outlet[]>(JSON.parse(JSON.stringify(INITIAL_OUTLETS)))

  function addOutlet(data: Omit<Outlet, 'id'>): Outlet {
    const o: Outlet = { ...data, id: Date.now() }
    outlets.value.unshift(o)
    return o
  }

  function updateOutlet(id: number, changes: Partial<Omit<Outlet, 'id'>>) {
    const idx = outlets.value.findIndex(o => o.id === id)
    if (idx >= 0) outlets.value[idx] = { ...outlets.value[idx], ...changes, updated_at: new Date().toISOString() }
  }

  function deleteOutlet(id: number) {
    outlets.value = outlets.value.filter(o => o.id !== id)
  }

  return { outlets, addOutlet, updateOutlet, deleteOutlet }
})
