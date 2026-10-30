import { TRAIL_ART } from './trailArt'
import type { EffectVisual } from './visuals'
import { visibleCursorInk } from './cursors'
import type { TrailArt } from './trailArtTypes'

export interface TrailPoint { x:number; y:number; at:number }
const stamps = new Map<string,HTMLCanvasElement>()
const puffCache = new Map<string,HTMLCanvasElement>()

export function getTrailPalette(visual:EffectVisual) {
 return [visibleCursorInk(visual.color),visibleCursorInk(visual.palette.find(c=>c!==visual.color && c!=='#ffffff') ?? '#f472b6'),'#fff1d6']
}

function stampFor(id:string,visual:EffectVisual) {
 const key = `${id}:${visual.color}`
 const cached = stamps.get(key)
 if (cached) return cached
 const art = TRAIL_ART[id]
 if (!art) return null
 const canvas = document.createElement('canvas');canvas.width=64;canvas.height=64
 const ctx = canvas.getContext('2d')
 if (!ctx) return null
 const palette = getTrailPalette(visual)
 ctx.scale(2.3,2.3);ctx.translate(2,2)
 const fill = ctx.createLinearGradient(0,0,24,24)
 fill.addColorStop(0,palette[2]);fill.addColorStop(.3,palette[0]);fill.addColorStop(1,palette[1])
 ctx.fillStyle=fill;ctx.strokeStyle=palette[0];ctx.lineWidth=1.1;ctx.lineCap='round';ctx.lineJoin='round'
 const path = new Path2D(art.shape)
 ctx.globalAlpha=.8;ctx.fill(path,'evenodd');ctx.globalAlpha=1;ctx.stroke(path)
 ctx.strokeStyle=palette[2];ctx.lineWidth=.8;ctx.stroke(new Path2D(art.detail))
 // Bounded cache: equipped trails and recently inspected ones only.
 if (stamps.size>=24) stamps.delete(stamps.keys().next().value!)
 stamps.set(key,canvas)
 return canvas
}
function puffFor(color:string) {
 const cached=puffCache.get(color);if(cached)return cached
 const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64
 const ctx=canvas.getContext('2d')!;const gradient=ctx.createRadialGradient(32,32,0,32,32,32)
 gradient.addColorStop(0,color);gradient.addColorStop(.35,`${color}99`);gradient.addColorStop(1,`${color}00`)
 ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64)
 if(puffCache.size>=12)puffCache.delete(puffCache.keys().next().value!)
 puffCache.set(color,canvas);return canvas
}
export function drawTrailStamp(ctx:CanvasRenderingContext2D,id:string,visual:EffectVisual,x:number,y:number,size:number,rotation:number,alpha:number,age=0) {
 const image=stampFor(id,visual);if(!image)return
 const art=TRAIL_ART[id]
 let angle=rotation, sx=1, sy=1
 if(art.drift==='flutter'){sx=.55+Math.abs(Math.cos(age*.008))*.45;angle+=Math.sin(age*.004)*.4}
 if(art.drift==='spin')angle+=age*.0025
 if(art.drift==='pulse'){sx=sy=.85+Math.sin(age*.008)*.15}
 ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,alpha));ctx.translate(x,y);ctx.rotate(angle);ctx.scale(sx,sy)
 ctx.drawImage(image,-size,-size,size*2,size*2);ctx.restore()
}

function displacement(art:TrailArt,t:number,phase:number,lane:number) {
 switch(art.wake){
  case 'bolt':return Math.sin(phase*7+t*40)*Math.cos(phase*4)*4*lane
  case 'circuit':return Math.round(Math.sin(phase+t*12))*5*lane
  case 'helix':return Math.sin(phase+t*16)*7*lane
  case 'orbit':return Math.sin(phase+t*11)*8*lane
  case 'vine':return Math.sin(phase*.3+t*9)*5*lane
  case 'flames':return Math.sin(phase*2+t*25)*(2+t*4)*lane
  case 'ink':return Math.sin(phase*.7+t*14)*(1+t*5)*lane
  case 'wings':return Math.sin(phase+t*9)*7*lane
  case 'shards':return Math.round(Math.sin(phase+t*10)*2)*2*lane
  case 'runes':return Math.sin(phase*.25+t*6)*3*lane
  case 'rings':return Math.sin(phase+t*17)*3*lane
  case 'foam':return Math.sin(phase*.8+t*9)*6*lane
  case 'vapor':return Math.sin(phase*.35+t*7)*(2+t*7)*lane
  case 'glitter':return Math.sin(phase+t*14)*2*lane
  default:return Math.sin(phase*.7+t*10)*4*lane
 }
}

