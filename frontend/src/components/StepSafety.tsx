import type { Dispatch, SetStateAction } from "react";
import type { AnalysisRequest } from "../../../shared/analysis";
import { appliances } from "../diagnostics";
export function StepSafety({
  input,
  setInput,
  initialPhoto,
  lang,
  safetyAnswered,
  setSafetyAnswered,
}: {
  input: AnalysisRequest;
  setInput: Dispatch<SetStateAction<AnalysisRequest>>;
  initialPhoto: string;
  lang: string;
  safetyAnswered: boolean;
  setSafetyAnswered: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <>
      {initialPhoto ? (
        <p className="repair-photo-note">
          Camera frame attached. Confirm safety first; then describe the symptom
          for the identified{" "}
          {appliances.find((a) => a.id === input.appliance)?.name.toLowerCase()}
          .
        </p>
      ) : null}
      <p>
        Have you noticed smoke, burning, sparks, electric shock, a gas or
        refrigerant leak, exposed wiring, or water near electricity?
      </p>
      {lang === "hi" ? (
        <p lang="hi">
          धुआँ, जलने की गंध, चिंगारी, करंट, गैस, खुले तार या बिजली के पास पानी
          दिखे तो रुकें। अनिश्चित होने पर भी उपकरण न चलाएँ। तत्काल खतरे में
          सुरक्षित जगह जाएँ और स्थानीय आपातकालीन सेवा से संपर्क करें।
        </p>
      ) : null}
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
        If danger is immediate, leave the area and contact local emergency
        services.
      </p>
    </>
  );
}
