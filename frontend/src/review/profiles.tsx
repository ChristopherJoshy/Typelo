import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import '../styles/index.css'
import ProfileEffectFrame from '../components/ProfileEffectFrame'
import { PROFILE_SCENE_ART } from '../components/ProfileSceneArt'
import { PROFILE_EFFECTS } from '../types'
function Review() {
 const [active,setActive] = React.useState(true)
 const batch = Number(new URLSearchParams(location.search).get('batch') ?? 0)
 const selected = new URLSearchParams(location.search).get('tall')
 const ids = selected && PROFILE_SCENE_ART[selected] ? [selected] : new URLSearchParams(location.search).has('all') ? Object.keys(PROFILE_SCENE_ART) : Object.keys(PROFILE_SCENE_ART).slice(batch * 25,(batch + 1) * 25)
 return <main style={{background:'#09090c',padding:24,color:'white',minHeight:'100vh'}}>
  <h1 style={{fontSize:24}}>Profile scenes · {Object.keys(PROFILE_SCENE_ART).length}/{Object.keys(PROFILE_EFFECTS).length}</h1>
  <button onClick={()=>setActive(!active)} style={{padding:12,border:'1px solid #555',margin:'16px 0'}}>Toggle motion</button>
  <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:16}}>{ids.map(id=><section key={id} style={{height:selected ? 680 : 240,position:'relative',border:'1px solid #333',borderRadius:12,overflow:'hidden',background:'#111116'}}>
   <ProfileEffectFrame effect={PROFILE_EFFECTS[id]} active={active}/>
   <div style={{position:'relative',zIndex:10,textAlign:'center',padding:40}}><div style={{width:50,height:50,background:'#27272d',borderRadius:'50%',margin:'auto'}}/>
    <p style={{fontSize:14,margin:12}}>Player profile</p><p style={{fontSize:11,color:'#aaa'}}>1400 ELO · 80 WPM</p></div>
   <p style={{position:'absolute',bottom:12,left:16,fontSize:11,zIndex:20}}>{PROFILE_EFFECTS[id].name}</p>
  </section>)}</div>
 </main>
}
if (import.meta.env.DEV) {
 const target = document.getElementById('root')! as HTMLElement & { reviewRoot?: Root }
 target.reviewRoot ??= createRoot(target)
 target.reviewRoot.render(<Review />)
}
