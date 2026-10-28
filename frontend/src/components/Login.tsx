/*   _________      ____   ____ ____ ____  ______  __   __ 
 *  |  _______|    / __ \ / __ \_  _|  _ \|  ____| \ \ / / 
 *  | |__ __    __/ /  \ | |  | || || | \ | |__     \ V /  
 *  |  __|  \  / /| |  | | |  | || || |  \|  __|     > <   
 *  | |____  \/ / | |__| | |__| || || |_/ | |____   / . \  
 *  |______|  \_\  \____/ \____/|___|____/|______| /_/ \_\ 
 *                                                         
 *  Login Component - Minimal authentication entry point.
 *  Clean, elegant design with no animations.
 */

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import GoogleIcon from './icons/GoogleIcon'
import SEOHead from './SEOHead'
import { faqSchema } from '../data/faqData'

export default function Login() {
  const { signInWithGoogle, registerAsGuest, signInAsGuest, loading, error } = useAuth()

  // Guest mode state
  const [showGuestMode, setShowGuestMode] = useState(false)
  const [isNewGuest, setIsNewGuest] = useState(true)
  const [guestUsername, setGuestUsername] = useState('')
  const [guestPassword, setGuestPassword] = useState('')
  const [guestError, setGuestError] = useState('')

  const handleGuestSubmit = async () => {
    setGuestError('')

    if (guestUsername.length < 3 || guestUsername.length > 20) {
      setGuestError('Username must be 3-20 characters')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(guestUsername)) {
      setGuestError('Username can only contain letters, numbers, and underscores')
      return
    }
    if (guestPassword.length < 6) {
      setGuestError('Password must be at least 6 characters')
      return
    }

    try {
      if (isNewGuest) {
        await registerAsGuest(guestUsername, guestPassword)
      } else {
        await signInAsGuest(guestUsername, guestPassword)
      }
    } catch (err: any) {
      setGuestError(err.message || 'Authentication failed')
    }
  }

  return (
    <>
      <SEOHead title="Sign In" description="Play real-time 1v1 typing matches on Typelo." path="/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="relative min-h-screen overflow-hidden bg-[#08090d] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,rgba(244,63,94,0.12),transparent_38%),radial-gradient(ellipse_at_85%_85%,rgba(99,102,241,0.10),transparent_40%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 sm:px-10">
          <header className="flex h-20 items-center justify-between border-b border-white/[0.07]">
            <a href="/" aria-label="Typelo home" className="flex items-center gap-3 font-bold tracking-tight">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-500 text-lg shadow-[0_0_24px_rgba(244,63,94,0.25)]">ϟ</span>
              <span className="text-xl">typelo<span className="text-rose-400">.</span></span>
            </a>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 sm:text-xs">Type fast. Play fair.</span>
          </header>
          <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1fr_420px] lg:gap-20 lg:py-20">
            <section className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/[0.07] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-rose-300">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Real-time typing duels
              </div>
              <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-7xl">Every keystroke<br /><span className="text-white/35">counts.</span></h1>
              <p className="mt-6 max-w-md text-base leading-7 text-white/55 sm:text-lg">Challenge an opponent, find your rhythm, and climb the ranks one word at a time.</p>
              <div aria-hidden="true" className="mt-10 hidden max-w-lg rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:block">
                <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-white/35"><span>Find your flow</span><span>01 / 01</span></div>
                <p className="font-mono text-lg leading-relaxed tracking-tight text-white/35"><span className="text-rose-300">speed is built</span><span className="border-l-2 border-rose-400 pl-1 text-white/80"> one word</span> at a time.</p>
              </div>
            </section>
            <section aria-labelledby="signin-heading" className="w-full rounded-[28px] border border-white/10 bg-[#111218]/95 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.45)] sm:p-8">
              <div className="mb-8"><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-rose-300">Your next match awaits</p><h2 id="signin-heading" className="text-2xl font-semibold tracking-tight">{showGuestMode ? (isNewGuest ? 'Create your account' : 'Welcome back') : 'Ready to play?'}</h2><p className="mt-2 text-sm leading-6 text-white/50">{showGuestMode ? 'Your guest account keeps your progress.' : 'Sign in and get straight to the starting line.'}</p></div>
              {!showGuestMode ? (
                <div className="space-y-3">
                  <button type="button" onClick={signInWithGoogle} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-4 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"><GoogleIcon className="h-5 w-5" /> Continue with Google</button>
                  <div className="flex items-center gap-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white/30"><span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" /></div>
                  <button type="button" onClick={() => setShowGuestMode(true)} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08] disabled:opacity-50"><span aria-hidden="true" className="text-white/45">↗</span> Play as guest</button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void handleGuestSubmit() }}>
                  <label className="block text-xs font-medium text-white/60">Username<input autoComplete="username" type="text" value={guestUsername} onChange={e => setGuestUsername(e.target.value)} maxLength={20} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:border-rose-400" placeholder="Choose a username" /></label>
                  <label className="block text-xs font-medium text-white/60">Password<input autoComplete={isNewGuest ? 'new-password' : 'current-password'} type="password" value={guestPassword} onChange={e => setGuestPassword(e.target.value)} maxLength={50} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:border-rose-400" placeholder="At least 6 characters" /></label>
                  <button type="submit" disabled={loading || !guestUsername || !guestPassword} className="w-full rounded-xl bg-rose-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-50">{loading ? 'Please wait…' : (isNewGuest ? 'Create account' : 'Sign in')}</button>
                  <button type="button" onClick={() => { setIsNewGuest(!isNewGuest); setGuestError('') }} className="w-full py-1 text-center text-sm text-white/55 transition hover:text-white">{isNewGuest ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>
                  <button type="button" onClick={() => { setShowGuestMode(false); setGuestError('') }} className="w-full py-1 text-center text-xs text-white/40 transition hover:text-white">← Back to sign in options</button>
                </form>
              )}
              {(error || guestError) && <p role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">{error || guestError}</p>}
              <p className="mt-7 border-t border-white/[0.07] pt-5 text-center text-xs leading-5 text-white/35">A little competition. A lot of progress.</p>
            </section>
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] py-6 text-xs text-white/35"><span>Built for the love of typing.</span><a href="https://github.com/christopherjoshy" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Made by Chris ↗</a></footer>
        </div>
      </main>
    </>
  )
}
