import React from 'react';
import {Row} from '../../components/ui';
import {Modal} from '../../components/ui/Modal';
import {MessageOverlay} from '../../components/MessageOverlay';
import {ToastItem} from '../../components/ui/ToastItem';
import {useViewVcModal, ViewVcModalProps} from './ViewVcModalController';
import {useTranslation} from 'react-i18next';
import {OtpVerificationModal} from './MyVcs/OtpVerificationModal';
import {BindingVcWarningOverlay} from './MyVcs/BindingVcWarningOverlay';
import {VcDetailsContainer} from '../../components/VC/VcDetailsContainer';
import {TelemetryConstants} from '../../shared/telemetry/TelemetryConstants';
import {BannerNotificationContainer} from '../../components/BannerNotificationContainer';
import {Icon} from 'react-native-elements';
import {Theme} from '../../components/ui/styleUtils';
import testIDProps from '../../shared/commonUtil';
import {HelpScreen} from '../../components/HelpScreen';
import {Pressable} from 'react-native';
import {KebabPopUp} from '../../components/KebabPopUp';
import {SvgImage} from '../../components/ui/svg';
import {VCMetadata} from '../../shared/VCMetadata';
import {WalletBinding} from './MyVcs/WalletBinding';
import {RemoveVcWarningOverlay} from './MyVcs/RemoveVcWarningOverlay';
import {HistoryTab} from './MyVcs/HistoryTab';

export const ViewVcModal: React.FC<ViewVcModalProps> = props => {
  const {t} = useTranslation('ViewVcModal');
  const controller = useViewVcModal(props);
  const profileImage = controller.verifiableCredentialData.face;

  const headerRight = flow => {
    return flow === 'downloadedVc' ? (
      <Row align="space-between">
        <HelpScreen
          triggerComponent={
            <Icon
              {...testIDProps('help')}
              accessible={true}
              name="question"
              type="font-awesome"
              size={21}
              style={Theme.Styles.IconContainer}
              color={Theme.Colors.Icon}
            />
          }
        />
        <Pressable
          onPress={() => props.vcItemActor.send('KEBAB_POPUP')}
          accessible={false}>
          <KebabPopUp
            icon={SvgImage.kebabIcon()}
            iconColor={null}
            vcMetadata={controller.verifiableCredentialData.vcMetadata}
            iconName="dots-three-horizontal"
            iconType="entypo"
            isVisible={
              props.vcItemActor.getSnapshot()?.context
                .isMachineInKebabPopupState
            }
            onDismiss={() => props.vcItemActor.send('DISMISS')}
            service={props.vcItemActor}
            vcHasImage={profileImage !== undefined}
          />
        </Pressable>
      </Row>
    ) : undefined;
  };
  return (
    <Modal
      isVisible={props.isVisible}
      testID="idDetailsHeader"
      arrowLeft={true}
      headerRight={headerRight(props.flow)}
      headerTitle={t('title')}
      onDismiss={props.onDismiss}
      headerElevation={2}>
      <BannerNotificationContainer />
      <VcDetailsContainer
        credential={controller.credential}
        verifiableCredentialData={controller.verifiableCredentialData}
        onBinding={controller.addtoWallet}
        walletBindingResponse={controller.walletBindingResponse}
        activeTab={props.activeTab}
        vcHasImage={profileImage !== undefined}
      />

      {controller.isAcceptingBindingOtp && (
        <OtpVerificationModal
          service={props.vcItemActor}
          isVisible={controller.isAcceptingBindingOtp}
          onDismiss={controller.DISMISS}
          onInputDone={controller.inputOtp}
          error={controller.otpError}
          resend={controller.RESEND_OTP}
          phone={controller.isCommunicationDetails.phoneNumber}
          email={controller.isCommunicationDetails.emailId}
          flow={TelemetryConstants.FlowType.vcActivation}
        />
      )}

      <BindingVcWarningOverlay
        isVisible={controller.isBindingWarning}
        onConfirm={controller.CONFIRM}
        onCancel={controller.CANCEL}
      />

      <MessageOverlay
        testID="walletBindingError"
        isVisible={controller.isBindingError}
        title={controller.walletBindingError}
        onButtonPress={() => {
          controller.CANCEL();
        }}
      />

      <MessageOverlay
        isVisible={controller.isWalletBindingInProgress}
        title={t('inProgress')}
        progress
      />

      {controller.toastVisible && <ToastItem message={controller.message} />}

      <WalletBinding
        service={props.vcItemActor}
        vcMetadata={controller.verifiableCredentialData.vcMetadata}
      />

      <RemoveVcWarningOverlay
        testID="removeVcWarningOverlay"
        service={props.vcItemActor}
        vcMetadata={controller.verifiableCredentialData.vcMetadata}
      />

      <HistoryTab
        service={props.vcItemActor}
        vcMetadata={VCMetadata.fromVC(
          controller.verifiableCredentialData.vcMetadata,
        )}
      />
    </Modal>
  );
};
