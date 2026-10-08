import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

const shareIcon = (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 15V3M8 7l4-4 4 4" />
    <path d="M7 10H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
  </svg>
)

const addIcon = (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="M12 8v8M8 12h8" />
  </svg>
)

const menuIcon = (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="5" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="12" cy="19" r="1.8" />
  </svg>
)

const checkIcon = (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

const IOS_STEPS = [
  { icon: shareIcon, title: 'Tap the Share button', hint: 'In Safari’s toolbar' },
  { icon: addIcon, title: 'Tap Add to Home Screen', hint: 'Scroll down the list if you don’t see it' },
  { icon: checkIcon, title: 'Tap Add', hint: 'Polly shows up with its logo' },
]

const OTHER_STEPS = [
  { icon: menuIcon, title: 'Open your browser menu', hint: 'The ⋮ or ⋯ button' },
  { icon: addIcon, title: 'Tap Add to Home screen', hint: 'Or “Install app”' },
  { icon: checkIcon, title: 'Confirm', hint: 'Polly shows up with its logo' },
]

function AddToHomeSheet({ ios, onClose }) {
  const backdropRef = useRef(null)
  const sheetRef = useRef(null)
  const steps = ios ? IOS_STEPS : OTHER_STEPS

  useLayoutEffect(() => {
    gsap.set(backdropRef.current, { opacity: 0 })
    gsap.set(sheetRef.current, { y: 40, opacity: 0 })
    gsap
      .timeline()
      .to(backdropRef.current, { opacity: 1, duration: 0.25, ease: 'power2.out' })
      .to(sheetRef.current, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }, '-=0.15')
    gsap.fromTo(
      sheetRef.current.querySelectorAll('.a2hs-step'),
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.08, delay: 0.25, clearProps: 'opacity,transform' }
    )
  }, [])

  function handleClose() {
    gsap
      .timeline({ onComplete: onClose })
      .to(sheetRef.current, { y: 40, opacity: 0, duration: 0.25, ease: 'power2.in' })
      .to(backdropRef.current, { opacity: 0, duration: 0.2 }, '-=0.15')
  }

  return (
    <div className="modal-backdrop" ref={backdropRef} onClick={handleClose}>
      <div
        className="modal-sheet"
        ref={sheetRef}
        role="dialog"
        aria-label="Add Polly to your home screen"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-sheet__header">
          <span className="modal-sheet__logo">Polly</span>
          <button type="button" className="modal-sheet__close" onClick={handleClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <h2 className="a2hs-title">Add Polly to your home screen</h2>

        <ol className="a2hs-steps">
          {steps.map((step, i) => (
            <li key={i} className="a2hs-step">
              <span className="a2hs-step__icon">{step.icon}</span>
              <span className="a2hs-step__text">
                {step.title}
                <small>{step.hint}</small>
              </span>
            </li>
          ))}
        </ol>

        <button type="button" className="modal-sheet__post" onClick={handleClose}>
          Got it
        </button>
      </div>
    </div>
  )
}

export default AddToHomeSheet
