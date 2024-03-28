import {authorize, AuthorizeResult} from 'react-native-app-auth';
import {assign, EventFrom, send, sendParent, StateFrom} from 'xstate';
import {createModel} from 'xstate/lib/model';
import {
  MY_VCS_STORE_KEY,
  NETWORK_REQUEST_FAILED,
  REQUEST_TIMEOUT,
} from '../shared/constants';
import {StoreEvents} from './store';
import {BackupEvents} from './backupAndRestore/backup';
import {AppServices} from '../shared/GlobalContext';
import NetInfo from '@react-native-community/netinfo';
import {
  generateKeys,
  isHardwareKeystoreExists,
} from '../shared/cryptoutil/cryptoUtil';
import SecureKeystore from '@mosip/secure-keystore';
import {KeyPair} from 'react-native-rsa-native';
import {ActivityLogEvents} from './activityLog';
import {log} from 'xstate/lib/actions';
import {verifyCredential} from '../shared/vcjs/verifyCredential';
import {
  constructAuthorizationConfiguration,
  ErrorMessage,
  getBody,
  getIdType,
  Issuers,
  Issuers_Key_Ref,
  OIDCErrors,
  updateCredentialInformation,
  updateVCmetadataOfCredentialWrapper,
  vcDownloadTimeout,
} from '../shared/openId4VCI/Utils';
import {
  getEndEventData,
  getImpressionEventData,
  sendEndEvent,
  sendImpressionEvent,
} from '../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../shared/telemetry/TelemetryConstants';

import {CredentialWrapper, VerifiableCredential} from '../types/VC/vc';
import {CACHED_API} from '../shared/api';
import {request} from '../shared/request';
import {BiometricCancellationError} from '../shared/error/BiometricCancellationError';
import {VCMetadata, getVCMetadata} from '../shared/VCMetadata';
import Cloud, {isSignedInResult} from '../shared/CloudBackupAndRestoreUtils';

const model = createModel(
  {
    issuers: [] as issuerType[],
    selectedIssuerId: '' as string,
    selectedIssuer: {} as issuerType,
    tokenResponse: {} as AuthorizeResult,
    errorMessage: '' as string,
    loadingReason: 'displayIssuers' as string,
    verifiableCredential: null as VerifiableCredential | null,
    credentialWrapper: {} as CredentialWrapper,
    serviceRefs: {} as AppServices,
    verificationErrorMessage: '',
    publicKey: ``,
    privateKey: ``,
    vcMetadata: {} as VCMetadata,
  },
  {
    events: {
      SELECTED_ISSUER: (id: string) => ({id}),
      DOWNLOAD_ID: () => ({}),
      BIOMETRIC_CANCELLED: (requester?: string) => ({requester}),
      COMPLETED: () => ({}),
      TRY_AGAIN: () => ({}),
      RESET_ERROR: () => ({}),
      CHECK_KEY_PAIR: () => ({}),
      CANCEL: () => ({}),
      STORE_RESPONSE: (response?: unknown) => ({response}),
      STORE_ERROR: (error: Error, requester?: string) => ({error, requester}),
      RESET_VERIFY_ERROR: () => ({}),
    },
  },
);

export const IssuerScreenTabEvents = model.events;
export const Issuer_Tab_Ref_Id = 'issuersMachine';

