import { useEffect, useRef, useState } from 'react'

interface GallerySlide {
  type: 'image' | 'video'
  src: string
  poster?: string
  hideMobile?: boolean
}

interface GallerySliderProps {
  slides: GallerySlide[]
  className?: string
}

export default function GallerySlider({ slides, className = '' }: GallerySliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({ active: false, startX: 0, moved: false })

  // Filter slides on mobile
  const filteredSlides = slides.filter(s => {
    if (window.innerWidth <= 768 && s.hideMobile) return false
    return true
  })

  const total = filteredSlides.length

  // Remove hideMobile slides from DOM on mobile so they don't affect translateX
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (window.innerWidth <= 768) {
      container.querySelectorAll('.slide.hide-mobile').forEach(el => el.remove())
    }
  }, [])


  // Create dots + play first video on mount
  useEffect(() => {
    const container = containerRef.current
    if (!container || total <= 1) return
    const dotsContainer = container.querySelector('.slide-dots')
    if (!dotsContainer) return
    dotsContainer.innerHTML = ''
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div')
      dot.className = 'dot' + (i === 0 ? ' active' : '')
      dotsContainer.appendChild(dot)
    }
    // Play initial slide video if any
    const video = container.querySelector('video')
    if (video) {
      video.currentTime = 0
      video.play().catch(() => {})
    }
  }, [total])

  const goTo = (index: number) => {
    const container = containerRef.current
    if (!container) return
    const idx = ((index % total) + total) % total
    setCurrent(idx)
    const slidesEl = container.querySelector('.gallery-slides') as HTMLElement
    if (slidesEl) {
      slidesEl.style.transform = `translateX(-${idx * 100}%)`
    }
    container.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx)
    })
    // Play video on current slide, pause all others
    const allSlides = container.querySelectorAll('.slide')
    allSlides.forEach((slide, i) => {
      const video = slide.querySelector('video')
      if (!video) return
      if (i === idx) {
        video.currentTime = 0
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    })
  }

  // Click to advance
  const handleClick = (e: React.MouseEvent) => {
    if (dragRef.current.moved) return
    if ((e.target as HTMLElement).closest('.behance-btn')) return
    goTo((current + 1) % total)
  }

  // Touch swipe
  let touchStartX = 0
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(diff) < 30) return
    goTo(diff > 0 ? current + 1 : current - 1)
  }

  // Mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { active: true, startX: e.clientX, moved: false }
    e.preventDefault()
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return
      if (Math.abs(e.clientX - dragRef.current.startX) > 5) {
        dragRef.current.moved = true
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (!dragRef.current.active) return
      const wasActive = dragRef.current.active
      dragRef.current.active = false
      const diff = dragRef.current.startX - e.clientX
      if (dragRef.current.moved && Math.abs(diff) >= 30) {
        goTo(diff > 0 ? current + 1 : current - 1)
      }
      setTimeout(() => { dragRef.current.moved = false }, 0)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [current])

  if (total === 0) return null

  return (
    <div ref={containerRef} className={`gallery-slider relative overflow-hidden rounded-2xl select-none ${className}`}>
      {/* Slides container */}
      <div
        className="gallery-slides flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {filteredSlides.map((slide, i) => (
          <div
            key={i}
            className={`slide min-w-full ${slide.hideMobile ? 'hide-mobile' : ''}`}
          >
            {slide.type === 'image' ? (
              <img
                src={slide.src}
                alt={`Galeria ${i + 1}`}
                className="w-full h-64 sm:h-80 object-cover"
                draggable={false}
              />
            ) : (
              <video
                src={slide.src}
                poster={slide.poster}
                className="w-full h-64 sm:h-80 object-cover"
                muted
                loop
                autoPlay
                playsInline
              />
            )}
          </div>
        ))}
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="slide-dots absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {/* Dots added by JS */}
        </div>
      )}

      <style>{`
        .gallery-slider .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          transition: all 0.2s;
        }
        .gallery-slider .dot.active {
          background: white;
          width: 18px;
          border-radius: 3px;
        }
        .gallery-slider {
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
