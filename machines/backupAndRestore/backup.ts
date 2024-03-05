import {EventFrom, StateFrom, send} from 'xstate';
import {createModel} from 'xstate/lib/model';
import {AppServices} from '../../shared/GlobalContext';
import {
  IOS_SIGNIN_FAILED,
  LAST_BACKUP_DETAILS,
  MY_VCS_STORE_KEY,
  NETWORK_REQUEST_FAILED,
  TECHNICAL_ERROR,
  UPLOAD_MAX_RETRY,
  isIOS,
} from '../../shared/constants';
import {
  cleanupLocalBackups,
  compressAndRemoveFile,
  writeToBackupFile,
} from '../../shared/fileStorage';
import Cloud from '../../shared/CloudBackupAndRestoreUtils';
import {isMinimumLimitForBackupReached} from '../../shared/storage';
import {TelemetryConstants} from '../../shared/telemetry/TelemetryConstants';
import {
  getEndEventData,
  getImpressionEventData,
  getStartEventData,
  sendEndEvent,
  sendImpressionEvent,
  sendStartEvent,
} from '../../shared/telemetry/TelemetryUtils';
import {BackupDetails} from '../../types/backup-and-restore/backup';
import {StoreEvents} from '../store';

const model = createModel(
  {
    serviceRefs: {} as AppServices,
    dataFromStorage: {},
    fileName: '',
    lastBackupDetails: null as null | BackupDetails,
    errorReason: '' as string,
    isAutoBackUp: true as boolean,
    isLoadingBackupDetails: true as boolean,
    showBackupInProgress: false as boolean,
  },
  {
    events: {
      DATA_BACKUP: (isAutoBackUp: boolean) => ({isAutoBackUp}),
      DISMISS: () => ({}),
      DISMISS_SHOW_BACKUP_IN_PROGRESS: () => ({}),
      LAST_BACKUP_DETAILS: () => ({}),
      STORE_RESPONSE: (response: unknown) => ({response}),
      STORE_ERROR: (error: Error, requester?: string) => ({error, requester}),
      FILE_NAME: (filename: string) => ({filename}),
    },
  },
);

export const BackupEvents = model.events;

