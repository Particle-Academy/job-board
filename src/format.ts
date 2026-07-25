import type { ApplicationStatus, JobPosting, JobPostingStatus } from './types';

const PAY_UNIT_SUFFIX: Record<string, string> = {
    hour: '/hr',
    day: '/day',
    week: '/wk',
    month: '/mo',
    year: '/yr',
};

/**
 * "$20–$30/hr", "From $45,000/yr", "Up to $25/hr", or null when the posting
 * gives no pay information — callers should omit the line entirely rather than
 * print an empty range.
 */
export function formatPay(posting: Pick<JobPosting, 'pay_min' | 'pay_max' | 'pay_unit' | 'currency'>): string | null {
    const { pay_min, pay_max, pay_unit, currency } = posting;

    if (pay_min == null && pay_max == null) {
        return null;
    }

    const money = (n: number) =>
        new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency || 'USD',
            maximumFractionDigits: n % 1 === 0 ? 0 : 2,
        }).format(n);

    const suffix = pay_unit ? (PAY_UNIT_SUFFIX[pay_unit] ?? `/${pay_unit}`) : '';

    if (pay_min != null && pay_max != null) {
        return pay_min === pay_max
            ? `${money(pay_min)}${suffix}`
            : `${money(pay_min)}–${money(pay_max)}${suffix}`;
    }

    return pay_min != null
        ? `From ${money(pay_min)}${suffix}`
        : `Up to ${money(pay_max as number)}${suffix}`;
}

/** "Torrance, CA", "Remote", or "Remote · Torrance, CA" when it is both. */
export function formatLocation(posting: Pick<JobPosting, 'location' | 'is_remote'>): string | null {
    if (posting.is_remote && posting.location) {
        return `Remote · ${posting.location}`;
    }
    if (posting.is_remote) {
        return 'Remote';
    }
    return posting.location || null;
}

/** Coarse "posted" line. Deliberately vague — exact times add nothing here. */
export function formatPosted(iso?: string | null): string | null {
    if (!iso) return null;

    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return null;

    const days = Math.floor((Date.now() - then) / 86_400_000);

    if (days <= 0) return 'Posted today';
    if (days === 1) return 'Posted yesterday';
    if (days < 7) return `Posted ${days} days ago`;
    if (days < 14) return 'Posted last week';
    if (days < 60) return `Posted ${Math.floor(days / 7)} weeks ago`;
    return `Posted ${Math.floor(days / 30)} months ago`;
}

/** Fancy Badge colours, chosen so status reads at a glance. */
export function postingStatusColor(status: JobPostingStatus): 'green' | 'zinc' | 'red' {
    switch (status) {
        case 'published':
            return 'green';
        case 'closed':
            return 'red';
        default:
            return 'zinc';
    }
}

export function applicationStatusColor(status: ApplicationStatus): 'green' | 'zinc' | 'red' | 'blue' {
    switch (status) {
        case 'hired':
            return 'green';
        case 'shortlisted':
            return 'blue';
        case 'rejected':
        case 'withdrawn':
            return 'red';
        default:
            return 'zinc';
    }
}

export const EMPLOYMENT_TYPE_OPTIONS = [
    { value: 'full_time', label: 'Full time' },
    { value: 'part_time', label: 'Part time' },
    { value: 'contract', label: 'Contract' },
    { value: 'temporary', label: 'Temporary' },
    { value: 'internship', label: 'Internship' },
    { value: 'volunteer', label: 'Volunteer' },
] as const;

export const PAY_UNIT_OPTIONS = [
    { value: 'hour', label: 'per hour' },
    { value: 'day', label: 'per day' },
    { value: 'week', label: 'per week' },
    { value: 'month', label: 'per month' },
    { value: 'year', label: 'per year' },
] as const;

export const APPLICATION_STATUS_OPTIONS = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'rejected', label: 'Not selected' },
    { value: 'hired', label: 'Hired' },
] as const;
