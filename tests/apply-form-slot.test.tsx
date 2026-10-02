// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { act, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { ApplyForm } from "../src/components/ApplyForm";
import type { JobPosting } from "../src/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function mount(el: ReactElement) {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    act(() => root.render(el));
    return { host, unmount: () => act(() => root.unmount()) };
}

const posting = {
    id: 1,
    title: "Security Officer",
    accepts_applications: true,
} as unknown as JobPosting;

/*
 * `ApplyForm` takes a slot, so a host can add its OWN fields.
 *
 * Reported by the GuardCard team, the package's first consumer: their resume
 * story was blocked because `ApplyFormProps` was a closed set
 * (`posting, onSubmit, onCancel, submitting, errors, defaults, className`) with
 * no children and no file field. A host could not add a resume input without
 * FORKING the form.
 *
 * They asked for a generic slot rather than a resume field, and they were right:
 * `resume_path` is one host-specific need and a slot serves every one of them
 * without another round trip through us. The backend already has a `resume_path`
 * column and API validation with nothing writing to it, so a resume-shaped prop
 * would have looked like the answer while still not being general.
 *
 * On the component contract: the kit's rule is to avoid forcing React children
 * for anything an AGENT must populate. That holds here — every field an agent
 * needs is still a prop, and `children` is the host's escape hatch for fields
 * only the host knows about. It widens the authoring surface without moving
 * anything off it.
 */

describe("ApplyForm host slot", () => {
    it("renders children inside the form, so a host field submits with it", () => {
        // Inside the <form> is the whole point. A slot rendered outside it would
        // not participate in submission, native validation, or the disabled
        // state — it would look right and behave like a separate form.
        const { host, unmount } = mount(
            <ApplyForm
                posting={posting}
                onSubmit={() => {}}
            >
                <input data-testid="resume" type="file" name="resume" />
            </ApplyForm>,
        );

        const field = host.querySelector('[data-testid="resume"]');
        expect(field).not.toBeNull();
        expect(field?.closest("form")).not.toBeNull();

        unmount();
    });

    it("places the slot BEFORE the actions, not after them", () => {
        // A host field appearing below Submit/Cancel reads as a footnote and gets
        // missed. Order is part of the contract here, not styling.
        const { host, unmount } = mount(
            <ApplyForm posting={posting} onSubmit={() => {}} onCancel={() => {}}>
                <input data-testid="resume" />
            </ApplyForm>,
        );

        const form = host.querySelector("form")!;
        const slot = host.querySelector('[data-testid="resume"]')!;
        const submit = form.querySelector('button[type="submit"]')!;

        // compareDocumentPosition: 4 === FOLLOWING, i.e. submit comes after slot.
        expect(slot.compareDocumentPosition(submit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

        unmount();
    });

    it("still renders the built-in fields when a slot is given", () => {
        // The slot ADDS; it must not replace. Nothing about passing children
        // should make the cover letter or contact fields disappear.
        const { host, unmount } = mount(
            <ApplyForm posting={posting} onSubmit={() => {}}>
                <input data-testid="resume" />
            </ApplyForm>,
        );

        expect(host.querySelectorAll("textarea").length).toBe(1);
        expect(host.querySelectorAll('input[type="email"]').length).toBe(1);
        expect(host.querySelector('[data-testid="resume"]')).not.toBeNull();

        unmount();
    });

    it("renders unchanged with no children, so every existing caller is untouched", () => {
        const { host, unmount } = mount(<ApplyForm posting={posting} onSubmit={() => {}} />);

        expect(host.querySelector("form")).not.toBeNull();
        expect(host.querySelectorAll("textarea").length).toBe(1);

        unmount();
    });

    it("gives the slot a stable handle, so an agent is not guessing at the DOM", () => {
        // Component-contract requirement: every interactive region has a stable
        // identity. A host's own fields are exactly where an agent would
        // otherwise have to guess.
        const { host, unmount } = mount(
            <ApplyForm posting={posting} onSubmit={() => {}}>
                <input data-testid="resume" />
            </ApplyForm>,
        );

        const slot = host.querySelector("[data-job-board-apply-extra]");
        expect(slot).not.toBeNull();
        expect(slot?.querySelector('[data-testid="resume"]')).not.toBeNull();

        unmount();
    });

    it("omits the slot wrapper entirely when there are no children", () => {
        // An empty wrapper is a stray grid row with a gap above and below it.
        const { host, unmount } = mount(<ApplyForm posting={posting} onSubmit={() => {}} />);

        expect(host.querySelector("[data-job-board-apply-extra]")).toBeNull();

        unmount();
    });
});
