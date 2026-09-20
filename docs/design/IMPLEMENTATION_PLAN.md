# Reference-led implementation plan

The 17 generated concepts are saved in `apps/web/public/design-reference/`. Open `/design-reference/index.html` on the local preview to compare them with current pages. The manifest maps each concept to its real route.

## Visual contract

Use the images for composition, hierarchy, spacing and atmosphere. Preserve Knovra's actual brand mark, source-backed product copy and existing route names. Several image outputs drift into generic research software and invent commands, models, customer data or feature claims. Those details are not implementation requirements. Graph and Repository are the strongest workspace references; Home is the editorial direction.

## Implementation sequence

1. Homepage: split editorial copy and interactive product stage. Implemented as the first adaptation; still a simplified graph compared with the reference.
2. Code graph and Repository: implemented the reference adaptations. Repository has eight real source snapshots, file search, declaration jumps, code copy and a responsive inspector. Graph has a wider canvas, optional symbol browser, keyboard selection and quieter default motion. The graph data remains illustrative.
3. Context and Impact: task-first composer and evidence output, with honest demo labels until live integration exists.
4. Decisions, Rules, Sessions and History: clear master/detail reading surfaces and real stateful navigation.
5. Projects, Agents and Providers: task-focused cards, working setup flows and accurate integration status.
6. Documentation, Architecture, Benchmarks, Local first and Settings: readable editorial layouts and verified instructions.

The existing shared-shell redesign remains the baseline. A concept image being present does not mean its corresponding page has been rebuilt to match it.

Radix Themes is now installed. Use its buttons, badges, dialogs, segmented controls, text fields, and select menus for new work. ThemeProvider synchronizes library appearance with the existing light/dark preference. Lucide remains the icon system. Projects has been rebuilt with Radix cards, live search, status filtering, a setup dialog, and explicit example-data labels. Shared navigation now has route icons and a Radix appearance picker. The remaining page compositions still need individual redesign and visual verification; a button migration is not a completed page redesign.

## Generation prompt set

Method: built-in Image Generation, one call per page (17 images). No external API key or CLI generation was used.

Shared workspace prompt: Generate one stunning polished high-fidelity desktop UI design reference for Knovra's named page. Flat straight-on 1440px-wide website screenshot composition without device mockup. Consistent premium system: obsidian #090b10 canvas, layered graphite cards, pale lavender #b3a0ff primary accent, subtle cyan secondary highlights, warm white highly legible modern sans typography, elegant italic serif only on editorial titles where appropriate. 76px top bar with knovra brand, search and Workspace action. Slim grouped navigation sidebar; the active page matches its heading. Spacious main heading, concise subheading, one clear main task, refined 1px borders and generous purposeful gutters. Create thoughtful hierarchy and purposeful layout unique to the page. Avoid excessive badges, random numbers, neon overload, illegible dense text, fake enterprise logos and fake customer claims. This is a visual concept reference, not a claim of implemented functionality.

Page briefs:

| Page | Composition requested |
|---|---|
| Home | Editorial headline “Great work starts with the whole picture.”, two actions, dominant connected project graph and context inspector, three feature cards |
| Projects | Workspace portfolio, repository cards, index status, open action and recent work |
| Repository | Searchable file tree, syntax-highlighted source, symbol breadcrumbs and provenance |
| Code graph | Authentication-centered service graph, symbol explorer, inspector and zoom controls |
| Context | Task composer, context budget, ranked sources, evidence graph and bundle preview |
| Impact | Change input, analyze action, dependency graph, direct/indirect effects and evidence |
| Decisions | Decision timeline, rationale, alternatives and related source files |
| Rules | Severity filters, rule library, selected rule detail and code example |
| Sessions | Session rows with task, agent and status, handoff notes and linked context |
| Agents | Agent integration directory, setup status and connect action |
| History | Git timeline, selected diff and provenance |
| Docs | Navigation, getting-started article, installation block, copy and table of contents |
| Architecture | Layered source/index/context/agent diagram and principles |
| Providers | Searchable integration catalog, compatibility and setup panel |
| Benchmarks | Charts labeled illustrative, workload controls and reproducible methodology |
| Local first | Editorial local execution explainer, device-contained graph and workflow steps |
| Settings | Appearance, workspace and connections; theme swatches, inputs and save feedback |

