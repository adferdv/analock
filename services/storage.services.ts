import { MMKV, Mode } from "react-native-mmkv";
import { APP_DOCUMENTS_PATH } from "./download.services";
import { GameData, GamesData, TTFEGameData } from "../types/game";
import { SudokuGrid } from "../components/Sudoku";
import { BookStorageData } from "../components/EPUBReader";
import {
  dayOfWeekSunday,
  fontFamilySerif,
  fontSizeMedium,
  sudokuGameName,
  ttfeGameName,
  localeFirstDayOfWeekMap,
} from "../constants/constants";
import { getLocales } from "react-native-localize";

export type StorageData =
  | GamesData
  | StorageBook
  | BookStorageData
  | DiaryEntry
  | UserData
  | SettingsData;

const storageInstance = new MMKV({
  id: `analock-storage`,
  path: APP_DOCUMENTS_PATH,
  encryptionKey: process.env.LOCAL_STORAGE_KEY,
  mode: Mode.SINGLE_PROCESS,
});

const USER_DATA_STORAGE_KEY = "userData";
const AUTH_DATA_STORAGE_KEY = "authData";
const BOOKS_DATA_STORAGE_KEY = "bookData";
const BOOKS_STORAGE_KEY = "books";
const GAMES_DATA_STORAGE_KEY = "gameData";
const SETTINGS_STORAGE_KEY = "settings";
const DEFAULT_USER_DATA: UserData = {
  userId: -1,
  authenticated: false,
};

// USER DATA FUNCTIONS

/**
 * Gets the locally stored user data
 *
 * @returns the stored user data or the default user data if there is no user data stored
 */
export function getStorageUserData(): UserData {
  let userData: UserData;
  const userDataString = storageInstance.getString(USER_DATA_STORAGE_KEY);

  if (userDataString !== undefined) {
    userData = JSON.parse(userDataString) as UserData;
    console.log(`Loaded user data: ${userDataString}`);
  } else {
    userData = DEFAULT_USER_DATA;
    console.log("No user data was saved. Loading default data...");
  }

  return userData;
}

/**
 * Sets the value of the locally stored user data.
 *
 * @param userData the user data to be stored
 */
export function setStorageUserData(userData: UserData): void {
  storageInstance.set(USER_DATA_STORAGE_KEY, JSON.stringify(userData));
}

// AUTH DATA FUNCTIONS

/**
 * Gets authentication data from storage.
 *
 * @returns the stored authentication data
 */
export function getStorageAuthData(): StorageAuthData | undefined {
  let authData: StorageAuthData | undefined;
  const authDataString = storageInstance.getString(AUTH_DATA_STORAGE_KEY);

  if (authDataString !== undefined) {
    authData = JSON.parse(authDataString) as StorageAuthData;
  }

  return authData;
}

/**
 * Sets the value of the locally stored authentication data.
 *
 * @param authData the authentication data to be stored
 */
export function setStorageAuthData(authData: StorageAuthData): void {
  storageInstance.set(AUTH_DATA_STORAGE_KEY, JSON.stringify(authData));
}

// SELECTED BOOKS FUNCTIONS

/**
 * Gets the locally stored selected books for the current period.
 *
 * @returns the stored selected books
 */
export function getSelectedBooks(): InternetArchiveBook[] {
  let selectedBooks: InternetArchiveBook[] = [];
  const selectedBooksString = storageInstance.getString(BOOKS_STORAGE_KEY);

  if (selectedBooksString) {
    selectedBooks = JSON.parse(selectedBooksString) as InternetArchiveBook[];
  }

  return selectedBooks;
}

/**
 * Stores the selected books for the current period.
 *
 * @param selectedBooks the selected books to be stored
 */
export function setSelectedBooks(selectedBooks: InternetArchiveBook[]): void {
  storageInstance.set(BOOKS_STORAGE_KEY, JSON.stringify(selectedBooks));
}

// BOOK DATA FUNCTIONS

/**
 * Gets from local storage the stored book data from all books.
 *
 * @returns the stored book data or undefined, if no data was stored
 */
export function getStorageBooks(): StorageBook[] {
  let books: StorageBook[] = [];
  const bookString = storageInstance.getString(BOOKS_DATA_STORAGE_KEY);

  if (bookString) {
    books = JSON.parse(bookString) as StorageBook[];
  }

  return books;
}

/**
 * Gets from local storage the stored book data for the book whose identifier matches with the id passed by parameter.
 *
 * @param bookId the book identifier to get the book data from
 */
export function getStorageBookData(
  bookId: string,
): StorageBookData | undefined {
  let bookData: StorageBookData | undefined;
  const books = getStorageBooks();

  if (books) {
    const selectedBook = books.find(
      (selectedBook) => selectedBook.id === bookId,
    );

    if (selectedBook) {
      bookData = selectedBook.data;
    }
  }

  return bookData;
}

/**
 * Adds a new book data to the stored ones.
 *
 * @param book the book data to be stored
 */
export function updateStorageBookData(book: StorageBook): void {
  const books = getStorageBooks();
  if (books) {
    const bookToBeUpdatedIndex = books?.findIndex(
      (storageBook) => storageBook.id === book.id,
    );
    books[bookToBeUpdatedIndex].data = book.data;
    storageInstance.set(BOOKS_DATA_STORAGE_KEY, JSON.stringify(books));
  }
}

/**
 * Sets the locally stored book data passed by parameter.
 *
 *@param books the book data to be stored
 */
