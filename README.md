# AdZora

AdZora is a React/Vite frontend foundation for an advertising marketplace connecting advertisers and publishers.

## Phase 1

The first vertical slice establishes the product information architecture:

- Separate Publisher and Advertiser workspaces.
- Role-specific navigation and financial terminology.
- Centralized ad-format and pricing configuration.
- Responsive sidebar with a real mobile drawer, overlay, close button, and Escape behavior.
- Publisher and Advertiser overview dashboards with deliberate demo/empty states.
- Explicit Coming Soon states for routes not implemented yet.

## Run locally

npm install
npm run dev

The current UI is intentionally frontend-only. It is structured so API data, authentication, real accounting, and blob upload can be added without changing the information architecture.
