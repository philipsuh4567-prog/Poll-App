import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const LETTERS = 'Polly'.split('')
const TOTAL_SECONDS = 4.4

// Speed streaks and cloud smears racing upward. Deterministic so renders match.
const STREAKS = Array.from({ length: 24 }, (_, i) => ({
  x: -150 + ((i * 31.7) % 700),
  w: 1.6 + (i % 4) * 1.1,
  h: 70 + ((i * 53) % 200),
  dur: 0.45 + (i % 5) * 0.09,
  phase: (i * 0.37) % 1,
}))

const CLOUDS = Array.from({ length: 7 }, (_, i) => ({
  cx: -60 + ((i * 97) % 520),
  rx: 46 + (i % 3) * 22,
  ry: 14 + (i % 2) * 10,
  dur: 1.1 + (i % 4) * 0.18,
  phase: (i * 0.29) % 1,
}))

// World coordinates match the logo (0-256). The box sits still; the camera
// follows the falling check, then pulls back to frame the finished logo.
const CHECK_CENTER_Y = 98
const FINAL_FOCUS_Y = 134

function LoadingScreen({ ready, onReveal, onDone }) {
  const rootRef = useRef(null)
  const exited = useRef(false)
  const [minDone, setMinDone] = useState(false)

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const ctx = gsap.context(() => {
      const root = rootRef.current
      const camera = root.querySelector('.splash__camera')
      const checkMove = root.querySelector('.splash__check-move')
      const cam = { s: 2.4, off: -440, w: 0 }

      const apply = () => {
        const tracking = CHECK_CENTER_Y + cam.off
        const fy = tracking + (FINAL_FOCUS_Y - tracking) * cam.w
        camera.setAttribute(
          'transform',
          `translate(200 265) scale(${cam.s}) translate(-124 ${-fy})`
        )
        checkMove.setAttribute('transform', `translate(0 ${cam.off})`)
      }
      apply()

      gsap.set('.splash__letter', { yPercent: 115 })
      gsap.set('.splash__dots', { opacity: 0 })
      gsap.set('.splash__ring', { opacity: 0, svgOrigin: '128 137' })

      const speedTweens = []
      const addRacer = (el, travel, dur, phase) => {
        speedTweens.push(
          gsap
            .to(el, { y: -travel, duration: dur, ease: 'none', repeat: -1 })
            .progress(phase)
        )
      }
      root
        .querySelectorAll('.splash__streak')
        .forEach((el, i) => addRacer(el, 1300, STREAKS[i].dur, STREAKS[i].phase))
      root
        .querySelectorAll('.splash__cloud')
        .forEach((el, i) => addRacer(el, 1300, CLOUDS[i].dur, CLOUDS[i].phase))

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onUpdate: apply,
        onComplete: () => setMinDone(true),
      })

      // The check hangs in frame while the world rushes past, then falls.
      tl.to(cam, { off: 0, duration: 2.1, ease: 'power1.in' }, 0)
        .to(
          '.splash__check-wobble',
          {
            rotation: 4,
            svgOrigin: '124 98',
            duration: 0.3,
            yoyo: true,
            repeat: 5,
            ease: 'sine.inOut',
          },
          0
        )
        // The camera starts leaning toward the box before the check arrives.
        .to(cam, { w: 0.5, s: 2.1, duration: 1.1, ease: 'power1.in' }, 1.0)
        .to('.splash__sky', { opacity: 0, duration: 0.5, ease: 'power1.in' }, 1.6)
        .call(() => speedTweens.forEach((t) => t.kill()), [], 2.2)
        .to('.splash__check-wobble', { rotation: 0, svgOrigin: '124 98', duration: 0.1 }, 2.05)
        // Landing: the box squashes, a ring ripples out.
        .fromTo(
          '.splash__box',
          { scaleY: 1, svgOrigin: '128 220' },
          { scaleY: 0.9, svgOrigin: '128 220', duration: 0.1, ease: 'power2.out' },
          2.1
        )
        .to('.splash__box', { scaleY: 1, duration: 0.55, ease: 'elastic.out(1, 0.4)' }, 2.2)
        .fromTo(
          '.splash__ring',
          { opacity: 0.7, scale: 0.3 },
          { opacity: 0, scale: 1.4, duration: 0.7, ease: 'power2.out' },
          2.1
        )
        // Pull back, then the word rises.
        .to(cam, { w: 1, s: 1.1, duration: 1.1, ease: 'power2.inOut' }, 2.3)
        .to(
          '.splash__letter',
          { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 },
          3.0
        )
        .to('.splash__dots', { opacity: 1, duration: 0.3 }, 3.5)
        .to({}, { duration: 0.001 }, TOTAL_SECONDS)

      gsap.to('.splash__dot', {
        y: -5,
        duration: 0.35,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        stagger: 0.12,
        delay: 3.5,
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
        rootRef.current.querySelectorAll('.splash__brand'),
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
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <filter
              id="splashStreakBlur"
              filterUnits="userSpaceOnUse"
              x="-700"
              y="-700"
              width="1800"
              height="2000"
            >
              <feGaussianBlur stdDeviation="0.8 9" />
            </filter>
            <filter
              id="splashCloudBlur"
              filterUnits="userSpaceOnUse"
              x="-700"
              y="-700"
              width="1800"
              height="2000"
            >
              <feGaussianBlur stdDeviation="8 18" />
            </filter>
            <clipPath id="splashSlotClip">
              <rect x="-1000" y="-2000" width="2256" height="2137" />
            </clipPath>
          </defs>

          <g className="splash__sky">
            <g filter="url(#splashCloudBlur)">
              {CLOUDS.map((c, i) => (
                <ellipse
                  key={i}
                  className="splash__cloud"
                  cx={c.cx}
                  cy={850}
                  rx={c.rx}
                  ry={c.ry}
                />
              ))}
            </g>
            <g filter="url(#splashStreakBlur)">
              {STREAKS.map((s, i) => (
                <rect
                  key={i}
                  className="splash__streak"
                  x={s.x}
                  y={820}
                  width={s.w}
                  height={s.h}
                  rx={s.w / 2}
                />
              ))}
            </g>
          </g>

          <g className="splash__camera">
            <ellipse
              className="splash__ring"
              cx="128"
              cy="137"
              rx="70"
              ry="16"
              fill="none"
              strokeWidth="3"
            />
            <g className="splash__box">
              <rect className="splash__box-body" x="48" y="120" width="160" height="100" rx="18" />
              <rect className="splash__slot" x="84" y="130" width="88" height="14" rx="7" />
            </g>
            <g clipPath="url(#splashSlotClip)">
              <g className="splash__check-move">
                <g className="splash__check-wobble">
                  <path
                    className="splash__check"
                    d="M84 98 L124 140 L172 48"
                    fill="none"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="rotate(-12 124 140)"
                  />
                </g>
              </g>
            </g>
          </g>
        </svg>

        <div className="splash__brand">
          <div className="splash__word" aria-hidden="true">
            {LETTERS.map((letter, i) => (
              <span key={i} className="splash__letter">
                {letter}
              </span>
            ))}
          </div>
          <div className="splash__dots" aria-hidden="true">
            <span className="splash__dot" />
            <span className="splash__dot" />
            <span className="splash__dot" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
