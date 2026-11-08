import { useEffect, useState } from "react";
import { manuals, saveManual, removeManual, type Manual } from "../local-files";
import { retrieve, type Passage } from "../../../shared/retrieval";
export function ManualLibrary() {
  const [items, setItems] = useState<Manual[]>([]),
    [title, setTitle] = useState(""),
    [model, setModel] = useState(""),
    [brand, setBrand] = useState(""),
    [source, setSource] = useState(""),
    [revision, setRevision] = useState(""),
    [file, setFile] = useState<File>(),
    [query, setQuery] = useState(""),
    [queryModel, setQueryModel] = useState(""),
    [results, setResults] = useState<Passage[]>([]),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    void manuals()
      .then(setItems)
      .catch(() => setMessage("Browser manual storage unavailable."));
  }, []);
  async function add() {
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      if (file.size > 4 * 1024 * 1024)
        throw new Error("Manual must be under 4 MB.");
      if (source && new URL(source).protocol !== "https:")
        throw new Error("Use an HTTPS source URL.");
      let pages: string[] = [];
      if (file.name.toLowerCase().endsWith(".pdf")) {
        const pdfjs = await import("pdfjs-dist");
        const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const task = pdfjs.getDocument({
          data: new Uint8Array(await file.arrayBuffer()),
        });
        const pdf = await task.promise;
        try {
          if (pdf.numPages > 100)
            throw new Error("Choose a manual with 100 pages or fewer.");
          let size = 0;
          for (let n = 1; n <= pdf.numPages; n++) {
            const page = await pdf.getPage(n);
            const content = await page.getTextContent();
            const text = content.items
              .map((i) => ("str" in i ? i.str : ""))
              .join(" ");
            size += text.length;
            if (size > 500000)
              throw new Error("Extracted manual exceeds 500,000 characters.");
            pages.push(text);
          }
        } finally {
          await task.destroy();
        }
      } else if (file.name.toLowerCase().endsWith(".txt")) {
        const text = await file.text();
        if (text.length > 500000)
          throw new Error("Text exceeds 500,000 characters.");
        pages = text.split("\f");
      } else throw new Error("Choose a text PDF or .txt manual.");
      if (!pages.some((p) => p.trim()))
        throw new Error("No text found. Scanned PDFs need OCR before import.");
      await saveManual({
        id: crypto.randomUUID(),
        title,
        model,
        brand,
        revision,
        source,
        pages,
      });
      setItems(await manuals());
      setMessage(
        "Manual saved privately on this browser. Source and model applicability are user supplied, not manufacturer verified.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not import manual.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="manual-library">
      <summary>My manuals · private search with page citations</summary>
      <p>
        Import a manufacturer manual you have permission to use. PDF text stays
        on this browser. Enter the exact model; only exact model matches are
        searched. Manual excerpts are evidence, not instructions from Reparo.
      </p>
      <form
        className="device-form"
        onSubmit={(e) => {
          e.preventDefault();
          void add();
        }}
      >
        <label>
          Manual title
          <input
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          Manufacturer
          <input
            required
            maxLength={80}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </label>
        <label>
          Exact model
          <input
            required
            minLength={3}
            maxLength={120}
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </label>
        <label>
          Revision / date
          <input
            maxLength={80}
            value={revision}
            onChange={(e) => setRevision(e.target.value)}
          />
        </label>
        <label>
          Original source (HTTPS, optional)
          <input
            type="url"
            maxLength={500}
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </label>
        <label>
          PDF or text file
          <input
            required
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setFile(e.target.files?.[0])}
          />
        </label>
        <button className="button" disabled={busy}>
          {busy ? "Extracting text…" : "Store manual on this browser"}
        </button>
      </form>
      <ul>
        {items.map((m) => (
          <li key={m.id}>
            {m.title} · {m.brand} · {m.model} · {m.pages.length} pages{" "}
            <button
              className="text-button"
              onClick={() =>
                void removeManual(m.id)
                  .then(() => manuals())
                  .then(setItems)
                  .catch(() => setMessage("Could not remove manual."))
              }
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form
        className="device-form"
        onSubmit={(e) => {
          e.preventDefault();
          setResults(retrieve(items, queryModel, query));
          setMessage("");
        }}
      >
        <label>
          Exact model to search
          <input
            required
            value={queryModel}
            onChange={(e) => setQueryModel(e.target.value)}
          />
        </label>
        <label>
          Question / visible error
          <input
            required
            maxLength={300}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button className="button">Find relevant pages</button>
      </form>
      <p className="field-note">
        Up to three keyword matches. No match means the question or exact model
        is unsupported. Scanned manuals without text cannot be searched.
      </p>
      {results.map((p) => (
        <blockquote key={p.id}>
          <cite>
            {p.title} · model {p.model} · page {p.page}
          </cite>
          <p>{p.quote}</p>
          {p.source ? (
            <a href={p.source} target="_blank" rel="noreferrer">
              User-supplied source ↗
            </a>
          ) : null}
        </blockquote>
      ))}
      {message ? <p role="status">{message}</p> : null}
    </details>
  );
}