export function setStorageBook(books: StorageBook[]): void {
  storageInstance.set(BOOKS_DATA_STORAGE_KEY, JSON.stringify(books));
}

// GAME STORAGE

export function getStorageGamesData(): GamesData[] {
  const gameDataString = storageInstance.getString(GAMES_DATA_STORAGE_KEY);
  let gameData: GamesData[] | undefined;

  if (gameDataString) {
    gameData = JSON.parse(gameDataString) as GamesData[];
  } else {
    gameData = [
      { name: sudokuGameName, won: false },
      { name: ttfeGameName, won: false },
    ];
  }

  return gameData;
}

export function setStorageGamesData(gameData: GamesData[]): void {
  storageInstance.set(GAMES_DATA_STORAGE_KEY, JSON.stringify(gameData));
}

export function saveGamesData(gameData: GamesData): void {
  if (gameData.data) {
    if (isSudokuGrid(gameData.data)) {
      saveStorageGamesSudoku(gameData);
    } else if (isTTFEGameData(gameData.data)) {
      saveStorageGamesTTFE(gameData);
    }
  }
}

export function saveStorageGamesSudoku(gameData: GamesData) {
  const currentGameData = getStorageGamesData();
  const currentSudokuGameDataIndex = currentGameData?.findIndex(
    (data) => data.name === sudokuGameName,
  );

  if (currentGameData !== undefined) {
    if (
      currentSudokuGameDataIndex !== undefined &&
      currentSudokuGameDataIndex !== -1
    ) {
      (currentGameData[currentSudokuGameDataIndex].data as SudokuGrid) =
        gameData.data as SudokuGrid;
      currentGameData[currentSudokuGameDataIndex].won = gameData.won;
      setStorageGamesData(currentGameData);
    } else {
      currentGameData.push(gameData);
      setStorageGamesData(currentGameData);
    }
  } else {
    setStorageGamesData([gameData]);
  }
}

export function saveStorageGamesTTFE(gameData: GamesData) {
  const currentGameData = getStorageGamesData();
  const currentTTFEGameDataIndex = currentGameData?.findIndex(
    (data) => data.name === ttfeGameName,
  );

  if (currentGameData !== undefined) {
    if (
      currentTTFEGameDataIndex !== undefined &&
      currentTTFEGameDataIndex !== -1
    ) {
      (currentGameData[currentTTFEGameDataIndex].data as SudokuGrid) =
        gameData.data as SudokuGrid;
      currentGameData[currentTTFEGameDataIndex].won = gameData.won;
      setStorageGamesData(currentGameData);
    } else {
      currentGameData.push(gameData);
      setStorageGamesData(currentGameData);
    }
  } else {
    setStorageGamesData([gameData]);
  }
}

export function deleteStorageGamesData(): void {
  storageInstance.delete(GAMES_DATA_STORAGE_KEY);
}
/**
 * Checks if the given storage data is a Sudoku grid
 *
 * @param data the given data
 * @returns a boolean indicating wether the given data is a Sudoku grid
 */
function isSudokuGrid(data: GameData): data is SudokuGrid {
  // Check if data is an array
  if (!Array.isArray(data)) {
    return false;
  }

  // Check if every row is an array
  for (const row of data) {
    if (!Array.isArray(row)) {
      return false;
    }

    // Check if every cell matches the SudokuCell structure
    for (const cell of row) {
      if (
        typeof cell !== "object" ||
        !("value" in cell) ||
        !("editable" in cell) ||
        !("valid" in cell)
      ) {
        return false;
      }

      // Check the types of the properties
      if (
        (cell.value !== null && typeof cell.value !== "number") ||
        typeof cell.editable !== "boolean" ||
        typeof cell.valid !== "boolean"
      ) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Checks if the given storage data is a 2048 game data.
 *
 * @param data the given data
 * @returns a boolean indicating wether the given data is a 2048 Game board
 */
function isTTFEGameData(data: GameData): data is TTFEGameData {
  return "ttfeBoard" in data && "ttfeScore" in data;
}

// SETTINGS FUNCTIONS
/**
 * Gets user's stored settings
 *
 * @returns the stored settings
 */
export function getSettings(): SettingsData {
  const gameDataString = storageInstance.getString(SETTINGS_STORAGE_KEY);

  if (!gameDataString) {
    return loadDefaultSettings();
  }
  return JSON.parse(gameDataString) as SettingsData;
}

/**
 * Sets user's stored settings
 *
 * @param the updated settings
 */
export function setSettings(settings: SettingsData): void {
  storageInstance.set(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Loads default settings to local storage
 */
function loadDefaultSettings(): SettingsData {
  const deviceLocale = getLocales()[0];
  const localeFirstDayOfWeek = localeFirstDayOfWeekMap.get(
    deviceLocale.languageTag,
  );

  const defaultSettings: SettingsData = {
    general: {
      enableOnlineFeatures: true,
      language: deviceLocale.languageCode.toUpperCase(),
    },
    bookReader: {
      fontSize: fontSizeMedium,
      fontFamily: fontFamilySerif,
    },
    preferences: {
      firstDayOfWeek:
        deviceLocale && localeFirstDayOfWeek
          ? localeFirstDayOfWeek
          : dayOfWeekSunday,
    },
  };
  console.log(`loaded default settings: ${defaultSettings}`);
  setSettings(defaultSettings);
  return defaultSettings;
}
