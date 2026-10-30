import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import '../../src/styles/index.css'
import CursorCosmeticPreview from '../components/CursorCosmeticPreview'
import { AUTHORED_CURSORS } from '../components/CursorArtwork'
import { CURSORS } from '../types'

function Review() {
  const batch = Math.max(0, Number(new URLSearchParams(location.search).get('batch') ?? 0))
  const ids = [...AUTHORED_CURSORS].slice(batch * 48, (batch + 1) * 48)
  const [active, setActive] = React.useState(true)
  return <main style={{ padding:32, background:'#09090c', minHeight:'100vh', color:'white' }}>
    <h1 style={{ fontSize:24, marginBottom:16 }}>Authored cursor review · {AUTHORED_CURSORS.size} / {Object.keys(CURSORS).length}</h1>
    <button onClick={() => setActive(!active)} style={{ padding:12, border:'1px solid #555', marginBottom:20 }}>{active ? 'Pause animations' : 'Animate'}</button>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(6,minmax(0,1fr))', gap:16 }}>
      {ids.map(id => <section key={id} style={{ border:'1px solid #ffffff18', borderRadius:12, background:'#111116', overflow:'hidden' }}>
        <div style={{ height:140, display:'grid', placeItems:'center' }}><CursorCosmeticPreview id={id} active={active} /></div>
        <p style={{ padding:12, fontSize:12, borderTop:'1px solid #ffffff12' }}>{CURSORS[id].name}</p>
      </section>)}
    </div>
  </main>
}
if (import.meta.env.DEV) {
 const target = document.getElementById('root')! as HTMLElement & { reviewRoot?: Root }
 target.reviewRoot ??= createRoot(target)
 target.reviewRoot.render(<Review />)
}
