import { supabase } from './supabaseClient'
import { ensureSignedIn } from './auth'

const FEED_LIMIT = 100
export const DAILY_POLL_LIMIT = 3

function mapRow(row) {
  return {
    id: row.id,
    question: row.question,
    options: row.options,
    upvotes: row.upvotes,
    downvotes: row.downvotes,
    createdAt: new Date(row.created_at).getTime(),
    expiresAt: new Date(row.expires_at).getTime(),
  }
}

export async function fetchPolls() {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(FEED_LIMIT)

  if (error) throw error
  return data.map(mapRow)
}

const KNOWN_ERRORS = ['daily_limit_reached', 'sign_in_required', 'invalid_poll']

// The database raises these as plain-text messages; turn them into stable codes.
function toAppError(error) {
  const code = KNOWN_ERRORS.find((known) => error?.message?.includes(known))
  return new Error(code ?? 'request_failed')
}

async function identified(call) {
  try {
    await ensureSignedIn()
  } catch {
    throw new Error('sign_in_required')
  }
  const { data, error } = await call()
  if (error) throw toAppError(error)
  return data
}

export async function getPostsRemaining() {
  return identified(() => supabase.rpc('get_posts_remaining'))
}

export async function createPoll({ question, options }) {
  const row = await identified(() =>
    supabase.rpc('create_poll', { p_question: question, p_options: options })
  )
  return mapRow(row)
}

// Resolves to false when the server didn't count the vote (already voted,
// poll gone, or no such option).
export async function voteOnPoll(pollId, optionId) {
  return identified(() =>
    supabase.rpc('cast_vote', { p_poll_id: pollId, p_option_id: optionId })
  )
}

export async function applyPollReaction(pollId, deltaUp, deltaDown) {
  const { error } = await supabase.rpc('apply_poll_reaction', {
    p_poll_id: pollId,
    p_delta_up: deltaUp,
    p_delta_down: deltaDown,
  })
  if (error) throw error
}

export function subscribeToPolls({ onInsert, onUpdate, onDelete }) {
  const channel = supabase
    .channel('polls-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'polls' },
      (payload) => onInsert(mapRow(payload.new))
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'polls' },
      (payload) => onUpdate(mapRow(payload.new))
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'polls' },
      (payload) => onDelete(payload.old.id)
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}
