/** Настройки бренда и логотипа. Замените public/logo.svg на свой SVG или укажите другой путь. */
export const BRAND_NAME = 'Фея';

/** Путь к SVG в public/ или полный URL. Пустая строка — показывать текст BRAND_NAME. */
export const LOGO_SRC = process.env.NEXT_PUBLIC_LOGO_SRC ?? '/logo.svg';

/** true — изображение логотипа, false — текстовое название */
export const USE_LOGO_IMAGE = process.env.NEXT_PUBLIC_LOGO_MODE !== 'text';

export const LOGO_ALT = process.env.NEXT_PUBLIC_LOGO_ALT ?? BRAND_NAME;
