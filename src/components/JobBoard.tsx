import { Button, Card, Heading, Input, Select, Switch, Text } from '@particle-academy/react-fancy';
import { EMPLOYMENT_TYPE_OPTIONS } from '../format';
import type { JobBoardFilters, JobPosting } from '../types';
import { JobCard } from './JobCard';

export interface JobBoardProps {
    postings: JobPosting[];
    /** Controlled filter state. */
    filters?: JobBoardFilters;
    onFiltersChange?: (filters: JobBoardFilters) => void;
    onOpenPosting?: (posting: JobPosting) => void;
    loading?: boolean;
    /** Shown when there are no results. */
    emptyMessage?: string;
    /** Hide the filter bar for embedded/compact uses. */
    showFilters?: boolean;
    className?: string;
}

/**
 * The public board: a filter bar over a grid of postings.
 *
 * Fully controlled — it owns no filter state of its own, so the host can drive
 * it from a URL query string, an Inertia page prop, or an agent.
 */
export function JobBoard({
    postings,
    filters = {},
    onFiltersChange,
    onOpenPosting,
    loading = false,
    emptyMessage = 'No openings match your search right now.',
    showFilters = true,
    className,
}: JobBoardProps) {
    const patch = (next: Partial<JobBoardFilters>) => onFiltersChange?.({ ...filters, ...next });

    const hasFilters = Boolean(
        filters.search || filters.employment_type || filters.location || filters.is_remote,
    );

    return (
        <div className={`grid gap-5 ${className ?? ''}`}>
            {showFilters && (
                <Card
                    variant="outlined"
                    padding="lg"
                    className="!rounded-xl !border-secondary-200 !bg-white !shadow-sm"
                >
                    <div className="grid gap-4 md:grid-cols-4 md:items-end">
                        <div className="md:col-span-2">
                            <Input
                                type="search"
                                label="Search"
                                placeholder="Job title, keyword or location"
                                value={filters.search ?? ''}
                                onValueChange={(search) => patch({ search })}
                            />
                        </div>

                        <Select
                            label="Type"
                            placeholder="Any type"
                            list={[...EMPLOYMENT_TYPE_OPTIONS]}
                            value={filters.employment_type ?? ''}
                            onValueChange={(v) =>
                                patch({ employment_type: (v || '') as JobBoardFilters['employment_type'] })
                            }
                        />

                        <div className="flex items-center justify-between gap-3 md:pb-2">
                            <Switch
                                label="Remote only"
                                checked={Boolean(filters.is_remote)}
                                onCheckedChange={(checked) =>
                                    patch({ is_remote: checked || undefined })
                                }
                            />
                            {hasFilters && onFiltersChange && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => onFiltersChange({})}
                                    className="!text-secondary-700 hover:!text-brand"
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {loading ? (
                <Text color="muted">Loading openings…</Text>
            ) : postings.length === 0 ? (
                <Card
                    variant="outlined"
                    padding="lg"
                    className="!rounded-xl !border-secondary-200 !bg-white text-center"
                >
                    <Heading as="h3" size="lg" weight="bold" className="!text-secondary-900">
                        Nothing here yet
                    </Heading>
                    <Text color="muted" className="!mt-2">
                        {emptyMessage}
                    </Text>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {postings.map((posting) => (
                        <JobCard key={posting.id} posting={posting} onOpen={onOpenPosting} />
                    ))}
                </div>
            )}
        </div>
    );
}
