import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import '../styles/index.css'
import AvatarDecoration from '../components/AvatarDecoration'
import { PROFILE_BORDERS } from '../types'

const ALL_IDS = Object.keys(PROFILE_BORDERS)

function Avatar({ size, id, active }: { size: number; id: string; active: boolean }) {
  const inner = Math.round(size * 0.56)
  return <div style={{ position: 'relative', width: size, height: size, flex: '0 0 auto' }}>
    <div style={{ position: 'absolute', width: inner, height: inner, left: (size - inner) / 2, top: (size - inner) / 2, borderRadius: '50%', background: 'linear-gradient(140deg,#5b3f7a,#263452)', display: 'grid', placeItems: 'center', fontSize: inner * 0.42, color: '#eadcff', border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 6px 18px rgba(0,0,0,.35)' }}>A</div>
    <AvatarDecoration decorationType={`border:${id}`} size={size} animate={active} />
  </div>
}

function Review() {
  const [active, setActive] = React.useState(true)
  const params = new URLSearchParams(location.search)
  const batch = Number(params.get('batch') ?? 0)
  const selected = params.get('id')
  const ids = selected && PROFILE_BORDERS[selected] ? [selected] : params.has('all') ? ALL_IDS : ALL_IDS.slice(batch * 20, (batch + 1) * 20)
  return <main style={{ background: '#09090c', padding: 24, color: 'white', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
    <h1 style={{ fontSize: 22, margin: '0 0 8px' }}>Avatar surrounds · {ALL_IDS.length} pieces · batch {batch + 1}/{Math.ceil(ALL_IDS.length / 20)}</h1>
    <p style={{ fontSize: 12, color: '#8e899c', margin: '0 0 14px' }}>Large profile size plus the leaderboard size (60px) on every card, so crests must read at both scales.</p>
    <button onClick={() => setActive(!active)} style={{ padding: '9px 14px', border: '1px solid #4d4759', background: '#17151f', color: '#e9e5f2', borderRadius: 8, marginBottom: 18, cursor: 'pointer' }}>{active ? 'Pause motion' : 'Play motion'}</button>
    {selected
      ? <section style={{ height: 560, border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, background: 'linear-gradient(180deg,#141219,#0c0b10)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34 }}>
        <Avatar size={260} id={selected} active={active} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 38 }}><Avatar size={132} id={selected} active={active} /><Avatar size={60} id={selected} active={active} /></div>
        <p style={{ fontSize: 14, color: '#d9d3e6' }}>{PROFILE_BORDERS[selected].name} · {selected}</p>
      </section>
      : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 16 }}>
        {ids.map(id => <section key={id} style={{ minHeight: 218, border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, background: 'linear-gradient(180deg,#141219,#0c0b10)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar size={126} id={id} active={active} />
            <Avatar size={60} id={id} active={active} />
          </div>
          <p style={{ fontSize: 10, color: '#cfc8dd', margin: 0, textAlign: 'center' }}>{PROFILE_BORDERS[id].name}</p>
        </section>)}
      </div>}
  </main>
}
if (import.meta.env.DEV) {
  const target = document.getElementById('root')! as HTMLElement & { reviewRoot?: Root }
  target.reviewRoot ??= createRoot(target)
  target.reviewRoot.render(<Review />)
}
