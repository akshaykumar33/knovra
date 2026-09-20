You are working inside the existing **Knovra** web application.

The UI already exists.

Do NOT rebuild the site from scratch.

Your task is to perform a complete **responsive + modern visual refinement pass** across the existing implementation while preserving working routes, content, functionality, theme system, docs architecture, graph views, and business logic.

The current problems are:

* layout is not consistently responsive
* spacing feels static
* some sections look too flat
* desktop assumptions leak into mobile
* navigation is too basic
* visual hierarchy needs improvement
* floating visual elements are missing
* navbar needs multiple responsive variants
* premium developer-product feel is not consistent
* components need better breakpoint behavior
* some sections feel like generic Tailwind layouts

The final product should feel polished, premium, modern, technical, and intentional.

Do not create gimmicky animation.

Do not sacrifice performance or accessibility.

---

# 1. FIRST AUDIT THE CURRENT UI

Before modifying anything, inspect:

* all public routes
* docs pages
* dashboard layouts
* graph explorer
* playground
* navbar
* sidebar
* footer
* theme system
* typography
* container widths
* grid systems
* reusable components
* breakpoints
* responsive utilities
* mobile nav
* tablets
* dialogs
* drawers
* code blocks
* tables
* graph components
* card layouts

Identify:

1. fixed widths
2. hardcoded heights
3. overflow bugs
4. duplicated layout logic
5. non-responsive grids
6. desktop-only interactions
7. missing tablet design
8. typography scaling problems
9. touch-target problems
10. unnecessary absolute positioning

Then refactor.

---

# 2. RESPONSIVE DESIGN MUST BE INTENTIONAL

Do not simply add:

sm:
md:
lg:

randomly.

Design explicitly for:

320px
360px
375px
390px
430px
768px
1024px
1280px
1440px
1728px
1920px+

The application should have separate intentional behavior for:

mobile
large mobile
tablet
small laptop
desktop
wide desktop

---

# 3. FLUID RESPONSIVE SYSTEM

Use fluid sizing where appropriate.

Prefer:

clamp()

for:

* typography
* section spacing
* hero height
* container padding
* decorative scale
* graph preview dimensions

Example concept:

font-size:
clamp(2.4rem, 7vw, 6rem)

padding-inline:
clamp(1rem, 4vw, 5rem)

Do not blindly use these exact values.

Establish consistent responsive tokens.

---

# 4. CONTAINER SYSTEM

Create a deliberate container system.

Examples:

container-xs
container-sm
container-md
container-lg
container-xl
container-wide
container-full

Different page types need different widths.

Marketing text:
narrower.

Docs:
content-optimized.

Graph:
wide/full-width.

Dashboard:
fluid.

Do not force every route into the same max-width.

---

# 5. NAVBAR VARIANTS

Create a reusable Navbar system supporting multiple visual variants.

Required variants:

## Variant 1 — Transparent Floating

For homepage hero.

Characteristics:

* detached floating pill/bar
* rounded outer shell
* translucent surface
* backdrop blur
* subtle border
* slight shadow
* comfortable horizontal margins
* floats slightly below top edge

Desktop concept:

┌────────────────────────────────────────────┐
│ KNOVRA  Product Docs Graph   Search  Start │
└────────────────────────────────────────────┘

It should feel lightweight and premium.

---

## Variant 2 — Solid Sticky

For docs and application routes.

Characteristics:

* full-width
* sticky top
* compact
* strong readability
* subtle bottom border
* solid semantic surface
* minimal distraction

Use on:

/docs
/app
/projects
/settings

---

## Variant 3 — Minimal Developer Navbar

For technical playground/graph experiences.

Characteristics:

* very compact
* repo/project selector
* command palette trigger
* runtime status
* theme
* actions

Example:

KNOVRA | repo-name | ⌘K | Runtime ● | Theme | GitHub

---

## Variant 4 — Scrolled Navbar State

Homepage navbar should evolve on scroll.

At top:

floating transparent.

After threshold:

smaller
denser
more opaque
more compact

Use tasteful transition.

Do not make it jump.

---

# 6. MOBILE NAVIGATION

Do NOT simply collapse everything into a tiny hamburger.

Design an actual mobile navigation experience.

Possible structure:

Top bar:

logo
search
menu

Menu opens a full-height sheet/drawer.

Inside:

Product
Docs
Developers
Graph
Pricing
GitHub

Theme selector

Get Started

Search

The mobile drawer should:

* animate smoothly
* trap focus
* close on escape
* support swipe-friendly interaction where appropriate
* have large touch targets
* show hierarchy clearly

---

# 7. FLOATING UI ELEMENTS

Introduce floating visual elements intentionally.

Examples:

* floating graph nodes
* floating code cards
* floating terminal snippets
* context metrics
* small agent/provider chips
* runtime status indicator
* selected context node cards
* hover labels
* contextual command hint
* task card
* graph relation badge

These should reinforce Knovra's product story.

Do NOT randomly scatter icons.

Every floating item should communicate:

