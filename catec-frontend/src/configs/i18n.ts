export const i18n = {
  defaultLocale: 'pt',
  locales: ['pt', 'en', 'fr', 'ar'],
  langDirection: {
    pt: 'ltr',
    en: 'ltr',
    fr: 'ltr',
    ar: 'rtl'
  }
} as const

export type Locale = (typeof i18n)['locales'][number]
