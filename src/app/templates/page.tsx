import { listProfiles } from '@/lib/queries';
import { TemplatesView } from '@/components/shell/TemplatesView';

/* Reads the database on every request, like the programs list. */
export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  return <TemplatesView profiles={await listProfiles()} />;
}
