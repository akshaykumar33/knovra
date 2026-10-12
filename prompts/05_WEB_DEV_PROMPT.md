# KNOVRA — PREMIUM WEB, DOCUMENTATION & DEVELOPER EXPERIENCE

You are working inside the existing **Knovra** monorepo.

Your responsibility is to design and implement an exceptionally polished, modern, responsive, production-grade public web experience for Knovra.

Do NOT create a generic SaaS landing page.

Do NOT create a template-looking Tailwind website.

Do NOT blindly copy Stripe, Vercel, Linear, GitHub, Supabase, shadcn/ui, Raycast, Resend, Tailwind, Mintlify, or any other product.

Study the design principles that make world-class developer products feel premium, then create an original Knovra visual language.

The result should feel like a serious developer infrastructure company capable of competing with the best developer tools in the world.

---

# 1. PRODUCT CONTEXT

Knovra is a:

**Local-first Project Intelligence Runtime for AI Agents.**

It provides a shared intelligence layer between software repositories and AI development tools.

Conceptually:

Repository

→ Repository Intelligence

→ Context Graph

→ Rules

→ Skills

→ Memory

→ Context Compiler

→ Task Planner

→ Tool / Model Router

→ Codex / Claude / Gemini / Local Models

→ Validation

→ Learning

Knovra is NOT another AI chatbot.

Knovra is infrastructure.

The visual design must communicate:

* intelligence
* precision
* engineering depth
* trust
* performance
* observability
* interconnected systems
* local-first architecture
* developer control
* transparency

---

# 2. TECHNOLOGY

Use the existing repository architecture where appropriate.

For the web application prefer:

* Next.js latest stable App Router
* React
* TypeScript strict mode
* Tailwind CSS
* shadcn/ui primitives where useful
* Radix primitives where appropriate
* Motion / Framer Motion for meaningful animation
* Lucide icons
* MDX for documentation
* Shiki for syntax highlighting
* Mermaid only where useful
* React Flow or a performant equivalent for interactive graph visualization
* cmdk for command palette
* appropriate accessible tooltip/popover/dialog primitives

Use Server Components by default.

Use Client Components only where interactivity requires them.

Do NOT make the whole application client-side.

Do NOT add libraries merely because they appear in this prompt.

Inspect existing dependencies first.

Reuse appropriate infrastructure.

---

# 3. DESIGN PHILOSOPHY

The site should feel:

Premium.

Technical.

Calm.

Dense when useful.

Minimal when appropriate.

Highly interactive without becoming distracting.

Think about the quality bar associated with excellent developer products and documentation platforms.

Learn from:

* Stripe documentation information architecture
* Vercel developer experience
* Linear interaction polish
* GitHub information density
* Supabase documentation usability
* shadcn documentation clarity
* Tailwind documentation navigation
* Raycast interaction quality
* Resend simplicity

But DO NOT copy layouts, branding, illustrations, exact colors, components, or wording.

Create an original Knovra system.

---

# 4. KNOVRA VISUAL LANGUAGE

Knovra should visually represent interconnected intelligence.

Possible motifs:

nodes
edges
graphs
signals
context paths
execution traces
knowledge layers
terminal output
dependency trees
topology
data flow
agent connections

Avoid generic:

AI brain graphics
robot illustrations
floating gradient blobs everywhere
random stars
generic AI sparkles
stock photography
huge meaningless 3D objects

Graph/network visuals should have semantic meaning whenever possible.

---

# 5. MULTI-THEME SYSTEM

This is mandatory.

Do NOT provide only light/dark mode.

Create a proper theme architecture.

Initial themes:

1. Knovra Light
2. Knovra Dark
3. Midnight
4. Graphite
5. Aurora
6. Terminal

All themes must derive from semantic design tokens.

Example tokens:

--background
--surface
--surface-elevated
--surface-muted

--foreground
--foreground-muted
--foreground-subtle

--border
--border-strong

--primary
--primary-hover

--accent
--success
--warning
--danger
--info

--code-background
--code-foreground

--graph-node
--graph-edge
--graph-active
--graph-selected

Do not scatter hard-coded colors throughout components.

Themes must support every surface:

marketing
docs
dashboard
graph
code blocks
terminal
search
dialogs
navigation

Persist theme preference.

Respect system theme initially where appropriate.

Prevent theme hydration flashes.

---

# 6. TYPOGRAPHY

Typography should feel excellent.

Create clear scales for:

display
h1
h2
h3
h4
body
small
caption
label
code

