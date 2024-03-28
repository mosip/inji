import {ActorRefFrom, EventFrom, sendParent} from 'xstate';
import {createModel} from 'xstate/lib/model';
import {AppServices} from '../../shared/GlobalContext';
import {VCItemMachine} from '../../machines/VCItemMachine/VCItemMachine';

const model = createModel(
  {
    serviceRefs: {} as AppServices,
    error: '',
  },
  {
    events: {
      VIEW_VC: (vcItemActor: ActorRefFrom<typeof VCItemMachine>) => ({
        vcItemActor,
      }),
      REFRESH: () => ({}),
      DISMISS: () => ({}),
      STORE_RESPONSE: (response?: unknown) => ({response}),
      STORE_ERROR: (error: Error) => ({error}),
      ERROR: (error: Error) => ({error}),
      GET_RECEIVED_VCS_RESPONSE: (vcMetadatas: string[]) => ({vcMetadatas}),
    },
  },
);

export const ReceivedVcsTabEvents = model.events;

export const ReceivedVcsTabMachine = model.createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import('./ReceivedVcsTabMachine.typegen').Typegen0,
    schema: {
      context: model.initialContext,
      events: {} as EventFrom<typeof model>,
    },
    id: 'ReceivedVcsTab',
    initial: 'idle',
    states: {
      idle: {
        on: {
          VIEW_VC: 'viewingVc',
        },
      },
      viewingVc: {
        entry: ['viewVcFromParent'],
        on: {
          DISMISS: 'idle',
        },
      },
    },
  },
  {
    actions: {
      viewVcFromParent: sendParent((_context, event) =>
        model.events.VIEW_VC(event.vcItemActor),
      ),
    },
  },
);

export function createReceivedVcsTabMachine(serviceRefs: AppServices) {
  return ReceivedVcsTabMachine.withContext({
    ...ReceivedVcsTabMachine.context,
    serviceRefs,
  });
}
