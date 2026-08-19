import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AtlasPM',
  description: 'Semiconductor program management',
};

/* Type stacks live in --sans / --mono / --serif (see globals.css); the
   reference uses system fonts, so no webfont is loaded. */
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
