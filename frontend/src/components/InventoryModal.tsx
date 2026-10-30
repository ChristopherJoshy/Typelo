import { useState, useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useInventoryStore } from '../stores/inventoryStore'
import { shallow } from 'zustand/shallow'
import { useAuthStore } from '../stores/authStore'
import { CURSORS, EFFECTS, PROFILE_BACKGROUNDS, PROFILE_EFFECTS, PROFILE_BORDERS, getRarityColor } from '../types'
import CosmeticPreview, { type CosmeticKind, type CosmeticItem } from './CosmeticPreview'
import ProfileEffectFrame from './ProfileEffectFrame'
import AvatarDecoration from './AvatarDecoration'
import CursorEffect from './CursorEffect'
import CursorCosmeticPreview from './CursorCosmeticPreview'
import { getCursorPresentation } from '../effects/cursors'
import AvatarSilhouette from './AvatarSilhouette'

const categories: { id: CosmeticKind; label: string; items: Record<string, CosmeticItem> }[] = [
  { id: 'cursor', label: 'Cursors', items: CURSORS },
  { id: 'effect', label: 'Typing trails', items: EFFECTS },
  { id: 'profile_effect', label: 'Profile effects', items: PROFILE_EFFECTS },
  { id: 'border', label: 'Avatar borders', items: PROFILE_BORDERS },
  { id: 'background', label: 'Backgrounds', items: PROFILE_BACKGROUNDS },
]
const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'ultra', 'divine', 'mythical']

function cosmeticAccent(item: CosmeticItem): string {
  if ('colors' in item && item.colors?.length) return item.colors[0]
  if ('color' in item && item.color) return item.color
  if ('glow' in item && item.glow) return item.glow
  return getRarityColor(item.rarity)
}

export default function InventoryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Mount the collection only while open; background wallet updates don't rebuild a closed grid.
  return isOpen ? createPortal(<InventoryContent onClose={onClose} />, document.body) : null
}

