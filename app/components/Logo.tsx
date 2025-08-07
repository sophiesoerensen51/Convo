import React from 'react';
import { Image, StyleSheet, ImageStyle, ImageProps } from 'react-native';

type LogoProps = {
  style?: ImageStyle;
};

// Logo-komponenten som React.FC med eksplicit props-type
const Logo: React.FC<LogoProps> = ({ style }) => {
  return (
    <Image
      source={require('../assets/ConvoLogo.png')}
      style={[styles.logo, style]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 250,
    height: 250,
    marginBottom: 10,
  },
});

export default Logo;
