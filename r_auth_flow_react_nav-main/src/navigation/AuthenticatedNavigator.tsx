import React from "react";

import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import CompleteProfileScreen from "@/src/features/auth/presentation/screens/CompleteProfileScreen";
import EditProfileScreen from "@/src/features/auth/presentation/screens/EditProfileScreen";
import ApplicantProfileScreen from "@/src/features/projects/presentation/screens/ApplicantProfileScreen";
import EditProjectScreen from "@/src/features/projects/presentation/screens/EditProjectScreen";
import JoinRequestScreen from "@/src/features/projects/presentation/screens/JoinRequestScreen";
import MemberJoinedScreen from "@/src/features/projects/presentation/screens/MemberJoinedScreen";
import RequestSentScreen from "@/src/features/projects/presentation/screens/RequestSentScreen";
import RequestsScreen from "@/src/features/projects/presentation/screens/RequestsScreen";

import EditMeetingScreen from "@/src/features/koranode/presentation/screens/EditMeetingScreen";
import KoraNodeScreen from "@/src/features/koranode/presentation/screens/KoraNodeScreen";
import KoraNodeSyncedScreen from "@/src/features/koranode/presentation/screens/KoraNodeSyncedScreen";
import MeetingHistoryScreen from "@/src/features/koranode/presentation/screens/MeetingHistoryScreen";
import MeetingInProgressScreen from "@/src/features/koranode/presentation/screens/MeetingInProgressScreen";
import MeetingNoteScreen from "@/src/features/koranode/presentation/screens/MeetingNoteScreen";

import AppTabsNavigator from "./AppTabsNavigator";
import CreateProjectNavigator from "./CreateProjectNavigator";
import { onboardingScreens, publicFeedScreens } from "./sharedScreens";
import { sheetOptions, Stack, stackOptions, successOptions } from "./stack";

/** Stack for a logged-in user: tabs, onboarding, project flows and profile modals. */
export default function AuthenticatedNavigator() {
  const { needsOnboarding } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={needsOnboarding ? "OnboardingName" : "App"}
      screenOptions={stackOptions}
    >
      <Stack.Screen name="App" component={AppTabsNavigator} />
      {onboardingScreens}
      <Stack.Screen
        name="CreateProject"
        component={CreateProjectNavigator}
        options={sheetOptions}
      />
      {publicFeedScreens}
      <Stack.Screen name="JoinRequest" component={JoinRequestScreen} />
      <Stack.Screen
        name="RequestSent"
        component={RequestSentScreen}
        options={successOptions}
      />
      <Stack.Screen name="Requests" component={RequestsScreen} />
      <Stack.Screen name="EditProject" component={EditProjectScreen} />
      <Stack.Screen
        name="ApplicantProfile"
        component={ApplicantProfileScreen}
      />
      <Stack.Screen
        name="MemberJoined"
        component={MemberJoinedScreen}
        options={successOptions}
      />

      {/* KORA NODE */}
      <Stack.Screen name="KoraNode" component={KoraNodeScreen} />
      <Stack.Screen
        name="KoraNodeSynced"
        component={KoraNodeSyncedScreen}
        options={successOptions}
      />
      <Stack.Screen
        name="MeetingInProgress"
        component={MeetingInProgressScreen}
      />
      <Stack.Screen name="MeetingNote" component={MeetingNoteScreen} />
      <Stack.Screen name="EditMeeting" component={EditMeetingScreen} />
      <Stack.Screen name="MeetingHistory" component={MeetingHistoryScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}
