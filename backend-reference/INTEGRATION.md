# CarVet: demo to MVP

## Product and current implementation

The customer-facing product is CarVet: browse support packages, describe the buying situation, examine suitable cars, understand the evidence, and choose a next step. The eight original service names and base prices remain in `data/services.ts`. The viewing-support copy now includes the planned online/buying-day progression; `data/package-support.ts` separately maps proposed scanner and support benefits. New hardware and service scope are concepts, not active fulfillment.

The complete demo connects:

1. The homepage, package explorer, buying guide, about/contact pages, illustrative stories, articles, and sample report.
2. Package-specific client intake at `/demo`, including editable fictional briefs and server matching.
3. An explained shortlist and a separate illustrative buyer review. Preference fit never claims to measure condition.
4. A decision checklist, notes, comparison, download/print, and an explicit **Save to demo workspace** action.
5. `/workspace`, where the same saved request can be explored as a Client or Advisor preview, with editable demo status and shared guidance.
6. `/test-drive`, which tells the proposed scanner-to-keep story and provides parked setup, an illustrative recorded replay, diagnostic context, scripted support topics, and a buying-day checklist.

`/demo-guide` gives a guided way through the product and its MVP direction. `/privacy` and `/terms` describe the current demo’s data handling and scope.

The application uses the supplied Next.js-style React/TypeScript Vinext/Cloudflare Worker runtime. The Sites Vite integration, existing Site identity, and audience remain in place. Server matching has no GPU, hosted inference API, or runtime API-key dependency.

## What is real, and what is simulated

| Capability | Current behavior |
| --- | --- |
| Pages and original service content | Working routes with shared navigation, responsive presentation, package filters, article reading/search, and sample report tools |
| Matching | Real server execution of the original trained preference models and hard inventory filters |
| Vehicle inventory | Synthetic server catalog, not live listings |
| Reviews and client stories | Explicitly illustrative evidence and situations |
| New workspace requests | Explicitly saved browser-local copies of the sample brief, vehicle snapshots, plan, and notes |
| Client/advisor views | Two demo views of the same local dataset, without real identity or permissions |
| Advisor changes | Local status and client-visible guidance updates; no real advisor has been notified |
| Contact preview | In-memory draft and TXT download; explicit mailto link opens the visitor’s mail app, with no website submission |
| Scanner hardware | Planned permanent client ownership in eligible packages; no device selected, ordered, or shipped |
| Test-drive telemetry | Preloaded illustrative session frames, not live vehicle readings |
| Diagnostic snapshot | Supplied sample codes/readiness/module-coverage labels, not a real ECU scan or diagnosis |
| Online support | Scripted local replies and preview controls; no real agent or live communication |
| Buying-day support | Interactive planning checklist, not a booked service |
| Home Screen entry | Hosted-site shortcut/manifest presentation; not native scanner integration or offline availability |
| Documents, payment, bookings, market watch | Not fulfilled by this demo |

## Server-only matching boundary

| Layer | Responsibility |
| --- | --- |
| Client pages/components | Packages, request inputs, shortlist and comparison UI, sample evidence, next steps |
| `app/api/match/route.ts` | Dynamic HTTP route |
| `lib/matching/http.js` | JSON, method, content-type, origin, and 16 KiB request boundary |
| `lib/matching/service.js` | Allowed request fields and safe output projection |
| `lib/matching/engine.js` | Private trained inference, inventory filtering, and ranking |
| Private model/catalog JSON | Bundled server data, excluded from static/browser assets |

The request accepts `text`, `budget`, `max_mileage`, `min_seats`, `body`, `powertrain`, `awd`, `clean_only`, `exclude_electric`, and `priority`. Structured nonempty fields follow the original text/form precedence. Clients cannot replace the catalog or submit weights.

A successful response contains up to five `results`, `total_matches`, `inventory_count`, and active `constraints`. Each result includes ordinary vehicle facts, preference `score`, `reasons`, and `tradeoff`. Model probabilities, internal feature vectors, weights, and score breakdowns stay on the server.

