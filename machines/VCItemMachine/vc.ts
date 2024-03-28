import {EventFrom, send, sendParent, StateFrom} from 'xstate';
import {createModel} from 'xstate/lib/model';
import {StoreEvents} from '../store';
import {VC} from '../../types/VC/vc';
import {AppServices} from '../../shared/GlobalContext';
import {log, respond} from 'xstate/lib/actions';
import {MY_VCS_STORE_KEY, RECEIVED_VCS_STORE_KEY} from '../../shared/constants';
import {parseMetadatas, VCMetadata} from '../../shared/VCMetadata';
import {ActivityLogEvents} from '../activityLog';
import {ActivityLog} from '../../components/ActivityLogEvent';
import Cloud, {isSignedInResult} from '../../shared/CloudBackupAndRestoreUtils';
import {BackupEvents} from '../backupAndRestore/backup';

const model = createModel(
  {
    serviceRefs: {} as AppServices,
    myVcs: [] as VCMetadata[],
    receivedVcs: [] as VCMetadata[],
    vcs: {} as Record<string, VC>,
    inProgressVcDownloads: new Set<string>(), //VCDownloadInProgress
    walletBindingSuccess: false,
    tamperedVcs: [] as VCMetadata[],
    downloadingFailedVcs: [] as VCMetadata[], //VCDownloadFailed
    verificationErrorMessage: '' as string,
  },
  {
    events: {
      VIEW_VC: (vc: VC) => ({vc}),
      GET_VC_ITEM: (vcMetadata: VCMetadata) => ({vcMetadata}),
      STORE_RESPONSE: (response: unknown) => ({response}),
      STORE_ERROR: (error: Error) => ({error}),
      VC_ADDED: (vcMetadata: VCMetadata) => ({vcMetadata}),
      REMOVE_VC_FROM_CONTEXT: (vcMetadata: VCMetadata) => ({vcMetadata}),
      VC_METADATA_UPDATED: (vcMetadata: VCMetadata) => ({vcMetadata}),
      VC_DOWNLOADED: (vc: VC, vcMetadata?: VCMetadata) => ({
        vc,
        vcMetadata,
      }),
      REFRESH_MY_VCS: () => ({}),
      REFRESH_MY_VCS_TWO: (vc: VC) => ({vc}),
      REFRESH_RECEIVED_VCS: () => ({}),
      WALLET_BINDING_SUCCESS: () => ({}),
      RESET_WALLET_BINDING_SUCCESS: () => ({}),
      ADD_VC_TO_IN_PROGRESS_DOWNLOADS: (requestId: string) => ({requestId}),
      REMOVE_VC_FROM_IN_PROGRESS_DOWNLOADS: (vcMetadata: VCMetadata) => ({
        vcMetadata,
      }),
      RESET_IN_PROGRESS_VCS_DOWNLOADED: () => ({}),
      TAMPERED_VC: (VC: VCMetadata) => ({VC}),
      REMOVE_TAMPERED_VCS: () => ({}),
      DOWNLOAD_LIMIT_EXPIRED: (vcMetadata: VCMetadata) => ({vcMetadata}),
      DELETE_VC: () => ({}),
      VERIFY_VC_FAILED: (errorMessage: string, vcMetadata?: VCMetadata) => ({
        errorMessage,
        vcMetadata,
      }),
      RESET_VERIFY_ERROR: () => ({}),
      REFRESH_VCS_METADATA: () => ({}),
    },
  },
);

export const VcEvents = model.events;

