import { UpdatesPage } from '@/components/shell/UpdatesPage';

/* The programme is already in the store by the time the shell renders, so the
   route parameter is not read here. */
export default function Updates() {
  return <UpdatesPage />;
}
