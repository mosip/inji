import { assign, ErrorPlatformEvent, EventFrom, send, StateFrom } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { VC_ITEM_STORE_KEY } from '../shared/constants';
import { AppServices } from '../shared/GlobalContext';
import { CredentialDownloadResponse, request } from '../shared/request';
import {
  VC,
  VerifiableCredential,
  VcIdType,
  DecodedCredential,
} from '../types/vc';
import { StoreEvents } from './store';
import { ActivityLogEvents } from './activityLog';
import { verifyCredential } from '../shared/verifyCredential';

const model = createModel(
  {
    serviceRefs: {} as AppServices,
    id: '',
    idType: '' as VcIdType,
    tag: '',
    generatedOn: null as Date,
    credential: null as DecodedCredential,
    verifiableCredential: null as VerifiableCredential,
    requestId: '',
    isVerified: false,
    lastVerifiedOn: null,
    locked: false,
    otp: '',
    otpError: '',
    idError: '',
    transactionId: '',
  },
  {
    events: {
      EDIT_TAG: () => ({}),
      SAVE_TAG: (tag: string) => ({ tag }),
      STORE_READY: () => ({}),
      DISMISS: () => ({}),
      CREDENTIAL_DOWNLOADED: (vc: VC) => ({ vc }),
      STORE_RESPONSE: (response: VC) => ({ response }),
      POLL: () => ({}),
      DOWNLOAD_READY: () => ({}),
      GET_VC_RESPONSE: (vc: VC) => ({ vc }),
      VERIFY: () => ({}),
      LOCK_VC: () => ({}),
      UNLOCK_VC: () => ({}),
      INPUT_OTP: (otp: string) => ({ otp }),
      REFRESH: () => ({}),
    },
  }
);

export const VcItemEvents = model.events;

