import axios, { AxiosInstance } from 'axios';
import type {
    ApplicationStatus,
    JobApplication,
    JobApplicationInput,
    JobBoardFilters,
    JobPosting,
    JobPostingInput,
    Paginated,
} from '../types';

export interface JobsClientOptions {
    baseUrl?: string;
    /** Employer the caller acts for. Required for the employer-side calls. */
    employerId?: number | string;
    bearerToken?: string;
}

type ResourceEnvelope<T> = { data: T };

/**
 * Thin client over `particle-academy/laravel-jobs`.
 *
 * Mirrors CoursesClient from @particle-academy/classroom: cookie auth by
 * default with Laravel's XSRF header names, so it works unchanged inside a
 * session-authenticated Inertia app.
 */
export class JobsClient {
    private readonly http: AxiosInstance;
    private employerId: number | string | undefined;

    constructor(options: JobsClientOptions = {}) {
        this.http = axios.create({
            baseURL: options.baseUrl ?? '/api/jobs',
            withCredentials: true,
            xsrfCookieName: 'XSRF-TOKEN',
            xsrfHeaderName: 'X-XSRF-TOKEN',
            headers: {
                Accept: 'application/json',
                ...(options.bearerToken ? { Authorization: `Bearer ${options.bearerToken}` } : {}),
            },
        });
        this.employerId = options.employerId;
    }

    setEmployer(id: number | string | undefined): void {
        this.employerId = id;
    }

    private requireEmployer(): number | string {
        if (this.employerId === undefined) {
            throw new Error(
                'No employer set on JobsClient. Pass employerId to the constructor or call setEmployer().',
            );
        }
        return this.employerId;
    }

    /* ---------------------------------------------------------------- board */

    async listPostings(filters: JobBoardFilters = {}): Promise<Paginated<JobPosting>> {
        const { data } = await this.http.get<Paginated<JobPosting>>('postings', {
            params: filters,
        });
        return data;
    }

    async getPosting(slug: string): Promise<JobPosting> {
        const { data } = await this.http.get<ResourceEnvelope<JobPosting>>(`postings/${slug}`);
        return data.data;
    }

    /* ------------------------------------------------------------ candidate */

    async apply(slug: string, input: JobApplicationInput = {}): Promise<JobApplication> {
        const { data } = await this.http.post<ResourceEnvelope<JobApplication>>(
            `postings/${slug}/applications`,
            input,
        );
        return data.data;
    }

    async listMyApplications(): Promise<Paginated<JobApplication>> {
        const { data } = await this.http.get<Paginated<JobApplication>>('my-applications');
        return data;
    }

    async withdraw(applicationId: number): Promise<JobApplication> {
        const { data } = await this.http.post<ResourceEnvelope<JobApplication>>(
            `applications/${applicationId}/withdraw`,
        );
        return data.data;
    }

    /* ------------------------------------------------------------- employer */

    async listEmployerPostings(params: { status?: string; per_page?: number } = {}): Promise<Paginated<JobPosting>> {
        const { data } = await this.http.get<Paginated<JobPosting>>(
            `employers/${this.requireEmployer()}/postings`,
            { params },
        );
        return data;
    }

    async createPosting(input: JobPostingInput): Promise<JobPosting> {
        const { data } = await this.http.post<ResourceEnvelope<JobPosting>>(
            `employers/${this.requireEmployer()}/postings`,
            input,
        );
        return data.data;
    }

    async updatePosting(postingId: number, input: Partial<JobPostingInput>): Promise<JobPosting> {
        const { data } = await this.http.patch<ResourceEnvelope<JobPosting>>(
            `employers/${this.requireEmployer()}/postings/${postingId}`,
            input,
        );
        return data.data;
    }

    async deletePosting(postingId: number): Promise<void> {
        await this.http.delete(`employers/${this.requireEmployer()}/postings/${postingId}`);
    }

    async publishPosting(postingId: number): Promise<JobPosting> {
        return this.transition(postingId, 'publish');
    }

    async unpublishPosting(postingId: number): Promise<JobPosting> {
        return this.transition(postingId, 'unpublish');
    }

    async closePosting(postingId: number): Promise<JobPosting> {
        return this.transition(postingId, 'close');
    }

    private async transition(postingId: number, action: string): Promise<JobPosting> {
        const { data } = await this.http.post<ResourceEnvelope<JobPosting>>(
            `employers/${this.requireEmployer()}/postings/${postingId}/${action}`,
        );
        return data.data;
    }

    async listEmployerApplications(
        params: { status?: ApplicationStatus; job_posting_id?: number; per_page?: number } = {},
    ): Promise<Paginated<JobApplication>> {
        const { data } = await this.http.get<Paginated<JobApplication>>(
            `employers/${this.requireEmployer()}/applications`,
            { params },
        );
        return data;
    }

    async setApplicationStatus(
        applicationId: number,
        status: ApplicationStatus,
        employerNotes?: string,
    ): Promise<JobApplication> {
        const { data } = await this.http.patch<ResourceEnvelope<JobApplication>>(
            `employers/${this.requireEmployer()}/applications/${applicationId}`,
            { status, ...(employerNotes !== undefined ? { employer_notes: employerNotes } : {}) },
        );
        return data.data;
    }
}
