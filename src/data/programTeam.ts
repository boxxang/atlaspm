/**
 * /data/programTeam.ts — who is on every programme, whatever its Team tabs
 * say.
 *
 * The TPM runs the programme: authors its content, chairs its reviews and
 * signs off its gates. So the TPM is on every programme's team from the
 * start — listed on the Team page above the stages, and offered first
 * wherever a field names a person — rather than something each programme has
 * to remember to add.
 */
import { RISK_AUTHOR } from './riskSeeds';

export const PROGRAM_TPM = { name: RISK_AUTHOR, role: 'Technical program manager (TPM)' } as const;

/** Everyone on the programme by default, in the order they are listed. */
export const PROGRAM_DEFAULT_TEAM: readonly { name: string; role: string }[] = [PROGRAM_TPM];
