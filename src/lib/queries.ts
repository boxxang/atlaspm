import 'server-only';
import { prisma } from './db';
import { buildProjectState, type ProjectState } from './projectState';

/** Single-project for this pass; auth and project switching are out of scope. */
export async function getProjectState(): Promise<ProjectState | null> {
  const project = await prisma.project.findFirst({
    orderBy: { id: 'asc' },
    include: {
      overrides: true,
      leaders: true,
      items: { include: { updates: true } },
      deliverables: { orderBy: { position: 'asc' } },
      contacts: { orderBy: { position: 'asc' } },
    },
  });
  return project ? buildProjectState(project) : null;
}
