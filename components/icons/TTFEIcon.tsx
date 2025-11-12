import { Dimensions, View } from "react-native";
import { G, Line, Rect, Svg, Text } from "react-native-svg";
import { colorBlack, colorWhiteBackground } from "../../constants/constants";

const TTFEIcon: React.FC = () => {
  const { height } = Dimensions.get("window");
  const size = 0.12 * height;
  const scale = 1;
  const fontSize = 10 * scale;
  const tiles = [
    { value: "2", row: 1, col: 0, color: "#EDE0C8" },
    { value: "0", row: 1, col: 1, color: colorWhiteBackground },
    { value: "4", row: 1, col: 2, color: "#F2B179" },
    { value: "8", row: 1, col: 3, color: "#F59563" },
  ];

  // Helper function to get tile position
  const getTilePosition = (row: number, col: number) => {
    const cellSize = 15 * scale;
    const startX = 2.5 * scale;
    const startY = 2.5 * scale;
    return {
      x: startX + col * cellSize,
      y: startY + row * cellSize,
      width: (cellSize - 1) * scale,
      height: (cellSize - 1) * scale,
      centerX: startX + col * cellSize + (cellSize / 2) * scale,
      centerY: startY + row * cellSize + (cellSize / 2) * scale,
    };
  };

  return (
    <View>
      <Svg width={size} height={size} viewBox={`0 0 64 64`}>
        <Rect
          x={2 * scale}
          y={2 * scale}
          width={60 * scale}
          height={60 * scale}
          rx={8 * scale}
          fill={colorWhiteBackground}
          stroke={colorBlack}
          strokeWidth={scale}
        />
        {/* Vertical grid lines */}
        <Line
          x1={17 * scale}
          y1={2 * scale}
          x2={17 * scale}
          y2={62 * scale}
          stroke={colorBlack}
          strokeWidth={scale}
        />
        <Line
          x1={32 * scale}
          y1={2 * scale}
          x2={32 * scale}
          y2={62 * scale}
          stroke={colorBlack}
          strokeWidth={scale}
        />
        <Line
          x1={47 * scale}
          y1={2 * scale}
          x2={47 * scale}
          y2={62 * scale}
          stroke={colorBlack}
          strokeWidth={scale}
        />

        <Line
          x1={2 * scale}
          y1={17 * scale}
          x2={62 * scale}
          y2={17 * scale}
          stroke={colorBlack}
          strokeWidth={scale}
        />
        <Line
          x1={2 * scale}
          y1={32 * scale}
          x2={62 * scale}
          y2={32 * scale}
          stroke={colorBlack}
          strokeWidth={scale}
        />
        <Line
          x1={2 * scale}
          y1={47 * scale}
          x2={62 * scale}
          y2={47 * scale}
          stroke={colorBlack}
          strokeWidth={scale}
        />
        <G>
          {tiles.map((tile, index) => {
            const pos = getTilePosition(tile.row, tile.col);
            return (
              <G key={index}>
                <Rect
                  x={pos.x}
                  y={pos.y}
                  width={pos.width}
                  height={pos.height}
                  fill={tile.color}
                />
                <Text
                  x={pos.centerX}
                  y={pos.centerY}
                  fill={colorBlack}
                  fontSize={fontSize}
                  fontWeight="700"
                  fontFamily="Arial, Helvetica, sans-serif"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {tile.value}
                </Text>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

export default TTFEIcon;
