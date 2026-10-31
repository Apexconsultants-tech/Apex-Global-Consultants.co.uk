# Brand palette

Every colour is measured from the logo file `src/assets/brand/apex-logo.png` (the "Apex Global
Consulting Services" logo, which matches the legal name). Tokens live in `src/styles/base.css`
(`@theme`). No colour outside this table may be used, except the official software logos,
which must stay in their owners' colours.

| Role | Token | Hex | Taken from | Use |
|---|---|---|---|---|
| Primary | `primary` | #13B5EA | Wordmark sky blue (largest area of the logo) | Fills, lines, icons on deep blue. Never text on white |
| Primary (text shade) | `primary-deep` | #05458C | Roof of the icon, deep end of its gradient | Headings, links, main buttons |
| Secondary | `secondary` | #39B304 | Tagline green | Fills, ticks, lines. Never text on white |
| Secondary (text shade) | `secondary-deep` | #18650A | Base of the icon, deep end of its gradient | Small labels, eyebrows |
| Accent | `accent` | #93D61D | Icon lime, the brightest logo shade | Buttons and highlights, dark text only |
| Tint 5% | `tint-5` | #F3FBFE | Primary at 5% on white | Section backgrounds |
| Tint 10% | `tint-10` | #E7F8FD | Primary at 10% | Section backgrounds, footer |
| Tint 20% | `tint-20` | #D0F0FB | Primary at 20% | Borders, footer gradient |
| Neutral | `white` / `offwhite` | #FFFFFF / #F7F9FA | | Page backgrounds |
| Neutral | `ink` | #1E2A35 | | Body text |
| Neutral | `muted` | #4A5763 | | Secondary text |

## WCAG 2.2 AA contrast (4.5:1 normal text, 3:1 large text and UI)

| Foreground on background | Ratio | Result |
|---|---|---|
| ink #1E2A35 on white | 14.61:1 | Pass (AAA) |
| primary-deep #05458C on white | 9.39:1 | Pass (AAA) |
| white on primary-deep (buttons, deep-blue sections) | 9.39:1 | Pass (AAA) |
| muted #4A5763 on white | 7.41:1 | Pass (AAA) |
| secondary-deep #18650A on white | 7.23:1 | Pass (AAA) |
| ink on accent #93D61D (lime buttons) | 8.26:1 | Pass (AAA) |
| primary-deep on accent | 5.31:1 | Pass (AA) |
| ink on primary #13B5EA (button hover) | 6.14:1 | Pass (AA) |
| primary-deep on tint-20 | 7.84:1 | Pass (AAA) |
| muted on tint-10 | 6.79:1 | Pass (AA) |
| primary #13B5EA on white | 2.38:1 | **Fail for text**: decoration only |
| secondary #39B304 on white | 2.75:1 | **Fail for text**: decoration only |

Hero text sits on a deep-blue veil at 82 to 92% opacity, so white text stays above 7:1 even over
the brightest video frame.

## Logo

Transparent PNG, trimmed, no white fringe (checked: 0 opaque-white pixels, 0 light edge pixels).
Always shown in its original colours on white or a very light tint, never boxed, recoloured or
stretched (`src/components/ui/Logo.astro` sizes it by width and keeps the 1080:148 ratio).

## Typography (depends on the chosen concept)

- Concept A "Horizon": Source Serif 4 (headings) + Inter (body). Two files.
- Concept B "Summit": Plus Jakarta Sans for everything. One file.

All SIL Open Font Licence, self-hosted, latin subset, `font-display: swap`, one preload.
