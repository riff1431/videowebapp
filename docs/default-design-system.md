# Default Design System — Shorts Specification

## Components Overview
The default theme provides a high-fidelity, YouTube Shorts-style vertical video feed at `/shorts`.

### Modular Shorts Components (`src/app/themes/default/components/shorts/`)
1. **`ShortsFeed`**:
   - Manages the vertical feed sequence with CSS scroll snap (`snap-y mandatory`, `snap-always`).
   - Supports deep link `?v=<videoId>`, smoothly updating the URL via `window.history.replaceState`.
   - Dynamic import of comments panel for fast initial page load.
2. **`ShortItem`**:
   - Windowed presentation wrapper; mounts full video players for previous, current, and next shorts, falling back to posters outside the window.
3. **`ShortPlayer`**:
   - Multi-provider video renderer supporting local MP4/HLS streams with auto-play, muted start, buffering indicator, and retry states.
   - Provider iframe support for YouTube embeds and graceful fallback links for other external providers.
4. **`ShortProgress`**:
   - Keyboard-accessible seekable scrubber with high hit-target area and hover indicator.
5. **`ShortActionRail`**:
   - Interactive action rail (Like, Dislike, Comments, Share, Create, More Menu with Save to Watch Later and Report).
   - Formatted engagement numbers (e.g. `1.2K`).
   - Unauthenticated users are redirected to login with `next` return parameters.
6. **`ShortInfoOverlay`**:
   - Channel avatar, username, verified badge, optimistic Subscribe/Subscribed toggle, and expandable 2-line title description with hashtag search links.
7. **`ShortCommentsPanel`**:
   - Desktop side panel (>= 1024px) shifting the short card smoothly to the left.
   - Mobile bottom drawer / sheet (< 1024px) with gesture close.
   - Live comment posting, loading more comments, and deleting own comments without stopping video playback.
8. **`ShortShareDialog`**:
   - Native Web Share API integration with fallback clipboard copying and direct social share targets (Facebook, X, Email).
9. **`ShortsShortcutsHelp`**:
   - Keyboard navigation guide modal (Arrow keys, J/K, Space, M, L, C, Escape).
10. **`ShortsSkeleton` / `ShortsEmpty` / `ShortsError`**:
    - High-fidelity loading, empty, and failure states with retry action.

---

## Headless Client Hooks (`src/modules/shorts/client/`)
1. **`useShortsFeed`**: Handles pagination, cursor offsets, sentinel triggers, active index state, and deep link URL synchronization.
2. **`useShortPlayback`**: Manages video play/pause, localStorage mute persistence, buffering, visibility changes (pausing on background tabs), and view counting threshold (2 seconds or 50% for <4s).
3. **`useShortsKeyboard`**: Binds J/K, arrows, Space, M, L, C, and Escape keys, ignoring events when text inputs are focused.
4. **`useOptimisticReaction`**: Handles optimistic like, dislike, and subscription toggling with automatic rollback on network error.
