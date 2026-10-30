# Cosmetic rework — active, incomplete

## Required result
Rework every cursor, typing trail, profile effect, and avatar border. Every item must have a visibly distinct design and motion identity; color swaps, a different tiny motif on the same ring, and seed-generated variations do not prove uniqueness. Keep existing ownership IDs valid. Preserve inventory virtualization, preview containment, gameplay readability, mouse-trail preference, and background display preferences.

Highest rarity cosmetics (ultra, divine, mythical) need coordinated audio. Cursor and trail layers play for both participants using existing replicated typing progress. Profile and avatar layers play for whoever opens the profile. Optimize animation and audio; verify both participants and slow-network recovery.

## Current evidence
- Existing catalog totals: 139 cursors, 146 trails, 150 profile effects, 150 avatar borders.
- Cursor bodies now have 139 explicit authored compositions. Trails, profile scenes and avatar borders still use shared families and repeated frame treatments. The complete visual objective is NOT met.
- New working-tree audio foundation: shared gesture-unlocked Web Audio context, complementary registers, bounded voices/cooldowns, viewer-side profile opening cues, replicated opponent-progress cues, and persisted cosmetic mute.
- Audio foundation still needs listening/browser verification and richer individual sound direction; tonal recipes alone are not the final premium sound design.
- No final art audit or two-player browser verification has been completed for this rework. Do not mark the goal complete based on builds or catalog counts.

## Research references and design interpretation
- Naruto official Rasengan material: https://naruto-official.com/en/special/rasengan — rotational energy and wind-up/impact rhythm as inspiration.
- Sony Imageworks Spider-Verse: https://www.imageworks.com/our-craft/feature-animation/movies/spider-man-spider-verse — use different graphic construction, printing texture, and motion language, rather than a shared glow preset.
- Netflix Arcane atmosphere art: https://www.netflix.com/tudum/galleries/arcane-season-2-making-of-atmosphere — painterly atmosphere and directed lighting.
- Disney animation: https://disneyanimation.com/process/animation/ — anticipation, staging, follow-through and secondary action.
- MDN Web Audio: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices — gesture unlock, volume control and reusable audio infrastructure.

These are original-design inspirations; no character art, logos, voices, soundtrack samples, or external media were copied.

## Remaining work
1. Create a per-item design inventory covering the FULL catalog, with deliberate silhouette, composition, temporal sequence, texture and premium audio identity.
2. Replace the shared generic renderers with authored artwork/compositions for every item. Start by making representative items radically different, then cover the complete catalog; do not rename families and call that complete.
3. Carry the same art into inventory, typing previews, local/opponent carets and trails, leaderboard cards and all profile screens.
4. Review sounds by ear, improve premium sound timbres, verify paired layers and spectator/viewer playback, and enforce voice/mute/visibility limits.
5. Browser review full catalog, profile surfaces and both match participants. Measure inventory and gameplay performance with effects active.
6. Build and relevant regression checks; only then deploy, check production assets and VPS health, and audit every original requirement.

## Authored cursor pass — 18 / 139
`CursorArtwork.tsx` now authors separate compositions and motion for: default, ocean, forest, crimson, mint, sky, steel, coral, sunset, lavender, peach, sapphire, chakra_tempest, nine_tail_ember, grand_line_compass, death_note_inkfall, anti_magic_cross, conqueror_haki.
The shared component is mounted inside inventory/live-preview carets and all four local/opponent character/end-word match caret sites. Older face adornments are suppressed for these IDs to avoid duplicate decorations. The old color-gradient utility remains available for typed text.

Browser-reviewed gallery: `/review/cursors.html` on local Vite, isolated agent-browser session `typelo-art-review`. Full screenshot `/tmp/typelo-cursors-authored-full.png`. Shapes remain inside the review tiles. This is preview evidence only, not evidence of match readability or two-player behavior. The review page renders only in Vite development mode and is not a production entry point.

Remaining cursor coverage: 121. No full rework claim for trails, profile effects or avatar borders. Continue with those and complete per-item audit before deployment.
Local Vite session handle when last started: 79868, http://127.0.0.1:5173/. Revalidate the handle/process before reuse.

## Original cursor batch — coverage now 45 / 139
All 39 original cursor IDs now have explicit artwork. `OriginalCursorArt.tsx` adds the remaining 27 compositions; six themed collection cursors were already authored, making 45 total. Browser full-page review `/tmp/typelo-cursors-45.png` confirms distinct silhouettes and tile containment for the batch. Highest tiers now include separate phoenix, probability-cat, void-eye, comet, nebula, celestial-wing, and multicolor origami compositions. This remains a first art pass and needs match-scale review.

The regression test in `CursorArtwork.test.tsx` verifies coverage for the original ownership IDs, preview mounting, and absence of identical geometry in the authored batch. It detects literal duplicates; it does NOT prove full visual uniqueness or final quality for the complete catalog.

Remaining cursor coverage: 94 collection cursors. All trail/profile/avatar redesign and final audio review requirements remain active. No production deployment for this unfinished rework.


