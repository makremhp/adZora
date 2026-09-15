# AdZora Release Development Memo

## Current Stage

Frontend Business Logic / Advertising Economy

## Completed

- Advertiser balance UI with available, reserved, spent, and deposited amounts
- Publisher earnings UI with pending, available, total earned, and withdrawn concepts
- Campaign financial structure and insufficient-balance validation
- Banner, Native, Social, Popup, Video, and Direct Link ad types
- CPM, CPC, and CPV pricing models
- CPA architecture placeholder without a live implementation
- Publisher revenue share configuration by ad type
- Campaign statuses and campaign list rendering
- Ad event financial calculation concepts without client-side balance mutation
- Responsive financial UI for advertiser and publisher roles
- Demo-only state clearly separated from server-authoritative financial data

## Backend Pending

The current implementation is frontend-only. Balances, earnings, spend, impressions, clicks, withdrawals, campaign persistence, ad-event validation, authentication, payment processing, and the Ledger are not server-authoritative yet. Demo values are held in memory and are not a source of truth.

## Known Issues

- No Backend, Database, Authentication, Admin Dashboard, Payment Gateway, or real Ad Server has been implemented.
- Blob upload/storage integration is not implemented yet; it will be added when the backend/storage task is requested.
- Demo campaign and earnings events are static examples and do not represent validated financial events.

## Next Task

To be defined by the product owner.