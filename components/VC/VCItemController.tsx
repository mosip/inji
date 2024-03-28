import {useContext, useRef} from 'react';
import {GlobalContext} from '../../shared/GlobalContext';
import {
  selectContext,
  selectGeneratedOn,
  selectKebabPopUp,
  selectWalletBindingResponse,
  selectCredential,
  selectVerifiableCredentialData,
} from '../../machines/VCItemMachine/VCItemSelectors';
import {useInterpret, useSelector} from '@xstate/react';
import {VCItemProps} from './Views/VCCardView';
import {
  createVCItemMachine,
  VCItemEvents,
} from '../../machines/VCItemMachine/VCItemMachine';
import {selectIsSavingFailedInIdle} from '../../screens/Home/MyVcsTabMachine';

export function useVcItemController(props: VCItemProps) {
  const {appService} = useContext(GlobalContext);
  const machine = useRef(
    createVCItemMachine(
      appService.getSnapshot().context.serviceRefs,
      props.vcMetadata,
    ),
  );
  const service = useInterpret(machine.current, {devTools: __DEV__});

  return {
    service,
    context: useSelector(service, selectContext),
    credential: useSelector(service, selectCredential),
    verifiableCredentialData: useSelector(
      service,
      selectVerifiableCredentialData,
    ),
    walletBindingResponse: useSelector(service, selectWalletBindingResponse),
    isKebabPopUp: useSelector(service, selectKebabPopUp),
    DISMISS: () => service.send(VCItemEvents.DISMISS()),
    KEBAB_POPUP: () => service.send(VCItemEvents.KEBAB_POPUP()),
    isSavingFailedInIdle: useSelector(service, selectIsSavingFailedInIdle),
    storeErrorTranslationPath: 'errors.savingFailed',
    generatedOn: useSelector(service, selectGeneratedOn),
  };
}
