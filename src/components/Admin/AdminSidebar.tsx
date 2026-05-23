'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  ClipboardList,
  LogOut, 
  ArrowLeft
} from 'lucide-react';

const navigation = [
  { name: 'Обзор', href: '/admin', icon: LayoutDashboard },
  { name: 'Заявки', href: '/admin/orders', icon: ClipboardList },
  { name: 'Товары', href: '/admin/products', icon: Package },
  { name: 'Мастер-классы', href: '/admin/workshops', icon: Calendar },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <aside className="w-64 h-full bg-background border-r border-border/60 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-serif font-semibold text-primary">Фея панель управления</h1>
        <p className="text-sm text-muted-foreground mt-1 truncate">{user?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 shrink-0 ${isActive(item.href) ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => { router.push('/'); onNavigate?.(); }}
        >
          <ArrowLeft className="w-5 h-5" />
          На сайт
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Выйти
        </Button>
      </div>
    </aside>
  );
}
