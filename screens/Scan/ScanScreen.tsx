import React from 'react';
import { QrScanner } from '../../components/QrScanner';
import { Button, Column, Text } from '../../components/ui';
import { Theme } from '../../components/ui/styleUtils';
import { MainRouteProps } from '../../routes/main';
import { MessageOverlay } from '../../components/MessageOverlay';
import { useScanScreen } from './ScanScreenController';
import { useTranslation } from 'react-i18next';
import { SendVcModal } from './SendVcModal';

export const ScanScreen: React.FC<MainRouteProps> = (props) => {
  const { t } = useTranslation('ScanScreen');
  const controller = useScanScreen(props);

  return (
    <Column
      fill
      padding="98 24 24 24"
      backgroundColor={Theme.Colors.lightGreyBackgroundColor}>
      <Text align="center">{t('header')}</Text>

      {controller.isLocationDisabled ||
      controller.isLocationDenied ||
      controller.isFlightMode ? (
        <Column fill align="space-between">
          <Text align="center" margin="16 0" color={Theme.Colors.errorMessage}>
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
        <Text align="center" margin="16 0" color={Theme.Colors.errorMessage}>
          {t('noShareableVcs', { vcLabel: controller.vcLabel.plural })}
        </Text>
      )}

      <MessageOverlay
        isVisible={controller.statusMessage !== ''}
        message={controller.statusMessage}
        hasProgress={!controller.isInvalid}
        onBackdropPress={controller.DISMISS_INVALID}
      />

      <SendVcModal
        isVisible={controller.isReviewing}
        onDismiss={controller.DISMISS}
        headerElevation={2}
        headerTitle={t('sharingVc', { vcLabel: controller.vcLabel.singular })}
      />
    </Column>
  );
};
