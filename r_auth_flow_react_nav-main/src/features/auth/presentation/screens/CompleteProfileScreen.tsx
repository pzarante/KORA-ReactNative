import React from "react";
import { View } from "react-native";

import AccountPrompt from "../components/AccountPrompt";
import ScreenSurface from "@/src/shared/ui/ScreenSurface";

export default function CompleteProfileScreen({ navigation }: { navigation: any }) {
  return (
    <ScreenSurface>
      <View style={{ flex: 1 }} testID="complete-profile-screen">
        <AccountPrompt
          icon="pencil"
          title="Completa tu perfil para unirte"
          text="Para participar en esta iniciativa, necesitas completar la información de tu perfil. Así, otras personas podrán conocerte y colaborar contigo."
          primaryLabel="Completar mi perfil"
          onPrimary={() => navigation.replace("EditProfile")}
          secondaryLabel="Volver al proyecto"
          onSecondary={() => navigation.goBack()}
        />
      </View>
    </ScreenSurface>
  );
}
