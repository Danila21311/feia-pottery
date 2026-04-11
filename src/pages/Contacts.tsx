import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function Contacts() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    const subject = formData.subject || 'Сообщение с сайта Feia';
    const body = `Здравствуйте!

${formData.message}

---
Отправитель: ${formData.name}
Email: ${formData.email}`;

    window.location.href = `mailto:hello@feia.studio?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    toast({
      title: "Сообщение отправлено!",
      description: "Мы свяжемся с вами в ближайшее время",
    });

    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Адрес',
      content: 'Звёздный проспект, 26, 2 этаж',
      subtitle: 'Мастерская Feia',
      action: null
    },
    {
      icon: Phone,
      title: 'Телефон',
      content: '+7 (999) 123-45-67',
      subtitle: 'Ежедневно с 10:00 до 20:00',
      action: 'tel:+79991234567'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'hello@feia.studio',
      subtitle: 'Отвечаем в течение дня',
      action: 'mailto:hello@feia.studio'
    },
    {
      icon: Clock,
      title: 'Часы работы',
      content: 'Пн-Вс: 10:00 - 20:00',
      subtitle: 'Без выходных',
      action: null
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold mb-4">Контакты</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Приходите к нам в гости или свяжитесь любым удобным способом. 
          Мы всегда рады ответить на ваши вопросы и помочь с выбором.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-serif font-semibold mb-6">Как с нами связаться</h2>
          
          <div className="space-y-4 mb-8">
            {contactInfo.map((info, index) => (
              <Card key={index} className="pottery-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-pottery-sage rounded-full flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{info.title}</h3>
                      {info.action ? (
                        <a
                          href={info.action}
                          className="text-pottery-sage hover:text-pottery-sageLight transition-colors font-medium"
                        >
                          {info.content}
                        </a>
                      ) : (
                        <p className="font-medium">{info.content}</p>
                      )}
                      {info.subtitle && (
                        <p className="text-sm text-muted-foreground">{info.subtitle}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Map */}
          <Card className="pottery-card">
            <CardHeader>
              <CardTitle>Как нас найти</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-accent rounded-lg overflow-hidden h-64">
                <iframe
                  src="https://yandex.ru/map-widget/v1/?um=constructor%3A4d9e67fa3c5b20557f3ba27e918b406b925ff9a95c98acf96b38b531d34c76ac&amp;source=constructor"
                  width="100%"
                  height="256"
                  frameBorder="0"
                  title="Карта Feia"
                  className="w-full h-full"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-serif font-semibold mb-6">Напишите нам</h2>
          
          <Card className="pottery-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-pottery-sage" />
                Форма обратной связи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Тема сообщения
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="О чем хотите спросить?"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Сообщение *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Напишите ваше сообщение..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full sage-gradient" size="lg">
                  <Send className="w-4 h-4 mr-2" />
                  Отправить сообщение
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-pottery-warm rounded-lg">
            <h3 className="font-serif font-semibold mb-2">Приходите к нам в мастерскую!</h3>
            <p className="text-sm text-muted-foreground">
              Мы находимся в самом центре Москвы. Вы можете посетить нашу мастерскую, 
              посмотреть на процесс создания керамики и выбрать изделия вживую. 
              Предварительная запись не требуется.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}