import { Router } from 'express'
import { SKUS, ASSETS } from '../data/mock.js'

const router = Router()

const ZONE_MULTIPLIERS: Record<number, number> = {
  0: 1.4, 1: 1.15, 2: 1.0, 3: 0.8, 4: 0.6
}

function buildGrid(skuIds: string[], rows: number, cols: number) {
  const grid: (string | null)[][] = Array.from(
    { length: rows }, () => Array(cols).fill(null)
  )
  let col = 0, row = 0
  for (const id of skuIds) {
    if (row >= rows) break
    grid[row][col] = id
    col++
    if (col >= cols) { col = 0; row++ }
  }
  return grid
}

function scoreGrid(
  grid: (string | null)[][],
  skuMap: Map<string, any>,
  weights: any,
  mandatoryIds: string[]
) {
  let revenueScore = 0
  let totalCells = 0
  const brandsPresent = new Set<string>()

  grid.forEach((row, rowIdx) => {
    const multiplier = ZONE_MULTIPLIERS[Math.min(rowIdx, 4)] ?? 0.6
    row.forEach(cell => {
      if (!cell) return
      const sku = skuMap.get(cell)
      if (!sku) return
      revenueScore += sku.mrp * multiplier
      totalCells++
      brandsPresent.add(sku.brand)
    })
  })

  const maxRevenue = totalCells * 220 * 1.4
  const revenue = Math.min((revenueScore / maxRevenue) * 100, 100)

  const mandatoryAtEyeLevel = mandatoryIds.filter(
    id => grid[0]?.includes(id)
  ).length
  const compliance = mandatoryIds.length > 0
    ? (mandatoryAtEyeLevel / mandatoryIds.length) * 100
    : 100

  const totalBrands = [...new Set(SKUS.map(s => s.brand))].length
  const sos = (brandsPresent.size / totalBrands) * 100

  const eyeLevel = grid[0]
    ? (grid[0].filter(Boolean).length / grid[0].length) * 100
    : 0

  const total = (
    revenue * (weights.revenue / 100) +
    sos * (weights.sos / 100) +
    compliance * (weights.compliance / 100) +
    eyeLevel * (weights.eyeLevel / 100)
  )

  return {
    total: Math.round(total),
    revenue: Math.round(revenue),
    sos: Math.round(sos),
    compliance: Math.round(compliance),
    eyeLevel: Math.round(eyeLevel)
  }
}

router.post('/candidates', (req, res) => {
  const { assetId, skuPoolIds = [], weights, objConfig = {} } = req.body

  const asset = ASSETS.find(a => a.id === assetId) || ASSETS[0]
  const rows = asset.shelfCount
  const cols = 7

  const poolSkus = SKUS.filter(s =>
    (skuPoolIds.length === 0 || skuPoolIds.includes(s.id)) &&
    !((objConfig.excludedIds || []).includes(s.id))
  )

  const skuMap = new Map(poolSkus.map(s => [s.id, s]))
  const mandatory = poolSkus.filter(s => s.tier === 'MANDATORY')
  const mandatoryIds = mandatory.map(s => s.id)
  const optional = poolSkus.filter(s => s.tier !== 'MANDATORY')

  const defaultWeights = {
    revenue: 25, sos: 25, compliance: 25, eyeLevel: 25,
    ...weights
  }

  const revenueOrder = [
    ...mandatory,
    ...optional.sort((a, b) => b.mrp - a.mrp)
  ].map(s => s.id)

  const brandOrder = [
    ...mandatory,
    ...optional.sort((a, b) => a.brand.localeCompare(b.brand))
  ].map(s => s.id)

  const tierOrder = ['EYE_LEVEL_HERO', 'NEW_LAUNCH', 'PRIORITY', 'STANDARD']
  const complianceOrder = [
    ...mandatory,
    ...optional.sort((a, b) =>
      tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
    )
  ].map(s => s.id)

  const candidateA = buildGrid(revenueOrder, rows, cols)
  const candidateB = buildGrid(brandOrder, rows, cols)
  const candidateC = buildGrid(complianceOrder, rows, cols)

  const scoreA = scoreGrid(candidateA, skuMap, defaultWeights, mandatoryIds)
  const scoreB = scoreGrid(candidateB, skuMap, defaultWeights, mandatoryIds)
  const scoreC = scoreGrid(candidateC, skuMap, defaultWeights, mandatoryIds)

  const candidates = [
    {
      id: 'candidate_a',
      label: 'Revenue Optimized',
      philosophy: 'Places highest-revenue SKUs at eye level for maximum return per shelf position',
      placements: candidateA,
      scores: scoreA,
      recommended: false
    },
    {
      id: 'candidate_b',
      label: 'SOS Optimized',
      philosophy: 'Maximizes brand variety across the shelf for better Share of Shelf',
      placements: candidateB,
      scores: scoreB,
      recommended: false
    },
    {
      id: 'candidate_c',
      label: 'Compliance Focused',
      philosophy: 'Prioritizes mandatory SKU placement and audit readiness',
      placements: candidateC,
      scores: scoreC,
      recommended: false
    }
  ]

  const bestIdx = candidates.reduce(
    (best, c, i) => c.scores.total > candidates[best].scores.total ? i : best, 0
  )
  candidates[bestIdx].recommended = true

  res.json({
    candidates,
    recommended: candidates[bestIdx].id
  })
})

export default router
