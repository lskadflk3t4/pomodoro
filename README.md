# Pomodoro Studio (PWA)

Offline-first Pomodoro timer with tasks, tags, a 24h two-ring day clock, a per-minute focus ring,
and optional task sync between your devices. Works on desktop (Chrome, Edge) and Android (Chrome).
No build step and no dependencies: it is plain static files.

## Deploy on GitHub Pages (about 2 minutes)

1. Create a new GitHub repository (public is fine; Pages on private repos needs a paid plan).
2. Upload **all files in this folder** to the repository root, keeping the `icons/` folder
   (`index.html`, `manifest.webmanifest`, `sw.js`, `.nojekyll`, `icons/…`).
3. Repository → **Settings → Pages** → *Build and deployment* → Source: **Deploy from a branch**,
   Branch: `main`, folder `/ (root)` → Save.
4. After a minute your app is live at `https://<your-user>.github.io/<repo>/`.

Everything uses relative paths, so it also works from any other static host or sub-folder.
Service workers need **HTTPS** (GitHub Pages provides it) or `localhost`.

## Install

- **Desktop (Chrome/Edge):** open the URL, click the install icon in the address bar
  (or Settings in the app → *Install*).
- **Android (Chrome):** open the URL → menu **⋮ → Install app** (or *Add to Home screen*).

After the first load the app works fully offline.

## Shortcuts

Installed copies get two shortcuts:

| Shortcut | What it does |
|---|---|
| **Add a task** | Opens the app on the to-do list with the new-task box focused |
| **Start a round** | Starts (or resumes) a focus round immediately |

- **Android:** long-press the app icon.
- **Windows/Linux/ChromeOS:** right-click the app icon in the taskbar or launcher.
- **macOS:** right-click the Dock icon.

You can also open them directly: `…/?action=add-task` and `…/?action=start-round`.
If a round is already running, *Start a round* leaves it running (it never pauses it).
Shortcut changes only appear after you reinstall/refresh the installed app (browsers read the manifest at install time and re-check it periodically).

## Sync tasks between devices

Sync uses a **private GitHub Gist in your own account**: no server, nothing to host.

1. Create a token: <https://github.com/settings/tokens/new?scopes=gist&description=Pomodoro%20Studio%20sync>
   (classic token, tick **only** the `gist` scope; choose an expiry you are comfortable with).
2. In the app: **Settings → Sync across devices**, paste the token, press **Connect & sync**.
3. On every other device, paste the **same token**. The app finds the existing Gist automatically
   and merges.

What syncs: tasks (text, done state, linked rounds) and tags. Statistics, themes and timer
settings stay per device. Each task is merged by last-edit time, deletions are remembered
(so a task deleted on one device does not come back), and offline edits are queued and
merged when you are online again. It syncs ~1.5 s after a change, every minute while the app
is open, when you return to the app, and when the connection comes back.

Privacy notes: the token is stored only in that browser's local storage. The Gist is *secret*
(unlisted, not encrypted), so anyone with its URL could read your task text. Don't put secrets
in tasks. Revoke the token any time at <https://github.com/settings/tokens> and press
*Disconnect* in the app.

**Export / Import tasks (JSON)** in the same panel is a manual backup/transfer that works without GitHub.

## Updating the app

Edit the files, then **bump `CACHE_VERSION` in `sw.js`** (for example `v1` → `v2`) and push.
Installed copies fetch the new version on their next launch (a second launch shows it).

## Files

- `index.html`: the whole app (HTML, CSS, JS)
- `manifest.webmanifest`: name, icons, shortcuts, install behaviour
- `sw.js`: offline cache (app shell) and notification click handling
- `icons/`: app, maskable, Apple touch and shortcut icons
- `.nojekyll`: tells GitHub Pages to serve files as they are

## Notes

- Notifications: Settings → *Round-end notification*. They fire when a round ends while the app is
  in the background and still running. A closed app cannot wake itself without a push server; if a
  round ended while it was closed, it is counted when you reopen it.
- Sound: browsers only allow audio after you have interacted with the page once.
