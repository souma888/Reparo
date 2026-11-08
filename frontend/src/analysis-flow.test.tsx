// @vitest-environment jsdom
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  renderHook,
  act,
} from "@testing-library/react";
import { AnalysisGuide } from "./components/AnalysisGuide";
import { useAnalysis } from "./useAnalysis";
import { attemptsUsed, takeAttempt } from "./attempts";
import { requestSchema, rulesResult } from "../../shared/analysis";
import type { Workshop } from "./workshop";
const workshop = { error: "", saveCase: vi.fn() } as unknown as Workshop;
beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true;
    },
  });
  vi.stubGlobal("requestAnimationFrame", (fn: () => void) => fn());
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("an explicitly selected appliance skips identification and hazards prevent network calls", () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  render(
    <AnalysisGuide
      initialAppliance="fridge"
      initialModel=""
      explicitAppliance
      onClose={() => {}}
      workshop={workshop}
    />,
  );
  expect(screen.getByText("First, a moment for safety.")).toBeTruthy();
  fireEvent.click(screen.getByLabelText("I’m not sure"));
  fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
  expect(screen.getByText("Stop & seek professional help")).toBeTruthy();
  expect(fetch).not.toHaveBeenCalled();
});
it("network errors expose the download-observations recovery action", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new Error("Connection failed")),
  );
  render(
    <AnalysisGuide
      initialAppliance="washer"
      initialModel=""
      explicitAppliance
      onClose={() => {}}
      workshop={workshop}
    />,
  );
  fireEvent.click(screen.getByLabelText("No, none of these are present"));
  fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
  fireEvent.click(screen.getByLabelText("Will not start"));
  fireEvent.change(screen.getByLabelText("What have you noticed?"), {
    target: { value: "Display shows E02" },
  });
  fireEvent.click(screen.getByLabelText(/I agree to send these observations/));
  fireEvent.click(screen.getByRole("button", { name: /Analyze with AI/ }));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Download observations" }),
    ).toBeTruthy(),
  );
  expect(screen.getByRole("alert").textContent).toContain("Connection failed");
});
it("AI attempt budget persists across guide remounts", () => {
  expect(takeAttempt()).toBe(true);
  const view = render(
    <AnalysisGuide
      initialAppliance="washer"
      initialModel=""
      onClose={() => {}}
      workshop={workshop}
    />,
  );
  view.unmount();
  expect(attemptsUsed()).toBe(1);
  expect(takeAttempt()).toBe(true);
  expect(takeAttempt()).toBe(true);
  expect(takeAttempt()).toBe(false);
});
it("reads streamed JSON split across chunks and requires a final validated result", async () => {
  const result = rulesResult(
    requestSchema.parse({
      appliance: "fan",
      symptom: "Weak airflow",
      safety: "no",
      consent: true,
    }),
  );
  const content = JSON.stringify({ type: "result", result }) + "\n";
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(c) {
      c.enqueue(encoder.encode(content.slice(0, 23)));
      c.enqueue(encoder.encode(content.slice(23)));
      c.close();
    },
  });
  const hook = renderHook(() => useAnalysis());
  let parsed;
  await act(async () => {
    parsed = await hook.result.current.read(
      new Response(stream, {
        headers: { "Content-Type": "application/x-ndjson" },
      }),
    );
  });
  expect(parsed).toMatchObject({ mode: "rules", stop: false });
  const missing = new Response('{"type":"status"}\n', {
    headers: { "Content-Type": "application/x-ndjson" },
  });
  await expect(hook.result.current.read(missing)).rejects.toThrow(
    "before validation",
  );
});
