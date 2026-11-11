const crypto = require('crypto')

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '')
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const requireSupabase = () => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase is not configured on the API server. Set SUPABASE_URL and SUPABASE_SECRET_KEY.')
  }
}

const supabaseRequest = async (path, options = {}) => {
  requireSupabase()
  // New Supabase secret keys (sb_secret_...) must be sent as apikey only.
  // Legacy service_role JWT keys also need the Authorization bearer header.
  const authHeaders = { apikey: SUPABASE_KEY }
  if (!SUPABASE_KEY.startsWith('sb_secret_')) {
    authHeaders.Authorization = `Bearer ${SUPABASE_KEY}`
  }
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {})
    }
  })
  const text = await response.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!response.ok) {
    const message = data?.message || data?.error || data?.hint || `Supabase request failed (${response.status})`
    throw new Error(message)
  }
  return data
}

const toApiItem = (row) => ({
  id: row.id,
  title: row.title,
  content: row.content,
  category: row.category,
  type: row.type || 'news',
  images: Array.isArray(row.images) ? row.images : (row.image_url ? [row.image_url] : []),
  videoUrl: row.video_url,
  eventDate: row.event_date,
  venue: row.venue,
  uploadedBy: row.uploaded_by || 'Admin',
  createdAt: row.created_at,
  updatedAt: row.updated_at
})

const uploadNewsImages = async (files = []) => {
  const urls = []
  for (const file of files) {
    const extension = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' })[file.mimetype]
    if (!extension) throw new Error('Only JPG, PNG and WebP images are accepted.')
    const objectPath = `news/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`
    const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/')
    await supabaseRequest(`/storage/v1/object/news-events/${encodedPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': file.mimetype,
        'x-upsert': 'false'
      },
      body: file.buffer
    })
    urls.push(`${SUPABASE_URL}/storage/v1/object/public/news-events/${encodedPath}`)
  }
  return urls
}

const getNewsEvents = async (req, res) => {
  try {
    const rows = await supabaseRequest('/rest/v1/news_events?select=*&published=eq.true&order=created_at.desc')
    res.json((rows || []).map(toApiItem))
  } catch (error) {
    console.error('News fetch error:', error)
    res.status(500).json({ message: 'Could not load news and events.', error: error.message })
  }
}

const getHomepageNewsEvents = async (req, res) => {
  try {
    const since = new Date()
    since.setMonth(since.getMonth() - 1)
    const query = `/rest/v1/news_events?select=*&published=eq.true&created_at=gte.${encodeURIComponent(since.toISOString())}&order=created_at.desc&limit=10`
    const rows = await supabaseRequest(query)
    res.set('Cache-Control', 'public, max-age=60')
    res.json((rows || []).map(toApiItem))
  } catch (error) {
    console.error('Homepage news load error:', error)
    res.status(500).json({ message: 'Could not load recent announcements.', error: error.message })
  }
}

const createNewsEvent = async (req, res) => {
  try {
    const { title, content, category, type, videoUrl, eventDate, venue, uploadedBy } = req.body
    if (typeof title !== 'string' || !title.trim() || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ message: 'A title and content are required.' })
    }
    const images = await uploadNewsImages(req.files || [])
    const payload = {
      title: title.trim(),
      content: content.trim(),
      category: category || 'General',
      type: type || 'news',
      images,
      image_url: images[0] || null,
      video_url: videoUrl || null,
      event_date: eventDate || null,
      venue: venue || null,
      uploaded_by: uploadedBy || req.user?.name || 'Admin',
      published: true
    }
    const rows = await supabaseRequest('/rest/v1/news_events?select=*', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(payload)
    })
    res.status(201).json(toApiItem(rows[0]))
  } catch (error) {
    console.error('News create error:', error)
    res.status(500).json({ message: 'Could not publish news or event.', error: error.message })
  }
}

const updateNewsEvent = async (req, res) => {
  try {
    const { id } = req.params
    const existingRows = await supabaseRequest(`/rest/v1/news_events?select=*&id=eq.${encodeURIComponent(id)}&limit=1`)
    const existing = existingRows?.[0]
    if (!existing) return res.status(404).json({ message: 'News or event item not found.' })

    const uploaded = await uploadNewsImages(req.files || [])
    const images = uploaded.length ? uploaded : (existing.images || [])
    const { title, content, category, type, videoUrl, eventDate, venue } = req.body
    const payload = {
      title: title?.trim() || existing.title,
      content: content?.trim() || existing.content,
      category: category || existing.category,
      type: type || existing.type,
      images,
      image_url: images[0] || null,
      video_url: videoUrl ?? existing.video_url,
      event_date: eventDate ?? existing.event_date,
      venue: venue ?? existing.venue,
      updated_at: new Date().toISOString()
    }
    const rows = await supabaseRequest(`/rest/v1/news_events?id=eq.${encodeURIComponent(id)}&select=*`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(payload)
    })
    res.json(toApiItem(rows[0]))
  } catch (error) {
    console.error('News update error:', error)
    res.status(500).json({ message: 'Could not update news or event.', error: error.message })
  }
}

const deleteNewsEvent = async (req, res) => {
  try {
    const { id } = req.params
    const rows = await supabaseRequest(`/rest/v1/news_events?id=eq.${encodeURIComponent(id)}&select=id`, {
      method: 'DELETE',
      headers: { Prefer: 'return=representation' }
    })
    if (!rows?.length) return res.status(404).json({ message: 'News or event item not found.' })
    res.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('News delete error:', error)
    res.status(500).json({ message: 'Could not delete news or event.', error: error.message })
  }
}

module.exports = { getNewsEvents, getHomepageNewsEvents, createNewsEvent, updateNewsEvent, deleteNewsEvent }
