import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";
import { colors } from "@/src/shared/ui/tokens";

type Props = TextInputProps & {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  error?: string;
  rightElement?: React.ReactNode;
};

export default function AuthField({ icon, error, rightElement, ...props }: Props) {
  // Password fields get an eye button to show what was typed.
  const [hidden, setHidden] = useState(true);
  return (
    <View>
      <View style={[styles.field, error ? styles.fieldError : undefined]}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.muted} style={styles.icon} />
        <TextInput
          {...props}
          secureTextEntry={props.secureTextEntry && hidden}
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        {props.secureTextEntry ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Mostrar contraseña" : "Ocultar contraseña"}
            onPress={() => setHidden(!hidden)}
            hitSlop={12}
            testID={props.testID ? `${props.testID}-toggle` : undefined}
          >
            <MaterialCommunityIcons name={hidden ? "eye-outline" : "eye-off-outline"} size={22} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
        {rightElement}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.88)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  fieldError: { borderColor: "#C62828" },
  icon: { width: 27 },
  // stretch: on web the input is only one text line tall, so most of the pill didn't react to taps.
  input: { flex: 1, alignSelf: "stretch", color: colors.text, fontSize: 15 },
  error: { marginTop: 4, marginLeft: 16, color: "#C62828", fontSize: 12 },
});
