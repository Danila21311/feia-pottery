'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, Heart, Settings, UserCircle, LogIn } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Layout/Logo';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  const { state, dispatch } = useStore();
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    lastScrollY.current = typeof window !== 'undefined' ? window.scrollY : 0;
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setHeaderHidden(false);
        lastScrollY.current = window.scrollY;
        return;
      }
      if (isMobileMenuOpen) {
        setHeaderHidden(false);
        lastScrollY.current = window.scrollY;
        return;
      }
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      lastScrollY.current = y;

      if (y < 24) {
        setHeaderHidden(false);
        return;
      }
      if (delta > 6) {
        setHeaderHidden(true);
      } else if (delta < -6) {
        setHeaderHidden(false);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobileMenuOpen]);

  const navigation = [
    { name: 'Каталог', href: '/catalog' },
    { name: 'Подарочные сертификаты', href: '/gift-card' },
    { name: 'Мастер-классы', href: '/workshops' },
    { name: 'Контакты', href: '/contacts' },
  ];

  const isActive = (href: string) => pathname === href;
  const cartItemsCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = state.wishlist.length;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border',
        'transition-transform duration-300 ease-out motion-reduce:transition-none',
        headerHidden && !isMobileMenuOpen ? '-translate-y-full' : 'translate-y-0',
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center opacity-90 transition-opacity hover:opacity-100"
            aria-label="На главную"
          >
            <Logo variant="header" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href) 
                    ? 'text-primary border-b-2 border-primary pb-1' 
                    : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Cart, Wishlist, Profile & Admin Icons */}
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="p-2 hover:bg-accent"
              >
                <Link href="/admin">
                  <Settings className="w-5 h-5" />
                </Link>
              </Button>
            )}
            {user && !isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="p-2 hover:bg-accent"
              >
                <Link href="/profile">
                  <UserCircle className="w-5 h-5" />
                </Link>
              </Button>
            )}
            {!user && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="p-2 hover:bg-accent"
              >
                <Link href="/auth">
                  <LogIn className="w-5 h-5" />
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: 'TOGGLE_WISHLIST' })}
              className="relative p-2 hover:bg-accent"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="relative p-2 hover:bg-accent"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium py-2 px-4 rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-accent text-primary'
                      : 'text-muted-foreground hover:text-primary hover:bg-accent/50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