export const backupMachine = model.createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QCMCGBjA1gVwA4GIARAQQBViB9AIWIGEBpAVQAUBtABgF1FRcB7WAEsALoL4A7HiAAeiACwAmADQgAnogCcARgDMAOgDsOuQDYFWjSZ0mLCgL52VaLHnwAZYgGVS1Ok2YUhACi5ACSbp4c3Egg-EKiElKyCIoq6ggKCiZyehoGcgAc7DoArKUlGgU6Dk4YOLh6AGZgwugAFm6osMJUdXiELaiCADaweu1gWJ7CfABOYPjeAPIASkEUa57MSwBynkFRUnEiYpIxybpZeloFNmUaciVPummIFjoGemaFJXKPJSYDAYaiBnPUmi12p1ur0XLgBsIhqNxm1JphpnMFss1hsgltdvtWFporwBCdEudEFYSnoSgpbjp2MUPgVtK8Mlo-rSzOw-iUDPyFLyQWC8BDWh0uj0+vDBiMxhMpjN5otSKt1kEVitVocYscEmdQMlqbT6VYmToWWy1IghQ9DNY6SYTE9LKYRTLxVCpbD6gikQrUVhaMM+NgIPgIBIwHpBOIAG58TAx0UNZoS6HSuH++UotEhsMQBBxxPoVAGqK60nxU5JN46K43O46B5PEovG0ZdgmArcunsTlVDQKAEeuFeyUwmU55GKzAF8P4MCzWZzPS4YblxpzAC2elTE8zvv6ctnQfnofDxYTfDLFa4VdiZINdYQlxM11uWnu-3bOnZ5gFJ8jwNgolougYJhjuCYJxlAjAEIQoSeAAsshkRcEcz61pSKRyIyhhmAUWT8gYFhPOyGjWHojzDgojyFDcDzQWKsHiPBDRzoQ5aoMQ8ZIqgyAjCIqgAGJzMeBDYusmzbHsByYXq2EUkaiBPB+FqsmYJjsL8VTst+gKGK2dJUZYxjAo4oKemxHF5lg3GInxAlCcMInibMkmququL4vJRIkk+NYqTIakAnommWFkumFP+nbfuwXyPAUdIpaUxTClZB62Qh9mYI5vH8SMgnCcIYkSTK3k4rJBIHAogX6jhqkIOpEXFFp0V6XF6RaGRNKclYWRAiYGiZbU445Zx54YrMqAwM5xWuSJkbRrGN7JvuNl1HBuVzjNc1gAtm5LWV16luWpyVop1bkoaoVvlkH4PLocjsAUcgGPRw4GcYiUaA8OhaLo-2soDLENJNeX7fNRXHaVqgreIMYlkmKZbVgO1TWi0OHbDJVuadKN3pdD7ElhwV3Rcj25HIL1vR9X3KJ2ChUYYVTmPheQaO2WhQVl6OYJjUPKgdR348tUZI2tiYbdl23sbt00izDLnw2dt4XRIlb1eTt2vlo1PPb972fXI33xYUCgOoCBSspzdHg5tGMK1jSpzKLeMnQjy6rrM66bsI26zHucvO3Ze3K7jqsE6o6vE1rD7XUFeu4Qbzo03TJuM+yOi3BFALOq9txWFoxSO5DEfuyri3w0uK5rhuW67k7MHy+HStV1HNcx3HmviJWZNKRT+uG7TxsM2bTM9fyNIDuwYEMkNYHl23uXpu0BWiauO6EFQVUyXicmEknjUhck5jfnotvOjcvOvWU3VvBYOSWJyLPfmbQEaCvYdr5CbSb23rvfeFBNTahWI+U+lNbRAxpNfGwBQ766UtOyOknwRqWltlRdgeQgY-0Fi7CcgC+A7z3tJUBWodSDxui+XCF84HF1vtkZBj83yYIipUAwo0RoAz5uNVuv8GgAHdZgiDAAVUgfBRIjAWKJcI6wdjEBQgpBqyloEZEBBoK+QIPrpWsB8Ayz9cg2EUNoX4nDv78wmqvBoAAvQQuBJLSOGAsSWyN1po2sYIvQ9jHEymcWAXu95OCQLUa+RkJRey0yyAoIwuhAYfQMrpXsYE3qVH5GZYi+Cha+KcTIuuvt-ZN2Di3ViNifEOLyS4oJJMQknzCbhCJUS06xMBpaTkBh2SAkSlUdgApeQClptobJhDcn+PyT7BuAcg4hwFjkyp4zqlEz7gPVRw9GnJJoi0uJ7TEnxXoolds2QeyWCeAYN6Iy7J4FDKgCAVTXGrRRrLOZhDrl8FufcmpCc6lrJTs1YwsS2aQV5C2AE3YTCUXoklYu3Y35WEsvwsp3i3kfMWQsSZftG6B2bqHAhVyNzvLuWir5-dE6-Nof8zReh9GwL6dYY57IDCskMIoFKWRrD0ieJc3KKKiVwgCQUqZxTZleLxTyglqL+UyJJas3WFL7rWC4dSkuCUjCFwhfFPpH5vztg5h8AUCLrKiqFry+5ICar+XqesylSqaWqvpaYdktsrYDnNGBL6Lo5DcoaKatF5rD61QCnKpqCqqV2pKHS9VSSrgNksMUdsRQBwOCsuIPgEA4BSFTMGs+iAAC0Gr0i5qhUyEtpbS3DkdnGEQ2b1G-jakDbs71sgVAMnkXsvVHSxWMB8ewVjwTr0nFmP0p54BDz+fdGJXwXTGATQKJtragbUrHjgqwzpuy9sRWmf+R5pwjuFpiGt4TS5TrKI8G4c7HXMz6VoGirJIJmwqNkIwjsB07uzHuucC4ICHtwtzdt2hc60XMrTACOCcjdm5rpG4ttaYlG9T+5qQob3DksEBbs5zjBUS6foUC2g+rMj+AUb1sYIAuIQwq8Kug1WweIqYgydxqV9KqBhl0zpiNcR4mLL2HlJLkfPmbXILMeznO6Zh1hvMjDGU+v9XkvUcGGtxULSus1q5wxjnxzQTx87pN6v2FsnT4q-ByL8JlM7LTsrg32pFYqt0SmIaQjTb4Uqz0+kOZBw4DM9UBh+eiGCbCtlLhuo1AibN6BEWIiRUiZGOfonSXIEbXrmjeuYTzT97Sc0yJUBimDiNjKlWRsd8rz5VBvUCIUukBQG1ZIY9LLZMvvV+DlqzENym+vy2ARzxgLD527KULhxQuEFreLyXsZRnS0bjVl4jsBsDoHQHAUdNCQ3JCLvoQEjJuxMm0AOSiQIIq3CMCBcomRpsyPEMITws35uwEW8nIr8g3praMEyHSODS5aCdY8QwZFc5FGsC9BTLy7KNCRNgeYjnVtfGe5tt7O2LZcieLE3kI4Rp9VOy487olQfg8K8th7VQocbde9tj7nYI1wOyFURB2gbjdi9cmoAA */
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import('./backup.typegen').Typegen0,
    schema: {
      context: model.initialContext,
      events: {} as EventFrom<typeof model>,
    },
    id: 'backup',
    type: 'parallel',
    states: {
      fetchLastBackupDetails: {
        on: {
          LAST_BACKUP_DETAILS: {
            actions: 'setIsLoadingBackupDetails',
            target: '.checkCloud',
          },
        },
        entry: ['unsetLastBackupDetails', 'setIsLoadingBackupDetails'],
        initial: 'idle',
        states: {
          idle: {},
          checkStore: {
            entry: 'getLastBackupDetailsFromStore',
            on: {
              STORE_RESPONSE: [
                {
                  cond: 'isDataAvailableInStorage',
                  actions: [
                    'setLastBackupDetails',
                    'unsetIsLoadingBackupDetails',
                  ],
                  target: '#backup.fetchLastBackupDetails',
                },
                {target: 'checkCloud'},
              ],
              STORE_ERROR: {
                target: 'checkCloud',
              },
            },
          },
          checkCloud: {
            invoke: {
              src: 'getLastBackupDetailsFromCloud',
              onDone: {
                actions: [
                  'unsetIsLoadingBackupDetails',
                  'setLastBackupDetails',
                ],
                target: '#backup.fetchLastBackupDetails.idle',
              },
              onError: {
                actions: 'unsetIsLoadingBackupDetails',
                target: '#backup.fetchLastBackupDetails.idle',
              },
            },
          },
        },
      },
      backingUp: {
        initial: 'idle',
        on: {
          DATA_BACKUP: {
            actions: ['setIsAutoBackup', 'setShowBackupInProgress'],
            target: '.checkDataAvailabilityForBackup',
          },
          DISMISS: {
            target: '.idle',
          },
          DISMISS_SHOW_BACKUP_IN_PROGRESS: {
            actions: 'unsetShowBackupInProgress',
          },
        },
        states: {
          idle: {},
          checkDataAvailabilityForBackup: {
            entry: ['sendDataBackupStartEvent', 'loadVcs'],
            on: {
              STORE_RESPONSE: [
                {
                  cond: 'isVCFound',
                  target: 'checkStorageAvailability',
                },
                {
                  cond: 'checkIfAutoBackup',
                  actions: 'setBackUpNotPossible',
                  target: 'silentFailure',
                },
                {
                  actions: 'setBackUpNotPossible',
                  target: 'failure',
                },
              ],
            },
          },
          checkStorageAvailability: {
            invoke: {
              src: 'checkStorageAvailability',
              onDone: [
                {
                  cond: 'isMinimumStorageRequiredForBackupAvailable',
                  target: 'fetchDataFromDB',
                },
                {
                  cond: 'checkIfAutoBackup',
                  actions: 'setErrorReasonAsStorageLimitReached',
                  target: 'silentFailure',
                },
                {
                  actions: 'setErrorReasonAsStorageLimitReached',
                  target: 'failure',
                },
              ],
              onError: [
                {
                  cond: 'checkIfAutoBackup',
                  actions: ['setBackUpNotPossible'],
                  target: 'silentFailure',
                },
                {
                  actions: ['setBackUpNotPossible'],
                  target: 'failure',
                },
              ],
            },
          },
          fetchDataFromDB: {
            entry: ['fetchAllDataFromDB'],
            on: {
              STORE_RESPONSE: {
                actions: 'setDataFromStorage',
                target: 'writeDataToFile',
              },
              STORE_ERROR: [
                {
                  cond: 'checkIfAutoBackup',
                  actions: ['setBackupErrorReason'],
                  target: 'silentFailure',
                },
                {
                  actions: ['setBackupErrorReason'],
                  target: 'failure',
                },
              ],
            },
          },
          writeDataToFile: {
            invoke: {
              src: 'writeDataToFile',
            },
            on: {
              FILE_NAME: {
                actions: 'setFileName',
                target: 'zipBackupFile',
              },
            },
          },
          zipBackupFile: {
            invoke: {
              src: 'zipBackupFile',
              onDone: {
                target: 'uploadBackupFile',
              },
              onError: [
                {
                  cond: 'checkIfAutoBackup',
                  target: 'silentFailure',
                },
                {
                  target: 'failure',
                },
              ],
            },
          },
          uploadBackupFile: {
            invoke: {
              src: 'uploadBackupFile',
              onDone: {
                actions: ['extractLastBackupDetails', 'storeLastBackupDetails'],
              },
              onError: [
                {
                  cond: 'checkIfAutoBackup',
                  actions: ['setBackupErrorReason'],
                  target: 'silentFailure',
                },
                {
                  actions: ['setBackupErrorReason'],
                  target: 'failure',
                },
              ],
            },
            on: {
              STORE_RESPONSE: [
                {
                  cond: 'checkIfAutoBackup',
                  target: 'silentSuccess',
                },
                {
                  target: 'success',
                },
              ],
            },
          },
          success: {
            entry: [
              'unsetShowBackupInProgress',
              'sendDataBackupSuccessEvent',
              'cleanupFiles',
            ],
          },
          silentSuccess: {
            entry: ['sendDataBackupSuccessEvent', 'cleanupFiles'],
          },
          failure: {
            entry: [
              'unsetShowBackupInProgress',
              'sendDataBackupFailureEvent',
              'cleanupFiles',
            ],
          },
          silentFailure: {
            entry: ['sendDataBackupFailureEvent', 'cleanupFiles'],
          },
        },
      },
    },
  },
  {
    actions: {
      unsetIsLoadingBackupDetails: model.assign({
        isLoadingBackupDetails: false,
      }),
      setIsLoadingBackupDetails: model.assign({
        isLoadingBackupDetails: true,
      }),
      setDataFromStorage: model.assign({
        dataFromStorage: (_context, event) => {
          return event.response;
        },
      }),

      setIsAutoBackup: model.assign({
        isAutoBackUp: (_context, event) => {
          return event.isAutoBackUp;
        },
      }),

      setShowBackupInProgress: model.assign({
        showBackupInProgress: (context, _event) => {
          return !context.isAutoBackUp;
        },
      }),

      unsetShowBackupInProgress: model.assign({
        showBackupInProgress: false,
      }),

      setFileName: model.assign({
        fileName: (_context, event) => {
          return event.filename;
        },
      }),

      loadVcs: send(StoreEvents.GET(MY_VCS_STORE_KEY), {
        to: context => context.serviceRefs.store,
      }),

      setBackUpNotPossible: model.assign({
        errorReason: 'noDataForBackup',
      }),

      setErrorReasonAsStorageLimitReached: model.assign({
        errorReason: 'storageLimitReached',
      }),

      extractLastBackupDetails: model.assign((context, event) => {
        const {backupDetails} = event.data;
        return {
          ...context,
          lastBackupDetails: backupDetails,
        };
      }),

      setLastBackupDetails: model.assign((context, event) => {
        const lastBackupDetails =
          event.type === 'STORE_RESPONSE' ? event.response : event.data;
        return {
          ...context,
          lastBackupDetails: lastBackupDetails,
        };
      }),
      unsetLastBackupDetails: model.assign((context, event) => {
        return {
          ...context,
          lastBackupDetails: null,
        };
      }),

      storeLastBackupDetails: send(
        context => {
          const {lastBackupDetails} = context;
          return StoreEvents.SET(LAST_BACKUP_DETAILS, lastBackupDetails);
        },
        {
          to: context => context.serviceRefs.store,
        },
      ),

      getLastBackupDetailsFromStore: send(
        StoreEvents.GET(LAST_BACKUP_DETAILS),
        {
          to: context => {
            return context.serviceRefs.store;
          },
        },
      ),

      fetchAllDataFromDB: send(StoreEvents.EXPORT(), {
        to: context => {
          return context.serviceRefs.store;
        },
      }),

      setBackupErrorReason: model.assign({
        errorReason: (_context, event) => {
          const reasons = {
            [TECHNICAL_ERROR]: 'technicalError',
            [NETWORK_REQUEST_FAILED]: 'networkError',
            [IOS_SIGNIN_FAILED]: 'iCloudSignInError',
          };
          return reasons[event.data?.error] || reasons[TECHNICAL_ERROR];
        },
      }),

      sendDataBackupStartEvent: () => {
        sendStartEvent(
          getStartEventData(TelemetryConstants.FlowType.dataBackup),
        );
        sendImpressionEvent(
          getImpressionEventData(
            TelemetryConstants.FlowType.dataBackup,
            TelemetryConstants.Screens.dataBackupScreen,
          ),
        );
      },

      sendDataBackupSuccessEvent: () => {
        sendEndEvent(
          getEndEventData(
            TelemetryConstants.FlowType.dataBackup,
            TelemetryConstants.EndEventStatus.success,
          ),
        );
      },
      cleanupFiles: () => {
        cleanupLocalBackups();
      },

      sendDataBackupFailureEvent: () => {
        sendEndEvent(
          getEndEventData(
            TelemetryConstants.FlowType.dataBackup,
            TelemetryConstants.EndEventStatus.failure,
          ),
        );
      },
    },

    services: {
      getLastBackupDetailsFromCloud: () => async () =>
        await Cloud.lastBackupDetails(),

      checkStorageAvailability: () => async () => {
        try {
          console.log('Checking storage availability...');
          const isAvailable = await isMinimumLimitForBackupReached();
          console.log('Storage availability:', isAvailable);
          return isAvailable;
        } catch (error) {
          console.log('Error in checkStorageAvailability:', error);
          throw error;
        }
      },

      writeDataToFile: context => async callack => {
        const fileName = await writeToBackupFile(context.dataFromStorage);
        callack(model.events.FILE_NAME(fileName));
      },

      zipBackupFile: context => async () => {
        const result = await compressAndRemoveFile(context.fileName);
        return result;
      },
      uploadBackupFile: context => async () => {
        const result = await Cloud.uploadBackupFileToDrive(
          context.fileName,
          UPLOAD_MAX_RETRY,
        );
        return result;
      },
    },

    guards: {
      isMinimumStorageRequiredForBackupAvailable: (_context, event) => {
        return Boolean(!event.data);
      },
      checkIfAutoBackup: context => {
        return context.isAutoBackUp;
      },
      isVCFound: (_context, event) => {
        return !!(event.response && (event.response as object[]).length > 0);
      },
      isDataAvailableInStorage: (_context, event) => {
        return event.response != null;
      },
    },
  },
);

export function createBackupMachine(serviceRefs: AppServices) {
  return backupMachine.withContext({
    ...backupMachine.context,
    serviceRefs,
  });
}
export function selectIsBackupInprogress(state: State) {
  return (
    state.matches('backingUp.checkDataAvailabilityForBackup') ||
    state.matches('backingUp.checkStorageAvailability') ||
    state.matches('backingUp.fetchDataFromDB') ||
    state.matches('backingUp.writeDataToFile') ||
    state.matches('backingUp.zipBackupFile') ||
    state.matches('backingUp.uploadBackupFile')
  );
}
export function selectIsLoadingBackupDetails(state: State) {
  return state.context.isLoadingBackupDetails;
}
export function selectIsBackingUpSuccess(state: State) {
  return state.matches('backingUp.success');
}
export function selectIsBackingUpFailure(state: State) {
  return state.matches('backingUp.failure');
}
export function lastBackupDetails(state: State) {
  return state.context.lastBackupDetails;
}
export function selectBackupErrorReason(state: State) {
  return state.context.errorReason;
}
export function selectShowBackupInProgress(state: State) {
  return state.context.showBackupInProgress;
}
type State = StateFrom<typeof backupMachine>;
