import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Add more images here (make sure they are in src/assets/)
import heroBg1 from '../../assets/hero-bg.jpg'
import heroBg2 from '../../assets/hero-bg-2.jpg'   
import heroBg3 from '../../assets/hero-bg-3.jpg'   
import heroBg3 from '../../assets/hero-bg-4.jpg'
import heroBg3 from '../../assets/hero-bg-5.jpg'

const heroImages = [heroBg1, heroBg2, heroBg3, heroBg4, heroBg5].filter(Boolean) // Remove any missing images

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Auto-change image every 6 seconds
  useEffect(() => {
    if (heroImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % heroImages.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  const currentBg = heroImages[currentImageIndex]

  return (
    <div className="relative text-[#800080] min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#a7cdf3]">
      
      {/* Background Slideshow */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out scale-110"
        style={{ 
          backgroundImage: `url(${currentBg})`,
          opacity: 0.95
        }}
      ></div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#2563EB]/45"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* Left Side - Main Content */}
        <div className="text-center md:text-left">
          <span className="inline-block bg-[#7C3AED] text-white text-sm font-bold px-5 py-2 rounded-full mb-6 shadow-lg">
            Oxford Accredited International School
          </span>

          <h1 className="text-5xl md:text-6xl font-bold font-serif leading-tight mb-6 tracking-tight text-white">
            Welcome to <br />
            <span className="text-[#ffff00]">Golden-Intels</span> <br />
            International School
          </h1>

          <p className="text-xl md:text-2xl text-[#ffff00] max-w-lg mx-auto md:mx-0 mb-10 font-light">
            We nurture for nature.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              to="/admissions"
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold px-10 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Apply Now
            </Link>

            <Link
              to="/about"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-[#2563EB] text-white font-bold px-10 py-4 rounded-xl text-lg transition-all"
            >
              Discover Our Story
            </Link>
          </div>
        </div>

        {/* Right Side - Mission Statement */}
        <div className="flex justify-center md:justify-end">
          <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl px-8 py-8 max-w-md w-full">
            <div className="flex items-start gap-4">
              <div className="w-1.5 min-h-full bg-[#d4a017] rounded-full flex-shrink-0 self-stretch mt-1" />
              <div className="text-left">
                <p className="text-[#d4a017] text-xs font-bold uppercase tracking-[2px] mb-3">
                  OUR MISSION
                </p>
                <p className="text-white text-[15.5px] leading-relaxed font-medium">
                  Raising godly, globally minded scholars through international education that builds academic excellence, critical thinking, and Christ-like character for a life of purpose.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Optional: Dots indicator */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentImageIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}