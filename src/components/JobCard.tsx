import { Badge, Button, Card, Heading, Text } from '@particle-academy/react-fancy';
import { formatLocation, formatPay, formatPosted } from '../format';
import type { JobPosting } from '../types';

export interface JobCardProps {
    posting: JobPosting;
    /** Called when the card is opened. Omit to render a non-interactive card. */
    onOpen?: (posting: JobPosting) => void;
    /** Label for the action. Defaults to "View job". */
    actionLabel?: string;
    /** Show the employer name. Off inside an employer's own list. */
    showEmployer?: boolean;
    className?: string;
}

/**
 * One posting, as it appears in a list. Presentational and controlled — it
 * raises `onOpen` and renders nothing else interactive.
 */
export function JobCard({
    posting,
    onOpen,
    actionLabel = 'View job',
    showEmployer = true,
    className,
}: JobCardProps) {
    const pay = formatPay(posting);
    const location = formatLocation(posting);
    const posted = formatPosted(posting.published_at);

    return (
        <Card
            variant="outlined"
            padding="lg"
            className={`!rounded-xl !border-secondary-200 !bg-white !shadow-sm hover:!shadow-md transition flex flex-col ${className ?? ''}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <Heading as="h3" size="lg" weight="bold" className="!text-secondary-900">
                        {posting.title}
                    </Heading>
                    {showEmployer && posting.employer?.name && (
                        <Text size="sm" color="muted" className="!mt-1">
                            {posting.employer.name}
                        </Text>
                    )}
                </div>
                {posting.employment_type_label && (
                    // shrink-0/nowrap: as a flex sibling of a long title the
                    // badge otherwise gets squeezed and wraps mid-label.
                    <Badge
                        color="zinc"
                        variant="soft"
                        size="sm"
                        className="!shrink-0 !whitespace-nowrap"
                    >
                        {posting.employment_type_label}
                    </Badge>
                )}
            </div>

            {posting.description && (
                <Text color="muted" size="sm" className="!mt-3 line-clamp-2">
                    {posting.description}
                </Text>
            )}

            <div className="mt-4 grid gap-1">
                {location && (
                    <Text size="sm" className="!text-secondary-700">
                        {location}
                    </Text>
                )}
                {pay && (
                    <Text size="sm" weight="semibold" className="!text-secondary-900">
                        {pay}
                    </Text>
                )}
            </div>

            <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                <Text size="xs" color="muted">
                    {posted ?? ' '}
                </Text>
                {onOpen && (
                    <Button
                        type="button"
                        onClick={() => onOpen(posting)}
                        className="!bg-brand hover:!bg-primary-600 !text-white !font-semibold !px-4 !py-2 !rounded-md !shadow-sm"
                    >
                        {actionLabel}
                    </Button>
                )}
            </div>
        </Card>
    );
}
