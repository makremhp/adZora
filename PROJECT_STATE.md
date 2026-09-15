# adZora — Project State / Handoff

> Read this file before changing the repository. It records the verified implementation boundary.

## Snapshot

- Repository: https://github.com/makremhp/adZora
- Owner: makremhp
- Default branch: main
- Snapshot date: 2026-09-15
- Source baseline before Phase 1: 544ac4117f374dc71e17e882eb3cb47ca295088a
- Blueprint: AdZora_Master_Frontend_Blueprint

## Important repository fact

The repository was empty apart from the handoff file before Phase 1. The previous frontend had been removed by these commits: assets/, RDM.md, and index.html. Do not assume the deleted frontend is still active; the new source is a clean React/Vite foundation.

## Current objective

Build AdZora as a real advertising marketplace similar in category to Adsterra, with structurally separate Publisher and Advertiser workflows. Follow the attached Master Frontend Blueprint as the product contract. The implementation is intentionally incremental: complete one phase, verify it, update this file, then continue.

## Phase 1 — Information architecture and frontend foundation

Implemented in the current phase:

- React + Vite application foundation.
- Separate Publisher and Advertiser workspace switcher.
- Role-specific navigation, terminology, balance label, KPIs, and quick actions.
- Centralized ad-format configuration for Banner, Native, Social, Popup, Video, and Direct Link.
- Centralized CPM, CPC, CPV, and future CPA pricing configuration.
- Premium dark/gold design tokens and consistent component styling.
- Publisher and Advertiser overview dashboards with deliberate zero-data states.
- Responsive mobile drawer with overlay, close button, active state, Escape handling, and scroll lock.
- Explicit Coming Soon states for navigation sections that are not functional yet; no dead links.
- README with local run instructions and the current scope.

Not implemented yet:

- Authentication and real API data.
- Blob/file upload contract and storage implementation.
- Website, Ad Zone, Ad Code, campaign, creative, billing, withdrawals, and analytics workflows.
- Loading, error, success, and form validation states for functional screens.

## Next implementation order

1. Verify the Phase 1 build at mobile and desktop widths.
2. Implement Publisher websites → ad zones → ad codes as the first real workflow.
3. Define and implement the blob upload contract for creative assets; record whether the blob target is app storage, object storage, or GitHub Git Blobs. Do not infer this silently.
4. Implement Advertiser campaigns and the multi-step create-campaign flow using the centralized ad-format configuration.
5. Add publisher earnings/withdrawals and advertiser balance/billing as separate financial experiences.
6. Add analytics, reports, loading/error/success states, then perform responsive QA.

## Handoff rules

- Read this file before coding.
- Never claim a feature is complete without recording the commit SHA and verification result.
- Preserve the Publisher/Advertiser separation and the terminology defined in the blueprint.
- Keep business constants centralized; do not duplicate revenue shares, formats, statuses, or pricing rules across screens.
- After every meaningful milestone, append a dated progress entry with files changed, behavior completed, and the exact next step.

## Progress log

### 2026-09-15 — Phase 1 implementation

- Read and converted the attached Master Frontend Blueprint into the initial architecture.
- Confirmed the clean repository baseline and started a React/Vite frontend rather than restoring deleted files.
- Added the initial application shell, centralized configuration, responsive styles, dashboards, and deliberate empty/Coming Soon states.
- Verification pending: install dependencies and run the production build in the project environment.
- Next action: verify the build, then implement the Publisher websites workflow.
