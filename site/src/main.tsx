import { render } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import "./styles.css";
import { Profile, decode, encode, toOwned, starting, withDest, MAX_GEN } from "./state.js";
import { PLATFORMS, GAMES, HARDWARE, SERVICES, FLAG, gameName, originName, BANK_END_LABEL, genRange } from "./labels.js";
import { describe } from "./path.js";
import type { Request, Response, Row, Status, PathOut } from "./worker.js";
import { Finder } from "./finder.js";

const BANK_END = Date.parse("2027-02-25T19:00-08:00");

const STATUS: Record<Status, string> = { ok: "Can reach", until: `Move before ${BANK_END_LABEL}`, no: "Missing", cant: "Can't live there" };

// ---------------------------------------------------------------- engine worker
/** One worker; replaced when the owned games change while it is still computing (latest request wins). */
function useEngine(profile: Profile) {
  const [res, setRes] = useState<Response | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const w = useRef<{ worker: Worker; busyKey: string | null } | null>(null);
  const lastId = useRef(0);
  const spawn = () => {
    const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (e: MessageEvent<Response>) => {
      if (w.current?.worker === worker) w.current.busyKey = null;
      if (e.data.id !== lastId.current) return;
      setRes(e.data); setBusy(false); setError(null);
    };
    worker.onerror = (e) => { setBusy(false); setError(e.message || "The engine failed."); };
    w.current = { worker, busyKey: null };
  };
  useEffect(() => {
    const owned = toOwned(profile), key = JSON.stringify(owned);
    const t = setTimeout(() => {
      if (!w.current) spawn();
      else if (w.current.busyKey !== null && w.current.busyKey !== key) { w.current.worker.terminate(); spawn(); }
      const req: Request = { id: ++lastId.current, owned, dest: profile.dest, maxGen: profile.maxGen, date: new Date().toISOString() };
      w.current!.busyKey = key;
      setBusy(true);
      w.current!.worker.postMessage(req);
    }, 250);
    return () => clearTimeout(t);
  }, [encode(profile)]);
  return { res, busy, error };
}

// ---------------------------------------------------------------- inputs
function Seg({ value, max, onChange, label }: { value: number; max: number; onChange: (n: number) => void; label: string }) {
  return (
    <span class="seg" role="radiogroup" aria-label={label}>
      {Array.from({ length: max + 1 }, (_, i) => (
        <button type="button" role="radio" aria-checked={value === i} class={value === i ? (i === 0 ? "on zero" : "on") : ""} onClick={() => onChange(i)}>
          {i === 2 && max === 2 ? "2+" : i}
        </button>
      ))}
    </span>
  );
}

/** "All / None" for a group of inputs. */
function Bulk({ label, all, none, small }: { label: string; all: () => void; none: () => void; small?: boolean }) {
  return (
    <span class={`bulk ${small ? "small" : ""}`}>
      <button type="button" onClick={all} aria-label={`Select all ${label}`}>All</button>
      <button type="button" onClick={none} aria-label={`Clear all ${label}`}>None</button>
    </span>
  );
}
const allGames = (x: Profile, keys: string[]): Profile => {
  const copies = { ...x.copies }, dlc = { ...x.dlc };
  for (const k of keys) { copies[k] = Math.max(1, copies[k] ?? 0); if (GAMES.find((g) => g.key === k)?.dlc) dlc[k] = copies[k]; }
  return { ...x, copies, dlc };
};
const noGames = (x: Profile, keys: string[]): Profile => {
  const copies = { ...x.copies }, dlc = { ...x.dlc };
  for (const k of keys) { delete copies[k]; delete dlc[k]; }
  return { ...x, copies, dlc };
};

