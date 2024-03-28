import {useInterpret, useSelector} from '@xstate/react';
import {useContext, useRef, useState} from 'react';
import {ActorRefFrom} from 'xstate';
import {
  selectIsRefreshingReceivedVcs,
  selectReceivedVcsMetadata,
} from '../../machines/VCItemMachine/vc';
import {GlobalContext} from '../../shared/GlobalContext';
import {
  ReceivedVcsTabEvents,
  ReceivedVcsTabMachine,
} from './ReceivedVcsTabMachine';
import {MyVcsTabEvents, MyVcsTabMachine} from './MyVcsTabMachine';
import {
  HomeScreenEvents,
  HomeScreenMachine,
  selectSelectedVc,
  selectTabRefs,
  selectViewingVc,
} from './HomeScreenMachine';
import {VCItemMachine} from '../../machines/VCItemMachine/VCItemMachine';
import {selectVc} from '../../machines/VCItemMachine/VCItemSelectors';

export function useReceivedVcsTab() {
  const [isVisible, setIsVisible] = useState(false);

  const {appService} = useContext(GlobalContext);
  const machine = useRef(
    HomeScreenMachine.withContext({
      ...HomeScreenMachine.context,
      serviceRefs: appService.getSnapshot().context.serviceRefs,
    }),
  );
  const service = useInterpret(machine.current);

  const tabRefs = useSelector(service, selectTabRefs);

  const selectedVc = useSelector(service, selectSelectedVc);

  const vc = useSelector(service, selectVc);

  const isViewingVc = useSelector(service, selectViewingVc);

  const ReceivedVcsService = tabRefs.receivedVcs as ActorRefFrom<
    typeof ReceivedVcsTabMachine
  >;
  const myVcservice = tabRefs.myVcs as ActorRefFrom<typeof MyVcsTabMachine>;

  const vcService = appService.children.get('vc');

  return {
    isVisible,
    receivedVcsMetadata: useSelector(vcService, selectReceivedVcsMetadata),

    isRefreshingVcs: useSelector(vcService, selectIsRefreshingReceivedVcs),

    TOGGLE_RECEIVED_CARDS: () => setIsVisible(!isVisible),

    VIEW_VC: (vcRef: ActorRefFrom<typeof VCItemMachine>) => {
      return myVcservice.send(MyVcsTabEvents.VIEW_VC(vcRef));
    },
    isViewingVc,
    selectedVc,
    vc,
    activeTab: 1,
    DISMISS_MODAL: () => service.send(HomeScreenEvents.DISMISS_MODAL()),
    REFRESH: () => ReceivedVcsService.send(ReceivedVcsTabEvents.REFRESH()),
  };
}
