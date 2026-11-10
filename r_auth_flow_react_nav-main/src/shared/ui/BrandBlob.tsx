import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type BrandBlobProps = {
  /** Solid color of the blob, as in the design's SVG circle. */
  color: string;
  /** Diameter of the solid circle inside the blob, before the soft glow. */
  diameter: number;
  /** Gaussian blur radius used in the design's SVG (drives the glow's spread). */
  blur: number;
  /** Overall opacity of the blob (the SVG group opacity, 0.15 in the design). */
  opacity?: number;
  /** Stacked circles used to fake the blur gradient; more layers look smoother. */
  layers?: number;
  /** Positioning for the absolutely-placed blob. */
  style?: StyleProp<ViewStyle>;
};

/**
 * Decorative blurred circle used as the brand atmosphere behind screens
 * ("Atmósfera de marca" in the Figma file). The design's SVGs are Gaussian-
 * blurred circles; React Native has no SVG filters, so the glow is faked with
 * a few stacked semi-transparent circles that add up to `opacity`.
 */
export default function BrandBlob({ color, diameter, blur, opacity = 0.15, layers = 5, style }: BrandBlobProps) {
  const spread = blur * 2; // a σ blur fades out about 2σ past the edge
  const size = diameter + spread * 2;
  const step = (spread * 2) / (layers - 1);
  // Opacity per layer so all layers stacked reach `opacity` at the center.
  const perLayer = 1 - Math.pow(1 - opacity, 1 / layers);

  return (
    <View pointerEvents="none" style={[styles.blob, style, { width: size, height: size }]}>
      {Array.from({ length: layers }, (_, index) => {
        const layerDiameter = diameter + step * index;
        return (
          <View
            key={index}
            style={{
              position: "absolute",
              left: (size - layerDiameter) / 2,
              top: (size - layerDiameter) / 2,
              width: layerDiameter,
              height: layerDiameter,
              borderRadius: layerDiameter / 2,
              backgroundColor: color,
              opacity: perLayer,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  blob: { alignItems: "center", justifyContent: "center" },
});
