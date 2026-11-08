import type { Dispatch, SetStateAction } from "react";
import type { AnalysisRequest } from "../../../shared/analysis";
import { appliances } from "../diagnostics";
import { Icon } from "./Icon";
export function StepAppliance({
  input,
  setInput,
}: {
  input: AnalysisRequest;
  setInput: Dispatch<SetStateAction<AnalysisRequest>>;
}) {
  return (
    <>
      <p>
        Select an appliance. A model number helps describe context, but does not
        verify manual compatibility.
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
  );
}
