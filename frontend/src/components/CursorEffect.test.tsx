import { act, render } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import CursorEffect from './CursorEffect'

const { tails, stamp }=vi.hoisted(()=>({tails:vi.fn(),stamp:vi.fn()}))
vi.mock('../effects/trailRenderer',()=>({drawAuthoredTail:(_ctx:unknown,points:{x:number;y:number}[],_time:number,_visual:unknown,id:string)=>tails(id,points.map(p=>({...p}))),drawTrailStamp:stamp}))
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();tails.mockReset();stamp.mockReset()})

it('tracks both actual caret positions, preserves a five-character wake, and clears on line wraps',()=>{
 let time=100,x=20,y=10,next=0
 const frames=new Map<number,FrameRequestCallback>()
 vi.stubGlobal('requestAnimationFrame',(callback:FrameRequestCallback)=>{frames.set(++next,callback);return next})
 vi.stubGlobal('cancelAnimationFrame',(id:number)=>frames.delete(id))
 vi.stubGlobal('matchMedia',()=>({matches:false}))
 vi.stubGlobal('ResizeObserver',class { observe(){} disconnect(){} })
 vi.spyOn(performance,'now').mockImplementation(()=>time)
 const clearRect=vi.fn()
 vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({clearRect,setTransform:vi.fn(),save:vi.fn(),restore:vi.fn()} as unknown as CanvasRenderingContext2D)
 vi.spyOn(Element.prototype,'getBoundingClientRect').mockImplementation(function(this:Element){
  return (this.hasAttribute('data-caret')?{left:x+(this.getAttribute('data-caret')==='opponent'?20:0),top:y,bottom:y+28,width:3,height:28}:{left:0,top:0,bottom:200,width:660,height:200}) as DOMRect
 })
 function Example({step}:{step:number}){
  const ref=useRef<HTMLDivElement>(null)
  return <div ref={ref}><span data-caret="player"/><span data-caret="opponent"/><CursorEffect effectId="chakra_tempest" targetRef={ref} caret="player" progress={step}/><CursorEffect effectId="sakura_nocturne" targetRef={ref} caret="opponent" progress={step}/></div>
 }
 const flush=()=>{time+=100;const callbacks=[...frames.values()];frames.clear();act(()=>callbacks.forEach(cb=>cb(time)))}
 const view=render(<Example step={0}/>);flush()
 expect(stamp).not.toHaveBeenCalled() // No initial streak from page origin.
 for(let i=1;i<=6;i++){x+=16;view.rerender(<Example step={i}/>);flush()}
 for(const id of ['chakra_tempest','sakura_nocturne']){
  const points=tails.mock.calls.filter(([key])=>key===id).at(-1)![1]
  expect(points.at(-1).x-points[0].x).toBeGreaterThanOrEqual(80)
  expect(points.at(-1).y).toBe(35) // Baseline, beneath the glyph centers.
 }
 y+=40;x=20;view.rerender(<Example step={7}/>);flush()
 expect(tails.mock.calls.at(-1)![1]).toHaveLength(1)
 view.unmount();expect(frames.size).toBe(0);expect(clearRect).toHaveBeenCalled()
})
