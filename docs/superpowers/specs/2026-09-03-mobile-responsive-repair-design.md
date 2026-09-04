# Mobile Responsive Repair Design

## Goal

Repair the mobile presentation so it follows the desktop portfolio's visual language and content order while remaining responsive. Desktop behavior must remain unchanged, and no deployment is part of this work.

## Scope

- Apply mobile-only overrides at the existing Framer mobile breakpoint (`max-width: 809.98px`).
- Hide both the custom navigation and the rendered Framer mobile navigation.
- Preserve the existing hero, work, services, about, and contact content.
- Normalize mobile section widths, horizontal padding, vertical spacing, typography, buttons, media frames, and video cards.
- Prevent horizontal overflow and clipped text.
- Preserve the existing dark canvas, Syne/Inter typography, violet accent, video behavior, and reduced-motion support.
- Leave all `min-width: 810px` rules and desktop markup behavior unchanged.

## Approach

Use targeted CSS in the existing `norou-quality-fixes` style block and a small mobile guard in the existing enhancement script only where the current navigation enhancement would otherwise expose desktop-style navigation on a phone. Do not replace the Framer page or add dependencies.

The mobile CSS will establish a consistent content gutter, constrain full-width sections, use `min-height: 100dvh` where a viewport-height panel is already present, make headings wrap with balanced line lengths, and keep buttons and video controls touch-friendly. It will also disable mobile-only animation instability where the existing Framer appear effects cause blank or displaced content, while retaining the desktop effects.

## Responsive Rules

- At 375px, 400px, and 768px there must be no horizontal scrollbar.
- Content and controls must remain inside the viewport with safe side padding.
- The hero must show its heading, supporting copy, and primary action without overlap.
- Work media and inline video players must fit their cards without distortion or overflow.
- Service cards and contact content must stack vertically and remain readable.
- No navbar is visible on mobile.

## Validation

- Run the existing static audit.
- Load the local page at 375px, 400px, 768px, and a desktop width.
- Confirm no horizontal overflow at mobile widths.
- Confirm no mobile navbar is visible.
- Confirm hero, work, services, about, and contact are present and visually laid out.
- Confirm desktop computed layout remains unchanged by the mobile-only rules.
- Confirm video play and close controls still work on mobile.

## Non-goals

- No upload to Netlify, GitHub, or any external service.
- No desktop redesign.
- No content rewrite.
- No new framework or dependency.
