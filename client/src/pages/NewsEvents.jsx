import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Calendar, MapPin, X } from 'lucide-react'
import PageHero from '../components/layout/PageHero'

const categories = ['All', 'Event', 'News', 'Academic', 'Sports', 'Cultural', 'Community', 'Achievement']

export default function NewsEvents() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [viewMode, setViewMode] = useState('grid')
  const [viewingItem, setViewingItem] = useState(null)
  import API_URL from '../api/config'

  useEffect(() => {
    axios.get('${API_URL}/api/news')
      .then(res => {
        setItems(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = items.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      activeCategory === 'All' ||
      item.type === activeCategory.toLowerCase() ||
      item.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const upcomingEvents = items.filter(item =>
    item.type === 'event' && item.eventDate && new Date(item.eventDate) >= new Date()
  )

  const getYoutubeEmbed = (url) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  return (
    <div>

      {/* Hero Banner */}
      <PageHero badge="News & Events" title="News & Events" subtitle="Stay updated with the latest happenings at Golden-Intels International School." />
      {/* Upcoming Events Banner */}
      {upcomingEvents.length > 0 && (
        <section className="bg-[#d4a017] py-4">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 overflow-x-auto">
            <span className="text-[#1a3c6e] font-bold text-sm shrink-0">📅 Upcoming:</span>
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex items-center gap-2 shrink-0">
                <span className="text-[#1a3c6e] text-sm font-bold">{event.title}</span>
                <span className="text-[#1a3c6e]/70 text-xs">— {new Date(event.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                {event.venue && <span className="text-[#1a3c6e]/70 text-xs">@ {event.venue}</span>}
                <span className="text-[#1a3c6e]/40 mx-2">|</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search and Filter */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search news and events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] text-gray-700 text-lg"
            />
          </div>

          {/* Category Filter and View Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                    activeCategory === cat
                      ? 'bg-[#1a3c6e] text-white'
                      : 'bg-white text-[#1a3c6e] border border-[#1a3c6e] hover:bg-[#1a3c6e] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'grid' ? 'bg-[#1a3c6e] text-white' : 'bg-white text-[#1a3c6e] border border-[#1a3c6e]'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'list' ? 'bg-[#1a3c6e] text-white' : 'bg-white text-[#1a3c6e] border border-[#1a3c6e]'}`}
              >
                List
              </button>
            </div>
          </div>

          <p className="text-gray-500 text-sm mt-4">Showing {filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </section>

      {/* News Grid / List */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="text-center text-gray-400 py-20">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-20">No items found.</div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setViewingItem(item)}
                >
                  {/* Image or Video Thumbnail */}
                  {item.images && item.images.length > 0 ? (
                    <div className="relative">
                      <img
                        src={`${item.images[0]}`}
                        alt={item.title}
                        className="w-full h-52 object-cover"
                      />
                      {item.images.length > 1 && (
                        <span className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full">
                          +{item.images.length - 1}
                        </span>
                      )}
                    </div>
                  ) : item.videoUrl ? (
                    <div className="w-full h-52 bg-gray-900 flex items-center justify-center">
                      <span className="text-white text-5xl">▶</span>
                    </div>
                  ) : (
                    <div className="w-full h-52 bg-[#1a3c6e] flex items-center justify-center">
                      <span className="text-[#d4a017] text-5xl font-bold font-serif">GI</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        item.type === 'event' ? 'bg-[#d4a017] text-[#1a3c6e]' : 'bg-[#1a3c6e] text-white'
                      }`}>
                        {item.type === 'event' ? '📅 Event' : '📰 News'}
                      </span>
                      <span className="text-xs text-gray-400">{item.category}</span>
                    </div>
                    <h3 className="font-bold text-[#1a3c6e] text-lg mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-3">{item.content}</p>
                    {item.type === 'event' && item.eventDate && (
                      <div className="bg-blue-50 rounded-xl px-4 py-3 mb-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-[#1a3c6e]" />
                          <p className="text-xs font-bold text-[#1a3c6e]">{new Date(item.eventDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        {item.venue && (
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-[#1a3c6e]" />
                            <p className="text-xs text-gray-600">{item.venue}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-4">
              {filtered.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex items-start gap-6"
                  onClick={() => setViewingItem(item)}
                >
                  {item.images && item.images.length > 0 ? (
                    <img src={`${item.images[0]}`} alt={item.title} className="w-32 h-24 object-cover rounded-xl shrink-0" />
                  ) : (
                    <div className="w-32 h-24 bg-[#1a3c6e] rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-[#d4a017] font-bold text-xl">GI</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        item.type === 'event' ? 'bg-[#d4a017] text-[#1a3c6e]' : 'bg-[#1a3c6e] text-white'
                      }`}>
                        {item.type === 'event' ? '📅 Event' : '📰 News'}
                      </span>
                      <span className="text-xs text-gray-400">{item.category}</span>
                    </div>
                    <h3 className="font-bold text-[#1a3c6e] text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{item.content}</p>
                    {item.type === 'event' && item.eventDate && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-[#1a3c6e]" />
                          <p className="text-xs font-bold text-[#1a3c6e]">{new Date(item.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        {item.venue && (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} className="text-[#1a3c6e]" />
                            <p className="text-xs text-gray-500">{item.venue}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Modal Header */}
            <div className="bg-[#1a3c6e] text-white p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full mr-2 ${
                  viewingItem.type === 'event' ? 'bg-[#d4a017] text-[#1a3c6e]' : 'bg-white/20 text-white'
                }`}>
                  {viewingItem.type === 'event' ? '📅 Event' : '📰 News'}
                </span>
                <span className="text-blue-200 text-xs">{viewingItem.category}</span>
              </div>
              <button onClick={() => setViewingItem(null)} className="hover:text-[#d4a017] transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">

              {/* Images */}
              {viewingItem.images && viewingItem.images.length > 0 && (
                <div className="mb-6">
                  <img
                    src={`${viewingItem.images[0]}`}
                    alt={viewingItem.title}
                    className="w-full h-64 object-cover rounded-xl mb-3"
                  />
                  {viewingItem.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {viewingItem.images.slice(1).map((img, index) => (
                        <img
                          key={index}
                          src={`${img}`}
                          alt={`Photo ${index + 2}`}
                          className="w-20 h-16 object-cover rounded-lg shrink-0"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Video */}
              {viewingItem.videoUrl && (
                <div className="mb-6">
                  {getYoutubeEmbed(viewingItem.videoUrl) ? (
                    <iframe
                      src={getYoutubeEmbed(viewingItem.videoUrl)}
                      className="w-full h-64 rounded-xl"
                      allowFullScreen
                      title={viewingItem.title}
                    />
                 ) : (
                    <button
                      onClick={() => window.open(viewingItem.videoUrl, '_blank')}
                      className="block w-full bg-gray-900 text-white text-center py-4 rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      Watch Video
                    </button>
                  )}
                </div>
              )}

              {/* Title */}
              <h2 className="text-2xl font-bold font-serif text-[#1a3c6e] mb-4">{viewingItem.title}</h2>

              {/* Event Details */}
              {viewingItem.type === 'event' && viewingItem.eventDate && (
                <div className="bg-blue-50 rounded-xl p-4 mb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#1a3c6e]" />
                    <p className="text-sm font-bold text-[#1a3c6e]">{new Date(viewingItem.eventDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  {viewingItem.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#1a3c6e]" />
                      <p className="text-sm text-gray-600">{viewingItem.venue}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <p className="text-gray-600 leading-relaxed mb-4 whitespace-pre-line">{viewingItem.content}</p>

              <p className="text-xs text-gray-400">Published: {new Date(viewingItem.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} by {viewingItem.uploadedBy}</p>

              <button
                onClick={() => setViewingItem(null)}
                className="w-full bg-[#1a3c6e] hover:bg-[#2a5298] text-white font-bold py-3 rounded-xl transition-colors mt-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}