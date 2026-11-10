import React from "react";

import { CreateProjectProvider } from "@/src/features/projects/presentation/context/createProjectContext";
import CreateProjectIntroScreen from "@/src/features/projects/presentation/screens/CreateProjectIntroScreen";
import ProjectBasicInfoScreen from "@/src/features/projects/presentation/screens/ProjectBasicInfoScreen";
import ProjectCreatedScreen from "@/src/features/projects/presentation/screens/ProjectCreatedScreen";
import ProjectGoalScreen from "@/src/features/projects/presentation/screens/ProjectGoalScreen";
import ProjectProblemScreen from "@/src/features/projects/presentation/screens/ProjectProblemScreen";
import ProjectReviewScreen from "@/src/features/projects/presentation/screens/ProjectReviewScreen";
import ProjectStageScreen from "@/src/features/projects/presentation/screens/ProjectStageScreen";
import ProjectTeamScreen from "@/src/features/projects/presentation/screens/ProjectTeamScreen";

import { Stack, stackOptions, successOptions } from "./stack";

/** The multi-step "create project" flow, opened as a modal over the tabs. */
export default function CreateProjectNavigator() {
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
        <Stack.Screen name="ProjectCreated" component={ProjectCreatedScreen} options={successOptions} />
      </Stack.Navigator>
    </CreateProjectProvider>
  );
}