Use a professional sans-serif plus dedicated monospace font.

Optimize:

line height
letter spacing
paragraph width
documentation readability
code readability

Documentation text should never become excessively wide.

---

# 7. GLOBAL APPLICATION STRUCTURE

Build a unified shell capable of supporting:

/
Product
Docs
Developers
Graph
Playground
Benchmarks
Pricing
Changelog
Blog
About

Future authenticated sections:

/app
/projects
/graph
/runs
/context
/skills
/memory
/settings

Do not necessarily implement every backend feature now.

But architect navigation and layouts so they can evolve naturally.

---

# 8. NAVBAR

Create an excellent developer-product navbar.

Desktop:

Knovra logo

Product
Docs
Developers
Graph
Benchmarks
Pricing

GitHub

Search

Theme selector

Sign in

Get Started

Navbar behavior:

sticky
subtle translucency when appropriate
proper blur
responsive
keyboard accessible

Product/Developer sections may use polished mega menus.

Avoid huge dropdowns containing filler.

---

# 9. COMMAND PALETTE

Global shortcut:

Cmd/Ctrl + K

Search across:

documentation
commands
concepts
API
SDK
configuration
navigation

Example results:

Context Graph

Context Compiler

Skills

Memory

MCP

Provider Configuration

ctx init

ctx graph

ctx context

Eventually search should support semantic results.

For v1 implement excellent local docs search.

---

# 10. HOMEPAGE

The homepage must immediately communicate what Knovra does.

Potential conceptual copy:

KNOVRA

Your project already knows the answer.
Give that understanding to every agent.

Alternative:

Project intelligence for every AI agent.

Supporting idea:

Knovra builds a persistent context graph of your repository and gives Codex, Claude, Gemini and other agents only the context they actually need.

Do not blindly use this exact copy if stronger wording emerges.

---

# 11. HERO EXPERIENCE

The hero must be interactive rather than simply decorative.

Potential layout:

LEFT

headline

description

Get Started
View on GitHub

install command

RIGHT

interactive Context Graph visualization.

Example graph:

Task
"Change assessment permissions"

→ AssessmentController

→ AssessmentService

→ AssessmentRepository

→ TenantIsolationRule

→ tenant-safe-query skill

Nodes should animate subtly.

Edges may communicate traversal.

Hover node:

display metadata.

Click node:

show context reason.

Example:

AssessmentRepository

Selected because:
DIRECT_TASK_DEPENDENCY

TenantIsolationRule

Selected because:
CRITICAL_POLICY

This immediately demonstrates the product.

---

# 12. INSTALL COMPONENT

Beautiful reusable installation component.

Tabs:

npm
Homebrew
Shell
Docker

Potential examples:

npx knovra init

brew install knovra

curl ...

Do not show installation methods that do not actually exist yet.

Mark future methods appropriately or hide them.

Provide copy button.

Provide success feedback.

---

# 13. INTERACTIVE PRODUCT DEMO

Create a visual demo:

Developer enters:

"Change assessment permissions"

Animation:

1. Task analyzed
2. Domain identified
3. Graph traversed
4. Rules discovered
5. Skills selected
6. Context compiled
7. Agent receives ContextBundle
8. Validation executed

Then display:

Candidate context
318k tokens

Knovra context
14.6k tokens

Files considered
2,412

Files selected
6

Rules selected
3

These numbers MUST be labeled as illustrative demo values unless backed by actual benchmark data.

Never present invented numbers as production benchmark results.

---

# 14. CONTEXT GRAPH EXPLORER

This should become one of Knovra's signature UI experiences.

Route:

/graph

Layout:

LEFT SIDEBAR

Repository tree

domains
packages
services
files
rules
skills
memory

CENTER

large interactive graph canvas

RIGHT INSPECTOR

selected node information.

TOP TOOLBAR

Search
Filters
Layout
Depth
Node types
Edge types
Reset
Focus mode

Possible node categories:

File
Function
Class
API
Service
Database
Rule
Skill
Decision
Test
Task

Edges:

CALLS
IMPORTS
DEPENDS_ON
TESTED_BY
GOVERNED_BY
QUERIES
IMPLEMENTS
LEARNED_FROM

Graph must support:

zoom
pan
selection
focus
neighborhood expansion
breadcrumbs
keyboard controls
filtering
search
minimap where appropriate

Performance matters.

Do not render thousands of DOM nodes unnecessarily.

---

# 15. CONTEXT EXPLAINER

Create:

/playground/context

Input:

