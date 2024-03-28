import {VCMetadata} from '../../shared/VCMetadata';
import {VC} from '../../types/VC/vc';

export const VCItemEvent = {
  DISMISS: () => ({}),
  CREDENTIAL_DOWNLOADED: (response: VC) => ({response}),
  STORE_RESPONSE: (response: VC) => ({response}),
  STORE_ERROR: (error: Error) => ({error}),
  POLL: () => ({}),
  DOWNLOAD_READY: () => ({}),
  FAILED: () => ({}),
  GET_VC_RESPONSE: (response: VC) => ({response}),
  INPUT_OTP: (OTP: string) => ({OTP}),
  RESEND_OTP: () => ({}),
  REFRESH: () => ({}),
  ADD_WALLET_BINDING_ID: () => ({}),
  CANCEL: () => ({}),
  CONFIRM: () => ({}),
  PIN_CARD: () => ({}),
  KEBAB_POPUP: () => ({}),
  SHOW_ACTIVITY: () => ({}),
  CLOSE_VC_MODAL: () => ({}),
  REMOVE: (vcMetadata: VCMetadata) => ({vcMetadata}),
  UPDATE_VC_METADATA: (vcMetadata: VCMetadata) => ({vcMetadata}),
  TAMPERED_VC: (key: string) => ({key}),
  SHOW_BINDING_STATUS: () => ({}),
};
