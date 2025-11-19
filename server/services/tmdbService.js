import axios from 'axios'
import { cacheGet, cacheSet } from './cache.js'

const TMDB_BASE = 'https://api.themoviedb.org/3'

const getAuthConfig = (queryParams = {}) => {
  const token = process.env.TMDB_TOKEN || process.env.TMDB_BEARER || process.env.TMDB_V4_TOKEN
  const apiKey = process.env.TMDB_API_KEY
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const params = token ? { ...queryParams } : (apiKey ? { ...queryParams, api_key: apiKey } : { ...queryParams })
  return { headers, params }
}

const buildCacheKey = (path, query = {}) => {
  const keys = Object.keys(query).sort()
  const qs = keys.map(k => `${k}=${encodeURIComponent(query[k])}`).join('&')
  return qs ? `${path}?${qs}` : path
}

const determineTtl = (path) => {
  if (path.includes('/trending')) return 6 * 60 * 60
  if (/^(movie|tv)\/popular/.test(path)) return 6 * 60 * 60
  if (/^(movie|tv)\/\d+$/.test(path)) return 24 * 60 * 60
  if (path.includes('/credits')) return 24 * 60 * 60
  if (path.startsWith('search/')) return 15 * 60
  return 60 * 60
}

export const fetchAndCache = async (cacheKey, fetchFn, ttl) => {
  const cached = await cacheGet(cacheKey)
  if (cached) return cached
  const data = await fetchFn()
  await cacheSet(cacheKey, data, ttl)
  return data
}

export const proxyGet = async (path, query = {}) => {
  const ttl = determineTtl(path)
  const key = buildCacheKey(path, query)
  return fetchAndCache(key, async () => {
    const config = getAuthConfig(query)
    const { data } = await axios.get(`${TMDB_BASE}/${path}`, config)
    return data
  }, ttl)
}