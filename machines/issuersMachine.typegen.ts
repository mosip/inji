// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    'done.invoke.checkInternet': {
      type: 'done.invoke.checkInternet';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.issuersMachine.displayIssuers:invocation[0]': {
      type: 'done.invoke.issuersMachine.displayIssuers:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.issuersMachine.downloadCredentials:invocation[0]': {
      type: 'done.invoke.issuersMachine.downloadCredentials:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.issuersMachine.downloadIssuerConfig:invocation[0]': {
      type: 'done.invoke.issuersMachine.downloadIssuerConfig:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.issuersMachine.generateKeyPair:invocation[0]': {
      type: 'done.invoke.issuersMachine.generateKeyPair:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.issuersMachine.performAuthorization:invocation[0]': {
      type: 'done.invoke.issuersMachine.performAuthorization:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.issuersMachine.storing:invocation[0]': {
      type: 'done.invoke.issuersMachine.storing:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.issuersMachine.verifyingCredential:invocation[0]': {
      type: 'done.invoke.issuersMachine.verifyingCredential:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.checkInternet': {
      type: 'error.platform.checkInternet';
      data: unknown;
    };
    'error.platform.issuersMachine.displayIssuers:invocation[0]': {
      type: 'error.platform.issuersMachine.displayIssuers:invocation[0]';
      data: unknown;
    };
    'error.platform.issuersMachine.downloadCredentials:invocation[0]': {
      type: 'error.platform.issuersMachine.downloadCredentials:invocation[0]';
      data: unknown;
    };
    'error.platform.issuersMachine.downloadIssuerConfig:invocation[0]': {
      type: 'error.platform.issuersMachine.downloadIssuerConfig:invocation[0]';
      data: unknown;
    };
    'error.platform.issuersMachine.performAuthorization:invocation[0]': {
      type: 'error.platform.issuersMachine.performAuthorization:invocation[0]';
      data: unknown;
    };
    'error.platform.issuersMachine.verifyingCredential:invocation[0]': {
      type: 'error.platform.issuersMachine.verifyingCredential:invocation[0]';
      data: unknown;
    };
    'xstate.init': {type: 'xstate.init'};
  };
  invokeSrcNameMap: {
    checkInternet: 'done.invoke.checkInternet';
    downloadCredential: 'done.invoke.issuersMachine.downloadCredentials:invocation[0]';
    downloadIssuerConfig: 'done.invoke.issuersMachine.downloadIssuerConfig:invocation[0]';
    downloadIssuersList: 'done.invoke.issuersMachine.displayIssuers:invocation[0]';
    generateKeyPair: 'done.invoke.issuersMachine.generateKeyPair:invocation[0]';
    invokeAuthorization: 'done.invoke.issuersMachine.performAuthorization:invocation[0]';
    isUserSignedAlready: 'done.invoke.issuersMachine.storing:invocation[0]';
    verifyCredential: 'done.invoke.issuersMachine.verifyingCredential:invocation[0]';
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    getKeyPairFromStore:
      | 'TRY_AGAIN'
      | 'done.invoke.issuersMachine.performAuthorization:invocation[0]';
    loadKeyPair: 'STORE_RESPONSE';
    logDownloaded: 'done.invoke.issuersMachine.verifyingCredential:invocation[0]';
    resetError:
      | 'RESET_ERROR'
      | 'TRY_AGAIN'
      | 'error.platform.issuersMachine.performAuthorization:invocation[0]';
    resetLoadingReason:
      | 'RESET_ERROR'
      | 'done.invoke.checkInternet'
      | 'done.invoke.issuersMachine.displayIssuers:invocation[0]'
      | 'error.platform.issuersMachine.downloadCredentials:invocation[0]'
      | 'error.platform.issuersMachine.downloadIssuerConfig:invocation[0]'
      | 'error.platform.issuersMachine.performAuthorization:invocation[0]'
      | 'error.platform.issuersMachine.verifyingCredential:invocation[0]';
    resetVerificationErrorMessage: 'RESET_VERIFY_ERROR';
    sendBackupEvent: 'done.invoke.issuersMachine.storing:invocation[0]';
    sendErrorEndEvent: 'error.platform.issuersMachine.verifyingCredential:invocation[0]';
    sendImpressionEvent: 'done.invoke.issuersMachine.displayIssuers:invocation[0]';
    sendSuccessEndEvent: 'done.invoke.issuersMachine.verifyingCredential:invocation[0]';
    setCredentialWrapper: 'done.invoke.issuersMachine.downloadCredentials:invocation[0]';
    setError:
      | 'error.platform.issuersMachine.displayIssuers:invocation[0]'
      | 'error.platform.issuersMachine.downloadCredentials:invocation[0]'
      | 'error.platform.issuersMachine.downloadIssuerConfig:invocation[0]'
      | 'error.platform.issuersMachine.performAuthorization:invocation[0]';
    setIssuers: 'done.invoke.issuersMachine.displayIssuers:invocation[0]';
    setLoadingReasonAsDisplayIssuers: 'TRY_AGAIN';
    setLoadingReasonAsDownloadingCredentials:
      | 'STORE_ERROR'
      | 'STORE_RESPONSE'
      | 'TRY_AGAIN'
      | 'done.invoke.issuersMachine.generateKeyPair:invocation[0]';
    setLoadingReasonAsSettingUp:
      | 'SELECTED_ISSUER'
      | 'TRY_AGAIN'
      | 'done.invoke.issuersMachine.performAuthorization:invocation[0]';
    setMetadataInCredentialData: 'done.invoke.issuersMachine.verifyingCredential:invocation[0]';
    setNoInternet: 'done.invoke.checkInternet';
    setOIDCConfigError: 'error.platform.issuersMachine.performAuthorization:invocation[0]';
    setPrivateKey: 'done.invoke.issuersMachine.generateKeyPair:invocation[0]';
    setPublicKey: 'done.invoke.issuersMachine.generateKeyPair:invocation[0]';
    setSelectedIssuerId: 'SELECTED_ISSUER';
    setSelectedIssuers: 'done.invoke.issuersMachine.downloadIssuerConfig:invocation[0]';
    setTokenResponse: 'done.invoke.issuersMachine.performAuthorization:invocation[0]';
    setVCMetadata: 'done.invoke.issuersMachine.verifyingCredential:invocation[0]';
    setVerifiableCredential: 'done.invoke.issuersMachine.downloadCredentials:invocation[0]';
    storeKeyPair: 'done.invoke.issuersMachine.generateKeyPair:invocation[0]';
    storeVcMetaContext: 'done.invoke.issuersMachine.verifyingCredential:invocation[0]';
    storeVcsContext: 'done.invoke.issuersMachine.verifyingCredential:invocation[0]';
    storeVerifiableCredentialData: 'done.invoke.issuersMachine.verifyingCredential:invocation[0]';
    storeVerifiableCredentialMeta: 'done.invoke.issuersMachine.verifyingCredential:invocation[0]';
    updateVerificationErrorMessage: 'error.platform.issuersMachine.verifyingCredential:invocation[0]';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    canSelectIssuerAgain: 'TRY_AGAIN';
    hasKeyPair: 'CHECK_KEY_PAIR';
    hasUserCancelledBiometric: 'error.platform.issuersMachine.downloadCredentials:invocation[0]';
    isCustomSecureKeystore: 'done.invoke.issuersMachine.generateKeyPair:invocation[0]';
    isInternetConnected: 'done.invoke.checkInternet';
    isOIDCConfigError: 'error.platform.issuersMachine.performAuthorization:invocation[0]';
    isOIDCflowCancelled: 'error.platform.issuersMachine.performAuthorization:invocation[0]';
    isSignedIn: 'done.invoke.issuersMachine.storing:invocation[0]';
    shouldFetchIssuersAgain: 'TRY_AGAIN';
  };
  eventsCausingServices: {
    checkInternet: 'done.invoke.issuersMachine.downloadIssuerConfig:invocation[0]';
    downloadCredential:
      | 'CHECK_KEY_PAIR'
      | 'done.invoke.issuersMachine.generateKeyPair:invocation[0]';
    downloadIssuerConfig: 'SELECTED_ISSUER' | 'TRY_AGAIN';
    downloadIssuersList: 'TRY_AGAIN' | 'xstate.init';
    generateKeyPair: 'CHECK_KEY_PAIR';
    invokeAuthorization: 'done.invoke.checkInternet';
    isUserSignedAlready: 'done.invoke.issuersMachine.verifyingCredential:invocation[0]';
    verifyCredential: 'done.invoke.issuersMachine.downloadCredentials:invocation[0]';
  };
  matchesStates:
    | 'checkInternet'
    | 'checkKeyPair'
    | 'displayIssuers'
    | 'done'
    | 'downloadCredentials'
    | 'downloadCredentials.idle'
    | 'downloadCredentials.userCancelledBiometric'
    | 'downloadIssuerConfig'
    | 'error'
    | 'generateKeyPair'
    | 'handleVCVerificationFailure'
    | 'idle'
    | 'performAuthorization'
    | 'performAuthorization.idle'
    | 'performAuthorization.userCancelledBiometric'
    | 'selectingIssuer'
    | 'storing'
    | 'verifyingCredential'
    | {
        downloadCredentials?: 'idle' | 'userCancelledBiometric';
        performAuthorization?: 'idle' | 'userCancelledBiometric';
      };
  tags: never;
}
