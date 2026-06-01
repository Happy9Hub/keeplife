import 'server-only';
import type { Locale } from './i18n';

// 1. Tell TypeScript to read the JSON file and create a type from it
import enDictionary from '../../dictionaries/en.json';
export type Dictionary = typeof enDictionary;

// 2. The dynamic imports
const dictionaries = {
  en: () => import('../../dictionaries/en.json').then((module) => module.default),
  th: () => import('../../dictionaries/th.json').then((module) => module.default),
};

// 3. The fetch function (now returning our mapped Promise type)
export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  return dictionaries[locale]?.() ?? dictionaries.en();
};