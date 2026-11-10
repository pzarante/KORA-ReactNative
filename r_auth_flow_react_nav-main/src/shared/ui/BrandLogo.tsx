import React from "react";
import { Image, StyleSheet } from "react-native";

type Props = {
  /** Rendered size in points. Defaults to the 54px size from the Figma reference. */
  size?: number;
};

export default function BrandLogo({ size = 54 }: Props) {
  return (
    <Image
      accessibilityLabel="Kora"
      source={require("../../../assets/images/kora-k.png")}
      resizeMode="contain"
      style={[styles.logo, { width: size, height: size }]}
    />
  );
}

const styles = StyleSheet.create({
  logo: { aspectRatio: 1 },
});
