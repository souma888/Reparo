import { useState } from "react";
import { appliances } from "./diagnostics";
import { ApplianceDrawing } from "./components/ApplianceDrawing";
import { Icon } from "./components/Icon";
import { AnalysisGuide } from "./components/AnalysisGuide";
import { Workspace } from "./components/Workspace";
import { useWorkshop } from "./workshop";

const questions = [
  [
    "What can I try today?",
    "Choose an appliance, complete the safety check, and send symptoms or an exterior photo for AI-assisted analysis. Results distinguish observations, unverified possible explanations, unknowns, and safe next steps.",
  ],
  [
    "Will Reparo tell me how to repair an appliance?",
    "The focus is understanding symptoms and finding safe next steps. Reparo will not guide hazardous electrical, gas, refrigerant, or microwave repairs. A qualified technician should handle internal repairs.",
  ],
  [
    "Can I upload a photo or an audio clip?",
    "You can include an exterior JPEG, PNG, or WebP photo. It is resized and metadata is removed before it is sent with your consent to the AI service. Audio and video analysis are not available yet.",
  ],
  [
    "Are my answers stored?",
    "Basic guidance runs on your device without AI. If you choose free-tier AI, observations and optional photos go directly from the server to Google’s Gemini API with your consent. Google may use free-tier inputs and outputs to improve its products. Save text cases locally only if you choose; photos are excluded from history.",
  ],
];

