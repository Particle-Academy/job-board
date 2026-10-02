import { describe, expect, it } from "vitest";
import axios, { type AxiosInstance } from "axios";
import { JobsClient } from "../src/api/client";

/*
 * `JobsClient` accepts the host's OWN axios instance.
 *
 * This package declares axios a PEER dependency, and its own AGENTS.md states the
 * reason: "so the host owns the React copy and the HTTP interceptors." The second
 * half was not true. `JobsClient` called `axios.create()` in its constructor, and
 * **an `axios.create()` instance does not inherit interceptors registered on the
 * default export** — measured, not assumed:
 *
 *     axios.interceptors.request.use(fn)
 *     axios.create().interceptors.request.handlers.length   // 0
 *
 * So a host that registered auth refresh, retries, tracing or error normalisation
 * on `axios` had all of it silently skipped for every call this client made. The
 * peer dependency gave them ownership of the *copy* and not of the behaviour,
 * which is the thing the rule exists to give them.
 *
 * It also made the client untestable without a live server, which is why this
 * came up: a reference consumer has to exercise the HTTP surface, and mocking a
 * module is not the same as proving the client talks to the routes.
 *
 * No network here. A stub adapter is the point — it is what the host-owned
 * instance buys.
 */

/** An axios instance that answers from memory and records what it was asked. */
function recordingInstance(): { http: AxiosInstance; calls: { method: string; url: string }[] } {
    const calls: { method: string; url: string }[] = [];

    const http = axios.create({
        baseURL: "https://host.example/custom-prefix",
        adapter: async (config) => {
            calls.push({
                method: (config.method ?? "get").toLowerCase(),
                url: `${config.baseURL ?? ""}${config.url ?? ""}`,
            });

            return {
                data: { data: [] },
                status: 200,
                statusText: "OK",
                headers: {},
                config,
            };
        },
    });

    return { http, calls };
}

describe("JobsClient transport", () => {
    it("uses the instance the host passes", async () => {
        const { http, calls } = recordingInstance();

        await new JobsClient({ http }).listPostings();

        expect(calls).toHaveLength(1);
        expect(calls[0].url).toContain("https://host.example/custom-prefix");
    });

    it("runs the host's interceptors, which was the whole point", async () => {
        // The defect in one assertion. A host registering on their own instance
        // must see it run for calls this client makes.
        const { http, calls } = recordingInstance();
        let ran = 0;
        http.interceptors.request.use((config) => {
            ran += 1;
            return config;
        });

        await new JobsClient({ http }).listPostings();

        expect(ran).toBe(1);
        expect(calls).toHaveLength(1);
    });

    it("does not override the host instance's own baseURL", async () => {
        // Their instance, their configuration. Quietly rewriting `baseURL` would
        // take back the ownership this is meant to hand over.
        const { http, calls } = recordingInstance();

        await new JobsClient({ http, baseUrl: "/ignored" }).listPostings();

        expect(calls[0].url).toContain("https://host.example/custom-prefix");
        expect(calls[0].url).not.toContain("/ignored");
    });

    it("still builds its own instance when the host passes none", async () => {
        // Every existing caller. The default must stay exactly as it was:
        // `/api/jobs`, cookie auth, Laravel's XSRF header names.
        const client = new JobsClient();
        const http = (client as unknown as { http: AxiosInstance }).http;

        expect(http.defaults.baseURL).toBe("/api/jobs");
        expect(http.defaults.withCredentials).toBe(true);
        expect(http.defaults.xsrfCookieName).toBe("XSRF-TOKEN");
        expect(http.defaults.xsrfHeaderName).toBe("X-XSRF-TOKEN");
    });

    it("still honours baseUrl when it builds its own instance", async () => {
        const client = new JobsClient({ baseUrl: "https://api.example/jobs" });
        const http = (client as unknown as { http: AxiosInstance }).http;

        expect(http.defaults.baseURL).toBe("https://api.example/jobs");
    });

    it("documents the hazard it was built for: a default-export interceptor is NOT inherited", () => {
        // Pinning the axios behaviour this exists because of. If a future axios
        // ever made `create()` inherit them, this test is where that is noticed —
        // rather than someone concluding the `http` option was never needed.
        const before = axios.interceptors.request.handlers.length;
        const id = axios.interceptors.request.use((c) => c);

        try {
            expect(axios.create().interceptors.request.handlers).toHaveLength(0);
            expect(axios.interceptors.request.handlers.length).toBe(before + 1);
        } finally {
            axios.interceptors.request.eject(id);
        }
    });
});
