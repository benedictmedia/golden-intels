import { useState, useEffect } from 'react'
import axios from 'axios'
import { X } from 'lucide-react'
import PageHero from '../components/layout/PageHero'

const categories = ['All', 'Events', 'Extra-curricular', 'Academic', 'Physical Education', 'Culture', 'Arts', 'Community']

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [viewingItem, setViewingItem] = useState(null)
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://localhost:5000/api/gallery')
      .then(res => {
        setGalleryItems(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = activeCategory === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory)

  return (
    <div>

      {/* Hero Banner */}
      <PageHero badge="Gallery" title="School Gallery" subtitle="Explore memorable moments from our school events and gatherings." />

      {/* Filter Bar */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-gray-500 text-sm font-bold mb-4">Filter by:</p>
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#1a3c6e] text-white'
                    : 'bg-white text-[#1a3c6e] border border-[#1a3c6e] hover:bg-[#1a3c6e] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="text-center text-gray-400 py-20">Loading gallery...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-20">
              No photos in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => { setViewingItem(item); setActiveImage(0) }}
                >
                  {/* Main Image */}
                  <div className="relative">
                    <img
                      src={`${item.images[0]}`}
                      alt={item.title}
                      className="w-full h-56 object-cover"
                    />
                    {item.images.length > 1 && (
                      <span className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full">
                        +{item.images.length - 1} more
                      </span>
                    )}
                    <span className="absolute top-3 left-3 bg-[#d4a017] text-[#1a3c6e] text-xs font-bold px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-[#1a3c6e] text-lg mb-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 mb-3">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="text-xs text-gray-400">{item.images.length} photo{item.images.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold text-xl">{viewingItem.title}</h3>
                <p className="text-gray-400 text-sm">{viewingItem.category} | {new Date(viewingItem.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <button onClick={() => setViewingItem(null)} className="text-white hover:text-[#d4a017] transition-colors">
                <X size={28} />
              </button>
            </div>

            {/* Main Image */}
            <div className="relative mb-4">
              <img
                src={`${viewingItem.images[activeImage]}`}
                alt={viewingItem.title}
                className="w-full max-h-[65vh] object-contain rounded-xl"
              />
              {viewingItem.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(prev => prev === 0 ? viewingItem.images.length - 1 : prev - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveImage(prev => prev === viewingItem.images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors"
                  >
                    ›
                  </button>
                </>
              )}
              <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                {activeImage + 1} / {viewingItem.images.length}
              </span>
            </div>

            {/* Thumbnails */}
            {viewingItem.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
                {viewingItem.images.map((img, index) => (
                  <img
                    key={index}
                    src={`${img}`}
                    alt={`Photo ${index + 1}`}
                    onClick={() => setActiveImage(index)}
                    className={`w-16 h-16 object-cover rounded-lg cursor-pointer shrink-0 transition-all ${
                      activeImage === index ? 'ring-2 ring-[#d4a017] opacity-100' : 'opacity-50 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}