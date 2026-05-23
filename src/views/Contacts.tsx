'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { api, ApiError } from '@/lib/api';
import { FORM_LIMITS, minimalInputClass, minimalLabelRowClass, minimalTextareaClass } from '@/lib/formFieldStyles';
import heroImage from '@/assets/contact-display.jpg';
import imageOne from '@/assets/category-sets.jpg';
import imageTwo from '@/assets/category-pots.jpg';
import imageThree from '@/assets/category-dishes.jpg';
import imageFour from '@/assets/category-decor.jpg';
import { useParallaxBanner } from '@/hooks/useParallaxBanner';

export default function Contacts() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselDragRef = useRef({
    active: false,
    pointerId: 0,
    startX: 0,
    startScroll: 0,
  });
  const nameLimit = FORM_LIMITS.contactName;
  const emailLimit = FORM_LIMITS.contactEmail;
  const messageLimit = FORM_LIMITS.contactMessage;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const galleryImages = [imageOne, imageTwo, imageThree, imageFour];
  const { containerRef: contactHeroRef, imageStyle: contactHeroParallaxStyle } =
    useParallaxBanner<HTMLElement>(0.26, 1.1);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    let animationFrame = 0;
    let isPaused = false;
    let lastTime = performance.now();
    const speedPxPerMs = 0.06;

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused && !carouselDragRef.current.active) {
        carousel.scrollLeft += delta * speedPxPerMs;
        const loopWidth = carousel.scrollWidth / 2;

        if (carousel.scrollLeft >= loopWidth) {
          carousel.scrollLeft -= loopWidth;
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    const pause = () => {
      isPaused = true;
    };

    const resume = () => {
      isPaused = false;
    };

    carousel.addEventListener('touchstart', pause, { passive: true });
    carousel.addEventListener('touchend', resume);

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      carousel.removeEventListener('touchstart', pause);
      carousel.removeEventListener('touchend', resume);
    };
  }, []);

  const handleCarouselPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = carouselRef.current;
    if (!el) return;
    if (e.pointerType === 'touch') return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const d = carouselDragRef.current;
    d.active = true;
    d.pointerId = e.pointerId;
    d.startX = e.clientX;
    d.startScroll = el.scrollLeft;
    el.classList.add('cursor-grabbing');
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const handleCarouselPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = carouselRef.current;
    const d = carouselDragRef.current;
    if (!el || !d.active || e.pointerId !== d.pointerId) return;
    el.scrollLeft = d.startScroll - (e.clientX - d.startX);
  };

  const endCarouselDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = carouselRef.current;
    const d = carouselDragRef.current;
    if (!d.active || e.pointerId !== d.pointerId) return;
    d.active = false;
    el?.classList.remove('cursor-grabbing');
    try {
      el?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createFeedback({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        source: 'contacts_form',
      });

      toast({
        title: "Сообщение отправлено!",
        description: "Мы сохранили обращение. Если настроен Telegram, менеджер получит уведомление.",
      });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      const description =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Не удалось отправить сообщение';
      toast({
        title: "Ошибка",
        description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background">
      <section ref={contactHeroRef} className="relative overflow-hidden">
        <img
          src={heroImage.src}
          alt="Керамика в мастерской Фея"
          className="w-full h-[42vh] min-h-[300px] max-h-[420px] object-cover origin-center"
          style={contactHeroParallaxStyle}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-6 md:px-12 text-white text-center">
            <p className="uppercase tracking-[0.2em] text-xs md:text-sm text-white/80 mb-4">
              Контакты
            </p>
            <h1 className="text-4xl md:text-6xl font-serif font-medium leading-tight">
              Фея
            </h1>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-center mb-4">Свяжитесь с нами</h2>
            <p className="text-center text-muted-foreground text-base md:text-lg mb-12">
              Есть вопрос по заказу или мастер-классам? Заполни форму, и мы скоро ответим.
            </p>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className={minimalLabelRowClass}>
                    <label className="text-muted-foreground">Имя</label>
                    <span className="text-muted-foreground/80">{formData.name.length}/{nameLimit}</span>
                  </div>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    maxLength={nameLimit}
                    required
                    className={minimalInputClass}
                  />
                </div>
                <div className="space-y-3">
                  <div className={minimalLabelRowClass}>
                    <label className="text-muted-foreground">Почта *</label>
                    <span className="text-muted-foreground/80">{formData.email.length}/{emailLimit}</span>
                  </div>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    maxLength={emailLimit}
                    required
                    className={minimalInputClass}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className={minimalLabelRowClass}>
                  <label className="text-muted-foreground">Сообщение</label>
                  <span className="text-muted-foreground/80">{formData.message.length}/{messageLimit}</span>
                </div>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  maxLength={messageLimit}
                  required
                  className={minimalTextareaClass}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="sage-gradient uppercase tracking-wide px-10 h-11">
                {isSubmitting ? 'Отправка...' : 'Отправить'}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-4 md:py-8">
        <div>
          <div
            ref={carouselRef}
            onPointerDown={handleCarouselPointerDown}
            onPointerMove={handleCarouselPointerMove}
            onPointerUp={endCarouselDrag}
            onPointerCancel={endCarouselDrag}
            className="flex cursor-grab gap-5 overflow-x-auto pb-4 pr-6 select-none md:pr-12 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', touchAction: 'pan-x pinch-zoom' }}
          >
            {[...galleryImages, ...galleryImages].map((image, index) => (
              <div key={`${image.src}-${index}`} className="shrink-0 w-[72vw] sm:w-[46vw] lg:w-[31vw] aspect-square overflow-hidden">
                <img
                  src={image.src}
                  alt={`Керамика Фея ${index + 1}`}
                  className="pointer-events-none h-full w-full object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}