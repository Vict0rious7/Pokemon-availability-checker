/// <reference lib="webworker" />
// "What to get next" off the main thread: loads the shopping lists (built by engine/src/lists.ts) once, then plans.
import { optimise, PREINSTALLED, type Plan } from "../../engine/src/optimise.js";
import { names, bit } from "../../engine/src/items.js";
import type { ListsFile } from "../../engine/src/optimise.js";

export interface PlanRequest { id: number; url: string; owned: bigint; dest: string; date: string; missing: string[]; noGo: boolean; }
export interface StepOut { add: string[]; alts: string[][]; cost: number; gain: string[]; beforeEnd: string[]; preinstalled: string[]; }
export interface PlanResponse { id: number; error?: string; steps: StepOut[]; total: number; never: string[]; excluded: string[]; planned: string[]; ms: number; }

let lists: Promise<ListsFile> | null = null;

self.onmessage = async (e: MessageEvent<PlanRequest>) => {
  const q = e.data, t = performance.now();
  try {
    lists ??= fetch(q.url).then((r) => { if (!r.ok) throw new Error(`lists: HTTP ${r.status}`); return r.json(); });
    const file = await lists;
    const plan: Plan = optimise(file, { owned: q.owned, dest: q.dest, date: q.date, missing: q.missing, exclude: q.noGo ? bit("go") : 0n });
    const steps = plan.steps.map((s) => {
      const add = names(s.add);
      return { add, alts: s.alts.map(names), cost: s.cost, gain: s.gain, beforeEnd: s.beforeEnd, preinstalled: add.filter((x) => PREINSTALLED.has(x)) };
    });
    (self as unknown as Worker).postMessage({ id: q.id, steps, total: plan.total, never: plan.never, excluded: plan.excluded, planned: plan.planned, ms: Math.round(performance.now() - t) } satisfies PlanResponse);
  } catch (err) {
    lists = null;
    (self as unknown as Worker).postMessage({ id: q.id, error: String((err as Error).message ?? err), steps: [], total: 0, never: [], excluded: [], planned: [], ms: 0 } satisfies PlanResponse);
  }
};
