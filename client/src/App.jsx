import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import Header from './components/Header'
import FilterPills from './components/FilterPills'
import PollCard from './components/PollCard'
import CreateButton from './components/CreateButton'
import CreatePollModal from './components/CreatePollModal'
import { mockPolls } from './data/mockPolls'
import { recordPollPosted } from './utils/dailyLimit'

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const appRef = useRef(null)
  const [polls, setPolls] = useState(() => [
    ...mockPolls,
    ...loadJSON('polly:userPolls', []),
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSort, setActiveSort] = useState('newest')
  const [votes, setVotes] = useState(() => loadJSON('polly:votes', {}))
  const [reactions, setReactions] = useState(() =>
    loadJSON('polly:reactions', {})
  )
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  function handleCreatePoll({ question, options }) {
    const newPoll = {
      id: Date.now(),
      question,
      options: options.map((text, i) => ({ id: i, text, votes: 0 })),
      upvotes: 0,
      downvotes: 0,
      createdAt: Date.now(),
    }
    setPolls((prev) => [newPoll, ...prev])

    const storedUserPolls = loadJSON('polly:userPolls', [])
    localStorage.setItem(
      'polly:userPolls',
      JSON.stringify([newPoll, ...storedUserPolls])
    )

    recordPollPosted()
  }

  function handleVote(pollId, optionId) {
    if (votes[pollId] != null) return
    setPolls((prev) =>
      prev.map((p) =>
        p.id !== pollId
          ? p
          : {
              ...p,
              options: p.options.map((o) =>
                o.id === optionId ? { ...o, votes: o.votes + 1 } : o
              ),
            }
      )
    )
    const next = { ...votes, [pollId]: optionId }
    setVotes(next)
    localStorage.setItem('polly:votes', JSON.stringify(next))
  }

  function handleReact(pollId, direction) {
    const current = reactions[pollId] ?? null
    const nextReaction = current === direction ? null : direction

    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId) return p
        let { upvotes, downvotes } = p
        if (current === 'up') upvotes -= 1
        if (current === 'down') downvotes -= 1
        if (nextReaction === 'up') upvotes += 1
        if (nextReaction === 'down') downvotes += 1
        return { ...p, upvotes, downvotes }
      })
    )

    const next = { ...reactions, [pollId]: nextReaction }
    if (nextReaction === null) delete next[pollId]
    setReactions(next)
    localStorage.setItem('polly:reactions', JSON.stringify(next))
  }

  const visiblePolls = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let list = polls.filter((p) => p.question.toLowerCase().includes(q))

    list = [...list].sort((a, b) => {
      switch (activeSort) {
        case 'liked':
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
        case 'voted':
          return (
            b.options.reduce((s, o) => s + o.votes, 0) -
            a.options.reduce((s, o) => s + o.votes, 0)
          )
        case 'oldest':
          return a.createdAt - b.createdAt
        case 'newest':
        default:
          return b.createdAt - a.createdAt
      }
    })

    return list
  }, [polls, searchQuery, activeSort])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const header = appRef.current.querySelector('.header')
      const pills = appRef.current.querySelector('.pills')
      const cards = gsap.utils.toArray(
        appRef.current.querySelectorAll('.poll-card')
      )

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      if (header) tl.from(header, { y: -16, opacity: 0, duration: 0.5 })
      if (pills) tl.from(pills, { y: -10, opacity: 0, duration: 0.4 }, '-=0.25')
      if (cards.length) {
        tl.from(
          cards,
          { y: 24, opacity: 0, duration: 0.5, stagger: 0.08 },
          '-=0.2'
        )
      }
    }, appRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="app" ref={appRef}>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <FilterPills activeSort={activeSort} onChange={setActiveSort} />

      <main className="feed">
        {visiblePolls.length === 0 ? (
          <p className="feed__empty">No polls match your search.</p>
        ) : (
          visiblePolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              votedOptionId={votes[poll.id] ?? null}
              reaction={reactions[poll.id] ?? null}
              onVote={handleVote}
              onReact={handleReact}
            />
          ))
        )}
      </main>

      <CreateButton onClick={() => setIsCreateOpen(true)} />

      {isCreateOpen && (
        <CreatePollModal
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreatePoll}
        />
      )}
    </div>
  )
}

export default App
