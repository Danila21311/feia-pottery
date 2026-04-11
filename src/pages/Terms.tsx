export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-serif font-bold mb-8">Публичная оферта</h1>
      <div className="prose max-w-4xl">
        <p className="text-lg text-muted-foreground mb-8">
          Условия продажи изделий гончарной мастерской "Feia".
        </p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Общие положения</h2>
          <p className="text-muted-foreground leading-relaxed">
            Настоящая публичная оферта определяет условия продажи керамических изделий 
            ручной работы мастерской "Feia".
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Заказ и оплата</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Заказ считается принятым после получения подтверждения от мастерской</li>
            <li>Оплата производится удобным для покупателя способом</li>
            <li>Цены указаны в российских рублях</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Контакты</h2>
          <p className="text-muted-foreground leading-relaxed">
            По всем вопросам обращайтесь: 
            <a href="mailto:hello@feia.studio" className="text-primary hover:underline ml-1">
              hello@feia.studio
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}