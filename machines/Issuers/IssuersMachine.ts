import {EventFrom, send, sendParent} from 'xstate';
import {IssuersModel} from './IssuersModel';
import {IssuersActions} from './IssuersActions';
import {IssuersService} from './IssuersService';
import {IssuersGuards} from './IssuersGuards';
import {CredentialTypes} from '../VerifiableCredential/VCMetaMachine/vc';

const model = IssuersModel;

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
    tsTypes: {} as import('./IssuersMachine.typegen').Typegen0,
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
              description:
                'error is OIDC_CONFIG_ERROR_PREFIX or REQUEST_TIMEDOUT',
              cond: 'canSelectIssuerAgain',
              actions: 'resetError',
              target: 'selectingIssuer',
            },
            {
              description:
                'issuers config is available and downloading credentials is retriable',
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
            target: 'downloadCredentialTypes',
          },
          onError: {
            actions: ['setError', 'resetLoadingReason'],
            target: 'error',
          },
        },
      },
      downloadCredentialTypes: {
        description:
          'downloads the credentials supported from the selected issuer',
        invoke: {
          src: 'downloadCredentialTypes',
          onDone: [
            {
              actions: 'setSupportedCredentialTypes',
              target: 'selectingCredentialType',
            },
            {
              target: 'checkInternet',
            },
          ],
          onError: {
            actions: ['setError', 'resetLoadingReason'],
            target: 'error',
          },
        },
      },
      selectingCredentialType: {
        on: {
          CANCEL: {
            target: 'displayIssuers',
          },
          SELECTED_CREDENTIAL_TYPE: {
            actions: 'setSelectedCredentialType',
            target: 'checkInternet',
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
              actions: [
                'resetSelectedCredentialType',
                'resetError',
                'resetLoadingReason',
              ],
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
              cond: 'isGenericError',
              target: 'selectingIssuer',
              actions: [
                'resetSelectedCredentialType',
                'setError',
                'resetLoadingReason',
                'sendDownloadingFailedToVcMeta',
              ],
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
            actions: 'resetSelectedCredentialType',
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
              actions: ['sendSuccessEndEvent', 'setIsVerified'],
              target: 'storing',
            },
          ],
          onError: [
            {
              cond: 'isVerificationPendingBecauseOfNetworkIssue',
              actions: ['resetLoadingReason', 'resetIsVerified'],
              target: 'storing',
            },
            {
              actions: [
                'resetLoadingReason',
                'sendErrorEndEvent',
                'updateVerificationErrorMessage',
              ],
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
    actions: IssuersActions(model),
    services: IssuersService(),
    guards: IssuersGuards(),
  },
);

export interface logoType {
  url: string;
  alt_text: string;
}

export interface displayType {
  name: string;
  locale: string;
  language: string;
  logo: logoType;
  background_color: string;
  background_image: string;
  text_color: string;
  title: string;
  description: string;
}

export interface issuerType {
  credential_issuer: string;
  protocol: string;
  client_id: string;
  '.well-known': string;
  redirect_uri: string;
  additional_headers: object;
  authorization_endpoint: string;
  token_endpoint: string;
  proxy_token_endpoint: string;
  credential_endpoint: string;
  credential_audience: string;
  display: [displayType];
  credentialTypes: [CredentialTypes];
}