/** Shared renderer for player, opponent, pointer and interactive inventory test. */
export function drawAuthoredTail(ctx:CanvasRenderingContext2D,points:TrailPoint[],time:number,visual:EffectVisual,id:string,lifetime:number) {
 const art=TRAIL_ART[id];if(!art||points.length<2)return
 const newest=points[points.length-1], oldest=points[0]
 const fade=Math.max(0,1-(time-newest.at)/lifetime)
 const palette=getTrailPalette(visual)
 const phase=time*.003
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round'
 // Cached smoke material expands and curls behind the head, leaving text legible.
 for(let i=0;i<points.length-1;i+=2){
  const p=points[i],t=1-i/(points.length-1),age=time-p.at
  const radius=(5+t*10)*(art.wake==='ink'?1.25:1)
  const drift=Math.sin(phase*.5+i*.7)*t*4
  ctx.globalAlpha=fade*(.09+t*.06)*Math.max(0,1-age/lifetime)
  ctx.drawImage(puffFor(i%4?palette[0]:palette[1]),p.x-radius,p.y-radius-drift,radius*2,radius*2)
 }
 // Three complementary strands have material-specific movement and width.
 const gradient=ctx.createLinearGradient(oldest.x,oldest.y,newest.x+.01,newest.y)
 gradient.addColorStop(0,`${palette[1]}00`);gradient.addColorStop(.25,`${palette[1]}88`);gradient.addColorStop(.7,palette[0]);gradient.addColorStop(1,palette[2])
 for(const lane of [-1,0,1]){
  ctx.beginPath()
  points.forEach((p,i)=>{
   const before=points[Math.max(0,i-1)],after=points[Math.min(points.length-1,i+1)]
   const dx=after.x-before.x,dy=after.y-before.y,length=Math.max(1,Math.hypot(dx,dy))
   const t=1-i/(points.length-1),offset=displacement(art,t,phase,lane)*(t*.8+.2)
   const x=p.x-dy/length*offset,y=p.y+dx/length*offset
   if(i===0)ctx.moveTo(x,y)
   else if(art.wake==='circuit'){ctx.lineTo(x,points[i-1].y);ctx.lineTo(x,y)}
   else ctx.lineTo(x,y)
  })
  ctx.globalAlpha=fade*(lane===0?.8:.46)
  ctx.strokeStyle=lane===0?gradient:palette[lane<0?0:1]
  ctx.lineWidth=lane===0?(art.wake==='ink'?4.5:art.wake==='vapor'?3:1.8):.8
  ctx.setLineDash(art.wake==='runes'?[2,6]:art.wake==='glitter'?[1,5]:art.wake==='shards'?[7,4]:[])
  ctx.stroke()
 }
 ctx.setLineDash([])
 // Stamp spacing follows actual distance, rather than pointer event frequency.
 let walked=0,lastStamp=0
 for(let i=1;i<points.length;i++){
  const p=points[i],prev=points[i-1]
  walked+=Math.hypot(p.x-prev.x,p.y-prev.y)
  if(walked-lastStamp<18)continue
  lastStamp=walked
  const t=1-i/(points.length-1),age=time-p.at
  const wave=displacement(art,t,phase,1)
  const angle=art.drift==='shoot'?Math.atan2(p.y-prev.y,p.x-prev.x):Math.sin(i)*.35
  drawTrailStamp(ctx,id,visual,p.x,p.y+wave,art.size*(.5+t*.35),angle,fade*(.55+t*.3),age)
 }
 ctx.restore()
}
