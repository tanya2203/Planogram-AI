import { Router } from 'express'
import { ANALYTICS_SUMMARY, PLANOGRAMS, TENANT_ID } from '../data/mock.js'

const router = Router()

router.get('/summary', (req, res) => {
  res.json(ANALYTICS_SUMMARY)
})

router.get('/planogram/:id', (req, res) => {
  const planogram = PLANOGRAMS.find(
    p => p.id === req.params.id && p.tenantId === TENANT_ID
  )
  if (!planogram) return res.status(404).json({ error: 'Not found' }) as any
  res.json({
    id: planogram.id,
    name: planogram.name,
    complianceScore: planogram.complianceScore,
    utilizationPct: planogram.utilizationPct,
    sosScore: planogram.sosScore,
    revenueIndex: planogram.revenueIndex
  })
})

export default router
