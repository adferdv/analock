import { DateData } from "react-native-calendars";
import { dayOfWeekSunday } from "../constants/constants";

const currentDate = new Date();

/**
 * Checks if dates are equal having only into account day, month and year.
 *
 * @param date1 the first date to compare
 * @param date2 the second date to compare
 * @returns a boolean indicating whether dates are equal
 */
export function areDatesEqual(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Function that checks if the given date is in the same week as the current.
 * @param date the date
 *
 * @returns a boolean indicating whether the given date is in the same week as the current.
 */
export function areDateWeeksEqual(
  date1: Date,
  date2: Date,
  userSettings: SettingsData,
): boolean {
  let firstDayOfWeekDate1;
  let firstDayOfWeekDate2;

  if (userSettings.preferences.firstDayOfWeek === dayOfWeekSunday) {
    firstDayOfWeekDate1 = getFirstDayOfWeekSunday(date1);
    firstDayOfWeekDate2 = getFirstDayOfWeekSunday(date2);
  } else {
    firstDayOfWeekDate1 = getFirstDayOfWeekMonday(date1);
    firstDayOfWeekDate2 = getFirstDayOfWeekMonday(date2);
  }

  return firstDayOfWeekDate1 === firstDayOfWeekDate2;
}

/**
 * Gets the week of the year of a date.
 *
 * @param date the date to get the week of the year from
 * @returns a number indicating the week of the year of the date
 */
export function getWeekOfYear(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Converts a Date object in a DateData object
 *
 *  @param date the date to be converted
 *  @returns the DateData object
 */
export function dateToDateData(date: Date): DateData {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDay(),
    dateString: date.toDateString(),
    timestamp: date.valueOf(),
  };
}

/**
 * Converts a DateData object in a Date object
 *
 * @param dateData the DateData object to be converted
 * @returns the Date object
 */
export function timestampToDate(timestamp: number): Date {
  return new Date(timestamp);
}

/**
 * Gets the marked date string format from a date
 * @param date the date
 * @returns the marked date string format
 */
export function getMarkedDateFormatFromDate(date: Date): string {
  const formattedMonth = (date.getMonth() + 1).toString().padStart(2, "0");
  const formattedDate = date.getDate().toString().padStart(2, "0");
  return `${date.getFullYear()}-${formattedMonth}-${formattedDate}`;
}

/**
 * Gets the date format to be displayed on the app for the given date
 *
 *  @param date the date to be formatted
 *  @returns the formatted date string
 */
export function getDisplayDateFormatFromDate(
  date: number,
  translations: Translation,
): string {
  emptyDateTime(currentDate);
  if (currentDate.valueOf() !== date) {
    return new Date(date).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } else {
    return translations.diary.today;
  }
}

/**
 * Sets the time of a date to cero
 * @param date the date
 */
export function emptyDateTime(date: Date): void {
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
}

export function getDayOfWeekTranslation(
  index: number,
  selectedTranslation: Translation,
): string {
  const dateTranslations = selectedTranslation.general.daysOfWeek;
  if (index === 0) {
    return dateTranslations.sunday;
  } else if (index === 1) {
    return dateTranslations.monday;
  } else if (index === 2) {
    return dateTranslations.tuesday;
  } else if (index === 3) {
    return dateTranslations.wednesday;
  } else if (index === 4) {
    return dateTranslations.thursday;
  } else if (index === 5) {
    return dateTranslations.friday;
  } else {
    return dateTranslations.saturday;
  }
}

/**
 * Gets the current week's first sunday month day
 *
 * @param date the date to get its first day of week
 * @returns the first week sunday month day
 */
export function getFirstDayOfWeekSunday(date: Date): number {
  const firstDayOfWeek = date.getDate() - date.getDay();
  return firstDayOfWeek;
}

/**
 * Gets the current week's first monday month day
 *
 * @param date the date to get its first day of week
 * @returns the first week sunday month day
 */
export function getFirstDayOfWeekMonday(date: Date): number {
  const firstDayOfWeek =
    date.getDate() - date.getDay() + (date.getDay() == 0 ? -6 : 1);

  return firstDayOfWeek;
}
