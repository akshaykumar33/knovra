---
name: purposeful-ui-motion
description: Implement polished interface animation and state transitions with reduced-motion and performance support.
---

Use motion to explain navigation, selection, progress or relationships. Choose a small family of durations and easing curves; use restrained opacity and transform motion. Prefer existing animation tooling or CSS before adding a dependency. Continuous decorative motion must not compete with reading or imply live backend activity.
Preserve reduced-motion behavior and keyboard access. Check fixed-position overlays inside animated ancestors: persistent transforms, filters and containment can change the fixed containing block. Use a portal or release the containing-block styles after animation. Avoid layout-shifting entrance effects, text flicker and hover movement that makes controls hard to target.
Verify the transition itself and the settled state, opening dialogs during/after transitions, navigation back and forward, and narrow viewports. Do not infer a permanently low-contrast UI from a screenshot taken mid-fade.
