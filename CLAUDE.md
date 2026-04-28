# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Cole Frank's personal site — a Jekyll site published via GitHub Pages at `colevfrank.github.io`. Originally forked from the [`contrast`](https://github.com/niklasbuschmann/contrast) theme (the upstream `README.md` is still the theme's README, not project-specific docs); the visual layer has been substantially rewritten on top of those bones.

## Common commands

```bash
bundle install                  # install gems (first run / after Gemfile change)
bundle exec jekyll serve        # local dev server with live reload at http://localhost:4000
bundle exec jekyll build        # produce static site into _site/
```

There are no tests or linters configured.

## Architecture notes

### Theming

- **CSS custom properties drive runtime colors and type scale.** `_sass/index.sass` declares `:root` with `--bg`, `--fg`, `--fg-muted`, `--accent`, `--rule`, `--code-bg`, `--fs-base`, `--fs-h1`, `--fs-h2`, `--measure`. Two override blocks flip palette: `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` and `:root[data-theme="dark"]`. Always reach for `var(--accent)` etc. — the bare Sass `$dark` / `$light` variables are kept only because the theme-agnostic `reduce()` mixin still uses them at compile time for borders/code-block tints.
- **Manual theme toggle** is wired in `_layouts/default.html`: an inline FOUC-blocker reads `localStorage.theme` and sets `data-theme` on `<html>` before the stylesheet loads; `assets/js/theme.js` wires the header `<button class="theme-toggle">` to flip and persist.
- **Variable fonts** (IBM Plex Sans + JetBrains Mono) live in `assets/fonts/*.woff2` and are declared in `_sass/font.sass` with `format('woff2-variations')`. The Roman variant is `<link rel="preload">`-ed in `default.html`; italic and mono are not preloaded by design.

### Content surfaces

- **Site config lives in `_config.yml`.** Top nav and footer socials are arrays (`navigation`, `external`); the resume PDF is a `navigation` entry. `extra_icons:` holds icon glyph IDs needed by the layouts/components but not by any nav entry (e.g. the toggle's `sun`/`moon`).
- **Projects page is data-driven.** Edit `_data/projects.yml` to add an entry — required keys are `title` and `blurb`; everything else (`date`, `tags`, `links.{paper,demo,code,post,video,slides}`, `featured`) is optional. Cards render via `_includes/project-card.html`, sorted by `date` desc.
- **Home page is `index.html` at repo root.** The `_includes/home.html` template is only used when a page sets `layout: home`; current `index.html` uses `layout: page` and bypasses it. Post listing is `blog.md`.
- **Layout chain:** pages declare `layout: page` or `layout: post` (in `_layouts/`), both extend `_layouts/default.html`. `default.html` loads `assets/css/index.css` (the `show_frame: true` branch / `frame.sass` are disabled — the file has been renamed to `_frame.sass.bak`).
- **Reading column** is constrained to `var(--measure)` (68ch) on prose elements via `_sass/layout.sass`. Full-bleed components like `.profile-section` and `.project-grid` live as direct children of `<article>` and so escape the cap.

### Styling

- Entry stylesheet is `assets/css/index.sass` which `@import`s the partials in `_sass/`. Project-specific overrides go in `_sass/custom.sass`; theme-inherited bones live in `basic.sass`, `layout.sass`, `classes.sass`, `font.sass`, `index.sass`.
- Posts in `_posts/` follow Jekyll's `YYYY-MM-DD-slug.md` convention. Front matter: `layout: post`, `title`, optional `mathjax: true` (for KaTeX), `categories`. Reading time and date are emitted by `_includes/meta.html` → `_includes/reading-time.html`.

## Gotchas

- **`jekyll-sass-converter` is pinned to `~> 2.2.0` (libsass).** Several modern CSS features need to be hidden from the compiler:
  - `:root` and `:focus-visible` selectors must be escaped as `\:root` / `\:focus-visible` in indented `.sass` files (libsass mistakes them for property declarations).
  - `min()` / `max()` calls in regular property values must be wrapped in interpolation: `minmax(#{"min(100%, 22rem)"}, 1fr)` — libsass otherwise tries to evaluate them as Sass arithmetic and errors on mixed units.
  - `clamp()` is fine inside CSS custom-property values (`--fs-h1: clamp(...)`), but using it as a Sass variable value triggers unit-incompat errors. Define fluid sizes as custom properties, not Sass vars.
  - Do not migrate to `@use`/`@forward` (Dart Sass-only); stay on `@import`.
- **Ruby 3.3 compat gems** (`csv`, `base64`, `bigdecimal`, `logger`, `ostruct`, `webrick`) are explicitly listed because they were removed from the stdlib default set; keep them in the Gemfile when modifying dependencies.
- **FontAwesome sprite is build-time generated.** `assets/fontawesome/icons.svg` is a Liquid template that walks `site.navigation`, `site.external`, and `site.extra_icons`, deduping. Icons referenced from layouts/components but not present in any nav entry must be added to `extra_icons:` in `_config.yml` to make it into the sprite.
- `_site/`, `.jekyll-cache/`, and `Gemfile.lock` are gitignored — don't commit build output.
