import React from 'react';
import {
  Button as RNEButton,
  ButtonProps as RNEButtonProps,
} from 'react-native-elements';
import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Text } from './Text';
import { Colors, spacing } from './styleUtils';

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  solid: {
    backgroundColor: Colors.Orange,
  },
  clear: {
    backgroundColor: 'transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: Colors.Orange,
  },
  container: {
    minHeight: 48,
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.5,
  },
  addId: {
    backgroundColor: Colors.AddIdBtnBg,
  },
  clearAddIdBtnBg: {
    backgroundColor: Colors.ClearAddIdBtnBg,
  },
});

export const Button: React.FC<ButtonProps> = (props) => {
  const type = props.type || 'solid';
  const buttonStyle: StyleProp<ViewStyle> = [styles.fill, styles[type]];

  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    props.disabled ? styles.disabled : null,
    props.margin ? spacing('margin', props.margin) : null,
  ];

  const handleOnPress = (event: GestureResponderEvent) => {
    if (!props.disabled && props.onPress) {
      props.onPress(event);
    }
  };

  return (
    <RNEButton
      buttonStyle={buttonStyle}
      containerStyle={[props.fill ? styles.fill : null, containerStyle]}
      type={props.type}
      raised={props.raised}
      title={
        <Text
          weight="semibold"
          align="center"
          color={
            type === 'solid' || type === 'addId' ? Colors.White : Colors.Orange
          }>
          {props.title}
        </Text>
      }
      icon={props.icon}
      onPress={handleOnPress}
      loading={props.loading}
    />
  );
};

interface ButtonProps {
  title: string;
  disabled?: boolean;
  margin?: string;
  type?: RNEButtonProps['type'];
  onPress?: RNEButtonProps['onPress'];
  fill?: boolean;
  raised?: boolean;
  loading?: boolean;
  icon?: RNEButtonProps['icon'];
}
