import express from 'express'
import axios from 'axios'
import { proxyGet } from '../services/tmdbService.js'

const router = express.Router()

const TMDB_BASE = 'https://api.themoviedb.org/3'

const getAuthConfig = (queryParams = {}) => {
  const token = process.env.TMDB_TOKEN || process.env.TMDB_BEARER || process.env.TMDB_V4_TOKEN
  const apiKey = process.env.TMDB_API_KEY
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const params = apiKey ? { ...queryParams, api_key: apiKey } : { ...queryParams }
  return { headers, params }
}

router.get('/*', async (req, res) => {
  try {
    const path = req.params[0] || ''
    const data = await proxyGet(path, req.query)
    res.json(data)
  } catch (error) {
    const path = req.params[0] || ''
    if (/^trending\/(movie|tv)\/day$/.test(path)) {
      try {
        const altPath = path.replace('/day', '/week')
        const data = await proxyGet(altPath, req.query)
        return res.json(data)
      } catch (e2) {
        const status2 = e2.response?.status || 500
        const message2 = e2.response?.data || { message: 'TMDB proxy error (weekly fallback failed)' }
        return res.status(status2).json(message2)
      }
    }
    const status = error.response?.status || 500
    const message = error.response?.data || { message: 'TMDB proxy error' }
    res.status(status).json(message)
  }
})

export default router