# Route review and repair record

Scope: browser screenshots of the desktop first viewport for all 17 public pages at 1440 × 1000; DOM heading and page-overflow checks for all 17 routes at 390 × 844. This is not exhaustive interaction or full-scroll coverage.

| Route | Observation / disposition |
| --- | --- |
| Home | Sans headline and interactive example inspected; no phone page overflow. |
| Projects | Collection inspected; shared root theme mismatch repaired. |
| Repository | Source workspace inspected; shared root theme mismatch repaired. |
| Graph | Graph and inspector inspected; first-frame theme mismatch repaired; dense node labels remain a refinement target. |
| Context | Dense metrics and tabs inspected; missing legacy color aliases repaired. Example performance claims need a separate content audit. |
| Impact | Rebuilt into scenario selection, impact summary and evidence tabs with Radix. Removed unsupported precise score and CLI command. Phone uses a compact scenario picker. |
| Decisions | Master/detail view inspected; missing accent aliases repaired. More comprehensive keyboard/content review remains. |
| Rules | Rule cards inspected; shared color repair applies. Audit/violation claims remain unverified. |
| Sessions | Master/detail view inspected; shared color repair applies. Fact verification labels remain unverified. |
| Agents | Cards inspected; missing accent aliases repaired. Connection labels remain illustrative/unverified. |
| History | Timeline inspected. Commit verification labels require source-backed verification. |
| Docs | Navigation labels were clipped; changed to wrap. Full document and command accuracy review remains. |
| Architecture | First viewport and invariant cards inspected. Claimed guarantees require separate verification. |
| Providers | Cards inspected; missing accent aliases repaired. Provider setup instructions need a separate accuracy review. |
| Benchmarks | First viewport inspected. Contradictory illustrative/measured claims remain a content issue. |
| Local first | Two-column architecture view inspected. Cloud/safety guarantees remain unverified. |
| Settings | Theme grid inspected. Earlier save, health and navigation repairs retained. |

Verified Impact interactions: selecting ComputeDelta updates its evidence; Tests shows watcher_test.go; Copy report reports success. The final production build passed after the mobile-picker adjustment; selecting ComputeDelta through the phone picker updates the summary correctly. Browser console inspection returned no warnings or errors. No claim of a defect-free or production-ready product follows from these checks.
