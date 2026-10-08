import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

function CreateButton({ onClick }) {
  const btnRef = useRef(null)
  const iconRef = useRef(null)

  useLayoutEffect(() => {
    gsap.fromTo(
      btnRef.current,
      { scale: 0, rotate: -45, opacity: 0 },
      {
        scale: 1,
        rotate: 0,
        opacity: 1,
        duration: 0.6,
        delay: 0.3,
        ease: 'back.out(2.2)',
      }
    )
  }, [])

  function handleEnter() {
    gsap.to(iconRef.current, {
      rotation: '+=90',
      transformOrigin: '50% 50%',
      duration: 0.5,
      ease: 'back.out(2.5)',
    })
    gsap.to(btnRef.current, {
      scale: 1.1,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  function handleLeave() {
    gsap.to(btnRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  function handleClick() {
    gsap.timeline()
      .to(btnRef.current, { scale: 0.85, rotate: 90, duration: 0.15, ease: 'power2.in' })
      .to(btnRef.current, { scale: 1, rotate: 0, duration: 0.45, ease: 'elastic.out(1, 0.5)' })
    onClick()
  }

  return (
    <button
      ref={btnRef}
      type="button"
      className="create-fab"
      onClick={handleClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      aria-label="Create a new poll"
    >
      <svg ref={iconRef} viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </button>
  )
}

export default CreateButton
