import { useSelector } from '@xstate/react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActorRefFrom } from 'xstate';
import { MessageOverlayProps } from '../../components/MessageOverlay';
import {
  ScanEvents,
  selectIsAccepted,
  selectReason,
  selectReceiverInfo,
  selectIsRejected,
  selectIsSelectingVc,
  selectIsSendingVc,
  selectVcName,
  selectIsSendingVcTimeout,
  selectIsVerifyingIdentity,
  selectIsInvalidIdentity,
  selectSelectedVc,
  selectIsCancelling,
} from '../../machines/scan';
import { selectVcLabel } from '../../machines/settings';
import { selectShareableVcs } from '../../machines/vc';
import { vcItemMachine } from '../../machines/vcItem';
import { GlobalContext } from '../../shared/GlobalContext';
import { VC } from '../../types/vc';

export function useSendVcScreen() {
  const { appService } = useContext(GlobalContext);
  const scanService = appService.children.get('scan');
  const settingsService = appService.children.get('settings');
  const vcService = appService.children.get('vc');

  const { t } = useTranslation('SendVcScreen');
  const isSendingVc = useSelector(scanService, selectIsSendingVc);
  const isSendingVcTimeout = useSelector(scanService, selectIsSendingVcTimeout);
  const CANCEL = () => scanService.send(ScanEvents.CANCEL());

  let status: Pick<MessageOverlayProps, 'title' | 'hint' | 'onCancel'> = null;
  if (isSendingVc) {
    status = {
      title: t('status.sharing.title'),
    };
  } else if (isSendingVcTimeout) {
    status = {
      title: t('status.sharing.title'),
      hint: t('status.sharing.timeoutHint'),
      onCancel: CANCEL,
    };
  }

  const [selectedIndex, setSelectedIndex] = useState<number>(null);
  const SELECT_VC = (vc: VC) => scanService.send(ScanEvents.SELECT_VC(vc));

  return {
    selectedIndex,
    TOGGLE_USER_CONSENT: () =>
      scanService.send(ScanEvents.TOGGLE_USER_CONSENT()),
    SELECT_VC_ITEM:
      (index: number) => (vcRef: ActorRefFrom<typeof vcItemMachine>) => {
        setSelectedIndex(index);
        const vcData = vcRef.getSnapshot().context;
        SELECT_VC(vcData);
      },

    status,
    receiverInfo: useSelector(scanService, selectReceiverInfo),
    reason: useSelector(scanService, selectReason),
    vcName: useSelector(scanService, selectVcName),
    vcLabel: useSelector(settingsService, selectVcLabel),
    vcKeys: useSelector(vcService, selectShareableVcs),
    selectedVc: useSelector(scanService, selectSelectedVc),

    isSelectingVc: useSelector(scanService, selectIsSelectingVc),
    isSendingVc,
    isSendingVcTimeout,
    isAccepted: useSelector(scanService, selectIsAccepted),
    isRejected: useSelector(scanService, selectIsRejected),
    isVerifyingIdentity: useSelector(scanService, selectIsVerifyingIdentity),
    isInvalidIdentity: useSelector(scanService, selectIsInvalidIdentity),
    isCancelling: useSelector(scanService, selectIsCancelling),

    CANCEL,
    SELECT_VC,
    ACCEPT_REQUEST: () => scanService.send(ScanEvents.ACCEPT_REQUEST()),
    VERIFY_AND_ACCEPT_REQUEST: () =>
      scanService.send(ScanEvents.VERIFY_AND_ACCEPT_REQUEST()),
    DISMISS: () => scanService.send(ScanEvents.DISMISS()),
    UPDATE_REASON: (reason: string) =>
      scanService.send(ScanEvents.UPDATE_REASON(reason)),
    UPDATE_VC_NAME: (vcName: string) =>
      scanService.send(ScanEvents.UPDATE_VC_NAME(vcName)),
    FACE_VALID: () => scanService.send(ScanEvents.FACE_VALID()),
    FACE_INVALID: () => scanService.send(ScanEvents.FACE_INVALID()),
    RETRY_VERIFICATION: () => scanService.send(ScanEvents.RETRY_VERIFICATION()),
  };
}
