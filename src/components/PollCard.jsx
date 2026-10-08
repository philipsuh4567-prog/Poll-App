import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

function formatCount(n) {
  const abs = Math.abs(n)
  if (abs < 1000) return String(n)
  const thousands = Math.floor(abs / 100) / 10
  const text = Number.isInteger(thousands)
    ? String(thousands)
    : thousands.toFixed(1)
  return (n < 0 ? '-' : '') + text + 'k'
}

function PollCard({
  poll,
  votedOptionId,
  reaction,
  animateOnMount,
  onVote,
  onReact,
}) {
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0)
  const hasVoted = votedOptionId != null
  const score = poll.upvotes - poll.downvotes

  const cardRef = useRef(null)
  const fillRefs = useRef({})
  const pctRefs = useRef({})
  const scoreRef = useRef(null)
  const upBtnRef = useRef(null)
  const downBtnRef = useRef(null)
  const prevHasVoted = useRef(hasVoted)
  const shownPct = useRef({})
  const pctTweens = useRef({})
  const prevScore = useRef(score)
  const votesKey = poll.options.map((o) => o.votes).join(',')

  useLayoutEffect(() => {
    if (!animateOnMount) return
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: -20, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: 'back.out(1.5)',
        clearProps: 'opacity,transform',
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    const justVoted = hasVoted && !prevHasVoted.current
    prevHasVoted.current = hasVoted

    if (!hasVoted) {
      // Reset when a vote is rolled back (or never cast).
      poll.options.forEach((option) => {
        pctTweens.current[option.id]?.kill()
        const fillEl = fillRefs.current[option.id]
        const pctEl = pctRefs.current[option.id]
        if (fillEl) {
          gsap.killTweensOf(fillEl)
          gsap.set(fillEl, { width: '0%' })
        }
        if (pctEl) pctEl.textContent = ''
      })
      shownPct.current = {}
      return
    }

    poll.options.forEach((option, i) => {
      const pct =
        totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100)
      const fillEl = fillRefs.current[option.id]
      const pctEl = pctRefs.current[option.id]
      if (!fillEl || !pctEl) return

      const from = justVoted ? 0 : shownPct.current[option.id]
      shownPct.current[option.id] = pct

      if (from === undefined) {
        // Already voted when this card mounted: show the result immediately.
        gsap.set(fillEl, { width: pct + '%' })
        pctEl.textContent = pct + '%'
        return
      }
      if (!justVoted && from === pct) return

      pctTweens.current[option.id]?.kill()
      gsap.killTweensOf(fillEl)
      const delay = justVoted ? i * 0.05 : 0
      const duration = justVoted ? 0.7 : 0.4
      gsap.fromTo(
        fillEl,
        { width: from + '%' },
        { width: pct + '%', duration, delay, ease: 'power3.out' }
      )
      const counter = { val: from }
      pctEl.textContent = from + '%'
      pctTweens.current[option.id] = gsap.to(counter, {
        val: pct,
        duration,
        delay,
        ease: 'power3.out',
        onUpdate: () => {
          pctEl.textContent = Math.round(counter.val) + '%'
        },
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVoted, votesKey])

  useEffect(() => {
    if (prevScore.current !== score && scoreRef.current) {
      gsap.fromTo(
        scoreRef.current,
        { scale: 1.4 },
        { scale: 1, duration: 0.4, ease: 'back.out(3)' }
      )
    }
    prevScore.current = score
  }, [score])

  function handleOptionClick(optionId, btnEl) {
    if (hasVoted) return
    gsap.fromTo(
      btnEl,
      { scale: 0.97 },
      { scale: 1, duration: 0.35, ease: 'power2.out' }
    )
    onVote(poll.id, optionId)
  }

  function handleReactClick(direction, btnRef) {
    gsap.fromTo(
      btnRef.current,
      { scale: 0.7 },
      { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' }
    )
    onReact(poll.id, direction)
  }

  return (
    <article className="poll-card" ref={cardRef}>
      <h2 className="poll-card__question">{poll.question}</h2>

      <div className="poll-card__options">
        {poll.options.map((option) => {
          const isChosen = votedOptionId === option.id

          return (
            <button
              key={option.id}
              type="button"
              className={
                'option-bar' +
                (hasVoted ? ' option-bar--voted' : '') +
                (isChosen ? ' option-bar--chosen' : '')
              }
              onClick={(e) => handleOptionClick(option.id, e.currentTarget)}
              disabled={hasVoted}
              aria-pressed={isChosen}
            >
              <span
                ref={(el) => (fillRefs.current[option.id] = el)}
                className="option-bar__fill"
                style={{ width: '0%' }}
                aria-hidden="true"
              />
              <span className="option-bar__label">{option.text}</span>
              <span
                ref={(el) => (pctRefs.current[option.id] = el)}
                className="option-bar__pct"
              />
            </button>
          )
        })}
      </div>

      {hasVoted && (
        <p className="poll-card__total">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </p>
      )}

      <div className="poll-card__footer">
        <div className="vote-row">
          <button
            ref={upBtnRef}
            type="button"
            className={
              'vote-btn' + (reaction === 'up' ? ' vote-btn--up-active' : '')
            }
            onClick={() => handleReactClick('up', upBtnRef)}
            aria-pressed={reaction === 'up'}
            aria-label="Upvote poll"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M12 5l7 8h-4.5v6h-5v-6H5l7-8z"
                fill={reaction === 'up' ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span ref={scoreRef} className="vote-row__score">
            {formatCount(score)}
          </span>
          <button
            ref={downBtnRef}
            type="button"
            className={
              'vote-btn' +
              (reaction === 'down' ? ' vote-btn--down-active' : '')
            }
            onClick={() => handleReactClick('down', downBtnRef)}
            aria-pressed={reaction === 'down'}
            aria-label="Downvote poll"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M12 19l-7-8h4.5V5h5v6H19l-7 8z"
                fill={reaction === 'down' ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}

export default PollCard
