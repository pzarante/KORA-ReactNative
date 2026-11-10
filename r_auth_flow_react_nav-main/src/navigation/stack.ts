import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";

/**
 * One stack factory shared by every navigator. Sharing the instance lets route
 * groups (see sharedScreens.tsx) be rendered inside more than one navigator.
 */
export const Stack = createStackNavigator();

// "float" stops the web build from growing each screen past the window and scrolling the whole page,
// which pushed bottom bars (e.g. ProjectDetail's tab bar) out of view. Headers are hidden, so phones look the same.
// Same horizontal slide on iOS and Android so moving deeper/back feels the same on every phone.
export const stackOptions = { headerShown: false, headerMode: "float", ...TransitionPresets.SlideFromRightIOS } as const;
// Creating a project is a separate task over the tabs: it rises from the bottom.
export const sheetOptions = { ...TransitionPresets.ModalSlideFromBottomIOS };
// Confirmation screens fade in and can't be swiped back to the form that was already sent.
export const successOptions = { ...TransitionPresets.ModalFadeTransition, gestureEnabled: false };
