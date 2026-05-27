/** Адрес и режим работы гончарной мастерской «Фея». */
export const WORKSHOP_ADDRESS = {
  street: 'Звёздный проспект, 26',
  settlement: 'пос. Пригородный, Оренбургский район',
  region: 'Оренбургская область',
  floor: '2 этаж, мастерская «Фея»',
  full: 'Оренбургская область, Оренбургский район, пос. Пригородный, Звёздный проспект, 26',
} as const;

export const WORKSHOP_HOURS = {
  weekdaysLabel: 'Понедельник – Пятница',
  weekdays: '08:00 – 22:00',
  weekendLabel: 'Суббота – Воскресенье',
  weekend: '10:00 – 22:00',
} as const;

export type DeliveryMethodId =
  | 'cdek'
  | 'vozovoz'
  | 'pek'
  | 'courier_orenburg'
  | 'pickup_orenburg'
  | 'ozon';

export const DELIVERY_METHOD_OPTIONS: { value: DeliveryMethodId; label: string }[] = [
  { value: 'cdek', label: 'СДЭК' },
  { value: 'vozovoz', label: 'Возовоз' },
  { value: 'pek', label: 'ПЭК' },
  { value: 'courier_orenburg', label: 'Доставка курьером по Оренбургу' },
  { value: 'pickup_orenburg', label: 'Самовывоз из мастерской (Оренбург)' },
  { value: 'ozon', label: 'Ozon посылка' },
];
