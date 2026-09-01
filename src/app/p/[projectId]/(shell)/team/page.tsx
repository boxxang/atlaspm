import { ProgramTeam } from '@/components/shell/ProgramTeam';

/* The programme is already in the store by the time the shell renders, so the
   route parameter is not read here. */
export default function Team() {
  return <ProgramTeam />;
}
