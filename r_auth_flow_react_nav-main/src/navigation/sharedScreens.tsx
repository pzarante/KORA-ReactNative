import React from "react";

import OnboardingBioScreen from "@/src/features/auth/presentation/screens/OnboardingBioScreen";
import OnboardingNameScreen from "@/src/features/auth/presentation/screens/OnboardingNameScreen";
import OnboardingRoleScreen from "@/src/features/auth/presentation/screens/OnboardingRoleScreen";
import OnboardingSkillsScreen from "@/src/features/auth/presentation/screens/OnboardingSkillsScreen";
import OnboardingSuccessScreen from "@/src/features/auth/presentation/screens/OnboardingSuccessScreen";
import CommentsScreen from "@/src/features/projects/presentation/screens/CommentsScreen";
import ProjectDetailScreen from "@/src/features/projects/presentation/screens/ProjectDetailScreen";
import TeamMembersScreen from "@/src/features/projects/presentation/screens/TeamMembersScreen";

import { Stack } from "./stack";

/** Screens a guest can also open from the feed; the rest need an account. */
export const publicFeedScreens = [
  <Stack.Screen key="ProjectDetail" name="ProjectDetail" component={ProjectDetailScreen} />,
  <Stack.Screen key="TeamMembers" name="TeamMembers" component={TeamMembersScreen} />,
  <Stack.Screen key="Comments" name="Comments" component={CommentsScreen} />,
];

/** Onboarding is reachable from both the logged-out and logged-in stacks. */
export const onboardingScreens = [
  <Stack.Screen key="OnboardingName" name="OnboardingName" component={OnboardingNameScreen} />,
  <Stack.Screen key="OnboardingRole" name="OnboardingRole" component={OnboardingRoleScreen} />,
  <Stack.Screen key="OnboardingSkills" name="OnboardingSkills" component={OnboardingSkillsScreen} />,
  <Stack.Screen key="OnboardingBio" name="OnboardingBio" component={OnboardingBioScreen} />,
  <Stack.Screen key="OnboardingSuccess" name="OnboardingSuccess" component={OnboardingSuccessScreen} />,
];
