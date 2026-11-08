import { useEffect, useRef, useState } from "react";
import { visionResultSchema, type VisionResult } from "../../../shared/vision";
import { appliances } from "../diagnostics";
import { imageData, preparePhoto } from "../media";
import { Icon } from "./Icon";

export function CameraWorkbench({
  onGuide,
  onManual,
}: {
  onGuide: (
    category: string,
    model: string,
    photo: string,
    issue: string,
  ) => void;
  onManual: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null),
    stream = useRef<MediaStream | null>(null),
    generation = useRef(0),
    request = useRef<AbortController | null>(null),
    busyRef = useRef(false);
  const [live, setLive] = useState(false),
    [ready, setReady] = useState(false),
    [opening, setOpening] = useState(false),
    [auto, setAuto] = useState(false),
    [busy, setBusy] = useState(false),
    [photo, setPhoto] = useState(""),
    [issue, setIssue] = useState(""),
    [consent, setConsent] = useState(false),
    [count, setCount] = useState(0),
    [result, setResult] = useState<VisionResult | null>(null),
    [category, setCategory] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [error, setError] = useState("");
  function stopCamera() {
    generation.current++;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
    setLive(false);
    setReady(false);
    setAuto(false);
    setOpening(false);
  }
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) stopCamera();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      generation.current++;
      stream.current?.getTracks().forEach((track) => track.stop());
      request.current?.abort();
      document.removeEventListener("visibilitychange", hidden);
    };
  }, []);
  async function openCamera() {
    setError("");
    setOpening(true);
    const token = ++generation.current;
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia)
        throw new Error(
          "Live camera needs HTTPS and a browser with camera support. Use Take a photo or Upload image instead.",
        );
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
        audio: false,
      });
      if (token !== generation.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = media;
      setLive(true);
      setResult(null);
      setConfirmed(false);
    } catch (e) {
      if (token === generation.current)
        setError(
          e instanceof DOMException && e.name === "NotAllowedError"
            ? "Camera permission was denied. Allow camera access in your browser or upload a photo."
            : e instanceof Error
              ? e.message
              : "The camera could not be opened. Use an uploaded photo.",
        );
    } finally {
      if (token === generation.current) setOpening(false);
    }
  }
  useEffect(() => {
    if (live && video.current && stream.current) {
      video.current.srcObject = stream.current;
      void video.current
        .play()
        .catch(() =>
          setError(
            "Tap the video play button or use a photo if your browser blocks playback.",
          ),
        );
    }
  }, [live]);
  async function selectPhoto(file?: File) {
    if (!file) return;
    stopCamera();
    setError("");
    setResult(null);
    setConfirmed(false);
    const token = generation.current;
    try {
      const prepared = await preparePhoto(file);
      if (token === generation.current) setPhoto(prepared);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The image could not be read.");
    }
  }
  async function scan() {
    if (busyRef.current || count >= 5 || !consent) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setConfirmed(false);
    setResult(null);
    setCategory("");
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const frame =
        live && video.current
          ? imageData(
              video.current,
              video.current.videoWidth,
              video.current.videoHeight,
            )
          : photo;
      if (!frame) throw new Error("Open the camera or choose a photo first.");
      setPhoto(frame);
      setCount((c) => c + 1);
      const response = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: frame, issue, consent: true }),
        signal: controller.signal,
      });
      const body = await response.json().catch(() => ({
        error: "The visual service did not respond. Try again later.",
      }));
      if (!response.ok)
        throw new Error(body.error || "Visual identification failed.");
      const identified = visionResultSchema.parse(body);
      setResult(identified);
      setCategory(
        appliances.some((a) => a.id === identified.category)
          ? identified.category
          : "",
      );
      if (identified.hazardDetected) stopCamera();
    } catch (e) {
      setAuto(false);
      if (!controller.signal.aborted)
        setError(
          e instanceof Error ? e.message : "Could not analyze this frame.",
        );
      else
        setError(
          "The scan was cancelled or timed out. No identification was made.",
        );
    } finally {
      clearTimeout(timeout);
      busyRef.current = false;
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!auto || busy || !live || !ready || !consent || count >= 5) return;
    const timer = setTimeout(() => void scan(), 10000);
    return () => clearTimeout(timer);
  }, [auto, busy, live, ready, consent, count]);
  return (
    <section
      id="camera"
      className="camera-workbench"
      aria-labelledby="camera-title"
    >
      <div className="camera-heading">
        <div>
          <p className="eyebrow">REPARO / VISUAL REPAIR ASSISTANT</p>
          <h1 id="camera-title">
            Show us the problem.
            <br />
            <em>Find your next step.</em>
          </h1>
          <p>
            Point your camera at an appliance or add a photo. Identify the
            device, understand what’s visible, and work through a guided
            troubleshooting session.
          </p>
        </div>
        <a href="#workspace" className="underlined-link">
          Your saved cases <Icon name="arrow" size={18} />
        </a>
      </div>
      <div className="camera-layout">
        <div className="camera-capture">
          <div className="camera-screen">
            <div className="camera-status">
              <span className={live ? "status-dot live-dot" : "status-dot"} />
              {live
                ? "LIVE CAMERA · LOCAL PREVIEW"
                : photo
                  ? "PHOTO READY"
                  : "CAMERA / PHOTO INPUT"}
              <span>{count}/5 scans</span>
            </div>
            {live ? (
              <video
                ref={video}
                autoPlay
                muted
                playsInline
                onLoadedData={() => setReady(true)}
                aria-label="Live appliance camera preview"
              />
            ) : photo ? (
              <img src={photo} alt="Selected appliance frame" />
            ) : (
              <div className="camera-empty">
                <Icon name="camera" size={64} />
                <h2>Your appliance goes here.</h2>
                <p>
                  Show the whole device first.
                  <br />
                  Use an exterior label or display for a closer look.
                </p>
              </div>
            )}
            {live ? (
              <div className="camera-reticle" aria-hidden="true" />
            ) : null}
            {busy ? (
              <div className="camera-scanning" role="status">
                Reading this frame…
              </div>
            ) : null}
          </div>
          <div className="camera-tools">
            <button
              className="button dark"
              onClick={() => void openCamera()}
              disabled={opening || busy}
            >
              {opening
                ? "Opening camera…"
                : live
                  ? "Reconnect camera"
                  : "Open live camera"}
              <Icon name="camera" size={18} />
            </button>
            <label className={`button camera-file ${busy ? "disabled" : ""}`}>
              Take a photo
              <input
                type="file"
                capture="environment"
                accept="image/jpeg,image/png,image/webp"
                disabled={busy}
                onChange={(e) => {
                  void selectPhoto(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <label className={`button camera-file ${busy ? "disabled" : ""}`}>
              Upload image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={busy}
                onChange={(e) => {
                  void selectPhoto(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            {live || opening ? (
              <button className="text-button" onClick={stopCamera}>
                Stop camera
              </button>
            ) : null}
          </div>
          <label className="field-label" htmlFor="visual-issue">
            What seems wrong? <span>(optional for identification)</span>
          </label>
          <textarea
            id="visual-issue"
            maxLength={1000}
            rows={2}
            disabled={busy}
            value={issue}
            onChange={(e) => {
              setIssue(e.target.value);
              setAuto(false);
              setResult(null);
              setConfirmed(false);
            }}
            placeholder="For example: this fan rattles, or the washer door won’t close."
          />
          <label className="consent">
            <input
              type="checkbox"
              checked={consent}
              disabled={busy}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (!e.target.checked) setAuto(false);
              }}
            />
            Allow selected frames and the problem description to be sent to
            Google’s Gemini free API for analysis. Google may use inputs/outputs
            for product improvement and human review. Keep people and private
            information out of frame.
          </label>
          <div className="camera-actions">
            <button
              className="button dark"
              disabled={
                !consent ||
                busy ||
                count >= 5 ||
                (!live && !photo) ||
                (live && !ready)
              }
              onClick={() => void scan()}
            >
              {busy
                ? "Analyzing…"
                : live
                  ? "Analyze this frame"
                  : "Identify device"}
              <Icon name="spark" size={18} />
            </button>
            {live ? (
              <button
                className="button"
                disabled={!consent || busy || count >= 5 || !ready}
                aria-pressed={auto}
                onClick={() => setAuto(!auto)}
              >
                {auto ? "Pause live analysis" : "Start live analysis"}
              </button>
            ) : null}
          </div>
          <p className="field-note">
            Live analysis sends separate snapshots, at least 10 seconds apart
            after each response, up to 5 scans per session. It does not stream
            video to the model. Camera stops when this tab is hidden. Photos are
            resized and not saved to history.
          </p>
          {count >= 5 ? (
            <p role="status" className="field-note">
              Visual session allowance reached. Continue with the identified
              device or choose a device manually.
            </p>
          ) : null}
          {error ? (
            <p className="error-message" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <aside className="camera-findings" aria-live="polite">
          <p className="eyebrow">01 / IDENTIFY → 02 / CONFIRM → 03 / GUIDE</p>
          {result ? (
            <>
              <h2>{result.deviceName || "Device not identified"}</h2>
              <span
                className={`result-tag ${result.hazardDetected ? "stop" : ""}`}
              >
                {result.hazardDetected
                  ? "Safety stop"
                  : `${result.recognition} recognition · confirm below`}
              </span>
              {result.brand || result.modelNumber ? (
                <p>
                  Visible label:{" "}
                  {[result.brand, result.modelNumber]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
              <p>{result.uncertainty}</p>
              {result.observations.length ? (
                <>
                  <h3>What the frame shows</h3>
                  <ul>
                    {result.observations.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {result.visibleIssues.length ? (
                <>
                  <h3>Visible concerns</h3>
                  <ul>
                    {result.visibleIssues.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {result.hazardDetected ? (
                <div className="error-message">
                  <strong>Stop using the appliance.</strong>
                  <p>{result.hazardReason}</p>
                  <p>
                    Keep people away. For immediate danger, move to safety and
                    contact local emergency services. Arrange qualified help; do
                    not open or repair it.
                  </p>
                </div>
              ) : result.category === "unsupported" ? (
                <p className="error-message">
                  This device needs specialist support. Reparo does not guide
                  internal microwave, gas, HVAC, or high-voltage repairs.
                </p>
              ) : (
                <>
                  <label className="field-label" htmlFor="identified-category">
                    Confirm or correct the appliance
                  </label>
                  <select
                    id="identified-category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setConfirmed(false);
                    }}
                  >
                    <option value="">
                      Choose the appliance you can identify
                    </option>
                    {appliances.map((a) => (
                      <option value={a.id} key={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <label className="consent">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                    />
                    I confirm the device category. I understand that one image
                    cannot establish a diagnosis or certify safety.
                  </label>
                  <button
                    className="button dark"
                    disabled={!category || !confirmed || busy}
                    onClick={() => {
                      stopCamera();
                      onGuide(
                        category,
                        [result.brand, result.modelNumber]
                          .filter(Boolean)
                          .join(" "),
                        photo,
                        issue,
                      );
                    }}
                  >
                    Guide me through this issue <Icon name="arrow" size={18} />
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <h2>
                A clearer picture.
                <br />
                <em>A useful next step.</em>
              </h2>
              <ol className="visual-steps">
                <li>
                  <strong>Show the device</strong>
                  <span>
                    Use your camera, a fresh photo, or an existing image.
                  </span>
                </li>
                <li>
                  <strong>Check the identification</strong>
                  <span>
                    AI reads visible details. You confirm the appliance.
                  </span>
                </li>
                <li>
                  <strong>Work through the guide</strong>
                  <span>
                    Answer safety and symptom questions, then follow supported
                    external fixes or technician escalation.
                  </span>
                </li>
              </ol>
            </>
          )}
          <div className="manual-entry">
            <button
              className="text-button"
              onClick={() => {
                stopCamera();
                onManual();
              }}
            >
              Choose a device without camera <Icon name="arrow" size={16} />
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
