import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CalendarDays, MapPin, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../../api/config'

const ROTATION_INTERVAL = 8000

export default function HomeNewsSpotlight() {
  const [items, setItems] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [dismissedIds, setDismissedIds] = useState([])
  const visibleItems = items.filter(item => !dismissedIds.includes(item.id))

  useEffect(() => {
    let mounted = true
    const loadRecentItems = () => {
      axios.get(`${API_URL}/api/news/homepage`)
        .then(response => {
          if (mounted) setItems(response.data)
        })
        .catch(error => console.error('Failed to load homepage announcements:', error))
    }

    loadRecentItems()
    const intervalId = window.setInterval(loadRecentItems, 60000)
    window.addEventListener('focus', loadRecentItems)
    return () => {
      mounted = false
      window.clearInterval(intervalId)
      window.removeEventListener('focus', loadRecentItems)
    }
  }, [])

  useEffect(() => {
    if (visibleItems.length < 2) return undefined

    const intervalId = window.setInterval(() => {
      setActiveIndex(index => (index + 1) % visibleItems.length)
    }, ROTATION_INTERVAL)
    return () => window.clearInterval(intervalId)
  }, [visibleItems.length])

  const selectedIndex = visibleItems.length ? activeIndex % visibleItems.length : 0
  const item = visibleItems[selectedIndex]
  if (!item) return null

  const image = Array.isArray(item.images) ? item.images[0] : null
  const isEvent = item.type === 'event'

  return (
    <aside
      aria-label="Recent school news and events"
      className="fixed bottom-4 right-4 z-40 w-[min(25rem,calc(100vw-2rem))] sm:bottom-6 sm:right-6"
    >
      <AnimatePresence mode="wait">
        <motion.article
          key={item.id}
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5"
        >
          <div className="relative">
            {image && (
              <img src={image} alt="" className="h-36 w-full object-cover" loading="lazy" decoding="async" />
            )}
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-800 shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 motion-reduce:animate-none" />
                {isEvent ? 'New event' : 'Latest news'}
              </span>
              <button
                type="button"
                aria-label="Dismiss announcement"
                onClick={() => setDismissedIds(previous => [...previous, item.id])}
                className="rounded-full bg-slate-950/60 p-1.5 text-white transition hover:bg-slate-950"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">{item.category}</span>
              <span className="text-xs text-slate-400">
                {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <h2 className="line-clamp-2 text-lg font-extrabold leading-snug text-slate-900">{item.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">{item.content}</p>

            {isEvent && (item.eventDate || item.venue) && (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-600">
                {item.eventDate && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-blue-700" />
                    {new Date(item.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
                {item.venue && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} className="text-blue-700" />
                    {item.venue}
                  </span>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              {visibleItems.length > 1 ? (
                <div
                  role="group"
                  aria-label={`${selectedIndex + 1} of ${visibleItems.length} announcements`}
                  className="flex items-center gap-1.5"
                >
                  {visibleItems.map((visibleItem, index) => (
                    <button
                      key={visibleItem.id}
                      type="button"
                      aria-label={`Show announcement ${index + 1}`}
                      onClick={() => setActiveIndex(index)}
                      className={`h-1.5 rounded-full transition-all ${index === selectedIndex ? 'w-6 bg-blue-700' : 'w-1.5 bg-slate-300'}`}
                    />
                  ))}
                </div>
              ) : null}
              <Link
                to="/news"
                className="inline-flex items-center gap-1 rounded-full bg-blue-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-800"
              >
                Discover more <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.article>
      </AnimatePresence>
    </aside>
  )
}
