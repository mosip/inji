import { useSelector } from '@xstate/react';
import { useContext } from 'react';
import { ActorRefFrom } from 'xstate';
import { selectVcLabel } from '../../machines/settings';
import {
  selectIsRefreshingReceivedVcs,
  selectReceivedVcs,
} from '../../machines/vc';
import {  vcItemMachine } from '../../machines/vcItem';
import { GlobalContext } from '../../shared/GlobalContext';
import { HomeScreenTabProps } from './HomeScreen';
import {
  ReceivedVcsTabEvents,
  ReceivedVcsTabMachine,
} from './ReceivedVcsTabMachine';

export function useReceivedVcsTab(props: HomeScreenTabProps) {
  const service = props.service as ActorRefFrom<typeof ReceivedVcsTabMachine>;
  const { appService } = useContext(GlobalContext);
  const settingsService = appService.children.get('settings');
  const vcService = appService.children.get('vc');

  return {
    vcLabel: useSelector(settingsService, selectVcLabel),
    vcKeys: useSelector(vcService, selectReceivedVcs),

    isRefreshingVcs: useSelector(vcService, selectIsRefreshingReceivedVcs),

    VIEW_VC: (vcItemActor: ActorRefFrom<typeof  vcItemMachine>) =>
      service.send(ReceivedVcsTabEvents.VIEW_VC(vcItemActor)),
    REFRESH: () => service.send(ReceivedVcsTabEvents.REFRESH()),
  };
}
