# YouTube Player Interaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make every portfolio video start only from its centered YouTube play icon, preserve the current player window size, and provide smooth, reliable playback, fullscreen, exit, and close behavior.

**Architecture:** Keep the exported Framer page unchanged visually and retain the existing lazy YouTube player. Refactor each thumbnail from a full-card button into a passive card with one real play button. Keep exactly one YouTube iframe alive only while the modal is open, and use CSS state transitions for smooth opening and closing.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, PowerShell regression checks, Chrome DevTools.

---

### Task 1: Add regression coverage

**Files:**
- Modify: `tests/static-audit.ps1`

1. Add checks that Framer CSS contains no scientific-notation percentages.
2. Add checks that the video card is passive and the centered play icon is the only button with a click handler.
3. Add checks for modal open-state transitions.
4. Run the audit and confirm the new checks fail before implementation.

### Task 2: Remove the 24 CSS diagnostics

**Files:**
- Modify: `index.html`

1. Replace near-zero scientific-notation gradient percentages with `0%`.
2. Confirm no scientific-notation percentages remain.
3. Re-run the audit.

### Task 3: Refine YouTube interaction

**Files:**
- Modify: `assets/norou-player.js`
- Modify: `assets/norou-player.css`

1. Render each thumbnail as a non-interactive card.
2. Render the centered red YouTube icon as the sole play button.
3. Preserve the current modal dimensions and fullscreen implementation.
4. Add smooth open/close and button focus/hover transitions.
5. Keep immediate iframe destruction on close so audio cannot resume.

### Task 4: Static verification

**Files:**
- Test: `tests/static-audit.ps1`
- Test: `assets/norou-player.js`

1. Run the PowerShell audit and require every check to pass.
2. Run `node --check assets/norou-player.js`.
3. Confirm the local site returns HTTP 200.

### Task 5: Browser verification

**Files:**
- Test: `http://127.0.0.1:8000/`

1. Confirm no YouTube iframe or network request exists before a play-icon click.
2. Confirm clicking outside the play icon does nothing.
3. Confirm clicking the icon opens one iframe in the unchanged modal size.
4. Confirm fullscreen entry and exit, close, and next/previous controls work.
5. Confirm closing destroys the iframe and playback does not return after waiting.
6. Repeat at a mobile viewport and inspect relevant console errors.

**Note:** This workspace is not a Git repository, so commit steps are unavailable.
