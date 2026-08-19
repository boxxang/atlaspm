import { AppShell } from '@/components/AppShell';
import { getProjectState } from '@/lib/queries';

/**
 * Reads the program on the server so the client store boots from the RSC
 * payload rather than a round trip. "Today" is still applied on the client —
 * see AppShell.
 */
export default async function Home() {
  const initial = await getProjectState();

  if (!initial) {
    return (
      <main style={{ padding: '80px 40px', maxWidth: '48ch' }}>
        <h1 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>No project yet</h1>
        <p style={{ color: 'var(--ink-2)' }}>
          The database is empty. Run <code className="mono">npm run db:seed</code> to load the
          AtlasAX1 program, then reload.
        </p>
      </main>
    );
  }

  return <AppShell initial={initial} />;
}