context
graph
agent
code
memory
rule
skill
validation
runtime

---

# 8. FLOATING ICON SYSTEM

Create a reusable component such as:

FloatingIcon

with configurable:

icon
size
position
depth
rotation
animation
blur
opacity
theme-aware surface

Possible icons:

GitBranch
Network
Braces
Database
Terminal
ShieldCheck
BrainCircuit
Layers
Workflow
SearchCode
FileCode
Cpu
GitPullRequest
CheckCircle
Route
Bot

Use icons from the existing icon library.

Do not import another icon set without need.

---

# 9. FLOATING ICON BEHAVIOR

Animations should be subtle.

Possible:

slow vertical drift
small rotation
slight scale breathing
parallax on pointer
graph-line connection
hover elevation

Never make all elements move simultaneously at the same speed.

Use multiple animation durations.

Respect:

prefers-reduced-motion.

Disable heavy motion on mobile if necessary.

---

# 10. HERO REWORK

Improve existing hero.

Desktop:

two-column or asymmetric composition.

Left:
headline
description
actions
install command

Right:
interactive graph / intelligence visualization

Surround visualization with subtle floating technical elements.

Example:

```
      [RULE]
         ○
          ╲
```

[CODE] ○ ──── TASK ──── ○ [SKILL]
╲
○
[MEMORY]

Floating around it:

terminal
token metric
runtime status
agent chips

---

# 11. MOBILE HERO

Do not shrink desktop hero.

Recompose it.

Mobile order:

brand/message
headline
description
primary CTA
secondary CTA
install
graph visualization
metrics

Reduce graph complexity.

Reduce floating objects.

Avoid overlapping text.

Ensure visual remains meaningful.

---

# 12. RESPONSIVE GRID SYSTEM

Audit every grid.

Do not use fixed:

grid-cols-3

for all breakpoints.

Use layouts such as:

mobile:
1 column

tablet:
2 columns

desktop:
3/4 columns

For asymmetric product sections, consider:

desktop:
5/7
4/8
7/5

Mobile:
stack.

---

# 13. MODERN SECTION LAYOUTS

Avoid repeating:

heading
paragraph
three cards

for every section.

Create visual variety.

Use:

* asymmetric feature sections
* split-screen demonstrations
* sticky content + scrolling demo
* horizontal product flow
* Bento-style layouts only where useful
* full-width graph areas
* layered terminal/code layouts
* metric strips
* progressive storytelling
* architecture diagrams

Each section should have a distinct reason to exist.

---

# 14. BENTO SYSTEM

Where appropriate create reusable Bento layouts.

Examples:

Large feature:
Context Graph

Small:
Memory

Small:
Rules

Wide:
Context Compiler

Tall:
Agent Compatibility

Do not turn the entire website into Bento cards.

---

# 15. CARD VARIANTS

Create coherent Card variants.

Examples:

default
elevated
glass
outline
interactive
technical
metric
code
terminal
graph

Each should derive from design tokens.

Avoid one-off card styling across pages.

---

# 16. GLASS EFFECTS

Glass should be used sparingly.

Good:

floating navbar
floating context card
overlay inspector

Bad:

every container.

Maintain contrast.

Do not overuse blur.

---

# 17. VISUAL DEPTH

Current UI may feel flat.

Introduce subtle hierarchy using:

* surface layering
* shadows
* borders
* inset highlights
* overlays
* gradients
* lighting
* depth

Keep it technical.

Avoid excessive glow.

---

# 18. BACKGROUND SYSTEM

Create reusable page backgrounds.

Possible variants:

plain
grid
dot-grid
graph
radial
terminal
subtle-noise

Example homepage background:

very subtle technical grid
plus faint graph topology

Docs:

mostly clean.

Graph explorer:

darker/deeper technical canvas.

Do not reduce readability.

---

# 19. NAVBAR DETAILS

Nav links should support:

active state
hover state
keyboard focus
dropdown
mega menu where useful
compact mobile equivalent

Animated active indicator may be used.

Do not overanimate.

---

# 20. NAVBAR MEGA MENUS

For Product:

Context Graph
Context Compiler
Memory
Skills
Rules
Security

For Developers:

CLI
MCP
SDK
Integrations
Architecture
GitHub

Each menu can include:

icon
title
short description

But keep them compact.

---

# 21. SEARCH

Search trigger should feel premium.

Desktop:

[ Search documentation...        ⌘ K ]

Tablet:

search icon + label.

Mobile:

icon.

Global command palette should remain available.

---

# 22. STATUS INDICATORS

Use small technical status components.

Examples:

Runtime connected

● Local Runtime

Index ready

Graph synced

MCP active

Do not fabricate live status if backend is not connected.

Use demo labels where necessary.

---

# 23. TYPOGRAPHY RESPONSIVENESS

Audit headings.

Avoid giant desktop H1 simply scaling down poorly.

Use fluid typography.

Control max-width.

Headline should break intentionally.

Do not use:

text-7xl md:text-8xl

without examining real wrapping.

---

