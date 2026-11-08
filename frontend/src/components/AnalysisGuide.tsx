import { StepEvidence } from "./StepEvidence";
import { StepSafety } from "./StepSafety";
import { StepAppliance } from "./StepAppliance";
import { useAnalysis } from "../useAnalysis";
import { manuals } from "../local-files";
import { retrieve } from "../../../shared/retrieval";
import { GuideResult } from "./GuideResult";
import { Handoff } from "./Handoff";
import { language } from "./Preferences";
import { attemptsUsed, takeAttempt } from "../attempts";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  mustStop,
  safetyResult,
  rulesResult,
  type AnalysisRequest,
} from "../../../shared/analysis";
import {
  downloadText,
  summary,
  technicianBrief,
  type Workshop,
} from "../workshop";
import { Icon } from "./Icon";
import { RepairGuide } from "./RepairGuide";

export function AnalysisGuide({
  initialAppliance,
  initialModel,
  initialPhoto = "",
  initialDeviceId,
  explicitAppliance = false,
  initialIssue = "",
  onClose,
  workshop,
}: {
  initialAppliance: string;
  initialModel: string;
  initialDeviceId?: string;
  explicitAppliance?: boolean;
  initialPhoto?: string;
  initialIssue?: string;
  onClose: () => void;
  workshop: Workshop;
}) {
  const [lang, setLang] = useState(language);
  useEffect(() => {
    const change = () => setLang(language());
    window.addEventListener("reparo-language", change);
    return () => window.removeEventListener("reparo-language", change);
  }, []);
  const [input, setInput] = useState<AnalysisRequest>({
    appliance: initialAppliance as AnalysisRequest["appliance"],
    symptom: "",
    safety: "unsure",
    notes: initialIssue,
    model: initialModel,
    answers: {},
    consent: true,
    mode: "ai",
    photo: initialPhoto || undefined,
    deviceId: initialDeviceId,
  });
  const [step, setStep] = useState(initialPhoto || explicitAppliance ? 1 : 0),
    [safetyAnswered, setSafetyAnswered] = useState(false),
    [consent, setConsent] = useState(false),
    [saveConsent, setSaveConsent] = useState(false),
    [saved, setSaved] = useState(false);
  const { result, setResult, busy, setBusy, error, setError, draft, read } =
    useAnalysis();
  const [photoError, setPhotoError] = useState("");
  const [useManuals, setUseManuals] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    heading = useRef<HTMLHeadingElement>(null),
    abort = useRef<AbortController | null>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    return () => {
      abort.current?.abort();
      previous?.focus();
    };
  }, []);
  function move(next: number) {
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  }
  async function analyze() {
    setError("");
    setSaved(false);
    if (mustStop(input)) {
      setResult(safetyResult());
      move(3);
      return;
    }
    if (input.mode === "rules" || attemptsUsed() >= 3) {
      setResult(
        rulesResult(
          input,
          input.mode === "rules"
            ? undefined
            : "This session’s three AI attempts have been used. Basic guidance remains available.",
        ),
      );
      move(3);
      return;
    }
    if (!takeAttempt()) return;
    setBusy(true);
    move(2);
    const controller = new AbortController();
    abort.current = controller;
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const manualPassages = useManuals
        ? retrieve(
            await manuals(),
            input.model,
            `${input.symptom} ${input.notes}`,
          )
        : [];
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/x-ndjson",
        },
        body: JSON.stringify({ ...input, manualPassages }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const payload = await response
          .json()
          .catch(() => ({ error: "AI unavailable." }));
        throw new Error(payload.error || "Analysis failed.");
      }
      setResult(await read(response));
      move(3);
    } catch (e) {
      if (dialog.current?.open) {
        setError(
          e instanceof Error && e.name !== "AbortError"
            ? e.message
            : "AI timed out. Your observations are available to download.",
        );
        setResult(
          rulesResult(
            input,
            "AI could not be reached. These basic checks run on your device. No AI result was generated.",
          ),
        );
        move(3);
      }
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (step === 0) move(1);
    else if (step === 1) {
      if (input.safety !== "no") {
        setResult(safetyResult());
        move(3);
      } else move(2);
    } else void analyze();
  }
  async function loadPhoto(file?: File) {
    setPhotoError("");
    setInput((old) => ({ ...old, photo: undefined }));
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 8 * 1024 * 1024
    ) {
      setPhotoError("Choose a JPEG, PNG, or WebP photo under 8 MB.");
      return;
    }
    setPhotoBusy(true);
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const context = canvas.getContext("2d");
      if (!context) throw new Error();
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const photo = canvas.toDataURL("image/jpeg", 0.78);
      if (photo.length > 1800000) throw new Error();
      setInput((old) => ({ ...old, photo }));
    } catch {
      setPhotoError(
        "This photo could not be prepared. Choose a smaller image.",
      );
    } finally {
      setPhotoBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="troubleshooter"
      aria-labelledby="dialog-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialog.current && !busy) onClose();
      }}
    >
      <div className="dialog-inner">
        <div className="dialog-top">
          <span className="eyebrow">REPARO / AI CARE GUIDE</span>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close troubleshooting"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="progress" aria-label={`Step ${step + 1} of 4`}>
          {["Appliance", "Safety", "Evidence", "Results"].map((label, i) => (
            <span className={i <= step ? "active" : ""} key={label}>
              {label}
            </span>
          ))}
        </div>
        <form onSubmit={submit}>
          <h2 lang={lang} id="dialog-title" ref={heading} tabIndex={-1}>
            {
              (lang === "hi"
                ? [
                    "किस उपकरण में समस्या है?",
                    "पहले सुरक्षा की जाँच।",
                    "आपने क्या देखा?",
                    result?.stop
                      ? "रुकें और सहायता लें।"
                      : "आपके लिए मार्गदर्शन।",
                  ]
                : [
                    "What needs a little care?",
                    "First, a moment for safety.",
                    "Build a clearer picture.",
                    result?.stop
                      ? "Let’s put safety first."
                      : result?.mode === "rules"
                        ? "A safe place to start."
                        : "Here’s what the evidence suggests.",
                  ])[step]
            }
          </h2>
          {step === 0 ? (
            <StepAppliance input={input} setInput={setInput} />
          ) : null}
          {step === 1 ? (
            <StepSafety
              input={input}
              setInput={setInput}
              initialPhoto={initialPhoto}
              lang={lang}
              safetyAnswered={safetyAnswered}
              setSafetyAnswered={setSafetyAnswered}
            />
          ) : null}
          {step === 2 ? (
            <StepEvidence
              input={input}
              setInput={setInput}
              photoBusy={photoBusy}
              loadPhoto={loadPhoto}
              photoError={photoError}
              lang={lang}
              useManuals={useManuals}
              setUseManuals={setUseManuals}
              consent={consent}
              setConsent={setConsent}
            />
          ) : null}
          {step === 3 && result ? (
            <>
              <GuideResult result={result} />
              <RepairGuide
                key={`${input.appliance}-${result.mode}`}
                appliance={input.appliance}
                stopped={result.stop}
              />
              {!result.stop && result.questions.length ? (
                <fieldset className="followups">
                  <legend>Clarify with existing observations</legend>
                  <p className="field-note">
                    Optional. Do not run or open the appliance to answer.
                  </p>
                  {result.questions.map((q, i) => (
                    <label className="field-label" key={`question-${i}`}>
                      {q}
                      <input
                        maxLength={400}
                        value={input.answers[`q${i}: ${q}`] || ""}
                        onChange={(e) =>
                          setInput({
                            ...input,
                            answers: {
                              ...input.answers,
                              [`q${i}: ${q}`]: e.target.value,
                            },
                          })
                        }
                      />
                    </label>
                  ))}
                  <button
                    className="button"
                    type="button"
                    disabled={
                      busy || !Object.values(input.answers).some(Boolean)
                    }
                    onClick={() => void analyze()}
                  >
                    Update analysis
                  </button>
                </fieldset>
              ) : null}
              <Handoff
                text={summary(input, result)}
                brief={technicianBrief(input, result)}
              />
              <label className="consent">
                <input
                  type="checkbox"
                  checked={saveConsent}
                  onChange={(e) => setSaveConsent(e.target.checked)}
                />
                Save this text case on this browser. Anyone using this browser
                may see it. Photos are excluded.
              </label>
              <button
                className="text-button"
                type="button"
                disabled={!saveConsent || saved}
                onClick={() => setSaved(workshop.saveCase(input, result))}
              >
                {saved ? "Saved to history" : "Save case"}
              </button>
              {workshop.error ? <p role="alert">{workshop.error}</p> : null}
              <p className="field-note">
                Rule version: {result.version} ·{" "}
                {result.model || "Rules only; no AI result"}
              </p>
            </>
          ) : null}
          {busy ? (
            <div className="loading" role="status">
              <p>
                Safety checked. Reviewing your evidence and validating the
                response…
              </p>
              {draft.length ? (
                <div>
                  <p>
                    Provisional possibilities · awaiting final safety validation
                  </p>
                  {draft.map((h, i) => (
                    <article key={`draft-${i}`}>
                      <h4>{h.title}</h4>
                      <p>{h.reason}</p>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          {error ? (
            <p className="error-message" role="alert">
              {error}
            </p>
          ) : null}
          <div className="dialog-actions">
            {step > 0 && step < 3 ? (
              <button
                className="text-button"
                type="button"
                disabled={busy}
                onClick={() => move(step - 1)}
              >
                Back
              </button>
            ) : null}
            {step < 3 ? (
              <button
                className="button dark"
                disabled={
                  busy ||
                  photoBusy ||
                  (step === 1 && !safetyAnswered) ||
                  (step === 2 && input.mode === "ai" && !consent)
                }
              >
                {step === 2
                  ? busy
                    ? "Analyzing…"
                    : input.mode === "rules"
                      ? "View basic guidance"
                      : "Analyze with AI"
                  : "Continue"}
                <Icon name="arrow" size={18} />
              </button>
            ) : (
              <button
                className="button dark"
                type="button"
                onClick={() =>
                  downloadText(
                    "reparo-technician-summary.txt",
                    summary(input, result || undefined),
                  )
                }
              >
                Download summary
              </button>
            )}
            {error ? (
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  downloadText("reparo-observations.txt", summary(input))
                }
              >
                Download observations
              </button>
            ) : null}
          </div>
        </form>
        <p className="preview-note">
          AI can be wrong. External observations only. A qualified technician
          should assess persistent faults.
        </p>
      </div>
    </dialog>
  );
}
