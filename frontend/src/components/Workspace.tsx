import { useState, type FormEvent } from "react";
import { appliances } from "../diagnostics";
import { downloadText, summary, type Workshop, type Device } from "../workshop";
import { Icon } from "./Icon";

const manuals = [
  { name: "LG", url: "https://www.lg.com/us/support/manuals-documents" },
  { name: "Samsung", url: "https://www.samsung.com/us/support/downloads/" },
  { name: "Whirlpool", url: "https://www.whirlpool.com/services/manuals.html" },
];
export function Workspace({
  workshop,
  onStart,
}: {
  workshop: Workshop;
  onStart: (id?: string, model?: string) => void;
}) {
  const [tab, setTab] = useState("Overview"),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [expanded, setExpanded] = useState<string | null>(null),
    [adding, setAdding] = useState(false),
    [deviceConsent, setDeviceConsent] = useState(false);
  const [device, setDevice] = useState<Omit<Device, "id">>({
    name: "",
    category: "washer",
    model: "",
    careDate: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const tabs = ["Overview", "My appliances", "Case history", "Care library"];
  const cases = workshop.data.cases.filter(
    (c) =>
      (filter === "all" || c.status === filter) &&
      `${c.appliance} ${c.model} ${c.symptom} ${c.notes}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  function add(e: FormEvent) {
    e.preventDefault();
    if (workshop.addDevice({ ...device, name: device.name.trim() })) {
      setAdding(false);
      setDevice({ name: "", category: "washer", model: "", careDate: "" });
      setDeviceConsent(false);
    }
  }
  return (
    <section
      className="section workspace"
      id="workspace"
      aria-labelledby="workspace-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR PERSONAL CARE DESK</p>
          <h2 id="workspace-title">A home for better care.</h2>
        </div>
        <button className="button dark" onClick={() => onStart()}>
          New analysis <Icon name="plus" size={18} />
        </button>
      </div>
      <div
        className="workspace-tabs"
        role="tablist"
        aria-label="Care workspace"
      >
        {tabs.map((t, i) => (
          <button
            id={`tab-${i}`}
            aria-controls={`panel-${i}`}
            role="tab"
            aria-selected={tab === t}
            tabIndex={tab === t ? 0 : -1}
            key={t}
            onClick={() => setTab(t)}
            onKeyDown={(e) => {
              if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                const next =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? tabs.length - 1
                      : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) %
                        tabs.length;
                setTab(tabs[next]);
                document.getElementById(`tab-${next}`)?.focus();
              }
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`panel-${tabs.indexOf(tab)}`}
        aria-labelledby={`tab-${tabs.indexOf(tab)}`}
        tabIndex={0}
      >
        {tab === "Overview" ? (
          <>
            <div className="workspace-stats">
              <button onClick={() => setTab("My appliances")}>
                <strong>
                  {workshop.data.devices.length.toString().padStart(2, "0")}
                </strong>
                <span>
                  Appliances in your home <Icon name="arrow" size={18} />
                </span>
              </button>
              <button
                onClick={() => {
                  setTab("Case history");
                  setFilter("open");
                }}
              >
                <strong>
                  {workshop.data.cases
                    .filter((c) => c.status === "open")
                    .length.toString()
                    .padStart(2, "0")}
                </strong>
                <span>
                  Open cases <Icon name="arrow" size={18} />
                </span>
              </button>
              <button
                onClick={() => {
                  setTab("Case history");
                  setFilter("resolved");
                }}
              >
                <strong>
                  {workshop.data.cases
                    .filter((c) => c.status === "resolved")
                    .length.toString()
                    .padStart(2, "0")}
                </strong>
                <span>
                  Marked resolved by you <Icon name="arrow" size={18} />
                </span>
              </button>
            </div>
            <div className="workspace-welcome">
              <Icon name="spark" size={32} />
              <div>
                <h3>Start with what you’ve noticed.</h3>
                <p>
                  Describe symptoms, add an exterior photo, and explore possible
                  explanations with AI. Save the useful details for a
                  technician.
                </p>
              </div>
              <button className="text-button" onClick={() => onStart()}>
                Start a case <Icon name="arrow" size={18} />
              </button>
            </div>
          </>
        ) : null}
        {tab === "My appliances" ? (
          <>
            <div className="panel-heading">
              <p>Keep model details and your next care date in one place.</p>
              <button
                className="text-button"
                onClick={() => setAdding(!adding)}
              >
                {adding ? "Cancel" : "Add appliance"}
                <Icon name="plus" size={17} />
              </button>
            </div>
            {adding ? (
              <form className="device-form" onSubmit={add}>
                <label>
                  Appliance name
                  <input
                    autoFocus
                    required
                    maxLength={80}
                    value={device.name}
                    onChange={(e) =>
                      setDevice({ ...device, name: e.target.value })
                    }
                    placeholder="Laundry room washer"
                    pattern=".*\S.*"
                  />
                </label>
                <label>
                  Category
                  <select
                    value={device.category}
                    onChange={(e) =>
                      setDevice({
                        ...device,
                        category: e.target.value as Device["category"],
                      })
                    }
                  >
                    {appliances.map((a) => (
                      <option value={a.id} key={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Brand / model
                  <input
                    maxLength={120}
                    value={device.model}
                    onChange={(e) =>
                      setDevice({ ...device, model: e.target.value })
                    }
                  />
                </label>
                <label>
                  Next care date (optional)
                  <input
                    type="date"
                    value={device.careDate}
                    onChange={(e) =>
                      setDevice({ ...device, careDate: e.target.value })
                    }
                  />
                </label>
                <label className="consent">
                  <input
                    type="checkbox"
                    required
                    checked={deviceConsent}
                    onChange={(e) => setDeviceConsent(e.target.checked)}
                  />
                  Store these details on this browser.
                </label>
                <button className="button dark">Save appliance</button>
              </form>
            ) : null}
            <div className="device-list">
              {workshop.data.devices.length ? (
                workshop.data.devices.map((d) => (
                  <article key={d.id}>
                    <Icon
                      name={appliances.find((a) => a.id === d.category)!.icon}
                      size={34}
                    />
                    <div>
                      <h3>{d.name}</h3>
                      <p>{d.model || "Model not added"}</p>
                      {d.careDate ? (
                        <p>Care date: {d.careDate} · In-app reminder only</p>
                      ) : null}
                    </div>
                    <button
                      className="text-button"
                      onClick={() => onStart(d.category, d.model)}
                    >
                      Troubleshoot
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Remove ${d.name}`}
                      onClick={() => workshop.deleteDevice(d.id)}
                    >
                      <Icon name="close" size={17} />
                    </button>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <Icon name="washer" size={38} />
                  <h3>Your appliances, thoughtfully organized.</h3>
                  <p>
                    Add your first appliance above. Details stay on this
                    browser.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : null}
        {tab === "Case history" ? (
          <>
            <div className="history-filters">
              <label>
                <span className="sr-only">Search cases</span>
                <input
                  type="search"
                  placeholder="Search symptoms, model, or notes…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <label>
                <span className="sr-only">Filter status</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All cases</option>
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                </select>
              </label>
            </div>
            {cases.length ? (
              cases.map((c) => (
                <article className="history-case" key={c.id}>
                  <button
                    className="case-header"
                    aria-expanded={expanded === c.id}
                    onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                  >
                    <div>
                      <span className="eyebrow">
                        {appliances.find((a) => a.id === c.appliance)?.name} /{" "}
                        {new Date(c.date).toLocaleDateString()}
                      </span>
                      <h3>{c.symptom}</h3>
                    </div>
                    <span
                      className={`case-status ${c.result.stop ? "hazard" : ""}`}
                    >
                      {c.result.stop ? "Safety stop" : c.status}
                    </span>
                    <Icon name="plus" size={19} />
                  </button>
                  {expanded === c.id ? (
                    <div className="case-body">
                      <p>{c.notes}</p>
                      {c.result.hypotheses.map((h) => (
                        <p key={h.title}>
                          <strong>{h.title}</strong> — {h.reason} Uncertainty:{" "}
                          {h.uncertainty}
                        </p>
                      ))}
                      <ul>
                        {c.result.checks.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                      <div className="case-actions">
                        <button
                          className="text-button"
                          onClick={() =>
                            downloadText(
                              "reparo-case.txt",
                              summary(c, c.result),
                            )
                          }
                        >
                          Export summary
                        </button>
                        <button
                          className="text-button"
                          onClick={() =>
                            workshop.updateCase(c.id, {
                              status: c.status === "open" ? "resolved" : "open",
                            })
                          }
                        >
                          {c.status === "open" ? "Mark resolved" : "Reopen"}
                        </button>
                        <button
                          className="text-button"
                          onClick={() => setDeleteId(c.id)}
                        >
                          Delete case
                        </button>
                      </div>
                      <p className="field-note">
                        Resolved is your record only, not a safety
                        certification.
                      </p>
                      <div className="case-actions">
                        <span>Was this useful?</span>
                        {(["helpful", "unclear"] as const).map((r) => (
                          <button
                            className="text-button"
                            aria-pressed={c.rating === r}
                            key={r}
                            onClick={() =>
                              workshop.updateCase(c.id, { rating: r })
                            }
                          >
                            {r === c.rating ? "✓ " : ""}
                            {r}
                          </button>
                        ))}
                      </div>
                      {deleteId === c.id ? (
                        <div className="delete-confirm" role="alert">
                          <p>Delete this saved case from this browser?</p>
                          <button
                            className="text-button"
                            onClick={() => {
                              workshop.deleteCase(c.id);
                              setDeleteId(null);
                            }}
                          >
                            Delete permanently
                          </button>
                          <button
                            className="text-button"
                            onClick={() => setDeleteId(null)}
                          >
                            Keep case
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="empty-state">
                <h3>
                  {search || filter !== "all"
                    ? "No matching cases."
                    : "A little history goes a long way."}
                </h3>
                <p>
                  Saved cases appear here. Choose “Save case” after an analysis
                  to keep one.
                </p>
                <button className="text-button" onClick={() => onStart()}>
                  Start an analysis
                </button>
              </div>
            )}
          </>
        ) : null}
        {tab === "Care library" ? (
          <>
            <div className="panel-heading">
              <p>
                Start with the instructions for your exact model. These links
                open manufacturer support portals; they are not retrieved
                evidence for AI results.
              </p>
            </div>
            <div className="manual-links">
              {manuals.map((m) => (
                <a href={m.url} key={m.name} target="_blank" rel="noreferrer">
                  <span className="eyebrow">MANUFACTURER SUPPORT</span>
                  <h3>{m.name} manuals</h3>
                  <span>
                    Find your exact model <Icon name="arrow" size={18} />
                  </span>
                </a>
              ))}
            </div>
            <div className="care-notes">
              {[
                [
                  "Before a service visit",
                  "Collect your model number, visible error codes, when symptoms started, and existing observations. Export the case summary to share with your technician.",
                ],
                [
                  "A photo with a purpose",
                  "A display, exterior label, or visible external damage may add context. Never expose internal components or run a faulty appliance to collect evidence.",
                ],
                [
                  "Know the limits",
                  "AI suggestions are unverified possibilities. No model-specific manual has been retrieved. Never use AI output as proof that an appliance is safe.",
                ],
              ].map(([title, text]) => (
                <details key={title}>
                  <summary>
                    {title}
                    <Icon name="plus" size={18} />
                  </summary>
                  <p>{text}</p>
                </details>
              ))}
            </div>
          </>
        ) : null}
      </div>
      {workshop.error ? (
        <p role="alert" className="error-message">
          {workshop.error}
        </p>
      ) : null}
      <p className="field-note">
        Saved records stay on this device’s browser. No account or cross-device
        sync. Clearing browser data removes them.
      </p>
    </section>
  );
}
