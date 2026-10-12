# Typography and shared UI repair pass

Changed the active product stylesheet rather than adding another override sheet. Workspace titles use Plus Jakarta Sans with a 30–44px fluid scale, 1.2 line height, and less aggressive letter spacing. Graph and Repository no longer use the editorial serif. Homepage emphasis uses the same sans family. Body copy no longer inherits negative tracking, and the global forced paragraph size has been removed so local hierarchies can work. Workspace gutters are fluid and the dark/light surface and text palettes are explicitly defined.

Settings was rebuilt with Radix controls, theme swatches, browser-persisted endpoint preferences, validation feedback, and an actual check of the web health endpoint. It no longer claims that browser controls configure runtime enforcement or that failed probes succeeded. Runtime integration is still outside this page's behavior.

Mobile navigation uses a Radix dialog. The shared Button now forwards its ref for focus restoration. Palette accents track the selected theme; startup defaults agree. Touch hover lift is disabled and reduced-motion rules cover library components. Long library button labels can wrap and legacy input sizing no longer forces oversized nested Radix inputs.

The prior browser checks covered Settings health feedback and modal focus trapping. Persistence reload timing and focus restoration after the final ref fix still need a fresh browser check. The typography build passes, but a final visual comparison across every page is still outstanding. Do not describe this as a completed all-page redesign or a defect-free product.
