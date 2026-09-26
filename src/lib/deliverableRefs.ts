/**
 * Which reference tag each key deliverable carries.
 *
 * Two seed lists name the same artefact: the program's rows, and the catalogue
 * the activity write-ups deliver against. They agree most of the time and drift
 * the rest — British against American spelling, a comma moved, genuinely
 * different wording. Matching on the exact title leaves rows with no tag, which
 * reads as "this one has no reference" rather than "these two lists disagree".
 *
 * So: fold the orthography and match on that, then fall back to word overlap
 * *within the same stage*, which is the constraint that makes a fuzzy match
 * safe — a deliverable cannot be tagged with a reference from a stage it does
 * not belong to. Every tag is claimed at most once.
 */
const normTitle = (t: string): string =>
  String(t ?? '')
    .toLowerCase()
    .replace(/isation\b/g, 'ization')
    .replace(/ised\b/g, 'ized')
    .replace(/ising\b/g, 'izing')
    .replace(/\bflavour/g, 'flavor')
    .replace(/\bbehaviour/g, 'behavior')
    .replace(/\bcolour/g, 'color')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const wordsOf = (t: string): string[] => normTitle(t).split(' ').filter((w) => w.length > 2);

export interface DeliverableRow {
  id: string;
  title: string;
  stageId: string;
}

/**
 * @param rows       the program's key deliverables
 * @param catalogue  ref → title, from the activity write-ups
 * @param stageOfRef which stage a reference's prefix belongs to (`PD-D6` → `PD-`)
 */
export function deliverableRefs(
  rows: readonly DeliverableRow[],
  catalogue: Readonly<Record<string, string>>,
  stageOfRef: Readonly<Record<string, string>>,
): Map<string, string> {
  /* Several references can share a title: a template derived from another
     keeps its deliverables' wording under its own prefix (ERTL-D7 is RTL-D7 at
     embedded scale). So a title names every reference that carries it, and the
     row's own stage decides between them. */
  const byNorm = new Map<string, string[]>();
  for (const [ref, title] of Object.entries(catalogue)) {
    const key = normTitle(title);
    byNorm.set(key, [...(byNorm.get(key) ?? []), ref]);
  }

  const out = new Map<string, string>();
  const taken = new Set<string>();

  for (const d of rows) {
    const open = (byNorm.get(normTitle(d.title)) ?? []).filter((r) => !taken.has(r));
    /* A reference whose prefix belongs to no stage this programme runs is
       another template's row with the same words — EDEF-D5 in an SoC
       programme — and is not an answer at all. */
    const ref =
      open.find((r) => stageOfRef[r.split('-')[0]] === d.stageId) ??
      open.find((r) => stageOfRef[r.split('-')[0]] !== undefined);
    if (ref) {
      out.set(d.id, ref);
      taken.add(ref);
    }
  }

  for (const d of rows) {
    if (out.has(d.id)) continue;
    const dw = wordsOf(d.title);
    if (!dw.length) continue;
    let best: string | null = null;
    let score = 0;
    for (const [ref, title] of Object.entries(catalogue)) {
      if (taken.has(ref)) continue;
      /* the stage is the guard rail: a loose match inside the wrong stage is
         worse than no match, because it reads as a fact */
      if (stageOfRef[ref.split('-')[0]] !== d.stageId) continue;
      const rw = wordsOf(title);
      const shared = dw.filter((w) => rw.includes(w)).length;
      const sc = shared / Math.max(1, Math.min(dw.length, rw.length));
      if (sc > score) {
        score = sc;
        best = ref;
      }
    }
    if (best && score >= 0.5) {
      out.set(d.id, best);
      taken.add(best);
    }
  }

  return out;
}
