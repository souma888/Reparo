import { createServer } from "node:http";
import endpoint from "../api/analyze";
import visionEndpoint from "../api/vision";

// Local companion to Vite: node --env-file-if-exists=.env.local --experimental-strip-types
// is not used because Node requires extensionful imports. Run through tsx instead.
createServer(async (req, res) => {
  if (req.url !== "/api/analyze" && req.url !== "/api/vision") {
    res.writeHead(404).end();
    return;
  }
  try {
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers))
      if (typeof value === "string") headers.set(name, value);
    const request = new Request(`http://${req.headers.host}${req.url}`, {
      method: req.method,
      headers,
      body:
        req.method === "POST"
          ? new ReadableStream({
              start(controller) {
                req.on("data", (chunk) => controller.enqueue(chunk));
                req.on("end", () => controller.close());
                req.on("error", (error) => controller.error(error));
              },
            })
          : undefined,
      ...{ duplex: "half" },
    });
    const response = await (
      req.url === "/api/vision" ? visionEndpoint : endpoint
    ).fetch(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.writeHead(500).end("Local API failed");
  }
}).listen(3001, "127.0.0.1", () =>
  console.log("Reparo API: http://127.0.0.1:3001"),
);