function Inputs({ p, set }: { p: Profile; set: (f: (p: Profile) => Profile) => void }) {
  return (
    <div class="inputs">
      <section class="card">
        <h2>Your collection</h2>
        <label class="field">
          <span>Where it will live</span>
          <select value={p.dest} onChange={(e) => { const v = (e.target as HTMLSelectElement).value; set((x) => withDest(x, v)); }}>
            <option value="HOME">Pokémon HOME</option>
            {PLATFORMS.map((pl) => <optgroup label={pl.name}>{pl.games.map((g) => <option value={g.key}>{g.name}</option>)}</optgroup>)}
          </select>
          <small>Picking a place adds it to what you own below.</small>
        </label>
        <label class="field">
          <span>Which Pokémon count</span>
          <select value={p.maxGen} onChange={(e) => { const v = +(e.target as HTMLSelectElement).value; set((x) => ({ ...x, maxGen: v })); }}>
            {Array.from({ length: MAX_GEN }, (_, i) => i + 1).map((g) => <option value={g}>{g === 1 ? "Gen 1 only" : `Gens 1 to ${g}`} (#0001–{genRange(g).split("–")[1]})</option>)}
          </select>
        </label>
        {p.dest === "HOME" && !p.services.home && <p class="warn">Tick Pokémon HOME below: without it nothing can be stored there.</p>}
        {p.dest !== "HOME" && !(p.copies[p.dest] > 0) && <p class="warn">Add {gameName(p.dest)} to your games, or pick another place.</p>}
      </section>

      <section class="card">
        <h2>Games</h2>
        <Bulk label="games" all={() => set((x) => allGames(x, GAMES.map((g) => g.key)))} none={() => set((x) => noGames(x, GAMES.map((g) => g.key)))} />
        <p class="hint">Copies: two copies of the same game count as two saves (for trades). "All" also ticks the DLC.</p>
        {PLATFORMS.map((pl) => {
          const n = pl.games.filter((g) => (p.copies[g.key] ?? 0) > 0).length;
          return (
            <details open={n > 0}>
              <summary>{pl.name}{n > 0 && <span class="count">{n}</span>}</summary>
              <Bulk label={pl.name} small all={() => set((x) => allGames(x, pl.games.map((g) => g.key)))} none={() => set((x) => noGames(x, pl.games.map((g) => g.key)))} />
              {pl.note && <p class="hint">{pl.note}</p>}
              <ul class="games">
                {pl.games.map((g) => {
                  const c = p.copies[g.key] ?? 0;
                  return (
                    <li>
                      <span class="gname">{g.name}</span>
                      <Seg label={`${g.name} copies`} value={c} max={2} onChange={(v) => set((x) => ({ ...x, copies: { ...x.copies, [g.key]: v } }))} />
                      {g.dlc && c > 0 && (
                        <label class="dlc" title={g.dlc}>
                          <input type="checkbox" checked={(p.dlc[g.key] ?? 0) > 0}
                            onChange={(e) => { const on = (e.target as HTMLInputElement).checked; set((x) => ({ ...x, dlc: { ...x.dlc, [g.key]: on ? c : 0 } })); }} />
                          DLC
                        </label>
                      )}
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </section>

      <section class="card">
        <h2>Consoles</h2>
        <Bulk label="consoles" all={() => set((x) => ({ ...x, hw: Object.fromEntries(HARDWARE.map((h) => [h.key, h.max])) }))} none={() => set((x) => ({ ...x, hw: {} }))} />
        <ul class="hw">
          {HARDWARE.map((h) => (
            <li>
              <span class="gname">{h.name}<small>{h.help}</small></span>
              <Seg label={h.name} value={p.hw[h.key] ?? 0} max={h.max} onChange={(v) => set((x) => ({ ...x, hw: { ...x.hw, [h.key]: v } }))} />
            </li>
          ))}
        </ul>
      </section>

      <section class="card">
        <h2>Services and side games</h2>
        <Bulk label="services and side games" all={() => set((x) => ({ ...x, services: Object.fromEntries(SERVICES.map((s) => [s.key, true])) }))}
          none={() => set((x) => ({ ...x, services: (x.dest === "HOME" ? { home: true } : {}) as Record<string, boolean> }))} />
        <ul class="svc">
          {SERVICES.map((s) => (
            <li>
              <label>
                <input type="checkbox" checked={!!p.services[s.key]} onChange={(e) => { const on = (e.target as HTMLInputElement).checked; set((x) => ({ ...x, services: { ...x.services, [s.key]: on } })); }} />
                {s.name}{"help" in s && <small> — {s.help}</small>}
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- results
// End dates are Pacific time (Bank closes 25 Feb 2027 at 19:00 PST): show them as Nintendo announces them.
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Los_Angeles" });

function PathLine({ s, dest }: { s: PathOut; dest: string }) {
  const d = describe(s, dest);
  return (
    <li>
      <span class="start">{d.start}</span>
      {d.steps.map((x) => x.kind === "move"
        ? <span class="step">→ {x.method && <small class="method">{x.method}</small>}{x.place}</span>
        : <span class="step act">· {x.label === "breed" ? "bred there" : x.label}</span>)}
      {s.flags.map((f) => <span class="flag" title={FLAG[f]?.[1]}>{FLAG[f]?.[0] ?? f}</span>)}
      {s.until && <span class="flag urgent">until {fmtDate(s.until)}</span>}
    </li>
  );
}

function ResultRow({ r, dest }: { r: Row; dest: string }) {
  const origins = r.paths.map((x) => (x.from ? `${originName(x.origin)} (bred)` : originName(x.source ?? x.origin)));
  const summary = r.status === "cant" ? `${gameName(dest)} cannot hold it`
    : r.status === "no" ? (r.refused[0] ? `Blocked: ${r.refused[0]}` : "No way with what you own")
    : `from ${origins.slice(0, 3).join(", ")}${origins.length + r.more > 3 ? ` +${origins.length + r.more - 3}` : ""}`;
  return (
    <details class={`row ${r.status}`}>
      <summary>
        <span class="num">#{String(r.n).padStart(4, "0")}</span>
        <span class="pname">{r.name}</span>
        <span class={`badge ${r.status}`}>{STATUS[r.status]}</span>
        <span class="sum">{summary}</span>
      </summary>
      {r.paths.length > 0 && (
        <ul class="paths">
          {r.paths.map((s) => <PathLine s={s} dest={dest} />)}
          {r.more > 0 && <li class="hint">…and {r.more} more starting points</li>}
        </ul>
      )}
      {r.status === "no" && r.refused.length > 0 && <ul class="paths">{r.refused.map((x) => <li class="hint">Refused: {x}</li>)}</ul>}
    </details>
  );
}

function Results({ p, res, busy, error }: { p: Profile; res: Response | null; busy: boolean; error: string | null }) {
  const [filter, setFilter] = useState<Status | "all">("all");
  const [q, setQ] = useState("");
  const rows = res?.rows ?? [];
  const count = (s: Status) => rows.filter((r) => r.status === s).length;
  const shown = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => (filter === "all" || r.status === filter) && (!qq || r.name.toLowerCase().includes(qq) || String(r.n) === qq.replace(/^#?0*/, "")));
  }, [rows, filter, q]);
  const gens = [...new Set(shown.map((r) => r.gen))].sort((a, b) => a - b);
  const destName = p.dest === "HOME" ? "Pokémon HOME" : gameName(p.dest);
  const chips: [Status | "all", string, number][] = [["all", "All", rows.length], ["until", STATUS.until, count("until")], ["no", "Missing", count("no")],
    ["ok", "Can reach", count("ok")], ...(p.dest !== "HOME" ? [["cant", "Can't live there", count("cant")] as [Status, string, number]] : [])];
  return (
    <section class="results card" id="results" aria-busy={busy}>
      <h2>In {destName}, {p.maxGen === 1 ? "Gen 1" : `Gens 1–${p.maxGen}`}</h2>
      <p class="status" role="status">
        {error ? <span class="warn">{error}</span>
          : busy ? <span class="spin">Working it out… (a big collection can take a few seconds on a phone)</span>
          : res ? <>{count("ok") + count("until")} of {rows.length - count("cant")} can reach {destName}{count("until") > 0 && <> · <b class="urgent">{count("until")} only if moved before {BANK_END_LABEL}</b></>}<small> · {res.cached ? "updated" : `computed in ${(res.ms / 1000).toFixed(1)} s`}</small></>
          : "Pick your games to start."}
      </p>
      <div class="chips" role="group" aria-label="Filter">
        {chips.map(([k, l, n]) => <button type="button" class={`chip ${k} ${filter === k ? "on" : ""}`} aria-pressed={filter === k} onClick={() => setFilter(k)}>{l} <b>{n}</b></button>)}
      </div>
      <input class="search" type="search" placeholder="Search a Pokémon by name or number" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} />
      {gens.map((g) => {
        const gr = shown.filter((r) => r.gen === g);
        return (
          <details class="gen" open>
            <summary>Generation {g} <small>{genRange(g)} · {gr.length} shown</small></summary>
            {gr.map((r) => <ResultRow key={r.n} r={r} dest={p.dest} />)}
          </details>
        );
      })}
      {res && !shown.length && <p class="hint">Nothing here.</p>}
    </section>
  );
}

/** Phones: the inputs are long, so a bar at the bottom shows the totals and jumps to the results. */
function JumpBar({ res, busy }: { res: Response; busy: boolean }) {
  const n = (s: Status) => res.rows.filter((r) => r.status === s).length;
  return (
    <button type="button" class="jump" onClick={() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })}>
      {busy ? "Working it out…" : <>{n("ok") + n("until")} can reach{n("until") > 0 && <> · <b>{n("until")} before {BANK_END_LABEL}</b></>}</>} <span aria-hidden="true">↓</span>
    </button>
  );
}

// ---------------------------------------------------------------- app
function Credits() {
  return (
    <section class="card prose">
      <h2>About</h2>
      <p>Enter the Pokémon games, consoles and services you own, where your collection will live, and which generations count. The checker lists which Pokémon you can bring there, and which ones you can only bring there if you move them before Pokémon Bank and Poké Transporter close on {BANK_END_LABEL}.</p>
      <p>Your selections are saved in the page address: bookmark it, or share it to show someone the same results.</p>
      <h2>Credits</h2>
      <p>Availability data adapted from <a href="https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_availability">Bulbapedia</a> and the pages cited in the project's data folder, under <a href="https://creativecommons.org/licenses/by-nc-sa/2.5/">CC BY-NC-SA 2.5</a>. Evolution, Egg Group and species data from <a href="https://pokeapi.co/">PokéAPI</a>.</p>
      <p>Pokémon and Pokémon character names are trademarks of Nintendo, Creatures and Game Freak. This is an unofficial fan project.</p>
      <p><a href="https://github.com/Vict0rious7/Pokemon-availability-checker/issues">Report a wrong result</a> (include the page link, the Pokémon and where you saw the right answer).</p>
    </section>
  );
}

function App() {
  const [p, setP] = useState<Profile>(() => (location.hash.length > 1 ? decode(location.hash) : starting()));
  const [tab, setTab] = useState<"check" | "finder" | "about">("check");
  const set = (f: (p: Profile) => Profile) => setP((x) => f(x));
  useEffect(() => { history.replaceState(null, "", `#${encode(p)}`); }, [encode(p)]);
  useEffect(() => { const h = () => setP(decode(location.hash)); addEventListener("hashchange", h); return () => removeEventListener("hashchange", h); }, []);
  const { res, busy, error } = useEngine(p);
  const days = Math.ceil((BANK_END - Date.now()) / 86400000);
  return (
    <>
      <header>
        <h1>Pokémon availability checker</h1>
        <p>{days > 0 ? <>Pokémon Bank closes in <b>{days} days</b> ({BANK_END_LABEL}). Find out what you need to move before then.</> : <>Pokémon Bank closed on {BANK_END_LABEL}.</>}</p>
        <nav>
          {([["check", "Checker"], ["finder", "Finder"], ["about", "About & credits"]] as const).map(([k, l]) =>
            <button type="button" class={tab === k ? "on" : ""} aria-current={tab === k} onClick={() => setTab(k)}>{l}</button>)}
        </nav>
      </header>
      <main>
        {tab === "check" && <div class="layout"><Inputs p={p} set={set} /><Results p={p} res={res} busy={busy} error={error} /></div>}
        {tab === "check" && res && <JumpBar res={res} busy={busy} />}
        {tab === "finder" && <Finder />}
        {tab === "about" && <Credits />}
      </main>
    </>
  );
}

render(<App />, document.getElementById("app")!);
