import React from 'react';
import {Column} from '../../components/ui';
import {useTranslation} from 'react-i18next';
import {useQrLogin} from './QrLoginController';
import {VerifyIdentityOverlay} from '../VerifyIdentityOverlay';
import {MessageOverlay} from '../../components/MessageOverlay';
import {MyBindedVcs} from './MyBindedVcs';
import {QrLoginSuccess} from './QrLoginSuccessMessage';
import {QrConsent} from './QrConsent';
import {QrLoginRef} from '../../machines/QrLoginMachine';
import {Icon} from 'react-native-elements';
import {View} from 'react-native';
import {FaceVerificationAlertOverlay} from '../Scan/FaceVerificationAlertOverlay';
import {Error} from '../../components/ui/Error';
import {SvgImage} from '../../components/ui/svg';

export const QrLogin: React.FC<QrLoginProps> = props => {
  const controller = useQrLogin(props);
  const {t} = useTranslation('QrLogin');

  return (
    <View
      isVisible={props.isVisible}
      onDismiss={controller.DISMISS}
      headerTitle={t('title')}
      headerRight={<Icon name={''} />}>
      <Column fill>
        <MyBindedVcs
          isVisible={controller.isShowingVcList}
          service={props.service}
        />

        <MessageOverlay
          isVisible={
            controller.isWaitingForData ||
            controller.isLoadingMyVcs ||
            controller.isLinkTransaction ||
            controller.isSendingConsent ||
            controller.isSendingAuthenticate
          }
          title={t('loading')}
          progress
        />

        <MessageOverlay
          isVisible={controller.isShowingError}
          title={controller.error}
          onButtonPress={controller.DISMISS}
          testID="qrLoginError"
        />

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

        <FaceVerificationAlertOverlay
          isVisible={controller.isFaceVerificationConsent}
          onConfirm={controller.FACE_VERIFICATION_CONSENT}
          close={controller.DISMISS}
        />

        <QrConsent
          isVisible={controller.isRequestConsent}
          onConfirm={controller.CONFIRM}
          onCancel={controller.DISMISS}
          service={props.service}
        />

        <QrLoginSuccess
          isVisible={controller.isVerifyingSuccesful}
          onPress={controller.CONFIRM}
          service={props.service}
        />

        <Error
          isModal
          alignActionsOnEnd
          showClose={false}
          isVisible={controller.isInvalidIdentity}
          title={t('ScanScreen:postFaceCapture.captureFailureTitle')}
          message={t('ScanScreen:postFaceCapture.captureFailureMessage')}
          image={SvgImage.PermissionDenied()}
          primaryButtonTestID={'retry'}
          primaryButtonText={t('ScanScreen:status.retry')}
          primaryButtonEvent={controller.RETRY_VERIFICATION}
          textButtonTestID={'home'}
          textButtonText={t('ScanScreen:status.accepted.home')}
          textButtonEvent={controller.GO_TO_HOME}
          customImageStyles={{paddingBottom: 0, marginBottom: -6}}
          customStyles={{marginTop: '20%'}}
          testID={'shareWithSelfieError'}
        />
      </Column>
    </View>
  );
};

export interface QrLoginProps {
  isVisible: boolean;
  service: QrLoginRef;
}
