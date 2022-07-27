// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  'eventsCausingActions': {
    setReceiverInfo: 'RECEIVE_DEVICE_INFO';
    setSenderInfo: 'EXCHANGE_DONE';
    setIncomingVc: 'VC_RECEIVED';
    removeLoggers:
      | 'SCREEN_BLUR'
      | 'xstate.after(CLEAR_DELAY)#clearingConnection'
      | 'DISMISS'
      | 'GOBACK';
    disconnect: '';
    registerLoggers:
      | 'xstate.after(CLEAR_DELAY)#clearingConnection'
      | 'DISMISS'
      | 'GOBACK';
    generateConnectionParams:
      | 'xstate.after(CLEAR_DELAY)#clearingConnection'
      | 'DISMISS'
      | 'GOBACK';
    requestReceiverInfo: 'CONNECTED';
    requestReceivedVcs: 'xstate.init';
    requestExistingVc: 'VC_RESPONSE';
    mergeIncomingVc: 'STORE_RESPONSE';
    prependReceivedVc: 'VC_RESPONSE';
    storeVc: 'STORE_RESPONSE';
    sendVcReceived: 'STORE_RESPONSE';
    logReceived: 'STORE_RESPONSE';
  };
  'internalEvents': {
    'xstate.after(CLEAR_DELAY)#clearingConnection': {
      type: 'xstate.after(CLEAR_DELAY)#clearingConnection';
    };
    '': { type: '' };
    'xstate.init': { type: 'xstate.init' };
  };
  'invokeSrcNameMap': {
    checkBluetoothService: 'done.invoke.request.checkingBluetoothService.checking:invocation[0]';
    requestBluetooth: 'done.invoke.request.checkingBluetoothService.requesting:invocation[0]';
    advertiseDevice: 'done.invoke.waitingForConnection:invocation[0]';
    exchangeDeviceInfo: 'done.invoke.request.exchangingDeviceInfo:invocation[0]';
    receiveVc: 'done.invoke.request.waitingForVc:invocation[0]';
    sendVcResponse:
      | 'done.invoke.accepted:invocation[0]'
      | 'done.invoke.request.reviewing.rejected:invocation[0]';
  };
  'missingImplementations': {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  'eventsCausingServices': {
    checkBluetoothService: 'xstate.init';
    requestBluetooth: 'BLUETOOTH_DISABLED';
    advertiseDevice: 'xstate.after(CLEAR_DELAY)#clearingConnection' | 'DISMISS';
    exchangeDeviceInfo: 'RECEIVE_DEVICE_INFO';
    receiveVc: 'EXCHANGE_DONE';
    sendVcResponse: 'REJECT' | 'CANCEL' | 'STORE_RESPONSE';
  };
  'eventsCausingGuards': {
    hasExistingVc: 'VC_RESPONSE';
  };
  'eventsCausingDelays': {
    CLEAR_DELAY: 'xstate.init';
  };
  'matchesStates':
    | 'inactive'
    | 'checkingBluetoothService'
    | 'checkingBluetoothService.checking'
    | 'checkingBluetoothService.requesting'
    | 'checkingBluetoothService.enabled'
    | 'bluetoothDenied'
    | 'clearingConnection'
    | 'waitingForConnection'
    | 'preparingToExchangeInfo'
    | 'exchangingDeviceInfo'
    | 'waitingForVc'
    | 'reviewing'
    | 'reviewing.idle'
    | 'reviewing.accepting'
    | 'reviewing.accepting.requestingReceivedVcs'
    | 'reviewing.accepting.requestingExistingVc'
    | 'reviewing.accepting.mergingIncomingVc'
    | 'reviewing.accepting.prependingReceivedVc'
    | 'reviewing.accepting.storingVc'
    | 'reviewing.accepted'
    | 'reviewing.rejected'
    | 'reviewing.navigatingToHome'
    | 'reviewing.navigatingToTimeBasedRequest'
    | 'disconnected'
    | {
        checkingBluetoothService?: 'checking' | 'requesting' | 'enabled';
        reviewing?:
          | 'idle'
          | 'accepting'
          | 'accepted'
          | 'rejected'
          | 'navigatingToHome'
          | 'navigatingToTimeBasedRequest'
          | {
              accepting?:
                | 'requestingReceivedVcs'
                | 'requestingExistingVc'
                | 'mergingIncomingVc'
                | 'prependingReceivedVc'
                | 'storingVc';
            };
      };
  'tags': never;
}
