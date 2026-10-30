import collections from '../data/cosmetics.json'
import { getCursorPresentation } from './cursors'
import { getEffectVisual } from './visuals'
import { PROFILE_EFFECTS, PROFILE_BORDERS } from '../types'

type Timbre = { wave:OscillatorType; overtone:number; overtoneGain:number; attack:number; bend:number; motif:readonly number[] }
const materials:Record<string,Timbre>={
 spark:{wave:'sine',overtone:4,overtoneGain:.18,attack:.002,bend:1.08,motif:[0,7,12]},
 ripple:{wave:'sine',overtone:2,overtoneGain:.16,attack:.009,bend:1.45,motif:[12,7,0]},
 petal:{wave:'triangle',overtone:3,overtoneGain:.09,attack:.018,bend:.99,motif:[0,4,9]},
 frost:{wave:'sine',overtone:6,overtoneGain:.13,attack:.002,bend:1.01,motif:[12,4,7]},
 heart:{wave:'sine',overtone:2,overtoneGain:.12,attack:.012,bend:.96,motif:[0,7,4]},
 glyph:{wave:'triangle',overtone:2,overtoneGain:.22,attack:.01,bend:.9,motif:[7,0,12]},
 streak:{wave:'triangle',overtone:4,overtoneGain:.08,attack:.001,bend:1.65,motif:[12,7,0]},
 mist:{wave:'sine',overtone:.5,overtoneGain:.2,attack:.035,bend:.85,motif:[7,4,0]},
 flame:{wave:'triangle',overtone:3,overtoneGain:.22,attack:.004,bend:.7,motif:[0,7,12]},
 electric:{wave:'triangle',overtone:8,overtoneGain:.09,attack:.001,bend:1.8,motif:[12,0,7]},
 digital:{wave:'triangle',overtone:4,overtoneGain:.25,attack:.001,bend:1,motif:[0,12,7]},
 plasma:{wave:'sine',overtone:2,overtoneGain:.28,attack:.012,bend:.6,motif:[0,9,7]},
 crystal:{wave:'sine',overtone:5,overtoneGain:.15,attack:.001,bend:1.005,motif:[0,12,7]},
 cosmic:{wave:'sine',overtone:3,overtoneGain:.18,attack:.02,bend:1.2,motif:[0,7,9]},
 void:{wave:'sine',overtone:.5,overtoneGain:.3,attack:.025,bend:1.4,motif:[7,4,0]},
 confetti:{wave:'triangle',overtone:2,overtoneGain:.13,attack:.003,bend:1.12,motif:[0,9,12]},
 halo:{wave:'sine',overtone:2,overtoneGain:.2,attack:.025,bend:1,motif:[0,4,7]},
}
const collectionFamilies=new Map(collections.map(c=>[c.id,c.family]))
const animationFamilies:Record<string,string>={fire:'flame',firestorm:'flame',phoenix:'flame',dragon:'flame',ice:'frost',shatter:'crystal',lightning:'electric',thunder:'electric',matrix:'digital',glitch:'digital',pixel:'digital',void:'void',rift:'void',shadow:'void',halo:'halo',divine:'halo',aurora:'cosmic',galaxy:'cosmic',quantum:'plasma',plasma:'plasma'}
/** Material sound direction is authored; pitch/register is coordinated by the equipped pair. */
export function getCosmeticTimbre(section:'typing'|'profile',layer:number,id:string):Timbre {
 const original=section==='typing'
  ? layer===0?getCursorPresentation(id).family:getEffectVisual(id).family
  : animationFamilies[(layer===0?PROFILE_EFFECTS[id]?.animation:PROFILE_BORDERS[id]?.animation)??''] ?? (layer===0?'cosmic':'crystal')
 return materials[collectionFamilies.get(id) ?? original] ?? materials.spark
}
