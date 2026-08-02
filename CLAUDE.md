# AGENTS.md — @particle-academy/job-board

The React surface for `particle-academy/laravel-jobs`: a public board, employer
posting management, and candidate applications. `CLAUDE.md` symlinks here.

## The surface

| Component | Renders |
|---|---|
| `JobBoard` | the public list, with filters |
| `JobCard` | one posting in a list |
| `JobDetail` | a single posting |
| `ApplyForm` | a candidate application |
| `JobPostingForm` | create / edit a posting (employer side) |
| `EmployerJobList` | an employer's own postings + their status |
| `ApplicationList` | applications against a posting |

`JobsClient` wraps the REST surface. `format.ts` carries the display helpers for
the three enums (`JobPostingStatus`, `EmploymentType`, `ApplicationStatus`) —
use those rather than re-deriving labels per screen.

## Rules

- **Controlled, per the Fancy component contract.** `value` + `onChange`, stable
  `data-*` handles, JSON-friendly props. No internal-only state an agent might
  need to read or write.
- **The UI must not be the authorization.** `laravel-jobs` gates on
  `AuthorizesEmployers` and `GatesPublishing`, both deny-by-default server-side.
  Hiding a button is presentation; it is never the control. Assume every action
  a component can render will also be attempted directly against the API.
- **Publish denials carry a `code` and `meta`** — `PublishDecision` is designed
  so the UI can respond meaningfully (send to checkout, show a quota) instead of
  printing a generic failure. Surface them.
- **Anonymous applications are supported by the backend.** Don't require an
  authenticated user in `ApplyForm` unless the host has said so.
- **Peer, not dependency, on `react-fancy`** and `axios`, so the host owns the
  React copy and the HTTP interceptors.

## Status

Published 0.1.0, but **not yet consumed by the showcase** — the decision was
that the jobs pair joins the kit as packages while no job board is built into
the sandbox yet. So this surface has never been exercised against a real backend
by us. Treat the first integration as a bug-finding exercise, not a formality.

## Testing

No suite yet. First thing worth covering: `format.ts` across every enum case,
since a missing case degrades silently to a blank label.

## Publishing

Pure OIDC via Trusted Publishing — no tokens. `publish.yml` fires on `v*.*.*`
with `permissions: id-token: write`. **npm pinned to `11.18.0`**: OIDC needs
11.5+, the runner ships 10.x, and `npm@latest` (12.x) broke `--provenance`.