"Implement assessment pagination"

Display pipeline:

TASK

↓

DOMAIN

↓

GRAPH TRAVERSAL

↓

RULE RETRIEVAL

↓

SKILL RETRIEVAL

↓

CONTEXT COMPILER

↓

CONTEXT BUNDLE

Allow developer to inspect:

selected nodes
rejected nodes
rules
skills
source snippets
token estimate
selection reasoning

This is important.

Knovra must make AI context transparent.

---

# 16. DOCUMENTATION EXPERIENCE

Docs should be exceptional.

Route:

/docs

Desktop layout:

LEFT
documentation navigation

CENTER
documentation content

RIGHT
table of contents

TOP
search

BOTTOM
previous / next navigation

Support:

deep links
heading anchors
copy heading URL
code highlighting
code line highlighting
code filenames
copy buttons
tabbed code examples
callouts
notes
warnings
tips
tables
diagrams
step sequences
API references
CLI references

---

# 17. DOCUMENTATION INFORMATION ARCHITECTURE

Create initial categories:

GETTING STARTED

Introduction
Why Knovra
Installation
Quick Start
Core Concepts

PROJECT INTELLIGENCE

Repository Indexing
Context Graph
Code Graph
Architecture Graph
Data Graph
Policy Graph
Knowledge Graph
Historical Graph

CONTEXT ENGINE

Task Analysis
Context Planning
Retrieval
Context Compiler
Context Escalation
Context Explainability

KNOWLEDGE

Rules
Skills
Memory
Decisions
Learning Loop

AGENTS

Codex
Claude Code
Gemini
MCP
Local Models

CLI

ctx init
ctx index
ctx status
ctx graph
ctx context
ctx doctor
ctx skills
ctx memory

CONFIGURATION

Project Configuration
Ignore Rules
Security
Providers
Local Storage

ADVANCED

Architecture
Performance
Caching
Incremental Indexing
Security Model
Telemetry

REFERENCE

CLI Reference
Configuration Reference
ContextBundle
Graph Schema
MCP Tools

CONTRIBUTING

Development
Architecture
Testing
Benchmarks

Use actual implemented command naming from the repository rather than blindly using ctx versus knovra.

---

# 18. DOCS CODE BLOCKS

Code blocks must feel first-class.

Features:

syntax highlighting
filename
copy
line numbers where useful
highlighted lines
diff rendering
terminal mode

Example:

$ knovra init

✓ Repository detected
✓ TypeScript detected
✓ 1,842 files scanned
✓ 9,214 symbols indexed
✓ 14,631 graph relationships
✓ Project intelligence ready

Demo values must be clearly marked when not generated by real Knovra output.

---

# 19. DOCS INTERACTIVE GRAPH

Documentation pages describing graphs should have embedded interactive diagrams.

Example:

AssessmentController
↓ CALLS
AssessmentService
↓ USES
AssessmentRepository
↓ QUERIES
assessment_table
↓ GOVERNED_BY
TenantIsolationRule

Hover relationships to explain their meaning.

---

# 20. ARCHITECTURE PAGE

Create a premium architecture visualization.

Show:

IDE / Agent

↓

MCP / SDK / CLI

↓

Knovra Local Runtime

↓

Task Analyzer

↓

Context Planner

↓

Context Graph

↓

Context Compiler

↓

Router

↙              ↓             ↘

Static Tool    Local LLM    External LLM

↓

Validator

↓

Memory / Skills

The architecture visualization should adapt well to mobile.

---

# 21. PROVIDER PAGE

Show provider independence.

Possible cards:

OpenAI / Codex
Anthropic / Claude
Google / Gemini
Ollama
Local models
MCP clients

Explain:

Bring Your Own Keys.

Keys remain local by default.

Do NOT imply partnerships or endorsements.

---

# 22. LOCAL-FIRST PAGE

This is a major selling point.

Explain visually:

CUSTOMER MACHINE

Repository

↓

Knovra

├ Context Graph
├ Skills
├ Memory
├ Rules
├ Cache
└ Provider Keys

↓

Selected AI Provider

Contrast with:

Knovra Cloud

accounts
teams
billing
optional synchronization

Source code should not require Knovra Cloud.

---

# 23. BENCHMARK PAGE

Create:

/benchmarks

Eventually compare:

baseline context
Knovra compiled context

Metrics:

candidate tokens
compiled tokens
retrieval latency
context compilation latency
task success
validation success
LLM calls avoided

Never fabricate benchmark results.

