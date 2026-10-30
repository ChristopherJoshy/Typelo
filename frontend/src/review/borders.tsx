import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import '../styles/index.css'
import AvatarDecoration from '../components/AvatarDecoration'
import { AVATAR_BORDER_ART } from '../components/AvatarBorderArt'
import { PROFILE_BORDERS } from '../types'
function Review() {
 const [active,setActive] = React.useState(true)
 const batch = Number(new URLSearchParams(location.search).get('batch') ?? 0)
 const ids = new URLSearchParams(location.search).has('all') ? Object.keys(AVATAR_BORDER_ART) : Object.keys(AVATAR_BORDER_ART).slice(batch*25,(batch+1)*25)
 return <main style={{background:'#09090c',padding:24,color:'white',minHeight:'100vh'}}>
  <h1>Avatar surrounds · {Object.keys(AVATAR_BORDER_ART).length}/{Object.keys(PROFILE_BORDERS).length}</h1>
  <button onClick={()=>setActive(!active)} style={{padding:12,border:'1px solid #555',margin:'16px 0'}}>Toggle motion</button>
  <div style={{display:'grid',gridTemplateColumns:'repeat(5,minmax(0,1fr))',gap:16}}>{ids.map(id=><section key={id} style={{height:180,border:'1px solid #333',borderRadius:12,background:'#111116',display:'grid',placeItems:'center',padding:16}}>
   <div style={{position:'relative',width:110,height:110}}><div style={{position:'absolute',width:68,height:68,top:21,left:21,background:'linear-gradient(140deg,#43305d,#212b46)',borderRadius:'50%',display:'grid',placeItems:'center',fontSize:30,color:'#e0d0f0'}}>A</div><AvatarDecoration decorationType={`border:${id}`} animate={active}/></div>
   <p style={{fontSize:11}}>{PROFILE_BORDERS[id].name}</p>
  </section>)}</div>
 </main>
}
if (import.meta.env.DEV) {
 const target = document.getElementById('root')! as HTMLElement & { reviewRoot?: Root }
 target.reviewRoot ??= createRoot(target)
 target.reviewRoot.render(<Review />)
}