export const vcMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDcDGA6AlgO0wF3QFsBPANVVgGIBlAFQHkAlAUQH0XqAFegOWucSgADgHtY+TCOyCQAD0QBmABwAmdAEYALCoCsANgAMOgJx6dAdnNmANCGKIlBvemWbLKvcc06FVgL5+tmhYuAQATmCoYJjIkORUdExsHNx8AkggouJ4ktIZ8gjKalq65qrmmup6SpqatvYI6k6a6HoKmko6OkpK5sb9AUEYEQCGEMREZBRYEAA2YJQsAGIcABKsALIAmqykAMLUMlkSUjIF6uom6JV6ujrqxo7qZfWITRUamgpOKubdWuYVIMQMFRuNJvF0BEAGYRWAACxwUBoDBY7GYXF4-COYhOeVA50u5nQxh8fyKCm6uleCFMxKayjaBgUCjaFmBoLAYwmESiMTi00wcwWyzW6L2zAAkqRmAARXYHHHZXJnN7qXwacwGAyVJymJTqGnqlnoToqFS+XzqA1ODnDLng3nRWIQSEwuGI7DIxJolJY9LCXE5U75NV6dToJy+YwGXrGFRuI0WiNKUnqvS3LwGcwKO1Qh3ESgAcWYtHFUpl8v2hwyx2D+LkbxUplangzPVumhjdTsiEMBg0XWb6rp1vMebBhZLZf2rEltGYGyVeNVjQuEeZvi1zO1Nl7CH7g50w4Uo56E4LlFnAEFZbK5cv66vjAoI1ahyz9OSaYfLsfjCOejmGOF7cleeysLK9AAOo8AAMvQt4PrWQYqqGjTHgokbxhaKgPF46gqEoP7akeug1H0x7aKB4zgeW0rIYGyohgSfa6C4NRVO0mh6DxlQ0n8OitE0mhOD4OpuLmwLYCIEBwDIwQ4PgEIUI+aGsYU1ToBY0baM2Si3LxP5WJGNTNgYeFUgMgQghgSnhJEzoCvAKHMQ2BTtPSRg6o4omVBUNIAcUqgKCoTg9DqJh5vZaksY2hQWho3kdDqOrPD2DSGFhsbaAZDyAjxNETCQkJCvMsXuYgjzOOafxakorJuBaRoWUJ3wWRUHQ+AZehFSpsD5rCcCelAFWriOKbtg1XUmC8+79MYpras2Zj9H0CZ9SVqmuSu6GmGotUWLGjWAgoNKpi0DIhfoFhmFJQz5ty+Z8i6pXCmNe2dBoZj3BZlw1KyRqvhGGYWGtxhlAZSh9U6-KutM7rDUiH0aSOag+I8zQ-N4SYGd9VIPIRzZETDjlw-EKPxaYEZVF0TSWQDehGv9pqkgYENVJcvhFZTBQvvSP30-9XxM-ulgDldvjVA15qaHavOIM2i1NDoPmpf5GWIMe9JDjotSGFm6gBAEQA */
  model.createMachine(
    {
      predictableActionArguments: true,
      preserveActionOrder: true,
      tsTypes: {} as import('./vc.typegen').Typegen0,
      schema: {
        context: model.initialContext,
        events: {} as EventFrom<typeof model>,
      },
      id: 'vc',
      initial: 'init',
      states: {
        init: {
          on: {
            REFRESH_MY_VCS: {
              target: '#vc.ready.myVcs.refreshing',
            },
          },
          initial: 'myVcs',
          states: {
            myVcs: {
              entry: 'loadMyVcs',
              on: {
                STORE_RESPONSE: {
                  actions: 'setMyVcs',
                  target: 'receivedVcs',
                },
              },
            },
            receivedVcs: {
              entry: 'loadReceivedVcs',
              on: {
                STORE_RESPONSE: {
                  actions: 'setReceivedVcs',
                  target: '#vc.ready',
                },
              },
            },
          },
        },
        ready: {
          entry: sendParent('READY'),
          type: 'parallel',
          states: {
            myVcs: {
              initial: 'idle',
              states: {
                idle: {
                  on: {
                    REFRESH_MY_VCS: {
                      actions: [log('REFRESH_MY_VCS:myVcs---')],
                      target: 'refreshing',
                    },
                    WALLET_BINDING_SUCCESS: {
                      actions: 'setWalletBindingSuccess',
                    },
                  },
                },
                refreshing: {
                  entry: 'loadMyVcs',
                  on: {
                    STORE_RESPONSE: {
                      actions: 'setMyVcs',
                      target: 'idle',
                    },
                  },
                },
              },
            },
            receivedVcs: {
              initial: 'idle',
              states: {
                idle: {},
                refreshing: {
                  entry: 'loadReceivedVcs',
                  on: {
                    STORE_RESPONSE: {
                      actions: 'setReceivedVcs',
                      target: 'idle',
                    },
                  },
                },
              },
            },
          },
          on: {
            GET_VC_ITEM: {
              actions: 'getVcItemResponse',
            },
            VC_ADDED: {
              actions: 'prependToMyVcs',
            },
            REMOVE_VC_FROM_CONTEXT: {
              actions: 'removeVcFromMyVcs',
            },
            VC_METADATA_UPDATED: {
              actions: ['updateMyVcs', 'setUpdatedVcMetadatas'],
            },
            VC_DOWNLOADED: {
              actions: 'setDownloadedVc',
            },
            ADD_VC_TO_IN_PROGRESS_DOWNLOADS: {
              actions: 'addVcToInProgressDownloads',
            },
            REMOVE_VC_FROM_IN_PROGRESS_DOWNLOADS: {
              actions: 'removeVcFromInProgressDownlods',
            },
            RESET_IN_PROGRESS_VCS_DOWNLOADED: {
              actions: 'resetInProgressVcsDownloaded',
            },
            RESET_WALLET_BINDING_SUCCESS: {
              actions: 'resetWalletBindingSuccess',
            },
            REFRESH_RECEIVED_VCS: {
              target: '#vc.ready.receivedVcs.refreshing',
            },
            TAMPERED_VC: {
              actions: 'setTamperedVcs',
              target: 'tamperedVCs',
            },
            DOWNLOAD_LIMIT_EXPIRED: {
              actions: [
                'removeVcFromInProgressDownlods',
                'setDownloadingFailedVcs',
              ],
              target: '#vc.ready.myVcs.refreshing',
            },
            DELETE_VC: {
              target: 'deletingFailedVcs',
            },
            VERIFY_VC_FAILED: {
              actions: [
                'removeVcFromInProgressDownlods',
                'setVerificationErrorMessage',
              ],
              target: '#vc.ready.myVcs.refreshing',
            },
            RESET_VERIFY_ERROR: {
              actions: 'resetVerificationErrorMessage',
            },
          },
        },
        tamperedVCs: {
          initial: 'idle',
          on: {
            REMOVE_TAMPERED_VCS: {
              target: '.triggerAutoBackupForTamperedVcDeletion',
            },
          },
          states: {
            idle: {},
            triggerAutoBackupForTamperedVcDeletion: {
              invoke: {
                src: 'isUserSignedAlready',
                onDone: [
                  {
                    cond: 'isSignedIn',
                    actions: 'sendBackupEvent',
                    target: 'refreshVcsMetadata',
                  },
                  {
                    target: 'refreshVcsMetadata',
                  },
                ],
              },
            },
            refreshVcsMetadata: {
              entry: ['logTamperedVCsremoved', send('REFRESH_VCS_METADATA')],
              on: {
                REFRESH_VCS_METADATA: {
                  target: '#vc.init',
                },
              },
            },
          },
        },
        deletingFailedVcs: {
          entry: 'removeDownloadFailedVcsFromStorage',
          on: {
            STORE_RESPONSE: {
              actions: [
                'removeDownloadingFailedVcsFromMyVcs',
                'resetDownloadFailedVcs',
              ],
              target: '#vc.ready.myVcs.refreshing',
            },
          },
        },
      },
    },
    {
      actions: {
        sendBackupEvent: send(BackupEvents.DATA_BACKUP(true), {
          to: context => context.serviceRefs.backup,
        }),

        getVcItemResponse: respond((context, event) => {
          return {
            type: 'GET_VC_RESPONSE',
            response:
              context.vcs[VCMetadata.fromVC(event.vcMetadata)?.getVcKey()],
          };
        }),

        loadMyVcs: send(StoreEvents.GET(MY_VCS_STORE_KEY), {
          to: context => context.serviceRefs.store,
        }),

        loadReceivedVcs: send(StoreEvents.GET(RECEIVED_VCS_STORE_KEY), {
          to: context => context.serviceRefs.store,
        }),

        setMyVcs: model.assign({
          myVcs: (_context, event) => {
            return parseMetadatas((event.response || []) as object[]);
          },
        }),

        setReceivedVcs: model.assign({
          receivedVcs: (_context, event) => {
            return parseMetadatas((event.response || []) as object[]);
          },
        }),

        setTamperedVcs: model.assign({
          tamperedVcs: (context, event) => [event.VC, ...context.tamperedVcs],
        }),

        setDownloadingFailedVcs: model.assign({
          downloadingFailedVcs: (context, event) => [
            ...context.downloadingFailedVcs,
            event.vcMetadata,
          ],
        }),

        setVerificationErrorMessage: model.assign({
          verificationErrorMessage: (context, event) => event.errorMessage,
        }),

        resetVerificationErrorMessage: model.assign({
          verificationErrorMessage: (_context, event) => '',
        }),

        resetDownloadFailedVcs: model.assign({
          downloadingFailedVcs: (context, event) => [],
        }),

        setDownloadedVc: (context, event) => {
          const vcMetaData = event.vcMetadata ? event.vcMetadata : event.vc;
          const vcUniqueId = VCMetadata.fromVC(vcMetaData).getVcKey();
          context.vcs[vcUniqueId] = event.vc;
        },

        addVcToInProgressDownloads: model.assign({
          inProgressVcDownloads: (context, event) => {
            let paresedInProgressList: Set<string> =
              context.inProgressVcDownloads;
            const newVcRequestID = event.requestId;
            const newInProgressList = paresedInProgressList.add(newVcRequestID);
            return newInProgressList;
          },
        }),

        removeVcFromInProgressDownlods: model.assign({
          inProgressVcDownloads: (context, event) => {
            let updatedInProgressList: Set<string> =
              context.inProgressVcDownloads;
            if (!event.vcMetadata) {
              return updatedInProgressList;
            }
            const removeVcRequestID = event.vcMetadata.requestId;
            updatedInProgressList.delete(removeVcRequestID);

            return updatedInProgressList;
          },
        }),

        resetInProgressVcsDownloaded: model.assign({
          inProgressVcDownloads: new Set<string>(),
        }),

        setUpdatedVcMetadatas: send(
          _context => {
            return StoreEvents.SET(MY_VCS_STORE_KEY, _context.myVcs);
          },
          {to: context => context.serviceRefs.store},
        ),

        prependToMyVcs: model.assign({
          myVcs: (context, event) => [event.vcMetadata, ...context.myVcs],
        }),

        removeVcFromMyVcs: model.assign({
          myVcs: (context, event) =>
            context.myVcs.filter(
              (vc: VCMetadata) => !vc.equals(event.vcMetadata),
            ),
        }),

        removeDownloadingFailedVcsFromMyVcs: model.assign({
          myVcs: (context, event) =>
            context.myVcs.filter(
              value =>
                !context.downloadingFailedVcs.some(item => item?.equals(value)),
            ),
        }),

        removeDownloadFailedVcsFromStorage: send(
          context => {
            return StoreEvents.REMOVE_ITEMS(
              MY_VCS_STORE_KEY,
              context.downloadingFailedVcs.map(m => m.getVcKey()),
            );
          },
          {
            to: context => context.serviceRefs.store,
          },
        ),

        logTamperedVCsremoved: send(
          context =>
            ActivityLogEvents.LOG_ACTIVITY(ActivityLog.logTamperedVCs()),
          {
            to: context => context.serviceRefs.activityLog,
          },
        ),

        updateMyVcs: model.assign({
          myVcs: (context, event) => [
            ...getUpdatedVCMetadatas(context.myVcs, event.vcMetadata),
          ],
        }),

        setWalletBindingSuccess: model.assign({
          walletBindingSuccess: true,
        }),
        resetWalletBindingSuccess: model.assign({
          walletBindingSuccess: false,
        }),
      },

      guards: {
        isSignedIn: (_context, event) =>
          (event.data as isSignedInResult).isSignedIn,
      },

      services: {
        isUserSignedAlready: () => async () => {
          return await Cloud.isSignedInAlready();
        },
      },
    },
  );

