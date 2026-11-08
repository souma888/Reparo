import { useEffect, useState } from "react";
import { deleteReceipt, getReceipt, saveReceipt } from "../local-files";
export function Receipt({ deviceId }: { deviceId: string }) {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true,
      objectUrl = "";
    void getReceipt(deviceId)
      .then((blob) => {
        if (blob && active) {
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        }
      })
      .catch(() => setMessage("Local receipt storage unavailable."));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [deviceId]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  async function upload(file?: File) {
    if (!file) return;
    try {
      await saveReceipt(deviceId, file);
      setUrl(URL.createObjectURL(file));
      setMessage(
        "Receipt saved on this browser only. Excluded from text backups and sync.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not store receipt.");
    }
  }
  return (
    <details>
      <summary>Receipt photo</summary>
      <p className="field-note">
        Private, on-device storage. Hide payment and personal details before
        uploading. Maximum 4 MB.
      </p>
      <label>
        Store a receipt image
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => void upload(e.target.files?.[0])}
        />
      </label>
      {url ? (
        <>
          <img
            className="receipt-image"
            src={url}
            alt="Receipt stored for this appliance"
          />
          <button
            className="text-button"
            onClick={() =>
              void deleteReceipt(deviceId)
                .then(() => {
                  setUrl("");
                  setMessage("Receipt removed.");
                })
                .catch(() => setMessage("Could not remove receipt."))
            }
          >
            Remove receipt
          </button>
        </>
      ) : null}
      {message ? <p role="status">{message}</p> : null}
    </details>
  );
}
