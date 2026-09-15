# adZora — Project State / Handoff

> Read this file before changing the repository. It records the verified implementation boundary.

## Snapshot

- Repository: https://github.com/makremhp/adZora
- Owner: makremhp
- Default branch: main
- Latest functional source commit: cac15e5105f85106f35698895a52c59853f6fe0c
- Blueprint: AdZora_Master_Frontend_Blueprint

## Current objective

Build AdZora as a real advertising marketplace similar in category to Adsterra, with structurally separate Publisher and Advertiser workflows. Follow the attached Master Frontend Blueprint as the product contract. The implementation is incremental: complete one phase, verify it, update this file, then continue.

## Completed phases

### Phase 1 — Information architecture and frontend foundation

- React + Vite application foundation.
- Separate Publisher and Advertiser workspace switcher.
- Role-specific navigation, terminology, balance label, KPIs, and quick actions.
- Centralized ad-format and pricing configuration.
- Responsive mobile drawer with overlay, close button, active state, Escape handling, and scroll lock.
- Deliberate empty and Coming Soon states; no dead navigation links.

### Phase 2 — Publisher inventory workflow and palette refresh

- Added functional Publisher Websites flow with name, HTTPS URL, category, validation, pending status, and empty state.
- Added functional Ad Zones flow linked to a Website, with format, size, Draft status, activation/pause controls, and empty state.
- Added Ad Codes view linked to Website → Ad Zone, with explicit placeholder-state messaging and copy action. It is not production serving code yet.
- Added responsive form layouts and data rows for desktop and mobile.
- Changed the visual palette to white background with black text and blue accent only; removed gold, green, purple, dark background, and glow treatment from the UI.
- Kept the implementation frontend-only with in-memory demo state so the real API/storage contract can be added without redesigning the workflow.

## Verification

- Cloned the latest main branch.
- Ran npm install --no-audit --no-fund successfully.
- Ran npm run build successfully with Vite 5.4.21.
- Latest build: 33 modules transformed; production output generated in dist/.
- The first Phase 2 commit was 2952289e12968e3873000873fd9e1adabe8bc06f; the placeholder rendering fix is cac15e5105f85106f35698895a52c59853f6fe0c.

## Next implementation order

1. Persist Publisher inventory state through a backend/data layer instead of in-memory state.
2. Define and implement the blob upload contract for advertiser creatives; record whether the blob target is app storage, object storage, or GitHub Git Blobs. Do not infer this silently.
3. Implement Advertiser campaigns and the multi-step create-campaign flow using centralized ad-format configuration.
4. Add publisher earnings/withdrawals and advertiser balance/billing as separate financial experiences.
5. Add analytics, reports, loading/error/success states, then perform responsive QA.

## Handoff rules

- Read this file before coding.
- Never claim a feature is complete without recording the commit SHA and verification result.
- Preserve Publisher/Advertiser separation and the terminology defined in the blueprint.
- Keep business constants centralized; do not duplicate revenue shares, formats, statuses, or pricing rules across screens.
- After every meaningful milestone, append a dated progress entry with files changed, behavior completed, and the exact next step.

## Progress log

### 2026-09-15 — Phase 2 completed

- Implemented Websites → Ad Zones → Ad Codes for Publisher.
- Applied the requested white, black, and blue visual system.
- Verified the production build after fixing the Ad Code placeholder markup.
- Current next action: define the blob upload contract, then build the first Advertiser creative upload slice.
