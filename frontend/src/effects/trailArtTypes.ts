export type Wake = 'foam' | 'vine' | 'glitter' | 'rings' | 'ribbon' | 'vapor' | 'bolt' | 'circuit' | 'shards' | 'flames' | 'helix' | 'orbit' | 'ink' | 'runes' | 'wings'
export type Drift = 'float' | 'flutter' | 'spin' | 'rise' | 'pulse' | 'shoot'
export interface TrailArt { shape:string; detail:string; wake:Wake; drift:Drift; size:number }
export const trail = (shape:string,detail:string,wake:Wake,drift:Drift,size=7):TrailArt => ({shape,detail,wake,drift,size})
