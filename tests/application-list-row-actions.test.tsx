// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { act, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { ApplicationList } from "../src/components/ApplicationList";
import type { JobApplication } from "../src/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function mount(el: ReactElement) {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    act(() => root.render(el));
    return { host, unmount: () => act(() => root.unmount()) };
}

const application = (id: number, extra: Record<string, unknown> = {}) =>
    ({
        id,
        status: "submitted",
        status_label: "Submitted",
        is_terminal: false,
        submitted_at: "2026-10-01T10:00:00Z",
        ...extra,
    }) as unknown as JobApplication;

/*
 * `ApplicationList` takes a per-row slot, so a host can put its own control on
 * each row.
 *
 * Reported by the GuardCard team, the package's first consumer. `ApplicationList`
 * is used from BOTH sides — the employer reviewing applicants and the candidate
 * looking at their own — and `ApplicationListProps` was a closed set with no
 * children and no per-row render. So NEITHER side could show a resume download
 * link: the route and its authorisation existed and were tested, and the link had
 * nowhere to go.
 *
 * Their options without this were to fork the list or render a second parallel
 * list of links beside ours. Both worse than the ask.
 *
 * A FUNCTION rather than children, because a list needs the row to decide what to
 * render: `rowActions?: (application) => ReactNode`. And generic rather than a
 * `resume` prop for the same reason as `ApplyForm`'s slot — this component cannot
 * know how a host serves a file, and the next host-specific control should not
 * need another release.
 */

describe("ApplicationList rowActions", () => {
    it("renders the host's control on every row, with that row's application", () => {
        const { host, unmount } = mount(
            <ApplicationList
                applications={[application(1), application(2)]}
                rowActions={(app) => <button data-testid={`dl-${app.id}`}>Resume</button>}
            />,
        );

        expect(host.querySelector('[data-testid="dl-1"]')).not.toBeNull();
        expect(host.querySelector('[data-testid="dl-2"]')).not.toBeNull();

        unmount();
    });

    it("hands the row's OWN application to the callback, not a shared one", () => {
        // The whole point of a function over children: a download link needs the
        // id of the row it is on. Getting the last row's application for every row
        // would render plausibly and link everything to one application.
        const seen: number[] = [];
        const { unmount } = mount(
            <ApplicationList
                applications={[application(7), application(9)]}
                rowActions={(app) => {
                    seen.push(app.id);
                    return null;
                }}
            />,
        );

        expect(seen).toEqual([7, 9]);
        unmount();
    });

    it("sits beside the built-in actions rather than replacing them", () => {
        const { host, unmount } = mount(
            <ApplicationList
                applications={[application(1)]}
                onWithdraw={() => {}}
                rowActions={() => <button data-testid="dl">Resume</button>}
            />,
        );

        expect(host.querySelector('[data-testid="dl"]')).not.toBeNull();
        // The withdraw button is still there.
        expect(host.querySelectorAll("button").length).toBeGreaterThan(1);

        unmount();
    });

    it("carries a stable handle so an agent is not guessing at the DOM", () => {
        const { host, unmount } = mount(
            <ApplicationList
                applications={[application(1)]}
                rowActions={() => <button data-testid="dl">Resume</button>}
            />,
        );

        const slot = host.querySelector("[data-job-board-application-actions]");
        expect(slot).not.toBeNull();
        expect(slot?.querySelector('[data-testid="dl"]')).not.toBeNull();

        unmount();
    });

    it("renders no wrapper when the callback returns nothing for a row", () => {
        // A host that shows a link only for some rows — a resume exists on some
        // applications and not others — must not get an empty box on the rest.
        const { host, unmount } = mount(
            <ApplicationList applications={[application(1)]} rowActions={() => null} />,
        );

        expect(host.querySelector("[data-job-board-application-actions]")).toBeNull();

        unmount();
    });

    it("renders unchanged when rowActions is not given", () => {
        const { host, unmount } = mount(<ApplicationList applications={[application(1)]} />);

        expect(host.querySelector("[data-job-board-application-actions]")).toBeNull();
        expect(host.textContent).toContain("Submitted");

        unmount();
    });

    it("does not call rowActions at all for an empty list", () => {
        let calls = 0;
        const { unmount } = mount(
            <ApplicationList
                applications={[]}
                rowActions={() => {
                    calls += 1;
                    return null;
                }}
            />,
        );

        expect(calls).toBe(0);
        unmount();
    });
});
