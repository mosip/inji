import React from 'react';
import {useTranslation} from 'react-i18next';
import {DeviceInfoList} from '../../components/DeviceInfoList';
import {Button, Column, Text} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {useReceiveVcScreen} from './ReceiveVcScreenController';
import {VerifyIdentityOverlay} from '../VerifyIdentityOverlay';
import {MessageOverlay} from '../../components/MessageOverlay';
import {useOverlayVisibleAfterTimeout} from '../../shared/hooks/useOverlayVisibleAfterTimeout';
import {VcDetailsContainer} from '../../components/VC/VcDetailsContainer';
import {SharingStatusModal} from '../Scan/SharingStatusModal';
import {SvgImage} from '../../components/ui/svg';

export const ReceiveVcScreen: React.FC = () => {
  const {t} = useTranslation('ReceiveVcScreen');
  const controller = useReceiveVcScreen();
  const savingOverlayVisible = useOverlayVisibleAfterTimeout(
    controller.isAccepting,
  );

  return (
    <React.Fragment>
      {controller.isDisplayingIncomingVC && (
        <Column
          scroll
          padding="24 0 48 0"
          backgroundColor={Theme.Colors.lightGreyBackgroundColor}>
          <Column>
            <DeviceInfoList of="sender" deviceInfo={controller.senderInfo} />
            <Text weight="semibold" margin="24 24 0 24">
              {t('header')}
            </Text>
            <VcDetailsContainer
              credential={controller.credential}
              verifiableCredentialData={controller.verifiableCredentialData}
              isBindingPending={false}
              activeTab={1}
            />
          </Column>
          <Column padding="0 24" margin="32 0 0 0">
            <Button
              title={t('goToReceivedVCTab')}
              margin="0 0 12 0"
              onPress={controller.GO_TO_RECEIVED_VC_TAB}
            />
          </Column>
        </Column>
      )}

      <VerifyIdentityOverlay
        credential={controller.selectCredential}
        verifiableCredentialData={controller.verifiableCredentialData}
        isVerifyingIdentity={controller.isVerifyingIdentity}
        onCancel={controller.CANCEL}
        onFaceValid={controller.FACE_VALID}
        onFaceInvalid={controller.FACE_INVALID}
        isInvalidIdentity={controller.isInvalidIdentity}
        onDismiss={controller.DISMISS}
        onRetryVerification={controller.RETRY_VERIFICATION}
      />

      <MessageOverlay
        isVisible={savingOverlayVisible}
        message={t('saving')}
        progress={true}
      />

      <SharingStatusModal
        isVisible={controller.isSavingFailedInIdle}
        testId={'savingFailedError'}
        image={SvgImage.ErrorLogo()}
        title={t('errors.savingFailed.title')}
        message={t('errors.savingFailed.message')}
        gradientButtonTitle={t('common:ok')}
        onGradientButton={controller.RESET}
      />
    </React.Fragment>
  );
};
