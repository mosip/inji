import React from 'react';
import { View, Image } from 'react-native';
import { MosipLogo } from './ui/styleUtils';

export const Logo: React.FC<LogoProps> = (props) => {
  return (
    <View>
      <Image style={{ resizeMode: 'contain', ...props }} source={MosipLogo} />
    </View>
  );
};

interface LogoProps {
  width?: number | string;
  height?: number | string;
}
