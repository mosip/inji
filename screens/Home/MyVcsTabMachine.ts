import {
  ActorRefFrom,
  assign,
  DoneInvokeEvent,
  EventFrom,
  send,
  sendParent,
  StateFrom,
} from 'xstate';
import {createModel} from 'xstate/lib/model';
import {StoreEvents} from '../../machines/store';
import {VcEvents} from '../../machines/VCItemMachine/vc';
import {AppServices} from '../../shared/GlobalContext';
import {MY_VCS_STORE_KEY} from '../../shared/constants';
import {AddVcModalMachine} from './MyVcs/AddVcModalMachine';
import {GetVcModalMachine} from './MyVcs/GetVcModalMachine';
import {VCMetadata} from '../../shared/VCMetadata';
import NetInfo from '@react-native-community/netinfo';
import {VCItemMachine} from '../../machines/VCItemMachine/VCItemMachine';

const model = createModel(
  {
    serviceRefs: {} as AppServices,
    isVcItemStoredSuccessfully: false,
  },
  {
    events: {
      VIEW_VC: (vcItemActor: ActorRefFrom<typeof VCItemMachine>) => ({
        vcItemActor,
      }),
      DISMISS: () => ({}),
      TRY_AGAIN: () => ({}),
      STORE_RESPONSE: (response?: unknown) => ({response}),
      STORE_ERROR: (error: Error) => ({error}),
      ADD_VC: () => ({}),
      GET_VC: () => ({}),
      STORAGE_AVAILABLE: () => ({}),
      STORAGE_UNAVAILABLE: () => ({}),
      SET_STORE_VC_ITEM_STATUS: () => ({}),
      RESET_STORE_VC_ITEM_STATUS: () => ({}),
      DOWNLOAD_VIA_ID: () => ({}),
    },
  },
);

export const MyVcsTabEvents = model.events;

type ViewVcEvent = EventFrom<typeof model, 'VIEW_VC'>;

