import {
    Button,
    Callout,
    Card,
    Heading,
    Input,
    Select,
    Switch,
    Text,
    Textarea,
} from '@particle-academy/react-fancy';
import { useState } from 'react';
import { EMPLOYMENT_TYPE_OPTIONS, PAY_UNIT_OPTIONS } from '../format';
import type { JobPosting, JobPostingInput } from '../types';

export interface JobPostingFormProps {
    /** Omit to create; pass a posting to edit it. */
    posting?: JobPosting;
    onSubmit: (input: JobPostingInput) => void | Promise<void>;
    onCancel?: () => void;
    submitting?: boolean;
    errors?: Partial<Record<keyof JobPostingInput, string>>;
    /**
     * When false, the form explains that publishing is unavailable — the
     * employer can still save drafts.
     */
    canPublish?: boolean;
    /** Message explaining why publishing is unavailable. */
    publishBlockedReason?: string;
    className?: string;
}

const emptyPosting: JobPostingInput = {
    title: '',
    description: '',
    requirements: '',
    employment_type: null,
    location: '',
    is_remote: false,
    pay_min: null,
    pay_max: null,
    pay_unit: 'hour',
    contact_email: '',
    contact_phone: '',
    apply_url: '',
    openings: 1,
};

/** Create or edit a posting. Status is never set here — publishing is its own action. */
export function JobPostingForm({
    posting,
    onSubmit,
    onCancel,
    submitting = false,
    errors = {},
    canPublish = true,
    publishBlockedReason,
    className,
}: JobPostingFormProps) {
    const [values, setValues] = useState<JobPostingInput>(() =>
        posting
            ? {
                  title: posting.title,
                  description: posting.description ?? '',
                  requirements: posting.requirements ?? '',
                  employment_type: posting.employment_type ?? null,
                  location: posting.location ?? '',
                  is_remote: posting.is_remote,
                  pay_min: posting.pay_min ?? null,
                  pay_max: posting.pay_max ?? null,
                  pay_unit: posting.pay_unit ?? 'hour',
                  contact_email: posting.contact_email ?? '',
                  contact_phone: posting.contact_phone ?? '',
                  apply_url: posting.apply_url ?? '',
                  openings: posting.openings,
              }
            : { ...emptyPosting },
    );

    const patch = (next: Partial<JobPostingInput>) =>
        setValues((current) => ({ ...current, ...next }));

    // Empty string is not a number; keep it null so the API sees "unset".
    const num = (v: string): number | null => (v.trim() === '' ? null : Number(v));

    return (
        <Card
            variant="outlined"
            padding="lg"
            className={`!rounded-xl !border-secondary-200 !bg-white !shadow-sm ${className ?? ''}`}
        >
            <Heading as="h2" size="lg" weight="bold" className="!text-secondary-900">
                {posting ? 'Edit posting' : 'New posting'}
            </Heading>

            {!canPublish && (
                <Callout color="amber" className="!mt-4">
                    <Text size="sm">
                        {publishBlockedReason ??
                            'You can save drafts now. Publishing unlocks once your account is approved.'}
                    </Text>
                </Callout>
            )}

            <form
                className="mt-5 grid gap-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    void onSubmit(values);
                }}
            >
                <Input
                    label="Job title"
                    required
                    placeholder="Overnight patrol guard"
                    value={values.title}
                    onValueChange={(title) => patch({ title })}
                    error={errors.title}
                />

                <Textarea
                    label="Description"
                    description="What the role involves day to day."
                    minRows={5}
                    autoResize
                    value={values.description ?? ''}
                    onValueChange={(description) => patch({ description })}
                    error={errors.description}
                />

                <Textarea
                    label="Requirements"
                    description="Licences, experience, availability."
                    minRows={3}
                    autoResize
                    value={values.requirements ?? ''}
                    onValueChange={(requirements) => patch({ requirements })}
                    error={errors.requirements}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                        label="Employment type"
                        placeholder="Choose a type"
                        list={[...EMPLOYMENT_TYPE_OPTIONS]}
                        value={values.employment_type ?? ''}
                        onValueChange={(v) =>
                            patch({ employment_type: (v || null) as JobPostingInput['employment_type'] })
                        }
                        error={errors.employment_type}
                    />
                    <Input
                        type="number"
                        label="Openings"
                        value={String(values.openings ?? 1)}
                        onValueChange={(v) => patch({ openings: num(v) ?? 1 })}
                        error={errors.openings}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
                    <Input
                        label="Location"
                        placeholder="Torrance, CA"
                        value={values.location ?? ''}
                        onValueChange={(location) => patch({ location })}
                        error={errors.location}
                    />
                    <div className="sm:pb-2">
                        <Switch
                            label="This role is remote"
                            checked={Boolean(values.is_remote)}
                            onCheckedChange={(is_remote) => patch({ is_remote })}
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                        type="number"
                        label="Pay from"
                        value={values.pay_min == null ? '' : String(values.pay_min)}
                        onValueChange={(v) => patch({ pay_min: num(v) })}
                        error={errors.pay_min}
                    />
                    <Input
                        type="number"
                        label="Pay to"
                        value={values.pay_max == null ? '' : String(values.pay_max)}
                        onValueChange={(v) => patch({ pay_max: num(v) })}
                        error={errors.pay_max}
                    />
                    <Select
                        label="Per"
                        list={[...PAY_UNIT_OPTIONS]}
                        value={values.pay_unit ?? 'hour'}
                        onValueChange={(v) => patch({ pay_unit: v as JobPostingInput['pay_unit'] })}
                        error={errors.pay_unit}
                    />
                </div>

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

                <Input
                    type="url"
                    label="External application link"
                    description="Optional. Candidates can apply here instead."
                    value={values.apply_url ?? ''}
                    onValueChange={(apply_url) => patch({ apply_url })}
                    error={errors.apply_url}
                />

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
                        disabled={submitting}
                        className="!bg-brand hover:!bg-primary-600 disabled:!bg-secondary-300 !text-white !font-semibold !px-6 !py-2.5 !rounded-md !shadow-sm"
                    >
                        {posting ? 'Save changes' : 'Create draft'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
