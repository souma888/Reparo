import type { Plugin } from "vite";
import { createHash } from "node:crypto";
export function offline(): Plugin {
  return {
    name: "reparo-offline",
    apply: "build",
    generateBundle(_, bundle) {
      const files = [
        "/",
        "/index.html",
        "/icon.svg",
        "/icon-192.png",
        "/icon-512.png",
        ...Object.keys(bundle)
          .filter((n) => /\.(?:js|mjs|css|woff2)$/.test(n))
          .map((n) => `/${n}`),
      ];
      const hash = createHash("sha256");
      for (const [name, item] of Object.entries(bundle)) {
        hash.update(name);
        hash.update(
          item.type === "chunk"
            ? item.code
            : typeof item.source === "string"
              ? item.source
              : Buffer.from(item.source),
        );
      }
      const cache = `reparo-${hash.digest("hex").slice(0, 12)}`;
      this.emitFile({
        type: "asset",
        fileName: "manifest.webmanifest",
        source: JSON.stringify({
          name: "Reparo — Appliance Care",
          short_name: "Reparo",
          description: "Camera-led appliance care with offline basic guides",
          theme_color: "#F5F1E9",
          background_color: "#F5F1E9",
          display: "standalone",
          start_url: "/app",
          icons: [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          ],
        }),
      });
      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: `const CACHE=${JSON.stringify(cache)},FILES=${JSON.stringify(files)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('reparo-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/'))return;
if(e.request.mode==='navigate'&&['/','/app'].includes(u.pathname)){e.respondWith(fetch(e.request).catch(()=>caches.open(CACHE).then(c=>c.match('/index.html'))));return;}
if(FILES.includes(u.pathname))e.respondWith(caches.open(CACHE).then(c=>c.match(e.request)).then(r=>r||fetch(e.request)));});`,
      });
    },
  };
}
