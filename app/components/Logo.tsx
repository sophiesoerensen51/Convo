// components/Logo.tsx
import React from 'react';
import { Image, StyleSheet, ImageStyle } from 'react-native';

type LogoProps = {
  style?: ImageStyle;
};

const Logo = ({ style }: LogoProps) => (
  <Image
    source={require('../assets/ConvoLogo.png')}
    style={[styles.logo, style]}
    resizeMode="contain"
  />
);

const styles = StyleSheet.create({
  logo: {
    width: 250,
    height: 250,
    marginBottom: 10,
  },
});

export default Logo;
