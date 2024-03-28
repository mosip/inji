import {createModel} from 'xstate/lib/model';
import {AppServices} from '../../shared/GlobalContext';
import {VCMetadata} from '../../shared/VCMetadata';
import {assign, EventFrom, send} from 'xstate';
import {getIdType} from '../../shared/openId4VCI/Utils';
import {VerifiableCredential, WalletBindingResponse} from '../../types/VC/vc';
import {StoreEvents} from '../store';
import {ActivityLogEvents} from '../activityLog';
import {MIMOTO_BASE_URL, MY_VCS_STORE_KEY} from '../../shared/constants';
import {BackupEvents} from '../backupAndRestore/backup';
import {VcEvents} from './vc';
import i18n from '../../i18n';
import {
  generateKeys,
  isHardwareKeystoreExists,
} from '../../shared/cryptoutil/cryptoUtil';
import {KeyPair} from 'react-native-rsa-native';
import {
  getBindingCertificateConstant,
  savePrivateKey,
} from '../../shared/keystore/SecureKeystore';
import {TelemetryConstants} from '../../shared/telemetry/TelemetryConstants';
import {
  getEndEventData,
  getErrorEventData,
  getInteractEventData,
  getStartEventData,
  sendEndEvent,
  sendErrorEvent,
  sendInteractEvent,
  sendStartEvent,
} from '../../shared/telemetry/TelemetryUtils';
import Cloud, {isSignedInResult} from '../../shared/CloudBackupAndRestoreUtils';
import {CredentialDownloadResponse, request} from '../../shared/request';
import SecureKeystore from '@mosip/secure-keystore';
import {log} from 'xstate/lib/actions';
import {getHomeMachineService} from '../../screens/Home/HomeScreenController';
import {verifyCredential} from '../../shared/vcjs/verifyCredential';
import getAllConfigurations, {API_URLS, DownloadProps} from '../../shared/api';
import {CommunicationDetails} from '../../shared/Utils';
import {VCItemEvent} from './VCItemEvents';

const machineName = 'vc-item-machine';
const model = createModel(
  {
    serviceRefs: {} as AppServices,
    vcMetadata: {} as VCMetadata,
    generatedOn: new Date() as Date,
    verifiableCredential: null as unknown as VerifiableCredential,
    hashedId: '',
    publicKey: '',
    privateKey: '',
    OTP: '',
    error: '',
    bindingTransactionId: '',
    requestId: '',
    downloadCounter: 0,
    maxDownloadCount: null as unknown as number,
    downloadInterval: null as unknown as number,
    walletBindingResponse: null as unknown as WalletBindingResponse,
    isMachineInKebabPopupState: false,
    communicationDetails: null as unknown as CommunicationDetails,
  },
  {
    events: VCItemEvent,
  },
);

