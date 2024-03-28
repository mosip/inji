// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    'done.invoke.checkStatus': {
      type: 'done.invoke.checkStatus';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.downloadCredential': {
      type: 'done.invoke.downloadCredential';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.vc-item-machine.kebabPopUp.triggerAutoBackup:invocation[0]': {
      type: 'done.invoke.vc-item-machine.kebabPopUp.triggerAutoBackup:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.vc-item-machine.loadVc.loadVcFromServer.loadDownloadLimitConfig:invocation[0]': {
      type: 'done.invoke.vc-item-machine.loadVc.loadVcFromServer.loadDownloadLimitConfig:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.vc-item-machine.loadVc.loadVcFromServer.verifyingDownloadLimitExpiry:invocation[0]': {
      type: 'done.invoke.vc-item-machine.loadVc.loadVcFromServer.verifyingDownloadLimitExpiry:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.vc-item-machine.verifyingCredential.triggerAutoBackupForVcDownload:invocation[0]': {
      type: 'done.invoke.vc-item-machine.verifyingCredential.triggerAutoBackupForVcDownload:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.vc-item-machine.verifyingCredential:invocation[0]': {
      type: 'done.invoke.vc-item-machine.verifyingCredential:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.vc-item-machine.walletBinding.acceptingBindingOTP.resendOTP:invocation[0]': {
      type: 'done.invoke.vc-item-machine.walletBinding.acceptingBindingOTP.resendOTP:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.vc-item-machine.walletBinding.addKeyPair:invocation[0]': {
      type: 'done.invoke.vc-item-machine.walletBinding.addKeyPair:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]': {
      type: 'done.invoke.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.vc-item-machine.walletBinding.requestingBindingOTP:invocation[0]': {
      type: 'done.invoke.vc-item-machine.walletBinding.requestingBindingOTP:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.vc-item-machine.walletBinding.updatingPrivateKey:invocation[0]': {
      type: 'done.invoke.vc-item-machine.walletBinding.updatingPrivateKey:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.checkStatus': {
      type: 'error.platform.checkStatus';
      data: unknown;
    };
    'error.platform.downloadCredential': {
      type: 'error.platform.downloadCredential';
      data: unknown;
    };
    'error.platform.vc-item-machine.loadVc.loadVcFromServer.verifyingDownloadLimitExpiry:invocation[0]': {
      type: 'error.platform.vc-item-machine.loadVc.loadVcFromServer.verifyingDownloadLimitExpiry:invocation[0]';
      data: unknown;
    };
    'error.platform.vc-item-machine.verifyingCredential:invocation[0]': {
      type: 'error.platform.vc-item-machine.verifyingCredential:invocation[0]';
      data: unknown;
    };
    'error.platform.vc-item-machine.walletBinding.acceptingBindingOTP.resendOTP:invocation[0]': {
      type: 'error.platform.vc-item-machine.walletBinding.acceptingBindingOTP.resendOTP:invocation[0]';
      data: unknown;
    };
    'error.platform.vc-item-machine.walletBinding.addKeyPair:invocation[0]': {
      type: 'error.platform.vc-item-machine.walletBinding.addKeyPair:invocation[0]';
      data: unknown;
    };
    'error.platform.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]': {
      type: 'error.platform.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]';
      data: unknown;
    };
    'error.platform.vc-item-machine.walletBinding.requestingBindingOTP:invocation[0]': {
      type: 'error.platform.vc-item-machine.walletBinding.requestingBindingOTP:invocation[0]';
      data: unknown;
    };
    'error.platform.vc-item-machine.walletBinding.updatingPrivateKey:invocation[0]': {
      type: 'error.platform.vc-item-machine.walletBinding.updatingPrivateKey:invocation[0]';
      data: unknown;
    };
    'xstate.init': {type: 'xstate.init'};
  };
  invokeSrcNameMap: {
    addWalletBindingId: 'done.invoke.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]';
    checkDownloadExpiryLimit: 'done.invoke.vc-item-machine.loadVc.loadVcFromServer.verifyingDownloadLimitExpiry:invocation[0]';
    checkStatus: 'done.invoke.checkStatus';
    downloadCredential: 'done.invoke.downloadCredential';
    generateKeyPair: 'done.invoke.vc-item-machine.walletBinding.addKeyPair:invocation[0]';
    isUserSignedAlready:
      | 'done.invoke.vc-item-machine.kebabPopUp.triggerAutoBackup:invocation[0]'
      | 'done.invoke.vc-item-machine.verifyingCredential.triggerAutoBackupForVcDownload:invocation[0]';
    loadDownloadLimitConfig: 'done.invoke.vc-item-machine.loadVc.loadVcFromServer.loadDownloadLimitConfig:invocation[0]';
    requestBindingOTP:
      | 'done.invoke.vc-item-machine.walletBinding.acceptingBindingOTP.resendOTP:invocation[0]'
      | 'done.invoke.vc-item-machine.walletBinding.requestingBindingOTP:invocation[0]';
    updatePrivateKey: 'done.invoke.vc-item-machine.walletBinding.updatingPrivateKey:invocation[0]';
    verifyCredential: 'done.invoke.vc-item-machine.verifyingCredential:invocation[0]';
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    addVcToInProgressDownloads: 'STORE_RESPONSE';
    closeViewVcModal: 'CLOSE_VC_MODAL' | 'STORE_RESPONSE';
    incrementDownloadCounter:
      | 'POLL'
      | 'done.invoke.vc-item-machine.loadVc.loadVcFromServer.loadDownloadLimitConfig:invocation[0]';
    logDownloaded: 'STORE_RESPONSE';
    logRemovedVc:
      | 'STORE_RESPONSE'
      | 'done.invoke.vc-item-machine.kebabPopUp.triggerAutoBackup:invocation[0]';
    logWalletBindingFailure:
      | 'error.platform.vc-item-machine.walletBinding.addKeyPair:invocation[0]'
      | 'error.platform.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]'
      | 'error.platform.vc-item-machine.walletBinding.requestingBindingOTP:invocation[0]'
      | 'error.platform.vc-item-machine.walletBinding.updatingPrivateKey:invocation[0]';
    logWalletBindingSuccess:
      | 'done.invoke.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]'
      | 'done.invoke.vc-item-machine.walletBinding.updatingPrivateKey:invocation[0]';
    refreshAllVcs:
      | 'STORE_RESPONSE'
      | 'done.invoke.vc-item-machine.kebabPopUp.triggerAutoBackup:invocation[0]';
    removeVcFromInProgressDownloads: 'STORE_RESPONSE';
    removeVcItem: 'CONFIRM';
    removeVcMetaDataFromStorage:
      | 'STORE_ERROR'
      | 'error.platform.vc-item-machine.verifyingCredential:invocation[0]';
    removeVcMetaDataFromVcMachineContext: 'DISMISS';
    requestStoredContext: 'GET_VC_RESPONSE';
    requestVcContext: 'DISMISS' | 'REFRESH' | 'STORE_ERROR' | 'xstate.init';
    resetPrivateKey:
      | 'done.invoke.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]'
      | 'done.invoke.vc-item-machine.walletBinding.updatingPrivateKey:invocation[0]';
    sendActivationStartEvent: 'CONFIRM';
    sendActivationSuccessEvent:
      | 'done.invoke.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]'
      | 'done.invoke.vc-item-machine.walletBinding.updatingPrivateKey:invocation[0]';
    sendBackupEvent:
      | 'done.invoke.vc-item-machine.kebabPopUp.triggerAutoBackup:invocation[0]'
      | 'done.invoke.vc-item-machine.verifyingCredential.triggerAutoBackupForVcDownload:invocation[0]';
    sendDownloadLimitExpire:
      | 'FAILED'
      | 'error.platform.vc-item-machine.loadVc.loadVcFromServer.verifyingDownloadLimitExpiry:invocation[0]';
    sendTamperedVc: 'TAMPERED_VC';
    sendTelemetryEvents: 'STORE_RESPONSE';
    sendUserCancelledActivationFailedEndEvent: 'DISMISS';
    sendVcUpdated: 'PIN_CARD';
    sendVerificationError: 'STORE_RESPONSE';
    sendWalletBindingErrorEvent:
      | 'error.platform.vc-item-machine.walletBinding.acceptingBindingOTP.resendOTP:invocation[0]'
      | 'error.platform.vc-item-machine.walletBinding.addKeyPair:invocation[0]'
      | 'error.platform.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]'
      | 'error.platform.vc-item-machine.walletBinding.requestingBindingOTP:invocation[0]'
      | 'error.platform.vc-item-machine.walletBinding.updatingPrivateKey:invocation[0]';
    sendWalletBindingSuccess: 'SHOW_BINDING_STATUS';
    setCommunicationDetails:
      | 'done.invoke.vc-item-machine.walletBinding.acceptingBindingOTP.resendOTP:invocation[0]'
      | 'done.invoke.vc-item-machine.walletBinding.requestingBindingOTP:invocation[0]';
    setContext: 'GET_VC_RESPONSE' | 'STORE_RESPONSE';
    setCredential: 'CREDENTIAL_DOWNLOADED';
    setDownloadInterval: 'done.invoke.vc-item-machine.loadVc.loadVcFromServer.loadDownloadLimitConfig:invocation[0]';
    setErrorAsVerificationError: 'error.platform.vc-item-machine.verifyingCredential:invocation[0]';
    setErrorAsWalletBindingError:
      | 'error.platform.vc-item-machine.walletBinding.acceptingBindingOTP.resendOTP:invocation[0]'
      | 'error.platform.vc-item-machine.walletBinding.addKeyPair:invocation[0]'
      | 'error.platform.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]'
      | 'error.platform.vc-item-machine.walletBinding.requestingBindingOTP:invocation[0]'
      | 'error.platform.vc-item-machine.walletBinding.updatingPrivateKey:invocation[0]';
    setMaxDownloadCount: 'done.invoke.vc-item-machine.loadVc.loadVcFromServer.loadDownloadLimitConfig:invocation[0]';
    setOTP: 'INPUT_OTP';
    setPinCard: 'PIN_CARD';
    setPrivateKey: 'done.invoke.vc-item-machine.walletBinding.addKeyPair:invocation[0]';
    setPublicKey: 'done.invoke.vc-item-machine.walletBinding.addKeyPair:invocation[0]';
    setThumbprintForWalletBindingId:
      | 'done.invoke.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]'
      | 'done.invoke.vc-item-machine.walletBinding.updatingPrivateKey:invocation[0]';
    setVcKey: 'REMOVE';
    setVcMetadata: 'UPDATE_VC_METADATA';
    setWalletBindingResponse: 'done.invoke.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]';
    storeContext:
      | 'done.invoke.vc-item-machine.verifyingCredential:invocation[0]'
      | 'done.invoke.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]'
      | 'done.invoke.vc-item-machine.walletBinding.updatingPrivateKey:invocation[0]';
    storeVcInContext:
      | 'STORE_RESPONSE'
      | 'done.invoke.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]'
      | 'done.invoke.vc-item-machine.walletBinding.updatingPrivateKey:invocation[0]';
    unSetBindingTransactionId: 'DISMISS';
    unSetError:
      | 'CANCEL'
      | 'done.invoke.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]'
      | 'done.invoke.vc-item-machine.walletBinding.updatingPrivateKey:invocation[0]';
    unSetOTP:
      | 'DISMISS'
      | 'done.invoke.vc-item-machine.walletBinding.requestingBindingOTP:invocation[0]';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    hasCredential: 'GET_VC_RESPONSE' | 'STORE_RESPONSE';
    isCustomSecureKeystore:
      | 'done.invoke.vc-item-machine.walletBinding.addKeyPair:invocation[0]'
      | 'done.invoke.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]';
    isDownloadAllowed: 'POLL';
    isSignedIn:
      | 'done.invoke.vc-item-machine.kebabPopUp.triggerAutoBackup:invocation[0]'
      | 'done.invoke.vc-item-machine.verifyingCredential.triggerAutoBackupForVcDownload:invocation[0]';
  };
  eventsCausingServices: {
    addWalletBindingId: 'done.invoke.vc-item-machine.walletBinding.addKeyPair:invocation[0]';
    checkDownloadExpiryLimit:
      | 'POLL'
      | 'done.invoke.vc-item-machine.loadVc.loadVcFromServer.loadDownloadLimitConfig:invocation[0]';
    checkStatus: 'done.invoke.vc-item-machine.loadVc.loadVcFromServer.verifyingDownloadLimitExpiry:invocation[0]';
    downloadCredential: 'DOWNLOAD_READY';
    generateKeyPair: 'INPUT_OTP';
    isUserSignedAlready: 'STORE_RESPONSE';
    loadDownloadLimitConfig: 'STORE_ERROR' | 'STORE_RESPONSE';
    requestBindingOTP: 'CONFIRM' | 'RESEND_OTP';
    updatePrivateKey: 'done.invoke.vc-item-machine.walletBinding.addingWalletBindingId:invocation[0]';
    verifyCredential: 'CREDENTIAL_DOWNLOADED';
  };
  matchesStates:
    | 'idle'
    | 'kebabPopUp'
    | 'kebabPopUp.idle'
    | 'kebabPopUp.pinCard'
    | 'kebabPopUp.removeWallet'
    | 'kebabPopUp.removingVc'
    | 'kebabPopUp.showActivities'
    | 'kebabPopUp.triggerAutoBackup'
    | 'loadVc'
    | 'loadVc.loadVcFromContext'
    | 'loadVc.loadVcFromServer'
    | 'loadVc.loadVcFromServer.checkingStatus'
    | 'loadVc.loadVcFromServer.downloadingCredential'
    | 'loadVc.loadVcFromServer.loadDownloadLimitConfig'
    | 'loadVc.loadVcFromServer.savingFailed'
    | 'loadVc.loadVcFromServer.savingFailed.idle'
    | 'loadVc.loadVcFromServer.savingFailed.viewingVc'
    | 'loadVc.loadVcFromServer.verifyingDownloadLimitExpiry'
    | 'loadVc.loadVcFromStore'
    | 'verifyingCredential'
    | 'verifyingCredential.handleVCVerificationFailure'
    | 'verifyingCredential.idle'
    | 'verifyingCredential.triggerAutoBackupForVcDownload'
    | 'walletBinding'
    | 'walletBinding.acceptingBindingOTP'
    | 'walletBinding.acceptingBindingOTP.idle'
    | 'walletBinding.acceptingBindingOTP.resendOTP'
    | 'walletBinding.addKeyPair'
    | 'walletBinding.addingWalletBindingId'
    | 'walletBinding.requestingBindingOTP'
    | 'walletBinding.showBindingWarning'
    | 'walletBinding.showingWalletBindingError'
    | 'walletBinding.updatingContextVariables'
    | 'walletBinding.updatingPrivateKey'
    | {
        kebabPopUp?:
          | 'idle'
          | 'pinCard'
          | 'removeWallet'
          | 'removingVc'
          | 'showActivities'
          | 'triggerAutoBackup';
        loadVc?:
          | 'loadVcFromContext'
          | 'loadVcFromServer'
          | 'loadVcFromStore'
          | {
              loadVcFromServer?:
                | 'checkingStatus'
                | 'downloadingCredential'
                | 'loadDownloadLimitConfig'
                | 'savingFailed'
                | 'verifyingDownloadLimitExpiry'
                | {savingFailed?: 'idle' | 'viewingVc'};
            };
        verifyingCredential?:
          | 'handleVCVerificationFailure'
          | 'idle'
          | 'triggerAutoBackupForVcDownload';
        walletBinding?:
          | 'acceptingBindingOTP'
          | 'addKeyPair'
          | 'addingWalletBindingId'
          | 'requestingBindingOTP'
          | 'showBindingWarning'
          | 'showingWalletBindingError'
          | 'updatingContextVariables'
          | 'updatingPrivateKey'
          | {acceptingBindingOTP?: 'idle' | 'resendOTP'};
      };
  tags: never;
}
