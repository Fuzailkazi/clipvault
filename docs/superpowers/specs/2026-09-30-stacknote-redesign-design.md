# StackNote Aesthetic Redesign for ClipVault

**Date:** 2026-09-30  
**Status:** Approved by User  
**Topic:** Frontend UI overhaul from dark/zinc theme to the StackNote digital notecard aesthetic (dreamy cloud canvas, macOS app window with left mini-sidebar, playful mosaic pastel cards, and dual Day/Midnight theming).

---

## 1. Vision & Motivation

The user provided a reference design from **StackNote**—a clean, playful, digital stationery/notecard product featuring:
1. A dreamy sky-blue background with soft floating clouds.
2. A floating desktop-style window frame with macOS traffic light buttons (🔴 🟡 🟢).
3. A left mini-sidebar for core navigation (`All Clips`, `Starred`, `Tags`, `Ask AI`).
4. Digital notecards styled in soft, cheerful pastel shades (Warm Peach, Soft Lilac, Sky Cyan, Fresh Mint).
5. A persistent top pill QuickPaste bar combined with an interactive dashed `[ ＋ Add Clip ]` card in the grid.
6. A Day (Sunny Cloud Sky) and Midnight (Starry Cosmic Sky) dual-mode theme system.

The goal of this redesign is to bring ClipVault into this delightful, high-craft, friendly stationery workspace while preserving 100% of existing functionality (AI chat, bookmark CRUD, search, tags, command palette, auth, and offline handling).

---

## 2. Visual Language & Design Tokens

### 2.1 Color Palette & Tokens
- **Day Mode (Default):**
  - **Backdrop Canvas:** `bg-gradient-to-b from-sky-200 via-sky-100 to-blue-50` with soft floating ambient cloud elements (`bg-white/60 blur-2xl rounded-full`).
  - **Window Container:** `bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl shadow-sky-500/10 rounded-[28px]`.
  - **Mini-Sidebar:** `bg-slate-50/80 border-r border-slate-200/80 text-slate-600`.
  - **Active Sidebar Item:** `bg-white text-slate-900 shadow-sm border border-slate-200/60 font-semibold`.

- **Midnight Mode:**
  - **Backdrop Canvas:** `bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900` with subtle cosmic glows.
  - **Window Container:** `bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-indigo-950/60 rounded-[28px]`.
  - **Mini-Sidebar:** `bg-slate-950/60 border-r border-white/10 text-slate-400`.
  - **Active Sidebar Item:** `bg-slate-800 text-white shadow-sm border border-white/10 font-semibold`.

### 2.2 Playful Mosaic Pastel Cards
Each bookmark card cycles deterministically (via index modulo 4 or ID hash) through 4 signature pastel themes:
1. **Warm Peach / Apricot:**
   - Day: `bg-[#fff8f3] border-[#fed7aa] text-amber-950 shadow-sm shadow-orange-500/5`
   - Badge/Tag: `bg-[#fed7aa] text-[#9a3412]`
   - Night: `bg-orange-950/20 border-orange-500/30 text-orange-100`
2. **Soft Lilac / Lavender:**
   - Day: `bg-[#fbf7ff] border-[#e9d5ff] text-purple-950 shadow-sm shadow-purple-500/5`
   - Badge/Tag: `bg-[#e9d5ff] text-[#6b21a8]`
   - Night: `bg-purple-950/20 border-purple-500/30 text-purple-100`
3. **Sky Cyan / Cloud Blue:**
   - Day: `bg-[#f0f9ff] border-[#bae6fd] text-sky-950 shadow-sm shadow-sky-500/5`
   - Badge/Tag: `bg-[#bae6fd] text-[#0369a1]`
   - Night: `bg-sky-950/20 border-sky-500/30 text-sky-100`
4. **Fresh Mint:**
   - Day: `bg-[#f0fdf4] border-[#bbf7d0] text-emerald-950 shadow-sm shadow-emerald-500/5`
   - Badge/Tag: `bg-[#bbf7d0] text-[#15803d]`
   - Night: `bg-emerald-950/20 border-emerald-500/30 text-emerald-100`

---

## 3. Component Hierarchy & Architectural Updates

### 3.1 `App.tsx` (Canvas & Window Layout)
- Renders the outer full-bleed cloud/cosmic backdrop.
- Centers the floating macOS application window with responsive padding.
- Top bar contains macOS traffic lights (🔴 🟡 🟢), view title / breadcrumbs, search trigger, theme switcher (☀️/🌙), and user avatar.
- Two-column window body:
  - Left column: `Sidebar.tsx` (or mini-sidebar navigation).
  - Right column: Main workspace containing `QuickPaste.tsx`, `TagFilter.tsx`, and `BookmarkFeed.tsx`.
