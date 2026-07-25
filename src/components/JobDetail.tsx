import { Badge, Button, Callout, Card, Heading, Text } from '@particle-academy/react-fancy';
import { formatLocation, formatPay, formatPosted } from '../format';
import type { JobPosting } from '../types';

export interface JobDetailProps {
    posting: JobPosting;
    /** Rendered as the primary action. Omit when the viewer cannot apply. */
    onApply?: (posting: JobPosting) => void;
    applyLabel?: string;
    /** Set once the viewer has applied — replaces the action with a note. */
    hasApplied?: boolean;
    /** Explains why applying is unavailable, e.g. "Sign in to apply". */
    applyDisabledReason?: string;
    applying?: boolean;
    className?: string;
}

/** A single posting in full, with the apply call to action. */
export function JobDetail({
    posting,
    onApply,
    applyLabel = 'Apply now',
    hasApplied = false,
    applyDisabledReason,
    applying = false,
    className,
}: JobDetailProps) {
    const pay = formatPay(posting);
    const location = formatLocation(posting);
    const posted = formatPosted(posting.published_at);
    const closed = !posting.accepts_applications;

    return (
        <div className={`grid gap-5 ${className ?? ''}`}>
            <Card
                variant="outlined"
                padding="lg"
                className="!rounded-xl !border-secondary-200 !bg-white !shadow-sm"
            >
                <div className="flex flex-wrap items-center gap-2">
                    {posting.employment_type_label && (
                        <Badge color="zinc" variant="soft" size="sm">
                            {posting.employment_type_label}
                        </Badge>
                    )}
                    {posting.is_remote && (
                        <Badge color="green" variant="soft" size="sm">
                            Remote
                        </Badge>
                    )}
                    {posting.openings > 1 && (
                        <Text size="sm" color="muted">
                            {posting.openings} openings
                        </Text>
                    )}
                </div>

                <Heading as="h1" size="2xl" weight="bold" className="!mt-3 !text-secondary-900">
                    {posting.title}
                </Heading>

                {posting.employer?.name && (
                    <Text className="!mt-1 !text-secondary-700">{posting.employer.name}</Text>
                )}

                <div className="mt-4 grid gap-1">
                    {location && <Text className="!text-secondary-700">{location}</Text>}
                    {pay && (
                        <Text weight="semibold" className="!text-secondary-900">
                            {pay}
                        </Text>
                    )}
                    {posted && (
                        <Text size="sm" color="muted">
                            {posted}
                        </Text>
                    )}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                    {hasApplied ? (
                        <Badge color="green" variant="soft">
                            You have applied
                        </Badge>
                    ) : closed ? (
                        <Badge color="red" variant="soft">
                            No longer accepting applications
                        </Badge>
                    ) : onApply ? (
                        <Button
                            type="button"
                            loading={applying}
                            disabled={applying}
                            onClick={() => onApply(posting)}
                            className="!bg-brand hover:!bg-primary-600 !text-white !font-semibold !px-6 !py-2.5 !rounded-md !shadow-sm"
                        >
                            {applyLabel}
                        </Button>
                    ) : applyDisabledReason ? (
                        <Text size="sm" color="muted">
                            {applyDisabledReason}
                        </Text>
                    ) : null}

                    {posting.apply_url && (
                        <Button
                            href={posting.apply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="ghost"
                            className="!text-secondary-700 hover:!text-brand"
                        >
                            Apply on the employer’s site
                        </Button>
                    )}
                </div>
            </Card>

            {posting.description && (
                <Card
                    variant="outlined"
                    padding="lg"
                    className="!rounded-xl !border-secondary-200 !bg-white !shadow-sm"
                >
                    <Heading as="h2" size="lg" weight="bold" className="!text-secondary-900">
                        About this role
                    </Heading>
                    <Text className="!mt-3 !text-secondary-700 whitespace-pre-line">
                        {posting.description}
                    </Text>
                </Card>
            )}

            {posting.requirements && (
                <Card
                    variant="outlined"
                    padding="lg"
                    className="!rounded-xl !border-secondary-200 !bg-white !shadow-sm"
                >
                    <Heading as="h2" size="lg" weight="bold" className="!text-secondary-900">
                        Requirements
                    </Heading>
                    <Text className="!mt-3 !text-secondary-700 whitespace-pre-line">
                        {posting.requirements}
                    </Text>
                </Card>
            )}

            {(posting.contact_email || posting.contact_phone) && (
                <Callout color="zinc">
                    <Text size="sm">
                        Questions? Contact{' '}
                        {posting.contact_email && (
                            <span className="font-semibold">{posting.contact_email}</span>
                        )}
                        {posting.contact_email && posting.contact_phone && ' · '}
                        {posting.contact_phone && (
                            <span className="font-semibold">{posting.contact_phone}</span>
                        )}
                    </Text>
                </Callout>
            )}
        </div>
    );
}
