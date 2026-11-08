import { useEffect, useState } from "react";
export type Language = "en" | "hi";
export function language(): Language {
  try {
    return localStorage.getItem("reparo-language") === "hi" ? "hi" : "en";
  } catch {
    return "en";
  }
}
export function Preferences() {
  const [theme, setTheme] = useState(() => {
      try {
        return localStorage.getItem("reparo-theme") || "system";
      } catch {
        return "system";
      }
    }),
    [lang, setLang] = useState(language);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", dark ? "#181818" : "#F5F1E9");
    };
    apply();
    media.addEventListener("change", apply);
    try {
      localStorage.setItem("reparo-theme", theme);
    } catch {}
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  return (
    <aside className="preferences" aria-label="Display preferences">
      <label>
        <span className="sr-only">Theme</span>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="system">System theme</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <label>
        <span className="sr-only">Guide language</span>
        <select
          value={lang}
          onChange={(e) => {
            const v = e.target.value as Language;
            setLang(v);
            try {
              localStorage.setItem("reparo-language", v);
            } catch {}
            window.dispatchEvent(new Event("reparo-language"));
          }}
        >
          <option value="en">English guide</option>
          <option value="hi">हिन्दी गाइड</option>
        </select>
      </label>
    </aside>
  );
}
