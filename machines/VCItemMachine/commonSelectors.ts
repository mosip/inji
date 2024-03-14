import {StateFrom} from 'xstate';
import {VCItemMachine} from './VCItemMachine';

type State = StateFrom<typeof VCItemMachine>;

export function selectVerifiableCredential(state: State) {
  return state.context.verifiableCredential;
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

export function selectIsPhoneNumber(state: State) {
  return state.context.phoneNumber;
}

export function selectIsEmail(state: State) {
  return state.context.email;
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

export function selectRequestBindingOTP(state: State) {
  return state.matches('walletBinding.requestBindingOTP');
}
