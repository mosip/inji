import React from 'react';
import { Overlay } from 'react-native-elements';

export const SuccesfullyReceived: React.FC<MessageOverlayProps> = (props) => {
  return (
    <Overlay
      isVisible={props.isVisible}
      onBackdropPress={props.onBackdropPress}
      onShow={props.onShow}></Overlay>
  );
};

interface MessageOverlayProps {
  isVisible: boolean;
  img?: string;
  title?: string;
  message?: string;
  hasProgress?: boolean;
  onBackdropPress?: () => void;
  onShow?: () => void;
}
