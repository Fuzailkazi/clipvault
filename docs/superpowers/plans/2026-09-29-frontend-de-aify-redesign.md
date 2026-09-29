# Frontend De-AIfy & Linear Precision Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the ClipVault frontend to eliminate all generic "AI slop" aesthetics (radial grid masks, spinning SVG border buttons, rainbow gradients, and generic cards) and transform it into a polished, high-density, handcrafted developer/curator tool inspired by Linear and Raycast.

**Architecture:** 
- Clean up base CSS tokens to use a matte zinc palette with razor-sharp 1px borders.
- Introduce `CommandPalette` (`⌘K`) for global keyboard-first search and navigation.
- Implement dual view modes: Bento Grid view and High-Density List view (`BookmarkListItem`), persisted in `localStorage`.
- Elevate cards with real website favicons (`Google Favicon API` with fallback), crisp category badges, and relative timestamps.
- Redesign `Navbar`, `QuickPaste`, `TagFilter`, and `ChatDrawer` to match the Linear precision aesthetic.

**Tech Stack:** React 19, TypeScript 5.7, Tailwind CSS 3.4, Lucide React, Framer Motion 12.

---

### Task 1: Clean Up Styling Base & Surfaces

**Files:**
- Modify: `frontend/src/main.css`
- Modify: `frontend/src/components/ui/background-grid.tsx`

- [ ] **Step 1: Update `main.css` to clean, crisp zinc tokens**
Replace generic grid pattern with modern matte neutral background variables and clean borders.

- [ ] **Step 2: Update `background-grid.tsx`**
Remove the distracting radial grid mask. Replace with an ultra-subtle, clean background surface with optional micro-gradient.

- [ ] **Step 3: Verify build**
Run: `cd frontend && npm run build`
Expected: Build passes.

---

### Task 2: Build `CommandPalette` Component

**Files:**
- Create: `frontend/src/components/CommandPalette.tsx`

- [ ] **Step 1: Create `CommandPalette`**
Implement a modal dialog activated by `⌘K` or search click:
- Search input with instant auto-focus.
- Results list for bookmarks with favicon, title, and category badge.
- Quick filter action chips (e.g., `#dev`, `#ai`, `#design`).
- Keyboard navigation (Arrow keys, Enter to open, Esc to close).

- [ ] **Step 2: Verify build**
Run: `cd frontend && npm run build`
Expected: Passes typecheck.

---

### Task 3: Build `BookmarkListItem` (High-Density List View)

**Files:**
- Create: `frontend/src/components/BookmarkListItem.tsx`

- [ ] **Step 1: Create `BookmarkListItem`**
Create a single-row list item for power users:
- Domain favicon (`https://www.google.com/s2/favicons?domain=<host>&sz=32`) with fallback.
- Title and domain hostname.
- Clean category pill (e.g. `DOCS`, `REPO`, `TOOL`).
- Tag pills.
- Relative date formatting (`Today`, `Yesterday`, etc.).
- Quick copy and delete action icons that reveal smoothly on hover.

- [ ] **Step 2: Verify build**
Run: `cd frontend && npm run build`
Expected: Passes typecheck.

---

### Task 4: Refactor `BookmarkCard` to Linear Precision

**Files:**
- Modify: `frontend/src/components/BookmarkCard.tsx`

- [ ] **Step 1: Overhaul `BookmarkCard`**
- Remove dependency on generic glowing borders from `HoverCard`.
- Add real domain favicon next to domain name and category badge.
- Enhance typography: high-contrast title, 2-sentence summary with relaxed line-height.
- Add relative date formatting.
- Clean up action buttons (copy, delete) with tactile tooltips/states.

- [ ] **Step 2: Verify build**
Run: `cd frontend && npm run build`
Expected: Passes typecheck.

---

### Task 5: Upgrade `BookmarkFeed` for Dual Views

**Files:**
- Modify: `frontend/src/components/BookmarkFeed.tsx`

- [ ] **Step 1: Add `viewMode` support to `BookmarkFeed`**
- Accept `viewMode: 'grid' | 'list'`.
- In `'grid'` mode, render responsive grid with `BookmarkCard`.
- In `'list'` mode, render compact vertical list with `BookmarkListItem`.
- Update empty state and skeleton loaders to match the Linear precision aesthetic.

- [ ] **Step 2: Verify build**
Run: `cd frontend && npm run build`
Expected: Passes typecheck.

---

### Task 6: Modernize `Navbar`

**Files:**
- Modify: `frontend/src/components/Navbar.tsx`

- [ ] **Step 1: Redesign `Navbar`**
- Add monogram logo (`CV`) with subtle 1px border.
- Add `⌘K` search trigger pill button.
- Add View Switcher toggle (`Grid` / `List`).
- Modernize "Ask AI" button into a sleek pill with subtle sparkle icon (no spinning SVG border).
- Polish theme toggle and auth state buttons.

- [ ] **Step 2: Verify build**
Run: `cd frontend && npm run build`
Expected: Passes typecheck.

---

### Task 7: Modernize `QuickPaste`

**Files:**
- Modify: `frontend/src/components/QuickPaste.tsx`

- [ ] **Step 1: Redesign `QuickPaste` into a sleek command bar**
- Replace moving-border button with a tactile shadcn-style button (`bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90`).
- Add `↵ Enter` badge cue.
- Clean up note toggle and error messaging.

- [ ] **Step 2: Verify build**
Run: `cd frontend && npm run build`
Expected: Passes typecheck.

---

### Task 8: Modernize `TagFilter` and `ChatDrawer`

**Files:**
- Modify: `frontend/src/components/TagFilter.tsx`
- Modify: `frontend/src/components/ChatDrawer.tsx`

- [ ] **Step 1: Polish `TagFilter`**
Update pills to match the sleek 1px border design.

- [ ] **Step 2: Polish `ChatDrawer`**
Update dark palette, message bubbles, and suggested prompt chips.

- [ ] **Step 3: Verify build**
Run: `cd frontend && npm run build`
Expected: Passes typecheck.

---

### Task 9: Integrate in `App.tsx`

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Wire `viewMode` & `CommandPalette` in `App.tsx`**
- Add `viewMode` state initialized from `localStorage.getItem('clipvault_view_mode') || 'grid'`.
- Add global keyboard listener for `(e.metaKey || e.ctrlKey) && e.key === 'k'` to toggle command palette.
- Pass `viewMode` and toggle handler to `Navbar` and `BookmarkFeed`.
- Remove centered rainbow headline and replace with sleek, understated product headline.

- [ ] **Step 2: Verify full build**
Run: `cd frontend && npm run build`
Expected: Passes typecheck and builds cleanly.

---

### Task 10: End-to-End Verification & Companion Screen Update

**Files:**
- Verify: Full UI in browser companion and frontend dev server.

- [ ] **Step 1: Run production build and verify zero warnings**
Run: `npm run build` in `frontend`

- [ ] **Step 2: Update brainstorm companion screen to show final result**
Push updated completion screen to companion server.