Errors return JSON: invalid input `400`, different origin `403`, wrong method `405`, oversized request `413`, and incorrect content type `415`. Responses use `Cache-Control: no-store`. No exact matches leaves every requirement intact.

## Browser-local workflow boundary

`lib/demo-store.ts` stores demonstrations under `carvet-demo-workspace-v1`. It seeds three fictional requests when the workspace is first opened and supports up to 40 requests. If local storage is unavailable, a session-memory fallback is used.

A saved request includes:

- ID, original package slug, creation/update timestamps, and demo status (`draft`, `reviewing`, `action-needed`, or `ready`).
- Buyer brief/preferences, selected sample vehicle, and up to five result snapshots.
- Four checklist values, buyer notes, and shared advisor guidance.

The explicit save action in `ClientDemo` creates the local request. Client notes/checklists and Advisor status/guidance update it in the workspace. Same-page events and the browser’s storage event refresh the shared views. Removing a request deletes that local entry. Reset discards custom requests/edits and restores the three fictional examples.

This is a product simulation, **not** production storage or access control. The role switch does not authenticate anyone. Shared advisor guidance is visible in the client preview. Do not store private advisor working notes here or use the browser role state to authorize real actions. Data does not sync between devices. Matching requests are not intentionally persisted to an application database; hosting/security systems may retain normal logs.

## Test-drive simulation boundary

`components/TestDriveDemo.tsx` and `lib/test-drive-demo.ts` provide the sample scanner journey. The page does not invoke Bluetooth APIs, request scanner permissions, identify a real car, or send telemetry to the server. Its replay controls, two parked-setup acknowledgments, scenario choice, sample scan panel, scripted support topic, and buying-day checks use component state. They reset on reload/navigation; they do not become workspace records. The explicit JSON download contains the selected preloaded scenario, frames, sample diagnostic/readiness information, package slug, and a sample-data marker. Downloaded files are independent of workspace reset.

The recording is labelled sample throughout. A code is a diagnostic clue, not a confirmed failed part. A readiness state does not itself prove that codes were cleared. An absent code in a sample does not establish a fault-free vehicle. An EV example does not provide battery state of health. Generic engine/emissions information and deeper OEM ECU/DME, ABS, or other modules must not be presented as equivalent coverage.

The site includes a web manifest and touch icons, with Safari Home Screen instructions in `/demo-guide`. This is presentation and reopening convenience for the hosted site. There is no service worker/offline promise or implemented native scanner connector. A real iPhone adapter/app combination still needs device/protocol validation and an appropriate platform integration.

## Planned scanner fulfillment and support levels

- Entry listing-review packages remain report-led, without a scanner in their concept.
- Serious Candidate Review, Top 3 Decision, and Find Me Options would include a compatible scanner that is sent to the client and kept permanently.
- 30-Day Market Watch and Viewing Support would add planned online live support; Viewing Support is framed around one viewing with online guidance.
- Viewing Day Support is the highest buying-day concept and includes the planned scanner and live support across the agreed viewings.

The old base prices are retained for comparison. Hardware selection/cost, delivery geography, final pricing, support scope/availability, any future software entitlement, and fulfillment operations must be settled before sale. Permanent ownership refers to the scanner hardware; it is not a claim of perpetual unlimited live support or universal software coverage.

## Original packages and intended workflows

| Package route | Intended service workflow |
| --- | --- |
| `/services/listing-risk-scan` | One supplied listing → initial review |
| `/services/listing-shortlist-scan` | Up to ten supplied listings → initial shortlist |
| `/services/serious-candidate-review` | One serious candidate → deeper evidence review |
| `/services/top-3-decision-review` | Up to three candidates → decision comparison |
| `/services/find-me-options` | Requirements → curated shortlist → review |
| `/services/30-day-market-watch` | Search profile → recurring search and human review |
| `/services/viewing-support` | One viewing → planned online live buyer-side guidance |
| `/services/viewing-day-support` | Up to three planned viewings → coordinated buying-day support |

The demo previews those journeys using sample cars. It does not import real listings, deliver a paid package, initiate watch jobs, book viewings, or contact sellers.

## Connected-app implementation path

