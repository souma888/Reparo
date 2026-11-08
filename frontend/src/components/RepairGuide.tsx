import { useState } from "react";
import { guidesFor } from "../../../shared/repair-guides";
export function RepairGuide({
  appliance,
  stopped,
}: {
  appliance: string;
  stopped: boolean;
}) {
  const guides = guidesFor(appliance, stopped);
  const [selected, setSelected] = useState(""),
    [ack, setAck] = useState(false),
    [step, setStep] = useState(-1),
    [outcome, setOutcome] = useState("");
  const guide = guides.find((g) => g.id === selected);
  if (stopped) return null;
  return (
    <section className="repair-plan" aria-labelledby="repair-guide-title">
      <p className="eyebrow">GUIDED OWNER-LEVEL FIXES</p>
      <h3 id="repair-guide-title">Work through a supported fix.</h3>
      <p>
        Choose only a condition you can already confirm. These are limited
        external tasks, not a diagnosis or instructions for internal repairs.
        Source examples do not verify your exact model.
      </p>
      {guides.length ? (
        <>
          <label className="field-label" htmlFor="repair-condition">
            Which condition matches?
          </label>
          <select
            id="repair-condition"
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setAck(false);
              setStep(-1);
              setOutcome("");
            }}
          >
            <option value="">Choose a matching observation</option>
            {guides.map((g) => (
              <option value={g.id} key={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          {guide ? (
            <>
              <p className="repair-photo-note">{guide.condition}</p>
              <a href={guide.source} target="_blank" rel="noreferrer">
                Reference: {guide.sourceLabel}
              </a>
              {step < 0 ? (
                <>
                  <label className="consent">
                    <input
                      type="checkbox"
                      checked={ack}
                      onChange={(e) => setAck(e.target.checked)}
                    />
                    That condition matches my observation, no hazards are
                    present, and I have checked my exact model manual permits
                    this task.
                  </label>
                  <button
                    className="button dark"
                    type="button"
                    disabled={!ack}
                    onClick={() => setStep(0)}
                  >
                    Start this guide
                  </button>
                </>
              ) : outcome ? (
                <div className="repair-step" role="status">
                  <strong>
                    {outcome === "resolved"
                      ? "Observation recorded — issue appears resolved."
                      : "Stop here and arrange qualified help."}
                  </strong>
                  <p>
                    {outcome === "resolved"
                      ? "This is your observation, not proof the appliance is safe. Stop using it if any symptom or hazard returns."
                      : "Do not repeat tests or attempt internal repairs. Export this session for a technician."}
                  </p>
                </div>
              ) : step < guide.steps.length ? (
                <div className="repair-step">
                  <p className="step-number">
                    STEP {step + 1} OF {guide.steps.length}
                  </p>
                  <p>{guide.steps[step]}</p>
                  <div className="case-actions">
                    {step > 0 ? (
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => setStep(step - 1)}
                      >
                        Previous step
                      </button>
                    ) : null}
                    <button
                      className="button dark"
                      type="button"
                      onClick={() => setStep(step + 1)}
                    >
                      This step is done
                    </button>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => setOutcome("unsafe")}
                    >
                      I cannot do this safely
                    </button>
                  </div>
                </div>
              ) : (
                <div className="repair-step">
                  <h4>What can you confirm?</h4>
                  <p>
                    Do not run a faulty appliance to answer. Choose based on the
                    safe observations you already made.
                  </p>
                  <div className="case-actions">
                    <button
                      type="button"
                      className="button dark"
                      onClick={() => setOutcome("resolved")}
                    >
                      Observed issue resolved
                    </button>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setOutcome("unresolved")}
                    >
                      Still stuck / cannot confirm
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </>
      ) : (
        <p>
          No owner-level repair is supported for this category yet. Use the
          observations and summary for a qualified technician; do not attempt an
          internal fix.
        </p>
      )}
    </section>
  );
}
