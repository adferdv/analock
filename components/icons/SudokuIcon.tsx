import { Dimensions, View } from "react-native";
import { Line, Rect, Svg, Text } from "react-native-svg";
import { colorBlack, colorWhiteBackground } from "../../constants/constants";

const SudokuIcon: React.FC = () => {
  const { height } = Dimensions.get("window");
  const size = 0.12 * height;
  const numbers: string[] = ["7", "2", "5", "1", "9"];
  return (
    <View>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="8"
          fill={colorWhiteBackground}
          stroke={colorBlack}
          strokeWidth={1}
        />
        <Line
          x1="22"
          y1="2"
          x2="22"
          y2="62"
          stroke={colorBlack}
          strokeWidth={1}
        />
        <Line
          x1="42"
          y1="2"
          x2="42"
          y2="62"
          stroke={colorBlack}
          strokeWidth={1}
        />
        <Line
          x1="2"
          y1="22"
          x2="62"
          y2="22"
          stroke={colorBlack}
          strokeWidth={1}
        />
        <Line
          x1="2"
          y1="42"
          x2="62"
          y2="42"
          stroke={colorBlack}
          strokeWidth={1}
        />
        <Text
          x="12"
          y="12"
          fill={colorBlack}
          fontSize="12"
          fontWeight="700"
          fontFamily="Arial, Helvetica, sans-serif"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {numbers[0]}
        </Text>
        <Text
          x="32"
          y="32"
          fill={colorBlack}
          fontSize="12"
          fontWeight="700"
          fontFamily="Arial, Helvetica, sans-serif"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {numbers[1]}
        </Text>
        <Text
          x="52"
          y="52"
          fill={colorBlack}
          fontSize="12"
          fontWeight="700"
          fontFamily="Arial, Helvetica, sans-serif"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {numbers[2]}
        </Text>
        <Text
          x="12"
          y="52"
          fill={colorBlack}
          fontSize="12"
          fontWeight="700"
          fontFamily="Arial, Helvetica, sans-serif"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {numbers[3]}
        </Text>
        <Text
          x="52"
          y="12"
          fill={colorBlack}
          fontSize="12"
          fontWeight="700"
          fontFamily="Arial, Helvetica, sans-serif"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {numbers[4]}
        </Text>
      </Svg>
    </View>
  );
};

export default SudokuIcon;