1. **Validate the device and coverage matrix.** Select suitable iPhone/tablet-compatible hardware only after testing exact vehicles, model years, adapters, connection modes, supported generic PIDs/DTCs, and separately licensed/available OEM modules. Store unsupported/unknown status explicitly. Treat EV battery information as a separate verified capability.
2. **Build the future companion app.** Implement platform-appropriate pairing, consent, reconnection, read-only capture, timestamps, units, sample rates, interruptions, and stop/export behavior. For iPhone, evaluate the documented Core Bluetooth/device requirements; a Home Screen web shortcut is not this implementation. Do not add ECU programming or code-clearing behavior to a read-only buyer workflow.
3. **Make capture reviewable.** Link a consented DriveSession and DiagnosticSnapshot to the exact vehicle/request, hardware/firmware identity, protocol/coverage result, and captured units/timebase. Distinguish unavailable values from zero and raw readings from later advisor interpretation.
4. **Deliver hardware and real support.** Add DeviceFulfillment, VehicleCompatibility, DriveSession, DiagnosticSnapshot, SupportSession, and BuyingDayPlan records alongside the existing service-request model. Account for inventory, shipment tracking, permanent device ownership, session scope, advisor availability, and fulfillment failures.
5. **Secure any shared logs.** Implement real client/advisor identity, request ownership, consent, access-controlled upload/storage, retention/deletion, and an audit trail before any real vehicle logs are shared. Keep private advisor notes separate from client-visible guidance. Vehicle/drive data can reveal personal use patterns even when no location field is requested.
6. **Pilot the complete journey.** Configure while parked, capture automatically with the phone secured, and review when stopped or through a passenger. Validate disconnects, unsupported modules, incomplete sessions, low-voltage behavior, phone/tablet accessibility, support handoff, and what happens when the client cannot connect.

## MVP sequence

1. **Establish ownership and persistence.** Add real client/advisor/admin authentication, server sessions, account recovery, authorization, and record-level ownership. Replace local workflow storage with server records. A Django/PostgreSQL service can own the application workflow while the matching adapter remains a server capability.
2. **Persist a reviewable request model.** Store BuyerProfile, ServiceRequest, VehicleSnapshot, RecommendationRun, CandidateReview, EvidenceItem, ActionItem, and AuditEvent. Preserve the exact snapshot and source used for each finding; avoid silently rewriting published reports.
3. **Build the real advisor workflow.** Add assignment, state transitions, draft/review/publish, and an audit trail. Separate private internal working notes from client-visible guidance. Require server authorization on every read/write.
4. **Connect permissioned sources and evidence.** Integrate an allowed listing provider and actual document/history workflows with provenance, timestamps, availability, consent, access-controlled storage, file validation, and retention/deletion rules. Missing evidence must stay unknown.
5. **Turn packages into fulfillment.** Decide service availability, payment/tax handling, terms, cancellations, notifications, and support processes before adding checkout. Payment success and fulfilled review status must have separate records.
6. **Deliver recurring and scheduled work.** Add market-watch jobs, deduplication, source refresh, retry/failure behavior, viewing calendars, and accountable operational ownership. A ranking result alone does not create a watch or booking.
7. **Verify before a real-client pilot.** Check cross-account isolation, upload authorization, consent and deletion, advisor publication, failure/retry paths, operational throttling, monitoring, and measured performance. Start with an explicitly scoped pilot and permissioned data.

Keep the frontend and matching server deployed together. Do not expose the private model files through static assets or restore browser inference in the client. The old offline inference demo is superseded by this server-backed experience.


## Development references

- [OBD standard and enhanced diagnostics coverage](https://support.obdlink.com/support/solutions/articles/43000713278): distinguishes generic parameters from manufacturer-specific modules and data.
- [Apple Core Bluetooth](https://developer.apple.com/documentation/corebluetooth): platform framework reference for the future companion-app feasibility work.
- [Apple Home Screen web-app guide](https://support.apple.com/en-lamr/guide/iphone/iphea86e5236/ios): current hosted-site shortcut instructions, also available in `/demo-guide`.

The references are technical background, not a procurement recommendation, a complete compatibility matrix, or evidence that scanner integration currently operates.
