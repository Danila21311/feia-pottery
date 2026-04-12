'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Heart, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/Shop/ProductCard';
import { Product } from '@/context/StoreContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import heroImage from '@/assets/hero-pottery.jpg';
import categoryDishes from '@/assets/category-dishes.jpg';
import categoryDecor from '@/assets/category-decor.jpg';
import categoryPots from '@/assets/category-pots.jpg';
import categorySets from '@/assets/category-sets.jpg';
import teamMain from '@/assets/team-main.jpg';
import teamCollage1 from '@/assets/team-collage-1.jpg';
import teamCollage2 from '@/assets/team-collage-2.jpg';
import { api } from '@/lib/api';

export default function Home() {
  const [newProducts, setNewProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.getProducts().then((items) => {
      setNewProducts((items as unknown as Product[]).filter(p => p.isNew));
    }).catch(console.error);
  }, []);
  
  // Animation hooks for different sections
  const aboutAnimation = useScrollAnimation(0.1);
  const newProductsAnimation = useScrollAnimation(0.1);
  const categoriesAnimation = useScrollAnimation(0.1);
  const ctaAnimation = useScrollAnimation(0.1);
  
  const categories = [
    { name: 'Посуда', href: '/catalog?category=Посуда', image: categoryDishes },
    { name: 'Декор', href: '/catalog?category=Декор', image: categoryDecor },
    { name: 'Горшки', href: '/catalog?category=Горшки', image: categoryPots },
    { name: 'Наборы', href: '/catalog?category=Наборы', image: categorySets },
  ];

  const features = [
    {
      icon: Heart,
      title: 'Ручная работа',
      description: 'Каждое изделие создается вручную с особой любовью и вниманием к деталям'
    },
    {
      icon: Sparkles,
      title: 'Натуральная глина',
      description: 'Используем только экологически чистую глину высочайшего качества'
    },
    {
      icon: Award,
      title: 'Уникальность',
      description: 'Ни одно изделие не повторяется - у вас будет по-настоящему особенная вещь'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="relative rounded-2xl overflow-hidden pottery-shadow-hero">
            <img 
              src={heroImage}
              alt="Ручная керамика Feia"
              className="w-full h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            
            <div className="absolute inset-0 flex items-center">
              <div className="w-full px-8 md:px-12">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  {/* Left Content */}
                  <div className="text-white mb-8 md:mb-0 md:max-w-lg">
                    <div className="mb-4">
                      <h1 className="text-2xl font-serif font-bold mb-2 animate-fade-in">Feia</h1>
                      <p className="text-4xl md:text-5xl font-serif font-bold leading-tight animate-fade-in">
                        Ручная керамика<br />
                        <span className="text-pottery-warm">с душой</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Right Content */}
                  <div className="text-center">
                    <Link href="/catalog">
                      <Button size="lg" className="sage-gradient animate-fade-in pottery-shadow-hero text-lg px-8 py-3">
                        Каталог
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section 
        ref={aboutAnimation.elementRef}
        className={`py-16 bg-background transition-all duration-800 ${
          aboutAnimation.isVisible ? 'animate-fade-in-up' : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Main Team Photo */}
            <div className="lg:col-span-5">
              <img 
                src={teamMain}
                alt="Команда Feia в мастерской"
                className="w-full h-[600px] object-cover rounded-lg pottery-shadow"
              />
            </div>
            
            {/* Text Content */}
            <div className="lg:col-span-4 space-y-6">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-pottery-sage mb-4">
                  НАША КЕРАМИКА ДАРИТ НЕЗАБЫВАЕМЫЕ ЭМОЦИИ И ЛЮБОВЬ!
                </h2>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-red-500">❤️</span>
                  <span className="font-serif italic text-pottery-sage">Feia ceramica</span>
                </div>
              </div>
              
              <p className="text-foreground leading-relaxed text-center">
                Наш дизайн — это простые неровные формы и наивные рисунки, которые возвращают в детство, 
                когда мы рисовали как чувствовали, а не как правильно.
              </p>
            </div>
            
            {/* Photo Collage */}
            <div className="lg:col-span-3 space-y-4">
              <img 
                src={teamCollage1}
                alt="Люди с керамическими изделиями"
                className="w-full h-48 object-cover rounded-lg pottery-shadow"
              />
              <img 
                src={teamCollage2}
                alt="Выбор керамики с полки"
                className="w-full h-60 object-cover rounded-lg pottery-shadow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* New Products Section */}
      {newProducts.length > 0 && (
        <section 
          ref={newProductsAnimation.elementRef}
          className={`py-16 transition-all duration-800 ${
            newProductsAnimation.isVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Новинки</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Свежие поступления керамики, созданные с особой любовью и вниманием к деталям
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {newProducts.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            <div className="text-center">
              <Link href="/catalog">
                <Button variant="outline" size="lg">
                  Смотреть весь каталог
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section 
        ref={categoriesAnimation.elementRef}
        className={`py-16 bg-secondary transition-all duration-800 ${
          categoriesAnimation.isVisible ? 'animate-fade-in-up' : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">Категории</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg pottery-shadow mb-4">
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

      {/* CTA Section */}
      <section 
        ref={ctaAnimation.elementRef}
        className={`py-16 pottery-gradient transition-all duration-800 ${
          ctaAnimation.isVisible ? 'animate-fade-in-up' : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
            Создайте что-то особенное
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к нашим мастер-классам и научитесь создавать уникальную керамику своими руками
          </p>
          <Link href="/workshops">
            <Button size="lg" variant="secondary" className="pottery-shadow-hero">
              Записаться на мастер-класс
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
