import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import { Geist, Geist_Mono } from "next/font/google";
import ChatButton from '@/components/chat/ChatButton';
import "./globals.css";

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
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerifDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ChatButton />
      </body>
    </html>
  );
}