export const IssuersMachine = model.createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QEtawK5gE6wLIEMBjAC2QDswA6CVABwBt8BPASTUxwGIIB7Cy8gDceAayqoM2PEVL8asBszaScCIT0L4ALsj4BtAAwBdQ0cShaPWMh19zIAB6IALAEYAnJWfuAzM4BsAKwAHN7BwQDsfgA0IEyIAEw+Ea6UBgkRwT7uEekGrhHOAL5FsRIc0iTkVPKKrOxSnNhYPFiUiloAZq0AtgINOARVcnSM9SqwamTCmrZkpqb2ltZz9k4Izgme3n5Boe7hUc6x8QgJ3gZpgT6BgRH+yYWBJWUDlbJUza2cACoASgBNAD6AEEAOIglgAOUWSBAyxsujIaxcWy8vgCITCkRicUSIQSlGyCQMETu7n84QKLxA5SkQw+lC+WF+gNBEOhelcZjhCNWcPWrgSJ0QQppdMGMmqTKwLRZ-2B4MhMISPIsVkRdgFooMvjS-jc9wezl1ARFZwiCUClFcN3czmcKWuPnFbwZ0uZnD+AFEAMren5A71-P4AeT+sPVKyRKIQrgMwX8lASCWCgVcgW8lt15oyEU8CSCloz6WcN38rom7v4sDA9DAhB0ZCgyg4nAAIqGAOpQgAyoZB7aBLHbkfhGv5oHWPgMBmclEigQM-lTVpyc9z+R8yfzriyPhTS4zlYq1aotfrjfILYGnH9ve9AGEft6hyxfb6AKrBsd8mPahBAmFPEEB8VwhS8XVkgKA5dXcE96SlOQeAAdzIegeHwCBW2wR8+E6ZAoG4PhxGmURxDdJCalQ9DMOwgY8LIAioCmGZtCRBZjCWCd-ynUVgNOMVSlpSjhmotCMKwnCsEY5imllVp2kYLpen6KsqOoGjJPolRZMI1iNHY-RjF-HitT4jYUwXZwgMpFMfHCGcIlze15zuFdghyA5UweBDJTEygSAbEQWDILRsAoLRiP4dQxEC4hgtC8KsEi0zo3MxxRVuQlLUCdxdUzbIhX8c14w8Iky1ucI1zTYI-PeaUgsIEKwoisAot4GKyLipqWuS1LuW49LkQA4I0SFdxwOXO1-HSUrbUuLZSX8XwMn8Vwy3qs94sS1qUva+S5SU7RuiwPpeqStqtDSzURos4IIMpB5i1moCHPNSbgi8QIDXcPLcltDIto0i69simU5QSVlFQ5GEuN5My7syuNkiTfJJvyDwiyCUrZ2tPwbimoDMhuYGAtobBTp6EF0C0YhWmQAAvIyyGi0jhDiiUGv4CmsCpmm6YZ5m5gM2YOJM+Go1u2NbJtFbJoyN7U3cc0V2tbxXH8FdHSPe0ycZXn+dp+msCZlnDsUjoqbU08NMN3oBZNs2RfUMXjJMSXx2GmXNbl9wFbJJJlfNB6bUiLYbiW-KIgifXpXts7HaF83mWOlSzptxDycph3jeTl2yLd+YTMGhHvYA64k01-2hUDg9PNK5J52CAwZ3TQpwNj4Sue23qAGkwCYAAFfBkBZR8AAknz7oE++9YEh8hCNPb-DLBTnKuPD+h15cKc0qptDaMcibxnm70TGX7weR7HzhJ+n2f56BReWAjUupcnZH4x8Tf-czAJ-Z7xAskS4YFiQeXOJ5F0591IBRgBQLA2gwAD2HqPFknV2bkUzv5Rk8DsBIJQTfLAosWacTVF7aWAECjZEoPlTy6Z1o5HOOaPwqRqoOQyGNTMKY478DwYg8KhC0FswEN1CisDcFgAQQQ6+aCSFzAWO-Chn9BRRE8HQv6msPCWmOCBFMhI0xBH8DHMkOQyS8PErRLCj4sCQCkTofA9BYAiNiuI22AVeASTojYuxYVkCOMmK7UhEtyGryRusGyER9SWgpIVCkYFAi5j3EmG4CZW4OSbsUGB7jGSeKsRAHxEB7H+KcRbNoVtVI9w0nk7ShTikBPkeLD2oTEaxkidErYQQyzxIzLmThlBKSrQzJsKkFjNJeOsbYopfiAl3xBFCR83pew3RUS4R0HTYndIeL0kCe4ogVSyB4ByMcNpjMENgZAnQmDXjqTM+gLixHYO5lQc5psrk3KmfU+gjT3YrN4l-eMnguF3HOAkDMDlEl6ITFXYxDosjnCONA14EjpSvMudc5styHH3NThUjOVSApoveZiz5dyfnF2aUNShFkppAqtCCzY4K0x9IMNafMDCDgPBJAeMZyAID1jvqGXAQ8HwvlHCvVpVC1ZeG5VsVMUQ9l9JNAM5wY0W6pnjJEXl-KwBzIWUsv5a9RTSs2K3OVOJFV6NtKkG4eVUytx+jymkZAeBFPgHCAlHwqWrIQAAWh-uaX1ZIw6WnuJVKIK0EhjNqGMaS7qP7-PWJaXMP0okmhTPmGOFJ4wVmyVnRkzJvWJsQC3IFOQNqJkKPmG4uZMiXF1JSTYhZ0i7DGReBsTYbwqCLUauMu4iRUh+pmIUG0km2gGQURMqNNibTzTg6UNS6LST0lAHt4TEDGJcoWWhI6xreACGSXNyKcmNQSs1S6+0tBrtjGGgZU6XqsqSMEc0ZJtwFRNAUHeGYz7Hvzae3a-V2oQ1aAka9VCwVROhS3PKfhlwFA+mNZMjxcgORskkI9IkUU8xzonPOpthb-LCW0gSoofB+C8GNFaLd4zLhjmMq+qCx5gYsoehcMcbi7g2imVW5H0yqrGjcPwlo6pzueZQfhMjGNYGY1-PwhISQFGeoJlILCwJeHWhmBVFahK-vnchCZBTSXYvjco4tCAch9LU7Va48ZHSUjORc4lUAsUlJk+sQZyYqrrgNFrZ9VrKR3uMR5TWZGf5tq0AzZsbnSO+0NNkNwbhHKQsEv7bcar8pgW8FsUI2r6zRZRhmNIMdVy5Dyuqyz84AhPXsqqlI0aSL5ZgjawdXSR26NOCmX2WxHS6k-Xxs+JQgA */
    predictableActionArguments: true,
    preserveActionOrder: true,
    id: Issuer_Tab_Ref_Id,
    context: model.initialContext,
    initial: 'displayIssuers',
    tsTypes: {} as import('./issuersMachine.typegen').Typegen0,
    schema: {
      context: model.initialContext,
      events: {} as EventFrom<typeof model>,
    },
    states: {
      displayIssuers: {
        description: 'displays the issuers downloaded from the server',
        invoke: {
          src: 'downloadIssuersList',
          onDone: {
            actions: [
              'sendImpressionEvent',
              'setIssuers',
              'resetLoadingReason',
            ],
            target: 'selectingIssuer',
          },
          onError: {
            //loadingReason is not reset here so that we go to previous(Home) screen on back button press of error screen
            actions: ['setError'],
            target: 'error',
          },
        },
      },
      error: {
        description: 'reaches here when any error happens',
        on: {
          TRY_AGAIN: [
            {
              description: 'not fetched issuers yet',
              cond: 'shouldFetchIssuersAgain',
              actions: ['setLoadingReasonAsDisplayIssuers', 'resetError'],
              target: 'displayIssuers',
            },
            {
              cond: 'canSelectIssuerAgain',
              actions: 'resetError',
              target: 'selectingIssuer',
            },
            {
              description: 'not fetched issuers config yet',
              actions: ['setLoadingReasonAsSettingUp', 'resetError'],
              target: 'downloadIssuerConfig',
            },
          ],
          RESET_ERROR: {
            actions: 'resetError',
            target: 'selectingIssuer',
          },
        },
      },
      selectingIssuer: {
        description: 'waits for the user to select any issuer',
        on: {
          DOWNLOAD_ID: {
            actions: sendParent('DOWNLOAD_ID'),
          },
          SELECTED_ISSUER: {
            actions: ['setSelectedIssuerId', 'setLoadingReasonAsSettingUp'],
            target: 'downloadIssuerConfig',
          },
        },
      },
      downloadIssuerConfig: {
        description: 'downloads the configuration of the selected issuer',
        invoke: {
          src: 'downloadIssuerConfig',
          onDone: {
            actions: 'setSelectedIssuers',
            target: 'checkInternet',
          },
          onError: {
            actions: ['setError', 'resetLoadingReason'],
            target: 'error',
          },
        },
      },
      checkInternet: {
        description: 'checks internet before opening the web view',
        invoke: {
          src: 'checkInternet',
          id: 'checkInternet',
          onDone: [
            {
              cond: 'isInternetConnected',
              target: 'performAuthorization',
            },
            {
              actions: ['setNoInternet', 'resetLoadingReason'],
              target: 'error',
            },
          ],
          onError: {
            actions: () =>
              console.error('Error Occurred while checking Internet'),
            target: 'error',
          },
        },
      },
      performAuthorization: {
        description:
          'invokes the issuers authorization endpoint and gets the access token',
        invoke: {
          src: 'invokeAuthorization',
          onDone: {
            actions: [
              'setTokenResponse',
              'setLoadingReasonAsSettingUp',
              'getKeyPairFromStore',
            ],
          },
          onError: [
            {
              cond: 'isOIDCflowCancelled',
              actions: ['resetError', 'resetLoadingReason'],
              target: 'selectingIssuer',
            },
            {
              cond: 'isOIDCConfigError',
              actions: ['setOIDCConfigError'],
              target: 'error',
            },
            {
              actions: [
                'setError',
                'resetLoadingReason',
                (_, event) =>
                  console.error(
                    'Error Occurred while invoking Auth - ',
                    event.data,
                  ),
              ],
              target: 'error',
            },
          ],
        },
        initial: 'idle',
        states: {
          idle: {
            on: {
              STORE_RESPONSE: {
                actions: 'loadKeyPair',
                target: '#issuersMachine.checkKeyPair',
              },
              BIOMETRIC_CANCELLED: {
                target: 'userCancelledBiometric',
              },
              STORE_ERROR: {
                target: '#issuersMachine.checkKeyPair',
              },
            },
          },
          userCancelledBiometric: {
            on: {
              TRY_AGAIN: [
                {
                  actions: ['getKeyPairFromStore'],
                  target: 'idle',
                },
              ],
              RESET_ERROR: {
                actions: 'resetLoadingReason',
                target: '#issuersMachine.selectingIssuer',
              },
            },
          },
        },
      },
      checkKeyPair: {
        description: 'checks whether key pair is generated',
        entry: [
          'setLoadingReasonAsDownloadingCredentials',
          send('CHECK_KEY_PAIR'),
        ],
        on: {
          CHECK_KEY_PAIR: [
            {
              cond: 'hasKeyPair',
              target: 'downloadCredentials',
            },
            {
              target: 'generateKeyPair',
            },
          ],
        },
      },
      generateKeyPair: {
        description:
          'if keypair is not generated, new one is created and stored',
        invoke: {
          src: 'generateKeyPair',
          onDone: [
            {
              actions: [
                'setPublicKey',
                'setLoadingReasonAsDownloadingCredentials',
                'storeKeyPair',
              ],
              cond: 'isCustomSecureKeystore',
              target: 'downloadCredentials',
            },
            {
              actions: [
                'setPublicKey',
                'setLoadingReasonAsDownloadingCredentials',
                'setPrivateKey',
                'storeKeyPair',
              ],
              target: 'downloadCredentials',
            },
          ],
        },
      },
      downloadCredentials: {
        description: 'credential is downloaded from the selected issuer',
        invoke: {
          src: 'downloadCredential',
          onDone: {
            actions: ['setVerifiableCredential', 'setCredentialWrapper'],
            target: 'verifyingCredential',
          },
          onError: [
            {
              cond: 'hasUserCancelledBiometric',
              target: '.userCancelledBiometric',
            },
            {
              actions: ['setError', 'resetLoadingReason'],
              target: 'error',
            },
          ],
        },
        on: {
          CANCEL: {
            target: 'selectingIssuer',
          },
        },
        initial: 'idle',
        states: {
          idle: {},
          userCancelledBiometric: {
            on: {
              TRY_AGAIN: [
                {
                  actions: ['setLoadingReasonAsDownloadingCredentials'],
                  target: '#issuersMachine.downloadCredentials',
                },
              ],
              RESET_ERROR: {
                actions: 'resetLoadingReason',
                target: '#issuersMachine.selectingIssuer',
              },
            },
          },
        },
      },
      verifyingCredential: {
        description:
          'once the credential is downloaded, it is verified before saving',
        invoke: {
          src: 'verifyCredential',
          onDone: [
            {
              actions: ['sendSuccessEndEvent'],
              target: 'storing',
            },
          ],
          onError: [
            {
              actions: [
                log('Verification Error.'),
                'resetLoadingReason',
                'updateVerificationErrorMessage',
                'sendErrorEndEvent',
              ],
              //TODO: Move to state according to the required flow when verification of VC fails
              target: 'handleVCVerificationFailure',
            },
          ],
        },
      },

      handleVCVerificationFailure: {
        on: {
          RESET_VERIFY_ERROR: {
            actions: ['resetVerificationErrorMessage'],
          },
        },
      },

      storing: {
        description: 'all the verified credential is stored.',
        entry: [
          'setVCMetadata',
          'setMetadataInCredentialData',
          'storeVerifiableCredentialMeta',
          'storeVerifiableCredentialData',
          'storeVcsContext',
          'storeVcMetaContext',
          'logDownloaded',
        ],
        invoke: {
          src: 'isUserSignedAlready',
          onDone: {
            cond: 'isSignedIn',
            actions: ['sendBackupEvent'],
          },
        },
      },
      idle: {
        on: {
          COMPLETED: {
            target: 'done',
          },
          CANCEL: {
            target: 'selectingIssuer',
          },
        },
      },
      done: {
        type: 'final',
      },
    },
  },
  {
    actions: {
      setIssuers: model.assign({
        issuers: (_, event) => event.data,
      }),
      setNoInternet: model.assign({
        errorMessage: () => ErrorMessage.NO_INTERNET,
      }),
      setLoadingReasonAsDisplayIssuers: model.assign({
        loadingReason: 'displayIssuers',
      }),
      setLoadingReasonAsDownloadingCredentials: model.assign({
        loadingReason: 'downloadingCredentials',
      }),
      setLoadingReasonAsSettingUp: model.assign({
        loadingReason: 'settingUp',
      }),
      resetLoadingReason: model.assign({
        loadingReason: null,
      }),
      setError: model.assign({
        errorMessage: (_, event) => {
          console.error('Error occured ', event.data.message);
          const error = event.data.message;
          switch (error) {
            case NETWORK_REQUEST_FAILED:
              return ErrorMessage.NO_INTERNET;
            case REQUEST_TIMEOUT:
              return ErrorMessage.REQUEST_TIMEDOUT;
            default:
              return ErrorMessage.GENERIC;
          }
        },
      }),
      setOIDCConfigError: model.assign({
        errorMessage: (_, event) => event.data.toString(),
      }),
      resetError: model.assign({
        errorMessage: '',
      }),

      loadKeyPair: assign({
        publicKey: (_, event) => event.response?.publicKey,
        privateKey: (context, event) =>
          event.response?.privateKey
            ? event.response.privateKey
            : context.privateKey,
      }),
      getKeyPairFromStore: send(StoreEvents.GET(Issuers_Key_Ref), {
        to: context => context.serviceRefs.store,
      }),
      sendBackupEvent: send(BackupEvents.DATA_BACKUP(true), {
        to: context => context.serviceRefs.backup,
      }),
      storeKeyPair: send(
        context => {
          return StoreEvents.SET(Issuers_Key_Ref, {
            publicKey: context.publicKey,
            privateKey: context.privateKey,
          });
        },
        {
          to: context => context.serviceRefs.store,
        },
      ),
      storeVerifiableCredentialMeta: send(
        context =>
          StoreEvents.PREPEND(MY_VCS_STORE_KEY, getVCMetadata(context)),
        {
          to: context => context.serviceRefs.store,
        },
      ),

      setMetadataInCredentialData: (context, event) => {
        const updatedCredentialWrapper = updateVCmetadataOfCredentialWrapper(
          context,
          context.credentialWrapper,
        );
        return updatedCredentialWrapper;
      },

      setVCMetadata: assign({
        vcMetadata: (context, event) => {
          const metadata = getVCMetadata(context);
          return metadata;
        },
      }),

      storeVerifiableCredentialData: send(
        context =>
          StoreEvents.SET(getVCMetadata(context).getVcKey(), {
            ...context.credentialWrapper,
            vcMetadata: getVCMetadata(context),
          }),
        {
          to: context => context.serviceRefs.store,
        },
      ),

      storeVcMetaContext: send(
        context => {
          return {
            type: 'VC_ADDED',
            vcMetadata: getVCMetadata(context),
          };
        },
        {
          to: context => context.serviceRefs.vc,
        },
      ),

      storeVcsContext: send(
        context => {
          return {
            type: 'VC_DOWNLOADED',
            vcMetadata: getVCMetadata(context),
            vc: context.credentialWrapper,
          };
        },
        {
          to: context => context.serviceRefs.vc,
        },
      ),

      setSelectedIssuers: model.assign({
        selectedIssuer: (_, event) => event.data,
      }),
      setSelectedIssuerId: model.assign({
        selectedIssuerId: (_, event) => event.id,
      }),
      setTokenResponse: model.assign({
        tokenResponse: (_, event) => event.data,
      }),
      setVerifiableCredential: model.assign({
        verifiableCredential: (_, event) => {
          return event.data.verifiableCredential;
        },
      }),
      setCredentialWrapper: model.assign({
        credentialWrapper: (_, event) => {
          return event.data;
        },
      }),
      setPublicKey: assign({
        publicKey: (_, event) => {
          if (!isHardwareKeystoreExists) {
            return (event.data as KeyPair).public;
          }
          return event.data as string;
        },
      }),

      setPrivateKey: assign({
        privateKey: (_, event) => (event.data as KeyPair).private,
      }),

      logDownloaded: send(
        context => {
          return ActivityLogEvents.LOG_ACTIVITY({
            _vcKey: getVCMetadata(context).getVcKey(),
            type: 'VC_DOWNLOADED',
            id: getVCMetadata(context).id,
            idType: getIdType(getVCMetadata(context).issuer),
            timestamp: Date.now(),
            deviceName: '',
            vcLabel: getVCMetadata(context).id,
          });
        },
        {
          to: context => context.serviceRefs.activityLog,
        },
      ),
      sendSuccessEndEvent: () => {
        sendEndEvent(
          getEndEventData(
            TelemetryConstants.FlowType.vcDownload,
            TelemetryConstants.EndEventStatus.success,
          ),
        );
      },

      sendErrorEndEvent: () => {
        sendEndEvent(
          getEndEventData(
            TelemetryConstants.FlowType.vcDownload,
            TelemetryConstants.EndEventStatus.failure,
          ),
        );
      },
      sendImpressionEvent: () => {
        sendImpressionEvent(
          getImpressionEventData(
            TelemetryConstants.FlowType.vcDownload,
            TelemetryConstants.Screens.issuerList,
          ),
        );
      },

      updateVerificationErrorMessage: assign({
        verificationErrorMessage: (context, event) =>
          (event.data as Error).message,
      }),

      resetVerificationErrorMessage: model.assign({
        verificationErrorMessage: (_context, event) => '',
      }),
    },
    services: {
      isUserSignedAlready: () => async () => {
        return await Cloud.isSignedInAlready();
      },
      downloadIssuersList: async () => {
        return await CACHED_API.fetchIssuers();
      },
      checkInternet: async () => await NetInfo.fetch(),
      downloadIssuerConfig: async (context, _) => {
        let issuersConfig = await CACHED_API.fetchIssuerConfig(
          context.selectedIssuerId,
        );
        if (context.selectedIssuer['.well-known']) {
          await CACHED_API.fetchIssuerWellknownConfig(
            context.selectedIssuerId,
            context.selectedIssuer['.well-known'],
          );
        }
        return issuersConfig;
      },
      downloadCredential: async context => {
        const body = await getBody(context);
        const downloadTimeout = await vcDownloadTimeout();
        let credential = await request(
          'POST',
          context.selectedIssuer.credential_endpoint,
          body,
          '',
          {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + context.tokenResponse?.accessToken,
          },
          downloadTimeout,
        );
        console.info(
          `VC download via ${context.selectedIssuerId} is succesfull`,
        );
        credential = updateCredentialInformation(context, credential);
        return credential;
      },
      invokeAuthorization: async context => {
        sendImpressionEvent(
          getImpressionEventData(
            TelemetryConstants.FlowType.vcDownload,
            context.selectedIssuer.credential_issuer +
              TelemetryConstants.Screens.webViewPage,
          ),
        );
        return await authorize(
          constructAuthorizationConfiguration(context.selectedIssuer),
        );
      },
      generateKeyPair: async () => {
        if (!isHardwareKeystoreExists) {
          return await generateKeys();
        }
        const isBiometricsEnabled = SecureKeystore.hasBiometricsEnabled();
        return SecureKeystore.generateKeyPair(
          Issuers_Key_Ref,
          isBiometricsEnabled,
          0,
        );
      },
      verifyCredential: async context => {
        //this issuer specific check has to be removed once vc validation is done.
        if (
          VCMetadata.fromVcMetadataString(getVCMetadata(context)).issuer ===
          Issuers.Sunbird
        ) {
          return true;
        }
        const verificationResult = await verifyCredential(
          context.verifiableCredential?.credential,
        );
        if (!verificationResult.isVerified) {
          throw new Error(verificationResult.errorMessage);
        }
      },
    },
    guards: {
      isSignedIn: (_context, event) =>
        (event.data as isSignedInResult).isSignedIn,
      hasKeyPair: context => !!context.publicKey,
      isInternetConnected: (_, event) => !!event.data.isConnected,
      isOIDCflowCancelled: (_, event) => {
        // iOS & Android have different error strings for user cancelled flow
        const err = [
          OIDCErrors.OIDC_FLOW_CANCELLED_ANDROID,
          OIDCErrors.OIDC_FLOW_CANCELLED_IOS,
        ];
        return (
          !!event.data &&
          typeof event.data.toString === 'function' &&
          err.some(e => event.data.toString().includes(e))
        );
      },
      isOIDCConfigError: (_, event) => {
        return (
          !!event.data &&
          typeof event.data.toString === 'function' &&
          event.data.toString().includes(OIDCErrors.OIDC_CONFIG_ERROR_PREFIX)
        );
      },
      canSelectIssuerAgain: (context, _) => {
        return (
          context.errorMessage.includes(OIDCErrors.OIDC_CONFIG_ERROR_PREFIX) ||
          context.errorMessage.includes(ErrorMessage.REQUEST_TIMEDOUT)
        );
      },
      shouldFetchIssuersAgain: context => context.issuers.length === 0,
      isCustomSecureKeystore: () => isHardwareKeystoreExists,
      hasUserCancelledBiometric: (_, event) =>
        event.data instanceof BiometricCancellationError,
    },
  },
);

