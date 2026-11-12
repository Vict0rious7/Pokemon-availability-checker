// "What to get next" (Victor, 12 Nov 2026): from "which Pokémon can I get" to "what should I get to finish".
import { useEffect, useRef, useState } from "preact/hooks";
import { Profile, toItems, withItems } from "./state.js";
import { itemNames, gameName, BANK_END_LABEL } from "./labels.js";
import type { Response } from "./worker.js";
import type { PlanRequest, PlanResponse, StepOut } from "./planner.js";


function usePlanner(p: Profile, res: Response | null, busy: boolean, open: boolean, noGo: boolean) {
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [working, setWorking] = useState(false);
  const w = useRef<Worker | null>(null), last = useRef(0);
  const missing = res ? res.rows.filter((r) => r.status === "no").map((r) => String(r.n)) : [];
  const owned = toItems(p);
  const key = `${owned}|${p.dest}|${noGo}|${missing.join(",")}`;
  useEffect(() => {
    if (!open || !res || busy) return;
    if (!w.current) {
      w.current = new Worker(new URL("./planner.ts", import.meta.url), { type: "module" });
      w.current.onmessage = (e: MessageEvent<PlanResponse>) => { if (e.data.id === last.current) { setPlan(e.data); setWorking(false); } };
    }
    const q: PlanRequest = { id: ++last.current, url: new URL("generated/lists.json", document.baseURI).href, owned, dest: p.dest,
      date: new Date().toISOString(), missing, noGo };
    setWorking(true);
    w.current.postMessage(q);
  }, [open, busy, key]);
  return { plan, working, missing: missing.length };
}

function StepItem({ s, i, nameOf, set }: { s: StepOut; i: number; nameOf: Map<string, string>; set: (f: (p: Profile) => Profile) => void }) {
  const alt = s.alts.map((a) => {
    const gets = a.filter((x) => !s.add.includes(x)), drops = s.add.filter((x) => !a.includes(x));
    return `${itemNames(gets).join(" + ")} instead of ${itemNames(drops).join(" + ")}`;
  });
  return (
    <li class="step">
      <div class="step-head">
        <span class="step-n">{i + 1}</span>
        <span class="step-what"><b>{itemNames(s.add).join(" + ")}</b>{alt.length > 0 && <small> or {alt.join("; or ")}</small>}</span>
        <span class="step-gain">+{s.gain.length}</span>
      </div>
      <div class="step-tags">
        {s.beforeEnd.length > 0 && <span class="flag urgent">{s.beforeEnd.length === s.gain.length ? "all" : s.beforeEnd.length} only if moved before {BANK_END_LABEL}</span>}
        {s.preinstalled.length > 0 && <span class="flag" title="Digital-only: its shop has closed.">needs a console with {itemNames(s.preinstalled).join(", ")} already installed (or a modded one)</span>}
      </div>
      <details class="step-mons">
        <summary>{s.gain.length === 1 ? "Which Pokémon" : `Which ${s.gain.length} Pokémon`}</summary>
        <p>{s.gain.map((n) => nameOf.get(n) ?? `#${n}`).join(", ")}</p>
      </details>
      <button type="button" class="add" onClick={() => set((x) => withItems(x, s.add))}>I have these now: add to my profile</button>
    </li>
  );
}

export function NextSteps({ p, res, busy, set }: { p: Profile; res: Response | null; busy: boolean; set: (f: (p: Profile) => Profile) => void }) {
  const [open, setOpen] = useState(false);
  const [noGo, setNoGo] = useState(false);
  const { plan, working, missing } = usePlanner(p, res, busy, open, noGo);
  const nameOf = new Map((res?.rows ?? []).map((r) => [String(r.n), r.name]));
  const dest = p.dest === "HOME" ? "HOME" : gameName(p.dest);
  return (
    <details class="card plan" open={open} onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary><h2>What to get next</h2><small>{res ? (missing ? `${missing} missing: see what would bring them to ${dest}` : "Nothing missing") : ""}</small></summary>
      <label class="nogo"><input type="checkbox" checked={noGo} onChange={(e) => setNoGo((e.target as HTMLInputElement).checked)} /> I don't play Pokémon GO (leave it out)</label>
      {!res || busy ? <p class="hint">Waiting for the results above…</p>
        : !missing ? <p>Everything in scope can already reach {dest} with what you own.</p>
        : working && !plan ? <p class="spin">Planning… (the first time loads about 300 KB)</p>
        : plan?.error ? <p class="warn">The planner failed: {plan.error}</p>
        : plan && (
          <>
            <p class="status" role="status">
              {plan.planned.length > 0
                ? <>{plan.planned.length} of the {missing} missing Pokémon can still reach {dest}: <b>{plan.steps.length} {plan.steps.length === 1 ? "step" : "steps"}</b>.</>
                : <>None of the {missing} missing Pokémon can be brought to {dest}.</>}
              {working && <small> · updating…</small>}
            </p>
            {plan.steps.length > 0 && <ol class="steps">{plan.steps.map((s, i) => <StepItem s={s} i={i} nameOf={nameOf} set={set} />)}</ol>}
            {plan.excluded.length > 0 && <p class="hint"><b>Only with Pokémon GO</b> ({plan.excluded.length}): {plan.excluded.map((n) => nameOf.get(n)).join(", ")}.</p>}
            {plan.never.length > 0 && <p class="hint"><b>No one can get these any more</b> ({plan.never.length}): {plan.never.map((n) => nameOf.get(n)).join(", ")}.</p>}
            <p class="hint">Each step is what to get together (a game comes with the system it plays on), the one that brings the most Pokémon for the least extra hardware first. The plan is a good one, not guaranteed to be the smallest.</p>
          </>
        )}
    </details>
  );
}
