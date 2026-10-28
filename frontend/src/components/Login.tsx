import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import GoogleIcon from './icons/GoogleIcon'
import SEOHead from './SEOHead'
import { faqSchema } from '../data/faqData'

const authButtonClass = 'relative flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 disabled:cursor-not-allowed disabled:opacity-50'

function TypeloMark() {
  return (
    <a href="/" aria-label="Typelo home" className="inline-flex items-center gap-2.5 text-white">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 text-rose-400" fill="currentColor">
        <path d="M13 2 4 14h6l-2 8 10-12h-6l4-8z" />
      </svg>
      <span className="text-2xl font-semibold tracking-[-0.06em]">typelo<span className="text-rose-400">.</span></span>
    </a>
  )
}

export default function Login() {
  const { signInWithGoogle, registerAsGuest, signInAsGuest, loading, error } = useAuth()
  const [showGuestMode, setShowGuestMode] = useState(false)
  const [isNewGuest, setIsNewGuest] = useState(true)
  const [guestUsername, setGuestUsername] = useState('')
  const [guestPassword, setGuestPassword] = useState('')
  const [guestError, setGuestError] = useState('')

  const handleGuestSubmit = async () => {
    setGuestError('')

    if (guestUsername.length < 3 || guestUsername.length > 20) {
      setGuestError('Username must be 3–20 characters')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(guestUsername)) {
      setGuestError('Use letters, numbers, or underscores in your username')
      return
    }
    if (guestPassword.length < 6) {
      setGuestError('Password must be at least 6 characters')
      return
    }

    try {
      if (isNewGuest) await registerAsGuest(guestUsername, guestPassword)
      else await signInAsGuest(guestUsername, guestPassword)
    } catch (err: unknown) {
      setGuestError(err instanceof Error ? err.message : 'Authentication failed')
    }
  }

  return (
    <>
      <SEOHead description="Play real-time 1v1 typing matches on Typelo." path="/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="flex min-h-screen min-h-[100svh] items-center justify-center bg-[#050505] px-6 py-12 text-white">
        <section aria-labelledby="signin-heading" className="w-full max-w-[360px]">
          <header className="mb-10 flex justify-center">
            <TypeloMark />
          </header>

          <h1 id="signin-heading" className="sr-only">{showGuestMode ? (isNewGuest ? 'Create a guest account' : 'Sign in as a guest') : 'Sign in to Typelo'}</h1>

          {!showGuestMode ? (
            <div className="space-y-3">
              <button type="button" onClick={signInWithGoogle} disabled={loading} className={authButtonClass}>
                <GoogleIcon className="absolute left-4 h-5 w-5" />
                <span>{loading ? 'Connecting…' : 'Continue with Google'}</span>
              </button>
              <button type="button" onClick={() => setShowGuestMode(true)} disabled={loading} className={authButtonClass}>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="absolute left-4 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="12" cy="8" r="3.2" />
                  <path d="M5.5 19c.8-3.2 3.1-4.8 6.5-4.8s5.7 1.6 6.5 4.8" strokeLinecap="round" />
                </svg>
                <span>Play as guest</span>
              </button>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void handleGuestSubmit() }}>
              <label className="block text-xs text-white/60">
                Username
                <input autoComplete="username" type="text" value={guestUsername} onChange={event => setGuestUsername(event.target.value)} maxLength={20} className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-3 text-sm text-white placeholder:text-white/30 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400/50" placeholder="Username" />
              </label>
              <label className="block text-xs text-white/60">
                Password
                <input autoComplete={isNewGuest ? 'new-password' : 'current-password'} type="password" value={guestPassword} onChange={event => setGuestPassword(event.target.value)} maxLength={50} className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-3 text-sm text-white placeholder:text-white/30 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400/50" placeholder="Password" />
              </label>
              <button type="submit" disabled={loading || !guestUsername || !guestPassword} className={`${authButtonClass} border-rose-400/30 bg-rose-500/10 text-rose-100 hover:border-rose-300/50 hover:bg-rose-500/15`}>
                {loading ? 'Please wait…' : isNewGuest ? 'Create account' : 'Sign in'}
              </button>
              <button type="button" onClick={() => { setIsNewGuest(!isNewGuest); setGuestError('') }} className="w-full py-2 text-xs text-white/50 transition-colors hover:text-white">
                {isNewGuest ? 'Already have an account? Sign in' : 'New here? Create an account'}
              </button>
              <button type="button" onClick={() => { setShowGuestMode(false); setGuestError('') }} className="w-full py-1 text-xs text-white/40 transition-colors hover:text-white">
                Back
              </button>
            </form>
          )}

          {(error || guestError) && <p role="alert" className="mt-4 rounded-lg border border-rose-400/20 bg-rose-400/[0.08] px-3 py-2 text-sm text-rose-200">{error || guestError}</p>}
        </section>
      </section>
    </>
  )
}
