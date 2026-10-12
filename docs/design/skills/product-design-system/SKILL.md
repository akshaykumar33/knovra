---
name: product-design-system
description: Build coherent typography, color themes, spacing and component states across multi-page web products.
---

Locate the active stylesheet imports before editing tokens. Define semantic color roles for canvas, surfaces, foreground, muted text, borders and accents. Scope theme overrides to their theme selector; test real computed foreground/background pairs in both light and dark. Avoid competing appended override sheets.
Use a small purposeful type scale: display for editorial emphasis, sans for tasks and reading, mono for code. Check long labels and code paths, not only short headings. Shared shell geometry and component states should be consistent while page layouts follow their content. Extract repeated patterns when it reduces drift; do not migrate every inline style without a reason.
Test hover, keyboard focus, selected, disabled, empty, error and loading states that the task touches. Controls need readable text and an adequate hit area. Preserve established icons and font assets rather than adding redundant libraries.