export const VCItemEvents = model.events;
export const VCItemMachine = model.createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import('./VCItemMachine.typegen').Typegen0,
    schema: {
      context: model.initialContext,
      events: {} as EventFrom<typeof model>,
    },
    on: {
      REFRESH: {
        target: 'loadVc',
      },
      UPDATE_VC_METADATA: {
        actions: 'setVcMetadata',
      },
    },
    description:
      'This machine is spawned for every VC downloaded, and tracks its lifecycle.',
    id: machineName,
    initial: 'loadVc',
    states: {
      loadVc: {
        initial: 'loadVcFromContext',
        states: {
          loadVcFromContext: {
            entry: ['requestVcContext'],
            description: 'Fetch the VC data from the Memory.',
            on: {
              GET_VC_RESPONSE: [
                {
                  actions: ['setContext'],
                  cond: 'hasCredential',
                  target: `#vc-item-machine.idle`,
                },
                {
                  target: 'loadVcFromStore',
                },
              ],
            },
          },
          loadVcFromStore: {
            entry: 'requestStoredContext',
            description: 'Check if VC data is in secured local storage.',
            on: {
              STORE_RESPONSE: [
                {
                  actions: ['setContext', 'storeVcInContext'],
                  cond: 'hasCredential',
                  target: '#vc-item-machine.idle',
                },
                {
                  actions: 'addVcToInProgressDownloads',
                  target: 'loadVcFromServer',
                },
              ],
              TAMPERED_VC: {
                actions: 'sendTamperedVc',
              },
            },
          },
          loadVcFromServer: {
            description:
              "Download VC data from the server. Uses polling method to check when it's available.",
            initial: 'loadDownloadLimitConfig',
            states: {
              loadDownloadLimitConfig: {
                invoke: {
                  src: 'loadDownloadLimitConfig',
                  onDone: {
                    actions: ['setMaxDownloadCount', 'setDownloadInterval'],
                    target: 'verifyingDownloadLimitExpiry',
                  },
                },
              },
              verifyingDownloadLimitExpiry: {
                entry: ['incrementDownloadCounter'],
                invoke: {
                  src: 'checkDownloadExpiryLimit',
                  onDone: {
                    target: 'checkingStatus',
                  },
                  onError: {
                    actions: [
                      log((_, event) => (event.data as Error).message),
                      'sendDownloadLimitExpire',
                    ],
                  },
                },
              },
              checkingStatus: {
                invoke: {
                  src: 'checkStatus',
                  id: 'checkStatus',
                },
                on: {
                  POLL: {
                    actions: send('POLL_STATUS', {to: 'checkStatus'}),
                  },
                  DOWNLOAD_READY: {
                    target: 'downloadingCredential',
                  },
                  FAILED: {
                    actions: 'sendDownloadLimitExpire',
                  },
                },
              },
              downloadingCredential: {
                invoke: {
                  src: 'downloadCredential',
                  id: 'downloadCredential',
                },
                on: {
                  POLL: [
                    {
                      cond: 'isDownloadAllowed',
                      actions: [
                        send('POLL_DOWNLOAD', {to: 'downloadCredential'}),
                        'incrementDownloadCounter',
                      ],
                    },
                    {
                      target: 'verifyingDownloadLimitExpiry',
                    },
                  ],
                  CREDENTIAL_DOWNLOADED: {
                    actions: 'setCredential',
                    target: '#vc-item-machine.verifyingCredential',
                  },
                },
              },
              savingFailed: {
                entry: ['removeVcMetaDataFromStorage'],
                initial: 'idle',
                states: {
                  idle: {},
                  viewingVc: {},
                },
                on: {
                  DISMISS: {
                    actions: ['removeVcMetaDataFromVcMachineContext'],
                    target: '.viewingVc',
                  },
                },
              },
            },
          },
        },
      },
      walletBinding: {
        initial: 'showBindingWarning',
        states: {
          showBindingWarning: {
            on: {
              CONFIRM: {
                actions: 'sendActivationStartEvent',
                target: 'requestingBindingOTP',
              },
              CANCEL: [
                {
                  cond: context => context.isMachineInKebabPopupState,
                  target: '#vc-item-machine.kebabPopUp',
                },
                {
                  target: '#vc-item-machine.idle',
                },
              ],
            },
          },
          requestingBindingOTP: {
            invoke: {
              src: 'requestBindingOTP',
              onDone: [
                {
                  target: 'acceptingBindingOTP',
                  actions: ['setCommunicationDetails'],
                },
              ],
              onError: [
                {
                  actions: [
                    'setErrorAsWalletBindingError',
                    'sendWalletBindingErrorEvent',
                    'logWalletBindingFailure',
                  ],
                  target: 'showingWalletBindingError',
                },
              ],
            },
          },
          showingWalletBindingError: {
            on: {
              CANCEL: [
                {
                  cond: context => context.isMachineInKebabPopupState,
                  actions: ['unSetError'],
                  target: '#vc-item-machine.kebabPopUp',
                },
                {
                  actions: ['unSetError'],
                  target: '#vc-item-machine.idle',
                },
              ],
            },
          },
          acceptingBindingOTP: {
            entry: ['unSetOTP'],
            on: {
              INPUT_OTP: {
                target: 'addKeyPair',
                actions: ['setOTP'],
              },
              DISMISS: [
                {
                  cond: context => context.isMachineInKebabPopupState,
                  target: '#vc-item-machine.kebabPopUp',
                  actions: [
                    'sendUserCancelledActivationFailedEndEvent',
                    'unSetOTP',
                    'unSetBindingTransactionId',
                  ],
                },
                {
                  target: '#vc-item-machine.idle',
                  actions: [
                    'sendUserCancelledActivationFailedEndEvent',
                    'unSetOTP',
                    'unSetBindingTransactionId',
                  ],
                },
              ],
              RESEND_OTP: {
                target: '.resendOTP',
              },
            },
            initial: 'idle',
            states: {
              idle: {},
              resendOTP: {
                invoke: {
                  src: 'requestBindingOTP',
                  onDone: {
                    target: '#vc-item-machine.idle',
                    actions: ['setCommunicationDetails'],
                  },
                  onError: {
                    actions: [
                      'setErrorAsWalletBindingError',
                      'sendWalletBindingErrorEvent',
                    ],
                    target:
                      '#vc-item-machine.walletBinding.showingWalletBindingError',
                  },
                },
              },
            },
          },
          addKeyPair: {
            invoke: {
              src: 'generateKeyPair',
              onDone: [
                {
                  cond: 'isCustomSecureKeystore',
                  target: 'addingWalletBindingId',
                  actions: ['setPublicKey'],
                },
                {
                  target: 'addingWalletBindingId',
                  actions: ['setPublicKey', 'setPrivateKey'],
                },
              ],
              onError: [
                {
                  actions: [
                    'setErrorAsWalletBindingError',
                    'sendWalletBindingErrorEvent',
                    'logWalletBindingFailure',
                  ],
                  target: 'showingWalletBindingError',
                },
              ],
            },
          },
          addingWalletBindingId: {
            invoke: {
              src: 'addWalletBindingId',
              onDone: [
                {
                  cond: 'isCustomSecureKeystore',
                  target: 'updatingContextVariables',
                  actions: ['setWalletBindingResponse'],
                },
                {
                  target: 'updatingPrivateKey',
                  /*The walletBindingResponse is used for conditional rendering in wallet binding.                                                                                                                                                                                                                                                                                                                                                                                                                                          response and use it in updatingPrivateKey state*/
                  actions: ['setWalletBindingResponse'],
                },
              ],
              onError: [
                {
                  actions: [
                    'setErrorAsWalletBindingError',
                    'sendWalletBindingErrorEvent',
                    'logWalletBindingFailure',
                  ],
                  target: 'showingWalletBindingError',
                },
              ],
            },
          },

          updatingPrivateKey: {
            invoke: {
              src: 'updatePrivateKey',
              onDone: {
                target: 'updatingContextVariables',
              },
              onError: {
                actions: [
                  'setErrorAsWalletBindingError',
                  'sendWalletBindingErrorEvent',
                  'logWalletBindingFailure',
                ],
                target: 'showingWalletBindingError',
              },
            },
          },
          updatingContextVariables: {
            entry: [
              'setThumbprintForWalletBindingId',
              'storeContext',
              'resetPrivateKey',
              'storeVcInContext',
              'unSetError',
              'sendActivationSuccessEvent',
              'logWalletBindingSuccess',
              send('SHOW_BINDING_STATUS'),
            ],
            on: {
              SHOW_BINDING_STATUS: [
                {
                  cond: context => context.isMachineInKebabPopupState,
                  actions: 'sendWalletBindingSuccess',
                  target: '#vc-item-machine.kebabPopUp',
                },
                {
                  actions: 'sendWalletBindingSuccess',
                  target: '#vc-item-machine.idle',
                },
              ],
            },
          },
        },
      },
      kebabPopUp: {
        entry: assign({isMachineInKebabPopupState: () => true}),
        exit: assign({isMachineInKebabPopupState: () => false}),
        on: {
          DISMISS: {
            actions: assign({
              isMachineInKebabPopupState: () => false,
            }),
            target: 'idle',
          },
          ADD_WALLET_BINDING_ID: {
            target: '#vc-item-machine.walletBinding',
          },
          PIN_CARD: {
            target: '.pinCard',
            actions: 'setPinCard',
          },
          SHOW_ACTIVITY: {
            target: '#vc-item-machine.kebabPopUp.showActivities',
          },
          REMOVE: {
            actions: 'setVcKey',
            target: '#vc-item-machine.kebabPopUp.removeWallet',
          },
          CLOSE_VC_MODAL: {
            actions: ['closeViewVcModal'],
            target: '#vc-item-machine',
          },
        },
        initial: 'idle',
        states: {
          idle: {},
          showActivities: {
            on: {
              DISMISS: '#vc-item-machine',
            },
          },
          removeWallet: {
            on: {
              CONFIRM: {
                target: 'removingVc',
              },
              CANCEL: {
                target: '#vc-item-machine',
              },
            },
          },
          removingVc: {
            entry: 'removeVcItem',
            on: {
              STORE_RESPONSE: {
                actions: ['closeViewVcModal', 'refreshAllVcs', 'logRemovedVc'],
                target: 'triggerAutoBackup',
              },
            },
          },
          pinCard: {
            entry: 'sendVcUpdated',
            always: {
              target: '#vc-item-machine.idle',
            },
          },
          triggerAutoBackup: {
            invoke: {
              src: 'isUserSignedAlready',
              onDone: [
                {
                  cond: 'isSignedIn',
                  actions: ['sendBackupEvent', 'refreshAllVcs', 'logRemovedVc'],
                  target: '#vc-item-machine',
                },
                {
                  actions: ['refreshAllVcs', 'logRemovedVc'],
                  target: '#vc-item-machine',
                },
              ],
            },
          },
        },
      },
      verifyingCredential: {
        invoke: {
          src: 'verifyCredential',
          onDone: {
            actions: ['storeContext'],
          },
          onError: {
            //To-Do Handle Error Scenarios
            actions: ['setErrorAsVerificationError'],
            target: '.handleVCVerificationFailure',
          },
        },
        on: {
          STORE_RESPONSE: {
            actions: [
              'storeVcInContext',
              'logDownloaded',
              'sendTelemetryEvents',
              'removeVcFromInProgressDownloads',
            ],
            target: '.triggerAutoBackupForVcDownload',
          },
          STORE_ERROR: {
            target: '#vc-item-machine.loadVc.loadVcFromServer.savingFailed',
          },
        },
        initial: 'idle',
        states: {
          idle: {},
          triggerAutoBackupForVcDownload: {
            invoke: {
              src: 'isUserSignedAlready',
              onDone: [
                {
                  cond: 'isSignedIn',
                  actions: ['sendBackupEvent'],
                  target: '#vc-item-machine.idle',
                },
                {
                  target: '#vc-item-machine.idle',
                },
              ],
            },
          },
          handleVCVerificationFailure: {
            entry: ['removeVcMetaDataFromStorage'],
            on: {
              STORE_RESPONSE: {
                actions: ['sendVerificationError'],
              },
            },
          },
        },
      },
      idle: {
        on: {
          DISMISS: {
            target: '#vc-item-machine.loadVc.loadVcFromContext',
          },
          KEBAB_POPUP: {
            target: 'kebabPopUp',
          },
          ADD_WALLET_BINDING_ID: {
            target: '#vc-item-machine.walletBinding',
          },
          PIN_CARD: {
            target: '#vc-item-machine.kebabPopUp.pinCard',
            actions: 'setPinCard',
          },
        },
      },
    },
  },
  {
    actions: {
      setCommunicationDetails: model.assign({
        communicationDetails: (_context, event) => {
          const communicationDetails: CommunicationDetails = {
            phoneNumber: event.data.response.maskedMobile,
            emailId: event.data.response.maskedEmail,
          };
          return communicationDetails;
        },
      }),
      requestVcContext: send(
        context => ({
          type: 'GET_VC_ITEM',
          vcMetadata: context.vcMetadata,
        }),
        {
          to: context => context.serviceRefs.vc,
        },
      ),
      requestStoredContext: send(
        context => {
          return StoreEvents.GET(
            VCMetadata.fromVC(context.vcMetadata).getVcKey(),
          );
        },
        {
          to: context => context.serviceRefs.store,
        },
      ),
      setContext: model.assign((context, event) => {
        const {...data} = event.response;
        return {...context, ...data};
      }),
      setCredential: model.assign((context, event) => {
        return {
          ...context,
          ...event.response,
          vcMetadata: context.vcMetadata,
        };
      }),
      storeContext: send(
        context => {
          const {serviceRefs, isMachineInKebabPopupState, ...data} = context;
          data.credentialRegistry = MIMOTO_BASE_URL;
          return StoreEvents.SET(
            VCMetadata.fromVC(context.vcMetadata).getVcKey(),
            data,
          );
        },
        {
          to: context => context.serviceRefs.store,
        },
      ),
      setVcMetadata: assign({
        vcMetadata: (_, event) => event.vcMetadata,
      }),
      storeVcInContext: send(
        //todo : separate handling done for openid4vci , handle commonly from vc machine
        context => {
          const {serviceRefs, ...verifiableCredential} = context;
          return {
            type: 'VC_DOWNLOADED',
            vc: verifiableCredential,
            vcMetadata: context.vcMetadata,
          };
        },
        {
          to: context => context.serviceRefs.vc,
        },
      ),
      removeVcMetaDataFromStorage: send(
        context => {
          return StoreEvents.REMOVE_VC_METADATA(
            MY_VCS_STORE_KEY,
            context.vcMetadata.getVcKey(),
          );
        },
        {
          to: context => context.serviceRefs.store,
        },
      ),
      removeVcMetaDataFromVcMachineContext: send(
        context => {
          return {
            type: 'REMOVE_VC_FROM_CONTEXT',
            vcMetadata: context.vcMetadata,
          };
        },
        {
          to: context => context.serviceRefs.vc,
        },
      ),
      sendDownloadLimitExpire: send(
        (_context, event) => {
          return {
            type: 'DOWNLOAD_LIMIT_EXPIRED',
            vcMetadata: _context.vcMetadata,
          };
        },
        {
          to: context => context.serviceRefs.vc,
        },
      ),

      sendVerificationError: send(
        (context, event) => {
          return {
            type: 'VERIFY_VC_FAILED',
            errorMessage: context.error,
            vcMetadata: context.vcMetadata,
          };
        },
        {
          to: context => context.serviceRefs.vc,
        },
      ),
      refreshAllVcs: send(
        () => ({
          type: 'REFRESH_MY_VCS',
        }),
        {
          to: context => context.serviceRefs.vc,
        },
      ),

      setPinCard: assign({
        vcMetadata: context =>
          new VCMetadata({
            ...context.vcMetadata,
            isPinned: !context.vcMetadata.isPinned,
          }),
      }),
      sendBackupEvent: send(BackupEvents.DATA_BACKUP(true), {
        to: context => context.serviceRefs.backup,
      }),
      //todo: revisit on this for naming and impl
      sendVcUpdated: send(
        context => VcEvents.VC_METADATA_UPDATED(context.vcMetadata),
        {
          to: context => context.serviceRefs.vc,
        },
      ),
      sendTamperedVc: send(
        context => VcEvents.TAMPERED_VC(context.vcMetadata),
        {
          to: context => context.serviceRefs.vc,
        },
      ),
      setErrorAsWalletBindingError: assign({
        error: () =>
          i18n.t('errors.genericError', {
            ns: 'common',
          }),
      }),
      setErrorAsVerificationError: assign({
        //todo handle error message from different actions
        error: (context, event) => (event.data as Error).message,
      }),
      unSetError: assign({
        error: () => '',
      }),
      setBindingTransactionId: assign({
        //todo: check this with vijay
        bindingTransactionId: () =>
          String(new Date().valueOf()).substring(3, 13),
      }),

      unSetBindingTransactionId: assign({bindingTransactionId: () => ''}),
      sendWalletBindingSuccess: send(
        context => {
          return {
            type: 'WALLET_BINDING_SUCCESS',
          };
        },
        {
          to: context => context.serviceRefs.vc,
        },
      ),
      setWalletBindingResponse: assign({
        walletBindingResponse: (context, event) =>
          event.data as WalletBindingResponse,
      }),
      incrementDownloadCounter: model.assign({
        downloadCounter: ({downloadCounter}) => downloadCounter + 1,
      }),

      setMaxDownloadCount: model.assign({
        maxDownloadCount: (_context, event) =>
          Number((event.data as DownloadProps).maxDownloadLimit),
      }),

      setDownloadInterval: model.assign({
        downloadInterval: (_context, event) =>
          Number((event.data as DownloadProps).downloadInterval),
      }),
      sendActivationStartEvent: context => {
        sendStartEvent(
          getStartEventData(
            context.isMachineInKebabPopupState
              ? TelemetryConstants.FlowType.vcActivationFromKebab
              : TelemetryConstants.FlowType.vcActivation,
          ),
        );
        sendInteractEvent(
          getInteractEventData(
            context.isMachineInKebabPopupState
              ? TelemetryConstants.FlowType.vcActivationFromKebab
              : TelemetryConstants.FlowType.vcActivation,
            TelemetryConstants.InteractEventSubtype.click,
            'Activate Button',
          ),
        );
      },

      sendUserCancelledActivationFailedEndEvent: context => {
        const [errorId, errorMessage] = [
          TelemetryConstants.ErrorId.userCancel,
          TelemetryConstants.ErrorMessage.activationCancelled,
        ];
        sendEndEvent(
          getEndEventData(
            context.isMachineInKebabPopupState
              ? TelemetryConstants.FlowType.vcActivationFromKebab
              : TelemetryConstants.FlowType.vcActivation,
            TelemetryConstants.EndEventStatus.failure,
            {
              errorId: errorId,
              errorMessage: errorMessage,
            },
          ),
        );
      },

      sendWalletBindingErrorEvent: (context, event) => {
        if (context.error) {
          const error = JSON.parse(JSON.stringify(event.data)).name
            ? JSON.parse(JSON.stringify(event.data)).name + '-' + context.error
            : context.error;
          sendErrorEvent(
            getErrorEventData(
              TelemetryConstants.FlowType.vcActivation,
              TelemetryConstants.ErrorId.activationFailed,
              error,
            ),
          );
        }
        sendEndEvent(
          getEndEventData(
            TelemetryConstants.FlowType.vcActivation,
            TelemetryConstants.EndEventStatus.failure,
          ),
        );
      },

      sendActivationSuccessEvent: context =>
        sendEndEvent(
          getEndEventData(
            context.isMachineInKebabPopupState
              ? TelemetryConstants.FlowType.vcActivationFromKebab
              : TelemetryConstants.FlowType.vcActivation,
            TelemetryConstants.EndEventStatus.success,
          ),
        ),

      setPublicKey: assign({
        publicKey: (context, event) => {
          if (!isHardwareKeystoreExists) {
            return (event.data as KeyPair).public;
          }
          return event.data as string;
        },
      }),

      setPrivateKey: assign({
        privateKey: (context, event) => (event.data as KeyPair).private,
      }),
      resetPrivateKey: assign({
        privateKey: () => '',
      }),
      setThumbprintForWalletBindingId: send(
        context => {
          const {walletBindingResponse} = context;
          const walletBindingIdKey = getBindingCertificateConstant(
            walletBindingResponse.walletBindingId,
          );
          return StoreEvents.SET(
            walletBindingIdKey,
            walletBindingResponse.thumbprint,
          );
        },
        {
          to: context => context.serviceRefs.store,
        },
      ),
      setOTP: model.assign({
        OTP: (_, event) => event.OTP,
      }),

      unSetOTP: model.assign({OTP: () => ''}),
      removeVcItem: send(
        _context => {
          return StoreEvents.REMOVE(
            MY_VCS_STORE_KEY,
            _context.vcMetadata.getVcKey(),
          );
        },
        {to: context => context.serviceRefs.store},
      ),
      setVcKey: model.assign({
        vcMetadata: (_, event) => event.vcMetadata,
      }),
      removeVcFromInProgressDownloads: send(
        context => {
          return {
            type: 'REMOVE_VC_FROM_IN_PROGRESS_DOWNLOADS',
            vcMetadata: context.vcMetadata,
          };
        },
        {
          to: context => context.serviceRefs.vc,
        },
      ),

      addVcToInProgressDownloads: send(
        context => {
          return {
            type: 'ADD_VC_TO_IN_PROGRESS_DOWNLOADS',
            requestId: context.vcMetadata.requestId,
          };
        },
        {
          to: context => context.serviceRefs.vc,
        },
      ),
      sendTelemetryEvents: () => {
        sendEndEvent({
          type: TelemetryConstants.FlowType.vcDownload,
          status: TelemetryConstants.EndEventStatus.success,
        });
      },
      closeViewVcModal: send('DISMISS_MODAL', {
        to: () => getHomeMachineService(),
      }),
      logDownloaded: send(
        context => {
          const {serviceRefs, ...data} = context;
          return ActivityLogEvents.LOG_ACTIVITY({
            _vcKey: context.vcMetadata.getVcKey(),
            type: 'VC_DOWNLOADED',
            id: context.vcMetadata.id,
            idType: getIdType(context.vcMetadata.issuer),
            timestamp: Date.now(),
            deviceName: '',
            vcLabel: data.id,
          });
        },
        {
          to: context => context.serviceRefs.activityLog,
        },
      ),
      logRemovedVc: send(
        (context, _) =>
          ActivityLogEvents.LOG_ACTIVITY({
            idType: getIdType(context.vcMetadata.issuer),
            id: context.vcMetadata.id,
            _vcKey: VCMetadata.fromVC(context.vcMetadata).getVcKey(),
            type: 'VC_REMOVED',
            timestamp: Date.now(),
            deviceName: '',
            vcLabel: VCMetadata.fromVC(context.vcMetadata).id,
          }),
        {
          to: context => context.serviceRefs.activityLog,
        },
      ),
      logWalletBindingSuccess: send(
        context =>
          ActivityLogEvents.LOG_ACTIVITY({
            _vcKey: VCMetadata.fromVC(context.vcMetadata).getVcKey(),
            type: 'WALLET_BINDING_SUCCESSFULL',
            idType: getIdType(context.vcMetadata.issuer),
            id: context.vcMetadata.id,
            timestamp: Date.now(),
            deviceName: '',
            vcLabel: VCMetadata.fromVC(context.vcMetadata).id,
          }),
        {
          to: context => context.serviceRefs.activityLog,
        },
      ),

      logWalletBindingFailure: send(
        context =>
          ActivityLogEvents.LOG_ACTIVITY({
            _vcKey: VCMetadata.fromVC(context.vcMetadata).getVcKey(),
            type: 'WALLET_BINDING_FAILURE',
            id: context.vcMetadata.id,
            idType: getIdType(context.vcMetadata.issuer),
            timestamp: Date.now(),
            deviceName: '',
            vcLabel: VCMetadata.fromVC(context.vcMetadata).id,
          }),
        {
          to: context => context.serviceRefs.activityLog,
        },
      ),
    },
    services: {
      isUserSignedAlready: () => async () => {
        return await Cloud.isSignedInAlready();
      },

      updatePrivateKey: async context => {
        const hasSetPrivateKey: boolean = await savePrivateKey(
          context.walletBindingResponse.walletBindingId,
          context.privateKey,
        );
        if (!hasSetPrivateKey) {
          throw new Error('Could not store private key in keystore.');
        }
        return '';
      },
      loadDownloadLimitConfig: async context => {
        var resp = await getAllConfigurations();
        const maxLimit: number = resp.vcDownloadMaxRetry;
        const vcDownloadPoolInterval: number = resp.vcDownloadPoolInterval;

        const downloadProps: DownloadProps = {
          maxDownloadLimit: maxLimit,
          downloadInterval: vcDownloadPoolInterval,
        };
        return downloadProps;
      },

      checkDownloadExpiryLimit: async context => {
        if (context.downloadCounter > context.maxDownloadCount) {
          throw new Error(
            'Download limit expired for request id: ' +
              context.vcMetadata.requestId,
          );
        }
      },
      addWalletBindingId: async context => {
        const response = await request(
          API_URLS.walletBinding.method,
          API_URLS.walletBinding.buildURL(),
          {
            requestTime: String(new Date().toISOString()),
            request: {
              authFactorType: 'WLA',
              format: 'jwt',
              individualId: VCMetadata.fromVC(context.vcMetadata).id,
              transactionId: context.bindingTransactionId,
              publicKey: context.publicKey,
              challengeList: [
                {
                  authFactorType: 'OTP',
                  challenge: context.OTP,
                  format: 'alpha-numeric',
                },
              ],
            },
          },
        );
        const certificate = response.response.certificate;
        await savePrivateKey(
          getBindingCertificateConstant(
            VCMetadata.fromVC(context.vcMetadata).id,
          ),
          certificate,
        );

        const walletResponse: WalletBindingResponse = {
          walletBindingId: response.response.encryptedWalletBindingId,
          keyId: response.response.keyId,
          thumbprint: response.response.thumbprint,
          expireDateTime: response.response.expireDateTime,
        };
        return walletResponse;
      },

      generateKeyPair: async context => {
        if (!isHardwareKeystoreExists) {
          return await generateKeys();
        }
        const isBiometricsEnabled = SecureKeystore.hasBiometricsEnabled();
        return SecureKeystore.generateKeyPair(
          VCMetadata.fromVC(context.vcMetadata).id,
          isBiometricsEnabled,
          0,
        );
      },
      requestBindingOTP: async context => {
        const vc = VCMetadata.fromVC(context.vcMetadata).isFromOpenId4VCI()
          ? context.verifiableCredential.credential
          : context.verifiableCredential;
        const response = await request(
          API_URLS.bindingOtp.method,
          API_URLS.bindingOtp.buildURL(),
          {
            requestTime: String(new Date().toISOString()),
            request: {
              individualId: vc.credentialSubject.VID
                ? vc.credentialSubject.VID
                : vc.credentialSubject.UIN,
              otpChannels: ['EMAIL', 'PHONE'],
            },
          },
        );
        if (response.response == null) {
          throw new Error('Could not process request');
        }
        return response;
      },
      checkStatus: context => (callback, onReceive) => {
        const pollInterval = setInterval(
          () => callback(model.events.POLL()),
          context.downloadInterval,
        );

        onReceive(async event => {
          if (event.type === 'POLL_STATUS') {
            try {
              const response = await request(
                API_URLS.credentialStatus.method,
                API_URLS.credentialStatus.buildURL(
                  context.vcMetadata.requestId,
                ),
              );
              switch (response.response?.statusCode) {
                case 'NEW':
                  break;
                case 'ISSUED':
                case 'printing':
                  callback(model.events.DOWNLOAD_READY());
                  break;
                case 'FAILED':
                default:
                  callback(model.events.FAILED());
                  clearInterval(pollInterval);
                  break;
              }
            } catch (error) {
              callback(model.events.FAILED());
              clearInterval(pollInterval);
            }
          }
        });

        return () => clearInterval(pollInterval);
      },

      downloadCredential: context => (callback, onReceive) => {
        const pollInterval = setInterval(
          () => callback(model.events.POLL()),
          context.downloadInterval,
        );

        onReceive(async event => {
          if (event.type === 'POLL_DOWNLOAD') {
            const response: CredentialDownloadResponse = await request(
              API_URLS.credentialDownload.method,
              API_URLS.credentialDownload.buildURL(),
              {
                individualId: context.vcMetadata.id,
                requestId: context.vcMetadata.requestId,
              },
            );

            callback(
              model.events.CREDENTIAL_DOWNLOADED({
                credential: response.credential,
                verifiableCredential: response.verifiableCredential,
                generatedOn: new Date(),
                id: context.vcMetadata.id,
                idType: context.vcMetadata.idType,
                requestId: context.vcMetadata.requestId,
                lastVerifiedOn: null,
                walletBindingResponse: null,
                credentialRegistry: '',
              }),
            );
          }
        });

        return () => clearInterval(pollInterval);
      },

      verifyCredential: async context => {
        if (context.verifiableCredential) {
          const verificationResult = await verifyCredential(
            context.verifiableCredential,
          );
          if (!verificationResult.isVerified) {
            throw new Error(verificationResult.errorMessage);
          }
        }
      },
    },
    guards: {
      hasCredential: (_, event) => {
        const vc = event.response;
        return vc?.credential != null || vc?.verifiableCredential != null;
      },
      isSignedIn: (_context, event) =>
        (event.data as isSignedInResult).isSignedIn,

      isDownloadAllowed: _context => {
        return _context.downloadCounter <= _context.maxDownloadCount;
      },

      isCustomSecureKeystore: () => isHardwareKeystoreExists,
    },
  },
);

export const createVCItemMachine = (
  serviceRefs: AppServices,
  vcMetadata: VCMetadata,
) => {
  return VCItemMachine.withContext({
    ...VCItemMachine.context,
    serviceRefs,
    vcMetadata,
  });
};