export function createVcMachine(serviceRefs: AppServices) {
  return vcMachine.withContext({
    ...vcMachine.context,
    serviceRefs,
  });
}

type State = StateFrom<typeof vcMachine>;

export function selectMyVcsMetadata(state: State): VCMetadata[] {
  return state.context.myVcs;
}

export function selectShareableVcsMetadata(state: State): VCMetadata[] {
  return state.context.myVcs.filter(
    vcMetadata =>
      state.context.vcs[vcMetadata.getVcKey()]?.credential != null ||
      state.context.vcs[vcMetadata.getVcKey()]?.verifiableCredential != null,
  );
}

export function selectReceivedVcsMetadata(state: State): VCMetadata[] {
  return state.context.receivedVcs;
}

export function selectIsRefreshingMyVcs(state: State) {
  return state.matches('ready.myVcs.refreshing');
}

export function selectIsRefreshingReceivedVcs(state: State) {
  return state.matches('ready.receivedVcs.refreshing');
}

/*
  this methods returns all the binded vc's in the wallet.
 */
export function selectBindedVcsMetadata(state: State): VCMetadata[] {
  return state.context.myVcs.filter(vcMetadata => {
    const walletBindingResponse =
      state.context.vcs[vcMetadata.getVcKey()]?.walletBindingResponse;
    return (
      !isEmpty(walletBindingResponse) &&
      !isEmpty(walletBindingResponse?.walletBindingId)
    );
  });
}

export function selectInProgressVcDownloads(state: State) {
  return state.context.inProgressVcDownloads;
}

function getUpdatedVCMetadatas(
  existingVCMetadatas: VCMetadata[],
  updatedVcMetadata: VCMetadata,
) {
  const isPinStatusUpdated = updatedVcMetadata.isPinned;

  return existingVCMetadatas.map(value => {
    if (value.equals(updatedVcMetadata)) {
      return updatedVcMetadata;
    } else if (isPinStatusUpdated) {
      return new VCMetadata({...value, isPinned: false});
    } else {
      return value;
    }
  });
}

function isEmpty(object) {
  return object == null || object == '' || object == undefined;
}

export function selectWalletBindingSuccess(state: State) {
  return state.context.walletBindingSuccess;
}

export function selectIsTampered(state: State) {
  return state.matches('tamperedVCs');
}

export function selectDownloadingFailedVcs(state: State) {
  return state.context.downloadingFailedVcs;
}

export function selectMyVcs(state: State) {
  return state.context.vcs;
}

export function selectVerificationErrorMessage(state: State) {
  return state.context.verificationErrorMessage;
}
