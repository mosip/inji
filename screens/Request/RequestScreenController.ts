import {useSelector} from '@xstate/react';
import {useContext, useEffect} from 'react';
import {selectIsActive, selectIsFocused} from '../../machines/app';
import {GlobalContext} from '../../shared/GlobalContext';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import {useTranslation} from 'react-i18next';
import {
  selectIsCheckingBluetoothService,
  selectIsWaitingForConnection,
  selectIsWaitingForVc,
  selectIsWaitingForVcTimeout,
  selectOpenId4VpUri,
  selectSenderInfo,
} from '../../machines/bleShare/request/selectors';
import {
  selectIsBluetoothDenied,
  selectIsCancelling,
  selectIsNearByDevicesPermissionDenied,
  selectIsReviewing,
  selectReadyForBluetoothStateCheck,
} from '../../machines/bleShare/commonSelectors';
import {
  RequestEvents,
  selectIsMinimumStorageLimitReached,
} from '../../machines/bleShare/request/requestMachine';

export function useRequestScreen() {
  const {t} = useTranslation('RequestScreen');
  const {appService} = useContext(GlobalContext);

  const requestService = appService.children.get('request');
  const isActive = useSelector(appService, selectIsActive);
  const isFocused = useSelector(appService, selectIsFocused);
  const isReadyForBluetoothStateCheck = useSelector(
    requestService,
    selectReadyForBluetoothStateCheck,
  );
  const isBluetoothDenied = useSelector(
    requestService,
    selectIsBluetoothDenied,
  );
  const isNearByDevicesPermissionDenied = useSelector(
    requestService,
    selectIsNearByDevicesPermissionDenied,
  );
  const isWaitingForConnection = useSelector(
    requestService,
    selectIsWaitingForConnection,
  );

  const isWaitingForVc = useSelector(requestService, selectIsWaitingForVc);
  const isWaitingForVcTimeout = useSelector(
    requestService,
    selectIsWaitingForVcTimeout,
  );

  let statusTitle = '';
  let statusMessage = '';
  let statusHint = '';
  if (isWaitingForConnection) {
    statusMessage = t('status.waitingConnection');
  } else if (isWaitingForVc) {
    statusTitle = t('status.sharing.title');
    statusMessage = t('status.connected.message');
  } else if (isWaitingForVcTimeout) {
    statusTitle = t('status.sharing.title');
    statusMessage = t('status.connected.message');
    statusHint = t('status.connected.timeoutHint');
  }

  useEffect(() => {
    BluetoothStateManager.getState().then(bluetoothState => {
      if (bluetoothState === 'PoweredOn' && isBluetoothDenied) {
        requestService.send(RequestEvents.SCREEN_FOCUS());
      }
    });
  }, [isFocused, isActive]);

  return {
    statusTitle,
    statusMessage,
    statusHint,
    isWaitingForConnection,
    isWaitingForVc,
    isWaitingForVcTimeout,
    isBluetoothDenied,
    isNearByDevicesPermissionDenied,
    isReadyForBluetoothStateCheck,
    isCheckingBluetoothService: useSelector(
      requestService,
      selectIsCheckingBluetoothService,
    ),
    isMinimumStorageLimitReached: useSelector(
      requestService,
      selectIsMinimumStorageLimitReached,
    ),
    openId4VpUri: useSelector(requestService, selectOpenId4VpUri),
    senderInfo: useSelector(requestService, selectSenderInfo),
    isReviewing: useSelector(requestService, selectIsReviewing),
    isCancelling: useSelector(requestService, selectIsCancelling),

    CANCEL: () => requestService.send(RequestEvents.CANCEL()),
    DISMISS: () => requestService.send(RequestEvents.DISMISS()),
    ACCEPT: () => requestService.send(RequestEvents.ACCEPT()),
    REJECT: () => requestService.send(RequestEvents.REJECT()),
    REQUEST: () => requestService.send(RequestEvents.SCREEN_FOCUS()),
    GOTO_SETTINGS: () => requestService.send(RequestEvents.GOTO_SETTINGS()),
  };
}
