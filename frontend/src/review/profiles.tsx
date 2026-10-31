import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import '../styles/index.css'
import ProfileEffectFrame from '../components/ProfileEffectFrame'
import { PROFILE_EFFECTS } from '../types'

const ALL_IDS = Object.keys(PROFILE_EFFECTS)

function MockProfile({ compact = false }: { compact?: boolean }) {
  return <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: compact ? '18px 16px 12px' : '30px 24px 22px', textAlign: 'center', pointerEvents: 'none' }}>
    <div style={{ width: compact ? 44 : 62, height: compact ? 44 : 62, borderRadius: '50%', background: 'linear-gradient(140deg,#5b3f7a,#263452)', border: '2px solid rgba(255,255,255,.16)', display: 'grid', placeItems: 'center', fontSize: compact ? 17 : 24, color: '#eadcff', boxShadow: '0 8px 24px rgba(0,0,0,.4)' }}>A</div>
    <p style={{ fontSize: compact ? 13 : 17, fontWeight: 600, margin: compact ? '9px 0 1px' : '13px 0 3px', letterSpacing: '.01em' }}>Aurora Player</p>
    <p style={{ fontSize: compact ? 9 : 11, color: '#b9b4c7', margin: 0 }}>aurora@typelo.app</p>
    {compact
      ? <div style={{ width: '100%', marginTop: 12, padding: '9px 10px', borderRadius: 9, border: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.025)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#8f8a9e', textTransform: 'uppercase', letterSpacing: '.08em' }}><span>Current Rank</span><span style={{ color: '#fbbf24' }}>Diamond</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 7 }}>
          {['1,400', '1,362'].map(value => <div key={value} style={{ borderRadius: 6, background: 'rgba(255,255,255,.03)', padding: '5px 0', fontSize: 12, fontFamily: 'monospace' }}>{value}</div>)}
        </div>
      </div>
      : <>
        <div style={{ width: '100%', marginTop: 18, padding: '13px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.025)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#8f8a9e', textTransform: 'uppercase', letterSpacing: '.08em' }}><span>Current Rank</span><span style={{ color: '#fbbf24' }}>Diamond</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 9 }}>
            {[['Peak ELO', '1,400'], ['Current ELO', '1,362']].map(([label, value]) => <div key={label} style={{ borderRadius: 8, background: 'rgba(255,255,255,.03)', padding: '8px 0' }}><p style={{ fontSize: 8, color: '#8f8a9e', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 3px' }}>{label}</p><p style={{ fontSize: 15, fontFamily: 'monospace', margin: 0 }}>{value}</p></div>)}
          </div>
        </div>
        <div style={{ width: '100%', marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5 }}>
          {[['Matches', '128'], ['Win', '64%'], ['Best', '96'], ['Avg', '82']].map(([label, value]) => <div key={label}><p style={{ fontSize: 13, fontFamily: 'monospace', margin: 0 }}>{value}</p><p style={{ fontSize: 8, color: '#8f8a9e', margin: '2px 0 0' }}>{label}</p></div>)}
        </div>
        <div style={{ width: '100%', marginTop: 14, display: 'flex', justifyContent: 'center', gap: 22, padding: '9px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.025)', fontSize: 12 }}>
          <span style={{ color: '#34d399', fontFamily: 'monospace' }}>82 <span style={{ color: '#8f8a9e', fontFamily: 'sans-serif', fontSize: 9 }}>W</span></span>
          <span style={{ width: 1, height: 13, background: 'rgba(255,255,255,.1)' }} />
          <span style={{ color: '#fb7185', fontFamily: 'monospace' }}>46 <span style={{ color: '#8f8a9e', fontFamily: 'sans-serif', fontSize: 9 }}>L</span></span>
          <span style={{ width: 1, height: 13, background: 'rgba(255,255,255,.1)' }} />
          <span style={{ color: '#d6d2e2', fontFamily: 'monospace' }}>94% <span style={{ color: '#8f8a9e', fontFamily: 'sans-serif', fontSize: 9 }}>Acc</span></span>
        </div>
      </>}
  </div>
}

function Review() {
  const [active, setActive] = React.useState(true)
  const params = new URLSearchParams(location.search)
  const batch = Number(params.get('batch') ?? 0)
  const selected = params.get('id')
  const ids = selected && PROFILE_EFFECTS[selected] ? [selected] : params.has('all') ? ALL_IDS : ALL_IDS.slice(batch * 12, (batch + 1) * 12)
  return <main style={{ background: '#09090c', padding: 24, color: 'white', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
    <h1 style={{ fontSize: 22, margin: '0 0 8px' }}>Profile scenes · {ALL_IDS.length} pieces · batch {batch + 1}/{Math.ceil(ALL_IDS.length / 12)}</h1>
    <p style={{ fontSize: 12, color: '#8e899c', margin: '0 0 14px' }}>Mocked at the real profile modal layout: avatar and copy sit where the live component draws them.</p>
    <button onClick={() => setActive(!active)} style={{ padding: '9px 14px', border: '1px solid #4d4759', background: '#17151f', color: '#e9e5f2', borderRadius: 8, marginBottom: 18, cursor: 'pointer' }}>{active ? 'Pause motion' : 'Play motion'}</button>
    <div style={{ display: 'grid', gridTemplateColumns: selected ? 'minmax(0,384px)' : 'repeat(3,minmax(0,1fr))', gap: 18 }}>
      {ids.map(id => <section key={id} style={{ height: selected ? 610 : 324, position: 'relative', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, overflow: 'hidden', background: '#0c0c0c', boxShadow: '0 16px 40px rgba(0,0,0,.28)' }}>
        <ProfileEffectFrame effect={PROFILE_EFFECTS[id]} active={active} />
        <MockProfile compact={!selected} />
        <p style={{ position: 'absolute', bottom: 8, left: 12, fontSize: 10, zIndex: 20, color: '#b9b2c8', margin: 0 }}>{PROFILE_EFFECTS[id].name} · {id}</p>
      </section>)}
    </div>
  </main>
}
if (import.meta.env.DEV) {
  const target = document.getElementById('root')! as HTMLElement & { reviewRoot?: Root }
  target.reviewRoot ??= createRoot(target)
  target.reviewRoot.render(<Review />)
}
