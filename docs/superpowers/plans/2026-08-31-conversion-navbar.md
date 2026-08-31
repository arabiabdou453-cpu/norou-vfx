# Conversion Navigation and Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add conversion-focused navigation, social shortcut links, WhatsApp CTA, and footer copyright without changing the existing Framer page identity.

**Architecture:** A dedicated navigation script upgrades the hydrated Framer header and adds stable anchors to existing sections. A companion stylesheet supplies layout, focus, and responsive behavior, while static checks guard the requested content and existing video player behavior.

**Tech Stack:** Static HTML, vanilla JavaScript, CSS, PowerShell static audit.

## Global Constraints

- Keep the site language in English.
- Navigation labels are exactly `Home`, `Work`, `Services`, `About`, and `Contact`.
- CTA label is exactly `Start a Project` and uses the existing project-owned WhatsApp URL.
- WhatsApp and Instagram controls are external links with accessible names and `target="_blank" rel="noopener noreferrer"`.
- Do not add dependencies, analytics, forms, user data, credentials, or runtime URL input.
- Preserve the existing Framer visual identity, portfolio cards, video player, and responsive layout.

---

### Task 1: Add static regression requirements

**Files:**
- Modify: `tests/static-audit.ps1`

**Interfaces:**
- Consumes: `index.html`, `assets/norou-navigation.js`, and `assets/norou-navigation.css`.
- Produces: PASS/FAIL checks for all navigation and footer requirements.

- [ ] **Step 1: Write the failing test**

Add navigation asset variables and these checks to the ordered `$checks` table:

```powershell
'Dedicated navigation enhancement installed' = $html -match 'assets/norou-navigation\.js' -and $navigationScript.Length -gt 0
'Navigation assets are cache-busted' = $html -match 'assets/norou-navigation\.js\?v=20260831' -and $html -match 'assets/norou-navigation\.css\?v=20260831'
'Conversion navigation labels configured' = $navigationScript -match 'Home' -and $navigationScript -match 'Work' -and $navigationScript -match 'Services' -and $navigationScript -match 'About' -and $navigationScript -match 'Contact'
'WhatsApp project CTA configured' = $navigationScript -match 'Start a Project' -and $navigationScript -match 'https://wa\.me/\+97430189870'
'Social navigation links configured' = $navigationScript -match 'https://www\.instagram\.com/norou\.vfx' -and $navigationScript -match 'aria-label'
'Footer copyright configured' = $navigationScript -match '© 2026 Norouvfx\. All rights reserved\.'
'Accessible mobile navigation targets configured' = $navigationStyle -match 'min-width:\s*44px' -and $navigationStyle -match 'min-height:\s*44px'
```

- [ ] **Step 2: Run test to verify it fails**

Run: `powershell -ExecutionPolicy Bypass -File tests/static-audit.ps1`

Expected: FAIL because the navigation assets do not exist or are not referenced.

- [ ] **Step 3: Commit**

No commit: this folder has no Git repository. Keep the test modification for Task 3 verification.

### Task 2: Implement the isolated navigation enhancement

**Files:**
- Create: `assets/norou-navigation.js`
- Create: `assets/norou-navigation.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: Framer header anchors, page section headings, and existing WhatsApp/Instagram URLs.
- Produces: `initializeNavigationEnhancement()` that applies stable section IDs, upgraded navigation, social links, CTA, and copyright idempotently.

- [ ] **Step 1: Write minimal implementation**

Create `assets/norou-navigation.js` with constants for the five labels and approved URLs, then:

```js
const navigationItems = [
  { label: "Home", href: "#home" },
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" }
];

const projectUrl = "https://wa.me/+97430189870";
const instagramUrl = "https://www.instagram.com/norou.vfx";
```

Implement DOM-only helpers that: find the rendered header by its existing Home/About links; replace its links with navigation items once; add two external social anchor buttons and CTA once; set IDs on the existing hero, showreel, service heading, About Me heading, and footer contact area; and append a single copyright paragraph to each rendered footer. Use textContent and DOM methods only; do not interpolate untrusted HTML.

Create `assets/norou-navigation.css` for `.norou-navigation`, `.norou-navigation__social`, `.norou-navigation__cta`, and `.norou-copyright`, including visible `:focus-visible`, 44px minimum mobile controls, `scroll-behavior: smooth`, and a narrow viewport layout that does not overflow.

Load both assets in `index.html` after `norou-player.css` and `norou-player.js`, using `?v=20260831-5`.

- [ ] **Step 2: Run test to verify it passes**

Run: `powershell -ExecutionPolicy Bypass -File tests/static-audit.ps1`

Expected: every existing player check and every new navigation check reports PASS.

- [ ] **Step 3: Commit**

No commit: this folder has no Git repository. Review the exact changed files before delivery.

### Task 3: Verify interaction and responsive behavior

**Files:**
- Verify: `index.html`
- Verify: `assets/norou-navigation.js`
- Verify: `assets/norou-navigation.css`
- Verify: `assets/norou-player.js`

**Interfaces:**
- Consumes: browser at `http://127.0.0.1:8000/`.
- Produces: browser evidence that the new controls work without video regressions.

- [ ] **Step 1: Run static and JavaScript syntax checks**

Run:

```powershell
node --check assets/norou-navigation.js
powershell -ExecutionPolicy Bypass -File tests/static-audit.ps1
```

Expected: both commands exit with code 0.

- [ ] **Step 2: Run browser verification**

At desktop and mobile widths, verify Home, Work, Services, About, and Contact reach their anchors; CTA and social controls have the intended safe URLs; no horizontal scroll is introduced; and opening then closing a portfolio video remains inline and works.

- [ ] **Step 3: Review changed files for sensitive data**

Run: `rg -n -i 'api[_-]?key|secret|password|token|private key' index.html assets/norou-navigation.js assets/norou-navigation.css`

Expected: no credentials or secrets introduced; the fixed public social/contact URLs are the only external destinations added.

- [ ] **Step 4: Commit**

No commit: this folder has no Git repository.
