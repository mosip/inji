import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Image} from 'react-native';
import {MAX_PIN, PasscodeVerify} from '../components/PasscodeVerify';
import {PinInput} from '../components/PinInput';
import {Column, Text} from '../components/ui';
import {Theme} from '../components/ui/styleUtils';
import {PasscodeRouteProps} from '../routes';
import {usePasscodeScreen} from './PasscodeScreenController';
import {hashData} from '../shared/commonUtil';
import {argon2iConfig} from '../shared/constants';
import {
  getEndEventData,
  getEventType,
  getImpressionEventData,
  resetRetryCount,
  sendEndEvent,
  sendImpressionEvent,
} from '../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../shared/telemetry/TelemetryConstants';

import {BackHandler} from 'react-native';
import {incrementRetryCount} from '../shared/telemetry/TelemetryUtils';

export const PasscodeScreen: React.FC<PasscodeRouteProps> = props => {
  const {t} = useTranslation('PasscodeScreen');
  const controller = usePasscodeScreen(props);
  const isSettingUp = props.route.params?.setup;

  useEffect(() => {
    sendImpressionEvent(
      getImpressionEventData(
        getEventType(isSettingUp),
        TelemetryConstants.Screens.passcode,
      ),
    );
  }, [isSettingUp]);

  const handleBackButtonPress = () => {
    sendEndEvent(
      getEndEventData(
        getEventType(isSettingUp),
        TelemetryConstants.EndEventStatus.failure,
        {
          errorId: TelemetryConstants.ErrorId.userCancel,
          errorMessage: TelemetryConstants.ErrorMessage.authenticationCancelled,
        },
      ),
    );
    return false;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonPress,
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  const setPasscode = async (passcode: string) => {
    const data = await hashData(passcode, controller.storedSalt, argon2iConfig);
    controller.setPasscode(data);
  };

  const handlePasscodeMismatch = (error: string) => {
    incrementRetryCount(
      getEventType(isSettingUp),
      TelemetryConstants.Screens.passcode,
    );
    controller.setError(error);
  };

  const passcodeSetup =
    controller.passcode === '' ? (
      <Column align="space-between">
        <Text
          testID="setPasscode"
          align="center"
          style={{...Theme.TextStyles.header, paddingTop: 27}}>
          {t('header')}
        </Text>
        <Text
          align="center"
          style={{paddingTop: 3}}
          weight="semibold"
          color={Theme.Colors.GrayText}
          margin="6 0">
          {t('enterNewPassword')}
        </Text>
        <PinInput
          testID="setPasscodePin"
          length={MAX_PIN}
          onDone={setPasscode}
        />
      </Column>
    ) : (
      <Column align="space-between">
        <Text
          testID="confirmPasscode"
          align="center"
          style={{...Theme.TextStyles.header, paddingTop: 27}}>
          {t('confirmPasscode')}
        </Text>
        <Text
          align="center"
          style={{paddingTop: 3}}
          weight="semibold"
          color={Theme.Colors.GrayText}
          margin="6 0">
          {t('reEnterPassword')}
        </Text>
        <PasscodeVerify
          onSuccess={() => {
            resetRetryCount();
            controller.SETUP_PASSCODE();
          }}
          onError={handlePasscodeMismatch}
          passcode={controller.passcode}
          salt={controller.storedSalt}
        />
      </Column>
    );

  const unlockPasscode = (
    <Column align="space-between">
      <Text
        testID="enterPasscode"
        style={{paddingTop: 3}}
        align="center"
        weight="semibold"
        color={Theme.Colors.GrayText}
        margin="6 0">
        {t('enterPasscode')}
      </Text>
      <PasscodeVerify
        onSuccess={() => {
          resetRetryCount();
          controller.LOGIN();
        }}
        onError={handlePasscodeMismatch}
        passcode={controller.storedPasscode}
        salt={controller.storedSalt}
      />
    </Column>
  );

  return (
    <Column
      fill
      align="space-between"
      style={{
        paddingHorizontal: 32,
      }}
      backgroundColor={Theme.Colors.whiteBackgroundColor}>
      <Image source={Theme.LockIcon} style={{alignSelf: 'center'}} />

      {isSettingUp ? passcodeSetup : unlockPasscode}

      <Text align="center" color={Theme.Colors.errorMessage}>
        {controller.error}
      </Text>
    </Column>
  );
};
