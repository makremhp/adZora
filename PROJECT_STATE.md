# adZora — Project State / Handoff

> Read this file before changing the repository. It records the verified implementation boundary.

## Snapshot

- Repository: https://github.com/makremhp/adZora
- Owner: makremhp
- Default branch: main
- Latest functional source commit: 2a0f4884469d0acd99c580fd77a4210bac65497f
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

### Phase 4 — Publisher Direct Links and format-specific advertiser campaigns

- Publisher website creation now requests only Website Name and Website URL.
- Added per-website Create Direct Link with a unique token, copy action, destination association, and explicit Frontend-only tracking boundary.
- Preserved the Universal AdZora Code as a single publisher code with no ad type, Creative, media, or size selection.
- Added Popunder as a separate advertiser format with browser-safe trigger, delay, cooldown, frequency cap, and session limits.
- Rebuilt campaign creation around format-specific Creative fields and separate Behavior, Campaign, Targeting, Budget, eligibility, preview, and tracking sections.
- Added live previews for Banner, Native, Social, Popup, Video, Direct Link, and Popunder.

### Phase 5 — Publisher analytics and professional ad format previews

- Restored Universal Code as a distinct publisher action with the same visual weight as Create Direct Link.
- Added per-website Publisher Analytics with Website and Direct Link scope selection, event metrics, SVG chart state, and explicit Frontend-only tracking boundaries.
- Added clearer inline SVG format visuals for every advertiser format.
- Improved Banner preview sizing so the creative frame follows the selected dimensions such as 320×50, 300×250, 728×90, and 970×250.
- Added responsive analytics layout and distinct format-card presentation for easier campaign creation.

## Verification

- Latest verification: npm install --no-audit --no-fund succeeded; npm run build succeeded with Vite 5.4.21 and 36 modules transformed after Phase 5.

- Latest verification: npm install --no-audit --no-fund succeeded; npm run build succeeded with Vite 5.4.21 and 36 modules transformed.

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

### 2026-09-21 — Neon API foundation

- Added a Node API in `server/index.js` with JWT authentication, bcrypt password hashing, database-backed users, websites, campaigns, and wallet requests.
- Added `server/schema.sql` for Neon/Postgres and `.env.example`; the server reads `process.env.DATABASE_URL` and never exposes it to Vite.
- Replaced frontend-only account, website, campaign, profile, website deletion, and wallet request mutations with API calls.
- Removed hardcoded wallet destination and analytics/finance fixtures; empty states now reflect database data.
- Verification: `npm install --no-audit --no-fund`, `npm run build`, `node --check server/index.js`, and `git diff --check` pass. No Neon credentials were used in this session, so a live database request was not run.
- Commit SHA: not created in this file-only handoff; apply these files to the repository before committing.

### 2026-09-15 — Phase 3 completed

- Added the Blob-ready Advertiser Creatives frontend slice.
- Fixed responsive overlap and overflow risks, with special handling for Ad Codes and copy actions.
- Verified the production build after the changes.
- Current next action: connect the Blob/FormData boundary to a real backend storage endpoint, then start campaign creation.

### 2026-09-15 — Step 01 delta frontend slice

- Preserved the existing Blob/FormData frontend boundary in `AdvertiserCreatives.jsx`; no upload method or production URL behavior was replaced.
- Added the missing publisher website fields, dynamic Ad Zone builder, format-specific settings, visual previews, validation, review/confirmation, details, and Ad Code handoff.
- Added advertiser campaign creation with format-specific creative requirements and preview, plus demo-only balance, deposit, billing, and transaction views.
- Added frontend account access states for login, signup, forgot password, and reset password without adding an authentication server.
- Added responsive styling for the new flows while preserving the existing mobile drawer and workspace separation.
- Verified with `npm run build` and `git diff --check`.
- Source commit: `52a6e55d68d835b11ba6b0700c0fd0eb3297c5d7`.

### 2026-09-15 — Publisher finance UX

