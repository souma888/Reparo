import type { Dispatch, SetStateAction, FormEvent } from "react";
import type { Device } from "../workshop";
import { appliances } from "../diagnostics";
export function DeviceEditor({
  add,
  device,
  setDevice,
  editing,
  deviceConsent,
  setDeviceConsent,
}: {
  add: (event: FormEvent) => void;
  device: Omit<Device, "id">;
  setDevice: Dispatch<SetStateAction<Omit<Device, "id">>>;
  editing: string | null;
  deviceConsent: boolean;
  setDeviceConsent: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <form className="device-form" onSubmit={add}>
      <label>
        Appliance name
        <input
          autoFocus
          required
          maxLength={80}
          value={device.name}
          onChange={(e) => setDevice({ ...device, name: e.target.value })}
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
          onChange={(e) => setDevice({ ...device, model: e.target.value })}
        />
      </label>
      <label>
        Purchase date (optional)
        <input
          type="date"
          value={device.purchaseDate || ""}
          onChange={(e) =>
            setDevice({ ...device, purchaseDate: e.target.value })
          }
        />
      </label>
      <label>
        Warranty expiry (optional)
        <input
          type="date"
          value={device.warrantyExpiry || ""}
          onChange={(e) =>
            setDevice({ ...device, warrantyExpiry: e.target.value })
          }
        />
      </label>
      <label>
        Next care date (optional)
        <input
          type="date"
          name="careDate"
          value={device.careDate}
          onChange={(e) => setDevice({ ...device, careDate: e.target.value })}
        />
      </label>
      <label>
        Repeat after care is done
        <select
          value={device.careIntervalDays || 0}
          onChange={(e) =>
            setDevice({
              ...device,
              careIntervalDays: Number(e.target.value),
            })
          }
        >
          <option value={0}>Do not repeat</option>
          <option value={30}>After 30 days</option>
          <option value={90}>After 90 days</option>
          <option value={180}>After 180 days</option>
          <option value={365}>After 365 days</option>
        </select>
      </label>
      <p className="field-note">
        Choose timing from your manufacturer manual. Reparo does not prescribe
        service intervals.
      </p>
      <label className="consent">
        <input
          type="checkbox"
          required
          checked={deviceConsent}
          onChange={(e) => setDeviceConsent(e.target.checked)}
        />
        Store these details on this browser.
      </label>
      <button className="button dark">
        {editing ? "Save changes" : "Save appliance"}
      </button>
    </form>
  );
}
