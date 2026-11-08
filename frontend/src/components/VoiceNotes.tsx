import { useEffect, useRef, useState } from "react";
type Speech = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};
export function VoiceNotes({
  onText,
  lang,
}: {
  onText: (text: string) => void;
  lang: string;
}) {
  const speech = useRef<Speech | null>(null),
    [listening, setListening] = useState(false),
    [error, setError] = useState("");
  const ctor =
    (
      window as unknown as {
        SpeechRecognition?: new () => Speech;
        webkitSpeechRecognition?: new () => Speech;
      }
    ).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => Speech })
      .webkitSpeechRecognition;
  useEffect(
    () => () => {
      const s = speech.current;
      if (s) {
        s.onresult = null;
        s.onerror = null;
        s.onend = null;
        s.stop();
      }
    },
    [],
  );
  function toggle() {
    if (listening) {
      speech.current?.stop();
      return;
    }
    if (!ctor) return;
    const s = new ctor();
    speech.current = s;
    s.lang = lang === "hi" ? "hi-IN" : "en-IN";
    s.interimResults = false;
    s.continuous = false;
    s.onresult = (e) => {
      onText(
        Array.from(e.results)
          .map((r) => r[0].transcript)
          .join(" "),
      );
    };
    s.onerror = (e) => {
      setError(
        `Voice input unavailable (${e.error}). Type your observations instead.`,
      );
      setListening(false);
    };
    s.onend = () => setListening(false);
    try {
      s.start();
      setListening(true);
      setError("");
    } catch {
      setError("Could not start voice input.");
    }
  }
  return ctor ? (
    <div>
      <button
        type="button"
        className="text-button"
        aria-pressed={listening}
        onClick={toggle}
      >
        {listening
          ? "Stop listening"
          : lang === "hi"
            ? "बोलकर नोट लिखें"
            : "Dictate notes"}
      </button>
      <p className="field-note">
        Your browser may send speech to its transcription provider. Review the
        text before submitting.
      </p>
      {error ? <p role="status">{error}</p> : null}
    </div>
  ) : (
    <p className="field-note">
      Voice input is not supported in this browser. Type your observations.
    </p>
  );
}
