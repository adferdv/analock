import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Dimensions, Text, TouchableOpacity } from "react-native";
import { useContext, useMemo } from "react";
import { BaseScreen } from "./BaseScreen";
import { TranslationsContext } from "../contexts/translationsContext";
import { useNavigation } from "@react-navigation/native";
import { CalendarScreen } from "./RegistrationsCalendar";
import { WeeklyActivityChart } from "./WeeklyActivityChart";
import { getStorageUserData } from "../services/storage.services";
import { View } from "react-native";
import { GENERAL_STYLES } from "../constants/general.styles";
import { CalendarIcon } from "./icons/CalendarIcon";
import { SettingsIcon } from "./icons/SettingsIcon";
import { ProfileCircleContainer } from "./ProfileCircleContainer";
import { formatString } from "../utils/string.utils";
import Settings from "./Settings";
import { SettingsContext } from "../contexts/settingsContext";
import { NavigationHeader } from "./NavigationHeader";
import { ActivityRegistrationsContext } from "../contexts/activityRegistrationsContext";
import { defaultProfileUserName } from "../constants/constants";
import BooksIlustration from "./icons/BooksIlustration";
import { ActivityRegistration } from "../services/activityRegistrations.services";
import {
  ActivityCompletionContext,
  ActivityKind,
} from "../contexts/activityCompletionContext";
import { UserDataContext } from "../contexts/userDataContext";

export type MySpaceStackParamList = {
  MySpace: undefined;
  Settings: undefined;
};

const MIN_ACTIVITY_NUMBER_FOR_STREAK = 1;

const MySpaceScreen = () => {
  const translations = useContext(TranslationsContext)?.translations;
  const MySpaceStack = createNativeStackNavigator();
  return (
    <MySpaceStack.Navigator initialRouteName="MySpace">
      <MySpaceStack.Screen
        name="MySpace"
        component={MySpace}
        options={{
          headerTitle: translations?.home.profile,
          header: (props) => (
            <NavigationHeader {...props} primaryHeaderStyle={true} />
          ),
        }}
      />
      <MySpaceStack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          headerTitle: translations?.profile.calendar,
          header: (props) => (
            <NavigationHeader {...props} primaryHeaderStyle={false} />
          ),
        }}
      />
      <MySpaceStack.Screen
        name="Settings"
        component={Settings}
        options={{
          header: (props) => (
            <NavigationHeader {...props} primaryHeaderStyle={false} />
          ),
          headerTitle: translations?.profile.settings,
        }}
      />
    </MySpaceStack.Navigator>
  );
};

