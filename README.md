# Château Rouge — website

**Live:** https://chateau-rouge-nairobi.vercel.app
**Repo:** https://github.com/Dw33pY/chateau-rouge

A hand-coded site for **Château Rouge**, the family-run garden restaurant on
Kindaruma Road, Kilimani, Nairobi. Four pages, no framework, no build step, no
dependencies. Open the folder, run one command, and you are looking at it.

---

## 1. Run it in 30 seconds

You need **Node.js 18 or newer** (`node --version`).

```bash
npm run dev
```

Then open **http://localhost:4173**.

That starts `dev-server.js`, a ~90-line static server with no dependencies. It
exists for one reason: the site uses **clean URLs** (`/menu`, not `/menu.html`),
exactly like Vercel does in production. If you double-click `index.html`, every
link breaks — `file://` has no server to turn `/menu` into `menu.html`.

> **Do not use the VS Code "Live Server" extension on this project.** It does not
> resolve clean URLs, so `/menu` returns a 404 locally. Use `npm run dev`.

You do **not** need `npm install`. There is nothing to install.

If port 4173 is busy, the server tries 4174, 4175 and so on, and prints the URL
it landed on.

---

## 2. Open it in VS Code

1. **File → Open Folder…** → choose this folder (`chateau-rouge`).
2. Trust the folder when VS Code asks — you need the terminal.
3. Open the terminal with `` Ctrl+` ``.
4. Run `npm run dev`.
5. Open http://localhost:4173.
6. Edit a file, save, refresh the browser. No build step to wait for.

Or use the task runner: **Terminal → Run Task → Serve site (clean URLs)**.

| File | What it does |
|---|---|
| `.vscode/tasks.json` | Adds the local server to the task runner |
| `.vscode/settings.json` | 2-space indent, LF endings, no format-on-save (so the HTML is not reflowed) |
| `.vscode/extensions.json` | Recommends EditorConfig, warns against Live Server |

---

## 3. What is where

```
index.html          Home — hero, the house, today's board, all-day, garden, guest book, visit
menu.html           The board — fish, chicken, small plates, good to know
story.html          The house — Kilimani, the kitchen, the long table
visit.html          Address, hours, phone, directions, FAQ
404.html            Branded not-found page (real 404 status on Vercel)
styles.css          All styling; tokens and QUICK SETTINGS at the top
script.js           Sticky header, mobile nav, copy-address, reveal-on-scroll
dev-server.js       Local preview server (not shipped to the host)
assets/fonts/       Fraunces + Karla, self-hosted latin subsets (woff2)
assets/img/         Garden hero + social card
vercel.json         Clean URLs, security headers, cache policy
robots.txt          Sitemap pointer
sitemap.xml         All four indexable pages
site.webmanifest    Install metadata and icons
favicon.* / apple-touch-icon.png
```

### The first place to edit

Every colour, type size, spacing value and animation duration lives in the
`QUICK SETTINGS` block at the top of `styles.css`:

```css
--oxblood: #6E1B24;   /* primary accent: links, CTA, italic display lines */
--leaf: #2F4436;      /* garden green: quiet rules and second accents */
--forest: #17221B;    /* dark sections — deep foliage, not black */
```

Change a hex there and the whole site follows. Below that block, every colour,
duration and breakpoint carries a comment naming what it controls.

### The phone number

It appears in the header, the mobile menu, every CTA and the footer of every
page. Find and replace `+254722240630` (the `tel:` links) and
`+254 722 240630` (the visible text) across the HTML files.

---

## 4. Content: what is verified, what is not

This matters more than the design. Everything factual on the site comes from
the restaurant's public listings (Google/restaurant directories), and the places
where data did not exist were left out rather than invented.

**Verified and used:** name, Kindaruma Road / Kilimani address, phone
+254 722 240630, open daily 10am–midnight, African cuisine with fish and chicken
as the known specialities, garden and outdoor seating, parking, takeaway and
delivery, group celebrations (birthdays, weddings, meetings), and the
KES 1,300–3,200 per-head price range given on its listings.

**Not published anywhere, so deliberately absent:**

- a full menu with dish prices — the board lists only the dishes guests name in
  reviews and photographs (whole fried fish, dry fry chicken, chama fish,
  grilled chicken, samosa, mussels), with a clear "call for today's board" line;
- an email address and social accounts for this branch — the Instagram handle
  that looks similar belongs to a different Château Rouge, so it is not linked;
- a founding year, owner names, seat counts or awards — none are documented.

**Two placeholders to replace before a real launch:**

1. `assets/img/garden-dusk.jpg` — an illustrative garden-terrace image, not a
   photograph of this restaurant. Swap in their own photography at 4:5
   (1000×1250 or larger) and keep the same filename.
2. `assets/img/og-image.png` — the social card. Regenerate after any change to
   the name or headline.

The two guest quotes are real Google reviews, reproduced with light trimming.
The ellipsis in a quote marks the trim.

---

## 5. Design system in one paragraph

Fraunces for display (warm, slightly wonky, not a European Didone) and Karla for
text. Ivory paper, oxblood accent from the name, forest green for the dark
bands, ochre for pattern lines. The signature is the **garden line**: a split
hero where the paper and the garden meet, a paper "board" that hangs over the
dark section, and hairlines that draw on hover. Motion is slow and finite —
nothing loops in the reading path — and everything stops under
`prefers-reduced-motion`.

---

## 6. Deploy to Vercel

This folder is already a Vercel project shape: static files at the root and a
`vercel.json` with clean URLs, security headers and a cache policy. It is
deployed at **https://chateau-rouge-nairobi.vercel.app**.

```bash
npx vercel --prod
```

Or push the folder to GitHub, import it in Vercel, and let every push deploy.
No build command, no output directory — the files are the site.

Custom domain: add `chateaurouge.co.ke` (or whichever domain they own) in
Vercel → Project → Settings → Domains, then point the DNS records Vercel gives
you. After the domain is live, replace every `chateau-rouge-nairobi.vercel.app`
in the HTML, `robots.txt` and `sitemap.xml` with the real domain so canonical,
Open Graph and sitemap URLs agree.

### After the first deploy, check these

```bash
curl -sI https://<domain> | grep -iE 'content-security|x-frame|referrer|strict-transport'
curl -sI https://<domain>/menu | head -n 1      # expect 200
curl -s https://<domain>/robots.txt | tail -n 2
curl -sI https://<domain>/nope | head -n 1      # expect 404
```

Then paste the URL into a chat app to confirm the Open Graph preview, and run
Lighthouse on mobile.

---

## 7. Accessibility and performance notes

- Semantic landmarks, one `<h1>` per page, no skipped heading levels.
- Skip link, visible `:focus-visible` rings on every interactive element.
- Mobile menu is a real full-screen surface: 44px+ targets, `Esc` closes it,
  focus returns to the toggle, background scroll is locked.
- All body text meets WCAG AA against its background; links are underlined or
  ruled, never colour-only.
- Motion is `transform`/`opacity` only, 800ms reveals, and fully disabled under
  `prefers-reduced-motion`.
- Fonts are self-hosted and preloaded; the hero image is 1000×1250 at ~157 KB
  with explicit width/height so nothing jumps.
- Total CSS ≈ 48 KB, JS ≈ 7 KB, no third-party requests.

---

## 8. Credit

The footer credit to **Dw33pY** (https://dw33py.netlify.app) is part of the
build and must stay on every page.
