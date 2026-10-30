import React, { useEffect, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import '../styles/index.css'
import EffectPreview from '../components/EffectPreview'
import CursorEffect from '../components/CursorEffect'
import { EFFECTS } from '../types'
import { TRAIL_ART } from '../effects/trailArt'
function Review() {
 const params=new URLSearchParams(location.search),id=params.get('id') ?? 'chakra_tempest'
 const [active,setActive]=useState(true),[step,setStep]=useState(0)
 const surface=useRef<HTMLDivElement>(null)
 useEffect(()=>{if(!active)return;const timer=setInterval(()=>setStep(n=>(n+1)%34),140);return()=>clearInterval(timer)},[active])
 const ids=params.has('all')?Object.keys(TRAIL_ART):Object.keys(TRAIL_ART).slice(Number(params.get('batch')??0)*25,(Number(params.get('batch')??0)+1)*25)
 return <main style={{background:'#09090c',padding:24,color:'white',minHeight:'100vh'}}>
 <h1>Trail art · {Object.keys(TRAIL_ART).length}/{Object.keys(EFFECTS).length}</h1><button onClick={()=>setActive(!active)} style={{padding:12,border:'1px solid #555',margin:'16px 0'}}>Toggle motion</button>
 <div ref={surface} style={{position:'relative',width:660,height:180,border:'1px solid #444',borderRadius:12,overflow:'hidden',marginBottom:24,padding:24,font:'22px monospace',background:'#111116'}}>
  <p>The quick brown fox jumps over</p><span data-caret="player" style={{position:'absolute',left:24+step*16,top:23,width:3,height:27,background:'#f97316',boxShadow:'0 0 4px #f97316'}}/>
  <p style={{marginTop:35}}>Both players see equipped trails</p><span data-caret="opponent" style={{position:'absolute',left:24+((step+7)%34)*16,top:84,width:3,height:27,background:'#a78bfa'}}/>
  <CursorEffect effectId={id} targetRef={surface} caret="player" progress={step}/><CursorEffect effectId="sakura_nocturne" targetRef={surface} caret="opponent" progress={step}/>
 </div>
 <div style={{display:'grid',gridTemplateColumns:'repeat(5,minmax(0,1fr))',gap:12}}>{ids.map(id=><section key={id} style={{border:'1px solid #333',borderRadius:12,padding:12,background:'#111116'}}><EffectPreview effectId={id} color={EFFECTS[id].color} active={active}/><p style={{fontSize:11}}>{EFFECTS[id].name}</p></section>)}</div>
 </main>
}
if(import.meta.env.DEV){const target=document.getElementById('root')! as HTMLElement & {reviewRoot?:Root};target.reviewRoot??=createRoot(target);target.reviewRoot.render(<Review/>)}
