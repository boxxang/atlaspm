import { RisksPage } from '@/components/shell/RisksPage';

export default async function Risks({ params }: PageProps<'/p/[projectId]/risks'>) {
  const { projectId } = await params;
  return <RisksPage projectId={projectId} />;
}
