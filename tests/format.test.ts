import { afterEach, describe, expect, it, vi } from "vitest";
import { formatLocation, formatPay, formatPosted, postingStatusColor } from "../src/format";

describe("formatPay", () => {
    it("returns null when there is no pay information at all", () => {
        // The caller is expected to omit the line entirely. Returning "" or
        // "$0" would print an empty or wrong range on a real posting.
        expect(formatPay({ pay_min: null, pay_max: null, pay_unit: "hour", currency: "USD" })).toBeNull();
    });

    it("renders a range when both ends are given", () => {
        const out = formatPay({ pay_min: 20, pay_max: 30, pay_unit: "hour", currency: "USD" })!;

        expect(out).toContain("20");
        expect(out).toContain("30");
        expect(out).toContain("–"); // en dash, not a hyphen
    });

    it("collapses an equal min and max to a single figure", () => {
        const out = formatPay({ pay_min: 25, pay_max: 25, pay_unit: "hour", currency: "USD" })!;

        expect(out).not.toContain("–");
        expect(out).toContain("25");
    });

    it("says From / Up to when only one end is known", () => {
        expect(formatPay({ pay_min: 45000, pay_max: null, pay_unit: "year", currency: "USD" })).toMatch(/^From /);
        expect(formatPay({ pay_min: null, pay_max: 25, pay_unit: "hour", currency: "USD" })).toMatch(/^Up to /);
    });

    it("drops cents on whole numbers and keeps them otherwise", () => {
        // "$20.00/hr" reads as false precision on a round rate; "$20.50/hr"
        // needs them.
        expect(formatPay({ pay_min: 20, pay_max: null, pay_unit: "hour", currency: "USD" })).not.toContain(".00");
        expect(formatPay({ pay_min: 20.5, pay_max: null, pay_unit: "hour", currency: "USD" })).toContain(".5");
    });

    it("respects the posting's currency", () => {
        const usd = formatPay({ pay_min: 10, pay_max: null, pay_unit: "hour", currency: "USD" })!;
        const eur = formatPay({ pay_min: 10, pay_max: null, pay_unit: "hour", currency: "EUR" })!;

        expect(usd).not.toBe(eur);
    });

    it("falls back to a slash-prefixed unit it does not know", () => {
        const out = formatPay({ pay_min: 10, pay_max: null, pay_unit: "fortnight" as never, currency: "USD" })!;

        expect(out).toContain("/fortnight");
    });

    it("omits the suffix entirely when there is no unit", () => {
        const out = formatPay({ pay_min: 10, pay_max: null, pay_unit: null, currency: "USD" })!;

        expect(out).not.toContain("/");
    });
});

describe("formatLocation", () => {
    it("combines remote with a place when it is both", () => {
        expect(formatLocation({ is_remote: true, location: "Torrance, CA" })).toBe("Remote · Torrance, CA");
    });

    it("says just Remote when there is no place", () => {
        expect(formatLocation({ is_remote: true, location: null })).toBe("Remote");
    });

    it("says just the place when it is not remote", () => {
        expect(formatLocation({ is_remote: false, location: "Torrance, CA" })).toBe("Torrance, CA");
    });

    it("returns null when there is nothing to say", () => {
        expect(formatLocation({ is_remote: false, location: null })).toBeNull();
        expect(formatLocation({ is_remote: false, location: "" })).toBeNull();
    });
});

describe("formatPosted", () => {
    afterEach(() => vi.useRealTimers());

    const at = (iso: string) => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(iso));
    };

    it("returns null for missing or unparseable dates rather than 'Invalid Date'", () => {
        expect(formatPosted(null)).toBeNull();
        expect(formatPosted(undefined)).toBeNull();
        expect(formatPosted("not a date")).toBeNull();
    });

    it("describes each bucket in words", () => {
        at("2026-03-01T12:00:00Z");

        expect(formatPosted("2026-03-01T09:00:00Z")).toBe("Posted today");
        expect(formatPosted("2026-02-28T09:00:00Z")).toBe("Posted yesterday");
        expect(formatPosted("2026-02-26T09:00:00Z")).toBe("Posted 3 days ago");
        expect(formatPosted("2026-02-21T09:00:00Z")).toBe("Posted last week");
        expect(formatPosted("2026-02-10T09:00:00Z")).toBe("Posted 2 weeks ago");
        expect(formatPosted("2025-12-20T09:00:00Z")).toBe("Posted 2 months ago");
    });

    it("treats a future date as today rather than counting backwards", () => {
        // Clock skew between a server that stamped the row and the browser
        // reading it would otherwise print "Posted -1 days ago".
        at("2026-03-01T12:00:00Z");

        expect(formatPosted("2026-03-05T09:00:00Z")).toBe("Posted today");
    });
});

describe("postingStatusColor", () => {
    it("maps the statuses that carry meaning", () => {
        expect(postingStatusColor("published")).toBe("green");
        expect(postingStatusColor("closed")).toBe("red");
    });

    it("falls back to neutral for anything else", () => {
        expect(postingStatusColor("draft" as never)).toBe("zinc");
    });
});
