import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useSelector} from '@xstate/react';
import {useContext, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {
  MessageOverlayProps,
  VCSharingErrorStatusProps,
} from '../../components/MessageOverlay';
import {MainBottomTabParamList} from '../../routes/routeTypes';
import {GlobalContext} from '../../shared/GlobalContext';
import {
  selectIsConnecting,
  selectIsConnectingTimeout,
  selectIsInvalid,
  selectIsLocationDenied,
  selectIsLocationDisabled,
  selectIsQrLoginDone,
  selectIsScanning,
  selectIsSendingVc,
  selectIsSendingVcTimeout,
  selectIsSent,
  selectIsDone,
  selectFlowType,
  selectIsFaceIdentityVerified,
  selectCredential,
  selectVerifiableCredentialData,
} from '../../machines/bleShare/scan/selectors';
import {
  selectBleError,
  selectIsAccepted,
  selectIsDisconnected,
  selectIsExchangingDeviceInfo,
  selectIsExchangingDeviceInfoTimeout,
  selectIsHandlingBleError,
  selectIsInvalidIdentity,
  selectIsOffline,
  selectIsRejected,
  selectIsReviewing,
  selectIsVerifyingIdentity,
} from '../../machines/bleShare/commonSelectors';
import {ScanEvents} from '../../machines/bleShare/scan/scanMachine';
import {BOTTOM_TAB_ROUTES, SCAN_ROUTES} from '../../routes/routesConstants';
import {ScanStackParamList} from '../../routes/routesConstants';
import {VCShareFlowType} from '../../shared/Utils';
import {Theme} from '../../components/ui/styleUtils';

type ScanLayoutNavigation = NavigationProp<
  ScanStackParamList & MainBottomTabParamList
>;

const changeTabBarVisible = (visible: string) => {
  Theme.BottomTabBarStyle.tabBarStyle.display = visible;
};

// TODO: refactor
// eslint-disable-next-line sonarjs/cognitive-complexity
export function useScanLayout() {
  const {t} = useTranslation('ScanScreen');
  const {appService} = useContext(GlobalContext);
  const scanService = appService.children.get('scan')!!;
  const navigation = useNavigation<ScanLayoutNavigation>();

  const isLocationDisabled = useSelector(scanService, selectIsLocationDisabled);
  const isLocationDenied = useSelector(scanService, selectIsLocationDenied);
  const isBleError = useSelector(scanService, selectIsHandlingBleError);
  const isInvalidIdentity = useSelector(scanService, selectIsInvalidIdentity);
  const flowType = useSelector(scanService, selectFlowType);
  const isVerifyingIdentity = useSelector(
    scanService,
    selectIsVerifyingIdentity,
  );
  const bleError = useSelector(scanService, selectBleError);
  const credential = useSelector(scanService, selectCredential);
  const verifiableCredentialData = useSelector(
    scanService,
    selectVerifiableCredentialData,
  );

  const locationError = {message: '', button: ''};

  if (isLocationDisabled) {
    locationError.message = t('errors.locationDisabled.message');
    locationError.button = t('errors.locationDisabled.button');
  } else if (isLocationDenied) {
    locationError.message = t('errors.locationDenied.message');
    locationError.button = t('errors.locationDenied.button');
  }

  const DISMISS = () => scanService.send(ScanEvents.DISMISS());
  const CANCEL = () => scanService.send(ScanEvents.CANCEL());
  const FACE_VALID = () => scanService.send(ScanEvents.FACE_VALID());
  const FACE_INVALID = () => scanService.send(ScanEvents.FACE_INVALID());
  const CLOSE_BANNER = () => scanService.send(ScanEvents.CLOSE_BANNER());
  const onStayInProgress = () =>
    scanService.send(ScanEvents.STAY_IN_PROGRESS());
  const onRetry = () => scanService.send(ScanEvents.RETRY());
  const GOTO_HOME = () => {
    scanService.send(ScanEvents.DISMISS());
    changeTabBarVisible('flex');
    navigation.navigate(BOTTOM_TAB_ROUTES.home);
  };
  const GOTO_HISTORY = () => {
    scanService.send(ScanEvents.GOTO_HISTORY());
    changeTabBarVisible('flex');
    navigation.navigate(BOTTOM_TAB_ROUTES.history);
  };
  const RETRY_VERIFICATION = () =>
    scanService.send(ScanEvents.RETRY_VERIFICATION());

  const isInvalid = useSelector(scanService, selectIsInvalid);
  const isConnecting = useSelector(scanService, selectIsConnecting);
  const isConnectingTimeout = useSelector(
    scanService,
    selectIsConnectingTimeout,
  );
  const isExchangingDeviceInfo = useSelector(
    scanService,
    selectIsExchangingDeviceInfo,
  );
  const isExchangingDeviceInfoTimeout = useSelector(
    scanService,
    selectIsExchangingDeviceInfoTimeout,
  );
  const isAccepted = useSelector(scanService, selectIsAccepted);
  const isRejected = useSelector(scanService, selectIsRejected);
  const isSent = useSelector(scanService, selectIsSent);
  const isOffline = useSelector(scanService, selectIsOffline);
  const isSendingVc = useSelector(scanService, selectIsSendingVc);
  const isSendingVcTimeout = useSelector(scanService, selectIsSendingVcTimeout);
  const isDisconnected = useSelector(scanService, selectIsDisconnected);
  const isStayInProgress = isConnectingTimeout || isSendingVcTimeout;
  let isFaceIdentityVerified = useSelector(
    scanService,
    selectIsFaceIdentityVerified,
  );

  let statusOverlay: Pick<
    MessageOverlayProps,
    | 'title'
    | 'message'
    | 'hint'
    | 'onButtonPress'
    | 'minHeight'
    | 'buttonText'
    | 'onStayInProgress'
    | 'onRetry'
    | 'progress'
    | 'onBackdropPress'
    | 'requester'
  > = null;
  if (isConnecting) {
    statusOverlay = {
      title: t('status.inProgress.title'),
      hint: t('status.inProgress.hint'),
      progress: true,
      onButtonPress: CANCEL,
    };
  } else if (isConnectingTimeout) {
    statusOverlay = {
      title: t('status.connectionInProgress'),
      hint: t('status.connectingTimeout'),
      onButtonPress: CANCEL,
      onStayInProgress,
      onRetry,
      progress: true,
    };
  } else if (isExchangingDeviceInfo) {
    statusOverlay = {
      message: t('status.exchangingDeviceInfo'),
      progress: true,
    };
  } else if (isExchangingDeviceInfoTimeout) {
    statusOverlay = {
      message: t('status.exchangingDeviceInfo'),
      hint: t('status.exchangingDeviceInfoTimeout'),
      onButtonPress: CANCEL,
      progress: true,
    };
  } else if (isSendingVc) {
    statusOverlay = {
      title: t('status.sharing.title'),
      hint: t('status.sharing.hint'),
      onButtonPress: CANCEL,
      progress: true,
    };
  } else if (isSent) {
    statusOverlay = {
      title: t('status.sharing.title'),
      hint: t('status.sharing.hint'),
      progress: true,
    };
  } else if (isSendingVcTimeout) {
    statusOverlay = {
      title: t('status.sharing.title'),
      hint: t('status.sharing.timeoutHint'),
      onButtonPress: CANCEL,
      onStayInProgress,
      onRetry,
      progress: true,
    };
  } else if (isAccepted) {
    statusOverlay = {
      title: t('status.accepted.title'),
      message: t('status.accepted.message'),
      onButtonPress: DISMISS,
    };
  } else if (isInvalid) {
    statusOverlay = {
      message: t('status.invalid'),
      onBackdropPress: DISMISS,
    };
  } else if (isOffline) {
    statusOverlay = {
      message: t('status.offline'),
      onBackdropPress: DISMISS,
    };
  }

  let errorStatusOverlay: Pick<
    VCSharingErrorStatusProps,
    'title' | 'message'
  > | null = null;

  if (isRejected) {
    errorStatusOverlay = {
      title: t('status.rejected.title'),
      message: t('status.rejected.message'),
    };
  } else if (isDisconnected) {
    errorStatusOverlay = {
      title: t('status.disconnected.title'),
      message: t('status.disconnected.message'),
    };
  } else if (isBleError) {
    errorStatusOverlay = {
      title: t(`status.bleError.${bleError.code}.title`),
      message: t(`status.bleError.${bleError.code}.message`),
    };
  }

  useEffect(() => {
    const subscriptions = [
      navigation.addListener('focus', () =>
        scanService.send(ScanEvents.SCREEN_FOCUS()),
      ),
      navigation.addListener('blur', () =>
        scanService.send(ScanEvents.SCREEN_BLUR()),
      ),
    ];

    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  const isDone = useSelector(scanService, selectIsDone);
  const isReviewing = useSelector(scanService, selectIsReviewing);
  const isScanning = useSelector(scanService, selectIsScanning);
  const isQrLoginDone = useSelector(scanService, selectIsQrLoginDone);

  useEffect(() => {
    if (isDone) {
      changeTabBarVisible('flex');
      navigation.navigate(BOTTOM_TAB_ROUTES.home);
    } else if (
      isReviewing &&
      flowType === VCShareFlowType.SIMPLE_SHARE &&
      !isAccepted
    ) {
      changeTabBarVisible('none');
      navigation.navigate(SCAN_ROUTES.SendVcScreen);
    } else if (isScanning) {
      changeTabBarVisible('flex');
      navigation.navigate(SCAN_ROUTES.ScanScreen);
    } else if (isQrLoginDone) {
      changeTabBarVisible('flex');
      navigation.navigate(BOTTOM_TAB_ROUTES.history);
    }
  }, [
    isDone,
    isReviewing,
    isScanning,
    isQrLoginDone,
    isBleError,
    flowType,
    isAccepted,
  ]);

  return {
    credential,
    verifiableCredentialData,
    isInvalid,
    isReviewing,
    isDone,
    GOTO_HOME,
    GOTO_HISTORY,
    isDisconnected,
    statusOverlay,
    errorStatusOverlay,
    isStayInProgress,
    isBleError,
    bleError,
    DISMISS,
    isAccepted,
    isRejected,
    onRetry,
    CANCEL,
    isSendingVc,
    flowType,
    isVerifyingIdentity,
    isInvalidIdentity,
    FACE_INVALID,
    FACE_VALID,
    RETRY_VERIFICATION,
    isFaceIdentityVerified,
    CLOSE_BANNER,
  };
}
