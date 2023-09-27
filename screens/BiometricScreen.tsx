import React from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { Button, Centered, Column } from '../components/ui';
import { Theme } from '../components/ui/styleUtils';
import { RootRouteProps } from '../routes';
import { useBiometricScreen } from './BiometricScreenController';
import { Passcode } from '../components/Passcode';

export const BiometricScreen: React.FC<RootRouteProps> = (props) => {
  const { t } = useTranslation('BiometricScreen');
  const controller = useBiometricScreen(props);

  return (
    <Column
      fill
      pY={32}
      pX={32}
      backgroundColor={Theme.Colors.whiteBackgroundColor}>
      <Centered fill>
        <TouchableOpacity onPress={controller.useBiometrics}>
          <Icon name="fingerprint" size={180} color={Theme.Colors.Icon} />
        </TouchableOpacity>
      </Centered>

      <Button
        type="gradient"
        title={t('unlock')}
        margin="8 0"
        onPress={controller.useBiometrics}
        disabled={controller.isSuccessBio}
      />
      {controller.isReEnabling && (
        <Passcode
          message="Enter your passcode to re-enable biometrics authentication."
          onSuccess={() => controller.onSuccess()}
          onError={(value: string) => controller.onError(value)}
          storedPasscode={controller.storedPasscode}
          onDismiss={() => controller.onDismiss()}
          error={controller.error}
        />
      )}
    </Column>
  );
};
