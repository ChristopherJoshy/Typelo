import { memo, type CSSProperties } from 'react'
import { PROFILE_BORDERS, PROFILE_EFFECTS } from '../types'
import ProfileEffectFrame from './ProfileEffectFrame'
import AuthoredAvatarBorder from './AuthoredAvatarBorder'

interface AvatarDecorationProps {
 decorationType: string
 size?: number | string
 animate?: boolean
 className?: string
 style?: CSSProperties
}

export const EFFECT_TO_DECORATION = Object.fromEntries(Object.keys(PROFILE_EFFECTS).map(id => [id, id]))
export const BORDER_TO_DECORATION = Object.fromEntries(Object.keys(PROFILE_BORDERS).map(id => [id, `border:${id}`]))
export const DECORATION_TYPES = [...Object.keys(PROFILE_EFFECTS), ...Object.keys(PROFILE_BORDERS)]

export default memo(function AvatarDecoration({ decorationType, size, animate = true, className = '', style }: AvatarDecorationProps) {
 if (decorationType.startsWith('border:')) {
  const border = PROFILE_BORDERS[decorationType.slice(7)]
  return border ? <AuthoredAvatarBorder border={border} size={size} active={animate} className={className} style={style}/> : null
 }
 const effect = PROFILE_EFFECTS[decorationType]
 if (!effect) return null
 const numeric = typeof size === 'number'
 return <span aria-hidden="true" className={`cosmetic-decoration ${className}`}
  style={{width:size ?? '100%',height:size ?? '100%',...(numeric ? {left:'50%',top:'50%',transform:'translate(-50%, -50%)'} : {inset:0}),...style}}>
  <ProfileEffectFrame effect={effect} active={animate}/>
 </span>
})
