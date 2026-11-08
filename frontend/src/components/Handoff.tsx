import { useState } from "react";
export function Handoff({ text }: { text: string }) {
  const [message, setMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Summary copied.");
    } catch {
      setMessage("Clipboard unavailable. Use Download summary.");
    }
  }
  async function share() {
    try {
      await navigator.share({ title: "Reparo technician handoff", text });
      setMessage("Shared.");
    } catch (e) {
      if (!(e instanceof Error && e.name === "AbortError"))
        setMessage("Sharing unavailable. Use Copy or Download summary.");
    }
  }
  function print() {
    const frame = document.createElement("iframe");
    frame.title = "Technician summary print view";
    frame.style.display = "none";
    document.body.append(frame);
    const doc = frame.contentDocument;
    if (!doc) {
      frame.remove();
      return;
    }
    doc.open();
    doc.write(
      "<!doctype html><title>Reparo technician summary</title><style>body{font:12px/1.4 sans-serif;margin:18mm}pre{white-space:pre-wrap;font:inherit}h1{font-size:20px}@page{size:A4;margin:0}</style><h1>Reparo · Technician handoff</h1><pre></pre>",
    );
    doc.close();
    doc.querySelector("pre")!.textContent = text;
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => frame.remove(), 60000);
  }
  return (
    <div className="handoff-actions">
      <button className="text-button" type="button" onClick={() => void copy()}>
        Copy summary
      </button>
      {typeof navigator.share === "function" ? (
        <button
          className="text-button"
          type="button"
          onClick={() => void share()}
        >
          Share
        </button>
      ) : null}
      <button className="text-button" type="button" onClick={print}>
        Print summary
      </button>
      {message ? (
        <p role="status" className="toast">
          {message}
        </p>
      ) : null}
    </div>
  );
}
