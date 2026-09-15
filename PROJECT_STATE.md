# adZora — Project State / Handoff

> Read this file before changing the repository. It records the verified implementation boundary.

## Snapshot

- Repository: https://github.com/makremhp/adZora
- Owner: makremhp
- Default branch: main
- Latest functional source commit: 61206f94ba6de40aae37874e53f322f2b04b6f32
- Blueprint: AdZora_Master_Frontend_Blueprint

## Current objective

Build AdZora as a real advertising marketplace similar in category to Adsterra, with structurally separate Publisher and Advertiser workflows. Follow the attached Master Frontend Blueprint as the product contract. The implementation is incremental: complete one phase, verify it, update this file, then continue.

## Completed phases

### Phase 1 — Information architecture and frontend foundation

- React + Vite application foundation with separate Publisher and Advertiser workspaces.
- Role-specific navigation, terminology, balance labels, KPIs, and quick actions.
- Centralized ad-format and pricing configuration.
- Responsive mobile drawer with overlay, close button, active state, Escape handling, and scroll lock.

### Phase 2 — Publisher inventory workflow and palette refresh

- Functional Websites flow with HTTPS validation, category, pending state, and empty state.
- Functional Ad Zones flow linked to a Website, with format, size, Draft status, and activate/pause controls.
- Ad Codes view linked to Website → Ad Zone, with explicit placeholder-state messaging and copy action.
- White background with black text and blue accent only; no gold, green, purple, dark background, or glow treatment.

### Phase 3 — Blob-ready creatives and responsive hardening

- Added Advertiser → Creatives workflow with image/video file selection.
- Browser validation for JPG, PNG, WEBP, GIF, MP4, and WEBM files up to 10 MB.
- Creates a browser Blob and FormData payload boundary, previews the selected creative, and adds it to the session library as Ready.
- Shows an explicit contract note: storage API and production URL are not implemented yet; no fake production serving URL is generated.
- Added drag-and-drop upload state, loading state, validation errors, empty state, preview cards, and remove action.
- Hardened every page against horizontal overflow and layout collisions.
- Fixed the Ad Codes copy screen for narrow widths: wrapped code, bounded pre block, responsive action buttons, and stacked mobile card layout.
- Added responsive creative upload and library layouts for desktop, tablet, 760px mobile, and 420px mobile widths.

## Verification

- Cloned the latest main branch.
- Ran npm install --no-audit --no-fund successfully.
- Ran npm run build successfully with Vite 5.4.21.
- Latest build: 34 modules transformed; production output generated in dist/.
- Source commit: 61206f94ba6de40aae37874e53f322f2b04b6f32.

## Next implementation order

1. Add a real backend endpoint for Blob/FormData upload and replace the session-only creative state with persisted records.
2. Implement Advertiser campaign creation using the creative library and centralized ad-format configuration.
3. Add file dimension validation and format-specific creative fields for Banner, Native, Social, Popup, and Video.
4. Add publisher earnings/withdrawals and advertiser balance/billing as separate financial experiences.
5. Add analytics, reports, loading/error/success states, then perform browser-based responsive QA.

## Handoff rules

- Read this file before coding.
- Never claim a feature is complete without recording the commit SHA and verification result.
- Preserve Publisher/Advertiser separation and the terminology defined in the blueprint.
- Keep business constants centralized; do not duplicate revenue shares, formats, statuses, or pricing rules across screens.
- After every meaningful milestone, append a dated progress entry with files changed, behavior completed, and the exact next step.

## Progress log

### 2026-09-15 — Phase 3 completed

- Added the Blob-ready Advertiser Creatives frontend slice.
- Fixed responsive overlap and overflow risks, with special handling for Ad Codes and copy actions.
- Verified the production build after the changes.
- Current next action: connect the Blob/FormData boundary to a real backend storage endpoint, then start campaign creation.
