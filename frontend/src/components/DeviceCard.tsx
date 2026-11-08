import { appliances } from "../diagnostics";
import { Icon } from "./Icon";
import { Receipt } from "./Receipt";
import { recurringCases } from "../care-tools";
import { careStatus } from "../workshop-data";
import type { Device, Workshop } from "../workshop";
export function DeviceCard({
  d,
  workshop,
  onStart,
  onEdit,
  onHistory,
}: {
  d: Device;
  workshop: Workshop;
  onStart: (id?: string, model?: string, deviceId?: string) => void;
  onEdit: (device: Device) => void;
  onHistory: (device: Device) => void;
}) {
  return (
    <article key={d.id}>
      <Icon
        name={appliances.find((a) => a.id === d.category)!.icon}
        size={34}
      />
      <div>
        <h3>{d.name}</h3>
        {d.purchaseDate ? <p>Purchased: {d.purchaseDate}</p> : null}
        {d.warrantyExpiry ? (
          <p>
            Warranty: {d.warrantyExpiry}{" "}
            {d.warrantyExpiry < new Date().toISOString().slice(0, 10)
              ? "· Expired"
              : ""}
          </p>
        ) : null}
        <Receipt deviceId={d.id} />
        {recurringCases(workshop.data.cases, d.id).map((message, i) => (
          <p className="recurring-alert" key={i}>
            {message}
          </p>
        ))}
        <details>
          <summary>
            Appliance timeline (
            {workshop.data.cases.filter((c) => c.deviceId === d.id).length})
          </summary>
          <ol>
            {workshop.data.cases
              .filter((c) => c.deviceId === d.id)
              .map((c) => (
                <li key={c.id}>
                  {new Date(c.date).toLocaleDateString()} · {c.symptom} ·{" "}
                  {c.status}
                </li>
              ))}
          </ol>
          <button className="text-button" onClick={() => onHistory(d)}>
            Browse cases
          </button>
        </details>
        <p>{d.model || "Model not added"}</p>
        {d.careDate ? (
          <p>
            Care date: {d.careDate} · {careStatus(d)}
          </p>
        ) : null}
        {d.lastCared ? <p>Last care recorded: {d.lastCared}</p> : null}
        {d.careIntervalDays ? (
          <p>Repeats {d.careIntervalDays} days after completion</p>
        ) : null}
      </div>
      <button
        className="text-button"
        onClick={() => onStart(d.category, d.model, d.id)}
      >
        Troubleshoot
      </button>
      <button className="text-button" onClick={() => onEdit(d)}>
        Edit appliance
      </button>
      {d.careDate ? (
        <button
          className="text-button"
          onClick={() => workshop.completeCare(d.id)}
        >
          Mark care done
        </button>
      ) : null}
      <button
        className="icon-button"
        aria-label={`Remove ${d.name}`}
        onClick={() => workshop.deleteDevice(d.id)}
      >
        <Icon name="close" size={17} />
      </button>
    </article>
  );
}
