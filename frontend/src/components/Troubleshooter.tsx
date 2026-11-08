import { useRef, useState, type FormEvent } from "react";
import {
  appliances,
  getGuidance,
  symptoms,
  type SafetyAnswer,
} from "../diagnostics";
import { Icon } from "./Icon";

export function Troubleshooter({
  initialAppliance,
  onClose,
}: {
  initialAppliance: string;
  onClose: () => void;
}) {
  const [appliance, setAppliance] = useState(initialAppliance);
  const [step, setStep] = useState(0);
  const [safety, setSafety] = useState<SafetyAnswer>("");
  const [symptom, setSymptom] = useState("");
  const [notes, setNotes] = useState("");
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const selected = appliances.find((item) => item.id === appliance)!;
  const result = getGuidance(appliance, symptom, safety, notes);

  function mountDialog(node: HTMLDialogElement | null) {
    dialogRef.current = node;
    if (node && !node.open) node.showModal();
  }
  function moveTo(next: number) {
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (step === 0) moveTo(1);
    else if (step === 1) moveTo(safety === "no" ? 2 : 3);
    else moveTo(3);
  }
  function downloadSummary() {
    const text = `REPARO — FRONTEND PREVIEW\n\nAppliance: ${selected.name}\nSymptom: ${symptom || "Not collected — safety stop"}\nHazard reported: ${safety}\nNotes: ${notes || "None"}\n\n${result.title}\n${result.intro}\n\n${result.checks.map((check, i) => `${i + 1}. ${check}`).join("\n\n")}\n\nNo diagnosis has been made. No information was uploaded or saved by Reparo.`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "reparo-session-summary.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <dialog
      ref={mountDialog}
      className="troubleshooter"
      aria-labelledby="dialog-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="dialog-inner">
        <div className="dialog-top">
          <span className="eyebrow">REPARO / GUIDED PREVIEW</span>
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
          {["Appliance", "Safety", "Symptoms", "Guidance"].map((label, i) => (
            <span key={label} className={i <= step ? "active" : ""}>
              <b>0{i + 1}</b> {label}
            </span>
          ))}
        </div>
        <form onSubmit={submit}>
          <h2 id="dialog-title" ref={headingRef} tabIndex={-1}>
            {step === 0
              ? "What needs a little care?"
              : step === 1
                ? "First, a moment for safety."
                : step === 2
                  ? "Tell us what you’ve noticed."
                  : result.title}
          </h2>
          {step === 0 ? (
            <>
              <p>Choose your appliance to explore the guided experience.</p>
              <div className="dialog-options">
                {appliances.map((item) => (
                  <label
                    key={item.id}
                    className={`option ${item.id === appliance ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="appliance"
                      value={item.id}
                      checked={appliance === item.id}
                      onChange={() => {
                        setAppliance(item.id);
                        setSymptom("");
                      }}
                    />
                    <Icon name={item.icon} />
                    <span>{item.name}</span>
                  </label>
                ))}
              </div>
            </>
          ) : null}
          {step === 1 ? (
            <>
              <p>
                Have you noticed smoke, a burning smell, sparks, electric shock,
                a gas or refrigerant leak, exposed wiring, or water near
                electrical parts?
              </p>
              <fieldset className="safety-options">
                <legend className="sr-only">
                  Are any hazard signs present?
                </legend>
                {(
                  [
                    ["yes", "Yes, I’ve noticed a warning sign"],
                    ["no", "No, none of these are present"],
                    ["unsure", "I’m not sure"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={`option ${safety === value ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="safety"
                      value={value}
                      checked={safety === value}
                      onChange={() => setSafety(value)}
                      required
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </fieldset>
              <p className="field-note">
                If there is immediate danger, leave the area and contact local
                emergency services.
              </p>
            </>
          ) : null}
          {step === 2 ? (
            <>
              <p>
                A few observations about your {selected.name.toLowerCase()} can
                help organize the next conversation.
              </p>
              <label className="field-label" htmlFor="symptom">
                Main symptom
              </label>
              <select
                id="symptom"
                value={symptom}
                onChange={(event) => setSymptom(event.target.value)}
                required
              >
                <option value="">Select a symptom</option>
                {symptoms[appliance].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <label className="field-label" htmlFor="notes">
                Anything else you’ve noticed? <span>(optional)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                maxLength={1200}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="For example, an error code or when the issue started."
              />
              <p className="field-note">
                Stay with what you can safely observe. There is no need to open
                or run the appliance.
              </p>
            </>
          ) : null}
          {step === 3 ? (
            <div className="result">
              <div className={`result-tag ${result.stop ? "stop" : ""}`}>
                <Icon name="shield" size={17} />
                {result.stop ? "Stop & seek help" : "General observations only"}
              </div>
              <p>{result.intro}</p>
              <ol>
                {result.checks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ol>
              <p className="field-note">
                Your answers stay in this window and are cleared when you close
                it.
              </p>
            </div>
          ) : null}
          <div className="dialog-actions">
            {step > 0 && step < 3 ? (
              <button
                type="button"
                className="text-button"
                onClick={() => moveTo(step - 1)}
              >
                Back
              </button>
            ) : null}
            {step < 3 ? (
              <button
                className="button dark"
                type="submit"
                disabled={step === 1 && !safety}
              >
                Continue <Icon name="arrow" size={18} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="button dark"
                  onClick={downloadSummary}
                >
                  Download summary <Icon name="arrow" size={18} />
                </button>
                <button type="button" className="text-button" onClick={onClose}>
                  Finish
                </button>
              </>
            )}
          </div>
        </form>
        <div className="preview-note">
          Frontend preview · No AI diagnosis · No uploads or account required
        </div>
      </div>
    </dialog>
  );
}
