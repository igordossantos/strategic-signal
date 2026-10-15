import {
  Download,
  Menu,
  Moon,
  Sun,
  Upload,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AboutView } from "./components/AboutView";
import { BriefingView } from "./components/BriefingView";
import { CollectionView } from "./components/CollectionView";
import { GuidanceView } from "./components/GuidanceView";
import { IgorMark } from "./components/IgorMark";
import { SourcesView } from "./components/SourcesView";
import { Button } from "./components/ui";
import { seedGuidance, seedSignals, seedSources } from "./data/seed";
import {
  applyPrioritySignals,
  automaticHashtags,
  emptyFilters,
  normalizeHashtag,
  uniqueSorted,
} from "./lib/signals";
import { loadArchive } from "./lib/archive";
import {
  downloadText,
  loadWorkspace,
  parseWorkspace,
  saveWorkspace,
} from "./lib/workspace";
import type {
  AppView,
  ArchiveBundle,
  SignalFilters,
  SignalSort,
  Workspace,
} from "./types";

const starterWorkspace: Workspace = {
  version: 1,
  sources: seedSources,
  guidance: seedGuidance,
  pinnedSignalIds: [],
  itemTags: {},
};

function viewFromHash(): AppView {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (hash === "guidance") return "priorities";
  if (
    hash === "collect" ||
    hash === "sources" ||
    hash === "priorities" ||
    hash === "about"
  ) {
    return hash;
  }
  return "briefing";
}

interface Notice {
  id: number;
  message: string;
  tone: "success" | "error";
}

