import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BUILTIN_PROFILES } from '@/data/builtins';
import { flowchartOf } from '@/data/builtinFlowcharts';

/**
 * /templates/:id/flowchart — a built-in template's flowchart, inside the app.
 *
 * The flowchart is a page of its own (public/flowcharts), drawn and scripted
 * on its own; it opens here, in the same window, under a bar that goes back
 * to the Templates list, rather than in a tab that has no way back.
 */
export default async function TemplateFlowchart({ params }: PageProps<'/templates/[id]/flowchart'>) {
  const { id } = await params;
  const src = flowchartOf(id);
  const profile = BUILTIN_PROFILES.find((p) => p.id === id);
  if (!src || !profile) notFound();
  return (
    <div className="flowpage" data-flowchart-page={id}>
      <div className="filterbar flowbar">
        <Link href="/templates" className="crumb" data-back-templates>
          ‹ Templates
        </Link>
        <h1 style={{ fontSize: 18, fontWeight: 640, margin: 0 }}>{profile.label}</h1>
        <span className="pill" style={{ fontSize: 10.5 }}>
          Flowchart
        </span>
      </div>
      <iframe className="flowframe" src={src} title={`${profile.label} flowchart`} />
    </div>
  );
}
