import React from 'react';
import { Icon } from 'react-native-elements';
import { Button, Centered, Column, Text } from '../components/ui';
import { Colors } from '../components/ui/styleUtils';
import { RootRouteProps } from '../routes';
import { useAuthScreen } from './AuthScreenController';

export const AuthScreen: React.FC<RootRouteProps> = (props) => {
  const controller = useAuthScreen(props);

  return (
    <Column fill padding="32" backgroundColor={Colors.White}>
      <Column>
        <Text align="center">
          Would you like to use biometrics{'\n'}to unlock the application?
        </Text>
      </Column>
      <Centered fill>
        <Icon name="fingerprint" size={180} color={Colors.Orange} />
      </Centered>
      <Column>
        <Button title="Use biometrics" margin="0 0 8 0" disabled={true} />
        <Button
          type="clear"
          title="I'd rather use a passcode"
          onPress={controller.usePasscode}
        />
      </Column>
    </Column>
  );
};
