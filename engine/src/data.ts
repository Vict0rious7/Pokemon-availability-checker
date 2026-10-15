import { readFileSync } from "node:fs";
import { join } from "node:path";

/** One species or form row, with its availability code per game column. */
export interface Form {
  id: string;            // "25" or "52|Alolan Form"
  number: string;        // national dex number as in the CSV ("25")
  name: string;          // "Meowth"
  form: string;          // "" or "Alolan Form"
  gen: number;           // CSV file it came from
  cells: Record<string, string>;  // column -> code, trimmed
}

/** Minimal CSV reader for the project files: ';' separated, double-quoted cells may hold line breaks. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ";") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

export function loadForms(dir: string): Form[] {
  const forms: Form[] = [];
  for (let gen = 1; gen <= 9; gen++) {
    const [header, ...rows] = parseCsv(readFileSync(join(dir, `gen${gen}.csv`), "utf8"));
    for (const r of rows) {
      const name = r[1].split(/\s+/).join(" ");
      const m = name.match(/\((.*?)\)/);
      const form = m ? m[1].trim() : "";
      const base = name.replace(/\s*\(.*$/, "");
      const cells: Record<string, string> = {};
      header.slice(2).forEach((col, j) => { cells[col.trim()] = (r[j + 2] ?? "").trim(); });
      forms.push({ id: form ? `${r[0]}|${form}` : r[0], number: r[0], name: base, form, gen, cells });
    }
  }
  return forms;
}

/** A game can hold a form when its CSV cell exists and is not "—" (legend: unobtainable in this game). */
export function canHold(f: Form, game: string): boolean {
  const c = f.cells[game];
  return c !== undefined && c !== "" && c !== "—";
}
