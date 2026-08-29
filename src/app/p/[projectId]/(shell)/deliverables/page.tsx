import { ProgramDeliverables } from '@/components/shell/ProgramDeliverables';

export default async function Deliverables({ params }: PageProps<'/p/[projectId]/deliverables'>) {
  const { projectId } = await params;
  return <ProgramDeliverables projectId={projectId} />;
}
