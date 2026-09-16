# K.M. Portfolio — Homepage

This is the homepage (`index.html`) of the portfolio site, built to match the
provided high-fidelity prototype.

## Structure

```
portfolio/
├── index.html            homepage markup
├── css/
│   └── style.css          all styles (variables, layout, effects, responsive rules)
├── js/
│   ├── decorations.js     floating/parallax/repel behaviour for the pale decoration squares
│   ├── scramble.js        text-scramble hover effect on the header nav links
│   ├── typewriter.js      fast character reveal for the hero bio paragraph on load
│   ├── project-cards.js   touch-device tap-to-preview handling for project cards
│   └── main.js             mobile nav (hamburger) menu toggle
└── assets/
    └── images/            placeholder SVGs for the logo + 7 project previews
```

## Running it locally

No build step is needed — it's plain HTML/CSS/JS. Easiest options in VS Code:

- Install the **Live Server** extension, right-click `index.html` → "Open with Live Server".
- Or run `python3 -m http.server` from this folder and open `http://localhost:8000`.

Opening `index.html` directly by double-clicking also works, but a local server
is recommended so the mobile-menu media query and fonts behave exactly as they
will once hosted.

## Swapping in real assets

**Logo:** replace `assets/images/logo.svg` with your own file (keep the same
filename, or update the `src` in the `<a class="logo">` block in `index.html`).
The image is constrained to `height: 24px; width: auto;` with `object-fit: contain`,
so any reasonably-proportioned logo will drop in cleanly without distortion.

**Project images:** each project's `<img>` sits inside a `.project__media`
wrapper with a fixed `aspect-ratio` and `object-fit: cover`. Just replace the
`src` on each `<img>` with your real image — it will be cropped to fill the
frame without stretching. Recommended minimum sizes:

| Slot | Aspect ratio | Suggested min size |
|---|---|---|
| Artsy Dublin (feature) | 16:10 | 1600×1000px |
| Under the Feet of Shadows / Brand design | 1:1 | 1200×1200px |
| Trinity campus search (feature) | 16:10 | 1600×1000px |
| Blizzard Countdown / Surveillance engine | 8:9 | 1200×1350px |
| WinRAR rebrand (feature) | 16:9.3 | 1600×930px |

## Other pages

The nav links (`about.html`, `research.html`, `contact.html`) and each
project link (`works/artsy-dublin.html`, etc.) are already wired up with
real `href`s — those pages just don't exist yet. Once you share the
wireframes for them, they can be added using the same `css/style.css` and
the shared header/footer markup so the whole site stays visually consistent.

## Notes on interactions

- **Decoration squares**: float gently, drift with scroll (subtle parallax),
  and ease away from the cursor on hover. All of this is skipped for users
  with `prefers-reduced-motion` enabled.
- **Nav links**: scramble through random characters on hover/focus before
  settling back to the label (mirrors the reference site you linked).
- **Hero bio**: reveals character-by-character on first load only (not on
  hover/scroll), fast enough to read as a quick "typing in" moment.
- **"more about me" button**: the rectangle does a subtle skew wobble and the
  arrow shifts right on hover/focus.
- **Project cards**: image scales up slightly, the keyword tag wipes in from
  the left, and the orange corner brackets pop out — all on hover or keyboard
  focus. On touch devices, a first tap previews the card and a second tap
  follows the link.

All interactive states are also available via keyboard (`:focus-visible`) and
respect `prefers-reduced-motion`.
