import { Badge, Button, Card, Heading, Select, Text } from '@particle-academy/react-fancy';
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
    emptyMessage = 'No applications yet.',
    className,
}: ApplicationListProps) {
    if (applications.length === 0) {
        return (
            <Card
                variant="outlined"
                padding="lg"
                className={`!rounded-xl !border-secondary-200 !bg-white text-center ${className ?? ''}`}
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
                        className="!rounded-xl !border-secondary-200 !bg-white !shadow-sm"
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
