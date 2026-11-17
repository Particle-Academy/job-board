# Using @particle-academy/job-board — guide for agents

How an agent installs and uses this package in a consumer app. What the package
is, is in [README.md](./README.md). Notes for working ON this repo's code are in
[CONTRIBUTING.md](./CONTRIBUTING.md).

## Install

```bash
npm install @particle-academy/job-board
```

- **Peers:** `@particle-academy/react-fancy` `>=4`, `react ^19`, `react-dom ^19`,
  `axios >=1`. They are peers so the host owns the React copy and the HTTP
  interceptors.
- **Node:** `>=22`.
- **The server half** is the Composer package `particle-academy/laravel-jobs`.
- **Tailwind v4 must see the compiled JS**, or the styling silently goes missing:

  ```css
  @source "../../node_modules/@particle-academy/job-board/dist";
  ```

## Find it on the Fancy MCP server

The catalog server is `https://ui.particle.academy/mcp` (streamable HTTP, no API
key; MCP id `fancy-ui`). This package's registry entries (`package` =
`job-board`):

- `job-board`, `job-detail`, `apply-form`, `job-posting-form`,
  `employer-job-list`, `application-list`

Use `search-components` ("job board", "job application") to find them,
`install-instructions` for the exact commands, and `get-component` for the
source bundle. Vendored source: `npx fancy-cli@latest add <slug>`. The backend
half is found with `search-backend-packages`.

## API essentials

- **Components:** `JobBoard`, `JobCard`, `JobDetail`, `ApplyForm`,
  `JobPostingForm` (never sets status), `EmployerJobList`, `ApplicationList`.
  All are controlled and presentational: they hold no server state, raise
  callbacks rather than fetching, and take JSON-friendly props.
- **`JobsClient`** wraps the `laravel-jobs` API. It defaults to cookie auth with
  Laravel's XSRF header names, so it works unchanged in a session-authenticated
  Inertia app. Employer-side calls throw if no employer is set: pass
  `employerId` to the constructor or call `setEmployer()`.
- **Formatting helpers:** `formatPay`, `formatLocation`, `formatPosted`,
  `postingStatusColor`, `applicationStatusColor`, and the option lists
  `EMPLOYMENT_TYPE_OPTIONS`, `PAY_UNIT_OPTIONS`, `APPLICATION_STATUS_OPTIONS`.
  Use these rather than re-deriving enum labels per screen.

## Traps

- **The UI is not the authorization.** `laravel-jobs` gates on
  `AuthorizesEmployers` and `GatesPublishing`, both deny-by-default on the
  server. Hiding a button is presentation only.
- **Publish denials carry a `code` and `meta`** (`PublishDecision`). Use them to
  respond meaningfully (send to checkout, show a quota) instead of printing a
  generic failure.
- **Anonymous applications are supported by the backend.** Do not require an
  authenticated user for `ApplyForm` unless the host wants that.
- **`formatPay` returns `null`**, not an empty string, when a posting has no pay
  information. Omit the line rather than printing a blank.
- **A working consumer to read:**
  [`laravel-jobs-reference`](https://github.com/Particle-Academy/laravel-jobs-reference)
  installs this package from npm and drives the published `JobsClient` against
  a real backend.
