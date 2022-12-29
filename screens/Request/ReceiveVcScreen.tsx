import React from 'react';
import { useTranslation } from 'react-i18next';

import { DeviceInfoList } from '../../components/DeviceInfoList';
import { Button, Column, Row, Text } from '../../components/ui';
import { Theme } from '../../components/ui/styleUtils';
import { VcDetails } from '../../components/VcDetails';
import { useReceiveVcScreen } from './ReceiveVcScreenController';
import { VerifyIdentityOverlay } from '../VerifyIdentityOverlay';
import { MessageOverlay } from '../../components/MessageOverlay';

export const ReceiveVcScreen: React.FC = () => {
  const { t } = useTranslation('ReceiveVcScreen');
  const controller = useReceiveVcScreen();

  return (
    <React.Fragment>
      <Column
        scroll
        padding="24 0 48 0"
        backgroundColor={Theme.Colors.lightGreyBackgroundColor}>
        <Column>
          <DeviceInfoList of="sender" deviceInfo={controller.senderInfo} />
          <Text weight="semibold" margin="24 24 0 24">
            {t('header', { vcLabel: controller.vcLabel.singular })}
          </Text>
          <VcDetails vc={controller.incomingVc} isBindingPending={false} />
        </Column>
        <Column padding="0 24" margin="32 0 0 0">
          {controller.incomingVc.shouldVerifyPresence ? (
            <Button
              type="outline"
              title={t('acceptRequestAndVerify')}
              margin="12 0 12 0"
              onPress={controller.ACCEPT_AND_VERIFY}
            />
          ) : (
            <Button
              title={t('acceptRequest', {
                vcLabel: controller.vcLabel.singular,
              })}
              margin="12 0 12 0"
              onPress={controller.ACCEPT}
            />
          )}
          <Button
            type="clear"
            title={t('reject')}
            margin="0 0 12 0"
            onPress={controller.REJECT}
          />
        </Column>
      </Column>

      <VerifyIdentityOverlay
        vc={controller.incomingVc}
        isVisible={controller.isVerifyingIdentity}
        onCancel={controller.CANCEL}
        onFaceValid={controller.FACE_VALID}
        onFaceInvalid={controller.FACE_INVALID}
      />

      <MessageOverlay
        isVisible={controller.isInvalidIdentity}
        title={t('VerifyIdentityOverlay:errors.invalidIdentity.title')}
        message={t(
          'VerifyIdentityOverlay:errors.invalidIdentity.messageNoRetry'
        )}
        onBackdropPress={controller.DISMISS}>
        <Row>
          <Button
            fill
            type="clear"
            title={t('common:dismiss')}
            onPress={controller.DISMISS}
            margin={[0, 8, 0, 0]}
          />
        </Row>
      </MessageOverlay>
    </React.Fragment>
  );
};
