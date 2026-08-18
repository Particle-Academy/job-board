# Changelog

Notable changes to `@particle-academy/job-board`.

**BREAKING** marks anything that can stop working on upgrade. This package is
pre-1.0, so breaking changes land in MINOR releases — read those entries before
upgrading.

---

## [Unreleased]

## 0.2.1 — 2026-08-18

### Fixed

- **Dark mode: cards rendered white with invisible text.** Every surface in the
  package forced `!bg-white` onto a react-fancy `<Card>`, which already renders
  `bg-white dark:bg-zinc-900` itself. In light mode the override was a no-op; in
  dark mode it pinned the card white while the text — correctly using the kit's
  `secondary-*` scale, which flips under `.dark` — turned near-white with it. The
  result was white-on-white on twelve surfaces across `JobBoard`, `JobCard`,
  `JobDetail`, `ApplyForm`, `ApplicationList`, `EmployerJobList` and
  `JobPostingForm`.

  **Nothing to do on upgrade** — the overrides are simply gone and `Card` styles
  itself. Light mode is byte-identical, because `Card`'s own background *is*
  white. If you were relying on the forced white in dark mode, pass your own
  `className`.

  A `dark-mode` test now scans source for colour literals that have no dark
  counterpart, so this cannot come back silently. It deliberately permits
  `text-white` on an element that paints its own non-neutral background
  (`!bg-brand`), since that pairing is correct in both themes.

## 0.2.0 — 2026-08-07

### Changed

- **BREAKING — Node 22 is no longer supported.** `engines.node` moves from `>=22` to `>=22`.

  **What you must do:** on Node 22 or newer, nothing. Note npm only *warns* on an `engines` mismatch while **pnpm fails the install**, so this surfaces differently depending on your package manager. Node 18 is end-of-life and 20 is maintenance-only.

- **BREAKING — React 18 is no longer supported.** `peerDependencies.react` / `react-dom` are now `^19.0.0`.

  **What you must do:** on React 19, nothing. On React 18, stay on the previous release, or upgrade your app to 19 first.

  React 18 support was a claim nothing tested — every build and test in this package ran against 19, so the 18 half of the old range was never executed. An untested compatibility claim is worse than an absent one, because it reads as support.

### Why

These are the kit 0.5 platform floors, applied across every package at once so a consumer never has to resolve a mix. **No API changed, nothing was removed, nothing was renamed** — only what the package requires.


## 0.1.0 — 2026-08-01

**First published release.** Public board, employer posting management and candidate applications — the React surface for `particle-academy/laravel-jobs`. Controlled components, no router and no HTTP client of its own.

### Added

- **CI** — matching the rest of the Fancy kit.
- This changelog. Entries start here rather than being reconstructed after the
  fact: the reasoning behind the earlier commits has already evaporated, and
  inventing it would be worse than admitting the gap.

