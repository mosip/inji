import {useSelector} from '@xstate/react';
import {useContext} from 'react';
import {ActorRefFrom} from 'xstate';
import {
  selectDownloadingFailedVcs,
  selectInProgressVcDownloads,
  selectIsRefreshingMyVcs,
  selectIsTampered,
  selectMyVcs,
  selectMyVcsMetadata,
  selectVerificationErrorMessage,
  selectWalletBindingSuccess,
  VcEvents,
} from '../../machines/VCItemMachine/vc';
import {
  selectWalletBindingError,
  selectShowWalletBindingError,
} from '../../machines/VCItemMachine/VCItemSelectors';
import {GlobalContext} from '../../shared/GlobalContext';
import {HomeScreenTabProps} from './HomeScreen';
import {
  MyVcsTabEvents,
  MyVcsTabMachine,
  selectAddVcModal,
  selectGetVcModal,
  selectIsNetworkOff,
  selectIsRequestSuccessful,
  selectIsSavingFailedInIdle,
} from './MyVcsTabMachine';
import {
  selectShowHardwareKeystoreNotExistsAlert,
  SettingsEvents,
} from '../../machines/settings';
import {VCItemMachine} from '../../machines/VCItemMachine/VCItemMachine';

export function useMyVcsTab(props: HomeScreenTabProps) {
  const service = props.service as ActorRefFrom<typeof MyVcsTabMachine>;
  const {appService} = useContext(GlobalContext);
  const vcService = appService.children.get('vc')!!;
  const settingsService = appService.children.get('settings')!!;

  return {
    service,
    AddVcModalService: useSelector(service, selectAddVcModal),
    GetVcModalService: useSelector(service, selectGetVcModal),
    vcMetadatas: useSelector(vcService, selectMyVcsMetadata),
    isRefreshingVcs: useSelector(vcService, selectIsRefreshingMyVcs),
    isRequestSuccessful: useSelector(service, selectIsRequestSuccessful),
    isSavingFailedInIdle: useSelector(service, selectIsSavingFailedInIdle),
    walletBindingError: useSelector(service, selectWalletBindingError),
    isBindingError: useSelector(service, selectShowWalletBindingError),
    isBindingSuccess: useSelector(vcService, selectWalletBindingSuccess),
    isNetworkOff: useSelector(service, selectIsNetworkOff),
    inProgressVcDownloads: useSelector(vcService, selectInProgressVcDownloads),
    isTampered: useSelector(vcService, selectIsTampered),
    downloadFailedVcs: useSelector(vcService, selectDownloadingFailedVcs),
    vcData: useSelector(vcService, selectMyVcs),
    showHardwareKeystoreNotExistsAlert: useSelector(
      settingsService,
      selectShowHardwareKeystoreNotExistsAlert,
    ),
    verificationErrorMessage: useSelector(
      vcService,
      selectVerificationErrorMessage,
    ),

    SET_STORE_VC_ITEM_STATUS: () =>
      service.send(MyVcsTabEvents.SET_STORE_VC_ITEM_STATUS()),

    RESET_STORE_VC_ITEM_STATUS: () =>
      service.send(MyVcsTabEvents.RESET_STORE_VC_ITEM_STATUS()),

    RESET_IN_PROGRESS_VCS_DOWNLOADED: () =>
      vcService.send(VcEvents.RESET_IN_PROGRESS_VCS_DOWNLOADED()),

    DISMISS: () => service.send(MyVcsTabEvents.DISMISS()),

    TRY_AGAIN: () => service.send(MyVcsTabEvents.TRY_AGAIN()),

    DOWNLOAD_ID: () => service.send(MyVcsTabEvents.ADD_VC()),

    GET_VC: () => service.send(MyVcsTabEvents.GET_VC()),

    REFRESH: () => vcService.send(VcEvents.REFRESH_MY_VCS()),

    VIEW_VC: (vcRef: ActorRefFrom<typeof VCItemMachine>) => {
      return service.send(MyVcsTabEvents.VIEW_VC(vcRef));
    },

    DISMISS_WALLET_BINDING_NOTIFICATION_BANNER: () =>
      vcService?.send(VcEvents.RESET_WALLET_BINDING_SUCCESS()),

    ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS: () =>
      settingsService.send(SettingsEvents.ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS()),

    REMOVE_TAMPERED_VCS: () => vcService?.send(VcEvents.REMOVE_TAMPERED_VCS()),

    DELETE_VC: () => vcService?.send(VcEvents.DELETE_VC()),

    RESET_VERIFY_ERROR: () => {
      vcService?.send(VcEvents.RESET_VERIFY_ERROR());
    },
  };
}
