---
name: responsive-product-layout
description: Repair responsive layouts for dense graphs, tables, documentation, forms and application navigation.
---

Map content priority before choosing breakpoints. Keep the dominant task available on narrow screens. Dense workspaces can stack or use labeled drawers; hide optional decoration rather than core controls. Use minmax(0,1fr), min-width:0 and explicit scroll regions where content requires them.
Measure element bounds as well as document width: overflow-x:hidden can conceal clipping. Inspect actual screenshots around every changed breakpoint, long content, narrow phone widths and a desktop viewport. In flex scroll lists, prevent rows shrinking to unreadable slivers. Graphs need fit-to-canvas, zoom/reset and a readable detail view; do not shrink all text until it technically fits.
Test mobile navigation, focus return, Escape dismissal and drawer scrolling. Restore any temporary browser viewport when done. Report exact checked sizes and limitations rather than claiming universal responsiveness.
