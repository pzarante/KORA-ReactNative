import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { StyleSheet } from "react-native";

import { APP_TABS, openCreate } from "./AppTabBar";
import { useAuth } from "./features/auth/presentation/context/authContext";
import AccountRequiredScreen from "./features/auth/presentation/screens/AccountRequiredScreen";
import ForgotPasswordScreen from "./features/auth/presentation/screens/ForgotPasswordScreen";
import GuestProfileScreen from "./features/auth/presentation/screens/GuestProfileScreen";
import LoginScreen from "./features/auth/presentation/screens/LoginScreen";
import SignupScreen from "./features/auth/presentation/screens/SignupScreen";
import VerifyEmailScreen from "./features/auth/presentation/screens/VerifyEmailScreen";
import { ProductProvider } from "./features/products/presentation/context/productContext";
import AddProductScreen from "./features/products/presentation/screens/AddProductScreen";
import UpdateProductScreen from "./features/products/presentation/screens/UpdateProductScreen";
import WelcomeScreen from "./features/auth/presentation/screens/WelcomeScreen";
import OnboardingNameScreen from "./features/auth/presentation/screens/OnboardingNameScreen";
import OnboardingRoleScreen from "./features/auth/presentation/screens/OnboardingRoleScreen";
import OnboardingSkillsScreen from "./features/auth/presentation/screens/OnboardingSkillsScreen";
import OnboardingBioScreen from "./features/auth/presentation/screens/OnboardingBioScreen";
import OnboardingSuccessScreen from "./features/auth/presentation/screens/OnboardingSuccessScreen";
import { colors } from "./features/projects/presentation/components/projectUi";
import { CreateProjectProvider } from "./features/projects/presentation/context/createProjectContext";
import CreateProjectIntroScreen from "./features/projects/presentation/screens/CreateProjectIntroScreen";
import ProjectBasicInfoScreen from "./features/projects/presentation/screens/ProjectBasicInfoScreen";
import ProjectCreatedScreen from "./features/projects/presentation/screens/ProjectCreatedScreen";
import EditProjectScreen from "./features/projects/presentation/screens/EditProjectScreen";
import ProjectDetailScreen from "./features/projects/presentation/screens/ProjectDetailScreen";
import ProjectGoalScreen from "./features/projects/presentation/screens/ProjectGoalScreen";
import ProjectProblemScreen from "./features/projects/presentation/screens/ProjectProblemScreen";
import ProjectReviewScreen from "./features/projects/presentation/screens/ProjectReviewScreen";
import ProjectStageScreen from "./features/projects/presentation/screens/ProjectStageScreen";
import ProjectTeamScreen from "./features/projects/presentation/screens/ProjectTeamScreen";
import ApplicantProfileScreen from "./features/projects/presentation/screens/ApplicantProfileScreen";
import CommentsScreen from "./features/projects/presentation/screens/CommentsScreen";
import ExploreScreen from "./features/projects/presentation/screens/ExploreScreen";
import HomeFeedScreen from "./features/projects/presentation/screens/HomeFeedScreen";
import JoinRequestScreen from "./features/projects/presentation/screens/JoinRequestScreen";
import MemberJoinedScreen from "./features/projects/presentation/screens/MemberJoinedScreen";
import MyProjectsScreen from "./features/projects/presentation/screens/MyProjectsScreen";
import RequestSentScreen from "./features/projects/presentation/screens/RequestSentScreen";
import RequestsScreen from "./features/projects/presentation/screens/RequestsScreen";
import TeamMembersScreen from "./features/projects/presentation/screens/TeamMembersScreen";
import CompleteProfileScreen from "./features/auth/presentation/screens/CompleteProfileScreen";
import EditProfileScreen from "./features/auth/presentation/screens/EditProfileScreen";
import MyProfileScreen from "./features/auth/presentation/screens/MyProfileScreen";

const Stack = createStackNavigator();
// "float" stops the web build from growing each screen past the window and scrolling the whole page,
// which pushed bottom bars (e.g. ProjectDetail's tab bar) out of view. Headers are hidden, so phones look the same.
const stackOptions = { headerShown: false, headerMode: "float" } as const;
const Tab = createBottomTabNavigator();

// The "+" tab never shows a screen: pressing it opens the create-project flow over the tabs.
function NoScreen() {
  return null;
}

// Screens a guest can also open from the feed; the rest need an account.
const publicFeedScreens = [
  <Stack.Screen key="ProjectDetail" name="ProjectDetail" component={ProjectDetailScreen} />,
  <Stack.Screen key="TeamMembers" name="TeamMembers" component={TeamMembersScreen} />,
  <Stack.Screen key="Comments" name="Comments" component={CommentsScreen} />,
];

