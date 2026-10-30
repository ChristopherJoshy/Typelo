import { useId } from 'react'
import { getEffectVisual } from '../effects/visuals'
import { getTrailPalette } from '../effects/trailRenderer'
import { TRAIL_ART, type Wake } from '../effects/trailArt'

const wakes:Record<Wake,string> = {
 foam:'M6 65Q20 35 38 50T75 32 116 15',vine:'M6 65Q27 68 42 45T80 30 116 15',glitter:'M6 65 27 57 42 47 65 36 89 25 116 15',rings:'M6 65Q30 35 50 47T90 22 116 15',ribbon:'M6 65C40 65 50 25 116 15',vapor:'M6 65Q24 24 46 48T88 25 116 15',bolt:'M6 65 28 54 25 45 50 47 46 35 70 37 68 25 91 27 116 15',circuit:'M6 65H27V53H48V41H69V29H90V17H116',shards:'M6 65 29 53 36 58 56 35 66 42 87 21 96 26 116 15',flames:'M6 65Q24 39 37 50T64 35 86 29 116 15',helix:'M6 65Q30 70 50 40T90 25 116 15',orbit:'M6 65C-5 15 80 75 75 30S100 4 116 15',ink:'M6 65Q30 40 47 49T84 27 116 15',runes:'M6 65 30 59 40 45 64 39 74 27 100 23 116 15',wings:'M6 65Q15 35 42 44T82 28 116 15',
}
export default function EffectPreview({effectId,color,active=false}:{effectId:string;color:string;active?:boolean}) {
 const uid=useId().replace(/:/g,'')
 const visual=getEffectVisual(effectId,color),palette=getTrailPalette(visual),art=TRAIL_ART[effectId]
 if(!art)return null
 return <div className="authored-trail-preview" data-trail-art={effectId} data-active={active} data-wake={art.wake} aria-hidden="true">
  <svg viewBox="0 0 128 80" fill="none" strokeLinecap="round" strokeLinejoin="round">
   <defs><linearGradient id={`trail-${uid}`} x1="6" y1="65" x2="116" y2="15" gradientUnits="userSpaceOnUse"><stop stopColor={palette[1]} stopOpacity="0"/><stop offset=".5" stopColor={palette[0]}/><stop offset="1" stopColor={palette[2]}/></linearGradient>
    <linearGradient id={`stamp-${uid}`} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor={palette[2]}/><stop offset=".35" stopColor={palette[0]}/><stop offset="1" stopColor={palette[1]}/></linearGradient></defs>
   <g className={`trail-wake-${art.wake}`}><path d={wakes[art.wake]} stroke={`url(#trail-${uid})`} strokeWidth="10" opacity=".14"/><path d={wakes[art.wake]} stroke={`url(#trail-${uid})`} strokeWidth={art.wake==='ink'?4:2}/><path d={wakes[art.wake]} transform="translate(0 4)" stroke={palette[1]} strokeWidth=".7" opacity=".5"/></g>
   {[[20,48,.4],[49,31,.58],[83,12,.8]].map(([x,y,scale],i)=><g key={i} transform={`translate(${x} ${y}) scale(${scale})`}><g className={`trail-mark-${art.drift}`} style={{animationDelay:`${i*-.6}s`}}><path d={art.shape} fill={`url(#stamp-${uid})`} fillOpacity=".75" fillRule="evenodd" stroke={palette[0]} strokeWidth="1.1"/><path d={art.detail} stroke={palette[2]} strokeWidth=".8"/></g></g>)}
   <path d="M114 8v14" stroke={palette[2]} strokeWidth="3"/>
  </svg>
 </div>
}
