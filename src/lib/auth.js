import { supabase } from './supabaseClient'

let pending = null

// Gives this browser an anonymous Supabase identity (a random user id kept in
// localStorage) the first time it's needed. There is no login screen.
export function ensureSignedIn() {
  if (!pending) {
    pending = (async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) return data.session.user

      const { data: signedIn, error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      return signedIn.user
    })().catch((error) => {
      pending = null
      throw error
    })
  }
  return pending
}
