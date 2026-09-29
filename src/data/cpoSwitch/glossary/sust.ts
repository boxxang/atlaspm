/**
 * SUST — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const SUST_GLOSSARY: CpoGlossary = {
  '8D': {
    full: 'Eight disciplines problem solving',
    group: 'qual',
    note: 'A structured corrective-action report — team, problem, containment, root cause, corrective action, verification, prevention and closure — that customers expect for every confirmed field failure.',
  },
  NFF: {
    full: 'No fault found',
    group: 'qual',
    note: 'A returned unit that passes every factory test; a high share usually means the factory test does not reproduce the field stress, not that the customer was wrong.',
  },
  EOL: {
    full: 'End of life',
    group: 'program',
    note: 'The date after which a product or component is no longer made; announced by suppliers with a notice period in which last orders can be placed.',
  },
  LTB: {
    full: 'Last-time buy',
    group: 'program',
    note: 'The final order placed before a component reaches end of life, sized to cover remaining production, repairs and spares for the support window.',
  },
};
