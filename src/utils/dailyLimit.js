const STORAGE_KEY = 'polly:dailyPosts'
export const DAILY_POLL_LIMIT = 3

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (raw && raw.date === todayKey()) return raw
  } catch {
    // ignore malformed storage
  }
  return { date: todayKey(), count: 0 }
}

export function getPostsRemainingToday() {
  return Math.max(0, DAILY_POLL_LIMIT - read().count)
}

export function recordPollPosted() {
  const state = read()
  state.count += 1
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  return Math.max(0, DAILY_POLL_LIMIT - state.count)
}