## Full cursor authored coverage — 139 / 139
This supersedes the earlier cursor coverage counts. CollectionCursorArt adds 50 individual compositions; ThemedCursorArt adds the final 44, alongside the original 45. Every existing cursor ID now renders an explicit authored body in previews and both match caret locations. The full coverage/geometry test passes for all 139; all seven current frontend tests pass. Production build passed after the full art addition. A subsequent brightness correction lifts dark main/accent inks for visibility without changing geometry.

Browser screenshots reviewed: /tmp/typelo-cursors-45.png, /tmp/typelo-cursors-collection.png, /tmp/typelo-cursors-themed.png. The gallery has 48-item review batches via ?batch=0,1,2. Preview geometry is visually distinct, with some themed relatives; live two-player match readability and performance remain unverified. The gallery labels can overflow long names; production inventory uses its existing truncation.

NEXT: replace repeated profile-frame and avatar-ring renderers with authored per-item scenes/borders, then trails. Premium audio still needs individual timbre work and listening/actual multiplayer verification. Keep goal active. No release until all categories and final checks are complete.

## Original profile scenes — 50 / 150
ProfileSceneArt.tsx authors each of the 50 original profile effects as a full-panel environment. AuthoredProfileScene bypasses the former shared border/orbit/sigil treatment for those IDs. Per-scene motion uses CSS transforms, opacity or dash offsets; no per-frame React state, raster downloads or blur filters. Static inventory thumbnails honor active=false and reduced-motion disables scene animation.
Browser screenshots /tmp/typelo-profiles-original-1.png and /tmp/typelo-profiles-original-2.png were reviewed at card size: distinct silhouettes, quiet reading centers, contained artwork. First-pass art remains sparse in places; premium polish and tall-profile scale testing are NOT complete. preserveAspectRatio=none may stretch representational objects in tall panels; resolve responsive composition before release. ProfileSceneArt.test.tsx proves original-ID coverage and literal geometry uniqueness only.
Remaining profile coverage: 100 collection effects. Avatar borders and typing trails still await their authored pass. Goal remains active; no deployment.

## Collection profile scenes — 100 / 150
CollectionProfileScenes.tsx adds explicit full-panel compositions for the first 50 collection IDs. PROFILE_SCENE_ART now contains 100 entries, all passing the literal-geometry uniqueness test. The final 50 anime/Murim profile scenes are still pending.
AuthoredProfileScene now uses one shared ResizeObserver (useSceneLayout) across active scenes only. Tall illustrated profiles render proportional top/bottom viewBoxes with explicit per-instance SVG clip paths. Abstract field effects may stretch. Browser check /tmp/typelo-profile-tall-fixed.png confirms proportional moonstone art at opposite corners without duplicate halves. The resize regression verifies split layout, clipping, and observer cleanup. Build and all nine frontend tests pass.
The original tall screenshot exposed duplicated opposite-half geometry because viewBox itself does not clip letterboxed content; explicit clip paths fixed it. Card-size visual review of ALL 50 newly added collection scenes is still pending, as is full live profile-route verification.
The local Vite module graph briefly cached an empty module during an in-place source rewrite. Restarted only the task server after confirming that failure. Current server session handle 94333, same localhost:5173 URL. Prefer atomic source rewrites in subsequent large batches to avoid intermediate empty-module HMR.
Remaining: 50 profile scenes, all 150 avatar borders, all 146 typing trails, premium sound direction/listening, real two-player/readability/performance checks and deployment. Goal remains active.

## Full profile scene authored coverage — 150 / 150
ThemedProfileScenes adds the final 50 anime/Murim environments. ProfileEffectFrame now routes only to authored scenes; the generic border/orbit/sigil renderer was removed. PROFILE_SCENE_ART coverage test now spans ALL profile ownership IDs. All 139 cursors also received layered color fills and multi-color stroke materials; original cursor secondary colors were chosen explicitly. scenePalette gives original profile scenes themed accent colors and uses collection accents for the rest. User explicitly reiterated: EVERY cosmetic must be colorful and animation rich. This is now a release requirement, including later borders/trails.
Browser /review/profiles.html?all=1: queried actual Web Animations for all 150 scenes, 166 running animations, no scene without motion. Clicking Toggle motion yielded 150 scenes and zero animations, proving inactive previews stay idle. These are rendering evidence, not comprehensive performance measurements or real-route verification.
Browser screenshot /tmp/typelo-profiles-colorful-anime.png reviewed 25 anime scenes with quiet reading centers and stronger palettes. Other collection card batches still need full visual audit; all final scenes need actual-profile and leaderboard verification. Live two-player match readability and audio listening still pending.
Build and all nine tests pass after the scene/cursor color changes. Original monotone first-pass screenshots are historical, not the final palettes. Profile scene source uses atomic writes to avoid Vite empty-module caching.
Remaining major implementation: all 150 avatar borders, all 146 trails; premium sound timbre/listening; final category-wide quality/readability/performance checks; deployment. Keep goal active.
