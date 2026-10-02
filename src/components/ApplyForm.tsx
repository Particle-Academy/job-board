import { Button, Callout, Card, Heading, Input, Text, Textarea } from '@particle-academy/react-fancy';
import { useState, type ReactNode } from 'react';
import type { JobApplicationInput, JobPosting } from '../types';

export interface ApplyFormProps {
    posting: JobPosting;
    onSubmit: (input: JobApplicationInput) => void | Promise<void>;
    onCancel?: () => void;
    submitting?: boolean;
    /** Server-side validation errors, keyed by field. */
    errors?: Partial<Record<keyof JobApplicationInput, string>>;
    /** Prefill from the signed-in candidate's profile. */
    defaults?: JobApplicationInput;
    /**
     * The host's OWN fields, rendered inside the form and above the actions.
     *
     * A resume upload is the case that prompted this, but it is deliberately a
     * generic slot rather than a `resume` prop: `resume_path` is one host's need
     * and this serves every one of them without another release. The host owns
     * the field's state and merges it in its own `onSubmit` — this form passes
     * only `JobApplicationInput`, which is the package's contract and stays so.
     *
     * The first consumer could not add a resume input at all without forking
     * this component, because the prop set was closed. That is the gap.
     */
    children?: ReactNode;
    className?: string;
}

/** The candidate's application form. */
export function ApplyForm({
    posting,
    onSubmit,
    onCancel,
    submitting = false,
    errors = {},
    defaults = {},
    children,
    className,
}: ApplyFormProps) {
    const [values, setValues] = useState<JobApplicationInput>({
        cover_letter: defaults.cover_letter ?? '',
        contact_email: defaults.contact_email ?? '',
        contact_phone: defaults.contact_phone ?? '',
    });

    const patch = (next: Partial<JobApplicationInput>) =>
        setValues((current) => ({ ...current, ...next }));

    return (
        <Card
            variant="outlined"
            padding="lg"
            className={`!rounded-xl !border-secondary-200 !shadow-sm ${className ?? ''}`}
        >
            <Heading as="h2" size="lg" weight="bold" className="!text-secondary-900">
                Apply for {posting.title}
            </Heading>
            {posting.employer?.name && (
                <Text size="sm" color="muted" className="!mt-1">
                    {posting.employer.name}
                </Text>
            )}

            {!posting.accepts_applications && (
                <Callout color="red" className="!mt-4">
                    <Text size="sm">This posting is no longer accepting applications.</Text>
                </Callout>
            )}

            <form
                className="mt-5 grid gap-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    void onSubmit(values);
                }}
            >
                <Textarea
                    label="Why you're a good fit"
                    description="Optional, but it helps."
                    minRows={5}
                    autoResize
                    value={values.cover_letter ?? ''}
                    onValueChange={(cover_letter) => patch({ cover_letter })}
                    error={errors.cover_letter}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        type="email"
                        label="Contact email"
                        value={values.contact_email ?? ''}
                        onValueChange={(contact_email) => patch({ contact_email })}
                        error={errors.contact_email}
                    />
                    <Input
                        type="tel"
                        label="Contact phone"
                        value={values.contact_phone ?? ''}
                        onValueChange={(contact_phone) => patch({ contact_phone })}
                        error={errors.contact_phone}
                    />
                </div>

                {/*
                    The host's fields sit INSIDE the form and ABOVE the actions.
                    Inside, so they participate in submission, native validation
                    and the disabled state rather than behaving like a second
                    form; above, because a field below Submit reads as a footnote
                    and gets missed. Rendered only when there are children, so an
                    empty slot is not a stray grid row with gaps either side.
                */}
                {children ? <div data-job-board-apply-extra="">{children}</div> : null}

                <div className="flex items-center justify-end gap-3 pt-1">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            className="!text-secondary-700 hover:!text-brand !px-4 !py-2"
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        loading={submitting}
                        disabled={submitting || !posting.accepts_applications}
                        className="!bg-brand hover:!bg-primary-600 disabled:!bg-secondary-300 !text-white !font-semibold !px-6 !py-2.5 !rounded-md !shadow-sm"
                    >
                        {submitting ? 'Sending…' : 'Submit application'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
