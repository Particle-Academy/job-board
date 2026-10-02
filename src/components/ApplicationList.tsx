import { Badge, Button, Card, Heading, Select, Text } from '@particle-academy/react-fancy';
import type { ReactNode } from 'react';
import { APPLICATION_STATUS_OPTIONS, applicationStatusColor, formatPosted } from '../format';
import type { ApplicationStatus, JobApplication } from '../types';

export interface ApplicationListProps {
    applications: JobApplication[];
    /** Employer moving a candidate along. Omit for a read-only list. */
    onStatusChange?: (application: JobApplication, status: ApplicationStatus) => void;
    /** Candidate withdrawing their own application. */
    onWithdraw?: (application: JobApplication) => void;
    /** Show which posting each application is for. Off within one posting. */
    showPosting?: boolean;
    /** Show candidate identity. Off on the candidate's own list. */
    showCandidate?: boolean;
    busyId?: number | null;
    /**
     * The host's OWN control for a row, rendered beside the built-in actions.
     *
     * A FUNCTION rather than children, because a list needs the row to decide
     * what to render — a resume download link needs the id of the application it
     * is on, and children could only ever render the same thing on every row.
     *
     * Generic rather than a `resume` prop, for the reason `ApplyForm`'s slot is:
     * this component cannot know how a host serves a file, and the next
     * host-specific control should not need another release. Return `null` for a
     * row that has nothing — no wrapper is rendered for it.
     *
     * The first consumer could not show a resume link on EITHER side, employer or
     * candidate, because the prop set was closed. That is the gap.
     */
    rowActions?: (application: JobApplication) => ReactNode;
    emptyMessage?: string;
    className?: string;
}

/**
 * A list of applications, used from both sides: the employer reviewing
 * candidates, and the candidate tracking their own submissions.
 */
export function ApplicationList({
    applications,
    onStatusChange,
    onWithdraw,
    showPosting = true,
    showCandidate = true,
    busyId = null,
    rowActions,
    emptyMessage = 'No applications yet.',
    className,
}: ApplicationListProps) {
    if (applications.length === 0) {
        return (
            <Card
                variant="outlined"
                padding="lg"
                className={`!rounded-xl !border-secondary-200 text-center ${className ?? ''}`}
            >
                <Text color="muted">{emptyMessage}</Text>
            </Card>
        );
    }

    return (
        <div className={`grid gap-3 ${className ?? ''}`}>
            {applications.map((application) => {
                const busy = busyId === application.id;
                const submitted = formatPosted(application.submitted_at)?.replace('Posted', 'Applied');

                return (
                    <Card
                        key={application.id}
                        variant="outlined"
                        padding="lg"
                        className="!rounded-xl !border-secondary-200 !shadow-sm"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0">
                                <Badge
                                    color={applicationStatusColor(application.status)}
                                    variant="soft"
                                    size="sm"
                                >
                                    {application.status_label}
                                </Badge>

                                {showCandidate && application.candidate && (
                                    <Heading
                                        as="h3"
                                        size="lg"
                                        weight="bold"
                                        className="!mt-2 !text-secondary-900"
                                    >
                                        {application.candidate.name ?? 'Candidate'}
                                    </Heading>
                                )}

                                {showPosting && application.job_posting && (
                                    <Text
                                        size={showCandidate ? 'sm' : 'lg'}
                                        weight={showCandidate ? undefined : 'bold'}
                                        className="!mt-1 !text-secondary-900"
                                    >
                                        {application.job_posting.title}
                                    </Text>
                                )}

                                <Text size="sm" color="muted" className="!mt-1">
                                    {[
                                        showCandidate ? application.candidate?.email : null,
                                        application.contact_phone,
                                        submitted,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </Text>
                            </div>

                            <div className="flex items-center gap-2">
                                {/*
                                    The host's control, FIRST in the action row.
                                    A resume download is a read, and reads belong
                                    left of the controls that change something —
                                    putting it after a status Select would make the
                                    destructive-ish action the easier target.
                                    Called per row with that row's application, and
                                    rendered only when it returns something, so a
                                    host showing a link on some rows and not others
                                    gets no empty box on the rest.
                                */}
                                {rowActions
                                    ? (() => {
                                          const actions = rowActions(application);
                                          return actions ? (
                                              <div
                                                  data-job-board-application-actions=""
                                                  className="flex items-center gap-2"
                                              >
                                                  {actions}
                                              </div>
                                          ) : null;
                                      })()
                                    : null}

                                {onStatusChange && (
                                    <Select
                                        list={[...APPLICATION_STATUS_OPTIONS]}
                                        value={application.status}
                                        disabled={busy}
                                        onValueChange={(status) =>
                                            onStatusChange(application, status as ApplicationStatus)
                                        }
                                        className="!min-w-40"
                                    />
                                )}

                                {onWithdraw && !application.is_terminal && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        loading={busy}
                                        disabled={busy}
                                        onClick={() => onWithdraw(application)}
                                        className="!text-secondary-700 hover:!text-brand"
                                    >
                                        Withdraw
                                    </Button>
                                )}
                            </div>
                        </div>

                        {application.cover_letter && (
                            <Text
                                size="sm"
                                className="!mt-4 !text-secondary-700 whitespace-pre-line border-t border-secondary-200 pt-4"
                            >
                                {application.cover_letter}
                            </Text>
                        )}

                        {application.employer_notes && (
                            <Text size="xs" color="muted" className="!mt-3">
                                Notes: {application.employer_notes}
                            </Text>
                        )}
                    </Card>
                );
            })}
        </div>
    );
}
