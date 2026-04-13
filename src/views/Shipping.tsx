export default function Shipping() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-serif font-bold mb-8">Условия доставки</h1>
      <div className="prose max-w-4xl">
        <p className="text-lg text-muted-foreground mb-8">
          Информация о способах и условиях доставки керамических изделий.
        </p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">По Москве</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Курьерская доставка в пределах МКАД — 500₽</li>
            <li>Самовывоз из мастерской — бесплатно</li>
            <li>Доставка осуществляется в будние дни с 10:00 до 19:00</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">По России</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Почта России — от 400₽</li>
            <li>СДЭК — от 350₽</li>
            <li>Упаковка бесплатно</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Особенности</h2>
          <p className="text-muted-foreground leading-relaxed">
            Все изделия тщательно упакованы для безопасной транспортировки. 
            При получении обязательно проверьте целостность упаковки.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Контакты</h2>
          <p className="text-muted-foreground leading-relaxed">
            Вопросы по доставке: 
            <a href="tel:+79991234567" className="text-primary hover:underline ml-1">
              +7 (999) 123-45-67
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}