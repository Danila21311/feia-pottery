/** Minimal underline fields — same language as `Contacts` form. */

export const minimalInputClass =
  'h-12 bg-transparent border-0 border-b border-foreground/35 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground';

export const minimalTextareaClass =
  'min-h-[100px] bg-transparent border-0 border-b border-foreground/35 rounded-none px-0 py-2 resize-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground';

export const minimalLabelRowClass = 'flex items-center justify-between text-sm';

export const minimalFormCardClass = 'shadow-none border-border/50 bg-card/40';

export const minimalSelectClass =
  'h-12 w-full bg-transparent border-0 border-b border-foreground/35 rounded-none px-0 py-2 text-sm shadow-none focus-visible:outline-none focus-visible:border-foreground';

/** Character limits for client-side enforcement (align server/DB separately if needed). */
export const FORM_LIMITS = {
  contactName: 40,
  contactEmail: 60,
  contactMessage: 300,
  giftRecipientName: 80,
  giftMessage: 400,
  giftCustomAmountDigits: 7,
  giftCustomAmountMax: 9_999_999,
  checkoutPersonName: 60,
  checkoutPhone: 32,
  checkoutEmail: 80,
  checkoutCity: 120,
  checkoutAddress: 500,
  checkoutComment: 500,
  checkoutLegalCompany: 200,
  checkoutLegalInn: 12,
  checkoutRecipientName: 80,
  authEmail: 254,
  authPassword: 128,
  authName: 80,
  profileName: 80,
  workshopName: 80,
  workshopComment: 300,
} as const;
