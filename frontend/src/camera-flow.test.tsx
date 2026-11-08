// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { CameraWorkbench } from "./components/CameraWorkbench";
import { RepairGuide } from "./components/RepairGuide";
const recognized = {
  category: "washer",
  deviceName: "Washing machine",
  brand: "Visible Brand",
  modelNumber: "M10",
  recognition: "clear",
  uncertainty: "Image does not establish an internal fault.",
  observations: ["Front loading washer"],
  visibleIssues: [],
  hazardDetected: false,
  hazardReason: "",
};
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => recognized });
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("isSecureContext", true);
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn().mockResolvedValue({ width: 640, height: 480, close: vi.fn() }),
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    "data:image/jpeg;base64,AAAA",
  );
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
});
afterEach(() => {
  vi.useRealTimers();
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function upload() {
  fireEvent.change(screen.getByLabelText("Upload image"), {
    target: {
      files: [new File(["image"], "washer.png", { type: "image/png" })],
    },
  });
  await screen.findByAltText("Selected appliance frame");
}
function consent() {
  fireEvent.click(
    screen.getByRole("checkbox", { name: /Allow selected frames/ }),
  );
}
describe("camera-led workflow", () => {
  it("samples live frames sequentially and stops at the five-scan allowance", async () => {
    const stop = vi.fn();
    const getUserMedia = vi
      .fn()
      .mockResolvedValue({ getTracks: () => [{ stop }] });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });
    render(<CameraWorkbench onGuide={vi.fn()} onManual={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Open live camera" }));
    const video = await screen.findByLabelText("Live appliance camera preview");
    Object.defineProperty(video, "videoWidth", { value: 640 });
    Object.defineProperty(video, "videoHeight", { value: 480 });
    fireEvent.loadedData(video);
    consent();
    vi.useFakeTimers();
    fireEvent.click(
      screen.getByRole("button", { name: "Start live analysis" }),
    );
    for (let i = 0; i < 7; i++)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10000);
      });
    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(getUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({ audio: false }),
    );
    expect(screen.getByText(/Visual session allowance reached/)).toBeTruthy();
  });
  it("stops tracks on unmount", async () => {
    const stop = vi.fn();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi
          .fn()
          .mockResolvedValue({ getTracks: () => [{ stop }] }),
      },
    });
    const view = render(
      <CameraWorkbench onGuide={vi.fn()} onManual={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open live camera" }));
    await screen.findByLabelText("Live appliance camera preview");
    view.unmount();
    expect(stop).toHaveBeenCalled();
  });
  it("does not send a photo without consent, then hands confirmed identification to the guide", async () => {
    const onGuide = vi.fn();
    render(<CameraWorkbench onGuide={onGuide} onManual={vi.fn()} />);
    await upload();
    expect(
      (
        screen.getByRole("button", {
          name: "Identify device",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
    consent();
    fireEvent.click(screen.getByRole("button", { name: "Identify device" }));
    await screen.findByRole("heading", { name: "Washing machine" });
    expect(
      (
        screen.getByRole("button", {
          name: "Guide me through this issue",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    fireEvent.click(
      screen.getByRole("checkbox", { name: /I confirm the device category/ }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Guide me through this issue" }),
    );
    expect(onGuide).toHaveBeenCalledWith(
      "washer",
      "Visible Brand M10",
      "data:image/jpeg;base64,AAAA",
      "",
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      photo: "data:image/jpeg;base64,AAAA",
      consent: true,
    });
  });
  it("shows a camera-permission failure and keeps upload available", async () => {
    const getUserMedia = vi
      .fn()
      .mockRejectedValue(new DOMException("Denied", "NotAllowedError"));
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });
    render(<CameraWorkbench onGuide={vi.fn()} onManual={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Open live camera" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "permission was denied",
    );
    expect(screen.getByLabelText("Upload image")).toBeTruthy();
  });
  it("releases live tracks when the user stops the camera", async () => {
    const stop = vi.fn();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi
          .fn()
          .mockResolvedValue({ getTracks: () => [{ stop }] }),
      },
    });
    render(<CameraWorkbench onGuide={vi.fn()} onManual={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Open live camera" }));
    await screen.findByLabelText("Live appliance camera preview");
    fireEvent.click(screen.getByRole("button", { name: "Stop camera" }));
    expect(stop).toHaveBeenCalled();
    expect(screen.queryByLabelText("Live appliance camera preview")).toBeNull();
  });
  it("releases a late camera grant after the user already cancelled", async () => {
    const stop = vi.fn();
    let grant: (stream: unknown) => void = () => {};
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockReturnValue(
          new Promise((resolve) => {
            grant = resolve;
          }),
        ),
      },
    });
    render(<CameraWorkbench onGuide={vi.fn()} onManual={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Open live camera" }));
    fireEvent.click(await screen.findByRole("button", { name: "Stop camera" }));
    grant({ getTracks: () => [{ stop }] });
    await waitFor(() => expect(stop).toHaveBeenCalled());
    expect(screen.queryByLabelText("Live appliance camera preview")).toBeNull();
  });
  it("prevents a repair handoff when the frame contains a hazard", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        ...recognized,
        hazardDetected: true,
        hazardReason: "Visible exposed wiring",
      }),
    });
    render(<CameraWorkbench onGuide={vi.fn()} onManual={vi.fn()} />);
    await upload();
    consent();
    fireEvent.click(screen.getByRole("button", { name: "Identify device" }));
    await screen.findByText("Visible exposed wiring");
    expect(
      screen.queryByRole("button", { name: "Guide me through this issue" }),
    ).toBeNull();
  });
  it("makes no false identification on an upstream failure", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Quota exhausted" }),
    });
    render(<CameraWorkbench onGuide={vi.fn()} onManual={vi.fn()} />);
    await upload();
    consent();
    fireEvent.click(screen.getByRole("button", { name: "Identify device" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Quota exhausted",
    );
    expect(
      screen.queryByRole("button", { name: "Guide me through this issue" }),
    ).toBeNull();
  });
});
describe("interactive repair guide", () => {
  it("requires matching-observation acknowledgement and offers an immediate stop", () => {
    render(<RepairGuide appliance="fridge" stopped={false} />);
    fireEvent.change(screen.getByLabelText("Which condition matches?"), {
      target: { value: "fridge-door-obstruction" },
    });
    expect(
      (
        screen.getByRole("button", {
          name: "Start this guide",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Start this guide" }));
    expect(screen.getByText("STEP 1 OF 3")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "I cannot do this safely" }),
    );
    expect(screen.getByRole("status").textContent).toContain("Stop here");
  });
});
