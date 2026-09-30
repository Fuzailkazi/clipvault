# StackNote Aesthetic Redesign for ClipVault

**Date:** 2026-09-30  
**Status:** Approved by User  
**Topic:** Frontend UI overhaul from dark/zinc theme to the StackNote digital notecard aesthetic (dreamy cloud canvas, macOS app window with left mini-sidebar, playful mosaic pastel cards, and dual Day/Midnight theming).

---

## 1. Vision & Motivation

The user provided a reference design from **StackNote**—a clean, playful, digital stationery/notecard product featuring:
1. A dreamy sky-blue background with soft floating clouds.
2. A floating desktop-style window frame with decorative macOS traffic light buttons (🔴 🟡 🟢).
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
Each bookmark card cycles deterministically via `index % 4` through 4 signature pastel themes:
1. **Index 0 - Warm Peach / Apricot:**
   - Day: `bg-[#fff8f3] border-[#fed7aa] text-amber-950 shadow-sm shadow-orange-500/5`
   - Badge/Tag: `bg-[#fed7aa] text-[#9a3412]`
   - Night: `bg-orange-950/20 border-orange-500/30 text-orange-100`
2. **Index 1 - Soft Lilac / Lavender:**
   - Day: `bg-[#fbf7ff] border-[#e9d5ff] text-purple-950 shadow-sm shadow-purple-500/5`
   - Badge/Tag: `bg-[#e9d5ff] text-[#6b21a8]`
   - Night: `bg-purple-950/20 border-purple-500/30 text-purple-100`
3. **Index 2 - Sky Cyan / Cloud Blue:**
   - Day: `bg-[#f0f9ff] border-[#bae6fd] text-sky-950 shadow-sm shadow-sky-500/5`
   - Badge/Tag: `bg-[#bae6fd] text-[#0369a1]`
   - Night: `bg-sky-950/20 border-sky-500/30 text-sky-100`
4. **Index 3 - Fresh Mint:**
   - Day: `bg-[#f0fdf4] border-[#bbf7d0] text-emerald-950 shadow-sm shadow-emerald-500/5`
   - Badge/Tag: `bg-[#bbf7d0] text-[#15803d]`
   - Night: `bg-emerald-950/20 border-emerald-500/30 text-emerald-100`

---

## 3. Component Hierarchy & Architectural Updates

### 3.1 `App.tsx` (Canvas & Window Layout)
- Renders the outer full-bleed cloud/cosmic backdrop via `frontend/src/components/ui/background-grid.tsx` (updated with animated floating cloud elements in Day mode, starry cosmic glows in Midnight mode).
- Centers the floating macOS application window container with responsive padding (`p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto`).
- Replaces the generic top headline with a compact StackNote section header inside the window: `"My Vault & Clips"` with a friendly subtitle and clip count.
- Window body structure:
  - Desktop (`md:flex`): Left column `Sidebar.tsx` (width ~56), right column main content workspace.
  - Mobile (`< md`): Sidebar renders as a horizontal scrollable pill navigation rail directly under the window header.
- Manages legacy floating "Ask AI" trigger: hidden on desktop (`md:hidden`) because "Ask AI" is prominent in the sidebar; retained on mobile for 1-tap access.
- Modals & Drawers: `ChatDrawer.tsx`, `CommandPalette.tsx`, `AuthModal.tsx` remain seamlessly accessible.

### 3.2 `Navbar.tsx` (Top Window Controls & Header)
- Functions as the integrated header toolbar for the macOS floating window container.
- Left: Decorative macOS traffic light buttons (🔴 🟡 🟢) + `ClipVault` monogram/logo in modern rounded font.
- Center/Right:
  - Search trigger styled as a pill (`[ 🔍 Search clips (⌘K) ]`).
  - View toggle (`Grid` vs. `List`) with pill segmented control.
  - Day/Night toggle button (☀️ / 🌙) with smooth icon transition.
  - User profile avatar / Login trigger.

### 3.3 `Sidebar.tsx` (Left Navigation)
- Navigation items:
  - 📁 **All Clips:** Displays total count; sets `activeFilter` to `'all'`.
  - ⭐ **Starred:** Displays `starredCount` (calculated via `bookmarks.filter(b => starredIds.includes(b._id)).length`); sets `activeFilter` to `'starred'`.
  - 🏷️ **Tags:** Lists the top master tags for quick 1-click filtering (`selectedTag`).
  - ✨ **Ask AI:** Action button that triggers the slide-over `ChatDrawer`.
- Responsive layout:
  - Desktop: Vertical side column (`w-52 shrink-0 border-r border-slate-200/80 dark:border-white/10 p-4 space-y-1`).
  - Mobile: Horizontal scrollable rail of pill buttons below the window header.

### 3.4 `QuickPaste.tsx` (Persistent Pill Input)
- Clean pill-shaped input bar: `[ 🔗 Paste link to save... ]` with a snappy dark pill `Clip` button.
- Optional expandable notes toggle.
- Uses `forwardRef` or an `inputRef` prop so external actions (such as the dashed `[ ＋ Add Clip ]` card) can call `.focus()` directly.
- Full keyboard support (`Enter` to submit, `Esc` to clear).

### 3.5 `TagFilter.tsx` (Workspace Filter Rail)
- Restyled to match the pastel stationery palette:
  - Inline search input with rounded pill border and soft cloud-blue focus ring.
  - Tag chips styled as soft pastel pills matching the mosaic colors with smooth hover and active states.
  - Clear filter button with subtle hover feedback.

