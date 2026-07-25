# @particle-academy/job-board

Job board UX for the [Fancy UI](https://github.com/Particle-Academy) kit — public
listings, employer posting management, and candidate applications.

Built **strictly on Fancy UI primitives** (`@particle-academy/react-fancy`):
`Card`, `Button`, `Badge`, `Heading`, `Text`, `Input`, `Select`, `Textarea`,
`Switch`, `Callout`. Raw HTML is limited to layout scaffolding.

The server half is
[`particle-academy/laravel-jobs`](https://github.com/Particle-Academy/laravel-jobs).

## Install

```sh
npm install @particle-academy/job-board
```

Peers: `@particle-academy/react-fancy` >=4, `react` 18/19, `axios` >=1.

## Components

Every component is **controlled and presentational** — it holds no server state,
raises callbacks rather than fetching, and takes JSON-friendly props. That keeps
them equally drivable by a human, an Inertia page, or an agent over an MCP
bridge (the Human+ contract).

| Component | For |
|---|---|
| `JobBoard` | The public board — filter bar over a grid of postings. |
| `JobCard` | One posting in a list. |
| `JobDetail` | A full posting with the apply call to action. |
| `ApplyForm` | The candidate's application form. |
| `JobPostingForm` | Create/edit a posting. Never sets status. |
| `EmployerJobList` | The employer's postings in every status, with publish/close actions. |
| `ApplicationList` | Applications — used from both the employer and candidate side. |

```tsx
import { JobBoard, JobsClient } from '@particle-academy/job-board';

const client = new JobsClient();
const [filters, setFilters] = useState({});
const [postings, setPostings] = useState([]);

useEffect(() => {
    client.listPostings(filters).then((page) => setPostings(page.data));
}, [filters]);

<JobBoard
    postings={postings}
    filters={filters}
    onFiltersChange={setFilters}
    onOpenPosting={(p) => router.visit(`/jobs/${p.slug}`)}
/>;
```

## Client

`JobsClient` wraps the `laravel-jobs` API. It defaults to cookie auth with
Laravel's XSRF header names, so it works unchanged inside a session
authenticated Inertia app.

```ts
const client = new JobsClient({ employerId: agency.id });

await client.listPostings({ search: 'patrol', is_remote: true });
await client.createPosting({ title: 'Overnight patrol guard' });
await client.publishPosting(postingId);
await client.listEmployerApplications({ status: 'submitted' });
await client.setApplicationStatus(applicationId, 'shortlisted', 'Strong references.');
```

Employer-side calls throw if no employer is set — pass `employerId` to the
constructor or call `setEmployer()`.

## Formatting helpers

`formatPay`, `formatLocation`, `formatPosted`, `postingStatusColor`,
`applicationStatusColor`, plus the option lists used by the forms
(`EMPLOYMENT_TYPE_OPTIONS`, `PAY_UNIT_OPTIONS`, `APPLICATION_STATUS_OPTIONS`).

`formatPay` returns `null` rather than an empty string when a posting has no pay
information, so callers can omit the line entirely instead of printing a blank.

## Tailwind note

These components ship compiled JS. Tailwind v4 only generates classes it can
**see**, so add this package to your CSS scan or its styling will silently go
missing:

```css
@source "../../node_modules/@particle-academy/job-board/dist";
```

Consuming the source directly via an alias? Point `@source` at that path instead.

## License

MIT.
