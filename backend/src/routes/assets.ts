import { Router } from 'express'
import { z } from 'zod'
import { ASSETS, TENANT_ID } from '../data/mock.js'

const router = Router()
let assets = [...ASSETS]

router.get('/', (req, res) => {
  const { type, region } = req.query
  let filtered = assets.filter(a => a.tenantId === TENANT_ID && a.isActive)
  if (type) filtered = filtered.filter(a => a.type === type)
  if (region) filtered = filtered.filter(a => a.region === region)
  res.json(filtered)
})

router.get('/:id', (req, res) => {
  const asset = assets.find(
    a => a.id === req.params.id && a.tenantId === TENANT_ID
  )
  if (!asset) return res.status(404).json({ error: 'Asset not found' }) as any
  res.json(asset)
})

router.post('/', (req, res) => {
  const Schema = z.object({
    name: z.string().min(2),
    type: z.enum(['SINGLE_DOOR_COOLER', 'DOUBLE_DOOR_COOLER']),
    widthCm: z.number().positive(),
    heightCm: z.number().positive(),
    depthCm: z.number().positive(),
    shelfCount: z.number().int().min(1),
    region: z.string().optional()
  })
  const parsed = Schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() }) as any
  }
  const newAsset = {
    id: 'asset_' + Date.now(),
    tenantId: TENANT_ID,
    faAssetDefinitionId: null,
    faEquipmentId: null,
    faLocationId: null,
    faSerialNumber: null,
    outletId: null,
    rackCount: 1,
    iconUrl: null,
    isActive: true,
    createdAt: new Date(),
    ...parsed.data
  }
  assets.push(newAsset)
  res.status(201).json(newAsset)
})

export default router