export const vcItemMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDcDGBaAlgFzAWwDpUALMVAa0wDsoA1VAYgHEBRAFQH1aBhDgJRYBlAAoB5AHKCWiUAAcA9rByZ5VGSAAeiAIwAWAAwFtANgAcAdl0BmAJwAmOxd0BWADQgAnoivHDpx6aBzubGwc6mAL4R7mhYuIQkZJQ0gtjyAE5gDIJsogL8QmKS0kggCkrYKmqlWgh6hiYWDnba4aFW7l4I5qbOBPohvdoW2jbDUTEYOPhEpBTUUIJg6cjLACIAhtgbs0kLqVsArrAMYgAyZ+rlyqrqtdrm2gRWds521vqmusZ2Nr2dOlGugIAXMb1+dn0NnCExAsWmCTmyUWy1W6U22128xS22wxwYa1EAHVxGdRABBNYFSkATSuihu1VAtQMfSsPlCumhVlGjwBdSsumBdh5Vmc1jGznszlh8PiWORSxW6y2Owg8gA7lQADbyDYQBbcTIQMBUSobbWnUQXekVKp3RA-YWtcz6YzQ4y6OzGfnaIEgwJghz2KEw6JwqbyxLYlHK9GqgjqrW6-WG42m82W7gCNYscRsACS5LOHEJJLJlJYa1tjIdCF0pmMz3Mrucgu+7R9nkQjb6Fh87Z5LcCssjM0wEG1WSrBc4bHJTBrlVuNR0bqeNk9A2Mrv0+mc4X5f3MBF0PRFPP8-kso7i48nWVoLD4BYAYnTStdl0zND3nA0rEbUx930OwQlCflTEAggbHMDkwKdfRtFvBECAnKcGDJbgAGkuG4Jd7VXOo2z6T5fDMHwbCQnpIOg2CfCgkJBjFFD5XQrIAFVSVEHC8IIldmR0axTCMYxRhsXRhmsd47H5QZ+mGHdQNGYxKNYmZIGUGg2A2KACQLQQAFkDMEfif3uYYT09XxGx6dk91k7sEGPU9z1CJD-HZKx1MITTKm03TsnJJ8OHnRdPwZb86z9VpTyosZ3TMAxHK6P1HiML1Xi9YwxIGSJwzlGZYDSdIFh0vScjyFgChECQpDM6LXjsAhTAk-RALguCrHMX1tBFAhLGGXoWj+drdB8gg0UwAAzDw00gDNMAtBh1SoMA0KoZB5HIdbCsIKbZvmk0zSW7UEGoLbUC2KoAG19AAXQaojtH0AwCClcxXihb0TAPfkXEMJDhl5d0eiFcaCrHfblhmuaaCNBaTuW5Z0gyAhZG1LZpoyfaocmmHDvh9MkbOi75Cu787seiK7QE39nNeFrnE9GxAJcSFvX5H5mvsb4+u0WxgNeibo2RWgCcwCmqgOPETiewS6hep4rDdaFglAz6eqc14myvQJ+YGfd2Qmi6LQnBgC3EYQOM4UQ2GEeX6chT1m0eA9wZVqDev-GDKJ3ST3SFfLJjvQhTe1c21gM4zBFMmna2el4bHe0xWm+F5PUA-k2yeAw7Mk8UWnMGwJsyABHQ44H8qBRGwWQVtUdayZ2ya8fLyvioWWvZHOzbyeu1Qqcd+5U6sfoHBykwQjeLWukSmCzxFODHHeCxS7ACuq67uuGBRtGMaxnHW9Dgh263mhu97y6B6oIf46i57U+BN5AlU75nF+3Rs-sAgxLBFWJKWFgnYCaGxUCoDALIau3cCxUFkIcbAFsrY2w4HbB299CIKweFyd6YEP6OHBO1NwTlYLJ3sIKewrR-zeUhifMBECoHb1kLA+BiCo5GRMsPHQ-5gQ-DFLYewcF7CmCPC0OKvwfBSihE4dem9O40DOOTcgDc1obS2i3Pap8N4d2rooigV9+6UwelwuowFk6NmsnuaEF4RFOT6rBd61gXo9FbIKWROiFh6OUXvdI6NMbYGxukXGJ8z7yKgF4gxUtB7GIwXTEeVEBrkNZAhbqX8SHFxgiKQuUppQPAmrqGM9Bsi5HyAIWqxQTGtG6kYcIfUWyhEcNCXqm4akSR+i2cUxtYRUHkCaeApRNGiwWPQExZhf6pIkl6GwYwvQdDsS2Iwe4hQ9GmQYawEMQ6oSGTiDIYATHQhBE6KigQeSTLmXPAY-RTk2WkcBYwIskT7FRCqTE2zFi4mOPsp4jwvjehcMzVSwxfQ8maiKAW0zegDA-sHCMJ83lKjRBiNUmodR6gNETRGmYTHhBEueAWrpPrBDSalFWhgwUclCEAv4Dy9gpGefGbYoyTw-Oyv8nKl5fRujHqCCiIQXAbNhahdilSHgbgPBRdODhLByUCDBOCOV9xfAlDCzRfkyq6UqVCYEm4pSOE+i0P0nLZWeRaDuRwKtzATWKhkdVUBKmQj6KpMwPQYoCy7KlX4hg2xeihMXWCXwZS0NQgdOGUAEbHSxbE8yiB6m-yJb0A8eq2z-Ryu9P0UF8VQh8CAoNUZHk0HFqVaaksb4y0+VGusHxnh6Fqf4RwZriWOndBlFsfUuR-H8CXXN45NpmwgAQeQdcTHOyeE-HoqlFWCmzn1X+fxWh7lTmJIUJte0R37QAIzATtKgEBh1G3epuV6rNMrEK6G0IwDwSLemAi9Ltmy2KronHu34B7fBckFA4U9iAJSztToEKC-DPjuPPjXIdFbnrfDIX8cUDZ-xukbN-ZqXpvgB03MMFooDwGQOgXXFhCDKnFyeJ6cCjw-SvTdHJaZ704NUR+DuJ1wGwleIIwk34TExRu0sF+xW0FrCg1ePwrJ+SlHDNQJUmeLVbCAU+LYAwoxfQEP6E4z4WVPpfB8iY6wA0pJ-PFYC2xc8TwvVen89c3wwRRCiEAA */
  model.createMachine(
    {
      tsTypes: {} as import('./vcItem.typegen').Typegen0,
      schema: {
        context: model.initialContext,
        events: {} as EventFrom<typeof model>,
      },
      on: {
        REFRESH: {
          target: '.checkingStore',
        },
      },
      description: 'VC',
      id: 'vc-item',
      initial: 'checkingVc',
      states: {
        checkingVc: {
          entry: 'requestVcContext',
          description:
            'Check if the VC data is in VC list already (in memory).',
          on: {
            GET_VC_RESPONSE: [
              {
                actions: 'setCredential',
                cond: 'hasCredential',
                target: 'checkingVerificationStatus',
              },
              {
                target: 'checkingStore',
              },
            ],
          },
        },
        checkingStore: {
          entry: 'requestStoredContext',
          description: 'Check if VC data is in secured local storage.',
          on: {
            STORE_RESPONSE: [
              {
                actions: ['setCredential', 'updateVc'],
                cond: 'hasCredential',
                target: 'checkingVerificationStatus',
              },
              {
                target: 'checkingServerData',
              },
            ],
          },
        },
        checkingServerData: {
          description:
            "Download VC data from the server. Uses polling method to check when it's available.",
          initial: 'checkingStatus',
          states: {
            checkingStatus: {
              invoke: {
                src: 'checkStatus',
                id: 'checkStatus',
              },
              on: {
                POLL: {
                  actions: send('POLL_STATUS', { to: 'checkStatus' }),
                },
                DOWNLOAD_READY: {
                  target: 'downloadingCredential',
                },
              },
            },
            downloadingCredential: {
              invoke: {
                src: 'downloadCredential',
                id: 'downloadCredential',
              },
              on: {
                POLL: {
                  actions: send('POLL_DOWNLOAD', { to: 'downloadCredential' }),
                },
                CREDENTIAL_DOWNLOADED: {
                  actions: [
                    'setCredential',
                    'storeContext',
                    'updateVc',
                    'logDownloaded',
                  ],
                  target: '#vc-item.checkingVerificationStatus',
                },
              },
            },
          },
        },
        idle: {
          entry: ['clearTransactionId', 'clearOtp'],
          on: {
            EDIT_TAG: {
              target: 'editingTag',
            },
            VERIFY: {
              target: 'verifyingCredential',
            },
            LOCK_VC: {
              target: 'requestingOtp',
            },
            UNLOCK_VC: {
              target: 'requestingOtp',
            },
          },
        },
        editingTag: {
          on: {
            DISMISS: {
              target: 'idle',
            },
            SAVE_TAG: {
              actions: 'setTag',
              target: 'storingTag',
            },
          },
        },
        storingTag: {
          entry: 'storeTag',
          on: {
            STORE_RESPONSE: {
              actions: 'updateVc',
              target: 'idle',
            },
          },
        },
        verifyingCredential: {
          invoke: {
            src: 'verifyCredential',
            onDone: [
              {
                actions: ['markVcValid', 'storeContext', 'updateVc'],
                target: 'idle',
              },
            ],
            onError: [
              {
                actions: 'logError',
                target: 'idle',
              },
            ],
          },
        },
        checkingVerificationStatus: {
          description:
            'Check if VC verification is still valid. VCs stored on the device must be re-checked once every [N] time has passed.',
          always: [
            {
              cond: 'isVcValid',
              target: 'idle',
            },
            {
              target: 'verifyingCredential',
            },
          ],
        },
        invalid: {
          states: {
            otp: {},
            backend: {},
          },
          on: {
            INPUT_OTP: {
              actions: 'setOtp',
              target: 'requestingLock',
            },
            DISMISS: {
              target: 'idle',
            },
          },
        },
        requestingOtp: {
          entry: 'setTransactionId',
          invoke: {
            src: 'requestOtp',
            onDone: [
              {
                target: 'acceptingOtpInput',
              },
            ],
            onError: [
              {
                target: '#vc-item.invalid.backend',
              },
            ],
          },
        },
        acceptingOtpInput: {
          entry: 'clearOtp',
          on: {
            INPUT_OTP: {
              actions: 'setOtp',
              target: 'requestingLock',
            },
            DISMISS: {
              actions: ['clearOtp', 'clearTransactionId'],
              target: 'idle',
            },
          },
        },
        requestingLock: {
          invoke: {
            src: 'requestLock',
            onDone: [
              {
                actions: 'setLock',
                target: 'lockingVc',
              },
            ],
            onError: [
              {
                actions: 'setOtpError',
                target: 'acceptingOtpInput',
              },
            ],
          },
        },
        lockingVc: {
          entry: 'storeLock',
          on: {
            STORE_RESPONSE: {
              target: 'idle',
            },
          },
        },
      },
    },
    {
      actions: {
        updateVc: send(
          (context) => {
            const { serviceRefs, ...vc } = context;
            return { type: 'VC_DOWNLOADED', vc };
          },
          { to: (context) => context.serviceRefs.vc }
        ),

        requestVcContext: send(
          (context) => ({
            type: 'GET_VC_ITEM',
            vcKey: VC_ITEM_STORE_KEY(context),
          }),
          {
            to: (context) => context.serviceRefs.vc,
          }
        ),

        requestStoredContext: send(
          (context) => StoreEvents.GET(VC_ITEM_STORE_KEY(context)),
          {
            to: (context) => context.serviceRefs.store,
          }
        ),

        storeContext: send(
          (context) => {
            const { serviceRefs, ...data } = context;
            return StoreEvents.SET(VC_ITEM_STORE_KEY(context), data);
          },
          {
            to: (context) => context.serviceRefs.store,
          }
        ),

        setTag: model.assign({
          tag: (_, event) => event.tag,
        }),

        storeTag: send(
          (context) => {
            const { serviceRefs, ...data } = context;
            return StoreEvents.SET(VC_ITEM_STORE_KEY(context), data);
          },
          { to: (context) => context.serviceRefs.store }
        ),

        setCredential: model.assign((_, event) => {
          switch (event.type) {
            case 'STORE_RESPONSE':
              return event.response;
            case 'GET_VC_RESPONSE':
            case 'CREDENTIAL_DOWNLOADED':
              return event.vc;
          }
        }),

        logDownloaded: send(
          (_, event) =>
            ActivityLogEvents.LOG_ACTIVITY({
              _vcKey: VC_ITEM_STORE_KEY(event.vc),
              action: 'downloaded',
              timestamp: Date.now(),
              deviceName: '',
              vcLabel: event.vc.tag || event.vc.id,
            }),
          {
            to: (context) => context.serviceRefs.activityLog,
          }
        ),

        markVcValid: assign((context) => {
          return {
            ...context,
            isVerified: true,
            lastVerifiedOn: Date.now(),
          };
        }),

        setTransactionId: assign({
          transactionId: () => String(new Date().valueOf()).substring(3, 13),
        }),

        clearTransactionId: assign({ transactionId: '' }),

        setOtp: model.assign({
          otp: (_, event) => event.otp,
        }),

        setOtpError: assign({
          otpError: (_context, event) =>
            (event as ErrorPlatformEvent).data.message,
        }),

        clearOtp: assign({ otp: '' }),

        setLock: assign({
          locked: (context) => !context.locked,
        }),

        storeLock: send(
          (context) => {
            const { serviceRefs, ...data } = context;
            return StoreEvents.SET(VC_ITEM_STORE_KEY(context), data);
          },
          { to: (context) => context.serviceRefs.store }
        ),
      },

      services: {
        checkStatus: (context) => (callback, onReceive) => {
          const pollInterval = setInterval(
            () => callback(model.events.POLL()),
            5000
          );

          onReceive(async (event) => {
            if (event.type === 'POLL_STATUS') {
              const response = await request(
                'GET',
                `/credentialshare/request/status/${context.requestId}`
              );
              switch (response.response?.statusCode) {
                case 'NEW':
                  break;
                case 'ISSUED':
                case 'printing':
                  callback(model.events.DOWNLOAD_READY());
                  break;
              }
            }
          });

          return () => clearInterval(pollInterval);
        },

        downloadCredential: (context) => (callback, onReceive) => {
          const pollInterval = setInterval(
            () => callback(model.events.POLL()),
            5000
          );

          onReceive(async (event) => {
            if (event.type === 'POLL_DOWNLOAD') {
              const response: CredentialDownloadResponse = await request(
                'POST',
                '/credentialshare/download',
                {
                  individualId: context.id,
                  requestId: context.requestId,
                }
              );

              callback(
                model.events.CREDENTIAL_DOWNLOADED({
                  credential: response.credential,
                  verifiableCredential: response.verifiableCredential,
                  generatedOn: new Date(),
                  id: context.id,
                  idType: context.idType,
                  tag: '',
                  requestId: context.requestId,
                  isVerified: false,
                  lastVerifiedOn: null,
                  locked: context.locked,
                })
              );
            }
          });

          return () => clearInterval(pollInterval);
        },

        verifyCredential: async (context) => {
          return verifyCredential(context.verifiableCredential);
        },

        requestOtp: async (context) => {
          try {
            return request('POST', '/req/otp', {
              individualId: context.id,
              individualIdType: context.idType,
              otpChannel: ['EMAIL', 'PHONE'],
              transactionID: context.transactionId,
            });
          } catch (error) {
            console.error(error);
          }
        },

        requestLock: async (context) => {
          let response = null;
          if (context.locked) {
            response = await request('POST', '/req/auth/unlock', {
              individualId: context.id,
              individualIdType: context.idType,
              otp: context.otp,
              transactionID: context.transactionId,
              authType: ['bio'],
              unlockForSeconds: '120',
            });
          } else {
            response = await request('POST', '/req/auth/lock', {
              individualId: context.id,
              individualIdType: context.idType,
              otp: context.otp,
              transactionID: context.transactionId,
              authType: ['bio'],
            });
          }
          return response.response;
        },
      },

      guards: {
        hasCredential: (_, event) => {
          const vc =
            event.type === 'GET_VC_RESPONSE' ? event.vc : event.response;

          return vc?.credential != null && vc?.verifiableCredential != null;
        },

        isVcValid: (context) => {
          return context.isVerified;
        },
      },
    }
  );

