// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    'done.invoke.vc.tamperedVCs.triggerAutoBackupForTamperedVcDeletion:invocation[0]': {
      type: 'done.invoke.vc.tamperedVCs.triggerAutoBackupForTamperedVcDeletion:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'xstate.init': {type: 'xstate.init'};
  };
  invokeSrcNameMap: {
    isUserSignedAlready: 'done.invoke.vc.tamperedVCs.triggerAutoBackupForTamperedVcDeletion:invocation[0]';
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    addVcToInProgressDownloads: 'ADD_VC_TO_IN_PROGRESS_DOWNLOADS';
    getVcItemResponse: 'GET_VC_ITEM';
    loadMyVcs:
      | 'DOWNLOAD_LIMIT_EXPIRED'
      | 'REFRESH_MY_VCS'
      | 'REFRESH_VCS_METADATA'
      | 'STORE_RESPONSE'
      | 'VERIFY_VC_FAILED'
      | 'xstate.init';
    loadReceivedVcs: 'REFRESH_RECEIVED_VCS' | 'STORE_RESPONSE';
    logTamperedVCsremoved: 'done.invoke.vc.tamperedVCs.triggerAutoBackupForTamperedVcDeletion:invocation[0]';
    prependToMyVcs: 'VC_ADDED';
    removeDownloadFailedVcsFromStorage: 'DELETE_VC';
    removeDownloadingFailedVcsFromMyVcs: 'STORE_RESPONSE';
    removeVcFromInProgressDownlods:
      | 'DOWNLOAD_LIMIT_EXPIRED'
      | 'REMOVE_VC_FROM_IN_PROGRESS_DOWNLOADS'
      | 'VERIFY_VC_FAILED';
    removeVcFromMyVcs: 'REMOVE_VC_FROM_CONTEXT';
    resetDownloadFailedVcs: 'STORE_RESPONSE';
    resetInProgressVcsDownloaded: 'RESET_IN_PROGRESS_VCS_DOWNLOADED';
    resetVerificationErrorMessage: 'RESET_VERIFY_ERROR';
    resetWalletBindingSuccess: 'RESET_WALLET_BINDING_SUCCESS';
    sendBackupEvent: 'done.invoke.vc.tamperedVCs.triggerAutoBackupForTamperedVcDeletion:invocation[0]';
    setDownloadedVc: 'VC_DOWNLOADED';
    setDownloadingFailedVcs: 'DOWNLOAD_LIMIT_EXPIRED';
    setMyVcs: 'STORE_RESPONSE';
    setReceivedVcs: 'STORE_RESPONSE';
    setTamperedVcs: 'TAMPERED_VC';
    setUpdatedVcMetadatas: 'VC_METADATA_UPDATED';
    setVerificationErrorMessage: 'VERIFY_VC_FAILED';
    setWalletBindingSuccess: 'WALLET_BINDING_SUCCESS';
    updateMyVcs: 'VC_METADATA_UPDATED';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    isSignedIn: 'done.invoke.vc.tamperedVCs.triggerAutoBackupForTamperedVcDeletion:invocation[0]';
  };
  eventsCausingServices: {
    isUserSignedAlready: 'REMOVE_TAMPERED_VCS';
  };
  matchesStates:
    | 'deletingFailedVcs'
    | 'init'
    | 'init.myVcs'
    | 'init.receivedVcs'
    | 'ready'
    | 'ready.myVcs'
    | 'ready.myVcs.idle'
    | 'ready.myVcs.refreshing'
    | 'ready.receivedVcs'
    | 'ready.receivedVcs.idle'
    | 'ready.receivedVcs.refreshing'
    | 'tamperedVCs'
    | 'tamperedVCs.idle'
    | 'tamperedVCs.refreshVcsMetadata'
    | 'tamperedVCs.triggerAutoBackupForTamperedVcDeletion'
    | {
        init?: 'myVcs' | 'receivedVcs';
        ready?:
          | 'myVcs'
          | 'receivedVcs'
          | {
              myVcs?: 'idle' | 'refreshing';
              receivedVcs?: 'idle' | 'refreshing';
            };
        tamperedVCs?:
          | 'idle'
          | 'refreshVcsMetadata'
          | 'triggerAutoBackupForTamperedVcDeletion';
      };
  tags: never;
}
