import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import TrackerShell, {
  ProjectFilters,
  SnapshotStamp,
} from "../components/TrackerShell";
import { Await } from "../components/Bits";
import { usePortal } from "../lib/portal-context";
import {
  answerQuestion,
  moneyExact,
  QUESTIONS,
  type QuestionKind,
} from "../lib/tracker";
import { parseTrackerQuestion } from "../lib/tracker-question";
import { PROVINCES, LOCATIONS } from "../lib/geography";
import { recordPath } from "../lib/evidence";
import { useSnapshot, type Manifest } from "../lib/snapshot";
import { downloadText, projectsCsv } from "../lib/csv";

export default function Ask() {
  const { scope } = usePortal(),
    manifest = useSnapshot<Manifest>(),
    [params, setParams] = useSearchParams();
  const [question, setQuestion] = useState(""),
    [questionError, setQuestionError] = useState(""),
    [limit, setLimit] = useState(15);
  const kind = params.get("question") as QuestionKind | null,
    valid = QUESTIONS.some((q) => q.id === kind),
    province = params.get("province") ?? "",
    program = params.get("program") ?? "",
    lgu = params.get("lgu") ?? "",
    stage = params.get("stage") === "nep" ? "nep" : "house",
    direction = params.get("direction") ?? "";
  function update(name: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    if (name === "province") next.delete("lgu");
    if (name === "question") next.delete("direction");
    setQuestionError("");
    setLimit(15);
    setParams(next);
  }
  return (
    <TrackerShell
      title="Ask BetterNegros"
      description="Find proposal totals, project rankings, paired changes, and the source pages behind them."
    >
      <SnapshotStamp />
      <p className="citizen-toolbar">
        <Link to={'/budget-stages?' + new URLSearchParams({ status: 'cut', ...(lgu ? { lgu } : province ? { province } : {}) })}>
          Which multi-purpose building lines did the Senate committee cut?
        </Link>
      </p>
      <form
        className="ask-composer"
        onSubmit={(event) => {
          event.preventDefault();
          const parsed = parseTrackerQuestion(question);
          if ("error" in parsed) {
            setQuestionError(parsed.error);
            return;
          }
          const next = new URLSearchParams({ question: parsed.kind });
          for (const key of [
            "province",
            "lgu",
            "program",
            "stage",
            "direction",
          ] as const) {
            if (parsed[key]) next.set(key, parsed[key]);
          }
          setQuestionError("");
          setLimit(15);
          setParams(next);
        }}
      >
        <label className="field">
          <span>Your budget question</span>
          <input
            maxLength={200}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="How much is proposed for health facilities in Siquijor?"
            required
          />
        </label>
        <button className="button button-primary" type="submit">
          Find answer
        </button>
        <p>
          Try a place, program, and stage. Questions are interpreted in your
          browser using the dated budget records.
        </p>
        {questionError && (
          <p className="notice" role="alert">
            {questionError}
          </p>
        )}
      </form>
      <div className="ask-prompts" aria-label="Suggested questions">
        {QUESTIONS.map((q) => (
          <button
            className={
              "button" + (valid && kind === q.id ? " button-primary" : "")
            }
            aria-pressed={valid && kind === q.id}
            key={q.id}
            onClick={() => update("question", q.id)}
          >
            {q.label}
          </button>
        ))}
      </div>
      <details className="tracker-source-notes">
        <summary>Refine place, program and stage</summary>
        <ProjectFilters {...{ province, program, lgu }} onChange={update} />
        {kind === "changes" ? (
          <label className="field">
            <span>Change direction</span>
            <select
              value={direction}
              onChange={(e) => update("direction", e.target.value)}
            >
              <option value="">Increases and decreases</option>
              <option value="increased">Increases</option>
              <option value="decreased">Decreases</option>
            </select>
          </label>
        ) : (
          <label className="field">
            <span>Budget stage for totals and rankings</span>
            <select
              value={stage}
              onChange={(e) => update("stage", e.target.value)}
            >
              <option value="house">House proposal</option>
              <option value="nep">NEP proposal</option>
            </select>
          </label>
        )}
      </details>
      {valid && !questionError && (
        <Await state={scope} what="records for this answer">
          {(s) => {
            const result = answerQuestion(
                s.projects,
                kind!,
                { province, program, lgu, direction },
                stage,
              ),
              title =
                kind === "changes" && direction
                  ? `Which paired amounts ${direction}?`
                  : QUESTIONS.find((q) => q.id === kind)!.label;
            const scopeLabel = [
              PROVINCES.find((p) => p.slug === province)?.name ??
                (province
                  ? "Unknown province filter"
                  : "All province title associations"),
              LOCATIONS.find((l) => l.code === lgu)?.name ??
                (lgu ? "Unknown locality filter" : "All localities"),
              program ? program.toUpperCase() : "All programs",
            ].join(" · ");
            return (
              <section className="ask-answer" aria-labelledby="answer-heading">
                <h2 id="answer-heading">{title}</h2>
                <p>
                  <strong>{scopeLabel}</strong>
                </p>
                {kind === "total" ? (
                  <>
                    <dl className="tracker-stage-grid">
                      {[stage, stage === "house" ? "nep" : "house"].map(
                        (key) => {
                          const value = result.stages[key as "house" | "nep"];
                          return (
                            <div key={key}>
                              <dt>
                                {key === "house"
                                  ? "House proposal"
                                  : "NEP proposal"}
                                {key === stage ? " · selected" : ""}
                              </dt>
                              <dd
                                className={
                                  key === stage
                                    ? "ask-answer-figure"
                                    : "tracker-amount"
                                }
                              >
                                {moneyExact(value.rows ? value.php : null)}
                              </dd>
                              <dd>
                                {value.rows} of {result.selected} records have
                                an amount
                              </dd>
                            </div>
                          );
                        },
                      )}
                    </dl>
                    <p>
                      {stage === "house" ? "House" : "NEP"} proposal amounts
                      across {result.available} of {result.selected} matching
                      records. {result.missing} have no amount for this stage
                      and are excluded from the sum.
                    </p>
                    <p>
                      Each stage total counts available amounts once per source
                      record. The two proposals describe alternative stages of
                      the same budget.
                    </p>
                  </>
                ) : kind === "largest" ? (
                  <p>
                    {result.rows.length} records have an available{" "}
                    {stage === "house" ? "House" : "NEP"} amount, ordered from
                    largest to smallest. {result.missing} unavailable amounts
                    are excluded. Ranking describes amount only.
                  </p>
                ) : kind === "changes" ? (
                  <p>
                    {result.rows.length} source pairing candidates are
                    classified increased or decreased and are not flagged as
                    unconfirmed. Unconfirmed pairings, one-sided lines and
                    scope-review rows are excluded. These comparisons are not
                    independently verified.
                  </p>
                ) : (
                  <p>
                    {result.rows.length} matching records have usable source PDF
                    references. The document centre retains the version and page
                    links.
                  </p>
                )}
                <div className="citizen-toolbar">
                  <Link
                    className="button"
                    to={
                      "/projects?" +
                      new URLSearchParams(
                        Object.fromEntries(
                          [
                            ["province", province],
                            ["program", program],
                            ["lgu", lgu],
                            ["stage", stage],
                          ].filter(([, value]) => value),
                        ),
                      ).toString()
                    }
                  >
                    Open these scope filters in explorer
                  </Link>
                  <button
                    className="button"
                    disabled={
                      !result.rows.length || manifest.status !== "ready"
                    }
                    onClick={() => {
                      if (manifest.status !== "ready") return;
                      downloadText(
                        "betternegrosisland-answer-records.csv",
                        projectsCsv(result.rows, [
                          ["question", () => title],
                          ["understood_scope", () => scopeLabel],
                          ["snapshot", () => manifest.value.version],
                          [
                            "snapshot_retrieved_at",
                            () => manifest.value.retrieved_at,
                          ],
                          [
                            "calculation_stage",
                            () =>
                              kind === "changes"
                                ? "NEP and House paired"
                                : kind === "documents"
                                  ? "Source references"
                                  : stage,
                          ],
                          [
                            "notice",
                            () =>
                              s.disclaimers
                                .map(
                                  (d) => d.title + " " + d.body + " " + d.url,
                                )
                                .join(" | "),
                          ],
                        ]),
                      );
                    }}
                  >
                    Download supporting records
                  </button>
                </div>
                <h3>Supporting project records</h3>
                {result.rows.slice(0, limit).map((p) => (
                  <article className="tracker-record" key={p.key}>
                    <div>
                      <p className="tracker-record-meta">
                        {p.dataset.toUpperCase()} · {p.id}
                      </p>
                      <h4>
                        <Link to={recordPath(p)}>{p.title}</Link>
                      </h4>
                      <p>
                        {p.status_label}
                        {p.held ? " · Unconfirmed pairing" : ""}
                      </p>
                    </div>
                    <div className="tracker-record-actions">
                      {kind !== "changes" && kind !== "documents" && (
                        <strong>
                          {moneyExact(
                            stage === "house" ? p.house_php : p.nep_php,
                          )}
                        </strong>
                      )}
                      {kind === "changes" && (
                        <span>
                          NEP {moneyExact(p.nep_php)}
                          <br />
                          House {moneyExact(p.house_php)}
                        </span>
                      )}
                      <Link
                        to={"/documents?record=" + encodeURIComponent(p.key)}
                      >
                        Check source pages
                      </Link>
                    </div>
                  </article>
                ))}
                {!result.rows.length && (
                  <p>
                    No supporting records match this selection. This does not
                    establish absence of funding.
                  </p>
                )}
                {result.rows.length > limit && (
                  <button
                    className="button"
                    onClick={() => setLimit((n) => n + 15)}
                  >
                    Show 15 more supporting records
                  </button>
                )}
                <p className="tracker-stamp">
                  Answer based on{" "}
                  {manifest.status === "ready"
                    ? manifest.value.version
                    : "the loaded snapshot"}
                  .{" "}
                  <Link to="/methodology">
                    Read the source and selection rules
                  </Link>
                  .
                </p>
              </section>
            );
          }}
        </Await>
      )}
      {!valid && (
        <section className="ask-empty">
          <h2>Begin with a question above.</h2>
          <p>
            Choose a place and source program to narrow the answer. Every result
            will show what was selected, what was excluded, and which records
            support it.
          </p>
        </section>
      )}
    </TrackerShell>
  );
}
