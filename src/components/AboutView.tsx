import {
  ArrowUpRight,
  BookOpen,
  Bot,
  CheckCircle2,
  CodeXml,
  Database,
  Globe2,
  LockKeyhole,
  MessageSquareText,
  Radar,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Badge } from "./ui";

const principles = [
  {
    icon: ShieldCheck,
    title: "Evidence before enthusiasm",
    text: "Official sources establish availability. Commentary can add framing, but it remains visibly distinct.",
  },
  {
    icon: Radar,
    title: "Needs shape ranking, not facts",
    text: "Customer guidance explains why a signal may matter without inventing claims about the customer's environment.",
  },
  {
    icon: LockKeyhole,
    title: "Private by default",
    text: "Source edits and guidance stay in the browser until Igor deliberately exports the workspace.",
  },
  {
    icon: CheckCircle2,
    title: "Important signals cannot disappear",
    text: "Breaking changes, hard dates, security, licensing, pricing, and source conflicts always surface.",
  },
];

export function AboutView() {
  return (
    <main className="page-shell about-page" id="main-content">
      <section className="page-heading about-heading">
        <div>
          <p className="eyebrow">How Strategic Signal works</p>
          <h1>Intelligence built for trusted customer conversations.</h1>
          <p>
            Strategic Signal combines the evidence discipline of the FabCon
            briefing with the source intelligence, archive, and preference
            model developed in Fabric Digest.
          </p>
        </div>
        <a
          className="button button-secondary button-normal"
          href="https://github.com/igordossantos/strategic-signal"
          target="_blank"
          rel="noreferrer noopener"
        >
          <CodeXml size={18} aria-hidden="true" />
          View on GitHub
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </section>

      <section className="about-statement">
        <div className="statement-mark" aria-hidden="true">
          SS
        </div>
        <div>
          <Badge tone="accent">Designed for Igor Dos Santos</Badge>
          <blockquote>
            “Get to the signal quickly, understand why it matters, and walk
            into the room ready to lead.”
          </blockquote>
          <p>
            A customer-ready technology intelligence surface for Microsoft
            Fabric, Microsoft Foundry, Azure Databricks, Microsoft SQL, Azure
            AI, and the platform decisions around them.
          </p>
        </div>
      </section>

      <section className="principle-grid" aria-label="Product principles">
        {principles.map((principle) => {
          const Icon = principle.icon;
          return (
            <article key={principle.title}>
              <span aria-hidden="true">
                <Icon size={20} />
              </span>
              <h2>{principle.title}</h2>
              <p>{principle.text}</p>
            </article>
          );
        })}
      </section>

      <section className="architecture-section">
        <div className="section-heading">
          <p className="eyebrow">Architecture</p>
          <h2>Fast public experience. Deliberate private inputs.</h2>
          <p>
            GitHub Pages serves the customer-facing briefing. Collection and
            enrichment happen before publication; private guidance is never
            required by the public page.
          </p>
        </div>

        <div className="architecture-flow">
          <article>
            <div className="architecture-icon">
              <Globe2 size={21} aria-hidden="true" />
            </div>
            <span>01</span>
            <h3>Collect</h3>
            <p>Official feeds, public blogs, documentation, and expert analysis.</p>
          </article>
          <div className="flow-arrow" aria-hidden="true">
            <Workflow size={18} />
          </div>
          <article>
            <div className="architecture-icon">
              <Database size={21} aria-hidden="true" />
            </div>
            <span>02</span>
            <h3>Normalize</h3>
            <p>Canonical URLs, content hashes, evidence grades, and state changes.</p>
          </article>
          <div className="flow-arrow" aria-hidden="true">
            <Bot size={18} />
          </div>
          <article>
            <div className="architecture-icon">
              <Radar size={21} aria-hidden="true" />
            </div>
            <span>03</span>
            <h3>Enrich</h3>
            <p>Concise summaries, taxonomy, guidance matches, and safety checks.</p>
          </article>
          <div className="flow-arrow" aria-hidden="true">
            <BookOpen size={18} />
          </div>
          <article>
            <div className="architecture-icon">
              <CheckCircle2 size={21} aria-hidden="true" />
            </div>
            <span>04</span>
            <h3>Brief</h3>
            <p>Searchable cards, collapsible sections, and focused discussion lists.</p>
          </article>
        </div>
      </section>

      <section className="linkedin-method">
        <div className="linkedin-method-icon" aria-hidden="true">
          <MessageSquareText size={23} />
        </div>
        <div>
          <p className="eyebrow">LinkedIn method</p>
          <h2>The signed-in browser does the reading.</h2>
          <p>
            Strategic Signal does not store LinkedIn credentials or claim that
            a full profile history can be enumerated. A user-triggered capture
            helper reads the visible post, identifies author-labelled comments,
            and records links the author placed there. Incomplete comment
            coverage remains explicit.
          </p>
        </div>
      </section>

      <section className="delivery-roadmap">
        <div className="section-heading">
          <p className="eyebrow">Delivery roadmap</p>
          <h2>From polished foundation to continuous intelligence.</h2>
        </div>
        <ol>
          <li className="roadmap-current">
            <span>1</span>
            <div>
              <Badge tone="success">Current</Badge>
              <h3>Product foundation</h3>
              <p>
                Customer briefing, filters, hierarchy, source and guidance
                studio, discussion list, workspace import/export, and GitHub
                Pages deployment.
              </p>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <Badge tone="neutral">Next</Badge>
              <h3>Automated public-source ingestion</h3>
              <p>
                Scheduled RSS collection, deduplication, state transitions,
                source health, and optional LLM enrichment.
              </p>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <Badge tone="neutral">Planned</Badge>
              <h3>LinkedIn deep capture</h3>
              <p>
                Browser helper for post text and author-comment links, with
                explicit coverage limits.
              </p>
            </div>
          </li>
          <li>
            <span>4</span>
            <div>
              <Badge tone="neutral">Gated</Badge>
              <h3>Private shared workspace</h3>
              <p>
                Entra-authenticated persistence only if cross-device private
                guidance becomes a real requirement.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </main>
  );
}
