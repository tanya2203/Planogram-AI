import { Router } from 'express'
import { SKUS, TENANT_ID } from '../data/mock.js'

const router = Router()
let skus = [...SKUS]

router.get('/', (req, res) => {
  const { category, brand, tier } = req.query
  let filtered = skus.filter(s => s.tenantId === TENANT_ID && s.isActive)
  if (category) filtered = filtered.filter(s => s.category === category)
  if (brand) filtered = filtered.filter(s => s.brand === brand)
  if (tier) filtered = filtered.filter(s => s.tier === tier)
  res.json(filtered)
})

router.get('/:id', (req, res) => {
  const sku = skus.find(s => s.id === req.params.id && s.tenantId === TENANT_ID)
  if (!sku) return res.status(404).json({ error: 'SKU not found' }) as any
  res.json(sku)
})

router.patch('/:id/tier', (req, res) => {
  const { tier } = req.body
  const validTiers = ['MANDATORY', 'EYE_LEVEL_HERO', 'NEW_LAUNCH', 'PRIORITY', 'EXCLUDED', 'STANDARD']
  if (!validTiers.includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier' }) as any
  }
  const idx = skus.findIndex(s => s.id === req.params.id && s.tenantId === TENANT_ID)
  if (idx === -1) return res.status(404).json({ error: 'SKU not found' }) as any
  skus[idx] = { ...skus[idx], tier }
  res.json(skus[idx])
})

export default router
