import {StateFrom} from 'xstate';
import {VCMetadata} from '../../shared/VCMetadata';
import {VCItemMachine} from './VCItemMachine';
import {getMosipLogo} from '../../components/VC/common/VCUtils';

type State = StateFrom<typeof VCItemMachine>;

export function selectVerifiableCredential(state: State) {
  return state.context.verifiableCredential;
}

export function selectCredential(state: State) {
  return new VCMetadata(state.context.vcMetadata).isFromOpenId4VCI()
    ? state.context.verifiableCredential?.credential
    : state.context.verifiableCredential;
}

export function selectVerifiableCredentialData(state: State) {
  const vcMetadata = new VCMetadata(state.context.vcMetadata);
  return vcMetadata.isFromOpenId4VCI()
    ? {
        vcMetadata: vcMetadata,
        face: state.context.verifiableCredential?.credential?.credentialSubject
          .face,
        issuerLogo: state.context.verifiableCredential?.issuerLogo,
        wellKnown: state.context.verifiableCredential?.wellKnown,
        credentialTypes: state.context.verifiableCredential?.credentialTypes,
        issuer: vcMetadata.issuer,
      }
    : {
        vcMetadata: vcMetadata,
        issuer: vcMetadata.issuer,
        face: state.context.credential?.biometrics?.face,
        issuerLogo: getMosipLogo(),
      };
}

export function selectKebabPopUp(state: State) {
  return state.context.isMachineInKebabPopupState;
}

export function selectContext(state: State) {
  return state.context;
}

export function selectGeneratedOn(state: State) {
  return state.context.generatedOn;
}

export function selectWalletBindingSuccess(state: State) {
  return state.context.walletBindingResponse;
}

export function selectWalletBindingResponse(state: State) {
  return state.context.walletBindingResponse;
}

export function selectIsCommunicationDetails(state: State) {
  return state.context.communicationDetails;
}

export function selectWalletBindingError(state: State) {
  return state.context.error;
}

export function selectBindingAuthFailedError(state: State) {
  return state.context.error;
}

export function selectAcceptingBindingOtp(state: State) {
  return state.matches('walletBinding.acceptingBindingOTP');
}

export function selectWalletBindingInProgress(state: State) {
  return (
    state.matches('walletBinding.requestingBindingOTP') ||
    state.matches('walletBinding.addingWalletBindingId') ||
    state.matches('walletBinding.addKeyPair') ||
    state.matches('walletBinding.updatingPrivateKey')
  );
}

export function selectBindingWarning(state: State) {
  return state.matches('walletBinding.showBindingWarning');
}

export function selectRemoveWalletWarning(state: State) {
  return state.matches('kebabPopUp.removeWallet');
}

export function selectIsPinned(state: State) {
  return state.context.vcMetadata.isPinned;
}

export function selectOtpError(state: State) {
  return state.context.error;
}

export function selectShowActivities(state: State) {
  return state.matches('kebabPopUp.showActivities');
}

export function selectShowWalletBindingError(state: State) {
  return state.matches('walletBinding.showingWalletBindingError');
}

export function selectVc(state: State) {
  const {serviceRefs, ...data} = state.context;
  return data;
}

export function selectId(state: State) {
  return state.context.vcMetadata.id;
}
