import { useEffect, useRef, useState, type FormEvent } from "react";
import { appliances, symptoms } from "../diagnostics";
import {
  mustStop,
  analysisSchema,
  safetyResult,
  type Analysis,
  type AnalysisRequest,
} from "../../../shared/analysis";
import { downloadText, summary, type Workshop } from "../workshop";
import { Icon } from "./Icon";

export function AnalysisGuide({
  initialAppliance,
  initialModel,
  onClose,
  workshop,
}: {
  initialAppliance: string;
  initialModel: string;
  onClose: () => void;
  workshop: Workshop;
}) {
  const [input, setInput] = useState<AnalysisRequest>({
    appliance: initialAppliance as AnalysisRequest["appliance"],
    symptom: "",
    safety: "unsure",
    notes: "",
    model: initialModel,
    answers: {},
    consent: true,
  });
  const [step, setStep] = useState(0),
    [safetyAnswered, setSafetyAnswered] = useState(false),
    [consent, setConsent] = useState(false),
    [saveConsent, setSaveConsent] = useState(false),
    [saved, setSaved] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [photoError, setPhotoError] = useState("");
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
    setBusy(true);
    const controller = new AbortController();
    abort.current = controller;
    const timer = setTimeout(() => controller.abort(), 55000);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => ({
        error: "The AI service is unavailable. Try again after deployment.",
      }));
      if (!response.ok)
        throw new Error(payload.error || "Analysis failed. Please try again.");
      setResult(analysisSchema.parse(payload));
      move(3);
    } catch (e) {
      if (dialog.current?.open)
        setError(
          e instanceof Error && e.name !== "AbortError"
            ? e.message
            : "Analysis timed out. Please retry.",
        );
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
          <h2 id="dialog-title" ref={heading} tabIndex={-1}>
            {
              [
                "What needs a little care?",
                "First, a moment for safety.",
                "Build a clearer picture.",
                result?.stop
                  ? "Let’s put safety first."
                  : "Here’s what the evidence suggests.",
              ][step]
            }
          </h2>
          {step === 0 ? (
            <>
              <p>
                Select an appliance. A model number helps describe context, but
                does not verify manual compatibility.
              </p>
              <div className="dialog-options">
                {appliances.map((a) => (
                  <label
                    className={`option ${input.appliance === a.id ? "selected" : ""}`}
                    key={a.id}
                  >
                    <input
                      type="radio"
                      name="appliance"
                      checked={input.appliance === a.id}
                      onChange={() =>
                        setInput({
                          ...input,
                          appliance: a.id as AnalysisRequest["appliance"],
                          symptom: "",
                          answers: {},
                        })
                      }
                    />
                    <Icon name={a.icon} />
                    {a.name}
                  </label>
                ))}
              </div>
              <label className="field-label" htmlFor="model">
                Brand / model (optional)
              </label>
              <input
                id="model"
                maxLength={120}
                value={input.model}
                onChange={(e) => setInput({ ...input, model: e.target.value })}
              />
            </>
          ) : null}
          {step === 1 ? (
            <>
              <p>
                Have you noticed smoke, burning, sparks, electric shock, a gas
                or refrigerant leak, exposed wiring, or water near electricity?
              </p>
              <fieldset className="safety-options">
                <legend className="sr-only">Hazard signs</legend>
                {(
                  [
                    ["yes", "Yes, a warning sign is present"],
                    ["no", "No, none of these are present"],
                    ["unsure", "I’m not sure"],
                  ] as const
                ).map(([value, label]) => (
                  <label className="option" key={value}>
                    <input
                      required
                      type="radio"
                      name="safety"
                      checked={safetyAnswered && input.safety === value}
                      onChange={() => {
                        setInput({ ...input, safety: value });
                        setSafetyAnswered(true);
                      }}
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
              <p className="field-note">
                If danger is immediate, leave the area and contact local
                emergency services.
              </p>
            </>
          ) : null}
          {step === 2 ? (
            <>
              <label className="field-label" htmlFor="symptom">
                Main symptom
              </label>
              <select
                id="symptom"
                required
                value={input.symptom}
                onChange={(e) =>
                  setInput({ ...input, symptom: e.target.value })
                }
              >
                <option value="">Choose a symptom</option>
                {symptoms[input.appliance].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <label className="field-label" htmlFor="notes">
                What have you noticed?
              </label>
              <textarea
                id="notes"
                required
                rows={3}
                maxLength={2000}
                value={input.notes}
                onChange={(e) => setInput({ ...input, notes: e.target.value })}
                placeholder="When did it start? Any visible error codes? Describe only what you already observed."
              />
              <label className="field-label" htmlFor="photo">
                External photo (optional)
              </label>
              <input
                id="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => void loadPhoto(e.target.files?.[0])}
              />
              <p className="field-note">
                Exterior or display only. Do not open or run the appliance for a
                photo. Images are resized and metadata removed before sending.
                No image is saved in your history.
              </p>
              {photoError ? <p role="alert">{photoError}</p> : null}
              {input.photo ? (
                <div className="photo-preview">
                  <img src={input.photo} alt="Selected appliance evidence" />
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setInput({ ...input, photo: undefined })}
                  >
                    Remove photo
                  </button>
                </div>
              ) : null}
              <label className="consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                />
                I agree to send these observations and the optional photo to the
                AI service through Vercel AI Gateway. Avoid personal
                information. Provider retention policies apply.
              </label>
            </>
          ) : null}
          {step === 3 && result ? (
            <>
              <div className={`result-tag ${result.stop ? "stop" : ""}`}>
                {result.stop
                  ? "Stop & seek professional help"
                  : "AI hypotheses · Unverified · Not a diagnosis"}
              </div>
              <div className="result">
                {result.observations.length ? (
                  <>
                    <h3>What was observed</h3>
                    <ul>
                      {result.observations.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {result.hypotheses.length ? (
                  <>
                    <h3>Possible explanations</h3>
                    {result.hypotheses.map((h, i) => (
                      <article className="hypothesis" key={h.title}>
                        <span className="eyebrow">POSSIBILITY 0{i + 1}</span>
                        <h4>{h.title}</h4>
                        <p>{h.reason}</p>
                        <p className="field-note">
                          Uncertainty: {h.uncertainty}
                        </p>
                      </article>
                    ))}
                  </>
                ) : !result.stop ? (
                  <p>There is not enough evidence to suggest a cause.</p>
                ) : null}
                <h3>{result.stop ? "Stop conditions" : "Safe next steps"}</h3>
                <ol>
                  {result.checks.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                {result.unknowns.length ? (
                  <details>
                    <summary>
                      What is still unknown <Icon name="plus" size={16} />
                    </summary>
                    <ul>
                      {result.unknowns.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
              {!result.stop && result.questions.length ? (
                <fieldset className="followups">
                  <legend>Clarify with existing observations</legend>
                  <p className="field-note">
                    Optional. Do not run or open the appliance to answer.
                  </p>
                  {result.questions.map((q, i) => (
                    <label className="field-label" key={q}>
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
                {result.model || "Safety rules; no AI call"}
              </p>
            </>
          ) : null}
          {busy ? (
            <p className="loading" role="status">
              Reviewing your evidence… This can take up to 45 seconds.
            </p>
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
                  (step === 2 && !consent)
                }
              >
                {step === 2
                  ? busy
                    ? "Analyzing…"
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
