---
name: visual-product-qa
description: Audit and repair page-by-page visual quality and interaction regressions in a running website.
---

Read the route inventory and relevant product intent. Inspect rendered pages with the available browser, not source alone. Record route, viewport, state and concrete defect. Compare layout hierarchy, readable typography, contrast, spacing, meaningful empty states and navigation consistency. Use screenshots for visual judgment and DOM measurements for precise overflow diagnosis.
Exercise the changed primary controls. A state setter is not proof an action works. Check overlays, filters, theme changes, graph controls and keyboard behavior where relevant. Distinguish demo data from production integration. Never count placeholder test/lint scripts as tests.
Repair root causes in active components and styles; rebuild and retest the affected states. Preserve user changes. Keep the final report short with evidence and unresolved limitations; never certify a product as perfect or production-ready from UI checks alone.
