import { FlatList, Text, View } from "react-native";
import { BaseScreen } from "./BaseScreen";
import { setStorageUserData } from "../services/storage.services";
import { GENERAL_STYLES } from "../constants/general.styles";
import { InternetArchiveSubject } from "./Books";
import { useContext } from "react";
import { TranslationsContext } from "../contexts/translationsContext";
import { FlatListCard } from "./FlatListCard";

interface BookSubjectSelectionProps {
  shownSubjects: InternetArchiveSubject[];
  userData: UserData;
  setSubject: React.Dispatch<
    React.SetStateAction<InternetArchiveSubject | undefined>
  >;
}

export const BookSubjectSelection: React.FC<BookSubjectSelectionProps> = ({
  shownSubjects,
  userData,
  setSubject,
}) => {
  const translationsContext = useContext(TranslationsContext);

  // Aux function to get translation from subject
  function getSubjectTranslation(subject: InternetArchiveSubject): string {
    const enumKey = Object.keys(InternetArchiveSubject).find(
      (key) =>
        InternetArchiveSubject[key as keyof typeof InternetArchiveSubject] ===
        subject,
    );

    return (
      translationsContext?.translations.bookSubjects[
        enumKey as keyof typeof InternetArchiveSubject
      ] || subject
    );
  }
  return (
    shownSubjects.length > 0 && (
      <BaseScreen>
        <FlatList
          numColumns={2}
          data={shownSubjects}
          keyExtractor={(subject) => subject.valueOf()}
          renderItem={({ item, index }) => (
            <FlatListCard
              flatListIndex={index}
              onPress={() => {
                const updatedUserData = { ...userData };
                updatedUserData.selectedBookSubject = item.valueOf();
                setStorageUserData(updatedUserData);
                setSubject(item);
              }}
            >
              <View
                style={[
                  GENERAL_STYLES.defaultBorder,
                  GENERAL_STYLES.defaultBorderWidth,
                  GENERAL_STYLES.alignCenter,
                  GENERAL_STYLES.borderRadiusBig,
                  GENERAL_STYLES.fiveteenPercentWindowHeigthVerticalPadding,
                ]}
              >
                <Text
                  style={[
                    GENERAL_STYLES.uiText,
                    GENERAL_STYLES.textBlack,
                    GENERAL_STYLES.textCenter,
                    { flexWrap: "wrap" },
                  ]}
                >
                  {getSubjectTranslation(item)}
                </Text>
              </View>
            </FlatListCard>
          )}
          contentContainerStyle={[
            GENERAL_STYLES.flexGap,
            GENERAL_STYLES.flexGrow,
          ]}
          removeClippedSubviews={false}
        />
      </BaseScreen>
    )
  );
};
