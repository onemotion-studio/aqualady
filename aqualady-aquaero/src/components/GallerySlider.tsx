import { useEffect, useRef, useState, useCallback } from 'react'

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
  const dragRef = useRef({ active: false, startX: 0, moved: false })
  const videoEls = useRef<Map<number, HTMLVideoElement>>(new Map())

  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 1
    return window.innerWidth >= 1024 ? 3 : 1
  }

  const [visibleCount, setVisibleCount] = useState(getVisibleCount())

  useEffect(() => {
    const handleResize = () => {
      const newCount = getVisibleCount()
      setVisibleCount(newCount)
      if (containerRef.current) {
        const slidesEl = containerRef.current.querySelector('.gallery-slides') as HTMLElement
        if (slidesEl) {
          slidesEl.style.transform = `translateX(0)`
        }
      }
      setCurrent(0)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const filteredSlides = slides.filter(s => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768 && s.hideMobile) return false
    return true
  })

  const total = filteredSlides.length
  const gapPercent = 1.5
  const slideWidth = visibleCount > 1 ? (100 - gapPercent * (visibleCount - 1)) / visibleCount : 100

  const goTo = (index: number) => {
    const container = containerRef.current
    if (!container) return

    const maxIndex = Math.max(0, total - visibleCount)
    const idx = Math.max(0, Math.min(index, maxIndex))
    setCurrent(idx)

    const slidesEl = container.querySelector('.gallery-slides') as HTMLElement
    if (slidesEl) {
      const offset = idx * (slideWidth + gapPercent)
      slidesEl.style.transform = `translateX(-${offset}%)`
    }

    container.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx)
    })
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container || total <= visibleCount) return
    const dotsContainer = container.querySelector('.slide-dots')
    if (!dotsContainer) return
    dotsContainer.innerHTML = ''
    const dotCount = Math.max(1, total - visibleCount + 1)
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('div')
      dot.className = 'dot' + (i === 0 ? ' active' : '')
      dotsContainer.appendChild(dot)
    }
  }, [total, visibleCount])

  // Dual loop prevention: RAF + onTimeUpdate
  useEffect(() => {
    let rafId: number
    const tick = () => {
      videoEls.current.forEach((video) => {
        if (video.duration && video.currentTime >= video.duration - 1.8) {
          video.pause()
          video.currentTime = 0
          video.play().catch(() => {})
        }
      })
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const onVideoTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    if (video.duration && video.currentTime >= video.duration - 1.8) {
      video.pause()
      video.currentTime = 0
      video.play().catch(() => {})
    }
  }, [])

  const setVideoRef = (el: HTMLVideoElement | null, index: number) => {
    if (el) {
      videoEls.current.set(index, el)
      el.removeAttribute('loop')
    } else {
      videoEls.current.delete(index)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (dragRef.current.moved) return
    if ((e.target as HTMLElement).closest('.behance-btn')) return
    const maxIndex = Math.max(0, total - visibleCount)
    if (current < maxIndex) goTo(current + 1)
    else goTo(0)
  }

  let touchStartX = 0
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(diff) < 30) return
    const maxIndex = Math.max(0, total - visibleCount)
    if (diff > 0) goTo(Math.min(current + 1, maxIndex))
    else goTo(Math.max(0, current - 1))
  }

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
      dragRef.current.active = false
      const diff = dragRef.current.startX - e.clientX
      if (dragRef.current.moved && Math.abs(diff) >= 30) {
        const maxIndex = Math.max(0, total - visibleCount)
        if (diff > 0) goTo(Math.min(current + 1, maxIndex))
        else goTo(Math.max(0, current - 1))
      }
      setTimeout(() => { dragRef.current.moved = false }, 0)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [current, total, visibleCount])

  if (total === 0) return null

  return (
    <div ref={containerRef} className={`gallery-slider relative overflow-hidden rounded-2xl select-none ${className}`}>
      <div
        className="gallery-slides flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${current * (slideWidth + gapPercent)}%)`, gap: `${gapPercent}%` }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {filteredSlides.map((slide, i) => (
          <div
            key={i}
            className={`slide shrink-0 ${slide.hideMobile ? 'hide-mobile' : ''}`}
            style={{ width: `${slideWidth}%` }}
          >
            {slide.type === 'image' ? (
              <img
                src={slide.src}
                alt={`Galeria ${i + 1}`}
                className="w-full object-cover rounded-xl"
                style={{ aspectRatio: '16/9', display: 'block' }}
                draggable={false}
              />
            ) : (
              <video
                ref={(el) => setVideoRef(el, i)}
                src={slide.src}
                className="w-full object-cover rounded-xl"
                style={{ aspectRatio: '16/9', display: 'block' }}
                muted
                autoPlay
                playsInline
                preload="auto"
                onTimeUpdate={onVideoTimeUpdate}
              />
            )}
          </div>
        ))}
      </div>

      {total > visibleCount && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goTo(current - 1); }}
            className="gallery-arrow gallery-arrow-left"
            aria-label="Poprzedni"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goTo(current + 1); }}
            className="gallery-arrow gallery-arrow-right"
            aria-label="Nastepny"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {total > visibleCount && (
        <div className="slide-dots absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
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
        .gallery-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.85);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2C8889;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          cursor: pointer;
          transition: all 0.2s;
          opacity: 0;
          pointer-events: none;
        }
        .gallery-slider:hover .gallery-arrow {
          opacity: 1;
          pointer-events: auto;
        }
        .gallery-arrow:hover {
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.18);
          transform: translateY(-50%) scale(1.08);
        }
        .gallery-arrow:active {
          transform: translateY(-50%) scale(0.95);
        }
        .gallery-arrow-left {
          left: 12px;
        }
        .gallery-arrow-right {
          right: 12px;
        }
        /* Стрелки всегда видны, на мобилке чуть меньше */
        @media (max-width: 1023px) {
          .gallery-arrow {
            width: 32px;
            height: 32px;
          }
        }
        .gallery-slider video {
          background-color: transparent;
        }
        .gallery-slider video::-webkit-media-controls-start-playback-button {
          display: none !important;
        }
      `}</style>
    </div>
  )
}