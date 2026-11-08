import { DeviceCard } from "./DeviceCard";
import { DeviceEditor } from "./DeviceEditor";
import { lazy, Suspense } from "react";
const AccountPanel = lazy(() =>
  import("./AccountPanel").then((m) => ({ default: m.AccountPanel })),
);
import { CareTools } from "./CareTools";
import { ManualLibrary } from "./ManualLibrary";
import { Handoff } from "./Handoff";
import { useState, type FormEvent } from "react";
import { appliances } from "../diagnostics";
import { downloadText, summary, type Workshop, type Device } from "../workshop";
import { Icon } from "./Icon";
import { BackupPanel } from "./BackupPanel";
import { calendarEvent, careStatus } from "../workshop-data";

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
  onStart: (id?: string, model?: string, deviceId?: string) => void;
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
  const [editing, setEditing] = useState<string | null>(null);
  const tabs = [
    "Overview",
    "My appliances",
    "Case history",
    "Care library",
    "Tools",
    "Backup & data",
  ];
  const reminders = workshop.data.devices
    .filter((d) => d.careDate)
    .sort((a, b) => a.careDate.localeCompare(b.careDate));
  const cases = workshop.data.cases.filter(
    (c) =>
      (filter === "all" || c.status === filter) &&
      `${c.appliance} ${appliances.find((a) => a.id === c.appliance)?.name || ""} ${c.model} ${c.symptom} ${c.notes}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  function add(e: FormEvent) {
    e.preventDefault();
    const careDate = String(
      new FormData(e.currentTarget as HTMLFormElement).get("careDate") || "",
    );
    if (
      editing
        ? workshop.updateDevice(editing, {
            ...device,
            careDate,
            name: device.name.trim(),
          })
        : workshop.addDevice({ ...device, careDate, name: device.name.trim() })
    ) {
      setAdding(false);
      setDevice({ name: "", category: "washer", model: "", careDate: "" });
      setDeviceConsent(false);
      setEditing(null);
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
            <div className="care-reminders">
              <div className="panel-heading">
                <div>
                  <h3>Upcoming care</h3>
                  <p>
                    Your chosen dates, with no background service or
                    notification fee.
                  </p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setTab("My appliances")}
                >
                  Manage care dates
                </button>
              </div>
              {reminders.length ? (
                <ul>
                  {reminders.slice(0, 5).map((d) => (
                    <li key={d.id}>
                      <div>
                        <strong>{d.name}</strong>
                        <span>
                          {d.careDate} · {careStatus(d)}
                        </span>
                      </div>
                      <button
                        className="text-button"
                        onClick={() => workshop.completeCare(d.id)}
                      >
                        Mark care done
                      </button>
                      <button
                        className="text-button"
                        onClick={() =>
                          downloadText(
                            "reparo-care.ics",
                            calendarEvent(d),
                            "text/calendar;charset=utf-8",
                          )
                        }
                      >
                        Add to calendar
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  No care dates yet. Set one while adding or editing an
                  appliance.
                </p>
              )}
              <p className="field-note">
                Marking care done records your action; it does not certify
                safety. Calendar exports include your chosen repeat interval and
                do not auto-sync.
              </p>
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
                onClick={() => {
                  setAdding(!adding);
                  setEditing(null);
                  setDevice({
                    name: "",
                    category: "washer",
                    model: "",
                    careDate: "",
                  });
                  setDeviceConsent(false);
                }}
              >
                {adding ? "Cancel" : "Add appliance"}
                <Icon name="plus" size={17} />
              </button>
            </div>
            {adding ? (
              <DeviceEditor
                add={add}
                device={device}
                setDevice={setDevice}
                editing={editing}
                deviceConsent={deviceConsent}
                setDeviceConsent={setDeviceConsent}
              />
            ) : null}
            <div className="device-list">
              {workshop.data.devices.length ? (
                workshop.data.devices.map((d) => (
                  <DeviceCard
                    key={d.id}
                    d={d}
                    workshop={workshop}
                    onStart={onStart}
                    onEdit={(device) => {
                      setDevice({ ...device });
                      setEditing(device.id);
                      setAdding(true);
                      setDeviceConsent(true);
                      requestAnimationFrame(() =>
                        document
                          .querySelector<HTMLInputElement>(".device-form input")
                          ?.focus(),
                      );
                    }}
                    onHistory={(device) => {
                      setTab("Case history");
                      setSearch(device.model || device.category);
                    }}
                  />
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
                      <Handoff text={summary(c, c.result)} />
                      {c.imported ? (
                        <p className="field-note">
                          Imported archive — not a fresh analysis. Its contents
                          have not been verified by Reparo.
                        </p>
                      ) : null}
                      {c.result.notice ? (
                        <p className="field-note">{c.result.notice}</p>
                      ) : null}
                      <p>{c.notes}</p>
                      {c.result.hypotheses.map((h, i) => (
                        <p key={`hypothesis-${i}`}>
                          <strong>{h.title}</strong> — {h.reason} Uncertainty:{" "}
                          {h.uncertainty}
                        </p>
                      ))}
                      <ul>
                        {c.result.checks.map((s, i) => (
                          <li key={`item-${i}`}>{s}</li>
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
            <ManualLibrary />
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
                  "AI suggestions are unverified possibilities. Only exact-model manual passages you choose can support citations. Never use AI output as proof that an appliance is safe.",
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
        {tab === "Tools" ? <CareTools /> : null}
        {tab === "Backup & data" ? (
          <>
            <Suspense fallback={<p>Loading account…</p>}>
              <AccountPanel workshop={workshop} />
            </Suspense>
            <BackupPanel workshop={workshop} />
          </>
        ) : null}
      </div>
      {workshop.error ? (
        <p role="alert" className="error-message">
          {workshop.error}
        </p>
      ) : null}
      <p className="field-note">
        Records stay on this browser unless you choose an account and upload a
        cloud copy in Backup & data. Clearing browser data removes local
        records, receipts and manuals.
      </p>
    </section>
  );
}
