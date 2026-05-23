import type { Metadata } from 'next';
import '@/index.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Фея - Ручная керамика с душой',
  description:
    'Уникальная керамика ручной работы от мастерской Фея. Посуда, декор, мастер-классы. Каждое изделие создано с любовью из натуральной глины.',
  openGraph: {
    title: 'Фея - Ручная керамика с душой',
    description:
      'Уникальная керамика ручной работы от мастерской Фея. Посуда, декор, мастер-классы.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
