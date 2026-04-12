'use client';

import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { CartModal } from '@/components/Shop/CartModal';
import { WishlistModal } from '@/components/Shop/WishlistModal';
import { ScrollToTop } from '@/components/ScrollToTop';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <CartModal />
      <WishlistModal />
      <ScrollToTop />
    </div>
  );
}