If real benchmark data does not exist, show:

"Benchmark suite coming soon"

or clearly labelled demo data.

---

# 24. CLI DOCUMENTATION

CLI reference should be beautiful and searchable.

Example:

knovra init

Description

Options

Examples

Output

Related commands

Every command should support deep linking.

---

# 25. API / SDK DOCUMENTATION

Prepare documentation architecture for future SDKs:

Go
TypeScript
Python

Example conceptual API:

client.Context(ctx, task)

ContextBundle

GraphQuery

Skill

Rule

Memory

Do not document APIs as stable if they don't exist.

Clearly identify experimental APIs.

---

# 26. CHANGELOG

Create a polished changelog experience.

Versions.

Dates.

Categories:

Added
Changed
Fixed
Security
Performance

Support deep links to releases.

---

# 27. BLOG / ENGINEERING

Prepare a strong technical publication section.

Potential topics:

Why Context Is the Bottleneck

Building a Context Graph

Why Vector Search Alone Isn't Enough

Minimum Sufficient Context

Building Agent-Agnostic Project Intelligence

Local-First AI Infrastructure

Do not generate dozens of fake articles.

Create architecture and a small number of quality placeholders only where appropriate.

---

# 28. MOBILE EXPERIENCE

Mobile must NOT be desktop compressed onto a phone.

Design intentionally.

Navbar becomes compact.

Docs sidebar becomes drawer.

TOC becomes accessible menu.

Graph explorer receives dedicated mobile controls.

Code blocks scroll correctly.

Tables have usable overflow.

Touch targets meet accessibility requirements.

Dialogs fit viewport.

No horizontal page overflow.

Test:

320px
375px
390px
430px
768px
1024px
1440px
1920px

---

# 29. MOTION

Use motion carefully.

Good:

graph traversal
node selection
accordion
navigation transition
copy confirmation
theme change
command palette
progressive pipeline visualization

Bad:

everything floating
continuous distracting animation
huge parallax
scroll hijacking
cursor effects
meaningless glowing blobs

Respect:

prefers-reduced-motion.

---

# 30. MICRO-INTERACTIONS

High-quality small interactions matter.

Buttons:
subtle tactile feedback.

Copy:
icon → success state.

Tabs:
smooth indicator.

Navigation:
clear active states.

Graph:
hover relationships.

Docs headings:
anchor appears appropriately.

Search:
keyboard navigation.

Theme:
smooth but fast transition.

Tooltips:
short delay.

Skeletons:
only where actual asynchronous loading occurs.

---

# 31. ACCESSIBILITY

Target WCAG 2.2 AA.

Requirements:

semantic HTML
keyboard navigation
visible focus
screen reader labels
proper landmarks
contrast
reduced motion
dialog focus trapping
escape handling
skip navigation
accessible graph alternatives

Graph information must not be available exclusively through visuals.

Provide textual relationship views.

---

# 32. PERFORMANCE

The premium experience must remain fast.

Target excellent Core Web Vitals.

Use:

Server Components
static generation
streaming
route-level loading
font optimization
image optimization
dynamic import for heavy graph libraries
code splitting

Do NOT load graph visualization libraries on documentation pages that don't use graphs.

Avoid hydration-heavy architecture.

Avoid giant JS bundles.

Measure bundle sizes.

---

# 33. SEO

Public pages need proper:

metadata
canonical URLs
OpenGraph
Twitter cards
sitemap
robots
structured data where appropriate

Docs pages should generate metadata from content.

---

# 34. COMPONENT SYSTEM

Build reusable primitives.

Potential structure:

components/
ui/
layout/
marketing/
docs/
code/
graph/
terminal/
search/
command/
metrics/
navigation/

Avoid giant page components.

Avoid unnecessary abstraction too.

---

# 35. GRAPH DESIGN SYSTEM

Create semantic visual treatment for graph node types.

Examples:

CODE
File
Function
Class

ARCHITECTURE
Service
API
Database

POLICY
Rule
Permission

KNOWLEDGE
Skill
Decision
Memory

EXECUTION
Task
Run
Failure

Node shape/icon/treatment should communicate category.

Do not rely solely on color.

---

# 36. PREMIUM EMPTY STATES

Do not use:

"No data."

Create useful empty states.

Example:

No context graph yet.

Run:

knovra init

Then:

knovra index

to build your project's intelligence graph.

---

# 37. ERROR STATES

Errors must be useful.

Instead of:

Something went wrong.

Use:

Graph unavailable

The local Knovra runtime could not be reached.