type State = StateFrom<typeof IssuersMachine>;

export function selectIssuers(state: State) {
  return state.context.issuers;
}

export function selectErrorMessageType(state: State) {
  const nonGenericErrors = ['', ErrorMessage.NO_INTERNET];
  return nonGenericErrors.includes(state.context.errorMessage)
    ? state.context.errorMessage
    : ErrorMessage.GENERIC;
}

export function selectLoadingReason(state: State) {
  return state.context.loadingReason;
}

export function selectIsDownloadCredentials(state: State) {
  return state.matches('downloadCredentials');
}

export function selectIsBiometricCancelled(state: State) {
  return (
    state.matches('downloadCredentials.userCancelledBiometric') ||
    state.matches('performAuthorization.userCancelledBiometric')
  );
}

export function selectIsDone(state: State) {
  return state.matches('done');
}

export function selectIsIdle(state: State) {
  return state.matches('idle');
}

export function selectStoring(state: State) {
  return state.matches('storing');
}

export function selectVerificationErrorMessage(state: State) {
  return state.context.verificationErrorMessage;
}

export interface logoType {
  url: string;
  alt_text: string;
}

export interface displayType {
  name: string;
  logo: logoType;
  language: string;
  title: string;
  description: string;
}

export interface issuerType {
  credential_issuer: string;
  protocol: string;
  client_id: string;
  '.well-known': string;
  redirect_uri: string;
  scopes_supported: [string];
  additional_headers: object;
  authorization_endpoint: string;
  authorization_alias: string;
  token_endpoint: string;
  proxy_token_endpoint: string;
  credential_endpoint: string;
  credential_type: [string];
  credential_audience: string;
  display: [displayType];
}
