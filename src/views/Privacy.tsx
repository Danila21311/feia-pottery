export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-serif font-bold mb-8">Политика конфиденциальности</h1>
      <div className="prose max-w-4xl">
        <p className="text-lg text-muted-foreground mb-8">
          Мы уважаем вашу конфиденциальность и стремимся защитить ваши личные данные.
        </p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Сбор информации</h2>
          <p className="text-muted-foreground leading-relaxed">
            Мы собираем только ту информацию, которая необходима для обработки ваших заказов 
            и улучшения качества обслуживания.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Использование данных</h2>
          <p className="text-muted-foreground leading-relaxed">
            Ваши персональные данные используются исключительно для обработки заказов, 
            связи с вами и улучшения нашего сервиса.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Контакты</h2>
          <p className="text-muted-foreground leading-relaxed">
            По вопросам обработки персональных данных обращайтесь: 
            <a href="mailto:hello@feia.studio" className="text-primary hover:underline ml-1">
              hello@feia.studio
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}