# Bug Log

## [FIXED] Scroll snap not triggering on landing page

**Symptom:** `scroll-snap-type: y proximity` set on `html`, but scrolling the page never snapped to snap points.

**Root cause:** `html` has `overflow-y: visible` (the default) and is therefore NOT a scroll container. `scroll-snap-type` only works on actual scroll containers. In a standard Next.js page, `body` is the scroll container (`overflow-y: auto`).

Confirmed via CDP:
```
htmlOverflowY: "visible"   ← not a scroll container, snap doesn't apply
bodyOverflowY: "auto"      ← this is the actual scroll container
```

**Fix:** Moved `scroll-snap-type: y proximity; scroll-behavior: smooth` from `html` to `body`. Also set `body { overflow-y: scroll }` to make it explicit.

**File:** `app/globals.css`

---

## [FIXED] React hydration error — text content mismatch

**Symptom:** `Error: Text content does not match server-rendered HTML` in console.

**Root cause:** Components rendering session-dependent content (user name, auth state) differed between server render (no session) and client hydration (session loaded). Affected: greeting text, nav buttons, user avatar initials.

**Fix:** Two patterns applied:
1. `useIsSignedIn()` hook — returns `false` until component mounts, so initial server and client renders agree on "not authenticated"
2. `if (!mounted) return null` pattern on `UserAvatar` — renders nothing until after hydration

**Files:** `app/page.tsx`, `app/upload/page.tsx`, `app/dashboard/page.tsx`

---

## [FIXED] CSS syntax error — stray closing brace at globals.css:374

**Symptom:** CSS build error blocking page render.

**Root cause:** Removed `@keyframes marquee-snap` block without removing the extra `}` that closed it.

**Fix:** Deleted orphaned `}` after `.reveal.revealed { }` block.

**File:** `app/globals.css`
