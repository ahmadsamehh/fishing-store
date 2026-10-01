import './globals.css';
import { IBM_Plex_Sans, Readex_Pro } from 'next/font/google';
import { StoreProvider } from '@/lib/store';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const body = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });
const display = Readex_Pro({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display' });

export const metadata = {
  title: 'Marjan — Reef aquarium supplies',
  description: 'Lighting, pumps, filtration, salt and supplements for reef aquariums.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body>
        <StoreProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
