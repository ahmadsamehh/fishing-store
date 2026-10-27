import './globals.css';
import { Inter } from 'next/font/google';
import { StoreProvider } from '@/lib/store';
import SiteChrome from '@/components/SiteChrome';
import { SITE_URL } from '@/lib/config';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-inter' });

const description = 'Chillers, pumps, filtration and salt for reef aquariums, delivered across Egypt. Order online and confirm on WhatsApp.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Marjan | Reef aquarium supplies in Egypt', template: '%s | Marjan' },
  description,
  openGraph: {
    type: 'website',
    siteName: 'Marjan',
    title: 'Marjan | Reef aquarium supplies in Egypt',
    description,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Marjan, reef aquarium supplies' }],
    locale: 'en_EG',
  },
  twitter: { card: 'summary_large_image', images: ['/og-image.jpg'] },
};

export const viewport = { themeColor: '#3D1B4A' };

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
