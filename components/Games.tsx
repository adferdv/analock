import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { SudokuGame } from "./Sudoku";
import GameDetailScreen from "./Game";
import { Game2048 } from "./2048Game";
import { useContext } from "react";
import { TranslationsContext } from "../contexts/translationsContext";
import { NavigationHeader } from "./NavigationHeader";
import { FlatList, Text, View } from "react-native";
import { GENERAL_STYLES } from "../constants/general.styles";
import { FlatListCard } from "./FlatListCard";
import { useNavigation } from "@react-navigation/native";
import { colorPink, colorWhiteBackground } from "../constants/constants";
import {
  ActivityCompletionContext,
  ActivityKind,
} from "../contexts/activityCompletionContext";
import { GamesData } from "../types/game";
import SudokuIcon from "./icons/SudokuIcon";
import TTFEIcon from "./icons/TTFEIcon";

interface GameCard {
  name: string;
  icon: React.FC;
  component: React.FC;
}

export type GameStackParamList = {
  Games: undefined;
  Game: { name: string; component: React.FC };
};

const GamesScreen = () => {
  const GamesStack = createNativeStackNavigator();
  const translations = useContext(TranslationsContext)?.translations;
  return (
    <GamesStack.Navigator initialRouteName="Games">
      <GamesStack.Screen
        name="Games"
        component={Games}
        options={{
          headerTitle: translations?.home.games,
          header: (props) => (
            <NavigationHeader {...props} primaryHeaderStyle={true} />
          ),
        }}
      />
      <GamesStack.Screen
        name="Game"
        component={GameDetailScreen}
        options={({ route }) => ({
          headerTitle: route.params?.name as string,
          header: (props) => (
            <NavigationHeader {...props} primaryHeaderStyle={false} />
          ),
        })}
      />
    </GamesStack.Navigator>
  );
};

const Games: React.FC = () => {
  const games: GameCard[] = [
    {
      name: "Sudoku",
      icon: SudokuIcon,
      component: SudokuGame,
    },
    {
      name: "2048",
      icon: TTFEIcon,
      component: Game2048,
    },
  ];

  const navigation =
    useNavigation<NativeStackNavigationProp<GameStackParamList>>();
  const activityCompletionContext = useContext(ActivityCompletionContext);
  return (
    <FlatList
      numColumns={2}
      data={games}
      keyExtractor={(game) => game.name}
      renderItem={({ item, index }) => (
        <FlatListCard
          flatListIndex={index}
          onPress={() => {
            navigation.push("Game", {
              name: item.name,
              component: item.component,
            });
          }}
        >
          <View
            style={[
              GENERAL_STYLES.defaultBorder,
              GENERAL_STYLES.defaultBorderWidth,
              GENERAL_STYLES.alignCenter,
              GENERAL_STYLES.borderRadiusBig,
              GENERAL_STYLES.fivePercentWindowHeigthVerticalPadding,
              {
                backgroundColor:
                  activityCompletionContext !== null &&
                  (
                    activityCompletionContext.activityCompletionMap.get(
                      ActivityKind.Game,
                    ) as GamesData[]
                  )?.find((gameData) => gameData.name === item.name)?.won
                    ? colorPink
                    : colorWhiteBackground,
              },
            ]}
          >
            <item.icon />
          </View>
          <Text
            style={[
              GENERAL_STYLES.uiText,
              GENERAL_STYLES.textBlack,
              GENERAL_STYLES.textCenter,
            ]}
          >
            {item.name}
          </Text>
        </FlatListCard>
      )}
      contentContainerStyle={[
        GENERAL_STYLES.baseScreenPadding,
        GENERAL_STYLES.whiteBackgroundColor,
        GENERAL_STYLES.flexGrow,
      ]}
      removeClippedSubviews={false}
    />
  );
};

export default GamesScreen;
