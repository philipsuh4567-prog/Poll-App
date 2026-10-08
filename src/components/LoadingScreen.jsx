import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const LETTERS = 'Polly'.split('')
const TOTAL_SECONDS = 4.6

function LoadingScreen({ ready, onReveal, onDone }) {
  const rootRef = useRef(null)
  const exited = useRef(false)
  const [minDone, setMinDone] = useState(false)

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const ctx = gsap.context(() => {
      gsap.set('.splash__sun', { y: 130 })
      gsap.set('.splash__glow', { opacity: 0, transformOrigin: '50% 50%', scale: 0.6 })
      gsap.set('.splash__hill', { y: 50, opacity: 0 })
      gsap.set('.splash__cypress', { scaleY: 0, transformOrigin: '50% 100%' })
      gsap.set('.splash__villa', { y: 14, opacity: 0 })
      gsap.set('.splash__vine', { strokeDashoffset: 1 })
      gsap.set('.splash__bird', { x: -40, opacity: 0 })
      gsap.set('.splash__logo', { y: -24, opacity: 0, scale: 0.8 })
      gsap.set('.splash__letter', { y: 18, opacity: 0 })
      gsap.set('.splash__msg', { opacity: 0 })
      gsap.set('.splash__bar-fill', { scaleX: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => setMinDone(true),
      })

      tl.to('.splash__sun', { y: 0, duration: 2.2, ease: 'power2.out' }, 0.1)
        .to('.splash__glow', { opacity: 1, scale: 1, duration: 2.2, ease: 'power2.out' }, 0.1)
        .to('.splash__hill', { y: 0, opacity: 1, duration: 1.1, stagger: 0.18 }, 0.15)
        .to('.splash__cypress', { scaleY: 1, duration: 0.9, ease: 'back.out(1.4)', stagger: 0.08 }, 0.9)
        .to('.splash__vine', { strokeDashoffset: 0, duration: 1.3, ease: 'power1.inOut', stagger: 0.18 }, 1.2)
        .to('.splash__villa', { y: 0, opacity: 1, duration: 0.8 }, 1.5)
        .to('.splash__window', { fill: '#f6c453', duration: 0.6 }, 2.3)
        .to('.splash__logo', { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.6)' }, 1.0)
        .to('.splash__letter', { y: 0, opacity: 1, duration: 0.55, stagger: 0.08 }, 1.6)
        .to('.splash__bar-fill', { scaleX: 1, duration: 4.2, ease: 'power1.inOut' }, 0.3)
        .to('.splash__bird', { opacity: 1, duration: 0.3 }, 0.6)
        .to('.splash__bird', { x: 470, duration: 3.8, ease: 'none', stagger: 0.4 }, 0.6)

      gsap.utils.toArray('.splash__msg').forEach((el, i, all) => {
        const start = 0.5 + i * 1.4
        tl.fromTo(el, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35 }, start)
        if (i < all.length - 1) {
          tl.to(el, { opacity: 0, y: -6, duration: 0.3 }, start + 1.1)
        }
      })

      tl.to({}, { duration: 0.001 }, TOTAL_SECONDS)

      gsap.to('.splash__cypress', {
        rotation: 1.4,
        duration: 1.9,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        stagger: 0.17,
        delay: 2.2,
      })

      if (reduceMotion) tl.timeScale(4)
    }, rootRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!ready || !minDone || exited.current) return
    exited.current = true
    onReveal()
    gsap
      .timeline({ onComplete: onDone })
      .to(
        rootRef.current.querySelectorAll('.splash__brand, .splash__status'),
        { opacity: 0, y: -12, duration: 0.35, ease: 'power2.in' },
        0
      )
      .to(rootRef.current, { opacity: 0, duration: 0.8, ease: 'power2.inOut' }, 0.2)
  }, [ready, minDone, onReveal, onDone])

  return (
    <div
      className="splash"
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label="Loading Polly"
    >
      <div className="splash__column">
        <svg
          className="splash__svg"
          viewBox="0 0 400 600"
          preserveAspectRatio="xMidYMax meet"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="splashSunGlow">
              <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.9" />
              <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle className="splash__glow" cx="200" cy="330" r="130" fill="url(#splashSunGlow)" />
          <circle className="splash__sun" cx="200" cy="330" r="44" fill="#f5c04e" />

          <path className="splash__hill" fill="#cdd6ab" d="M-800 372 L0 378 Q90 338 180 370 T400 352 L1200 356 L1200 700 L-800 700 Z" />

          <g className="splash__villa">
            <rect x="198" y="410" width="34" height="22" fill="#ead9b0" />
            <polygon points="196,410 215,397 234,410" fill="#c4623a" />
            <rect x="232" y="396" width="10" height="36" fill="#e3cf9f" />
            <polygon points="230,396 237,386 244,396" fill="#b5512e" />
            <rect className="splash__window" x="203" y="414" width="4" height="6" fill="#5a4632" />
            <rect className="splash__window" x="223" y="414" width="4" height="6" fill="#5a4632" />
            <rect className="splash__window" x="235" y="402" width="4" height="6" fill="#5a4632" />
            <path d="M211 432 V423 a4 4 0 0 1 8 0 V432 Z" fill="#6b4a32" />
          </g>

          <g transform="translate(52 428) scale(0.9)"><path className="splash__cypress" d="M0 0 C-8 -16 -9 -46 0 -80 C9 -46 8 -16 0 0 Z" fill="#2f4532" /></g>
          <g transform="translate(68 426) scale(0.7)"><path className="splash__cypress" d="M0 0 C-8 -16 -9 -46 0 -80 C9 -46 8 -16 0 0 Z" fill="#35503a" /></g>
          <g transform="translate(338 448) scale(1)"><path className="splash__cypress" d="M0 0 C-8 -16 -9 -46 0 -80 C9 -46 8 -16 0 0 Z" fill="#2f4532" /></g>
          <g transform="translate(354 447) scale(0.75)"><path className="splash__cypress" d="M0 0 C-8 -16 -9 -46 0 -80 C9 -46 8 -16 0 0 Z" fill="#35503a" /></g>

          <path className="splash__hill" fill="#b6c595" d="M-800 424 L0 430 Q120 388 230 424 T400 408 L1200 412 L1200 700 L-800 700 Z" />

          <g transform="translate(118 474) scale(1.1)"><path className="splash__cypress" d="M0 0 C-8 -16 -9 -46 0 -80 C9 -46 8 -16 0 0 Z" fill="#2a3f2d" /></g>
          <g transform="translate(134 474) scale(0.8)"><path className="splash__cypress" d="M0 0 C-8 -16 -9 -46 0 -80 C9 -46 8 -16 0 0 Z" fill="#35503a" /></g>
          <g transform="translate(296 498) scale(1.2)"><path className="splash__cypress" d="M0 0 C-8 -16 -9 -46 0 -80 C9 -46 8 -16 0 0 Z" fill="#2a3f2d" /></g>

          <path className="splash__hill" fill="#97ac78" d="M-800 478 L0 482 Q100 444 210 474 T400 454 L1200 458 L1200 700 L-800 700 Z" />

          <g fill="none" stroke="#6f8f5c" strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
            <path className="splash__vine" pathLength="1" strokeDasharray="1" d="M20 500 Q120 470 230 498" />
            <path className="splash__vine" pathLength="1" strokeDasharray="1" d="M10 515 Q130 486 250 514" />
            <path className="splash__vine" pathLength="1" strokeDasharray="1" d="M230 470 Q310 486 390 470" />
          </g>

          <path className="splash__hill" fill="#6f8f5c" d="M-800 534 L0 538 Q130 502 250 530 T400 518 L1200 522 L1200 700 L-800 700 Z" />

          <g fill="none" stroke="#4a5238" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path className="splash__bird" transform="translate(0 150)" d="M0 0 q5 -7 10 0 q5 -7 10 0" />
            <path className="splash__bird" transform="translate(0 182)" d="M0 0 q5 -7 10 0 q5 -7 10 0" />
            <path className="splash__bird" transform="translate(0 130)" d="M0 0 q5 -7 10 0 q5 -7 10 0" />
          </g>
        </svg>

        <div className="splash__brand">
          <img
            className="splash__logo"
            src={`${import.meta.env.BASE_URL}logo-256.png`}
            alt=""
            width="84"
            height="84"
          />
          <div className="splash__word" aria-hidden="true">
            {LETTERS.map((letter, i) => (
              <span key={i} className="splash__letter">
                {letter}
              </span>
            ))}
          </div>
        </div>

        <div className="splash__status">
          <div className="splash__msgs">
            <span className="splash__msg">Polling the hills…</span>
            <span className="splash__msg">Counting every vote…</span>
            <span className="splash__msg">Almost ready…</span>
          </div>
          <div className="splash__bar">
            <div className="splash__bar-fill" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
