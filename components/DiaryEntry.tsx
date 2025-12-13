import { Text, TextInput, TouchableOpacity } from "react-native";
import { GENERAL_STYLES } from "../constants/general.styles";
import { useContext, useState } from "react";
import {
  emptyDateTime,
  getDisplayDateFormatFromDate,
} from "../utils/date.utils";
import {
  addUserDiaryEntry,
  updateUserDiaryEntry,
} from "../services/diaryEntries.services";
import { getStorageUserData } from "../services/storage.services";
import { TranslationsContext } from "../contexts/translationsContext";
import { BaseScreen } from "./BaseScreen";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  ActivityCompletionContext,
  ActivityKind,
} from "../contexts/activityCompletionContext";

const DiaryEntryDetailScreen: React.FC = ({ route }) => {
  const { id, title, content, publishDate, isUpdate } = route.params;
  const [titleInput, setTitleInput] = useState<string>(!isUpdate ? "" : title);
  const [contentInput, setContentInput] = useState<string>(
    !isUpdate ? "" : content,
  );
  const translationsContext = useContext(TranslationsContext);
  const navigation = useNavigation();
  const activityCompletionContext = useContext(ActivityCompletionContext);

  return (
    translationsContext && (
      <BaseScreen>
        <View
          style={[
            GENERAL_STYLES.flexCol,
            GENERAL_STYLES.flexGap,
            GENERAL_STYLES.flexGrow,
            GENERAL_STYLES.paddingBottom,
          ]}
        >
          {publishDate && (
            <Text
              style={[
                GENERAL_STYLES.uiText,
                GENERAL_STYLES.textGray,
                GENERAL_STYLES.textBold,
              ]}
            >
              {getDisplayDateFormatFromDate(
                publishDate,
                translationsContext.translations,
              )}
            </Text>
          )}
          <TextInput
            style={[
              GENERAL_STYLES.uiText,
              GENERAL_STYLES.generalBorder,
              GENERAL_STYLES.mediumBorderWidth,
              GENERAL_STYLES.generalPadding,
              GENERAL_STYLES.textBlack,
              GENERAL_STYLES.textTitle,
            ]}
            placeholder={translationsContext.translations.diary.title}
            placeholderTextColor={"gray"}
            defaultValue={!isUpdate ? "" : title}
            onChange={(event) => setTitleInput(event.nativeEvent.text)}
            editable={areInputsEditableAndSaveButtonShown(
              isUpdate,
              publishDate,
            )}
            hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
            autoFocus={true}
            maxLength={40}
          />
          <TextInput
            style={[
              GENERAL_STYLES.uiText,
              GENERAL_STYLES.textBlack,
              GENERAL_STYLES.generalBorder,
              GENERAL_STYLES.mediumBorderWidth,
              GENERAL_STYLES.flexGrow,
              GENERAL_STYLES.generalPadding,
            ]}
            placeholder={translationsContext.translations.diary.content}
            placeholderTextColor={"gray"}
            defaultValue={!isUpdate ? "" : content}
            onChange={(event) => setContentInput(event.nativeEvent.text)}
            editable={areInputsEditableAndSaveButtonShown(
              isUpdate,
              publishDate,
            )}
            hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
            textAlignVertical="top"
            multiline={true}
            maxLength={300}
          />
          {areInputsEditableAndSaveButtonShown(isUpdate, publishDate) && (
            <TouchableOpacity
              onPressIn={() => {
                const currentDate = new Date();
                emptyDateTime(currentDate);

                if (!isUpdate) {
                  const diaryEntry: AddDiaryEntryRequest = {
                    title: titleInput,
                    content: contentInput,
                    publishDate: currentDate.valueOf(),
                  };
                  addUserDiaryEntry(diaryEntry)
                    .then((savedEntry) => {
                      if (savedEntry && activityCompletionContext) {
                        // Update activity completion context
                        const updatedActivityCompletionMap = new Map(
                          activityCompletionContext.activityCompletionMap,
                        );
                        const currentDiaryEntriesData =
                          updatedActivityCompletionMap.get(
                            ActivityKind.Diary,
                          ) as DiaryEntriesData;
                        updatedActivityCompletionMap.set(ActivityKind.Diary, {
                          diaryEntries: [
                            savedEntry,
                            ...currentDiaryEntriesData.diaryEntries,
                          ],
                        });
                        activityCompletionContext.setActivityCompletionMap(
                          updatedActivityCompletionMap,
                        );
                      }
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                } else {
                  const diaryEntry: UpdateDiaryEntryRequest = {
                    title: titleInput,
                    content: contentInput,
                    publishDate: currentDate.valueOf(),
                  };
                  updateUserDiaryEntry(id, diaryEntry)
                    .then((updatedEntry) => {
                      if (updatedEntry && activityCompletionContext) {
                        const updatedActivityCompletionMap = new Map(
                          activityCompletionContext.activityCompletionMap,
                        );
                        const currentDiaryEntriesData =
                          updatedActivityCompletionMap.get(
                            ActivityKind.Diary,
                          ) as DiaryEntriesData;
                        const indexToBeUpdated =
                          currentDiaryEntriesData.diaryEntries.findIndex(
                            (diaryEntry) => diaryEntry.id === updatedEntry.id,
                          );
                        currentDiaryEntriesData.diaryEntries[indexToBeUpdated] =
                          updatedEntry;
                        updatedActivityCompletionMap.set(ActivityKind.Diary, {
                          diaryEntries: currentDiaryEntriesData.diaryEntries,
                        });
                        activityCompletionContext.setActivityCompletionMap(
                          updatedActivityCompletionMap,
                        );
                      }
                    })
                    .catch((err) => console.error(err));
                }

                navigation.goBack();
              }}
              disabled={isSaveButtonDisabled(
                isUpdate,
                titleInput,
                contentInput,
                title,
                content,
              )}
              style={[
                GENERAL_STYLES.uiButton,
                isSaveButtonDisabled(
                  isUpdate,
                  titleInput,
                  contentInput,
                  title,
                  content,
                ) && GENERAL_STYLES.buttonDisabled,
              ]}
            >
              <Text
                style={[
                  GENERAL_STYLES.uiText,
                  GENERAL_STYLES.textCenter,
                  GENERAL_STYLES.textWhite,
                ]}
              >
                {translationsContext.translations.diary.save}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </BaseScreen>
    )
  );
};

function areInputsEditableAndSaveButtonShown(
  isUpdate: boolean,
  publishDate: number,
): boolean {
  const currentDate = new Date();
  emptyDateTime(currentDate);
  return !isUpdate || currentDate.valueOf() === publishDate;
}

/**
 * Checks whether the form's save buton should be disabled
 *
 *  @param isUpdate
 *   @param titleInput the title input's content
 *   @param contentInput the content input's content
 *   @param currentTitle the current entry's title (if updated)
 *   @param currentContent the current entry's content (if updated)
 *    @returns a boolean indicating whether the buton should be disabled
 */
function isSaveButtonDisabled(
  isUpdate: boolean,
  titleInput: string,
  contentInput: string,
  currentTitle: string,
  currentContent: string,
) {
  return (
    (!isUpdate &&
      (titleInput.trim().length === 0 || contentInput.trim().length === 0)) ||
    (isUpdate && currentTitle === titleInput && currentContent === contentInput)
  );
}

export default DiaryEntryDetailScreen;