export const createVcItemMachine = (
  serviceRefs: AppServices,
  vcKey: string
) => {
  const [, idType, id, requestId] = vcKey.split(':');
  return vcItemMachine.withContext({
    ...vcItemMachine.context,
    serviceRefs,
    id,
    idType: idType as VcIdType,
    requestId,
  });
};

type State = StateFrom<typeof vcItemMachine>;

export function selectVc(state: State) {
  const { serviceRefs, ...data } = state.context;
  return data;
}

export function selectGeneratedOn(state: State) {
  return new Date(state.context.generatedOn).toLocaleDateString();
}

export function selectId(state: State) {
  return state.context.id;
}

export function selectIdType(state: State) {
  return state.context.idType;
}

export function selectTag(state: State) {
  return state.context.tag;
}

export function selectCredential(state: State) {
  return state.context.credential;
}

export function selectVerifiableCredential(state: State) {
  return state.context;
}

export function selectIsEditingTag(state: State) {
  return state.matches('editingTag');
}

export function selectIsOtpError(state: State) {
  return state.context.otpError;
}

export function selectOtpError(state: State) {
  return state.context.otpError;
}

export function selectIsLockingVc(state: State) {
  return state.matches('lockingVc');
}

export function selectIsAcceptingOtpInput(state: State) {
  return state.matches('acceptingOtpInput');
}

export function selectIsRequestingOtp(state: State) {
  return state.matches('requestingOtp');
}