Check:

knovra status

[Retry]

---

# 38. LOADING

Avoid giant centered spinners.

Use:

skeleton
progress
streaming
partial rendering

For indexing:

Scanning repository
Parsing symbols
Building relationships
Extracting rules
Finalizing graph

Display real progress when backend supports it.

---

# 39. VISUAL QUALITY CHECK

Before declaring completion inspect every major route at:

mobile
tablet
desktop
wide desktop

Check:

spacing
alignment
typography
contrast
overflow
navigation
focus
hover
loading
errors
empty states
themes

Do not consider "build passes" equivalent to "design is finished."

---

# 40. TESTING

Add appropriate:

unit tests
component tests
accessibility tests
Playwright E2E

Critical E2E flows:

homepage
docs navigation
docs search
theme switching
command palette
mobile navigation
graph explorer
context playground

Take screenshots during Playwright development where useful and visually inspect them.

---

# 41. THEME TEST MATRIX

Test every major surface under every theme.

Light
Dark
Midnight
Graphite
Aurora
Terminal

Check:

homepage
docs
code
terminal
graph
dialogs
search
forms

No theme should look like an afterthought.

---

# 42. ORIGINALITY REQUIREMENT

The final product must NOT look like:

"Vercel clone"

"Linear clone"

"Stripe docs clone"

"generic shadcn dashboard"

"AI-generated landing page"

Use inspiration at the interaction and information-architecture level.

Knovra must develop its own recognizable identity.

The Context Graph should strongly contribute to that identity.

---

# 43. PRODUCT EXPERIENCE TARGET

A developer landing on Knovra should experience:

Landing page
↓
Understand concept within seconds
↓
See Context Graph working
↓
Try interactive context demo
↓
Read architecture
↓
Open docs
↓
Copy installation command
↓
Run Knovra locally
↓
Explore their own Context Graph

The website should teach the product by demonstrating it.

---

# 44. IMPLEMENTATION ORDER

Do NOT attempt everything simultaneously.

PHASE 1 — FOUNDATION

Audit current web application.

Implement:

design tokens
theme architecture
typography
layout primitives
navbar
footer
responsive system
motion primitives
accessibility foundation

PHASE 2 — PREMIUM HOMEPAGE

Implement:

hero
interactive graph
product explanation
architecture
local-first section
agent/provider section
context compiler demonstration
CTA

PHASE 3 — DOCS ENGINE

Implement:

MDX
navigation
TOC
search
code blocks
callouts
tabs
previous/next
deep linking

PHASE 4 — GRAPH EXPLORER

Implement:

interactive graph
filters
search
inspector
focus
relationship exploration

PHASE 5 — CONTEXT PLAYGROUND

Implement:

task input
context traversal
selected context
selection explanation
ContextBundle view

PHASE 6 — DEVELOPER PAGES

CLI
architecture
providers
MCP
SDK
security
local-first

PHASE 7 — QUALITY

responsive audit
accessibility
performance
SEO
Playwright
theme testing
visual QA

---

# 45. BEFORE CODING

FIRST inspect:

apps/web
shared packages
existing design system
Tailwind configuration
existing dependencies
current routes
current branding
existing Knovra functionality

Do not destroy working functionality.

Create a short implementation plan based on actual repository state.

Then proceed autonomously.

---

# 46. IMPORTANT

Do not stop after creating scaffolding.

Do not leave every page as TODO.

Do not fill the product with fake data pretending to be real.

Do not introduce broken navigation.

Do not create buttons that do nothing without communicating their state.

Do not add fake testimonials.

Do not add fake customer logos.

Do not claim fake benchmarks.

Do not claim fake GitHub stars.

Do not claim fake enterprise customers.

The product should look premium because of engineering and design quality, NOT fabricated social proof.

---

# 47. FINAL EXPECTATION

The resulting Knovra website should feel like a product developers remember.

The signature experience should be:

```
          TASK

           ↓

    CONTEXT GRAPH

 ╱      │       ╲
```

CODE    RULES    SKILLS

```
 ╲      │       ╱

    CONTEXT COMPILER

           ↓

      AI AGENT

           ↓

      VALIDATION

           ↓

  PROJECT KNOWLEDGE
```

Use this concept throughout the visual language without making every page repetitive.

Build Knovra as a world-class developer infrastructure website, documentation platform and interactive project-intelligence showcase.

Begin by auditing the existing web application and design system, then implement Phase 1 and continue through the phases in coherent, tested vertical slices.
