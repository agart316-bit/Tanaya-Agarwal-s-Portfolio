# Tanaya's Portfolio — Progress & Next Steps

*Last updated: April 4, 2026*

---

## What's Been Built

The portfolio is a **macOS-style interactive desktop experience** built in HTML, CSS, and vanilla JavaScript. It lives at `index.html` and uses a multi-file architecture:

- `index.html` — main shell (lock screen, desktop, dock, window manager)
- `styles.css` — desktop/OS-level styles
- `script.js` — desktop logic (window management, dock, drag, etc.)
- `liquid-ether-vanilla.js` — animated background (kept)
- `shared/base.css` — shared typography and layout primitives
- `assets/` — images (user avatar, desktop bg, lock screen bg, project thumbnails)
- `projects/1–14/` — individual project pages, each with its own `index.html` and `style.css`
- `projects/project-layout.css` — shared layout system for all project pages

### Features Implemented

- **Lock screen** with time, date, password field, and Touch ID prompt
- **Desktop** with drag-and-drop icons, animated hover (stacked image effect), cursor tooltip (replaces custom cursor ring)
- **Liquid Ether animated background** on the desktop
- **Dock** with icon bounce and app launching
- **Window system** — each project opens in a floating, draggable, resizable window
- **14 project pages** with hero images, split-column carousels, and layout templates

### Projects (all 14)

| # | Title | Medium / Skills |
|---|-------|-----------------|
| 1 | Men of Platinum | Digital Illustration & Motion |
| 2 | Now or Never | Digital Illustration & Motion |
| 3 | Digital Illustrations | Digital Illustration & Motion |
| 4 | ArtsyDesign.co | Print & Editorial |
| 5 | Dream Journals | Print & Editorial |
| 6 | Lost in Translation | Print & Editorial |
| 7 | Physics Textbook | Print & Editorial |
| 8 | Paintings | Fine Art |
| 9 | Black N White | Fine Art |
| 10 | Pottery | Fine Art |
| 11 | Installations | Spatial / Installation |
| 12 | The Borges Stories | Web Design |
| 13 | Ten Tab Open | Web Design |
| 14 | Fashion History | Web Design |

---

## What Was Just Agreed On (Last Session)

The last conversation confirmed the following plan — work stopped before execution:

### 1. Combine files for in-Claude preview
Merge `styles.css`, `script.js`, and `liquid-ether-vanilla.js` into `index.html` as inline `<style>` and `<script>` blocks so the whole portfolio can be previewed as a single HTML artifact inside Claude without breaking anything.

### 2. Group projects by medium, then build out sections
Show the proposed groupings first (before any changes), then implement each group with its own visual identity, animations, and scroll effects. Inspiration sources: Framer, string-tune, and other curated portfolio sites.

### 3. Animate each project section individually
Each group/project gets: entrance animations, scroll-triggered reveals, hover effects, and transitions that suit its medium (e.g. painterly fades for fine art, typographic kinetics for editorial work).

---

## Next Steps (In Order)

### Step 1 — Merge files for preview
Inline `styles.css`, `script.js`, and `liquid-ether-vanilla.js` into `index.html` to produce a single-file version (`index-preview.html`) that Claude can render. Keep the original multi-file version untouched.

### Step 2 — Propose project groupings
Read through all 14 project pages, determine mediums/skills, and suggest logical groups such as:
- **Print & Editorial** (books, zines, textbooks)
- **Digital Illustration & Motion**
- **Fine Art** (painting, pottery)
- **Web Design**
- **Spatial / Installation**

Present the groupings for approval before touching any files.

### Step 3 — Design animation strategy per group
Research-backed ideas (from Framer, string-tune, and similar sites):
- Scroll-snapped group transitions with parallax hero images
- Staggered card reveals with clip-path or opacity wipes
- Magnetic hover on project thumbnails
- Full-bleed ambient video/color per group
- Typewriter or kinetic text for section intros

### Step 4 — Implement group layouts and animations
One group at a time: build layout, add scroll hooks, test, then move to the next. Each project page should feel individually crafted inside its group.

### Step 5 — Final polish
- Fill in placeholder text (Lorem ipsum) with real copy for each project
- Finalize all project metadata (Year, Skills, Medium)
- Mobile/tablet responsive pass
- Performance audit (image compression, lazy loading)

---

## Reminders / Decisions Already Made

- ✅ Keep **liquid ether background** (purple is fine there only)
- ✅ Remove **custom cursor ring** — use cursor tooltip instead (already done)
- ✅ Go back to **original fonts** — no purple type elsewhere on the site
- ⏳ All animation work waits until groupings are approved
