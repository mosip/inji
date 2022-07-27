import React from 'react';
import QRCode from 'react-native-qrcode-svg';
import { Centered, Column, Text } from '../../components/ui';
import { Colors } from '../../components/ui/styleUtils';
import { MainRouteProps } from '../../routes/main';
import { TimerBasedReceiveVcModal } from './TimerBasedReceiveVcModal';
import { MessageOverlay } from '../../components/MessageOverlay';
import { useRequestScreen } from './RequestScreenController';
import { SuccesfullyReceived } from '../../components/SuccesfullyReceived';
import { useTranslation } from 'react-i18next';
import { useIsFocused } from '@react-navigation/native';

export const TimerBasedRequestScreen: React.FC<MainRouteProps> = (props) => {
  const controller = useRequestScreen(props);
  const { t } = useTranslation('RequestScreen');
  const isFocused = useIsFocused();

  return (
    <Column fill padding="98 24 24 24" backgroundColor={Colors.LightGrey}>
      <Column>
        {controller.isBluetoothDenied ? (
          <Text color={Colors.Red} align="center">
            Please enable Bluetooth to be able to request{' '}
            {controller.vcLabel.singular}
          </Text>
        ) : (
          <Text align="center">
            Show this QR code to request {controller.vcLabel.singular}
          </Text>
        )}
      </Column>

      <Centered fill>
        {controller.isWaitingForConnection &&
        controller.connectionParams !== '' ? (
          <QRCode
            size={200}
            value={controller.connectionParams}
            backgroundColor={Colors.LightGrey}
          />
        ) : null}
      </Centered>

      {controller.statusMessage !== '' && (
        <Column elevation={1} padding="16 24">
          <Text>{controller.statusMessage}</Text>
        </Column>
      )}

      {isFocused && (
        <TimerBasedReceiveVcModal
          isVisible={controller.isReviewing}
          onDismiss={controller.REJECT}
          onAccept={controller.ACCEPT}
          onReject={controller.REJECT}
          onShow={controller.ACCEPT}
          headerTitle={``}
        />
      )}

      {isFocused && (
        <SuccesfullyReceived
          img="true"
          isVisible={controller.isAccepted}
          onBackdropPress={controller.DISMISS}
          onShow={controller.GOBACK}
        />
      )}

      {isFocused && (
        <MessageOverlay
          isVisible={controller.isRejected}
          title="Notice"
          message={`You rejected ${controller.senderInfo.deviceName}'s ${controller.vcLabel.singular}'`}
          onBackdropPress={controller.DISMISS}
        />
      )}

      {isFocused && (
        <MessageOverlay
          isVisible={controller.isDisconnected}
          title={t('Rejected')}
          message={t('The request to share ID was rejected')}
          onBackdropPress={controller.DISMISS}
        />
      )}
    </Column>
  );
};
