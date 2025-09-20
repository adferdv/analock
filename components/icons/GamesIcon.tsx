import Svg, { Path } from "react-native-svg";
import { colorBlack } from "../../constants/constants";

export const GamesIcon = () => (
  <Svg fill={colorBlack} width={"64px"} height={"64px"} viewBox="0 0 32 32">
    <Path d="M4.469 8.156v-2.25h2.25v2.25h-2.25zM15.688 5.906h2.219v2.25h-2.219v-2.25zM20.156 12.625v-4.469h2.25v8.969h-2.25v2.219h-2.25v2.25h2.25v2.25h2.25v2.219h-4.5v-2.219h-2.219v-2.25h-8.969v2.25h-2.25v2.219h-4.469v-2.219h2.25v-2.25h2.219v-2.25h-2.219v-2.219h-2.25v-8.969h2.25v4.469h2.219v-2.219h2.25v-2.25h2.25v2.25h4.469v-2.25h2.25v2.25h2.219v2.219h2.25zM8.969 14.875v-2.25h-2.25v2.25h2.25zM15.688 14.875v-2.25h-2.25v2.25h2.25z" />
  </Svg>
);
