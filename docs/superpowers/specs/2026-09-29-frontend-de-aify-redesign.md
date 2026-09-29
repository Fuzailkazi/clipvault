# Frontend De-AIfy & Linear Precision Redesign

**Date:** 2026-09-29  
**Status:** Approved  
**Topic:** Frontend UI overhaul from "AI-generated template" to handcrafted Linear/Raycast power-user aesthetic.

---

## 1. Problem Statement & Motivation

The initial frontend for ClipVault suffered from ubiquitous "AI slop" clichés:
1. Centered rainbow/indigo gradient headline on top of a radial-masked dot/grid canvas.
2. Animated SVG moving borders spinning on basic buttons (`moving-border.tsx`).
3. Uniform cards with heavy fake purple hover glow and lack of real-world information density.
4. Missing power-user essentials: domain favicons, view mode toggles (Grid vs. List), keyboard shortcuts (`⌘K`), and tactile feedback.

The goal of this redesign is to transform ClipVault into an elite, responsive developer and knowledge curator tool inspired by Linear and Raycast.

---

## 2. Design Decisions & Visual Language

### 2.1 Theme & Token System
- **Dark Theme (Primary/Default):**
  - Background: `bg-zinc-950` / `bg-zinc-900`
  - Surfaces: `bg-zinc-900/90` with `border-zinc-800` (subtle 1px border)
  - Text: `text-zinc-100` (headings), `text-zinc-400` (descriptions/meta), `text-zinc-500` (subtle badges)
- **Light Theme:**
  - Background: `bg-zinc-50` / `bg-zinc-100`
  - Surfaces: `bg-white` with `border-zinc-200`
  - Text: `text-zinc-900`, `text-zinc-600`, `text-zinc-400`
- **Accent Color:**
  - Muted Indigo / Violet (`text-indigo-400`, `bg-indigo-500/10`, `border-indigo-500/20`) used sparingly for focused states and active filters rather than omnipresent neon glows.

### 2.2 Component Hierarchy & Responsibilities

1. **`Navbar` (`src/components/Navbar.tsx`)**:
   - Monogram logo (`CV`) + `ClipVault` label + count pill.
   - Quick search trigger button with `⌘K` badge.
   - View mode toggle (`Grid` vs. `List`) persisted or passed down.
   - Offline indicator pill (subtle amber/red).
   - "Ask AI" pill button with subtle sparkle icon.
   - Theme toggle (Sun/Moon).
   - Auth status (avatar/username + logout or Sign In button).

2. **`QuickPaste` (`src/components/QuickPaste.tsx`)**:
   - Replaces the generic input with a sleek, command-style paste box.
   - Features keyboard cue (`↵ Enter`), optional note toggle, and tactile Save button without spinning SVG borders.

3. **`CommandPalette` (`src/components/CommandPalette.tsx`)**:
   - Modal triggered by `⌘K` or clicking the search bar.
   - Instant search across titles, summaries, and tags.
   - Keyboard navigable (ArrowUp/ArrowDown, Enter to open, Esc to close).
   - Quick action shortcuts (e.g. filter by tag, switch view, toggle theme).

4. **`BookmarkCard` (`src/components/BookmarkCard.tsx`)**:
   - **Favicon Integration:** Displays real domain favicon via `https://www.google.com/s2/favicons?domain=<hostname>&sz=32` with automatic fallback to Lucide `Globe`.
   - **Category Tag:** Clean uppercase mono pill (e.g., `DOCUMENTATION`, `REPOSITORY`, `ARTICLE`, `TOOL`).
   - **Content:** Title with external link icon on hover, 2-sentence summary, user notes in a clean inset box.
   - **Footer:** Tag pills (`#react`, `#tailwind`), relative date (`Today`, `Yesterday`, `MMM d`), quick copy button and delete button.
   - **Eliminates:** Moving border / gradient border glow. Uses crisp 1px borders and subtle shadow elevation.

5. **`BookmarkListItem` (`src/components/BookmarkListItem.tsx`)**:
   - Compact table-style row for high-density reading.
   - Shows favicon, title, domain, category badge, tags, relative date, and actions on hover.

6. **`BookmarkFeed` (`src/components/BookmarkFeed.tsx`)**:
   - Supports both `viewMode === 'grid'` and `viewMode === 'list'`.
   - Polished empty states and loading skeletons that match the zinc aesthetic.

7. **`TagFilter` (`src/components/TagFilter.tsx`)**:
   - Horizontal category and tag rail with active state pills.

8. **`ChatDrawer` (`src/components/ChatDrawer.tsx`)**:
   - Redesigned to match the dark zinc palette with crisp borders, sleek user/assistant bubbles, and clickable suggested prompt chips.

---

## 3. Data Flow & State Management

- View mode (`'grid' | 'list'`) stored in `App.tsx` state and persisted in `localStorage` (`clipvault_view_mode`).
- `CommandPalette` opens on `keydown` (`Meta+k` or `Ctrl+k`) or click from `Navbar`.
- All existing API integrations (`api.getBookmarks`, `api.createBookmark`, `api.deleteBookmark`, `api.chat`, `api.checkHealth`, `useAuth`, `useTheme`) are preserved without regression.

---

## 4. Verification & Testing

1. `npm run build` in `frontend` must compile with 0 TypeScript and Vite errors.
2. Favicon loads gracefully with fallback when domain is missing or image fails to load.
3. Switching between Grid and List view updates smoothly.
4. `⌘K` opens Command Palette and filtering works.
5. Light and Dark themes both look clean, contrast-compliant, and free of visual artifacts.