export const MyVcsTabMachine = model.createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QFkCeA1AxrAKgQwCMA6TACzEwGsBLAOygHlaCB7PAJwjqgGUAXPHwCusAMQ8cDAEoBRAPqyeABQYA5HjIDaABgC6iUAAcWsan2otaBkAA9EANgBMAGhCpEAFidEA7PY+O2j4ArPbajo4AjPYAvjGuaFi4hCTkVNxMrBxc9PyCIuKSsgoyymoampH6SCDGpuaW1nYIjgCcABxEwa0AzK32PU492l6tru4Ike2OXT2Rkdrac5GOPq3BcQkY2PjEllmc3KIAggAip3LoAMI61UYmZhZWNc2RrTPTSyPtPtphwR4fONEO12toiNEPO8PD0PFMej52psQIkdil9mxDvRRGoAEIMY5SU4ASVUAHE5Kc1Fo9NY6o9Gi9EG8PoFhh4fn9tACgW5EMFpl1uYEFt1Wj4QsjUcliNQIAAbMAnc6XG60mr0hrPUDNLw+LprAJvcVBJbAhA+Rz2Ig9EXrH5vdrvKXbGVEOWK0ToYkyADqqtudIeWqa-JcfJakT6vh80UR-g50R6LqSu3dCqVZJkOAD6vu9SeoZaayIgN67WCCO6flC5ui-SIf3ssfmXiWPhTaOIADdqGAAO7cLCiEk8ZDEng8QMa4OFpkIJzmwJOoiOJ32VqQysjWLxFGutN4CA5KDDiCWMDu2jdliUS-HY9YZAsCB4eXT-MM7W2fnhA2tI1WhNX4enNDpWlXADNz6ewBXsKNOzdI8T2HUdx0nD9alnRkdWZKNOnaQEKy8SIAmCRE60BSJfA3S1elhYIo13LZUxSZCh0wIhYD4Fh2COCRpHkRQVHUGk7iwgscJ-C1ohtDw23k94phCSigIhCVY2CcJIj8dZEMPY8OK4ni+OxATihkKQpGkTDNTnXCZOtWEFKhKIfmCOtBmojc2gWdp7HaW0Oz3aUDJQzjkKwHghEwTA4FgAAzIR5RHCd0KnPMJK-It5h6AiiIBeCyIoiNImCCJV0Y2MBlhcJK30lIYD4cx6DPC8rxvO8iDJMA+CfF831s7Dv2aVYILLPLKxCcVYPsMC-F8KCo36OCEJCg9Gt6lrT0wVKxwnDLxLsqTRpLCaKyrGba1K9pZLBCUdw8cjejiPdaBfOBrFCwgg0kkbEAAWkcDxzXIxbm2CSHuRg+r1tY4gyAoGh6EyTETzyYR4BnP6iwCSjglXH5-IGFZ7AGJYGr2Zg0e4X7svncjzSdfU5jBNcOVu7oPEp9NFTpkN5yjJYDVgwL-McdleQmKY-2B4Gyf8ALhg2OGuyIXsBw4-n7OkqZrUtH42mBsEvFBJcFh6G14I08V1h6ZNVaQwzWswbWTs8AF-0A4CzQjYiiE+KIVkBWDIh59iXaIfs8EeegADFeO7TAAGkwAmT8BYcrSZme73fhAusdxjMnAvKvw1yRR2wqM7jeNp7H6aznSvaiID8996WEWtbQyrWN5lnKlWWLViOdqISLMGi2L4qS+U3f+hBN31KZIbmeCnAWMZSvKmYfC8XzAqepjw+dsfYDwXt45jxUIHnosnQglfK2iaIom0LfpYr1cNy01ovh0gKJ9wpcQvtwOO19IC8zAHfec-ROiWjhN0YGQQIhS2ZFWGifxHQInkvbIBNdQFX2oDfdWfZBwuxgQ5ACy8KzP3Xm-D+zIYQeEqgxAUPRqwVh5k1baWBKHSWBnWf4NoJagn8mVTm3CtpGWjrHKACd2BJ1TunLKmdpKWjrD4aMawKzQVqo4WGcQgA */
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import('./MyVcsTabMachine.typegen').Typegen0,
    schema: {
      context: model.initialContext,
      events: {} as EventFrom<typeof model>,
    },
    id: 'MyVcsTab',
    initial: 'idle',
    states: {
      addVc: {
        initial: 'checkNetwork',
        states: {
          checkNetwork: {
            invoke: {
              src: 'checkNetworkStatus',
              onDone: [
                {
                  cond: 'isNetworkOn',
                  target: '#MyVcsTab.addingVc',
                },
                {
                  target: 'networkOff',
                },
              ],
            },
          },
          networkOff: {
            on: {
              DISMISS: '#idle',
              TRY_AGAIN: 'checkNetwork',
            },
          },
        },
      },
      idle: {
        id: 'idle',
        on: {
          ADD_VC: 'addVc',
          VIEW_VC: 'viewingVc',
          GET_VC: 'gettingVc',
          SET_STORE_VC_ITEM_STATUS: {
            target: 'idle',
            actions: 'setStoringVcItemStatus',
          },
          RESET_STORE_VC_ITEM_STATUS: {
            target: 'idle',
            actions: 'resetStoringVcItemStatus',
          },
        },
      },
      viewingVc: {
        entry: ['viewVcFromParent'],
        on: {
          DISMISS: 'idle',
          VIEW_VC: 'viewingVc',
          ADD_VC: 'addVc',
        },
      },
      addingVc: {
        invoke: {
          id: 'AddVcModal',
          src: AddVcModalMachine,
          onDone: '.storing',
        },
        on: {
          DISMISS: 'idle',
        },
        initial: 'waitingForvcKey',
        states: {
          waitingForvcKey: {},
          storing: {
            entry: ['storeVcItem'],
            on: {
              STORE_RESPONSE: {
                target: '#idle',
                actions: ['setStoringVcItemStatus', 'sendVcAdded'],
              },
              STORE_ERROR: {
                target: '#MyVcsTab.addingVc.savingFailed',
              },
            },
          },
          savingFailed: {
            initial: 'idle',
            states: {
              idle: {},
            },
            on: {
              DISMISS: '#idle',
            },
          },
        },
      },
      gettingVc: {
        invoke: {
          id: 'GetVcModal',
          src: GetVcModalMachine,
          onDone: 'addingVc',
        },
        on: {
          DISMISS: 'idle',
        },
        initial: 'waitingForvcKey',
        states: {
          waitingForvcKey: {},
        },
      },
    },
  },
  {
    services: {
      checkNetworkStatus: async () => {
        const state = await NetInfo.fetch();
        return state.isConnected;
      },
    },

    actions: {
      viewVcFromParent: sendParent((_context, event: ViewVcEvent) =>
        model.events.VIEW_VC(event.vcItemActor),
      ),

      storeVcItem: send(
        (_context, event) => {
          return StoreEvents.PREPEND(
            MY_VCS_STORE_KEY,
            (event as DoneInvokeEvent<VCMetadata>).data,
          );
        },
        {to: context => context.serviceRefs.store},
      ),

      setStoringVcItemStatus: assign({
        isVcItemStoredSuccessfully: () => true,
      }),

      resetStoringVcItemStatus: assign({
        isVcItemStoredSuccessfully: () => false,
      }),

      sendVcAdded: send(
        (_context, event) => VcEvents.VC_ADDED(event.response as VCMetadata),
        {
          to: context => context.serviceRefs.vc,
        },
      ),
    },

    guards: {
      isNetworkOn: (_context, event) => Boolean(event.data),
    },
  },
);

export function createMyVcsTabMachine(serviceRefs: AppServices) {
  return MyVcsTabMachine.withContext({
    ...MyVcsTabMachine.context,
    serviceRefs,
  });
}

type State = StateFrom<typeof MyVcsTabMachine>;

export function selectAddVcModal(state: State) {
  return state.children.AddVcModal as ActorRefFrom<typeof AddVcModalMachine>;
}

export function selectGetVcModal(state: State) {
  return state.children.GetVcModal as ActorRefFrom<typeof GetVcModalMachine>;
}

export function selectIsRequestSuccessful(state: State) {
  return state.context.isVcItemStoredSuccessfully;
}

export function selectIsSavingFailedInIdle(state: State) {
  return state.matches('addingVc.savingFailed.idle');
}

export function selectIsNetworkOff(state: State) {
  return state.matches('addVc.networkOff');
}
