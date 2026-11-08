import type { Dispatch, SetStateAction } from "react";
import type { AnalysisRequest } from "../../../shared/analysis";
import { symptoms } from "../diagnostics";
import { VoiceNotes } from "./VoiceNotes";
export function StepEvidence({
  input,
  setInput,
  photoBusy,
  loadPhoto,
  photoError,
  lang,
  useManuals,
  setUseManuals,
  consent,
  setConsent,
}: {
  input: AnalysisRequest;
  setInput: Dispatch<SetStateAction<AnalysisRequest>>;
  photoBusy: boolean;
  loadPhoto: (file?: File) => Promise<void>;
  photoError: string;
  lang: string;
  useManuals: boolean;
  setUseManuals: Dispatch<SetStateAction<boolean>>;
  consent: boolean;
  setConsent: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <>
      <label className="field-label" htmlFor="symptom">
        Main symptom
      </label>
      <fieldset className="symptom-chips">
        <legend className="sr-only">Main symptom</legend>
        {symptoms[input.appliance].map((symptom, i) => (
          <label
            className={input.symptom === symptom ? "selected" : ""}
            key={`symptom-${i}`}
          >
            <input
              required
              type="radio"
              name="symptom"
              value={symptom}
              checked={input.symptom === symptom}
              onChange={() => setInput({ ...input, symptom })}
            />
            {symptom}
          </label>
        ))}
      </fieldset>
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
      <VoiceNotes
        lang={lang}
        onText={(text) =>
          setInput((old) => ({
            ...old,
            notes: `${old.notes} ${text}`.trim().slice(0, 2000),
          }))
        }
      />
      <label className="field-label" htmlFor="photo">
        External photo (optional)
      </label>
      <div
        className="drop-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (input.mode === "ai" && !photoBusy)
            void loadPhoto(e.dataTransfer.files[0]);
        }}
      >
        <input
          id="photo"
          disabled={input.mode === "rules" || photoBusy}
          type="file"
          capture="environment"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => void loadPhoto(e.target.files?.[0])}
        />
        <span className="field-note">
          Drop an exterior image here, or choose a file.
        </span>
      </div>
      <p className="field-note">
        Exterior or display only. Do not open or run the appliance for a photo.
        Images are resized and metadata removed before sending. Hide names,
        addresses, serial numbers and other private details. No image is saved
        in your history.
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
          checked={useManuals}
          onChange={(e) => setUseManuals(e.target.checked)}
        />
        Include relevant pages from my local manuals when an exact model
        matches. Excerpts will be sent to Google with this request.
      </label>
      <details className="submit-choice" open>
        <summary>Review and submit</summary>
        <fieldset className="safety-options">
          <legend>Choose your guide</legend>
          <label className="option">
            <input
              type="radio"
              name="guide-mode"
              checked={input.mode === "ai"}
              onChange={() => setInput({ ...input, mode: "ai" })}
            />
            Free-tier AI (limited availability)
          </label>
          <label className="option">
            <input
              type="radio"
              name="guide-mode"
              checked={input.mode === "rules"}
              onChange={() =>
                setInput({ ...input, mode: "rules", photo: undefined })
              }
            />
            Basic guide — runs on this device, no AI or key
          </label>
        </fieldset>
        {input.mode === "ai" ? (
          <label className="consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
            />
            I agree to send these observations and the optional photo to
            Google’s Gemini API free tier. Google may use inputs and outputs to
            improve its products, and human review may occur. Do not include
            private or sensitive information. Free quota limits apply; basic
            guidance is used if AI is unavailable.
          </label>
        ) : null}
      </details>
    </>
  );
}
