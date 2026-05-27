import { MapPin, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/Layout/Logo';
import { WORKSHOP_ADDRESS, WORKSHOP_HOURS } from '@/lib/workshopInfo';

export function Footer() {
  const footerLinks = [
    { name: 'Политика конфиденциальности', href: '/privacy' },
    { name: 'Публичная оферта', href: '/terms' },
    { name: 'Доставка и оплата', href: '/delivery' },
  ];

  return (
    <footer className="bg-secondary border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          <div>
            <Link href="/" className="inline-flex mb-4" aria-label="На главную">
              <Logo variant="footer" />
            </Link>
            <p className="text-muted-foreground mb-4">
              Мастерская уникальной керамики ручной работы. Каждое изделие создается с любовью 
              из натуральной глины и несет частичку души мастера.
            </p>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-lg mb-4">Контакты</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">{WORKSHOP_ADDRESS.street}</p>
                  <p className="text-sm text-muted-foreground">{WORKSHOP_ADDRESS.settlement}</p>
                  <p className="text-sm text-muted-foreground">{WORKSHOP_ADDRESS.region}</p>
                  <p className="text-sm text-muted-foreground">{WORKSHOP_ADDRESS.floor}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <a href="tel:+79991234567" className="text-sm hover:text-primary transition-colors">
                  +7 (999) 123-45-67
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <a href="mailto:hello@feia.studio" className="text-sm hover:text-primary transition-colors">
                  hello@feia.studio
                </a>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4">Часы работы</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span>{WORKSHOP_HOURS.weekdaysLabel}</span>
                <span>{WORKSHOP_HOURS.weekdays}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>{WORKSHOP_HOURS.weekendLabel}</span>
                <span>{WORKSHOP_HOURS.weekend}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
              {footerLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Фея. Все права защищены.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}