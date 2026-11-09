import { createStackNavigator } from "@react-navigation/stack";

/**
 * One stack factory shared by every navigator. Sharing the instance lets route
 * groups (see sharedScreens.tsx) be rendered inside more than one navigator.
 */
export const Stack = createStackNavigator();