- Modals & Drawers: `ChatDrawer.tsx`, `CommandPalette.tsx`, `AuthModal.tsx` remain seamlessly accessible.

### 3.2 `Navbar.tsx` (Top Window Controls & Header)
- Styled as a sleek, rounded window toolbar.
- Traffic light buttons (red, amber, green) on the left.
- Brand logo: `ClipVault` with a friendly cloud/bookmark icon in modern rounded typography.
- Search button styled as a pill (`[ 🔍 Search clips (⌘K) ]`).
- View toggle (`Grid` vs. `List`) with pill segmented control.
- Day/Night toggle button with smooth icon transition.
- User profile avatar / Login trigger.

### 3.3 `Sidebar.tsx` (New Left Navigation)
- Navigation items:
  - 📁 **All Clips** (shows total count)
  - ⭐ **Starred / Favorites** (quick filter for favorite bookmarks)
  - 🏷️ **Tags & Categories** (expandable or shortcut to filter rail)
  - ✨ **Ask AI** (action button that triggers the slide-over `ChatDrawer`)
- Responsive: Collapses into bottom navigation or compact icon rail on mobile/small viewports.

### 3.4 `QuickPaste.tsx` (Persistent Pill Input)
- Clean pill-shaped input bar: `[ 🔗 Paste link to save... ]` with a snappy dark pill `Clip` button.
- Optional expandable notes toggle.
- Full keyboard support (`Enter` to submit, `Esc` to clear).

### 3.5 `BookmarkCard.tsx` (Digital Notecard with Pastel Themes)
- Dynamic pastel background and border classes based on mosaic index.
- Top row: real domain favicon, domain name, category pill badge, and subtle 3-dots / action menu.
- Middle: Title in friendly medium-bold serif or modern sans typography, followed by the AI summary and user note (if any).
- Bottom row: tag chips, relative time ("Today", "Yesterday"), quick-copy button, and delete button.
- Smooth scale-up and soft shadow on hover (`hover:-translate-y-1 hover:shadow-md transition-all`).

### 3.6 Dashed `[ ＋ Add Clip ]` Card
- Integrated inside `BookmarkFeed.tsx` as the first card in Grid view.
- Styled with dashed pastel border (`border-2 border-dashed border-sky-300 dark:border-sky-500/40`), soft hover lift, and a `＋` icon.
- Clicking focuses the QuickPaste input or opens the quick-add prompt.

### 3.7 `BookmarkListItem.tsx` (List View Adaptation)
- Adapted to the new theme: rounded row cards with a pastel accent pill, favicon, domain, title, date, and actions.

### 3.8 `ChatDrawer.tsx` (AI Assistant)
- Refitted with frosted glass matching the window container (`bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200/80 dark:border-white/10`).
- Chat message bubbles styled with the soft lilac/sky pastel accents for assistant responses and crisp dark/light pills for user messages.

### 3.9 `CommandPalette.tsx` & `AuthModal.tsx`
- Styled with the same rounded-3xl frosted glass backdrop and pastel accent focus rings.

---

## 4. State Management & API Continuity

- All existing state hooks in `App.tsx` remain unchanged:
  - `bookmarks`, `activeTag`, `searchQuery`, `viewMode`, `isChatOpen`, `isAuthOpen`, `isCommandPaletteOpen`.
  - New filter state: `activeFilter` (`'all' | 'starred'`).
- All API client functions (`getBookmarks`, `createBookmark`, `deleteBookmark`, `chat`, `checkHealth`) continue to work seamlessly.
- Local storage persistence for theme (`clipvault_theme`) and view mode (`clipvault_view_mode`) is preserved.

---

## 5. Verification & Testing Plan

1. **Build Validation:** Run `npm run build --prefix frontend` — ensure 0 TypeScript or bundle compilation errors.
2. **Visual Checks:**
   - Day mode loads with sky-blue cloud gradient and light pastel cards.
   - Night mode toggles cleanly to midnight indigo with dark pastel cards.
   - Window container renders with macOS traffic lights and left mini-sidebar.
   - Dashed `[ ＋ Add Clip ]` card displays in grid and focuses quick-paste.
   - Card pastel colors alternate evenly across items (Peach, Lilac, Sky, Mint).
   - Responsive behavior: mobile view adapts gracefully without broken layout.
3. **Functional Checks:**
   - Adding a bookmark updates the list immediately.
   - Deleting a bookmark works with error handling.
   - Searching via input or `⌘K` command palette filters cards accurately.
   - Clicking "Ask AI" opens the slide-over chat drawer.
   - Copying link and opening external URLs works properly.
