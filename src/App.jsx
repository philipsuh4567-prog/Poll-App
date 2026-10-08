import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import Header from './components/Header'
import FilterPills from './components/FilterPills'
import PollCard from './components/PollCard'
import CreateButton from './components/CreateButton'
import CreatePollModal from './components/CreatePollModal'
import {
  applyPollReaction,
  createPoll,
  fetchPolls,
  subscribeToPolls,
  voteOnPoll,
} from './lib/polls'
import { recordPollPosted } from './utils/dailyLimit'
import { loadJSON, saveJSON } from './utils/storage'

function App() {
  const appRef = useRef(null)
  const hasAnimatedEntrance = useRef(false)

  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSort, setActiveSort] = useState('newest')
  const [votes, setVotes] = useState(() => loadJSON('polly:votes', {}))
  const [reactions, setReactions] = useState(() =>
    loadJSON('polly:reactions', {})
  )
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [feedReady, setFeedReady] = useState(false)

  useEffect(() => {
    saveJSON('polly:votes', votes)
  }, [votes])

  useEffect(() => {
    saveJSON('polly:reactions', reactions)
  }, [reactions])

  useEffect(() => {
    let active = true

    fetchPolls()
      .then((data) => {
        if (!active) return
        // Realtime events that arrived mid-fetch are newer than this snapshot.
        setPolls((prev) => {
          const known = new Set(prev.map((p) => p.id))
          return [...prev, ...data.filter((p) => !known.has(p.id))]
        })
      })
      .catch((err) => {
        if (active) setLoadError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const unsubscribe = subscribeToPolls({
      onInsert: (poll) =>
        setPolls((prev) =>
          prev.some((p) => p.id === poll.id) ? prev : [poll, ...prev]
        ),
      onUpdate: (poll) =>
        setPolls((prev) => prev.map((p) => (p.id === poll.id ? poll : p))),
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  async function handleCreatePoll({ question, options }) {
    const newPoll = await createPoll({ question, options })
    setPolls((prev) =>
      prev.some((p) => p.id === newPoll.id) ? prev : [newPoll, ...prev]
    )
    recordPollPosted()
  }

  async function handleVote(pollId, optionId) {
    if (votes[pollId] != null) return

    setVotes((prev) => ({ ...prev, [pollId]: optionId }))

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

    try {
      await voteOnPoll(pollId, optionId)
    } catch (err) {
      console.error('Failed to record vote', err)
      setVotes((prev) => {
        const rolledBack = { ...prev }
        delete rolledBack[pollId]
        return rolledBack
      })
      setPolls((prev) =>
        prev.map((p) =>
          p.id !== pollId
            ? p
            : {
                ...p,
                options: p.options.map((o) =>
                  o.id === optionId
                    ? { ...o, votes: Math.max(0, o.votes - 1) }
                    : o
                ),
              }
        )
      )
    }
  }

  async function handleReact(pollId, direction) {
    const current = reactions[pollId] ?? null
    const nextReaction = current === direction ? null : direction

    let deltaUp = 0
    let deltaDown = 0
    if (current === 'up') deltaUp -= 1
    if (current === 'down') deltaDown -= 1
    if (nextReaction === 'up') deltaUp += 1
    if (nextReaction === 'down') deltaDown += 1

    setPolls((prev) =>
      prev.map((p) =>
        p.id !== pollId
          ? p
          : {
              ...p,
              upvotes: p.upvotes + deltaUp,
              downvotes: p.downvotes + deltaDown,
            }
      )
    )

    setReactions((prev) => {
      const next = { ...prev, [pollId]: nextReaction }
      if (nextReaction === null) delete next[pollId]
      return next
    })

    try {
      await applyPollReaction(pollId, deltaUp, deltaDown)
    } catch (err) {
      console.error('Failed to record reaction', err)
      setPolls((prev) =>
        prev.map((p) =>
          p.id !== pollId
            ? p
            : {
                ...p,
                upvotes: p.upvotes - deltaUp,
                downvotes: p.downvotes - deltaDown,
              }
        )
      )
      setReactions((prev) => {
        const rolledBack = { ...prev }
        if (current === null) delete rolledBack[pollId]
        else rolledBack[pollId] = current
        return rolledBack
      })
    }
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
    if (loading || hasAnimatedEntrance.current) return
    hasAnimatedEntrance.current = true
    setFeedReady(true)

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
  }, [loading])

  return (
    <div className="app" ref={appRef}>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <FilterPills activeSort={activeSort} onChange={setActiveSort} />

      <main className="feed">
        {loading ? (
          <p className="feed__empty feed__loading">Loading polls…</p>
        ) : loadError ? (
          <p className="feed__empty">Couldn't load polls: {loadError}</p>
        ) : visiblePolls.length === 0 ? (
          <p className="feed__empty">No polls match your search.</p>
        ) : (
          visiblePolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              votedOptionId={votes[poll.id] ?? null}
              reaction={reactions[poll.id] ?? null}
              animateOnMount={feedReady}
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