function InventoryContent({ onClose }: { onClose: () => void }) {
  const token = useAuthStore(s => s.idToken)
  const user = useAuthStore(s => s.user)
  const inventory = useInventoryStore(state => ({
    coins: state.coins,
    unlockedCursors: state.unlockedCursors,
    equippedCursor: state.equippedCursor,
    unlockedEffects: state.unlockedEffects,
    equippedEffect: state.equippedEffect,
    unlockedBackgrounds: state.unlockedBackgrounds,
    equippedBackground: state.equippedBackground,
    unlockedProfileEffects: state.unlockedProfileEffects,
    equippedProfileEffect: state.equippedProfileEffect,
    unlockedBorders: state.unlockedBorders,
    equippedBorder: state.equippedBorder,
    fetchInventory: state.fetchInventory,
    fetchProfileInventory: state.fetchProfileInventory,
    equipCursor: state.equipCursor,
    equipEffect: state.equipEffect,
    equipBackground: state.equipBackground,
    equipProfileEffect: state.equipProfileEffect,
    equipBorder: state.equipBorder,
  }), shallow)
  const [category, setCategory] = useState<CosmeticKind>('cursor')
  const [query, setQuery] = useState('')
  const [ownership, setOwnership] = useState('all')
  const [rarity, setRarity] = useState('all')
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(500)
  const [columns, setColumns] = useState(() => window.innerWidth <= 1000 ? 3 : 4)
  const [compact, setCompact] = useState(() => window.innerWidth <= 700)
  const [selectedId, setSelectedId] = useState<string | null>(inventory.equippedCursor)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [sample, setSample] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)
  const sampleRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const definition = categories.find(c => c.id === category)!
  const ownedIds = category === 'cursor' ? inventory.unlockedCursors : category === 'effect' ? inventory.unlockedEffects
    : category === 'profile_effect' ? inventory.unlockedProfileEffects : category === 'border' ? inventory.unlockedBorders : inventory.unlockedBackgrounds
  const equipped = category === 'cursor' ? inventory.equippedCursor : category === 'effect' ? inventory.equippedEffect
    : category === 'profile_effect' ? inventory.equippedProfileEffect : category === 'border' ? inventory.equippedBorder : inventory.equippedBackground
  const owned = useMemo(() => new Set(ownedIds), [ownedIds])
  const selected = selectedId ? definition.items[selectedId] ?? null : null
  const canEquip = !selectedId || owned.has(selectedId) || selectedId === 'default'
  const items = useMemo(() => Object.values(definition.items).filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase()) && (rarity === 'all' || item.rarity === rarity) &&
    (ownership === 'all' || (ownership === 'owned' ? owned.has(item.id) || item.id === 'default' : !owned.has(item.id) && item.id !== 'default'))
  ).sort((a, b) => Number(b.id === equipped) - Number(a.id === equipped) || Number(owned.has(b.id)) - Number(owned.has(a.id)) ||
    rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity) || a.name.localeCompare(b.name)), [definition, query, rarity, ownership, owned, equipped])
  const showNone = category !== 'cursor' && !query && rarity === 'all' && ownership !== 'locked'
  const gridItems = useMemo(() => showNone ? [null, ...items] : items, [items, showNone])
  const rowSize = compact ? 157 : 178
  const totalRows = Math.ceil(gridItems.length / columns)
  const firstRow = Math.max(0, Math.floor(scrollTop / rowSize) - 2)
  const lastRow = Math.min(totalRows, Math.ceil((scrollTop + viewportHeight) / rowSize) + 2)
  const firstIndex = firstRow * columns
  const lastIndex = Math.min(gridItems.length, lastRow * columns)
  const visibleItems = gridItems.slice(firstIndex, lastIndex)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    Promise.all([inventory.fetchInventory(token), inventory.fetchProfileInventory(token)]).catch(() => {
      if (!cancelled) setError('Could not refresh your collection. Please reopen inventory to retry.')
    })
    return () => { cancelled = true }
  }, [token, inventory.fetchInventory, inventory.fetchProfileInventory])

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    modalRef.current?.focus()
    return () => { document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  useEffect(() => {
    const scroll = scrollRef.current
    const syncSize = () => {
      const width = window.innerWidth
      setColumns(width <= 1000 ? 3 : 4)
      setCompact(width <= 700)
      setViewportHeight(scroll?.clientHeight ?? 500)
    }
    syncSize()
    const observer = scroll ? new ResizeObserver(syncSize) : null
    if (scroll) observer?.observe(scroll)
    window.addEventListener('resize', syncSize, { passive: true })
    return () => { observer?.disconnect(); window.removeEventListener('resize', syncSize) }
  }, [])
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); setScrollTop(0) }, [category, query, ownership, rarity])

  const changeCategory = (next: CosmeticKind) => {
    setCategory(next); setSelectedId(next === 'cursor' ? inventory.equippedCursor : next === 'effect' ? inventory.equippedEffect : next === 'profile_effect' ? inventory.equippedProfileEffect : next === 'border' ? inventory.equippedBorder : inventory.equippedBackground); setQuery(''); setRarity('all'); setError(''); setSample('')
  }
  const equip = async () => {
    if (!token || !canEquip || pending) return
    setPending(true); setError('')
    const actions = { cursor: inventory.equipCursor, effect: inventory.equipEffect, profile_effect: inventory.equipProfileEffect, border: inventory.equipBorder, background: inventory.equipBackground }
    try {
      const success = await actions[category](selectedId ?? (category === 'cursor' ? 'default' : 'none'), token)
      if (!success) setError('Could not equip this item. Please try again.')
    } catch { setError('Could not equip this item. Please try again.') }
    finally { setPending(false) }
  }
  const previewEffect = category === 'profile_effect' ? selectedId : inventory.equippedProfileEffect
  const previewBorder = category === 'border' ? selectedId : inventory.equippedBorder
  const previewBg = category === 'background' ? selectedId : inventory.equippedBackground
  const cursorId = category === 'cursor' ? selectedId ?? 'default' : inventory.equippedCursor
  const trailId = category === 'effect' ? selectedId : inventory.equippedEffect

  return <div className="inventory-backdrop" onClick={onClose}>
    <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="inventory-title" tabIndex={-1} className="inventory-dialog" onClick={e => e.stopPropagation()}
      onKeyDown={e => {
        if (e.key === 'Escape') onClose()
        if (e.key !== 'Tab') return
        const elements = modalRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input,select,[tabindex="0"]')
        if (!elements?.length) return
        const first = elements[0], last = elements[elements.length - 1]
        if (e.shiftKey && (document.activeElement === first || document.activeElement === modalRef.current)) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && (document.activeElement === last || document.activeElement === modalRef.current)) { e.preventDefault(); first.focus() }
      }}>
      <header className="inventory-header"><div><h2 id="inventory-title">Your collection<span>.</span></h2></div>
        <div className="flex items-center gap-4"><span className="inventory-wallet">{inventory.coins.toLocaleString()} <span>coins</span></span><button className="inventory-close" aria-label="Close inventory" onClick={onClose}>×</button></div>
      </header>
      <nav className="inventory-tabs" aria-label="Cosmetic categories">{categories.map(c => <button key={c.id} aria-pressed={category === c.id} onClick={() => changeCategory(c.id)}>{c.label}<span>{Object.keys(c.items).length}</span></button>)}</nav>
      <div className="inventory-body"><section className="inventory-collection" aria-label={definition.label}>
        <div className="inventory-tools"><input aria-label="Search cosmetics" placeholder="Find your next favorite…" value={query} onChange={e => setQuery(e.target.value)} />
          <select aria-label="Ownership" value={ownership} onChange={e => setOwnership(e.target.value)}><option value="all">All items</option><option value="owned">Owned</option><option value="locked">Unowned</option></select>
          <select aria-label="Rarity" value={rarity} onChange={e => setRarity(e.target.value)}><option value="all">All rarities</option>{rarityOrder.map(r => <option key={r} value={r}>{r}</option>)}</select>
        </div>
        <div ref={scrollRef} className="inventory-scroll" onScroll={event => {
          const nextTop = event.currentTarget.scrollTop
          const nextRow = Math.floor(nextTop / rowSize)
          setScrollTop(current => Math.floor(current / rowSize) === nextRow ? current : nextTop)
        }}><div className="inventory-grid">
          {firstRow > 0 && <div className="inventory-virtual-spacer" aria-hidden="true" style={{ height: firstRow * rowSize - (compact ? 7 : 10) }} />}
          {visibleItems.map(item => item === null
            ? <button key="none" className={`inventory-item ${!selectedId ? 'is-selected' : ''}`} aria-pressed={!selectedId} onClick={() => { setSelectedId(null); setError('') }}><div className="inventory-art"><CosmeticPreview kind={category} item={null} /></div><div className="inventory-item-label"><strong>None</strong></div></button>
            : <button key={item.id} className={`inventory-item ${selectedId === item.id ? 'is-selected' : ''}`} style={{ '--item-accent': cosmeticAccent(item) } as CSSProperties} aria-pressed={selectedId === item.id} aria-label={`${item.name}, ${item.rarity}, ${owned.has(item.id) || item.id === 'default' ? 'owned' : 'unowned'}${equipped === item.id ? ', equipped' : ''}`} onClick={() => { setSelectedId(item.id); setError(''); setSample('') }}>
              <div className="inventory-art"><CosmeticPreview kind={category} item={item} active={selectedId === item.id} />{equipped === item.id ? <span className="inventory-item-status" title="Equipped">✓</span> : !owned.has(item.id) && item.id !== 'default' ? <span className="inventory-item-status is-locked" aria-hidden="true">◇</span> : null}</div>
              <div className="inventory-item-label"><strong title={item.name}>{item.name}</strong><span style={{ color: getRarityColor(item.rarity) }}>{item.rarity}</span></div>
            </button>)}
          {lastRow < totalRows && <div className="inventory-virtual-spacer" aria-hidden="true" style={{ height: (totalRows - lastRow) * rowSize - (compact ? 7 : 10) }} />}
        </div>{gridItems.length === 0 && <p className="inventory-empty">No cosmetics found. Try a different filter.</p>}</div>
      </section>
      <aside className="inventory-inspector">
        <div className="inventory-live-profile" style={{ backgroundImage: previewBg && PROFILE_BACKGROUNDS[previewBg] ? `linear-gradient(180deg,#09090b22,#09090bf0),url(${PROFILE_BACKGROUNDS[previewBg].path})` : undefined }}>
          {previewEffect && PROFILE_EFFECTS[previewEffect] && <ProfileEffectFrame effect={PROFILE_EFFECTS[previewEffect]} />}
          <div className="inventory-live-avatar">{user?.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : <AvatarSilhouette className="inventory-avatar-placeholder" />}{previewBorder && <AvatarDecoration decorationType={`border:${previewBorder}`} size={100} />}</div>
          <strong>{user?.displayName ?? 'Your profile'}</strong>
        </div>
        {(category === 'cursor' || category === 'effect') && <div className="inventory-typing-demo">
          <div ref={sampleRef} className="inventory-demo-line" aria-hidden="true" style={{ '--cursor-accent': getCursorPresentation(cursorId).accent } as CSSProperties}>
            <span className="inventory-demo-text">{sample}</span>
            <CursorCosmeticPreview id={cursorId} active={category === 'cursor' || sample.length > 0} caretName="player" live />
          </div>
          <CursorEffect effectId={trailId} targetRef={sampleRef} caret="player" progress={sample} />
          <input aria-label="Type to preview the selected cursor and trail" maxLength={22} placeholder="Type here…" value={sample} onChange={e => setSample(e.target.value)} />
        </div>}
        {selected && <div className="inventory-selection"><h3>{selected.name}</h3></div>}
        <div className="mt-auto">{error && <p role="alert" className="mb-3 text-xs text-red-300">{error}</p>}<button className="inventory-equip" disabled={pending || !canEquip || (selectedId === equipped) || (!selectedId && !equipped)} onClick={equip}>{pending ? 'Equipping…' : !canEquip ? 'Discover in the shop' : selectedId === equipped || (!selectedId && !equipped) ? 'Equipped' : selectedId ? 'Equip cosmetic' : 'Use default'}</button></div>
      </aside></div>
    </div>
  </div>
}
