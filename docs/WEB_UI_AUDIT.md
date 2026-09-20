# Knovra web UI audit

## Findings

- 17 routes use a large amount of route-local inline styling, so spacing and type scale drift between pages.
- Graph and context are the densest surfaces and have the highest inline-style counts; they need the strongest responsive constraints.
- Shared theme tokens are defined in multiple layers, with the refinement sheet overriding the base system. This makes themes difficult to reason about.
- Several pages rely on small metadata text and badges for hierarchy instead of a consistent page header and primary action.
- The layout has responsive rules, but individual inline grids can still create cramped mobile compositions.

## Cleanup order

1. Shared shell: normalize page headers, content widths, card surfaces, controls, and mobile gutters.
2. Dense work surfaces: graph, context, repository, and docs.
3. Operational pages: projects, agents, decisions, rules, history, sessions, settings.
4. Marketing/explainer surfaces: overview, architecture, local-first, benchmarks, providers, impact.
5. Remove duplicate theme overrides and move repeated inline patterns into named primitives.

The redesign brief in `PREMIUM_PRODUCT_DESIGN_PROMPT.md` is the visual contract for each phase.

## Implemented redesign — September 11, 2026

- Rebuilt the homepage around editorial typography and an interactive project example.
- Replaced the shared navigation, workspace sidebar, breadcrumbs, appearance picker, and footer with one product shell.
- Consolidated the active design layer in `apps/web/app/product.css`; the layout no longer loads the conflicting refinement stylesheet.
- Improved heading hierarchy, body and metadata sizing, form controls, responsive grids, and mobile gutters throughout the 17 routes.
- Added route transitions, graph emphasis, hover feedback, visible keyboard focus, and reduced-motion support.
- Fixed initial graph framing, wrapped inspector names, repaired the Subsystems action, and increased mobile symbol-list space.
- Repaired narrow Decisions grids, Rules tags, Context metric cards, and mobile Documentation navigation.

## Validation

- Reviewed all 17 public routes visually at desktop and phone sizes during this pass.
- Rechecked all routes at 390 × 844: no page-level horizontal overflow; sampled headings, paragraphs, inputs, and buttons stay within the viewport.
- Mobile navigation opens with all route groups and the appearance control; global search opens and filters results.
- Production build includes TypeScript validation and generates all 21 static outputs. Package `lint` and `test` scripts are currently placeholder messages and are not counted as verification.
- The local preview uses `KNOVRA_BUILD_DIR=.next-redesign` to avoid the stale default build output. Build and start must use the same setting.

## Remaining product scope

The site is still a product preview with illustrative datasets and simulations. These UI checks do not verify live repository ingestion, production API integration, every demo action, or backend readiness. The remaining route-local inline styles can be moved into named components as those workflows become connected.

Additional interaction repairs: graph symbol rows no longer shrink inside their scroll area; route entrance motion releases its transform after playback so nested fixed overlays use the viewport; the mobile inspector has a labeled dialog, focus containment, and Escape dismissal.

Theme check: restricted the new dark color palette to the dark theme selector after finding that a root-level override reduced contrast in light mode. Other themes retain their semantic base palettes.

## Reference adaptation — September 12, 2026

Saved 17 generated page concepts and a browsable gallery at `/design-reference/index.html`. Applied the homepage's split editorial composition as the first reference adaptation. Verified homepage screenshots at 1440 × 900 and 390 × 844, no phone document overflow, and a working example selector. Gallery navigation exposes all 17 page images and links to current routes. Production build passes. Other reference-specific page adaptations remain in docs/design/IMPLEMENTATION_PLAN.md.

## Code Graph and Repository adaptation — September 12, 2026

Repository replaces sample-only metadata with eight curated Knovra source files captured at build time. It includes filename/declaration search, file selection, line-numbered code, declaration jumps, clipboard feedback and file details. Declaration detection is textual, not an AST claim. The snapshot is neither a live arbitrary-repository connection nor an editor.

Graph gives the canvas the previous symbol-list space, with an on-demand browser, less dimming of unselected nodes, accurate dataset counts, keyboard-selectable SVG nodes and a paused default trace animation. Existing layouts, depth controls, zoom, pan and inspectors remain.

Production build passed after repairing project-root detection for builds launched from the monorepo root. Browser checks at 1440 × 900 and 390 × 844 verified layout, no phone document overflow, repository filtering/file selection/declaration jump/copy success, graph filtering/keyboard selection, and the mobile inspector. Only these two pages were adapted in this phase.
