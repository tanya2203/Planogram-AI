import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { SKUS } from '../data/mock.js'

const router = Router()

router.post('/', async (req, res) => {
  const { messages, mode } = req.body

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({
      error: 'AI chat not configured',
      message: 'ANTHROPIC_API_KEY not set'
    }) as any
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const skuList = SKUS
    .map(s => `${s.id}: ${s.name} (${s.brand}, ${s.category}, tier: ${s.tier})`)
    .join('\n')

  const systemPrompt = mode === 'objective'
    ? `You are a planogram optimization assistant for United Breweries India.
Help configure KPI weights and SKU tiers for planogram generation.
Available SKUs:\n${skuList}
Output CONFIG:{"field":"fieldName","value":value} lines for changes.
When ready output READY:true`
    : `You are a planogram planning expert for United Breweries India.
Help category managers create optimal beer cooler planograms.
Available SKUs:\n${skuList}
Output CONFIG lines for configuration changes.
When ready to generate output READY:true
If user says generate output GENERATE:true`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages
    })

    const text = response.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')

    res.json({ text, usage: response.usage })
  } catch (error: any) {
    res.status(500).json({ error: 'AI request failed', message: error.message })
  }
})

export default router
