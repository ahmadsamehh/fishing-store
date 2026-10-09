import './globals.css';
import { Inter } from 'next/font/google';
import { StoreProvider } from '@/lib/store';
import SiteChrome from '@/components/SiteChrome';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-inter' });

export const metadata = {
  title: 'Marjan — Reef aquarium supplies',
  description: 'Lighting, pumps, filtration, salt and supplements for reef aquariums.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <StoreProvider>
          <SiteChrome>{children}</SiteChrome>
        </StoreProvider>
      </body>
    </html>
  );
}
