import type { Analysis } from "../../../shared/analysis";
import { Icon } from "./Icon";
export function GuideResult({ result }: { result: Analysis }) {
  return (
    <>
      {" "}
      <div
        className={`result-tag ${result.stop ? "stop emergency-panel" : ""}`}
      >
        {result.stop
          ? "Stop & seek professional help"
          : result.mode === "rules"
            ? "Basic guidance · No AI analysis"
            : "AI hypotheses · Unverified · Not a diagnosis"}
      </div>
      {result.stop ? (
        <p className="emergency-panel">
          Immediate danger? Move to a safe place and call your local emergency
          number. Do not approach the appliance.
        </p>
      ) : null}
      {result.notice ? (
        <p className="field-note" role="status">
          {result.notice}
        </p>
      ) : null}
      <div className="result">
        {" "}
        <h3>{result.stop ? "Stop conditions" : "Safe next steps"}</h3>
        <ol>
          {result.checks.map((s, i) => (
            <li key={`item-${i}`}>{s}</li>
          ))}
        </ol>
        <details>
          <summary>Observations & possible explanations</summary>
          {result.observations.length ? (
            <>
              <h3>What was observed</h3>
              <ul>
                {result.observations.map((s, i) => (
                  <li key={`item-${i}`}>{s}</li>
                ))}
              </ul>
            </>
          ) : null}
          {result.hypotheses.length ? (
            <>
              <h3>Possible explanations</h3>
              {result.hypotheses.map((h, i) => (
                <article className="hypothesis" key={`hypothesis-${i}`}>
                  <span className="eyebrow">POSSIBILITY 0{i + 1}</span>
                  <h4>{h.title}</h4>
                  <p>{h.reason}</p>
                  <p className="field-note">
                    What would change this: {h.uncertainty}
                  </p>
                </article>
              ))}
            </>
          ) : !result.stop ? (
            <p>There is not enough evidence to suggest a cause.</p>
          ) : null}
        </details>
        {result.sources?.length ? (
          <details>
            <summary>Manual citations · user-supplied sources</summary>
            {result.sources.map((p) => (
              <blockquote key={p.id}>
                <cite>
                  {p.title} · model {p.model} · page {p.page}
                </cite>
                <p>{p.quote}</p>
                {p.source ? (
                  <a href={p.source} target="_blank" rel="noreferrer">
                    Original source ↗
                  </a>
                ) : null}
                <p className="field-note">
                  Model metadata was entered by the user; manufacturer
                  applicability has not been independently verified.
                </p>
              </blockquote>
            ))}
          </details>
        ) : null}
        {result.unknowns.length ? (
          <details>
            <summary>
              What is still unknown <Icon name="plus" size={16} />
            </summary>
            <ul>
              {result.unknowns.map((s, i) => (
                <li key={`item-${i}`}>{s}</li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </>
  );
}
