import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CheckoutSuccess() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <div className="space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold">Заказ успешно оформлен!</h1>
          <p className="text-lg text-muted-foreground">
            Спасибо за покупку в мастерской Feia
          </p>
        </div>

        {/* Order Info */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Что дальше?</h2>
            
            <div className="text-left space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-pottery-sage mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Подтверждение на почту</p>
                  <p className="text-sm text-muted-foreground">
                    На указанный email придет подтверждение заказа с деталями
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-pottery-sage mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Мы свяжемся с вами</p>
                  <p className="text-sm text-muted-foreground">
                    В течение 24 часов наш менеджер уточнит детали заказа
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <ShoppingBag className="w-5 h-5 text-pottery-sage mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Готовность заказа</p>
                  <p className="text-sm text-muted-foreground">
                    Изделия ручной работы готовятся 3-7 дней
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="bg-accent/50 rounded-lg p-6">
          <h3 className="font-semibold mb-2">Есть вопросы?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Свяжитесь с нами удобным способом
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" size="sm" asChild>
              <a href="tel:+7-495-123-45-67">
                <Phone className="w-4 h-4 mr-2" />
                +7 (495) 123-45-67
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:hello@feia.studio">
                <Mail className="w-4 h-4 mr-2" />
                hello@feia.studio
              </a>
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link to="/catalog">
              Продолжить покупки
            </Link>
          </Button>
          <Button asChild className="sage-gradient">
            <Link to="/">
              На главную
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}