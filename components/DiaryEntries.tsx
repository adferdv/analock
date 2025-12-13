import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useContext, useEffect, useState } from "react";
import DiaryEntryDetailScreen from "./DiaryEntry";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { areDatesEqual } from "../utils/date.utils";
import { getSettings } from "../services/storage.services";
import { timestampToDate } from "../utils/date.utils";
import { GENERAL_STYLES } from "../constants/general.styles";
import { TranslationsContext } from "../contexts/translationsContext";
import { OnlineFeaturesDisclaimer } from "./OnlineFeaturesDisclaimer";
import { useNavigation } from "@react-navigation/native";
import { LoadingIndicator } from "./LoadingIndicator";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddIcon } from "./icons/AddIcon";
import { ErrorScreen } from "./ErrorScreen";
import { NavigationHeader } from "./NavigationHeader";
import {
  ActivityCompletionContext,
  ActivityKind,
} from "../contexts/activityCompletionContext";

type DiaryStackParamList = {
  DiaryEntries: undefined;
  DiaryEntry: { isUpdate: boolean };
};

const DiaryScreen = () => {
  const translations = useContext(TranslationsContext)?.translations;
  const DiaryEntriesStack = createNativeStackNavigator<DiaryStackParamList>();
  return (
    <DiaryEntriesStack.Navigator initialRouteName="DiaryEntries">
      <DiaryEntriesStack.Screen
        name="DiaryEntries"
        component={DiaryEntriesWrapper}
        options={{
          headerTitle: translations!.home.diary,
          header: (props) => (
            <NavigationHeader {...props} primaryHeaderStyle={true} />
          ),
        }}
      />
      <DiaryEntriesStack.Screen
        name="DiaryEntry"
        component={DiaryEntryDetailScreen}
        options={({ route }) => ({
          headerTitle: (route.params?.isUpdate as boolean)
            ? translations?.diary.updateDiaryEntryHeader
            : translations?.diary.addDiaryEntryHeader,
          header: (props) => (
            <NavigationHeader {...props} primaryHeaderStyle={false} />
          ),
        })}
      />
    </DiaryEntriesStack.Navigator>
  );
};

const DiaryEntriesWrapper: React.FC = () => {
  const userSettings = getSettings();

  return userSettings && userSettings.general.enableOnlineFeatures ? (
    <DiaryEntries />
  ) : (
    <OnlineFeaturesDisclaimer />
  );
};

const DiaryEntries: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<DiaryStackParamList>();
  const translationsContext = useContext(TranslationsContext);
  const activityCompletionContext = useContext(ActivityCompletionContext);
  const [diaryEntriesData, setDiaryEntriesData] = useState<DiaryEntriesData>({
    diaryEntries: [],
  });
  // Hook to set the loading state when user's diary' entries are loaded
  useEffect(() => {
    if (activityCompletionContext) {
      const diaryEntriesData =
        activityCompletionContext.activityCompletionMap.get(
          ActivityKind.Diary,
        ) as DiaryEntriesData;

      if (diaryEntriesData.diaryEntries) {
        setLoading(false);
      }
      setDiaryEntriesData(diaryEntriesData);
    }
  }, [activityCompletionContext]);

  return !diaryEntriesData?.error ? (
    <View
      style={[
        GENERAL_STYLES.baseScreenPadding,
        GENERAL_STYLES.whiteBackgroundColor,
        GENERAL_STYLES.flexGrow,
      ]}
    >
      {loading ? (
        <LoadingIndicator />
      ) : (
        <SafeAreaView style={[GENERAL_STYLES.flexGrow]}>
          <TouchableOpacity
            disabled={isAddDiaryEntryButtonDisabled(
              diaryEntriesData.diaryEntries,
              loading,
            )}
            onPressIn={() => {
              navigation.push("DiaryEntry", {
                isUpdate: false,
              });
            }}
            style={[
              GENERAL_STYLES.uiButton,
              GENERAL_STYLES.floatingRightButton,
              isAddDiaryEntryButtonDisabled(
                diaryEntriesData.diaryEntries,
                loading,
              ) && GENERAL_STYLES.buttonDisabled,
            ]}
          >
            <AddIcon />
          </TouchableOpacity>
          {diaryEntriesData.diaryEntries && (
            <FlatList
              numColumns={2}
              data={diaryEntriesData.diaryEntries}
              keyExtractor={(entry) => entry.id.toString()}
              removeClippedSubviews={false}
              contentContainerStyle={[
                GENERAL_STYLES.flexGap,
                GENERAL_STYLES.generalBottomPadding,
              ]}
              renderItem={({ item, index }) => {
                const diaryEntry = item;
                return (
                  <TouchableOpacity
                    key={diaryEntry.id}
                    style={[
                      GENERAL_STYLES.flexCol,
                      GENERAL_STYLES.flexGapSmall,
                      GENERAL_STYLES.flexGrow,
                      GENERAL_STYLES.generalBorder,
                      GENERAL_STYLES.mediumBorderWidth,
                      {
                        paddingHorizontal: 20,
                        paddingBottom: 10,
                        paddingTop: 5,
                        marginRight:
                          index !== diaryEntriesData.diaryEntries.length - 1 &&
                          index % 2 === 0
                            ? 10
                            : 0,
                        marginLeft:
                          diaryEntriesData!.diaryEntries.length % 2 !== 0 &&
                          index !== diaryEntriesData.diaryEntries.length - 1 &&
                          index % 2 !== 0
                            ? 10
                            : 0,
                      },
                    ]}
                    delayPressIn={500}
                    onPressIn={() => {
                      navigation.push("DiaryEntry", {
                        id: diaryEntry.id,
                        title: diaryEntry.title,
                        content: diaryEntry.content,
                        publishDate: diaryEntry.registration.registrationDate,
                        isUpdate: true,
                      });
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        GENERAL_STYLES.uiText,
                        GENERAL_STYLES.textBlack,
                        GENERAL_STYLES.textBold,
                      ]}
                    >
                      {diaryEntry.title}
                    </Text>
                    <Text
                      numberOfLines={3}
                      style={[GENERAL_STYLES.uiText, GENERAL_STYLES.textBlack]}
                    >
                      {diaryEntry.content.replaceAll(/(\n)/g, " ")}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </SafeAreaView>
      )}
    </View>
  ) : (
    <ErrorScreen
      errorText={translationsContext?.translations.errors.genericNetworkError}
    />
  );
};

/**
 * Checks if the add diary entry button should be disabled.
 *
 *   @param userDiaryEntries the user's diary entries
 *   @returns a boolean indicating whether the add diary entry button should be disabled
 */
function isAddDiaryEntryButtonDisabled(
  userDiaryEntries: DiaryEntry[],
  loading: boolean,
): boolean {
  return (
    loading ||
    userDiaryEntries?.find((diaryEntry) =>
      areDatesEqual(
        timestampToDate(diaryEntry.registration.registrationDate),
        new Date(),
      ),
    ) !== undefined
  );
}

export default DiaryScreen;
