import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Text, TouchableOpacity, View } from "react-native";
import { authenticateUser } from "../services/auth.services";
import {
  getStorageUserData,
  setSettings,
  setStorageAuthData,
  setStorageUserData,
} from "../services/storage.services";
import { setAccessToken } from "../constants/auth.constants";
import { useContext, useEffect } from "react";
import { UserDataContext } from "../contexts/userDataContext";
import { getUserByEmail } from "../services/user.services";
import { BaseScreen } from "./BaseScreen";
import { GENERAL_STYLES } from "../constants/general.styles";
import { GoogleIcon } from "./icons/GoogleIcon";
import { SettingsContext } from "../contexts/settingsContext";
import { TranslationsContext } from "../contexts/translationsContext";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "./Home";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const Login: React.FC = () => {
  const navigation: NativeStackNavigationProp<RootStackParamList> =
    useNavigation();
  const userDataContext = useContext(UserDataContext);
  const userSettingsContext = useContext(SettingsContext);
  const translationsContext = useContext(TranslationsContext);

  // Hook to navigate back to Home if online features are disabled.
  useEffect(() => {
    if (
      userSettingsContext &&
      !userSettingsContext.settings.general.enableOnlineFeatures
    ) {
      navigation.navigate("Home");
    }
  }, [userSettingsContext]);

  return (
    translationsContext && (
      <BaseScreen>
        <Text
          style={[
            GENERAL_STYLES.uiText,
            GENERAL_STYLES.textBlack,
            GENERAL_STYLES.textBold,
            GENERAL_STYLES.alignCenter,
            GENERAL_STYLES.textTitleBig,
          ]}
        >
          {translationsContext.translations.login.loginTitle}
        </Text>
        <View style={[GENERAL_STYLES.flexCol, GENERAL_STYLES.flexGap]}>
          <TouchableOpacity
            style={[
              GENERAL_STYLES.whiteBackgroundColor,
              GENERAL_STYLES.loginSignInButton,
              GENERAL_STYLES.mediumBorderWidth,
            ]}
            onPress={() => {
              GoogleSignin.configure({
                webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
                offlineAccess: true,
                scopes: ["email"],
              });
              GoogleSignin.hasPlayServices()
                .then((hasPlayService) => {
                  if (hasPlayService) {
                    GoogleSignin.signIn()
                      .then((userInfo) => {
                        if (userInfo.data != null) {
                          const registerUserRequest: AuthenticateUserRequest = {
                            email: userInfo.data.user.email,
                            username: userInfo.data.user.givenName as string,
                            providerId: userInfo.data.user.id as string,
                            providerToken: userInfo.data.idToken as string,
                          };
                          authenticateUser(registerUserRequest)
                            .then((response) => {
                              // get user by email and save user's id on storage'
                              getUserByEmail(registerUserRequest.email)
                                .then((user) => {
                                  if (user !== null) {
                                    // update user data context
                                    const savedUserData = getStorageUserData();
                                    savedUserData.userId = user!.id;
                                    savedUserData.authenticated = true;
                                    savedUserData.userName = user?.userName;
                                    setStorageUserData(savedUserData);
                                    userDataContext?.setUserData(savedUserData);
                                    navigation.navigate("Home");
                                  }
                                })
                                .catch((err) => {
                                  console.error(err);
                                });
                              // save refresh token on storage
                              const authData: StorageAuthData = {
                                refreshToken: response!.refreshToken,
                              };
                              setStorageAuthData(authData);
                              // set local access token variable
                              setAccessToken(response!.accessToken);
                            })
                            .catch((err) => console.error(err));
                        }
                      })
                      .catch((e) => {
                        console.log("ERROR IS: " + JSON.stringify(e));
                      });
                  }
                })
                .catch((e) => {
                  console.log("ERROR IS: " + JSON.stringify(e));
                });
            }}
          >
            <View
              style={[
                GENERAL_STYLES.flexRow,
                GENERAL_STYLES.alignCenter,
                GENERAL_STYLES.justifyCenter,
              ]}
            >
              <GoogleIcon />
              <Text
                style={[
                  GENERAL_STYLES.uiText,
                  GENERAL_STYLES.textBlack,
                  GENERAL_STYLES.textCenter,
                  GENERAL_STYLES.textBold,
                ]}
              >
                {translationsContext.translations.login.googleSignIn}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPressIn={() => {
              if (userSettingsContext) {
                // disable online features setting
                const currentSettings = { ...userSettingsContext.settings };
                currentSettings.general.enableOnlineFeatures = false;
                setSettings(currentSettings);
                userSettingsContext.setSettings(currentSettings);
              }
            }}
          >
            <Text
              style={[
                GENERAL_STYLES.uiText,
                GENERAL_STYLES.textBlack,
                GENERAL_STYLES.textTitle,
              ]}
            >
              {
                translationsContext.translations.login
                  .continueWithoutOnlineFeatures
              }
            </Text>
          </TouchableOpacity>
        </View>
      </BaseScreen>
    )
  );
};

export default Login;
