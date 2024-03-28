// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    '': {type: ''};
    'done.invoke.QrLogin': {
      type: 'done.invoke.QrLogin';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.scan.checkStorage:invocation[0]': {
      type: 'done.invoke.scan.checkStorage:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'done.invoke.scan.reviewing.creatingVp:invocation[0]': {
      type: 'done.invoke.scan.reviewing.creatingVp:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'xstate.after(DESTROY_TIMEOUT)#scan.clearingConnection': {
      type: 'xstate.after(DESTROY_TIMEOUT)#scan.clearingConnection';
    };
    'xstate.init': {type: 'xstate.init'};
    'xstate.stop': {type: 'xstate.stop'};
  };
  invokeSrcNameMap: {
    checkBluetoothPermission: 'done.invoke.scan.checkBluetoothPermission.checking:invocation[0]';
    checkBluetoothState:
      | 'done.invoke.scan.checkBluetoothState.checking:invocation[0]'
      | 'done.invoke.scan.recheckBluetoothState.checking:invocation[0]';
    checkLocationPermission: 'done.invoke.scan.checkingLocationState.checkingPermissionStatus:invocation[0]';
    checkLocationStatus: 'done.invoke.scan.checkingLocationState.checkLocationService:invocation[0]';
    checkNearByDevicesPermission: 'done.invoke.scan.checkNearbyDevicesPermission.checking:invocation[0]';
    checkStorageAvailability: 'done.invoke.scan.checkStorage:invocation[0]';
    createVp: 'done.invoke.scan.reviewing.creatingVp:invocation[0]';
    disconnect:
      | 'done.invoke.scan.clearingConnection:invocation[0]'
      | 'done.invoke.scan.disconnectDevice:invocation[0]'
      | 'done.invoke.scan.reviewing.disconnect:invocation[0]';
    monitorConnection: 'done.invoke.scan:invocation[0]';
    requestBluetooth: 'done.invoke.scan.checkBluetoothState.requesting:invocation[0]';
    requestNearByDevicesPermission: 'done.invoke.scan.checkNearbyDevicesPermission.requesting:invocation[0]';
    requestToEnableLocationPermission: 'done.invoke.scan.checkingLocationState.requestToEnableLocation:invocation[0]';
    sendVc: 'done.invoke.scan.reviewing.sendingVc:invocation[0]';
    startConnection: 'done.invoke.scan.connecting:invocation[0]';
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    clearCreatedVp:
      | ''
      | 'BLE_ERROR'
      | 'DISCONNECT'
      | 'RESET'
      | 'RETRY'
      | 'SCREEN_BLUR'
      | 'SCREEN_FOCUS'
      | 'SELECT_VC'
      | 'xstate.stop';
    clearUri: 'STORE_RESPONSE';
    getFaceAuthConsent:
      | 'DISCONNECT'
      | 'DISMISS'
      | 'xstate.after(DESTROY_TIMEOUT)#scan.clearingConnection';
    logFailedVerification: 'FACE_INVALID';
    logShared: 'VC_ACCEPTED';
    openAppPermission: 'GOTO_SETTINGS' | 'LOCATION_REQUEST';
    openBluetoothSettings: 'GOTO_SETTINGS';
    registerLoggers: 'STORE_RESPONSE';
    removeLoggers:
      | 'DISCONNECT'
      | 'DISMISS'
      | 'SCREEN_BLUR'
      | 'STORE_RESPONSE'
      | 'xstate.init';
    resetFaceCaptureBannerStatus: 'ACCEPT_REQUEST' | 'CLOSE_BANNER';
    resetFlowType: 'GOTO_HISTORY';
    resetSelectedVc: 'GOTO_HISTORY';
    resetShouldVerifyPresence: 'CANCEL' | 'CONNECTED' | 'DISMISS' | 'RETRY';
    sendBLEConnectionErrorEvent: 'BLE_ERROR';
    sendScanData: 'SCAN';
    sendVCShareFlowCancelEndEvent: 'CANCEL';
    sendVCShareFlowTimeoutEndEvent: 'CANCEL' | 'RETRY';
    sendVcShareSuccessEvent: 'VC_ACCEPTED';
    sendVcSharingStartEvent: 'SCAN';
    setBleError: 'BLE_ERROR';
    setChildRef: 'STORE_RESPONSE';
    setCreatedVp: 'done.invoke.scan.reviewing.creatingVp:invocation[0]';
    setFlowType: 'SELECT_VC';
    setLinkCode: 'SCAN';
    setReadyForBluetoothStateCheck: 'BLUETOOTH_PERMISSION_ENABLED';
    setReceiverInfo: 'CONNECTED';
    setSelectedVc: 'SELECT_VC';
    setSenderInfo: 'CONNECTED';
    setShareLogTypeUnverified: 'ACCEPT_REQUEST' | 'CHECK_FLOW_TYPE';
    setShareLogTypeVerified: 'FACE_VALID';
    setShowFaceAuthConsent: 'FACE_VERIFICATION_CONSENT';
    setUri: 'SCAN';
    storeLoginItem: 'done.invoke.QrLogin';
    storeShowFaceAuthConsent: 'FACE_VERIFICATION_CONSENT';
    storingActivityLog: 'STORE_RESPONSE';
    toggleShouldVerifyPresence: 'TOGGLE_USER_CONSENT';
    updateFaceCaptureBannerStatus: 'FACE_VALID';
    updateShowFaceAuthConsent: 'STORE_RESPONSE';
  };
  eventsCausingDelays: {
    CONNECTION_TIMEOUT: 'SCAN';
    DESTROY_TIMEOUT: '' | 'DISMISS' | 'LOCATION_ENABLED' | 'RETRY';
    SHARING_TIMEOUT:
      | 'ACCEPT_REQUEST'
      | 'CHECK_FLOW_TYPE'
      | 'FACE_VALID'
      | 'done.invoke.scan.reviewing.creatingVp:invocation[0]';
  };
  eventsCausingGuards: {
    isFlowTypeMiniViewShare: 'CHECK_FLOW_TYPE';
    isFlowTypeMiniViewShareWithSelfie: 'CHECK_FLOW_TYPE';
    isFlowTypeSimpleShare: 'CANCEL' | 'CHECK_FLOW_TYPE' | 'DISMISS';
    isIOS: 'BLUETOOTH_STATE_DISABLED' | 'START_PERMISSION_CHECK';
    isMinimumStorageRequiredForAuditEntryReached: 'done.invoke.scan.checkStorage:invocation[0]';
    isOpenIdQr: 'SCAN';
    isQrLogin: 'SCAN';
    showFaceAuthConsentScreen: 'VERIFY_AND_ACCEPT_REQUEST';
    uptoAndroid11: '' | 'START_PERMISSION_CHECK';
  };
  eventsCausingServices: {
    QrLogin: 'SCAN';
    checkBluetoothPermission:
      | ''
      | 'BLUETOOTH_STATE_DISABLED'
      | 'NEARBY_ENABLED'
      | 'START_PERMISSION_CHECK';
    checkBluetoothState: '' | 'APP_ACTIVE';
    checkLocationPermission: 'APP_ACTIVE' | 'LOCATION_ENABLED';
    checkLocationStatus: '' | 'LOCATION_REQUEST';
    checkNearByDevicesPermission: 'APP_ACTIVE' | 'START_PERMISSION_CHECK';
    checkStorageAvailability: 'RESET' | 'SCREEN_FOCUS' | 'SELECT_VC';
    createVp: never;
    disconnect: '' | 'DISMISS' | 'LOCATION_ENABLED' | 'RETRY' | 'SCREEN_BLUR';
    monitorConnection: 'DISMISS' | 'SCREEN_BLUR' | 'xstate.init';
    requestBluetooth: 'BLUETOOTH_STATE_DISABLED';
    requestNearByDevicesPermission: 'NEARBY_DISABLED';
    requestToEnableLocationPermission: 'LOCATION_DISABLED';
    sendVc:
      | 'ACCEPT_REQUEST'
      | 'CHECK_FLOW_TYPE'
      | 'FACE_VALID'
      | 'done.invoke.scan.reviewing.creatingVp:invocation[0]';
    startConnection: 'SCAN';
  };
  matchesStates:
    | 'bluetoothDenied'
    | 'bluetoothPermissionDenied'
    | 'checkBluetoothPermission'
    | 'checkBluetoothPermission.checking'
    | 'checkBluetoothPermission.enabled'
    | 'checkBluetoothState'
    | 'checkBluetoothState.checking'
    | 'checkBluetoothState.enabled'
    | 'checkBluetoothState.requesting'
    | 'checkFaceAuthConsent'
    | 'checkNearbyDevicesPermission'
    | 'checkNearbyDevicesPermission.checking'
    | 'checkNearbyDevicesPermission.enabled'
    | 'checkNearbyDevicesPermission.requesting'
    | 'checkStorage'
    | 'checkingLocationState'
    | 'checkingLocationState.checkLocationService'
    | 'checkingLocationState.checkingPermissionStatus'
    | 'checkingLocationState.denied'
    | 'checkingLocationState.disabled'
    | 'checkingLocationState.requestToEnableLocation'
    | 'clearingConnection'
    | 'connecting'
    | 'connecting.inProgress'
    | 'connecting.timeout'
    | 'disconnectDevice'
    | 'disconnected'
    | 'findingConnection'
    | 'handlingBleError'
    | 'inactive'
    | 'invalid'
    | 'nearByDevicesPermissionDenied'
    | 'recheckBluetoothState'
    | 'recheckBluetoothState.checking'
    | 'recheckBluetoothState.enabled'
    | 'restrictSharingVc'
    | 'reviewing'
    | 'reviewing.accepted'
    | 'reviewing.cancelling'
    | 'reviewing.creatingVp'
    | 'reviewing.disconnect'
    | 'reviewing.faceVerificationConsent'
    | 'reviewing.idle'
    | 'reviewing.invalidIdentity'
    | 'reviewing.navigateToHistory'
    | 'reviewing.rejected'
    | 'reviewing.selectingVc'
    | 'reviewing.sendingVc'
    | 'reviewing.sendingVc.inProgress'
    | 'reviewing.sendingVc.sent'
    | 'reviewing.sendingVc.timeout'
    | 'reviewing.verifyingIdentity'
    | 'showQrLogin'
    | 'showQrLogin.idle'
    | 'showQrLogin.navigatingToHistory'
    | 'showQrLogin.storing'
    | 'startPermissionCheck'
    | {
        checkBluetoothPermission?: 'checking' | 'enabled';
        checkBluetoothState?: 'checking' | 'enabled' | 'requesting';
        checkNearbyDevicesPermission?: 'checking' | 'enabled' | 'requesting';
        checkingLocationState?:
          | 'checkLocationService'
          | 'checkingPermissionStatus'
          | 'denied'
          | 'disabled'
          | 'requestToEnableLocation';
        connecting?: 'inProgress' | 'timeout';
        recheckBluetoothState?: 'checking' | 'enabled';
        reviewing?:
          | 'accepted'
          | 'cancelling'
          | 'creatingVp'
          | 'disconnect'
          | 'faceVerificationConsent'
          | 'idle'
          | 'invalidIdentity'
          | 'navigateToHistory'
          | 'rejected'
          | 'selectingVc'
          | 'sendingVc'
          | 'verifyingIdentity'
          | {sendingVc?: 'inProgress' | 'sent' | 'timeout'};
        showQrLogin?: 'idle' | 'navigatingToHistory' | 'storing';
      };
  tags: never;
}
