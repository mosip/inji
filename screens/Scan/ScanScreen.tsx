import React from 'react';
import { QrScanner } from '../../components/QrScanner';
import { Button, Column, Text } from '../../components/ui';
import { Colors } from '../../components/ui/styleUtils';
import { MainRouteProps } from '../../routes/main';
import { MessageOverlay } from '../../components/MessageOverlay';
import { useScanScreen } from './ScanScreenController';
import { useTranslation } from 'react-i18next';
import { UpdatedSendVcModal } from './UpdatedSendVcModal';

export const ScanScreen: React.FC<MainRouteProps> = (props) => {
  const { t } = useTranslation('ScanScreen');
  const controller = useScanScreen(props);

  return (
    <Column fill padding="98 24 24 24" backgroundColor={Colors.LightGrey}>
      <Text align="center">{t('header')}</Text>

      {controller.isLocationDisabled ||
      controller.isLocationDenied ||
      controller.isFlightMode ? (
        <Column fill align="space-between">
          <Text align="center" margin="16 0" color={Colors.Red}>
            {controller.locationError.message}
          </Text>
          <Button
            title={controller.locationError.button}
            onPress={controller.ON_REQUEST}
          />
        </Column>
      ) : null}

      {!controller.isEmpty ? (
        controller.isScanning && (
          <Column fill padding="16 0" crossAlign="center">
            <QrScanner onQrFound={controller.SCAN} />
          </Column>
        )
      ) : (
        <Text align="center" margin="16 0" color={Colors.Red}>
          {t('noShareableVcs', { vcLabel: controller.vcLabel.plural })}
        </Text>
      )}

      <MessageOverlay
        isVisible={controller.statusMessage !== ''}
        message={controller.statusMessage}
        hasProgress={!controller.isInvalid}
        onBackdropPress={controller.DISMISS_INVALID}
      />

      <UpdatedSendVcModal
        isVisible={controller.isReviewing}
        onDismiss={controller.DISMISS}
        headerElevation={2}
        headerTitle={t('sharingVc', { vcLabel: controller.vcLabel.singular })}
      />
    </Column>
  );
};
