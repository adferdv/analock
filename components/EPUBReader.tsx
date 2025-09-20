import React, { useContext, useEffect, useRef, useState } from "react";
import { View, Dimensions } from "react-native";
import { useProcessEpub } from "../hooks/useProcessEpub";
import RNFS from "react-native-fs";
import { APP_DOCUMENTS_PATH } from "../services/download.services";
import {
  updateStorageBookData,
  getSettings,
  getStorageBookData,
  getStorageUserData,
} from "../services/storage.services";
import {
  ActivityRegistration,
  addUserBookRegistration,
} from "../services/activityRegistrations.services";
import { emptyDateTime } from "../utils/date.utils";
import { useSaveOnExit } from "../hooks/useSaveOnExit";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { GENERAL_STYLES } from "../constants/general.styles";
import { swipeThreshold } from "../constants/constants";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { LoadingIndicator } from "./LoadingIndicator";
import { runOnJS } from "react-native-reanimated";
import { ActivityRegistrationsContext } from "../contexts/activityRegistrationsContext";

interface EpubReaderProps {
  ebookId: string;
}

export interface BookStorageData {
  bookId: string;
  currentPage: number;
  finished: boolean;
}

let firstFileIndex = -1;
let maxPages = 0;
const AVERAGE_WORDS_PER_MINUTE = 200;
const MAX_MINUTES = 20;
const START_HTML_FILE_PAGE = 1;

