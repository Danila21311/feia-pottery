'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/Shop/ProductCard';
import { Product } from '@/context/StoreContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import heroImage from '@/assets/hero-new.jpg';
import categoryDishes from '@/assets/category-dishes.jpg';
import categoryDecor from '@/assets/category-decor.jpg';
import categoryPots from '@/assets/category-pots.jpg';
import categorySets from '@/assets/category-sets.jpg';
import teamMain from '@/assets/team-main.jpg';
import teamCollage1 from '@/assets/team-collage-1.jpg';
import teamCollage2 from '@/assets/team-collage-2.jpg';
import { api } from '@/lib/api';
import { useParallaxBanner } from '@/hooks/useParallaxBanner';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.getProducts().then((items) => {
      const all = items as unknown as Product[];
      const newOnes = all.filter(p => p.isNew);
      setFeaturedProducts(newOnes.length > 0 ? newOnes : all.slice(0, 6));
    }).catch(console.error);
  }, []);
  
  const aboutAnimation = useScrollAnimation(0.1);
  const newProductsAnimation = useScrollAnimation(0.1);
  const categoriesAnimation = useScrollAnimation(0.1);
  const ctaAnimation = useScrollAnimation(0.1);
  const { containerRef: heroParallaxRef, imageStyle: heroImageParallaxStyle } = useParallaxBanner<HTMLDivElement>(0.32, 1.12);

  const categories = [
    { name: 'Посуда', href: '/catalog?category=Посуда', image: categoryDishes.src },
    { name: 'Декор', href: '/catalog?category=Декор', image: categoryDecor.src },
    { name: 'Горшки', href: '/catalog?category=Горшки', image: categoryPots.src },
    { name: 'Наборы', href: '/catalog?category=Наборы', image: categorySets.src },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-background">
        <div ref={heroParallaxRef} className="relative overflow-hidden">
            <img 
              src={heroImage.src}
              alt="Руки в глине во время создания керамики"
              className="w-full h-screen object-cover origin-center"
              style={heroImageParallaxStyle}
            />
            <div className="absolute inset-0 bg-black/45" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full container mx-auto px-6 md:px-12 flex justify-center">
                <div className="max-w-3xl w-full text-white text-center -translate-y-6 md:-translate-y-12 lg:-translate-y-16">
                  <p className="text-sm md:text-base uppercase tracking-[0.22em] text-white/80 mb-4 animate-fade-in">
                    Фея Керамика
                  </p>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-medium leading-tight animate-fade-in">
                    Керамика ручной работы и мастер-классы в гостях у "Феи"
                  </h1>
                  <div className="mt-8 flex justify-center">
                    <Link href="/workshops">
                      <Button size="lg" className="sage-gradient animate-fade-in text-base md:text-lg px-7 py-3">
                        Записаться на мастер-класс
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* Philosophy Section */}
      <section 
        ref={aboutAnimation.elementRef}
        className={`py-24 bg-background ${aboutAnimation.isVisible ? 'animate-fade-in-up' : ''}`}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Main Team Photo */}
            <div className="lg:col-span-5">
              <img
                src={teamMain.src}
                alt="Команда Фея в мастерской"
                className="w-full h-[600px] object-cover"
              />
            </div>
            
            {/* Text Content */}
            <div className="lg:col-span-4 space-y-6">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground mb-6">
                  Тихая эстетика ручной керамики
                </h2>
              </div>
              
              <p className="text-muted-foreground leading-relaxed text-center">
                Наш дизайн — это простые неровные формы и наивные рисунки, которые возвращают в детство, 
                когда мы рисовали как чувствовали, а не как правильно.
              </p>
            </div>
            
            {/* Photo Collage */}
            <div className="lg:col-span-3 space-y-4">
              <img
                src={teamCollage1.src}
                alt="Люди с керамическими изделиями"
                className="w-full h-48 object-cover"
              />
              <img
                src={teamCollage2.src}
                alt="Выбор керамики с полки"
                className="w-full h-60 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* New Products Section */}
      {featuredProducts.length > 0 && (
        <section 
          ref={newProductsAnimation.elementRef}
          className={`py-24 ${newProductsAnimation.isVisible ? 'animate-fade-in-up' : ''}`}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">Новинки</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredProducts.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            <div className="text-center">
              <Link href="/catalog">
                <Button variant="outline" size="lg">
                  Смотреть весь каталог
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section 
        ref={categoriesAnimation.elementRef}
        className={`py-24 bg-background ${categoriesAnimation.isVisible ? 'animate-fade-in-up' : ''}`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-center mb-14">Категории</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/5] overflow-hidden mb-4">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-sans text-pottery-sage font-medium text-center group-hover:text-pottery-sage-light transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Мастер-классы — короткий акцент без тяжёлого фона */}
      <section
        ref={ctaAnimation.elementRef}
        className={`border-t border-border/50 py-14 md:py-20 bg-background ${ctaAnimation.isVisible ? 'animate-fade-in-up' : ''}`}
      >
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground tracking-tight">
            Мастер-классы
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
            Расписание и запись на сайте — после заявки менеджер подтвердит время и формат.
          </p>
          <Link
            href="/workshops"
            className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-wide text-foreground border-b border-foreground/35 pb-0.5 hover:border-foreground transition-colors"
          >
            К расписанию
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
