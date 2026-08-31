# Conversion Navigation and Footer Design

## Goal

Make the portfolio easier to navigate and contact from without changing its dark Framer visual identity. Add a clear desktop and mobile navigation, social shortcuts, a project-start CTA, and a copyright line.

## Approved Navigation

- Keep the site language in English to match the existing content.
- Use five in-page links: `Home`, `Work`, `Services`, `About`, and `Contact`.
- Add a prominent `Start a Project` CTA that opens the existing WhatsApp contact in a new tab with `noopener` protection.
- Add compact WhatsApp and Instagram icon links beside the CTA. Each receives an accessible English label and safe external-link attributes.
- Existing Home and About links are upgraded rather than duplicated.
- Every link scrolls smoothly to a real section anchor; Home returns to the hero.

## Responsive Behavior

- Desktop: full navigation, social icon buttons, and CTA remain in one header row without visual crowding.
- Mobile: navigation remains reachable, wraps or scrolls safely as needed, and keeps all controls at least 44 by 44 CSS pixels.
- The existing Framer header, logo, colors, spacing, and animation are preserved as the visual baseline.

## Footer

- Add `© 2026 Norouvfx. All rights reserved.` in the footer.
- The contact anchor points to the existing email/WhatsApp contact area, without altering the user’s contact information.

## Implementation Boundaries

- Create isolated navigation CSS and JavaScript assets, loaded after the current player assets.
- The script locates existing named page sections, assigns stable IDs, and upgrades the rendered Framer navigation after hydration.
- No external dependency, analytics, form, user data, or credential is introduced.
- External links are fixed project-owned WhatsApp and Instagram URLs; no user-provided URL is accepted at runtime.

## Error Handling and Accessibility

- If a responsive Framer header is re-rendered, a mutation observer re-applies the enhancement without adding duplicate controls.
- Icons have accessible names, keyboard focus rings, and preserve the external-link destination.
- Missing target sections do not create broken links; the enhancement waits until each target is available.
- Respect the existing reduced-motion behavior.

## Verification

- Static audit asserts asset references, exact navigation labels, stable anchors, social URLs, CTA destination, and copyright text.
- Browser checks confirm every desktop and mobile navigation item reaches the intended section; WhatsApp and Instagram links retain safe external-link attributes.
- Check a narrow mobile viewport for no horizontal overflow and usable controls.
- Re-run the existing player regression audit so navigation changes do not affect video playback.

## Scope

Only header navigation, social shortcut controls, CTA wording, and copyright are changed. Existing page content, videos, layout, and visual identity remain intact.
