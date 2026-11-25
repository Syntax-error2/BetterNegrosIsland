# Project tracker tools

Four public, account-free tools are available from the main Project tracker link and its tool navigation:

- `/tracker` groups nearby points at each zoom level. Numbered markers open a keyboard-accessible list of every record in the group. The view starts around Negros and provides a control to fit all published coordinates. Six source points fall outside the broad viewing window. Street tiles load on request via OpenStreetMap.
- `/contracts` searches 10,878 historical DPWH contracts by ID, contractor, title, office or candidate GAA line. Search all office groups or load one group. Filter by category, year, reported status and availability of candidate links. Sort by year or listed amount. Each contract has a shareable reference with source and matching details.
- `/documents` shows NEP, House second reading and House third reading amounts next to their source pages. Reference sheets are downloadable. The eight-document library can identify a downloaded PDF by its SHA-256 fingerprint and tell readers when it matches another edition. The browser reads the selected file locally.
- `/ask` supports proposal totals, rankings, paired amount changes and source document queries. Typed questions can include recognized places, programs and stages. The page asks for clarification if a term cannot be applied. Readers can refine the interpreted filters, see NEP and House totals side by side, and download supporting records.

Map, project references and guided calculations respect retained snapshot links. Contracts and catalogue metadata have their own dates. Pinned contract views explicitly decline to substitute current data; pinned document views retain original project links and offer a separately labelled link to the latest catalogue.

## Data maintenance

`npm run data:tracker` performs a separate, explicit read-only extraction from the provider. It downloads the documented contract and GAA-link CSVs, verifies provider byte counts, SHA-256 and full row counts, then publishes regional derivative files and their own checksummed index. Source README and manifest are retained. No proposal snapshot refresh is triggered by this command or by ordinary builds. Existing seven protected budget shards are unchanged.

Current source: https://budget.bettergov.ph/hgab/2027/contractors and https://budget.bettergov.ph/docs . Source credit: People's Budget Coalition × BetterGov.PH. All source caveats continue to apply. Missing a candidate match is not evidence of a missing official record. Office associations are not verified physical locations and do not establish sponsorship.

Contract table source built 3 November 2026; proposal snapshot retrieved 2 November 2026. Import timestamps are recorded in UTC. Freshness is not inferred from when the website was built.

## Dependencies and external requests

Leaflet's BSD 2-Clause notice is retained at `/licenses/leaflet.txt`. Map data: © OpenStreetMap contributors; tile usage and privacy apply. Browser tile requests use the website origin as referrer, never the full search URL. Only the specific tile image origin was added to CSP. Script/font/connection restrictions and the no-geolocation policy remain in place. All other tools run over same-origin retained JSON. Existing analytics configuration is preserved; no AI provider, account service or new personal-data backend was added.

Privacy notice version `2026-11-25-privacy.12` describes optional tiles, local file hashing and guided questions. Existing formal privacy/operator decisions and independent QA gaps are not resolved by this implementation.
