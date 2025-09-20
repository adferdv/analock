import { languageEnglish, languageSpanish } from "../constants/constants";
import { englishTranslations } from "../translations/eng";
import { spanishTranslations } from "../translations/es";
import { getSettings } from "./storage.services";

export enum Language {
  English = languageEnglish,
  Spanish = languageSpanish,
}

export function getSetLanguageTranslations(): Translation {
  const userSettings = getSettings();
  return getTranslations(userSettings.general.language as Language);
}

export function getTranslations(language: Language): Translation {
  if (language === languageEnglish) {
    return englishTranslations;
  } else {
    return spanishTranslations;
  }
}