function App() {
  const [initial] = useState(() => loadWorkspace(starterWorkspace));
  const [workspace, setWorkspace] = useState<Workspace>(initial.workspace);
  const [archive, setArchive] = useState<ArchiveBundle | null>(null);
  const [view, setView] = useState<AppView>(viewFromHash);
  const [filters, setFilters] = useState<SignalFilters>({
    ...emptyFilters,
  });
  const [sort, setSort] = useState<SignalSort>("relevance");
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light",
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const noticeId = useRef(0);
  const availableSignals = useMemo(() => {
    const byId = new Map(
      (archive?.signals ?? []).map((signal) => [signal.id, signal]),
    );
    for (const signal of seedSignals) byId.set(signal.id, signal);
    return [...byId.values()];
  }, [archive]);
  const personalizedSignals = useMemo(
    () =>
      applyPrioritySignals(
        availableSignals.map((signal) => ({
          ...signal,
          hashtags: uniqueSorted([
            ...(workspace.itemTags[signal.id] ?? []).map(normalizeHashtag),
            ...automaticHashtags(signal),
          ]),
        })),
        workspace.guidance,
      ),
    [availableSignals, workspace.guidance, workspace.itemTags],
  );

  const notify = useCallback(
    (message: string, tone: "success" | "error" = "success") => {
      noticeId.current += 1;
      setNotice({ id: noticeId.current, message, tone });
    },
    [],
  );

  useEffect(() => {
    if (!initial.warning) return;
    notify(initial.warning, "error");
  }, [initial.warning, notify]);

  useEffect(() => {
    let active = true;
    void loadArchive()
      .then((loaded) => {
        if (!active) return;
        setArchive(loaded);
        setWorkspace((current) => {
          const existingIds = new Set(
            current.sources.map((source) => source.id),
          );
          const missing = loaded.sources.filter(
            (source) => !existingIds.has(source.id),
          );
          return missing.length
            ? { ...current, sources: [...current.sources, ...missing] }
            : current;
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : "Archive loading failed.";
        notify(message, "error");
      });
    return () => {
      active = false;
    };
  }, [notify]);

  useEffect(() => {
    try {
      saveWorkspace(workspace);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Browser storage failed.";
      notify(`Workspace changes could not be saved. ${message}`, "error");
    }
  }, [notify, workspace]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const updateView = () => {
      setView(viewFromHash());
      setMobileNavOpen(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", updateView);
    if (!window.location.hash) window.history.replaceState(null, "", "#briefing");
    return () => window.removeEventListener("hashchange", updateView);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;
      if (event.key === "/" && !isTyping && view === "briefing") {
        event.preventDefault();
        document.getElementById("signal-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [view]);

  useEffect(() => {
    const pageNames: Record<AppView, string> = {
      briefing: "Strategic Signal by Igor",
      collect: "Collection Runs | Strategic Signal",
      sources: "Sources | Strategic Signal",
      priorities: "Priority Signals | Strategic Signal",
      about: "About | Strategic Signal",
    };
    document.title = pageNames[view];
  }, [view]);

  function toggleTheme(): void {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem("strategic-signal-theme", next);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Browser storage failed.";
      notify(`Theme preference could not be saved. ${message}`, "error");
    }
  }

  function togglePinned(id: string): void {
    setWorkspace((current) => {
      const includes = current.pinnedSignalIds.includes(id);
      return {
        ...current,
        pinnedSignalIds: includes
          ? current.pinnedSignalIds.filter((item) => item !== id)
          : [...current.pinnedSignalIds, id],
      };
    });
  }

  function updateItemTags(id: string, tags: string[]): void {
    const normalized = uniqueSorted(tags.map(normalizeHashtag).filter(Boolean));
    setWorkspace((current) => ({
      ...current,
      itemTags: {
        ...current.itemTags,
        [id]: normalized,
      },
    }));
  }

  function exportWorkspace(): void {
    downloadText(
      `strategic-signal-workspace-${new Date().toISOString().slice(0, 10)}.json`,
      `${JSON.stringify(workspace, null, 2)}\n`,
      "application/json;charset=utf-8",
    );
    notify("Workspace exported.", "success");
  }

  async function importWorkspace(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const imported = parseWorkspace(await file.text());
      setWorkspace(imported);
      notify("Workspace imported and saved in this browser.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Workspace import failed.";
      notify(message, "error");
    }
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="app-header">
        <div className="header-inner">
          <a className="brand" href="#briefing" aria-label="Strategic Signal by Igor home">
            <span className="brand-mark" aria-hidden="true">
              <IgorMark size={27} />
            </span>
            <span className="brand-lockup">
              <span>
                <strong>Strategic</strong>
                <em>Signal</em>
              </span>
              <small>Curated by Igor</small>
            </span>
          </a>

          <nav
            className={`primary-nav${mobileNavOpen ? " primary-nav-open" : ""}`}
            aria-label="Primary navigation"
          >
            {(
              [
                ["briefing", "Briefing"],
                ["collect", "Collect"],
                ["sources", "Sources"],
                ["priorities", "Priority signals"],
                ["about", "How it works"],
              ] as const
            ).map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className={view === id ? "nav-active" : ""}
                aria-current={view === id ? "page" : undefined}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <input
              ref={importInput}
              className="sr-only"
              type="file"
              accept="application/json,.json"
              onChange={(event) => void importWorkspace(event)}
            />
            <Button
              type="button"
              variant="quiet"
              size="icon"
              aria-label="Import workspace"
              title="Import workspace"
              onClick={() => importInput.current?.click()}
            >
              <Upload size={18} aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="quiet"
              size="icon"
              aria-label="Export workspace"
              title="Export workspace"
              onClick={exportWorkspace}
            >
              <Download size={18} aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="quiet"
              size="icon"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun size={18} aria-hidden="true" />
              ) : (
                <Moon size={18} aria-hidden="true" />
              )}
            </Button>
            <Button
              type="button"
              variant="quiet"
              size="icon"
              className="mobile-menu-button"
              aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((current) => !current)}
            >
              {mobileNavOpen ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <Menu size={20} aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {view === "briefing" ? (
        <BriefingView
          signals={personalizedSignals}
          sources={workspace.sources}
          prioritySignals={workspace.guidance}
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={setSort}
          pinnedSignalIds={workspace.pinnedSignalIds}
          onTogglePinned={togglePinned}
          itemTags={workspace.itemTags}
          onUpdateItemTags={updateItemTags}
          onNotify={notify}
        />
      ) : null}
      {view === "sources" ? (
        <SourcesView
          sources={workspace.sources}
          onChange={(sources) =>
            setWorkspace((current) => ({ ...current, sources }))
          }
          onNotify={notify}
        />
      ) : null}
      {view === "collect" ? (
        <CollectionView
          archive={archive}
          sources={workspace.sources}
          onNotify={notify}
        />
      ) : null}
      {view === "priorities" ? (
        <GuidanceView
          guidance={workspace.guidance}
          onChange={(guidance) =>
            setWorkspace((current) => ({ ...current, guidance }))
          }
          onNotify={notify}
        />
      ) : null}
      {view === "about" ? <AboutView /> : null}

      <footer className="app-footer">
        <div className="page-shell">
          <div className="footer-brand">
            <span className="brand-mark" aria-hidden="true">
              <IgorMark size={24} />
            </span>
            <div>
              <strong>Strategic Signal by Igor</strong>
              <span>Personally curated technology intelligence for customers.</span>
            </div>
          </div>
          <p>
            Curated from public sources. Not a contractual roadmap,
            availability commitment, licensing statement, or official
            publication of Microsoft or any customer.
          </p>
          <p>Igor Dos Santos · Cloud &amp; AI Solutions Engineer · Microsoft</p>
        </div>
      </footer>

      {notice ? (
        <div
          className={`toast toast-${notice.tone}`}
          role={notice.tone === "error" ? "alert" : "status"}
          aria-live="polite"
          key={notice.id}
        >
          <span>{notice.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice(null)}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </>
  );
}

export default App;