# 24. CODE BLOCKS RESPONSIVENESS

Code snippets must:

scroll horizontally
not overflow page
maintain readable font
retain copy button
show filename sensibly

On mobile:

hide non-essential controls.

---

# 25. DOCS RESPONSIVENESS

Desktop:

left sidebar
content
right TOC

Tablet:

sidebar collapsible
content
optional TOC

Mobile:

top docs bar
navigation drawer
content only
inline/table-of-contents menu

Do not let docs have 3 squeezed columns on tablet.

---

# 26. GRAPH RESPONSIVENESS

Desktop:

sidebar
canvas
inspector

Tablet:

canvas
collapsible sidebar
drawer inspector

Mobile:

canvas
bottom sheet inspector
filter drawer
floating controls

Graph controls should become floating buttons on smaller screens.

---

# 27. FLOATING GRAPH CONTROLS

Mobile/tablet examples:

zoom
reset
filter
search
focus

Use compact round/rounded controls.

Place them safely away from browser UI edges.

---

# 28. BUTTON SYSTEM

Create consistent button sizes:

xs
sm
md
lg

Variants:

primary
secondary
ghost
outline
danger
technical

Add icons deliberately.

Do not use giant CTA buttons everywhere.

---

# 29. RESPONSIVE SPACING

Reduce section padding progressively.

Example concept:

mobile:
py-16

tablet:
py-20

desktop:
py-28

wide:
py-32

Use tokens or utilities instead of hand tuning every route.

---

# 30. MOBILE BOTTOM ACTION BAR

For selected interactive routes, consider a contextual bottom action bar.

Examples:

Graph page:

Search
Filter
Focus

Playground:

Run
Explain
Reset

Do not add this globally.

Only use where useful.

---

# 31. HOVER STATES

Desktop hover states:

cards elevate slightly
graph nodes highlight
nav links animate subtly
icons shift
borders strengthen

On touch devices:

do not depend on hover.

---

# 32. MODERN ICON TREATMENT

Icons should appear in semantic containers.

Examples:

small square
circle
glass capsule
node bubble

Avoid naked identical icons across every card.

---

# 33. DESKTOP WIDE MODE

At 1600–1920px:

Do not simply increase empty margins.

Allow graph / product visualization regions to become wider.

Keep text widths controlled.

Use extra width for visual intelligence rather than stretched paragraphs.

---

# 34. MOBILE TESTING REQUIREMENT

Use Playwright and inspect screenshots at:

320x568
375x667
390x844
430x932
768x1024
1024x768
1280x800
1440x900
1920x1080

Fix:

overflow
clipping
wrapping
overlap
fixed-height issues
tiny touch targets

Do not stop after tests technically pass.

Visually inspect screenshots.

---

# 35. RESPONSIVE BUG HUNT

Search codebase for suspicious patterns:

w-[...]
h-[...]
min-w-[...]
max-w-[...]
absolute
fixed
overflow-hidden
grid-cols-3
grid-cols-4
whitespace-nowrap
translate-x
negative margins

Do not remove them blindly.

Evaluate whether each breaks responsive behavior.

---

# 36. PERFORMANCE

Floating elements should not destroy performance.

Prefer:

CSS transform
opacity

Avoid expensive layout animations.

Avoid large continuous canvas effects unless justified.

Lazy-load complex graph visualization.

Reduce motion/work on mobile.

---

# 37. ACCESSIBILITY

Floating UI must not interfere with:

screen readers
keyboard
text selection
focus order

Decorative elements:

aria-hidden.

Interactive floating controls:

accessible labels.

Maintain AA contrast.

---

# 38. FINAL QUALITY BAR

The UI should no longer feel like:

"desktop layout with breakpoints added later."

It should feel deliberately designed for each form factor.

The homepage should feel memorable.

The navbar should feel premium.

Floating visual elements should reinforce Knovra's intelligence/graph identity.

Docs should remain extremely readable.

Graph explorer should feel like a professional technical tool.

Mobile should feel like its own polished experience.

---

# 39. IMPLEMENTATION STRATEGY

Proceed in this order:

1. Audit responsive problems.
2. Build responsive layout tokens.
3. Refactor container system.
4. Create Navbar component architecture.
5. Implement all navbar variants.
6. Rebuild mobile navigation.
7. Create floating icon/node primitives.
8. Improve hero.
9. Improve global section responsiveness.
10. Improve docs.
11. Improve graph explorer.
12. Improve playground.
13. Test all themes.
14. Run responsive Playwright screenshots.
15. Fix visual issues.
16. Run lint/typecheck/tests/build.

Do not rewrite backend functionality.

Do not delete existing working features.

---

# 40. REPORT BACK

After completion report:

* files modified
* responsive architecture changes
* navbar variants implemented
* floating components added
* breakpoints tested
* routes visually inspected
* accessibility issues fixed
* performance considerations
* remaining known visual issues

Then show which pages received the largest improvements.

Start by auditing the current Knovra UI and fixing the responsive system before adding decorative polish.
