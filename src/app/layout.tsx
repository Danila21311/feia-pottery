import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import '@/index.css';
import { Providers } from './providers';

const playfair = Playfair_Display({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const lato = Lato({
  subsets: ['cyrillic', 'latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Feia - Ручная керамика с душой',
  description:
    'Уникальная керамика ручной работы от мастерской Feia. Посуда, декор, мастер-классы. Каждое изделие создано с любовью из натуральной глины.',
  openGraph: {
    title: 'Feia - Ручная керамика с душой',
    description:
      'Уникальная керамика ручной работы от мастерской Feia. Посуда, декор, мастер-классы.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${playfair.variable} ${lato.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
