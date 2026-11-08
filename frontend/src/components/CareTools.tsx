import { useState } from "react";
import codes from "../../../shared/error-codes.json";
import { repairDecision } from "../care-tools";
import styles from "./CareTools.module.css";
export function CareTools() {
  const [age, setAge] = useState(""),
    [quote, setQuote] = useState(""),
    [price, setPrice] = useState(""),
    [threshold, setThreshold] = useState("50"),
    [warranty, setWarranty] = useState(false),
    [answer, setAnswer] = useState("");
  const [brand, setBrand] = useState("LG"),
    [code, setCode] = useState("");
  const matches = code.trim()
    ? codes.filter(
        (c) =>
          c.brand === brand &&
          c.code.toLowerCase() === code.trim().toLowerCase(),
      )
    : [];
  return (
    <div className={styles.grid}>
      <section className={styles.card}>
        <span className="eyebrow">COST COMPARISON</span>
        <h3>Repair or replace?</h3>
        <p>
          A transparent cost heuristic using your own quotes. Use the same
          currency for both amounts.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            try {
              const result = repairDecision(
                Number(age),
                Number(quote),
                Number(price),
                Number(threshold),
                warranty,
              );
              setAnswer(`${result.message} ${result.detail}`);
            } catch (err) {
              setAnswer(
                err instanceof Error ? err.message : "Check the amounts.",
              );
            }
          }}
        >
          <label>
            Age in years
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </label>
          <label>
            Repair quote
            <input
              type="number"
              min="0"
              step="any"
              required
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
            />
          </label>
          <label>
            Replacement price
            <input
              type="number"
              min="0.01"
              step="any"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <label>
            Your repair cost threshold (%)
            <input
              type="number"
              min="1"
              max="100"
              required
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </label>
          <label className="consent">
            <input
              type="checkbox"
              checked={warranty}
              onChange={(e) => setWarranty(e.target.checked)}
            />
            May be under warranty
          </label>
          <button className="button dark">Compare costs</button>
        </form>
        {answer ? (
          <p className={styles.answer} role="status">
            {answer}
          </p>
        ) : null}
      </section>
      <section className={styles.card}>
        <span className="eyebrow">OFFLINE REFERENCE</span>
        <h3>Look up a visible error code.</h3>
        <p>
          Selected washer codes, linked to manufacturer support. Meanings vary
          by exact model; these are not a diagnosis or repair procedure.
        </p>
        <label>
          Brand
          <select value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option>LG</option>
            <option>Samsung</option>
          </select>
        </label>
        <label>
          Code already visible
          <input
            maxLength={30}
            placeholder="e.g. OE"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        <div role="status">
          {matches.map((c) => (
            <article className={styles.code} key={c.id}>
              <h4>
                {c.brand} · {c.code}
              </h4>
              <p>{c.meaning}</p>
              <p>{c.scope}</p>
              <a href={c.source} target="_blank" rel="noreferrer">
                Manufacturer source ↗
              </a>
            </article>
          ))}
          {code && !matches.length ? (
            <p>
              No curated match. Check your exact model manual; do not infer
              meaning from another brand.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
