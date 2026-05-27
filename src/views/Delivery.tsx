import { MapPin, Clock } from 'lucide-react';
import { WORKSHOP_ADDRESS, WORKSHOP_HOURS } from '@/lib/workshopInfo';

export default function Delivery() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-serif font-bold mb-8">Доставка и оплата</h1>
      <div className="prose max-w-4xl">
        <p className="text-lg text-muted-foreground mb-8">
          Условия доставки керамических изделий, способы оплаты и информация о самовывозе из мастерской.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Адрес мастерской</h2>
          <div className="flex items-start gap-3 text-muted-foreground not-prose">
            <MapPin className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="space-y-1 text-sm leading-relaxed">
              <p>{WORKSHOP_ADDRESS.street}</p>
              <p>{WORKSHOP_ADDRESS.settlement}</p>
              <p>{WORKSHOP_ADDRESS.region}</p>
              <p>{WORKSHOP_ADDRESS.floor}</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Часы работы</h2>
          <div className="flex items-start gap-3 text-muted-foreground not-prose">
            <Clock className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 max-w-md">
                <span>{WORKSHOP_HOURS.weekdaysLabel}</span>
                <span>{WORKSHOP_HOURS.weekdays}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 max-w-md">
                <span>{WORKSHOP_HOURS.weekendLabel}</span>
                <span>{WORKSHOP_HOURS.weekend}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Способы доставки</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Самовывоз из мастерской в пос. Пригородный — бесплатно</li>
            <li>Курьерская доставка по г. Оренбургу — по согласованию с менеджером</li>
            <li>Доставка по Оренбургской области — СДЭК, ПЭК, Возовоз</li>
            <li>Доставка по России — СДЭК, ПЭК, Возовоз, Ozon посылка</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Сроки доставки</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>по г. Оренбургу — 1–2 рабочих дня</li>
            <li>по Оренбургской области — 2–4 рабочих дня</li>
            <li>по России — 5–14 рабочих дней</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Способы оплаты</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>по согласованию с менеджером после подтверждения заявки</li>
            <li>наличными при получении или самовывозе</li>
            <li>банковским переводом</li>
            <li>переводом на карту</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Упаковка и получение</h2>
          <p className="text-muted-foreground leading-relaxed">
            Все изделия тщательно упаковываются для безопасной транспортировки. При получении
            проверьте целостность упаковки. Доставка транспортными компаниями осуществляется в
            рабочие часы мастерской или по согласованному с менеджером времени.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Возврат и обмен</h2>
          <p className="text-muted-foreground leading-relaxed">
            Изделия ручной работы не подлежат возврату, кроме случаев брака или повреждений при
            транспортировке.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Связь с нами</h2>
          <p className="text-muted-foreground leading-relaxed">
            Вопросы по доставке и оплате —
            <a href="mailto:hello@feia.studio" className="text-primary hover:underline ml-1">
              hello@feia.studio
            </a>
            {' '}
            или
            <a href="tel:+79991234567" className="text-primary hover:underline ml-1">
              +7 (999) 123-45-67
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
