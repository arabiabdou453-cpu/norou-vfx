# Mobile Responsive Repair Implementation Plan

> **For agentic workers:** Execute this plan inline with focused validation after each edit.

**Goal:** Make the mobile portfolio follow the desktop visual language without changing desktop behavior or deploying anything.

**Architecture:** Keep the Framer HTML and existing video logic. Add a scoped mobile-only CSS layer in `index.html`, and adjust the navigation enhancement so no injected/custom navigation is visible below the Framer mobile breakpoint.

**Tech Stack:** Static HTML, vanilla CSS, vanilla JavaScript, PowerShell static audit, local Python HTTP server.

## Global Constraints

- All layout changes must be scoped to `@media (max-width: 809.98px)`.
- Desktop behavior at `min-width: 810px` must remain unchanged.
- No new dependencies and no external upload.
- Preserve existing content, typography, colors, video behavior, and reduced-motion support.

### Task 1: Scope Mobile Navigation

**Files:**
- Modify: `index.html` in the existing critical stability and enhancement styles/scripts.

**Steps:**
- Add mobile-only visibility rules that hide the custom `.norou-navigation` and every Framer `nav` below 810px.
- Keep the existing desktop visibility rules untouched.
- Ensure the mobile enhancement does not add or expose a second navigation layer.
- Run `tests/static-audit.ps1` and confirm no unrelated checks regress.

### Task 2: Normalize Mobile Layout

**Files:**
- Modify: `index.html` in `#norou-quality-fixes`.

**Steps:**
- Add a mobile-only layout layer for viewport width, overflow, safe side gutters, hero text sizing, section spacing, media sizing, service-card stacking, and contact content.
- Use `min-height: 100dvh` only for existing full-height mobile panels.
- Use balanced wrapping and minimum 44px touch targets for interactive controls.
- Keep video frames within their parent card and preserve the existing inline player.

### Task 3: Validate Locally

**Files:**
- No additional source files.

**Steps:**
- Run the static audit.
- Load `http://localhost:4174/index.html` at 375px, 400px, 768px, and a desktop viewport.
- Check document scroll width equals client width at mobile sizes.
- Check mobile nav count is zero and core sections are present.
- Check desktop nav/layout remains present at 1280px.
- Check video play and close controls still operate at a mobile width.
