import { useState } from "react";
import { auth, authConfigured, bearer } from "../auth";
import { dataSchema } from "../workshop-data";
import type { Workshop } from "../workshop";
export function AccountPanel({ workshop }: { workshop: Workshop }) {
  const session = auth.useSession();
  const [mode, setMode] = useState("signin"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [consent, setConsent] = useState(false),
    [revision, setRevision] = useState<number | null>(null);
  const user = session.data?.user;
  async function submit() {
    setBusy(true);
    setMessage("");
    try {
      const result =
        mode === "signup"
          ? await auth.signUp.email({ email, password, name })
          : await auth.signIn.email({ email, password });
      if (result.error)
        throw new Error(result.error.message || "Sign-in failed.");
      setPassword("");
      setRevision(null);
      setConsent(false);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }
  async function sync(direction: "upload" | "restore") {
    if (!consent) return;
    setBusy(true);
    setMessage("");
    try {
      const token = await bearer();
      let current = revision;
      if (direction === "restore" || current === null) {
        const response = await fetch("/api/sync", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error);
        current = payload.revision;
        if (direction === "restore") {
          if (
            payload.data &&
            !workshop.importData(dataSchema.parse(payload.data))
          )
            throw new Error(
              "Cloud data could not be merged. Local records preserved.",
            );
          setRevision(current);
          setMessage(
            payload.data
              ? "Cloud copy merged. Existing local records take precedence; no automatic overwrite."
              : "No cloud copy yet. You can upload your local records.",
          );
          return;
        }
        if (payload.data)
          throw new Error(
            "A cloud copy already exists. Restore/merge it before uploading from this browser.",
          );
      }
      const response = await fetch("/api/sync", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: workshop.data, revision: current }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setRevision(payload.revision);
      setMessage(
        "Text records uploaded to your account. Receipts, photos and manuals stayed on this device.",
      );
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Sync unavailable. Local data preserved.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!authConfigured)
    return (
      <p>
        Accounts are unavailable on this deployment. Local records and backups
        still work.
      </p>
    );
  return (
    <section className="account-panel">
      <h3>Optional account & cloud copy</h3>
      <p>
        Use the free Neon service to move text cases and appliance details
        between devices. Sync is manual; receipts, evidence photos and manual
        files are excluded.
      </p>
      {session.isPending ? (
        <p role="status">Checking sign-in…</p>
      ) : user ? (
        <>
          <p>Signed in as {user.email}</p>
          <button
            className="text-button"
            disabled={busy}
            onClick={() =>
              void auth
                .signOut()
                .then(() => {
                  setRevision(null);
                  setConsent(false);
                  setMessage(
                    "Signed out. Local records remain on this browser.",
                  );
                })
                .catch(() => setMessage("Could not sign out. Try again."))
            }
          >
            Sign out
          </button>
          <label className="consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            I agree to upload or retrieve these text records with Neon. Anyone
            using this signed-in browser can access this account. Local records
            remain after sign-out.
          </label>
          <div className="handoff-actions">
            <button
              className="button"
              disabled={!consent || busy}
              onClick={() => void sync("restore")}
            >
              Restore / merge cloud copy
            </button>
            <button
              className="button dark"
              disabled={!consent || busy}
              onClick={() => void sync("upload")}
            >
              Upload local records
            </button>
          </div>
        </>
      ) : (
        <form
          className="device-form"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <label>
            Action
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="signin">Sign in</option>
              <option value="signup">Create account</option>
            </select>
          </label>
          {mode === "signup" ? (
            <label>
              Name
              <input
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          ) : null}
          <label>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={8}
              maxLength={128}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="button dark" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
          <p className="field-note">
            Keep your password securely. Password recovery email requires the
            deployment owner to configure a mail provider.
          </p>
        </form>
      )}
      {message ? (
        <p role="status" className="toast">
          {message}
        </p>
      ) : null}
    </section>
  );
}
