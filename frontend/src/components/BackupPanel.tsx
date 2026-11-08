import { useState } from "react";
import {
  makeBackup,
  maxBackupBytes,
  mergeBackup,
  parseBackup,
  type WorkshopData,
} from "../workshop-data";
import { downloadText, type Workshop } from "../workshop";

export function BackupPanel({ workshop }: { workshop: Workshop }) {
  const [incoming, setIncoming] = useState<WorkshopData | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function readBackup(file?: File) {
    setIncoming(null);
    setError("");
    setMessage("");
    if (!file) return;
    try {
      if (file.size > maxBackupBytes)
        throw new Error("Choose a backup under 2 MB.");
      const candidate = parseBackup(await file.text());
      mergeBackup(workshop.data, candidate);
      setIncoming(candidate);
    } catch (e) {
      setError(
        e instanceof SyntaxError
          ? "This file is not valid JSON. Nothing was changed."
          : e instanceof Error
            ? e.message
            : "The file could not be read.",
      );
    }
  }
  const preview = incoming
    ? {
        cases: incoming.cases.filter(
          (c) => !workshop.data.cases.some((existing) => existing.id === c.id),
        ).length,
        devices: incoming.devices.filter(
          (d) =>
            !workshop.data.devices.some((existing) => existing.id === d.id),
        ).length,
      }
    : null;
  return (
    <div className="backup-panel">
      <div className="panel-heading">
        <div>
          <h3>Your records belong to you.</h3>
          <p>
            Move saved text cases and appliances between browsers without a
            cloud account. Backups contain private notes and are not encrypted.
            Store them somewhere you trust.
          </p>
        </div>
      </div>
      <div className="backup-grid">
        <article>
          <p className="eyebrow">01 / TAKE A COPY</p>
          <h3>Download your workspace</h3>
          <p>
            {workshop.data.devices.length} appliances ·{" "}
            {workshop.data.cases.length} cases. Photos and API keys are never
            included.
          </p>
          <button
            className="button dark"
            onClick={() => {
              downloadText(
                "reparo-backup.json",
                makeBackup(workshop.data),
                "application/json",
              );
              setMessage("Backup download requested. Keep the file private.");
            }}
          >
            Download backup
          </button>
        </article>
        <article>
          <p className="eyebrow">02 / BRING IT WITH YOU</p>
          <h3>Import a Reparo backup</h3>
          <label className="field-label">
            Choose a backup file
            <input
              type="file"
              accept=".json,application/json"
              onChange={(e) => {
                void readBackup(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          <p>
            Up to 2 MB. Existing records stay as they are. Matching IDs are
            skipped, not overwritten. Capacity: 50 appliances and 100 cases.
          </p>
        </article>
      </div>
      {incoming && preview ? (
        <div className="import-preview">
          <h3>Ready to merge</h3>
          <p>
            {preview.devices} new appliances and {preview.cases} new cases.
            Existing records are preserved. Imported analyses are unverified
            archive records, not fresh diagnoses.
          </p>
          <label className="consent">
            <input
              type="checkbox"
              id="import-consent"
              required
              form="import-backup"
            />
            I trust this file and agree to save these records on this browser.
          </label>
          <form
            id="import-backup"
            onSubmit={(e) => {
              e.preventDefault();
              if (workshop.importData(incoming)) {
                setMessage(
                  `Imported ${preview.devices} appliances and ${preview.cases} cases.`,
                );
                setIncoming(null);
              }
            }}
          >
            <button className="button dark">Merge backup</button>
            <button
              className="text-button"
              type="button"
              onClick={() => setIncoming(null)}
            >
              Cancel import
            </button>
          </form>
        </div>
      ) : null}
      {error ? (
        <p className="error-message" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="field-note">
          {message}
        </p>
      ) : null}
      <p className="field-note">
        This is manual transfer, not automatic sync. A backup file is read
        locally and is never uploaded to the AI service.
      </p>
    </div>
  );
}
