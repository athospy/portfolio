# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running Locally

There is no build step. This is a plain static site. Because `js/main.js` uses jQuery `.load()` to fetch HTML fragments, the page **must be served over HTTP** — opening `index.html` directly as a `file://` URL will fail with CORS errors.

Any static server works:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Architecture

`index.html` is a thin shell. The header, drawer (mobile nav), and intro section are **inlined directly** in `index.html`. On load, jQuery fetches and injects the remaining section files:

| Placeholder | File loaded |
|---|---|
| `#experience_sec` | `section_experience.html` |
| `#portfolio_sec` | `section_porfolio.html` |
| `#interest_sec` | `section_interest.html` |
| `#project_sec` | `section_project.html` |
| `#contact_sec` | `section_contact.html` |

Individual project detail pages (`project_ardu.html`, `project_artemisa.html`, `project_sorteador.html`) exist as standalone files and are also `.load()`-ed into their respective containers.

### Blog

`blog/index.html` is a separate standalone page (not injected into the main shell). LinkedIn post embeds are hardcoded directly as `<iframe>` elements inside the HTML — there is no JSON-driven renderer. To add a new post, paste the LinkedIn embed `<iframe>` wrapped in a `<div class="li-embed">` block.

### Books

`books/index.html` is a separate standalone page following the same pattern as the blog. Goodreads "Blog This Review" embed snippets are hardcoded directly as HTML inside `<div class="gr-embed">` blocks. To add or edit a book, edit the HTML directly. All 20 embed snippets are also stored in `internal-docs/books-embed-collection.md` for reference.

### CSS / Styling

- `css/style.css` — all custom styles; uses CSS variables for the color scheme
- `css/bootstrap.min.css`, `css/material.min.css` — third-party base styles (do not edit)
- `css/material-design-iconic-font.min.css` — icon font (`zmdi-*` classes)

### JavaScript

- `js/main.js` — component loader + scroll animations + smooth scrolling
- `js/jquery-3.5.1.min.js`, `js/material.min.js` — vendor files (do not edit)

`initModernEffects()` fires after a 3-second delay (to let all `.load()` calls complete) and sets up scroll-reveal animations via `IntersectionObserver` and smooth anchor scrolling.

## Deployment

Pushing to `main` automatically triggers the GitHub Actions workflow in `.github/workflows/deploy.yml`, which rsyncs the repo to `/var/www/profile` on the production VPS (`santiagomorel.dev`). The `internal-docs/` directory is excluded from the rsync and never reaches the server.

Required GitHub Secrets: `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `DEPLOY_PATH`, `SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS`.

## Content Notes

- `internal-docs/` contains positioning plans and a resume used to keep the site copy aligned. Check it for context before editing bio, skills, or experience copy.
- The resume source of truth lives in `internal-docs/resume.md`.