- Added Publisher Earnings with Available Earnings, Pending Earnings, Total Earned, Withdrawn, eCPM, RPM, impressions, and clicks demo presentation.
- Added the complete frontend withdrawal path: amount, minimum balance, payment method, validation, confirmation, pending status, and success state.
- Added separate Publisher Transactions presentation for earnings, adjustments, and withdrawals.
- Kept all finance behavior demo-only; no payment provider, transfer, accounting, or backend was added.
- Verified with `npm run build` and `git diff --check`.
- Source commit: `016d32574f04130e6083e43ee6eeb57af76a2afa`.

### 2026-09-15 — Creative library campaign handoff

- Connected the existing session Creative Library to Advertiser Campaign Creation.
- Added a creative selector that reuses uploaded image/video records and maps the selection to the format-specific campaign field.
- Preserved manual placeholder entry when no library item is selected.
- Kept storage, serving, and production URL behavior unchanged.
- Verified with `npm run build` and `git diff --check`.
- Source commit: `97289f18adbd08633e31e842b8166cd4213a5762`.
- Remaining frontend gaps: publisher earnings/withdrawal screens are still placeholders; no backend, database, API, payment processing, ad serving, or real authentication was added.

### 2026-09-15 — Public landing and simplified publisher setup

- Added a public RTL landing page with AdZora-specific dark/gold visual identity, advertiser and publisher entry points, format showcase, workflows, capability section, footer, and responsive mobile drawer.
- Added a simplified Publisher advertisement flow: choose website → choose format → choose banner size when required → confirm → copy generated code.
- Preserved the existing Ad Zone object shape and website-to-zone relationship; advanced configuration remains internal and is no longer exposed in the primary flow.
- Added custom visual selection cards, progress states, responsive layouts, and inline copy feedback for the new flow.
- Verification: `npm run build` passes with Vite 5.4.21.
- Source commit: `95f3a7d031d6487b093c0f6d0c9eb3c63f111ef5`.
- Next task: review the uploaded build in a browser at the required mobile widths, then continue with the remaining profile/settings and analytics screens.

### 2026-09-15 — Landing palette and format requirements

- Changed the public landing page palette to white background, black text, and blue action accents while keeping the existing dashboard palette unchanged.
- Replaced website category selection with custom visual website-type cards.
- Added centralized format requirement definitions for Banner, Native, Social, Popup, Video, and Direct Link.
- Added format-specific Publisher requirement screens, including image requirements, HTTPS destinations, popup copy, and browser-side video validation.
- Video uploads now accept MP4/WebM only, cap files at 20 MB, and require a detected duration between 5 and 60 seconds before confirmation.
- Verification: `npm run build` passes with Vite 5.4.21.
- Source commit: `c7b1bcaae9ce40b1a58a13fd48ada699f52a217b`.

### 2026-09-15 — Landing navigation and website URL fixes

- Replaced landing navigation buttons with functional anchor links and smooth scrolling, including mobile drawer links.
- Loaded a final landing-only stylesheet after the legacy landing rules so the public page consistently uses the requested white, black, and blue palette.
- Added the missing check icon used by the landing proof and capability sections.
- Website entry now accepts `example.com`, `www.example.com`, or a full URL, normalizes protocol-less values to HTTPS, and validates the hostname.
- Verification: `npm run build` passes with Vite 5.4.21.
- Source commit: `63a96fedf44aab32b940f97c5f5ba4e51cb612d9`.

### 2026-09-16 — Simplified ad formats and workspace polish

- Removed Direct Link, Popup, and Popunder from the active advertiser format configuration, campaign builder, landing format list, and tracking event preview.
- Removed the publisher website-card icon and the Inventory / Impressions / Clicks row so the site card focuses on the website identity and actions.
- Reworked campaign media upload into a clearer styled image/video chooser and made Banner previews use the full available width while preserving the selected aspect ratio with cover-fit media.
- Added compact advertiser and publisher `$0.00` balances to the workspace top bar.
- Verification: `npm run build` and `git diff --check` pass with Vite 5.4.21.
- Next step: review the pushed UI in the browser at desktop and mobile widths.
