import { Text } from "react-native";
import { BaseScreen } from "./BaseScreen";
import { GENERAL_STYLES } from "../constants/general.styles";
import { ButtonGroup } from "./ButtonGroup";
import { useContext, useEffect, useState } from "react";
import {
  fontFamilyOpenDyslexic,
  fontFamilySerif,
  fontSizeBig,
  fontSizeMedium,
  fontSizeSmall,
  languageEnglish,
  languageSpanish,
} from "../constants/constants";
import { getSettings } from "../services/storage.services";
import { useSaveOnExit } from "../hooks/useSaveOnExit";
import { TranslationsContext } from "../contexts/translationsContext";
import { Language, getTranslations } from "../services/translation.services";
import { CustomSwitch } from "./CustomSwitch";
import { View } from "react-native";

function Settings() {
  const translationsContext = useContext(TranslationsContext);
  const settingsTranslations = translationsContext?.translations.settings;
  const languageRadioGroup: SettingsRadioButton[] = [
    {
      text: settingsTranslations?.laguageEng,
      value: languageEnglish,
    },
    {
      text: settingsTranslations?.languageSpa,
      value: languageSpanish,
    },
  ];
  const fontSizeRadioGroup: SettingsRadioButton[] = [
    {
      text: settingsTranslations?.textSizeSmall,
      value: fontSizeSmall,
    },
    {
      text: settingsTranslations?.textSizeMedium,
      value: fontSizeMedium,
    },
    {
      text: settingsTranslations?.textSizeBig,
      value: fontSizeBig,
    },
  ];
  const fontFamilyRadioGroup: SettingsRadioButton[] = [
    {
      text: settingsTranslations?.textFontSerif,
      value: fontFamilySerif,
    },
    {
      text: settingsTranslations?.textFontOpenDyslexic,
      value: fontFamilyOpenDyslexic,
    },
  ];

  const userSettings = getSettings();
  const [areOnlineFeaturesEnabled, setAreOnlineFeaturesEnabled] =
    useState<boolean>(userSettings.general.enableOnlineFeatures);
  const [selectedLanguage, setSelectedLanguage] = useState<number>(
    languageRadioGroup.findIndex(
      (language) => language.value === userSettings.general.language,
    ),
  );
  const [selectedFontSize, setSelectedFontSize] = useState<number>(
    fontSizeRadioGroup.findIndex(
      (fontSize) => fontSize.value === userSettings.bookReader.fontSize,
    ),
  );
  const [selectedFontFamily, setSelectedFontFamily] = useState<number>(
    fontFamilyRadioGroup.findIndex(
      (fontFamily) => fontFamily.value === userSettings.bookReader.fontFamily,
    ),
  );
  console.log(`current settings: ${userSettings}`);

  // save selected settings when user exits section or app
  useSaveOnExit({
    general: {
      enableOnlineFeatures: areOnlineFeaturesEnabled,
      language: languageRadioGroup[selectedLanguage].value as string,
    },
    bookReader: {
      fontSize: fontSizeRadioGroup[selectedFontSize].value as number,
      fontFamily: fontFamilyRadioGroup[selectedFontFamily].value as string,
    },
    preferences: {
      firstDayOfWeek: userSettings.preferences.firstDayOfWeek,
    },
  });

  // hook to load translations for selected language
  useEffect(() => {
    translationsContext?.setTranslations(
      getTranslations(
        languageRadioGroup[selectedLanguage].value as string as Language,
      ),
    );
  }, [selectedLanguage]);

  return (
    <BaseScreen>
      <View style={[GENERAL_STYLES.flexGapBig]}>
        <View style={[GENERAL_STYLES.flexGapSmall]}>
          <Text
            style={[
              GENERAL_STYLES.uiText,
              GENERAL_STYLES.textBlack,
              GENERAL_STYLES.textExtraBig,
            ]}
          >
            {settingsTranslations?.general}
          </Text>
          <View style={[GENERAL_STYLES.flexCol, GENERAL_STYLES.flexGap]}>
            <CustomSwitch
              label={settingsTranslations?.onlineFeatures}
              isEnabled={areOnlineFeaturesEnabled}
              setIsEnabled={setAreOnlineFeaturesEnabled}
            />
            <ButtonGroup
              label={settingsTranslations?.language}
              buttons={languageRadioGroup}
              selectedIndex={selectedLanguage}
              setSelectedIndex={setSelectedLanguage}
            />
          </View>
        </View>
        <View style={[GENERAL_STYLES.flexGapSmall]}>
          <Text
            style={[
              GENERAL_STYLES.uiText,
              GENERAL_STYLES.textBlack,
              GENERAL_STYLES.textExtraBig,
            ]}
          >
            {settingsTranslations?.bookReader}
          </Text>
          <View style={[GENERAL_STYLES.flexCol, GENERAL_STYLES.flexGap]}>
            <ButtonGroup
              label={settingsTranslations?.textSize}
              buttons={fontSizeRadioGroup}
              selectedIndex={selectedFontSize}
              setSelectedIndex={setSelectedFontSize}
            />
            <ButtonGroup
              label={settingsTranslations?.textFont}
              buttons={fontFamilyRadioGroup}
              selectedIndex={selectedFontFamily}
              setSelectedIndex={setSelectedFontFamily}
            />
          </View>
        </View>
      </View>
    </BaseScreen>
  );
}

export default Settings;
