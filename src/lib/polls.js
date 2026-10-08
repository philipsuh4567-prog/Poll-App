import { supabase } from './supabaseClient'

const FEED_LIMIT = 100

function mapRow(row) {
  return {
    id: row.id,
    question: row.question,
    options: row.options,
    upvotes: row.upvotes,
    downvotes: row.downvotes,
    createdAt: new Date(row.created_at).getTime(),
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

export async function createPoll({ question, options }) {
  const { data, error } = await supabase
    .from('polls')
    .insert({
      question,
      options: options.map((text, i) => ({ id: i, text, votes: 0 })),
      upvotes: 0,
      downvotes: 0,
    })
    .select()
    .single()

  if (error) throw error
  return mapRow(data)
}

export async function voteOnPoll(pollId, optionId) {
  const { error } = await supabase.rpc('increment_poll_vote', {
    p_poll_id: pollId,
    p_option_id: optionId,
  })
  if (error) throw error
}

export async function applyPollReaction(pollId, deltaUp, deltaDown) {
  const { error } = await supabase.rpc('apply_poll_reaction', {
    p_poll_id: pollId,
    p_delta_up: deltaUp,
    p_delta_down: deltaDown,
  })
  if (error) throw error
}

export function subscribeToPolls({ onInsert, onUpdate }) {
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
    .subscribe()

  return () => supabase.removeChannel(channel)
}
