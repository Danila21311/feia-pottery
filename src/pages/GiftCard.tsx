import { useState } from 'react';
import { Gift, Heart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/context/StoreContext';
import { toast } from '@/hooks/use-toast';

export default function GiftCard() {
  const { dispatch } = useStore();
  const [selectedAmount, setSelectedAmount] = useState(3000);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');

  const predefinedAmounts = [1000, 3000, 5000, 10000];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseInt(value);
    if (numValue && numValue > 0) {
      setSelectedAmount(numValue);
    }
  };

  const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;

  const handleAddToCart = () => {
    if (!recipientName.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, укажите имя получателя",
        variant: "destructive",
      });
      return;
    }

    if (!finalAmount || finalAmount < 500) {
      toast({
        title: "Ошибка", 
        description: "Минимальная сумма сертификата 500₽",
        variant: "destructive",
      });
      return;
    }

    const giftCard = {
      id: `gift-card-${Date.now()}`,
      type: 'giftCard' as const,
      amount: finalAmount,
      recipientName: recipientName.trim(),
      message: message.trim(),
      quantity: 1,
    };

    dispatch({ type: 'ADD_TO_CART', payload: giftCard });
    
    toast({
      title: "Добавлено в корзину!",
      description: `Сертификат на ${finalAmount}₽ для ${recipientName}`,
    });

    // Reset form
    setRecipientName('');
    setMessage('');
    setSelectedAmount(3000);
    setCustomAmount('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-pottery-sage rounded-full flex items-center justify-center mx-auto mb-6">
          <Gift className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-serif font-bold mb-4">Подарочные сертификаты</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Подарите возможность выбрать уникальную керамику или записаться на мастер-класс. 
          Идеальный подарок для ценителей прекрасного.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Gift Card Configuration */}
        <div>
          <Card className="pottery-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pottery-sage" />
                Оформление сертификата
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Выберите номинал сертификата
                </label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {predefinedAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount && !customAmount ? "default" : "outline"}
                      onClick={() => handleAmountSelect(amount)}
                      className={selectedAmount === amount && !customAmount ? "sage-gradient" : ""}
                    >
                      {amount.toLocaleString()}₽
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Или укажите свою сумму</label>
                  <Input
                    type="number"
                    placeholder="Введите сумму"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    min="500"
                  />
                </div>
              </div>

              {/* Recipient Info */}
              <div>
                <label htmlFor="recipient" className="text-sm font-medium mb-2 block">
                  Имя получателя *
                </label>
                <Input
                  id="recipient"
                  placeholder="Введите имя получателя"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>

              {/* Personal Message */}
              <div>
                <label htmlFor="message" className="text-sm font-medium mb-2 block">
                  Персональное пожелание (опционально)
                </label>
                <Textarea
                  id="message"
                  placeholder="Напишите теплые слова получателю..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full sage-gradient"
                size="lg"
              >
                Добавить в корзину {finalAmount ? `(${finalAmount.toLocaleString()}₽)` : ''}
              </Button>
            </CardContent>
          </Card>

          {/* How it works */}
          <Card className="mt-6 pottery-card">
            <CardHeader>
              <CardTitle>Как это работает?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-pottery-sage text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-medium mb-1">Оформите сертификат</h4>
                  <p className="text-sm text-muted-foreground">Выберите сумму и укажите получателя</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-pottery-sage text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-medium mb-1">Получите сертификат</h4>
                  <p className="text-sm text-muted-foreground">Электронный сертификат придет на email</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-pottery-sage text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-medium mb-1">Используйте</h4>
                  <p className="text-sm text-muted-foreground">На покупки или мастер-классы в течение года</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gift Card Preview */}
        <div>
          <h3 className="text-xl font-serif font-semibold mb-6">Предпросмотр сертификата</h3>
          <div className="pottery-gradient rounded-lg p-8 text-white pottery-shadow-hero">
            <div className="text-center">
              <h2 className="text-3xl font-serif font-bold mb-2">Feia</h2>
              <p className="text-white/90 mb-6">Подарочный сертификат</p>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 mb-6">
                <div className="text-4xl font-bold mb-2">
                  {finalAmount ? finalAmount.toLocaleString() : '0'}₽
                </div>
                <p className="text-white/80 text-sm">
                  на покупки в мастерской или мастер-классы
                </p>
              </div>

              <div className="text-left bg-white/10 rounded-lg p-4 mb-4">
                <p className="text-sm text-white/80 mb-1">Получатель:</p>
                <p className="font-medium">
                  {recipientName || 'Имя получателя'}
                </p>
                {message && (
                  <>
                    <p className="text-sm text-white/80 mt-3 mb-1">Пожелание:</p>
                    <p className="text-sm italic">"{message}"</p>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center text-sm text-white/60">
                <span>Действителен до: {new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('ru-RU')}</span>
                <span>№ {Date.now()}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-pottery-sage mt-0.5 flex-shrink-0" />
              <span>Сертификат действителен в течение года с момента покупки</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-pottery-sage mt-0.5 flex-shrink-0" />
              <span>Можно использовать частично, остаток сохраняется</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-pottery-sage mt-0.5 flex-shrink-0" />
              <span>Подходит для покупки товаров и записи на мастер-классы</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}