function CreateProjectFlow() {
  return (
    <CreateProjectProvider>
      <Stack.Navigator screenOptions={stackOptions}>
        <Stack.Screen name="CreateProjectIntro" component={CreateProjectIntroScreen} />
        <Stack.Screen name="ProjectStage" component={ProjectStageScreen} />
        <Stack.Screen name="ProjectBasicInfo" component={ProjectBasicInfoScreen} />
        <Stack.Screen name="ProjectProblem" component={ProjectProblemScreen} />
        <Stack.Screen name="ProjectGoal" component={ProjectGoalScreen} />
        <Stack.Screen name="ProjectTeam" component={ProjectTeamScreen} />
        <Stack.Screen name="ProjectReview" component={ProjectReviewScreen} />
        <Stack.Screen name="ProjectCreated" component={ProjectCreatedScreen} />
      </Stack.Navigator>
    </CreateProjectProvider>
  );
}

// Without a session the same tabs work as guest mode: account-only actions open AccountRequired.
function ContentTabs() {
  const { isLoggedIn } = useAuth();
  const TAB_SCREENS = {
    Home: HomeFeedScreen,
    Explore: ExploreScreen,
    Create: NoScreen,
    MyProjects: MyProjectsScreen,
    Profile: isLoggedIn ? MyProfileScreen : GuestProfileScreen,
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.tabLabel,
        // KORA screens are always light; without this the bar follows the phone's dark mode.
        tabBarStyle: { backgroundColor: "#FFFFFF", borderTopColor: colors.border },
      }}
    >
      {APP_TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={TAB_SCREENS[tab.name]}
          listeners={tab.name === "Create" ? ({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              openCreate(navigation, isLoggedIn);
            },
          }) : undefined}
          options={{
            tabBarLabel: tab.label,
            tabBarAccessibilityLabel: tab.name === "Create" ? "Crear proyecto" : undefined,
            tabBarButtonTestID: tab.name === "Create" ? "create-project-tab" : undefined,
            tabBarIcon: ({ color }) => <Feather name={tab.icon} size={24} color={color} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

function AuthenticatedStack() {
  const { needsOnboarding } = useAuth();

  return (
    <ProductProvider>
      <Stack.Navigator
        initialRouteName={needsOnboarding ? "OnboardingName" : "App"}
        screenOptions={stackOptions}
      >
        <Stack.Screen name="App" component={ContentTabs} />
        <Stack.Screen name="OnboardingName" component={OnboardingNameScreen} />
        <Stack.Screen name="OnboardingRole" component={OnboardingRoleScreen} />
        <Stack.Screen name="OnboardingSkills" component={OnboardingSkillsScreen} />
        <Stack.Screen name="OnboardingBio" component={OnboardingBioScreen} />
        <Stack.Screen name="OnboardingSuccess" component={OnboardingSuccessScreen} />
        <Stack.Screen name="CreateProject" component={CreateProjectFlow} />
        {publicFeedScreens}
        <Stack.Screen name="JoinRequest" component={JoinRequestScreen} />
        <Stack.Screen name="RequestSent" component={RequestSentScreen} />
        <Stack.Screen name="Requests" component={RequestsScreen} />
        <Stack.Screen name="EditProject" component={EditProjectScreen} />
        <Stack.Screen name="ApplicantProfile" component={ApplicantProfileScreen} />
        <Stack.Screen name="MemberJoined" component={MemberJoinedScreen} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen
          name="AddProductScreen"
          component={AddProductScreen}
          options={{
            title: "Add Product",
            headerShown: true,
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="UpdateProductScreen"
          component={UpdateProductScreen}
          options={{
            title: "Update Product",
            headerShown: true,
            presentation: "modal",
          }}
        />
      </Stack.Navigator>
    </ProductProvider>
  );
}

export default function AuthFlow() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator screenOptions={stackOptions}>
      {isLoggedIn ? (
        <Stack.Screen name="Authenticated" component={AuthenticatedStack} />
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} /> 
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          {/* Same name as the logged-in tabs so "go home" (popTo("App")) works in both modes. */}
          <Stack.Screen name="App" component={ContentTabs} />
          {publicFeedScreens}
          <Stack.Screen name="AccountRequired" component={AccountRequiredScreen} />
          <Stack.Screen name="OnboardingName" component={OnboardingNameScreen} />
          <Stack.Screen name="OnboardingRole" component={OnboardingRoleScreen} />
          <Stack.Screen name="OnboardingSkills" component={OnboardingSkillsScreen} />
          <Stack.Screen name="OnboardingBio" component={OnboardingBioScreen} />
          <Stack.Screen name="OnboardingSuccess" component={OnboardingSuccessScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabLabel: { fontSize: 12, fontWeight: "700" },
});
