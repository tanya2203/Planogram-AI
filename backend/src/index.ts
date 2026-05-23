import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PlanogramAI Backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

import planogramsRouter from './routes/planograms.js'
import assetsRouter from './routes/assets.js'
import skusRouter from './routes/skus.js'
import analyticsRouter from './routes/analytics.js'
import generationRouter from './routes/generation.js'
import chatRouter from './routes/chat.js'

app.use('/api/planograms', planogramsRouter)
app.use('/api/assets', assetsRouter)
app.use('/api/skus', skusRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/generation', generationRouter)
app.use('/api/chat', chatRouter)

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack)
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  })
})

app.listen(PORT, () => {
  console.log(`PlanogramAI backend running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})

export default app