const EpubReader: React.FC<EpubReaderProps> = ({ ebookId }) => {
  const unzipPath = `${APP_DOCUMENTS_PATH}/${ebookId}`;
  const bookData = getStorageBookData(ebookId);
  const userSettings = getSettings();
  const { htmlFiles, contentPath, cssPath, loading } = useProcessEpub(ebookId);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [currentFilePage, setCurrentFilePage] =
    useState<number>(START_HTML_FILE_PAGE);
  const [currentFileTotalPages, setCurrentFileTotalPages] = useState<number>(0);
  const [hasFinishedReading, setHasFinishedReading] = useState<boolean>(
    bookData !== undefined && bookData.finished,
  );
  const webViewRef = useRef<WebView>(null);
  const activityRegistrationsContext = useContext(ActivityRegistrationsContext);

  useSaveOnExit({
    bookId: ebookId,
    currentPage: currentFilePage,
    finished: hasFinishedReading,
  });

  // Hook to set up the content that can be read
  useEffect(() => {
    if (htmlFiles.length > 0) {
      // if book data has been stored, retrieve it and set the params.
      // if not, then generate the params and save them to local storage.
      if (bookData) {
        firstFileIndex = bookData.firstPageIndex;
        maxPages = bookData.maxPages;
        setCurrentFilePage(bookData.currentPage);
        setHasFinishedReading(bookData.finished);
        loadFullHtmlContent();
      } else {
        const randomIndex = Math.floor(Math.random() * (htmlFiles.length - 5));
        firstFileIndex = randomIndex;
        loadFullHtmlContent()
          .then(() => {
            updateStorageBookData({
              id: ebookId,
              data: {
                maxPages: maxPages,
                firstPageIndex: firstFileIndex,
                currentPage: START_HTML_FILE_PAGE,
                finished: hasFinishedReading,
              },
            });
          })
          .catch((err) =>
            console.error(`error loading the full HTML document: ${err}}`),
          );
      }
    }
  }, [htmlFiles]);

  // Hook to handle page change
  useEffect(() => {
    webViewRef.current?.injectJavaScript(`goToPage(${currentFilePage}); true;`);
    const finishedReading = currentFilePage === currentFileTotalPages;

    if (finishedReading && !bookData?.finished) {
      setHasFinishedReading(finishedReading);

      if (
        userSettings.general.enableOnlineFeatures &&
        activityRegistrationsContext
      ) {
        const currentDate = new Date();
        const userData = getStorageUserData();
        emptyDateTime(currentDate);
        addUserBookRegistration({
          internetArchiveId: ebookId,
          registrationDate: currentDate.valueOf(),
          userId: userData.userId,
        })
          .then((savedBookRegistration) => {
            // Update context adding saved book registration
            const activityRegistrations: ActivityRegistration[] = [
              savedBookRegistration,
              ...activityRegistrationsContext.activityRegistrationsData
                .activityRegistrations,
            ];
            activityRegistrationsContext.setActivityRegistrationsData({
              activityRegistrations,
              error: false,
            });
          })
          .catch(() => {
            activityRegistrationsContext.setActivityRegistrationsData({
              activityRegistrations: [],
              error: false,
            });
          });
      }
    }
  }, [currentFilePage]);

  /**
   * Loads the full HTML content with selected daily content
   */
  async function loadFullHtmlContent(): Promise<void> {
    const stylesPath = `file://${unzipPath}/${contentPath}${cssPath}`;
    let fullHtmlContent = `
    <?xml version='1.0' encoding='utf-8'?>
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="None" xml:lang="None">
    <head>
        <title>${ebookId}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link href="${stylesPath}" rel="stylesheet" type="text/css"/>
        <style>
            @font-face {font-family: 'Merryweather'; src: url('file:///android_asset/fonts/merriweather_regular.ttf') format('truetype'); font-weight: normal; font-style: normal;}
            @font-face {font-family: 'Merryweather'; src: url('file:///android_asset/fonts/merriweather_bold.ttf') format('truetype'); font-weight: bold; font-style: normal;}
            @font-face {font-family: 'Merryweather'; src: url('file:///android_asset/fonts/merriweather_italic.ttf') format('truetype'); font-weight: normal; font-style: italic;}
            @font-face {font-family: 'OpenDyslexic'; src: url('file:///android_asset/fonts/opendyslexic_regular.otf') format('truetype'); font-weight: normal; font-style: normal;}
            @font-face {font-family: 'OpenDyslexic'; src: url('file:///android_asset/fonts/opendyslexic_bold.otf') format('truetype'); font-weight: bold; font-style: normal;}
            @font-face {font-family: 'OpenDyslexic'; src: url('file:///android_asset/fonts/opendyslexic_italic.otf') format('truetype'); font-weight: normal; font-style: italic;}
            html {
                font-size: ${userSettings.bookReader.fontSize}px; 
                font-family: "${userSettings.bookReader.fontFamily}";
                -webkit-user-select: none;
                user-select: none;
            }
        </style>
    </head>
    <body>
        <div class="content-wrapper">`;
    const htmlTextRegex =
      /<script[^>]*>[\s\S]*?<\/script>|<style[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->|<[^>]+>/g;
    const maxWords = AVERAGE_WORDS_PER_MINUTE * MAX_MINUTES;
    let currentWords = 0;

    // Iterate over all remaining html files
    for (let i = firstFileIndex; i < htmlFiles.length; i++) {
      const selectedItem = htmlFiles[i];
      // Add file content to body if file exists
      const doesHtmlFileExist = await RNFS.exists(
        `${unzipPath}/${contentPath}${selectedItem.href}`,
      );
      if (doesHtmlFileExist) {
        const content = await RNFS.readFile(
          `${unzipPath}/${contentPath}${selectedItem.href}`,
          "utf8",
        );
        fullHtmlContent = fullHtmlContent.concat(
          "\n",
          content.substring(
            content.indexOf("<body>") + 7,
            content.indexOf("</body>"),
          ),
        );

        // update word count
        currentWords += content
          .replace(htmlTextRegex, "")
          .trim()
          .split(" ").length;

        // Stop iterating when reached maximum words
        if (currentWords < maxWords) {
          maxPages++;
        } else {
          break;
        }
      }
    }

    fullHtmlContent = setResourcePaths(fullHtmlContent);
    fullHtmlContent = fullHtmlContent.concat(
      "\n</div>",
      "\n</body>",
      "\n</html>",
    );
    fullHtmlContent = embeddNavigationScript(fullHtmlContent);
    setHtmlContent(fullHtmlContent);
  }

  /**
   * Returns an updated version of the HTML content passed by parameter, updating image and css paths to be absolute.
   *
   * @returns the updated HTML content with absolute resource paths
   */
  function setResourcePaths(originalHtml: string): string {
    return setImagePaths(originalHtml);
  }

  /**
   * Sets the html image paths to point to the absolute path of the images.
   *
   * @param html the HTML content as string
   * @param unzipFolderPath the path where the selected book has been unzipped
   */
  function setImagePaths(html: string): string {
    const documentDirPath = `file://${unzipPath}/${contentPath}`;

    // Match any path starting with "../" followed by any folder or file name
    let updatedHtml = html.replace(
      /src="\.\.\/([^"]+)"/g,
      (_, relativePath) => {
        const newPath = `${documentDirPath}/${relativePath}`;
        return `src="${newPath}"`;
      },
    );

    // Handle images at the root (e.g., "src="image.jpg" without any "../")
    updatedHtml = updatedHtml.replace(/src="([^/"]+)"/g, (_, imgName) => {
      const newPath = `${documentDirPath}/${imgName}`;
      return `src="${newPath}"`;
    });

    return updatedHtml;
  }

  /**
   * Embedds the JS navigation script inside the HTML
   *
   * @param html the HTML content
   * @returns the updated HTML content
   */
  function embeddNavigationScript(html: string): string {
    const dimensions = Dimensions.get("window");
    return html.replace(
      "</body>",
      `\n <script>
          const contentElement = document.body;
          const viewportWidth = ${dimensions.width * 0.95};
          let totalPages = 1;

          function calculatePages() {
            const totalWidth = contentElement.scrollWidth;
            totalPages = Math.max(1, Math.round(totalWidth / viewportWidth));

            if (window.ReactNativeWebView) {
               window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'totalPages', payload: totalPages }));
            }
          }

          function goToPage(pageNumber) {
            // pageNumber is 1-based
            const pageIndex = pageNumber - 1;
            const scrollToX = pageIndex * viewportWidth;
            contentElement.scrollTo({
              left: scrollToX,
              behavior: 'smooth' // Or 'auto' for instant jump
            });
          }

           requestAnimationFrame(() => {
              requestAnimationFrame(calculatePages);
           });

           let scrollTimeout;
           contentElement.addEventListener('scroll', () => {
              clearTimeout(scrollTimeout);
              scrollTimeout = setTimeout(() => {
                 const currentPageApprox = Math.round(contentElement.scrollLeft / viewportWidth) + 1;
                 if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'currentPage', payload: currentPageApprox }));
                 }
              }, 150);
           });

        </script>\n</body>`,
    );
  }

  /**
   * Handles the response sent from the WebView. Currently this is used just to receive the total pages of the current HTML file.
   *
   * @param event the message event
   */
  function handleWebViewMessage(event: WebViewMessageEvent): void {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === "totalPages") {
        setCurrentFileTotalPages(message.payload);
      }
    } catch (error) {
      console.error("Error parsing message from WebView:", error);
    }
  }

  // Pan gesture event. This gesture is the way of navigating the book.
  const panGesture = Gesture.Pan()
    .onStart(() => {
      return true;
    })
    .onEnd((event) => {
      const { translationX, translationY } = event;

      if (Math.abs(translationX) > Math.abs(translationY)) {
        if (Math.abs(translationX) > swipeThreshold) {
          if (translationX > 0) {
            runOnJS(setCurrentFilePage)(currentFilePage - 1);
          } else {
            runOnJS(setCurrentFilePage)(currentFilePage + 1);
          }
        }
      }
    })
    .shouldCancelWhenOutside(false);

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={panGesture}>
        <View
          style={[GENERAL_STYLES.whiteBackgroundColor, GENERAL_STYLES.flexGrow]}
        >
          {loading && <LoadingIndicator />}
          {!loading && (
            <WebView
              originWhitelist={["*", "file://"]}
              source={{
                html: htmlContent,
                baseUrl: `file://${unzipPath}/${contentPath}`,
              }}
              onLoad={() => {
                webViewRef.current?.injectJavaScript(
                  `goToPage(${currentFilePage}); true;`,
                );
              }}
              onMessage={handleWebViewMessage}
              allowFileAccess={true}
              allowFileAccessFromFileURLs={true}
              allowUniversalAccessFromFileURLs={true}
              allowsBackForwardNavigationGestures={false}
              style={[GENERAL_STYLES.whiteBackgroundColor]}
              scalesPageToFit={false}
              scrollEnabled={false}
              bounces={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              contentInset={{ top: 0, left: 0, bottom: 0, right: 0 }}
              automaticallyAdjustContentInsets={false}
              ref={webViewRef}
            />
          )}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default EpubReader;
