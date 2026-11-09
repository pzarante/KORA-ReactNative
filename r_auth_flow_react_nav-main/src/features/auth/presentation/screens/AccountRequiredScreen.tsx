import React from "react";
import { StyleSheet, View } from "react-native";

import AccountPrompt from "../components/AccountPrompt";
import AuthBrand from "../components/AuthBrand";
import AuthSurface from "../components/AuthSurface";

// Shown when a guest tries something that needs an account (crear o postularse a un proyecto).
export default function AccountRequiredScreen({ navigation }: { navigation: any }) {
  return (
    <AuthSurface scroll>
      <View style={styles.brand} testID="account-required-screen">
        <AuthBrand />
      </View>
      <AccountPrompt
        title="Crea una cuenta para unirte"
        text="Para participar en esta iniciativa, necesitas tener una cuenta en KORA. Así, podrás completar tu perfil, ser parte de la comunidad y colaborar en proyectos."
        primaryLabel="Registrarse  →"
        onPrimary={() => navigation.navigate("Signup")}
        secondaryLabel="Volver"
        onSecondary={() => navigation.goBack()}
      />
    </AuthSurface>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: "center", paddingTop: 50 },
});
