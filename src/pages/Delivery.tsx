export default function Delivery() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-serif font-bold mb-8">Доставка и оплата</h1>
      <div className="prose max-w-4xl">
        <p className="text-lg text-muted-foreground mb-8">
          Удобные способы оплаты и доставки для вашего комфорта.
        </p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Способы оплаты</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Банковской картой онлайн</li>
            <li>Наличными при получении</li>
            <li>Банковским переводом</li>
            <li>Электронными деньгами</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Сроки доставки</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>По Москве — 1-2 рабочих дня</li>
            <li>Московская область — 2-3 рабочих дня</li>
            <li>По России — 5-14 рабочих дней</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Возврат и обмен</h2>
          <p className="text-muted-foreground leading-relaxed">
            Изделия ручной работы не подлежат возврату, кроме случаев брака или 
            повреждений при транспортировке.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Связь с нами</h2>
          <p className="text-muted-foreground leading-relaxed">
            Есть вопросы? Напишите нам: 
            <a href="mailto:hello@feia.studio" className="text-primary hover:underline ml-1">
              hello@feia.studio
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}