import { useEffect, useMemo, useState } from "preact/hooks";
import { GAMES, gameName } from "./labels.js";

interface FRow { n: number; name: string; form: string; gen: number; games: string[]; }
const ORDER = Object.fromEntries(GAMES.map((g, i) => [g.key, i]));

/** Where each Pokémon (and form) can be obtained in-game, if you owned everything. Computed at build time. */
export function Finder() {
  const [rows, setRows] = useState<FRow[] | null>(null);
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(100);
  useEffect(() => { import("./generated/finder.json").then((m) => setRows(m.default as FRow[])); }, []);
  const shown = useMemo(() => {
    if (!rows) return [];
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    const num = qq.replace(/^#?0*/, "");
    return rows.filter((r) => r.name.toLowerCase().includes(qq) || r.form.toLowerCase().includes(qq) || String(r.n) === num ||
      r.games.some((g) => gameName(g).toLowerCase() === qq));
  }, [rows, q]);
  return (
    <section class="card finder">
      <h2>Finder</h2>
      <p class="hint">Where each Pokémon can be caught, received, evolved or bred, game by game, before any trade or transfer. Search by name, number or game.</p>
      <input class="search" type="search" placeholder="Pikachu, 25, Emerald…" value={q} onInput={(e) => { setQ((e.target as HTMLInputElement).value); setLimit(100); }} />
      {!rows ? <p class="hint">Loading…</p> : <p class="hint">{shown.length} of {rows.length} Pokémon and forms</p>}
      <table>
        <thead><tr><th>#</th><th>Pokémon</th><th>Games</th></tr></thead>
        <tbody>
          {shown.slice(0, limit).map((r) => (
            <tr>
              <td class="num">{String(r.n).padStart(4, "0")}</td>
              <td>{r.name}{r.form && <small> {r.form}</small>}</td>
              <td>{r.games.length ? [...r.games].sort((a, b) => ORDER[a] - ORDER[b]).map((g) => <span class="tag">{gameName(g)}</span>) : <span class="hint">Not obtainable in any core game (events only)</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {shown.length > limit && <button type="button" class="more" onClick={() => setLimit(limit + 200)}>Show more</button>}
    </section>
  );
}
