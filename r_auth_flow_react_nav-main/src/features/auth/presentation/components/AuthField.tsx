import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

type Props = TextInputProps & {
  icon: string;
  error?: string;
  rightElement?: React.ReactNode;
};

export default function AuthField({ icon, error, rightElement, ...props }: Props) {
  return (
    <View>
      <View style={[styles.field, error ? styles.fieldError : undefined]}>
        <Text style={styles.icon}>{icon}</Text>
        <TextInput
          {...props}
          placeholderTextColor="#756A8E"
          style={styles.input}
        />
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
    borderColor: "#E6DDF2",
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.88)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  fieldError: { borderColor: "#C62828" },
  icon: { width: 27, color: "#756A8E", fontSize: 20 },
  input: { flex: 1, color: "#211832", fontSize: 15 },
  error: { marginTop: 4, marginLeft: 16, color: "#C62828", fontSize: 12 },
});
