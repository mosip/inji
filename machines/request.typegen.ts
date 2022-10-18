// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  'internalEvents': {
    '': { type: '' };
    'xstate.after(CLEAR_DELAY)#clearingConnection': {
      type: 'xstate.after(CLEAR_DELAY)#clearingConnection';
    };
    'xstate.init': { type: 'xstate.init' };
    'xstate.stop': { type: 'xstate.stop' };
  };
  'invokeSrcNameMap': {
    advertiseDevice: 'done.invoke.waitingForConnection:invocation[0]';
    checkBluetoothService: 'done.invoke.request.checkingBluetoothService.checking:invocation[0]';
    exchangeDeviceInfo: 'done.invoke.request.exchangingDeviceInfo:invocation[0]';
    monitorConnection: 'done.invoke.request:invocation[0]';
    receiveVc: 'done.invoke.request.waitingForVc:invocation[0]';
    requestBluetooth: 'done.invoke.request.checkingBluetoothService.requesting:invocation[0]';
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
  'eventsCausingActions': {
    disconnect:
      | ''
      | 'CANCEL'
      | 'DISCONNECT'
      | 'DISMISS'
      | 'SCREEN_BLUR'
      | 'SCREEN_FOCUS'
      | 'SWITCH_PROTOCOL'
      | 'xstate.stop';
    generateConnectionParams:
      | 'DISMISS'
      | 'xstate.after(CLEAR_DELAY)#clearingConnection';
    logReceived: 'STORE_RESPONSE';
    mergeIncomingVc: 'STORE_RESPONSE';
    openSettings: 'GOTO_SETTINGS';
    prependReceivedVc: 'VC_RESPONSE';
    registerLoggers: 'DISMISS' | 'xstate.after(CLEAR_DELAY)#clearingConnection';
    removeLoggers:
      | 'DISMISS'
      | 'SCREEN_BLUR'
      | 'SCREEN_FOCUS'
      | 'SWITCH_PROTOCOL'
      | 'xstate.after(CLEAR_DELAY)#clearingConnection'
      | 'xstate.init';
    requestExistingVc: 'VC_RESPONSE';
    requestReceivedVcs: 'ACCEPT';
    requestReceiverInfo: 'CONNECTED';
    sendVcReceived: 'STORE_RESPONSE';
    setIncomingVc: 'VC_RECEIVED';
    setReceiverInfo: 'RECEIVE_DEVICE_INFO';
    setSenderInfo: 'EXCHANGE_DONE';
    storeVc: 'STORE_RESPONSE';
    switchProtocol: 'SWITCH_PROTOCOL';
  };
  'eventsCausingServices': {
    advertiseDevice: 'DISMISS' | 'xstate.after(CLEAR_DELAY)#clearingConnection';
    checkBluetoothService: 'CANCEL' | 'SCREEN_FOCUS' | 'SWITCH_PROTOCOL';
    exchangeDeviceInfo: 'RECEIVE_DEVICE_INFO';
    monitorConnection:
      | 'SCREEN_BLUR'
      | 'SCREEN_FOCUS'
      | 'SWITCH_PROTOCOL'
      | 'xstate.init';
    receiveVc: 'EXCHANGE_DONE';
    requestBluetooth: 'BLUETOOTH_DISABLED';
    sendVcResponse: 'CANCEL' | 'REJECT' | 'STORE_RESPONSE';
  };
  'eventsCausingGuards': {
    hasExistingVc: 'VC_RESPONSE';
  };
  'eventsCausingDelays': {
    CLEAR_DELAY: '';
    CONNECTION_TIMEOUT: 'EXCHANGE_DONE' | 'RECEIVE_DEVICE_INFO';
  };
  'matchesStates':
    | 'bluetoothDenied'
    | 'checkingBluetoothService'
    | 'checkingBluetoothService.checking'
    | 'checkingBluetoothService.enabled'
    | 'checkingBluetoothService.requesting'
    | 'clearingConnection'
    | 'disconnected'
    | 'exchangingDeviceInfo'
    | 'exchangingDeviceInfo.inProgress'
    | 'exchangingDeviceInfo.timeout'
    | 'inactive'
    | 'preparingToExchangeInfo'
    | 'reviewing'
    | 'reviewing.accepted'
    | 'reviewing.accepting'
    | 'reviewing.accepting.mergingIncomingVc'
    | 'reviewing.accepting.prependingReceivedVc'
    | 'reviewing.accepting.requestingExistingVc'
    | 'reviewing.accepting.requestingReceivedVcs'
    | 'reviewing.accepting.storingVc'
    | 'reviewing.idle'
    | 'reviewing.navigatingToHome'
    | 'reviewing.rejected'
    | 'waitingForConnection'
    | 'waitingForVc'
    | 'waitingForVc.inProgress'
    | 'waitingForVc.timeout'
    | {
        checkingBluetoothService?: 'checking' | 'enabled' | 'requesting';
        exchangingDeviceInfo?: 'inProgress' | 'timeout';
        reviewing?:
          | 'accepted'
          | 'accepting'
          | 'idle'
          | 'navigatingToHome'
          | 'rejected'
          | {
              accepting?:
                | 'mergingIncomingVc'
                | 'prependingReceivedVc'
                | 'requestingExistingVc'
                | 'requestingReceivedVcs'
                | 'storingVc';
            };
        waitingForVc?: 'inProgress' | 'timeout';
      };
  'tags': never;
}