function MySpace() {
  const navigation = useNavigation();
  const userSettingsContext = useContext(SettingsContext);
  const profileTranslations =
    useContext(TranslationsContext)?.translations.profile;
  const userDataContext = useContext(UserDataContext);
  const activityCompletionContext = useContext(ActivityCompletionContext);
  const userRegistrationsContext = useContext(ActivityRegistrationsContext);
  const fullActivityRegistrations = useMemo(() => {
    if (
      userDataContext?.userData.authenticated &&
      activityCompletionContext &&
      userRegistrationsContext
    ) {
      return [
        ...userRegistrationsContext.activityRegistrationsData
          .activityRegistrations,
      ].concat(
        (
          activityCompletionContext.activityCompletionMap.get(
            ActivityKind.Diary,
          ) as DiaryEntriesData
        ).diaryEntries,
      );
    }
    return [];
  }, [activityCompletionContext, userRegistrationsContext]);
  const streak = calculateStreak();
  const { height } = Dimensions.get("window");
  const profileIconSize = 0.08 * height;

  /**
   * Calculates the streak based on user registrations
   */
  function calculateStreak(): number {
    if (fullActivityRegistrations && fullActivityRegistrations.length > 0) {
      const currentDate = new Date();
      let day = currentDate.getDate();
      let streak = 0;
      let brokeStreak = false;

      while (!brokeStreak) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          day - 1,
        );

        if (
          fullActivityRegistrations.filter(
            (registration: ActivityRegistration) =>
              registration.registration.registrationDate === date.valueOf(),
          ).length >= MIN_ACTIVITY_NUMBER_FOR_STREAK
        ) {
          streak++;
        } else {
          brokeStreak = true;
        }
        day--;
      }
      return streak;
    }

    return 0;
  }

  return (
    userDataContext &&
    userRegistrationsContext && (
      <BaseScreen>
        <View
          style={[
            GENERAL_STYLES.flexRow,
            GENERAL_STYLES.alignCenter,
            GENERAL_STYLES.flexGap,
            { marginBottom: 20 },
          ]}
        >
          <ProfileCircleContainer iconSize={profileIconSize}>
            <BooksIlustration
              width={`${profileIconSize}px`}
              heigth={`${profileIconSize}px`}
            />
          </ProfileCircleContainer>
          <View style={[GENERAL_STYLES.flexCol]}>
            <Text
              style={[
                GENERAL_STYLES.uiText,
                GENERAL_STYLES.textBlack,
                GENERAL_STYLES.textExtraBig,
              ]}
            >
              {userDataContext.userData.userName
                ? userDataContext.userData.userName
                : defaultProfileUserName}
            </Text>
            {profileTranslations &&
              !userRegistrationsContext.activityRegistrationsData.error &&
              userSettingsContext?.settings.general.enableOnlineFeatures && (
                <Text style={[GENERAL_STYLES.uiText]}>
                  {formatString(profileTranslations.streak, streak)}
                </Text>
              )}
          </View>
        </View>
        {!userRegistrationsContext.activityRegistrationsData.error &&
          userSettingsContext &&
          userSettingsContext.settings.general.enableOnlineFeatures && (
            <View>
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={[
                    GENERAL_STYLES.uiText,
                    GENERAL_STYLES.textBlack,
                    GENERAL_STYLES.textTitle,
                  ]}
                >
                  {profileTranslations?.weeklyProgress}
                </Text>
                <WeeklyActivityChart
                  fullActivityRegistrations={fullActivityRegistrations}
                />
              </View>
            </View>
          )}
        <View style={[GENERAL_STYLES.flexRow, GENERAL_STYLES.flexGap]}>
          <TouchableOpacity
            onPressIn={() => {
              navigation.push("Calendar");
            }}
            style={[
              GENERAL_STYLES.generalBorder,
              GENERAL_STYLES.mediumBorderWidth,
              GENERAL_STYLES.smallPadding,
              GENERAL_STYLES.flexGrow,
            ]}
          >
            <View
              style={[
                GENERAL_STYLES.flexRow,
                GENERAL_STYLES.alignCenter,
                GENERAL_STYLES.flexGapSmall,
              ]}
            >
              <CalendarIcon />
              <Text
                style={[
                  GENERAL_STYLES.uiText,
                  GENERAL_STYLES.textBlack,
                  GENERAL_STYLES.textBold,
                  GENERAL_STYLES.alignCenter,
                ]}
              >
                {profileTranslations?.calendar}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPressIn={() => {
              navigation.push("Settings");
            }}
            style={[
              GENERAL_STYLES.generalBorder,
              GENERAL_STYLES.mediumBorderWidth,
              GENERAL_STYLES.smallPadding,
              GENERAL_STYLES.flexGrow,
            ]}
          >
            <View
              style={[
                GENERAL_STYLES.flexRow,
                GENERAL_STYLES.alignCenter,
                GENERAL_STYLES.flexGapSmall,
              ]}
            >
              <SettingsIcon />
              <Text
                style={[
                  GENERAL_STYLES.uiText,
                  GENERAL_STYLES.textBlack,
                  GENERAL_STYLES.textBold,
                  GENERAL_STYLES.alignCenter,
                ]}
              >
                {profileTranslations?.settings}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </BaseScreen>
    )
  );
}

export default MySpaceScreen;
