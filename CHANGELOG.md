# Changelog

Notable changes to `@particle-academy/job-board`.

**BREAKING** marks anything that can stop working on upgrade. This package is
pre-1.0, so breaking changes land in MINOR releases — read those entries before
upgrading.

---

## [Unreleased]

## [0.4.0] - 2026-10-02

### Added

- **`ApplicationList` takes a per-row slot**, so a host can put its own control on
  each row.

  ```tsx
  <ApplicationList
      applications={applications}
      rowActions={(application) => <ResumeLink application={application} />}
  />
  ```

  `ApplicationListProps` was a closed set, and this component is used from **both
  sides** — the employer reviewing applicants and the candidate looking at their
  own. So neither could show a resume download link: the route and its
  authorisation existed and were tested, and the link had nowhere to go. The first
  consumer's only options were to fork the list or render a second parallel list of
  links beside it.

  **A function, not children**, because a list needs the row to decide what to
  render — a download link needs the id of the application it is on, and children
  could only ever render the same thing on every row. There is a test asserting the
  callback receives each row's own application, because getting the last row's for
  every row would look plausible and link everything to one application.

  **Generic rather than a `resume` prop**, for the same reason as `ApplyForm`'s
  slot in 0.3.0: this component cannot know how a host serves a file, and the next
  host-specific control should not need another release.

  Rendered **first** in the action row — a download is a read, and reads belong
  left of the controls that change something. Return `null` for a row with nothing
  and no wrapper is rendered, so a host showing a link on only some rows gets no
  empty box on the rest. Carries a `data-job-board-application-actions` handle.

  **What you must do: nothing.** Purely additive; omitting `rowActions` renders
  exactly as before, which has its own test, as does the empty-list case never
  calling the callback at all.


## [0.3.0] - 2026-10-02

### Added

- **`ApplyForm` takes a slot**, so a host can add its own fields without forking
  the component.

  `ApplyFormProps` was a closed set — `posting`, `onSubmit`, `onCancel`,
  `submitting`, `errors`, `defaults`, `className` — with no children and no file
  field. The first consumer's resume story was blocked on exactly that: there was
  no way to put a resume input on this form at all.

  ```tsx
  <ApplyForm posting={posting} onSubmit={send}>
      <Input type="file" label="Resume" onChange={...} />
  </ApplyForm>
  ```

  **A generic slot rather than a `resume` prop, at the consumer's own suggestion
  and they were right.** `resume_path` is one host's requirement; a slot serves
  every host-specific field without another round trip through us. The backend
  already has a `resume_path` column and API validation with nothing writing to
  it, so a resume-shaped prop would have looked like the answer while still not
  being general.

  **Where it renders is part of the contract**, not styling: INSIDE the `<form>`,
  so host fields take part in submission, native validation and the disabled
  state instead of behaving like a second form; and ABOVE the actions, because a
  field below Submit reads as a footnote and gets missed. It carries a
  `data-job-board-apply-extra` handle, and the wrapper is omitted entirely when
  there are no children so an empty slot is not a stray grid row.

  **The host owns the field's state.** `onSubmit` still receives
  `JobApplicationInput` and nothing else — that is the package's contract and it
  does not move. Merge your own value in your own handler.

  **What you must do: nothing.** Purely additive; a caller passing no children
  renders exactly as before, which has its own test.

### Fixed

- **`AGENTS.md` said "No suite yet"** while two test files and a `test` script
  existed. True when written, never re-checked. A stale "there is nothing here"
  is worse than silence — the next agent either rebuilds the setup or concludes
  tests are not expected. It now says what exists, including that a DOM test needs
  `// @vitest-environment jsdom` because there is no `vitest.config.*` and the
  default environment is `node`.


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

