import { useEffect, useState } from "react";
export function OfflineStatus() {
  const [online, setOnline] = useState(navigator.onLine),
    [waiting, setWaiting] = useState<ServiceWorker>();
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    if ("serviceWorker" in navigator && import.meta.env.PROD)
      void navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          if (reg.waiting) setWaiting(reg.waiting);
          reg.addEventListener("updatefound", () => {
            const worker = reg.installing;
            worker?.addEventListener("statechange", () => {
              if (
                worker.state === "installed" &&
                navigator.serviceWorker.controller
              )
                setWaiting(worker);
            });
          });
        })
        .catch(() => {});
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return (
    <>
      {!online ? (
        <p className="offline-banner" role="status">
          Offline · Saved appliances, basic guides, manuals and tools remain
          available. AI identification and cloud sync need internet.
        </p>
      ) : null}
      {waiting ? (
        <p className="offline-banner" role="status">
          An update is ready. Finish or save your current guide before
          reloading.{" "}
          <button
            className="text-button"
            onClick={() => {
              navigator.serviceWorker.addEventListener(
                "controllerchange",
                () => location.reload(),
                { once: true },
              );
              waiting.postMessage("SKIP_WAITING");
            }}
          >
            Reload to update
          </button>
        </p>
      ) : null}
    </>
  );
}
