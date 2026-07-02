// Third-party Imports
import 'server-only'

// Type Imports
import type { Locale } from '@configs/i18n'

const dictionaries = {
  pt: () => import('@/data/dictionaries/pt.json').then(module => module.default),
  en: () => import('@/data/dictionaries/en.json').then(module => module.default),
  fr: () => import('@/data/dictionaries/fr.json').then(module => module.default),
  ar: () => import('@/data/dictionaries/ar.json').then(module => module.default)
}

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
