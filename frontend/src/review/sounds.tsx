import { createRoot } from 'react-dom/client'
import { CURSORS, EFFECTS, PROFILE_EFFECTS, PROFILE_BORDERS } from '../types'
import { playCosmeticPair, unlockCosmeticAudio } from '../effects/cosmeticAudio'
import '../styles/index.css'
const premium=(catalog:Record<string,{id:string;rarity:string}>)=>Object.values(catalog).find(i=>i.rarity==='divine')!.id
function Review(){return <main style={{padding:40,color:'white',background:'#101015',minHeight:'100vh'}}><h1>Premium audio review</h1><button style={{padding:20,border:'1px solid white',margin:20}} onClick={()=>{unlockCosmeticAudio();setTimeout(()=>playCosmeticPair('typing',premium(CURSORS),premium(EFFECTS),'review-typing'),100)}}>Play paired typing</button><button style={{padding:20,border:'1px solid white',margin:20}} onClick={()=>{unlockCosmeticAudio();setTimeout(()=>playCosmeticPair('profile',premium(PROFILE_EFFECTS),premium(PROFILE_BORDERS),'review-profile'),100)}}>Play paired profile</button></main>}
if(import.meta.env.DEV)createRoot(document.getElementById('root')!).render(<Review/> )
