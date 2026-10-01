import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { DAILY_POLL_LIMIT, getPostsRemainingToday } from '../utils/dailyLimit'

const MIN_OPTIONS = 2
const MAX_OPTIONS = 4

function CreatePollModal({ onClose, onSubmit }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [error, setError] = useState('')

  const backdropRef = useRef(null)
  const sheetRef = useRef(null)
  const remaining = getPostsRemainingToday()
  const limitReached = remaining <= 0

  useLayoutEffect(() => {
    gsap.set(backdropRef.current, { opacity: 0 })
    gsap.set(sheetRef.current, { y: 40, opacity: 0 })
    gsap
      .timeline()
      .to(backdropRef.current, { opacity: 1, duration: 0.25, ease: 'power2.out' })
      .to(
        sheetRef.current,
        { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' },
        '-=0.15'
      )
  }, [])

  function animateClose(after) {
    gsap
      .timeline({ onComplete: after })
      .to(sheetRef.current, { y: 40, opacity: 0, duration: 0.25, ease: 'power2.in' })
      .to(backdropRef.current, { opacity: 0, duration: 0.2 }, '-=0.15')
  }

  function handleClose() {
    animateClose(onClose)
  }

  function handleOptionChange(index, value) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)))
  }

  function handleAddOption(e) {
    if (options.length >= MAX_OPTIONS) return
    gsap.fromTo(
      e.currentTarget,
      { scale: 0.9 },
      { scale: 1, duration: 0.3, ease: 'back.out(2)' }
    )
    setOptions((prev) => [...prev, ''])
  }

  function handleRemoveOption(index) {
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (limitReached) return

    const trimmedQuestion = question.trim()
    const trimmedOptions = options.map((o) => o.trim()).filter(Boolean)

    if (!trimmedQuestion) {
      setError('Enter a poll question first.')
      return
    }
    if (trimmedOptions.length < MIN_OPTIONS) {
      setError('Add at least 2 answer choices.')
      return
    }

    onSubmit({ question: trimmedQuestion, options: trimmedOptions })
    animateClose(onClose)
  }

  return (
    <div className="modal-backdrop" ref={backdropRef} onClick={handleClose}>
      <div
        className="modal-sheet"
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-sheet__header">
          <span className="modal-sheet__logo">Polly</span>
          <button
            type="button"
            className="modal-sheet__close"
            onClick={handleClose}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {limitReached ? (
          <p className="modal-sheet__limit">
            You've posted {DAILY_POLL_LIMIT} polls today. Come back tomorrow
            to post more.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="modal-sheet__title-input"
              placeholder="Title of poll"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value)
                setError('')
              }}
              maxLength={140}
              autoFocus
            />

            <div className="modal-sheet__options">
              {options.map((value, i) => (
                <div key={i} className="modal-option">
                  <input
                    type="text"
                    className="modal-option__input"
                    placeholder={`Add answer choice`}
                    value={value}
                    onChange={(e) => {
                      handleOptionChange(i, e.target.value)
                      setError('')
                    }}
                    maxLength={60}
                  />
                  {options.length > MIN_OPTIONS && (
                    <button
                      type="button"
                      className="modal-option__remove"
                      onClick={() => handleRemoveOption(i)}
                      aria-label="Remove option"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                        <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < MAX_OPTIONS && (
              <button
                type="button"
                className="modal-sheet__add-option"
                onClick={handleAddOption}
              >
                + Add option
              </button>
            )}

            {error && <p className="modal-sheet__error">{error}</p>}

            <button type="submit" className="modal-sheet__post">
              Post
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default CreatePollModal
