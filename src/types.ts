export type JobPostingStatus = 'draft' | 'published' | 'closed';

export type EmploymentType =
    | 'full_time'
    | 'part_time'
    | 'contract'
    | 'temporary'
    | 'internship'
    | 'volunteer';

export type PayUnit = 'hour' | 'day' | 'week' | 'month' | 'year';

export type ApplicationStatus =
    | 'submitted'
    | 'reviewing'
    | 'shortlisted'
    | 'rejected'
    | 'hired'
    | 'withdrawn';

/** The employer is host-supplied, so only the fields the API always returns. */
export interface JobEmployer {
    id: number | string;
    name?: string | null;
}

export interface JobPosting {
    id: number;
    employer_id: number | string;
    title: string;
    slug: string;
    description?: string | null;
    requirements?: string | null;

    employment_type?: EmploymentType | null;
    employment_type_label?: string | null;
    location?: string | null;
    is_remote: boolean;

    pay_min?: number | null;
    pay_max?: number | null;
    pay_unit?: PayUnit | null;
    currency?: string | null;

    contact_email?: string | null;
    contact_phone?: string | null;
    apply_url?: string | null;

    status: JobPostingStatus;
    status_label: string;
    published_at?: string | null;
    closed_at?: string | null;
    expires_at?: string | null;

    openings: number;
    applications_count: number;
    is_visible: boolean;
    accepts_applications: boolean;

    employer?: JobEmployer;

    created_at?: string | null;
    updated_at?: string | null;
}

export interface JobApplicationCandidate {
    id: number | string;
    name?: string | null;
    email?: string | null;
}

export interface JobApplication {
    id: number;
    job_posting_id: number;
    user_id: number | string;

    cover_letter?: string | null;
    resume_path?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;

    status: ApplicationStatus;
    status_label: string;
    is_terminal: boolean;
    employer_notes?: string | null;

    submitted_at?: string | null;
    status_changed_at?: string | null;

    job_posting?: JobPosting;
    candidate?: JobApplicationCandidate;

    created_at?: string | null;
}

/** Values accepted when creating or editing a posting. */
export interface JobPostingInput {
    title: string;
    description?: string | null;
    requirements?: string | null;
    employment_type?: EmploymentType | null;
    location?: string | null;
    is_remote?: boolean;
    pay_min?: number | null;
    pay_max?: number | null;
    pay_unit?: PayUnit | null;
    currency?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    apply_url?: string | null;
    openings?: number | null;
    expires_at?: string | null;
}

export interface JobApplicationInput {
    cover_letter?: string | null;
    resume_path?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
}

export interface JobBoardFilters {
    search?: string;
    employment_type?: EmploymentType | '';
    location?: string;
    is_remote?: boolean;
    employer_id?: number | string;
    per_page?: number;
}

/** Laravel's paginator envelope, narrowed to what the UI uses. */
export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
