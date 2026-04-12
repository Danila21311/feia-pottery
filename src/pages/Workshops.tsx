'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { api, Workshop as ApiWorkshop } from '@/lib/api';
import teamMain from '@/assets/team-main.jpg';
import teamCollage1 from '@/assets/team-collage-1.jpg';
import teamCollage2 from '@/assets/team-collage-2.jpg';

interface Workshop {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  format: string;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  description: string;
  includes: string[];
  level: string;
}

export default function Workshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    comment: ''
  });

  useEffect(() => {
    api.getWorkshops().then((items) => {
      setWorkshops(items as unknown as Workshop[]);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const handleRegister = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    // Create mailto link
    const subject = `Запись на мастер-класс: ${selectedWorkshop?.title}`;
    const body = `Здравствуйте! Хочу записаться на мастер-класс.

Мастер-класс: ${selectedWorkshop?.title}
Дата: ${selectedWorkshop?.date}
Время: ${selectedWorkshop?.time}

Мои контактные данные:
Имя: ${formData.name}
Телефон: ${formData.phone}
Email: ${formData.email}

${formData.comment ? `Комментарий: ${formData.comment}` : ''}`;

    window.location.href = `mailto:hello@feia.studio?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    toast({
      title: "Заявка отправлена!",
      description: "Мы свяжемся с вами в ближайшее время",
    });

    // Reset form
    setFormData({ name: '', phone: '', email: '', comment: '' });
    setIsModalOpen(false);
  };

  const getAvailableSpots = (workshop: Workshop) => {
    return workshop.maxParticipants - workshop.currentParticipants;
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'По договоренности') return dateString;
    return new Date(dateString).toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold mb-4">Мастер-классы</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Откройте для себя удивительный мир керамики. Научитесь создавать уникальные изделия своими руками 
          под руководством опытных мастеров.
        </p>
      </div>

      {/* Workshop Atmosphere Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
        <div className="md:col-span-2">
          <img 
            src={teamMain.src}
            alt="Мастерская Feia — атмосфера творчества"
            className="w-full h-72 md:h-80 object-cover rounded-lg pottery-shadow"
          />
        </div>
        <div className="space-y-4">
          <img 
            src={teamCollage1.src}
            alt="Участники мастер-класса за работой"
            className="w-full h-[calc(50%-0.5rem)] object-cover rounded-lg pottery-shadow"
          />
          <img 
            src={teamCollage2.src}
            alt="Готовые керамические изделия"
            className="w-full h-[calc(50%-0.5rem)] object-cover rounded-lg pottery-shadow"
          />
        </div>
      </div>

      {/* Workshops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {workshops.map((workshop) => {
          const availableSpots = getAvailableSpots(workshop);
          
          return (
            <Card key={workshop.id} className="pottery-card">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-serif">{workshop.title}</CardTitle>
                  <Badge variant={workshop.level === 'Начинающий' ? 'secondary' : 'default'}>
                    {workshop.level}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{workshop.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Workshop Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-pottery-sage font-medium">Дата:</span>
                    <span>{formatDate(workshop.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-pottery-sage font-medium">Время:</span>
                    <span>{workshop.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-pottery-sage font-medium">Формат:</span>
                    <span>{workshop.format}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-pottery-sage font-medium">Длит.:</span>
                    <span>{workshop.duration}</span>
                  </div>
                </div>

                {/* What's Included */}
                <div>
                  <h4 className="font-medium mb-2">Что входит в стоимость:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {workshop.includes.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-pottery-sage rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price and Availability */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <div className="text-2xl font-bold text-pottery-sage">
                      {workshop.price.toLocaleString()}₽
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {availableSpots > 0 ? (
                        `Свободных мест: ${availableSpots}`
                      ) : (
                        <span className="text-destructive">Мест нет</span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleRegister(workshop)}
                    disabled={availableSpots === 0}
                    className="sage-gradient"
                  >
                    {availableSpots === 0 ? 'Нет мест' : 'Записаться'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="relative bg-background rounded-lg p-6 w-full max-w-md mx-4 pottery-shadow-hero">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Запись на мастер-класс</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-4 p-3 bg-accent/50 rounded-lg">
              <h4 className="font-medium">{selectedWorkshop?.title}</h4>
              <p className="text-sm text-muted-foreground">
                {formatDate(selectedWorkshop?.date || '')} в {selectedWorkshop?.time}
              </p>
              <p className="text-sm font-semibold text-pottery-sage">
                {selectedWorkshop?.price.toLocaleString()}₽
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Имя *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ваше имя"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Телефон *
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+7 (999) 123-45-67"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Комментарий
                </label>
                <Textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Дополнительные пожелания или вопросы"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button type="submit" className="flex-1 sage-gradient">
                  Отправить заявку
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}