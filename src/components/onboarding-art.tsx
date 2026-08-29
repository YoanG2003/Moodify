import { Image } from 'expo-image';
import { StyleSheet, View, type ImageStyle, type ViewStyle } from 'react-native';

type Step = 0 | 1 | 2 | 3 | 4;

function Layer({ source, style }: { source: number; style: ImageStyle }) {
  return <Image source={source} style={[styles.layer, style]} contentFit="fill" />;
}

export function OnboardingShapes({ step, style }: { step: Step; style?: ViewStyle }) {
  return (
    <View pointerEvents="none" style={[styles.shapesViewport, style]}>
      <Image
        source={require('../../assets/figma/onboarding/shapes.svg')}
        style={[styles.shapes, { left: 31 - (step * 400) }]}
        contentFit="fill"
      />
    </View>
  );
}

export function OnboardingArt({ step }: { step: Step }) {
  if (step === 0) {
    return <Image source={require('../../assets/figma/onboarding/welcome.png')} style={styles.welcome} contentFit="contain" />;
  }
  if (step === 1) return <OverwhelmedArt />;
  if (step === 2) return <RelaxArt />;
  if (step === 3) return <MotivatedArt />;
  return <NegativeEmotionsArt />;
}

function OverwhelmedArt() {
  return (
    <View style={[styles.art, styles.overwhelmed]}>
      <Layer source={require('../../assets/figma/onboarding/overwhelmed-floor.svg')} style={position(15, 171, 259, 150)} />
      <Layer source={require('../../assets/figma/onboarding/overwhelmed-shadow.svg')} style={position(67, 222, 138, 75)} />
      <Layer source={require('../../assets/figma/onboarding/overwhelmed-prism.svg')} style={position(187, 50, 67, 87)} />
      <Layer source={require('../../assets/figma/onboarding/overwhelmed-prism-small.svg')} style={position(30, 90, 85, 79)} />
      <Layer source={require('../../assets/figma/onboarding/overwhelmed-lines.svg')} style={position(64, 10, 143, 130)} />
      <Layer source={require('../../assets/figma/onboarding/overwhelmed-cylinder.svg')} style={position(125, 50, 90, 50)} />
      <Layer source={require('../../assets/figma/onboarding/overwhelmed-cube.svg')} style={position(71, 50, 68, 77)} />
      <Layer source={require('../../assets/figma/onboarding/overwhelmed-prism-wide.svg')} style={position(98, 79, 112, 90)} />
      <Layer source={require('../../assets/figma/onboarding/overwhelmed-sphere.svg')} style={position(65, 103, 66, 66)} />
      <Layer source={require('../../assets/figma/onboarding/overwhelmed-vase.svg')} style={position(30, 96, 222, 77)} />
      <Layer source={require('../../assets/figma/onboarding/overwhelmed-bottom.svg')} style={position(79, 182, 144, 107)} />
      <Layer source={require('../../assets/figma/onboarding/overwhelmed-top.svg')} style={position(85, 93, 129, 107)} />
      <Layer source={require('../../assets/figma/onboarding/overwhelmed-bolts.svg')} style={position(0, 0, 281, 184)} />
      <Layer source={require('../../assets/figma/onboarding/overwhelmed-speech.svg')} style={position(122, 83, 53, 30)} />
    </View>
  );
}

function RelaxArt() {
  return (
    <View style={[styles.art, styles.relax]}>
      <Layer source={require('../../assets/figma/onboarding/relax-background.svg')} style={position(0, 8, 338, 297)} />
      <Layer source={require('../../assets/figma/onboarding/relax-fishes.svg')} style={position(39, 0, 246, 334)} />
      <Layer source={require('../../assets/figma/onboarding/relax-shadow.svg')} style={position(103, 87, 205, 243)} />
      <Layer source={require('../../assets/figma/onboarding/relax-character.svg')} style={position(60, 38, 231, 274)} />
      <Layer source={require('../../assets/figma/onboarding/relax-lines.svg')} style={position(125, 77, 104, 157)} />
      <Layer source={require('../../assets/figma/onboarding/relax-water.svg')} style={position(30, 16, 284, 285)} />
      <Layer source={require('../../assets/figma/onboarding/relax-plants.svg')} style={position(38, 130, 271, 146)} />
    </View>
  );
}

function MotivatedArt() {
  return (
    <View style={[styles.art, styles.motivated]}>
      <Layer source={require('../../assets/figma/onboarding/motivated-background.svg')} style={position(86, 0, 250, 101)} />
      <Layer source={require('../../assets/figma/onboarding/motivated-arrow.svg')} style={position(14, 56, 316, 173)} />
      <Layer source={require('../../assets/figma/onboarding/motivated-character-4.svg')} style={position(208, 64, 57, 165)} />
      <Layer source={require('../../assets/figma/onboarding/motivated-character-5.svg')} style={position(244, 97, 88, 132)} />
      <Layer source={require('../../assets/figma/onboarding/motivated-character-3.svg')} style={position(110, 2, 109, 182)} />
      <Layer source={require('../../assets/figma/onboarding/motivated-character-2.svg')} style={position(39, 41, 62, 188)} />
      <Layer source={require('../../assets/figma/onboarding/motivated-character-1.svg')} style={position(5, 62, 58, 167)} />
      <Layer source={require('../../assets/figma/onboarding/motivated-speech-right.svg')} style={position(246, 33, 30, 28)} />
      <Layer source={require('../../assets/figma/onboarding/motivated-speech-left.svg')} style={position(29, 34, 30, 28)} />
      <Layer source={require('../../assets/figma/onboarding/motivated-desk.svg')} style={position(208, 101, 74, 128)} />
    </View>
  );
}

function NegativeEmotionsArt() {
  return (
    <View style={[styles.art, styles.negative]}>
      <Layer source={require('../../assets/figma/onboarding/negative-background.svg')} style={position(7, 0, 308, 308)} />
      <Layer source={require('../../assets/figma/onboarding/negative-shape.svg')} style={position(10, 8, 296, 295)} />
      <Layer source={require('../../assets/figma/onboarding/negative-wall.svg')} style={position(0, 0, 316, 309)} />
      <Layer source={require('../../assets/figma/onboarding/negative-character.svg')} style={position(48, 57, 220, 179)} />
      <Layer source={require('../../assets/figma/onboarding/negative-lines.svg')} style={position(191, 94, 101, 103)} />
      <Layer source={require('../../assets/figma/onboarding/negative-bricks.svg')} style={position(7, 49, 302, 195)} />
    </View>
  );
}

function position(left: number, top: number, width: number, height: number): ImageStyle {
  return { left, top, width, height };
}

const styles = StyleSheet.create({
  layer: { position: 'absolute' },
  shapesViewport: { position: 'absolute', inset: 0, overflow: 'hidden' },
  shapes: { position: 'absolute', top: 0, width: 1942.26, height: 545.506 },
  welcome: { width: 375, height: 279, alignSelf: 'center' },
  art: { position: 'relative', alignSelf: 'center' },
  overwhelmed: { width: 281, height: 320 },
  relax: { width: 338, height: 334 },
  motivated: { width: 335, height: 229 },
  negative: { width: 316, height: 309 },
});
