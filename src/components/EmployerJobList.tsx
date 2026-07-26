import { Badge, Button, Card, Heading, Text } from '@particle-academy/react-fancy';
import { formatLocation, formatPay, postingStatusColor } from '../format';
import type { JobPosting } from '../types';

export interface EmployerJobListProps {
    postings: JobPosting[];
    onEdit?: (posting: JobPosting) => void;
    onPublish?: (posting: JobPosting) => void;
    onUnpublish?: (posting: JobPosting) => void;
    onClose?: (posting: JobPosting) => void;
    onViewApplicants?: (posting: JobPosting) => void;
    onCreate?: () => void;
    /** Publishing is gated by the host; false renders the reason instead. */
    canPublish?: boolean;
    publishBlockedReason?: string;
    /**
     * Label for the publish action, per posting. Hosts that charge per listing
     * or meter it against a plan use this to say so up front — "Publish — $49"
     * beats a bare "Publish" that silently opens a checkout.
     */
    publishLabel?: (posting: JobPosting) => string;
    /** Slug of the posting currently mid-action, to show a spinner on its row. */
    busyId?: number | null;
    className?: string;
}

/**
 * The employer's own postings, in every status, with the actions that move
 * them between statuses.
 */
export function EmployerJobList({
    postings,
    onEdit,
    onPublish,
    onUnpublish,
    onClose,
    onViewApplicants,
    onCreate,
    canPublish = true,
    publishBlockedReason,
    publishLabel,
    busyId = null,
    className,
}: EmployerJobListProps) {
    if (postings.length === 0) {
        return (
            <Card
                variant="outlined"
                padding="lg"
                className={`!rounded-xl !border-secondary-200 !bg-white text-center ${className ?? ''}`}
            >
                <Heading as="h3" size="lg" weight="bold" className="!text-secondary-900">
                    No postings yet
                </Heading>
                <Text color="muted" className="!mt-2">
                    Create your first job posting to start receiving applications.
                </Text>
                {onCreate && (
                    <div className="mt-5 flex justify-center">
                        <Button
                            type="button"
                            onClick={onCreate}
                            className="!bg-brand hover:!bg-primary-600 !text-white !font-semibold !px-6 !py-2.5 !rounded-md !shadow-sm"
                        >
                            New posting
                        </Button>
                    </div>
                )}
            </Card>
        );
    }

    return (
        <div className={`grid gap-3 ${className ?? ''}`}>
            {postings.map((posting) => {
                const busy = busyId === posting.id;
                const pay = formatPay(posting);
                const location = formatLocation(posting);

                return (
                    <Card
                        key={posting.id}
                        variant="outlined"
                        padding="lg"
                        className="!rounded-xl !border-secondary-200 !bg-white !shadow-sm"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        color={postingStatusColor(posting.status)}
                                        variant="soft"
                                        size="sm"
                                    >
                                        {posting.status_label}
                                    </Badge>
                                    {posting.employment_type_label && (
                                        <Text size="xs" color="muted">
                                            {posting.employment_type_label}
                                        </Text>
                                    )}
                                </div>

                                <Heading
                                    as="h3"
                                    size="lg"
                                    weight="bold"
                                    className="!mt-2 !text-secondary-900"
                                >
                                    {posting.title}
                                </Heading>

                                <Text size="sm" color="muted" className="!mt-1">
                                    {[location, pay].filter(Boolean).join(' · ') || 'No location or pay set'}
                                </Text>
                            </div>

                            <div className="text-right">
                                <Text size="lg" weight="bold" className="!text-secondary-900 !text-2xl">
                                    {posting.applications_count}
                                </Text>
                                <Text size="xs" color="muted">
                                    {posting.applications_count === 1 ? 'applicant' : 'applicants'}
                                </Text>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-secondary-200 pt-4">
                            {onViewApplicants && posting.applications_count > 0 && (
                                <Button
                                    type="button"
                                    onClick={() => onViewApplicants(posting)}
                                    className="!bg-brand hover:!bg-primary-600 !text-white !font-semibold !px-4 !py-2 !rounded-md"
                                >
                                    View applicants
                                </Button>
                            )}

                            {onEdit && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => onEdit(posting)}
                                    className="!text-secondary-700 hover:!text-brand"
                                >
                                    Edit
                                </Button>
                            )}

                            {posting.status !== 'published' && onPublish && (
                                canPublish ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        loading={busy}
                                        disabled={busy}
                                        onClick={() => onPublish(posting)}
                                        className="!text-secondary-700 hover:!text-brand"
                                    >
                                        {publishLabel?.(posting) ?? 'Publish'}
                                    </Button>
                                ) : (
                                    <Text size="xs" color="muted">
                                        {publishBlockedReason ?? 'Publishing locked until approved'}
                                    </Text>
                                )
                            )}

                            {posting.status === 'published' && onUnpublish && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    loading={busy}
                                    disabled={busy}
                                    onClick={() => onUnpublish(posting)}
                                    className="!text-secondary-700 hover:!text-brand"
                                >
                                    Unpublish
                                </Button>
                            )}

                            {posting.status !== 'closed' && onClose && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    loading={busy}
                                    disabled={busy}
                                    onClick={() => onClose(posting)}
                                    className="!text-secondary-700 hover:!text-brand"
                                >
                                    Close
                                </Button>
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
