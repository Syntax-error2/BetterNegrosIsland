# Citizen tools: layout, navigation and privacy repair

Verified locally on 3 November 2026. Development site: `http://localhost:5132/`. The production bundle was also served temporarily on port 5133 for browser verification; that preview was stopped. No deployment or public-release approval occurred.

## Repairs

- **Budget guide:** removed the explicit `scrollIntoView` call. All five explanatory panels share a content-sized grid, so the longest step reserves the required space without clipping text. Inactive panels use visibility, `aria-hidden` and `inert`. Next/Previous controls remain above the optional quiz and real example. Scroll anchoring is disabled only while the guide route is present, preventing footer anchoring when activities appear. Heading focus uses `preventScroll`.
- **Comparison:** replaced long native option menus with searchable, bounded lists of labelled native radio controls. Full titles wrap; IDs stay visible; results scroll inside their own container. Selected records stay available while refining a search. The other side's selection is disabled; clear, swap, deep links and exact stage amounts remain supported.
- **Evidence controls:** version select, PNG download and source-copy controls align at top and bottom with equal 48px desktop height. Controls stack at phone widths and allow text to grow.
- **Homepage:** reordered content to introduction/source snapshot, comparison summary and limitations, community search, question shortcuts, province browsing, coverage explanation and responsible-use notice. Existing records, totals and source qualifications are retained.
- **Disclaimer and notice:** added a responsible-sharing/privacy notice to home, comparison and evidence pages and to the PNG itself. It preserves the distinction between proposals, appropriations and spending, and warns against unrelated identifiers/private contact details/sensitive personal information. Privacy Notice version `2026-11-03-privacy.4` describes local image/QR generation, download, explicit clipboard copying, public comparison IDs and the lack of automated personal-data redaction. The processing inventory was updated.

## Verification

- `npm test`: **55 passed**, including exact amount/null handling, source URLs, all 866 records at both evidence stages, QR encoding and source-notice preservation.
- `npm run lint`, `npm run build`, `npm run data:validate`: **passed**. Snapshot remains `2026-11-02-37334582ca74`; 866 comparison records, 851 source-confirmed NIR records, 5,253 historical families, 2,578 query reports and seven shard checksums verified. No data refresh.
- **16 responsive cases passed:** home, comparison, guide and evidence at 320, 375, 768 and 1440px. Actual rendered geometry checks: page overflow, text clipping, broken images, KPI row alignment, wrapping full titles, bounded result lists, toolbar alignment and inactive guide panels. Results are in `responsive.json` and individual width/page JSON files. Browser viewport override was reset afterward.
- **16 guide transitions passed:** all four forward and four backward transitions at 375px and 1440px. Panel height, navigation top and scroll position remain stable within 1px. Phone forward/backward scrollY remains 648.80 and nav top 476.85; desktop scrollY remains 299.20 and nav top 476.25. See `guide-transitions-*.json`.
- **Production browser checks passed:** initial and selected comparison, evidence toolbar, and all five guide steps at 375px with unchanged scroll position. Exact comparison example retained DPWH NEP/House ₱360,000,000 and HFEP NEP ₱11,700,000 / House ₱50,000,000, with third/second House readings respectively.
- **Interaction checks:** title/ID search, Space-key selection, disabled duplicate, swap, clear and no-results recovery. A premature immediate count after Clear was retried after waiting for React's completed render; no selection remained.
- **Five axe audits: zero reported violations:** phone comparison, desktop guide, guide quiz, home and evidence. Comparison has one incomplete color-contrast rule covering partially obscured/offscreen list items; the other four have no incomplete rules. These results are not full accessibility certification or physical-device/screen-reader acceptance.
- **PNG:** actual Blob download saved successfully, copied here as `evidence-card.png` (1080×2749). Inspected visually: full title, exact stage/amount/date, added privacy notice, preserved upstream caveats and readable source footer. `jsQR` decoded the downloaded image to `https://budget.bettergov.ph/hgab/2027/dpwh/p/house-reading%3A1918`.

## Test refinements and limits

The CUA semantic click/press implementation can scroll a target to the center before activation. Guide measurements start after that positioning, then compare each completed step; a DOM-only property (`inert`) unavailable through the read-only browser adapter was checked through the actual HTML attribute instead. The first responsive batch timed out and was rerun in bounded batches; the consolidated report contains only completed passing cases. Phone testing found genuine footer anchoring when the quiz appeared; the route-specific anchoring fix was verified before the final transition reports were saved.

Source data, existing analytics/history behavior and operator identity were preserved. Other previously documented release acceptance requirements remain outside this layout repair.

## Privacy release boundary

Official reference: NPC [Data Privacy Act](https://privacy.gov.ph/data-privacy-act/) and [Implementing Rules and Regulations](https://privacy.gov.ph/implementing-rules-regulations-data-privacy-act-2012/). The principles of transparency, legitimate purpose and proportionality guide the wording and minimization decisions. A disclaimer is not legal clearance or permission for unrestricted republication.

Public launch still requires a verified monitored privacy contact and working rights/corrections procedure, hosting/provider/log-retention and lawful-processing decisions, source personal-information review and operator/legal approval. No contact, lawful basis, retention period or compliance certification has been invented. See `../critical-hardening/PRIVACY_PROCESSING.md` for the decision register.
