import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import ClientWrapper from '@/components/ClientWrapper';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const dmSerifDisplay = DM_Serif_Display({
  variable: '--font-dm-serif',
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata = {
  title: 'Freedge',
  description: 'Culinary precision for your kitchen.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerifDisplay.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ClientWrapper />
        {children}
        <footer style={{
          borderTop: '1px solid #BFC9C1',
          padding: '24px 40px',
          background: '#F6F3F2',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <span style={{ fontFamily: 'serif', fontSize: '18px', color: '#0F5238', letterSpacing: '-0.02em' }}>
            Freedge
          </span>
          <span style={{ fontSize: '11px', color: '#707973', letterSpacing: '0.05em', textAlign: 'center' }}>
            Diandra Pramesti Wicaksono · Ayesha Zelene Faeyza · Khalisa Zahra Maulana · Syifa Naila Maulidya
          </span>
          <span style={{ fontSize: '11px', color: '#707973', letterSpacing: '0.05em' }}>
            Kelompok 17
          </span>
        </footer>
      </body>
    </html>
  );
}