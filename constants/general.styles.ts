import { Dimensions, StyleSheet } from "react-native";
import { colorBlack, colorGray, colorWhiteBackground } from "./constants";

const { width, height } = Dimensions.get("window");

export const GENERAL_STYLES = StyleSheet.create({
  baseScreenPadding: {
    paddingHorizontal: 0.05 * width,
    paddingTop: 0.03 * height,
  },
  smallPadding: {
    padding: 10,
  },
  generalPadding: {
    padding: 20,
  },
  generalHorizontalPadding: {
    paddingHorizontal: 20,
  },
  generalBottomPadding: {
    paddingBottom: 0.025 * height,
  },
  paddingBottom: {
    paddingBottom: 20,
  },
  paddingVerticalMedium: {
    paddingVertical: 40,
  },
  paddingVerticalBig: {
    paddingVertical: 70,
  },
  fivePercentWindowHeigthVerticalPadding: {
    paddingVertical: height * 0.05,
  },
  tenPercentWindowHeigthVerticalPadding: {
    paddingVertical: height * 0.1,
  },
  fiveteenPercentWindowHeigthVerticalPadding: {
    paddingVertical: height * 0.15,
  },
  tenPercentWindowWidthHorizontalPadding: {
    paddingHorizontal: width * 0.1,
  },
  marginTop: {
    marginTop: 10,
  },
  flexCol: {
    flexDirection: "column",
  },
  flexRow: {
    flexDirection: "row",
  },
  flexGapBig: {
    gap: 40,
  },
  flexGap: {
    gap: 20,
  },
  flexGapSmall: {
    gap: 10,
  },
  flexGapExtraSmall: {
    gap: 5,
  },
  flexGrow: {
    flex: 1,
  },
  alignCenter: {
    alignItems: "center",
  },
  alignStart: {
    alignItems: "flex-start",
  },
  uiText: {
    fontFamily: "Inter",
  },
  textTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textTitleBig: {
    fontSize: 25,
    marginBottom: 40,
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textBig: {
    fontSize: 22,
  },
  textExtraBig: {
    fontSize: 25,
  },
  textCenter: {
    textAlign: "center",
    justifyContent: "center",
  },
  textBold: {
    fontWeight: "bold",
  },
  textItalic: {
    fontStyle: "italic",
  },
  textBlack: {
    color: colorBlack,
  },
  textWhite: {
    color: colorWhiteBackground,
  },
  textGray: {
    color: colorGray,
  },
  navigationHeaderText: {
    fontFamily: "Inter",
    fontWeight: "bold",
  },
  navBarRigth: {
    flexGrow: 0.1,
  },
  whiteBackgroundColor: {
    backgroundColor: colorWhiteBackground,
  },
  grayBackgroundColor: {
    backgroundColor: colorBlack,
  },
  justifyCenter: {
    justifyContent: "center",
  },
  spaceBetween: {
    justifyContent: "space-between",
  },
  loginSignInButton: {
    borderColor: colorBlack,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  generalBorder: {
    borderStyle: "solid",
    borderColor: colorBlack,
    borderRadius: 10,
  },
  defaultBorder: {
    borderStyle: "solid",
    borderColor: colorBlack,
  },
  defaultBorderWidth: {
    borderWidth: 2.5,
  },
  mediumBorderWidth: {
    borderWidth: 2,
  },
  borderRadiusBig: {
    borderRadius: 35,
  },
  borderTopDisabled: {
    borderTopWidth: 0,
  },
  uiButton: {
    borderStyle: "solid",
    borderColor: colorBlack,
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    backgroundColor: colorBlack,
  },
  buttonDisabled: {
    opacity: 0.5,
    borderWidth: 0,
  },
  floatingRightButton: {
    width: 60,
    height: 60,
    borderRadius: 10,
    position: "absolute",
    bottom: 40,
    right: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    zIndex: 10,
    backgroundColor: colorBlack,
  },
  navigationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingBottom: 20,
    paddingTop: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  navigationHeaderSideBalanceSpace: {
    width: 40,
  },
});
