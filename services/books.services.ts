import { maxBookDownload } from "../constants/constants";
import { AXIOS_INSTANCE } from "./interceptors";

/**
 * Gets books from OpenLibrary API, based on the request parameters.
 *
 * @param req the request object. Contains the parameters used to filter among all books.
 * @returns an array of internet archive books
 */
export async function getOpenLibraryBooksBySubject(
  req: OpenLibraryRequest,
): Promise<InternetArchiveBook[]> {
  const getBooksUrl = `${process.env.API_ROOT_URL}api/v1/internetArchive/books/search?collection=opensource&language=english&subject=${encodeURIComponent(req.subject)}&rows=10`;
  const selectedBooks: InternetArchiveBook[] = [];

  try {
    const booksResponse = await AXIOS_INSTANCE.get(getBooksUrl);
    const res = booksResponse.data.response as OpenLibraryResponse;
    const internetArchiveResponseBooks = res.docs;

    for (
      let i = 0;
      selectedBooks.length < maxBookDownload &&
      i < internetArchiveResponseBooks.length;
      i++
    ) {
      const book = internetArchiveResponseBooks[i];
      const bookMetadata = await getBookMetadata({ id: book.identifier });
      book.epubFile = bookMetadata?.files?.find(
        (file) => file.format === "EPUB",
      )?.name;

      if (book.epubFile) {
        selectedBooks.push(book);
      }
    }
  } catch {
    throw Error("Error retrieving books from open library API");
  }

  console.log("selected books: ", selectedBooks);
  return selectedBooks;
}

/**
 * Gets a book's metadata.
 *
 * @param req the metadata request object, containing the ID of the book to get the metadata from
 */
export async function getBookMetadata(
  req: InternetArchiveMetadataRequest,
): Promise<InternetArchiveMetadataResponse | null> {
  let result = null;
  const getBookMetadataUrl = `${process.env.API_ROOT_URL}api/v1/internetArchive/books/${encodeURIComponent(req.id)}/metadata`;

  try {
    const bookMetadataResponse = await AXIOS_INSTANCE.get(getBookMetadataUrl);
    result = bookMetadataResponse.data as InternetArchiveMetadataResponse;
  } catch {
    throw Error("Error retrieving book metadata");
  }

  return result;
}
