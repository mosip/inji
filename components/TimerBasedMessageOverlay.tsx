import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Overlay, LinearProgress } from 'react-native-elements';
import { Column, Text } from './ui';
import { Colors, elevation } from './ui/styleUtils';
import { Icon } from 'react-native-elements';

const styles = StyleSheet.create({
  overlay: {
    ...elevation(5),
    backgroundColor: Colors.White,
  },
});

export const TimerBasedMessageOverlay: React.FC<MessageOverlayProps> = (
  props
) => {
  return (
    <Overlay
      isVisible={props.isVisible}
      overlayStyle={styles.overlay}
      onBackdropPress={props.onBackdropPress}
      onShow={props.onShow}>
      {props.img ? (
        <Icon name="check-circle" size={100} color="#4af51b" />
      ) : null}

      <Column padding="24" width={Dimensions.get('screen').width * 0.8}>
        {props.title && (
          <Text weight="bold" margin="0 0 12 0" style={{ textAlign: 'center' }}>
            {props.title}
          </Text>
        )}
        {props.message && (
          <Text margin="0 0 12 0" style={{ textAlign: 'center' }}>
            {props.message}
          </Text>
        )}
        {props.hasProgress && (
          <LinearProgress variant="indeterminate" color={Colors.Orange} />
        )}
      </Column>
    </Overlay>
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
