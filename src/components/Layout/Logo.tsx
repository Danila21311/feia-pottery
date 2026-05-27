import { BRAND_NAME, LOGO_ALT, LOGO_SRC, USE_LOGO_IMAGE } from '@/lib/brand';
import { cn } from '@/lib/utils';

type LogoVariant = 'header' | 'footer';

const variantClass: Record<LogoVariant, { image: string; text: string }> = {
  header: {
    image: 'h-9 md:h-10',
    text: 'text-2xl',
  },
  footer: {
    image: 'h-10',
    text: 'text-2xl',
  },
};

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
}

export function Logo({ variant = 'header', className }: LogoProps) {
  const styles = variantClass[variant];

  if (USE_LOGO_IMAGE && LOGO_SRC) {
    return (
      <img
        src={LOGO_SRC}
        alt={LOGO_ALT}
        className={cn('w-auto max-w-[160px] object-contain object-left', styles.image, className)}
        decoding="async"
      />
    );
  }

  return (
    <span
      className={cn(
        'font-serif font-semibold text-primary leading-none',
        styles.text,
        className,
      )}
    >
      {BRAND_NAME}
    </span>
  );
}
