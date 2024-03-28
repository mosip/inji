import React from 'react';
import {FaceScanner} from '../components/FaceScanner';
import {Column} from '../components/ui';
import {Theme} from '../components/ui/styleUtils';
import {VerifiableCredential} from '../types/VC/vc';
import {Modal} from '../components/ui/Modal';
import {useTranslation} from 'react-i18next';

export const VerifyIdentityOverlay: React.FC<
  VerifyIdentityOverlayProps
> = props => {
  const {t} = useTranslation('VerifyIdentityOverlay');
  const credential = props.credential;
  const vcImage = props.verifiableCredentialData.face;

  return (
    <>
      <Modal
        isVisible={props.isVerifyingIdentity}
        arrowLeft={true}
        headerTitle={t('faceAuth')}
        onDismiss={props.onCancel}>
        <Column
          fill
          style={Theme.VerifyIdentityOverlayStyles.content}
          align="center">
          {credential != null && (
            <FaceScanner
              vcImage={vcImage}
              onValid={props.onFaceValid}
              onInvalid={props.onFaceInvalid}
            />
          )}
        </Column>
      </Modal>
    </>
  );
};

export interface VerifyIdentityOverlayProps {
  credential?: VerifiableCredential | Credential;
  verifiableCredentialData: any;
  isVerifyingIdentity: boolean;
  onCancel: () => void;
  onFaceValid: () => void;
  onFaceInvalid: () => void;
}
