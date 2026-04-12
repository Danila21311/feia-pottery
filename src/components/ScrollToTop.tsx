'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Auto scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full sage-gradient pottery-shadow-hero animate-fade-in"
      size="sm"
    >
      <ArrowUp className="w-5 h-5" />
    </Button>
  );
}