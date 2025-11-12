import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

export const HOME_STYLES = StyleSheet.create({
  contentCard: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: height * 0.3,
    padding: 20,
    gap: 10,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 25,
    paddingVertical: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  statusBarprogressContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  statusBarprogressText: {
    position: "absolute",
    fontSize: 12,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 20,
  },
});