### 3.6 `BookmarkCard.tsx` (Digital Notecard with Pastel Themes)
- Receives `index: number` to apply the deterministic pastel mosaic theme (`index % 4`).
- Receives `isStarred: boolean` and `onToggleStar: (id: string) => void`.
- Top row:
  - Real domain favicon with fallback.
  - Domain name and category pill badge.
  - Star toggle button (`Star` icon: amber filled when `isStarred`, subtle outline on hover).
- Optional `ogImage`: If present, rendered as a compact, rounded inset thumbnail (64x64 or compact right-aligned preview) to preserve the clean stationery notecard layout without overpowering the pastel background.
- Middle: Title in friendly medium-bold rounded typography, followed by the AI summary and optional user note.
- Bottom row: tag chips, relative time ("Today", "Yesterday"), quick-copy button, and delete button.
- Smooth scale-up and soft shadow on hover (`hover:-translate-y-1 hover:shadow-md transition-all`).

### 3.7 Dashed `[ ＋ Add Clip ]` Card
- Integrated inside `BookmarkFeed.tsx` as the first item in Grid view.
- Styled with dashed pastel border (`border-2 border-dashed border-sky-300 dark:border-sky-500/40`), soft hover lift, and a `＋` icon.
- Clicking calls `onAddClip()`, which smoothly scrolls to and calls `.focus()` on the persistent `QuickPaste` input.

### 3.8 `BookmarkListItem.tsx` (List View Adaptation)
- Adapted to the new theme: rounded row cards with a pastel accent strip, favicon, domain, title, star toggle, relative date, and copy/delete actions.
- Receives `isStarred: boolean` and `onToggleStar: (id: string) => void`.

### 3.9 `ChatDrawer.tsx` (AI Assistant)
- Refitted with frosted glass matching the window container (`bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200/80 dark:border-white/10`).
- Chat message bubbles styled with the soft lilac/sky pastel accents for assistant responses and crisp dark/light pills for user messages.

### 3.10 `CommandPalette.tsx` & `AuthModal.tsx`
- Styled with the same rounded-3xl frosted glass backdrop and pastel accent focus rings.

---

## 4. State Management, Props & Theme Initialization

### 4.1 Theme Default Initialization (`ThemeContext.tsx`)
- In `frontend/src/context/ThemeContext.tsx`, change initial state fallback from `'dark'` to `'light'` (Day mode), respecting stored `localStorage.getItem('clipvault_theme')` if present.

### 4.2 Starred Bookmarks Persistence
- Starred state managed in `localStorage` under `clipvault_starred_ids` (`string[]`).
- `App.tsx` initializes `starredIds: string[]` from `localStorage` and provides:
  ```typescript
  const handleToggleStar = (id: string) => {
    setStarredIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem('clipvault_starred_ids', JSON.stringify(updated));
      return updated;
    });
  };
  ```
- Filter state: `activeFilter: 'all' | 'starred'`.
- When `activeFilter === 'starred'`, `displayedBookmarks = bookmarks.filter(b => starredIds.includes(b._id))`.
- `starredCount` for sidebar is computed as `bookmarks.filter(b => starredIds.includes(b._id)).length`.

### 4.3 Component Props Contracts
- **`BookmarkFeedProps`**:
  ```typescript
  interface BookmarkFeedProps {
    bookmarks: Bookmark[];
    isLoading: boolean;
    isBackendOffline: boolean;
    onDelete: (id: string) => Promise<void>;
    onTagClick: (tag: string) => void;
    onClearFilters?: () => void;
    hasFilters: boolean;
    viewMode?: 'grid' | 'list';
    starredIds: string[];
    onToggleStar: (id: string) => void;
    onAddClip: () => void;
  }
  ```
- **`BookmarkCardProps`**:
  ```typescript
  interface BookmarkCardProps {
    bookmark: Bookmark;
    index: number;
    isStarred: boolean;
    onToggleStar: (id: string) => void;
    onDelete: (id: string) => Promise<void>;
    onTagClick: (tag: string) => void;
  }
  ```
- **`BookmarkListItemProps`**:
  ```typescript
  interface BookmarkListItemProps {
    bookmark: Bookmark;
    isStarred: boolean;
    onToggleStar: (id: string) => void;
    onDelete: (id: string) => Promise<void>;
    onTagClick: (tag: string) => void;
  }
  ```
- **`QuickPasteProps`**:
  ```typescript
  interface QuickPasteProps {
    onSave: (url: string, notes?: string) => Promise<void>;
    isLoading: boolean;
    inputRef?: React.RefObject<HTMLInputElement | null>;
  }
  ```

---

## 5. Verification & Testing Plan

1. **Build Validation:** Run `npm run build --prefix frontend` — ensure 0 TypeScript or bundle compilation errors.
2. **Visual Checks:**
   - Day mode loads by default with sky-blue cloud gradient and light pastel cards.
   - Night mode toggles cleanly to midnight indigo with dark pastel cards.
   - Window container renders with macOS traffic lights, left mini-sidebar (desktop) and pill rail (mobile).
   - Dashed `[ ＋ Add Clip ]` card displays as first grid item and focuses quick-paste input on click.
   - Card pastel colors alternate predictably via `index % 4` (Peach, Lilac, Sky, Mint).
3. **Functional Checks:**
   - Starring a bookmark toggles the star icon and persists in `localStorage`.
   - Clicking "Starred" in the sidebar shows only starred bookmarks.
   - Adding a bookmark updates the list immediately.
   - Deleting a bookmark works with error handling.
   - Searching via input or `⌘K` command palette filters cards accurately.
   - Clicking "Ask AI" in sidebar or mobile floating button opens the slide-over chat drawer.
   - Copying link and opening external URLs works properly.
