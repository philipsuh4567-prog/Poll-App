import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import AddToHomeButton from './AddToHomeButton'

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest' },
  { key: 'liked', label: 'Most Liked' },
  { key: 'voted', label: 'Most Voted' },
  { key: 'oldest', label: 'Oldest' },
]

function FilterPills({ activeSort, onChange }) {
  const containerRef = useRef(null)
  const indicatorRef = useRef(null)
  const btnRefs = useRef({})
  const isFirstRun = useRef(true)

  useLayoutEffect(() => {
    const container = containerRef.current
    const indicator = indicatorRef.current
    const activeBtn = btnRefs.current[activeSort]
    if (!container || !indicator || !activeBtn) return

    const containerRect = container.getBoundingClientRect()
    const btnRect = activeBtn.getBoundingClientRect()
    const x = btnRect.left - containerRect.left + container.scrollLeft
    const width = btnRect.width

    if (isFirstRun.current) {
      gsap.set(indicator, { x, width })
      isFirstRun.current = false
    } else {
      gsap.to(indicator, {
        x,
        width,
        duration: 0.4,
        ease: 'power3.out',
      })
    }
  }, [activeSort])

  function handleClick(key, btnEl) {
    gsap.fromTo(
      btnEl,
      { scale: 0.94 },
      { scale: 1, duration: 0.3, ease: 'back.out(2)' }
    )
    onChange(key)
  }

  return (
    <div className="pills" ref={containerRef}>
      <span className="pills__indicator" ref={indicatorRef} aria-hidden="true" />
      <div className="pills__tabs" role="tablist" aria-label="Sort polls">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            ref={(el) => (btnRefs.current[opt.key] = el)}
            type="button"
            role="tab"
            aria-selected={activeSort === opt.key}
            className={
              'pill' + (activeSort === opt.key ? ' pill--active' : '')
            }
            onClick={(e) => handleClick(opt.key, e.currentTarget)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <AddToHomeButton />
    </div>
  )
}

export default FilterPills