export default function App() {
  const workshop = useWorkshop();
  const [guide, setGuide] = useState<string | null>(null);
  const [guideModel, setGuideModel] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const openGuide = (id = "washer", model = "") => {
    setMenuOpen(false);
    setGuide(id);
    setGuideModel(model);
  };
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="wordmark" href="#" aria-label="Reparo home">
          <span className="brand-symbol">r.</span>reparo
          <span className="brand-period">.</span>
        </a>
        <button
          className="menu-toggle text-button"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "Close" : "Menu"}
          <Icon name={menuOpen ? "close" : "plus"} size={18} />
        </button>
        <nav
          id="main-nav"
          className={menuOpen ? "nav-open" : ""}
          aria-label="Main navigation"
        >
          <a href="#approach" onClick={() => setMenuOpen(false)}>
            Our approach
          </a>
          <a href="#appliances" onClick={() => setMenuOpen(false)}>
            Appliances
          </a>
          <a href="#questions" onClick={() => setMenuOpen(false)}>
            Good to know
          </a>
          <a href="#workspace" onClick={() => setMenuOpen(false)}>
            My workspace
          </a>
          <button className="nav-cta" onClick={() => openGuide()}>
            Try the guide <Icon name="arrow" size={18} />
          </button>
        </nav>
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="small-line" /> THOUGHTFUL CARE. EVERYDAY
              APPLIANCES.
            </div>
            <h1 id="hero-title">
              A little clarity.
              <br />A longer <em>life.</em>
            </h1>
            <p>
              When something doesn’t feel right, start with understanding. A
              considered approach to caring for the appliances you live with.
            </p>
            <button className="button dark" onClick={() => openGuide()}>
              Find your starting point <Icon name="arrow" size={20} />
            </button>
            <div className="hero-assurance">
              <Icon name="shield" size={17} />
              <span>Safety first. Always.</span>
              <span className="dot" />
              <span>AI-assisted understanding</span>
            </div>
          </div>
          <div className="hero-art">
            <div className="art-top">
              <span>THE EVERYDAY, RECONSIDERED.</span>
              <span>NO. 001</span>
            </div>
            <div className="art-grid" />
            <ApplianceDrawing />
            <div className="art-bottom">
              <span className="art-caption">
                Worth understanding.
                <br />
                <em>Worth keeping.</em>
              </span>
              <span className="art-stamp">
                <Icon name="spark" size={20} /> CARE OVER
                <br /> REPLACEMENT
              </span>
            </div>
          </div>
          <div className="hero-footer">
            <span>A MORE CONSIDERED WAY FORWARD</span>
            <a href="#approach">
              Get to know Reparo <span>↓</span>
            </a>
          </div>
        </section>
        <section className="principles" aria-label="Our principles">
          <div>
            <Icon name="shield" />
            <span>Safety before solutions</span>
          </div>
          <div>
            <Icon name="spark" />
            <span>Clarity, without the guesswork</span>
          </div>
          <div>
            <Icon name="check" />
            <span>Care for what you already have</span>
          </div>
        </section>
        <section id="appliances" className="section appliances-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / START WITH THE EVERYDAY</p>
              <h2>What needs a little care?</h2>
            </div>
            <p>
              Familiar appliances. Unfamiliar symptoms.
              <br />
              Let’s take it one observation at a time.
            </p>
          </div>
          <div className="appliance-list">
            {appliances.map((item, i) => (
              <button
                key={item.id}
                className="appliance-card"
                onClick={() => openGuide(item.id)}
              >
                <span className="card-number">0{i + 1}</span>
                <Icon name={item.icon} size={53} />
                <span className="card-copy">
                  <strong>{item.name}</strong>
                  <span>{item.description}</span>
                </span>
                <Icon name="arrow" size={20} className="card-arrow" />
              </button>
            ))}
          </div>
          <div className="coverage-note">
            <span className="status-dot" />
            AI-assisted possibilities, clearly explained. Model-specific manual
            verification is not yet available.
          </div>
        </section>
        <Workspace workshop={workshop} onStart={openGuide} />
        <section id="approach" className="approach section">
          <div className="approach-intro">
            <p className="eyebrow">
              02 / LESS UNCERTAINTY. MORE UNDERSTANDING.
            </p>
            <h2>
              Good guidance
              <br />
              starts with
              <br />
              <em>good questions.</em>
            </h2>
            <p>
              You don’t need to know what’s wrong.
              <br />
              Just tell us what you’ve noticed.
            </p>
            <a className="underlined-link" href="#promise">
              The principles behind Reparo <Icon name="arrow" size={18} />
            </a>
          </div>
          <div className="steps">
            {[
              [
                "01",
                "Tell us what’s happening.",
                "Start with your appliance and the symptoms you’ve noticed. Plain language is all you need.",
              ],
              [
                "02",
                "Pause for safety.",
                "Warning signs come first. When something may be unsafe, the right next step is to stop and seek help.",
              ],
              [
                "03",
                "Leave with a clearer next step.",
                "Organize your observations, understand the limits, and know when to bring in a professional.",
              ],
            ].map(([number, title, copy]) => (
              <article className="step" key={number}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="promise" className="promise">
          <div className="promise-symbol">
            <Icon name="shield" size={44} />
          </div>
          <p className="eyebrow">OUR FIRST PRINCIPLE</p>
          <h2>
            Some things are
            <br />
            better left to <em>an expert.</em>
          </h2>
          <p>
            Knowing when to stop is part of good guidance. No opening live
            appliances. No bypassing safety systems. No certainty where there
            isn’t enough evidence.
          </p>
          <span className="promise-foot">
            Your safety will always come before a diagnosis.
          </span>
        </section>
        <section id="questions" className="section faq">
          <div>
            <p className="eyebrow">03 / A FEW THINGS TO KNOW</p>
            <h2>A little more clarity.</h2>
            <p>Thoughtful answers, before you begin.</p>
          </div>
          <div className="faq-list">
            {questions.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <Icon name="plus" size={20} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing section">
          <div>
            <p className="eyebrow">A SMALL FIRST STEP</p>
            <h2>
              Before you replace it,
              <br />
              <em>understand it.</em>
            </h2>
          </div>
          <button className="button dark" onClick={() => openGuide()}>
            Explore the guide <Icon name="arrow" size={20} />
          </button>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <a className="wordmark" href="#">
            <span className="brand-symbol">r.</span>reparo
            <span className="brand-period">.</span>
          </a>
          <span>Care for what you keep.</span>
          <a
            href="https://github.com/souma888/Reparo"
            target="_blank"
            rel="noreferrer"
          >
            Follow the project <Icon name="arrow" size={16} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Reparo · Built with care.</span>
          <p>
            AI-assisted guidance. Not a diagnosis or a substitute for a
            qualified technician.
          </p>
          <a href="#main">Back to top ↑</a>
        </div>
      </footer>
      {guide !== null ? (
        <AnalysisGuide
          initialAppliance={guide}
          initialModel={guideModel}
          onClose={() => setGuide(null)}
          workshop={workshop}
        />
      ) : null}
    </>
  );
}
