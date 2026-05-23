import { Router } from 'express'
import { z } from 'zod'
import { PLANOGRAMS, ASSETS, TENANT_ID } from '../data/mock.js'

const router = Router()

let planograms = [...PLANOGRAMS]

router.get('/', (req, res) => {
  const { status, region, search, page = '1', limit = '20' } = req.query

  let filtered = planograms.filter(p => p.tenantId === TENANT_ID)

  if (status) filtered = filtered.filter(p => p.status === status)
  if (region) filtered = filtered.filter(p => p.region === region)
  if (search) {
    const s = (search as string).toLowerCase()
    filtered = filtered.filter(p => p.name.toLowerCase().includes(s))
  }

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)
  const total = filtered.length
  const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum)

  const withAssets = paginated.map(p => ({
    ...p,
    asset: ASSETS.find(a => a.id === p.assetId) || null
  }))

  res.json({ planograms: withAssets, total, page: pageNum, limit: limitNum })
})

router.get('/:id', (req, res) => {
  const planogram = planograms.find(
    p => p.id === req.params.id && p.tenantId === TENANT_ID
  )
  if (!planogram) return res.status(404).json({ error: 'Planogram not found' }) as any

  const asset = ASSETS.find(a => a.id === planogram.assetId)
  res.json({ ...planogram, asset })
})

const CreateSchema = z.object({
  assetId: z.string(),
  name: z.string().min(3),
  outletType: z.string().optional(),
  region: z.string().optional(),
  quarter: z.string().optional()
})

router.post('/', (req, res) => {
  const parsed = CreateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() }) as any
  }

  const asset = ASSETS.find(a => a.id === parsed.data.assetId)
  if (!asset) return res.status(404).json({ error: 'Asset not found' }) as any

  const newPlanogram = {
    id: 'pg_' + Date.now(),
    tenantId: TENANT_ID,
    createdByFaId: 'fa_user_001',
    approvalStage: 0,
    status: 'DRAFT',
    complianceScore: 0,
    utilizationPct: 0,
    sosScore: 0,
    revenueIndex: 0,
    idealImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...parsed.data
  }

  planograms.push(newPlanogram)
  res.status(201).json(newPlanogram)
})

router.patch('/:id', (req, res) => {
  const idx = planograms.findIndex(
    p => p.id === req.params.id && p.tenantId === TENANT_ID
  )
  if (idx === -1) return res.status(404).json({ error: 'Not found' }) as any

  planograms[idx] = { ...planograms[idx], ...req.body, updatedAt: new Date() }
  res.json(planograms[idx])
})

router.delete('/:id', (req, res) => {
  const idx = planograms.findIndex(
    p => p.id === req.params.id && p.tenantId === TENANT_ID
  )
  if (idx === -1) return res.status(404).json({ error: 'Not found' }) as any

  planograms[idx] = { ...planograms[idx], status: 'ARCHIVED', updatedAt: new Date() }
  res.json({ success: true })
})

router.post('/:id/approve', (req, res) => {
  const idx = planograms.findIndex(
    p => p.id === req.params.id && p.tenantId === TENANT_ID
  )
  if (idx === -1) return res.status(404).json({ error: 'Not found' }) as any

  const { action } = req.body
  const p = planograms[idx]

  if (action === 'SUBMITTED') {
    planograms[idx] = { ...p, approvalStage: 1, status: 'PENDING', updatedAt: new Date() }
  } else if (action === 'APPROVED') {
    if (p.approvalStage === 1) {
      planograms[idx] = { ...p, approvalStage: 2, updatedAt: new Date() }
    } else if (p.approvalStage === 2) {
      planograms[idx] = { ...p, approvalStage: 3, status: 'ACTIVE', updatedAt: new Date() }
    }
  } else if (action === 'REJECTED') {
    planograms[idx] = { ...p, approvalStage: 0, status: 'DRAFT', updatedAt: new Date() }
  }

  res.json(planograms[idx])
})

export default router
