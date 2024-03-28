import {TextInput} from 'react-native';
import {
  assign,
  DoneInvokeEvent,
  ErrorPlatformEvent,
  EventFrom,
  sendParent,
  StateFrom,
} from 'xstate';
import {createModel} from 'xstate/lib/model';
import {BackendResponseError, request} from '../../../shared/request';
import {VcIdType} from '../../../types/VC/vc';
import i18n from '../../../i18n';
import {VCMetadata} from '../../../shared/VCMetadata';
import {
  getErrorEventData,
  getInteractEventData,
  sendErrorEvent,
  sendInteractEvent,
} from '../../../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../../../shared/telemetry/TelemetryConstants';

import {API_URLS} from '../../../shared/api';
import {IndividualId} from '../../../shared/constants';

const model = createModel(
  {
    idInputRef: null as TextInput,
    id: '',
    idType: 'UIN' as VcIdType,
    idError: '',
    otp: '',
    otpError: '',
    transactionId: '',
    requestId: '',
    phoneNumber: '' as string,
    email: '' as string,
    isPinned: false,
  },
  {
    events: {
      SET_INDIVIDUAL_ID: (individualId: IndividualId) => ({
        id: individualId.id,
        idType: individualId.idType,
      }),
      INPUT_ID: (id: string) => ({id}),
      INPUT_OTP: (otp: string) => ({otp}),
      RESEND_OTP: () => ({}),
      VALIDATE_INPUT: () => ({}),
      READY: (idInputRef: TextInput) => ({idInputRef}),
      DISMISS: () => ({}),
      CANCEL: () => ({}),
      WAIT: () => ({}),
      SELECT_ID_TYPE: (idType: VcIdType) => ({idType}),
    },
  },
);

export const AddVcModalEvents = model.events;

export const AddVcModalMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEEIQGoGMCyB7CAhgDYB0BmmYADgC4CWAdlAJITMNUCuNJATmAwhhejKAGIASgFFkAEQCaiUFVyw69XAyUgAHogC0ARgAsATgDMJAEynjhgBzmArE-v2AbDYA0IAJ4GrAHZ3EkCnKxMrc0NDc1NA+ycAXySfVAwcfGIyCmp6JlZ2Lh4AM1xMTjUmMR1YGgIaMDISxt4ACkMABk6ASjF0rDxCUnJKWlFCjm4SMoqqqG0VNQ0tJF0DWM6QwOjXQydjYyDbH38EIycQ+M6PI6t7TsNTdxS0tEGskdzxgrYpnjoECIYDEzAAcgAFACqABUAPrMWSLVTqOiabR6c4mYLWdzmTr4wIxMwJU6IKxWYwkeyGdxOQKmWnOUxWS6vEADTLDHJjfIsP7FEiA4FidDIAAyiOQMKkCMhsORyzRq1AmKMrKc1np5kCQUCDJ29jJCCCmvx9hs5nspmeOqc5nZnKG2VGeQmAumwpBAGUpOKpABheGIuEw+QQqSK1HotZq-adKwkTqHJ5RUydFmdQLGoz4kjGQI3ImFws0ymO95cl3fPmTQWMABuxEBoPlwaRayW0ZV6yxBO2BKcWYL9s69Jz8WsVtpHhcVjH5gdqQ5ledX157qKnoYTaILbFktk0tl4OhMKjKwxBmMi5I+xZ2IziWTxoiVLHjjxOvMN4J9grGRrjybq-FuAI7s2EBiL6-pBgisihuGkadiil6xhsY6dCQjJOM8rijou7jGu4pjYdaurWsmjgJKYAEfNyro-PyYF8GAACOnBwHyADyNBUGIECaE0ja4AA1k0TqfMBTF1tM-AcVxoi8VQCAiZgDTKgA2p0AC6F7KlefZuPmiRDmOjJZuYxpdLEd4OB47hEoSP50VW64gcx-ysQpdRKXxYjCLwuC8CQVBEA0ZS8AAtiQkkMTWm5efJnG+UwymqTu5QaZo2l6ShSoxqqBjxPYdlbIYQTuMmsSGMaZghE4DjdA8-aOS8y5xdWG6gf8YiyMw3rYAN3r6YVvb6MY7hUlNOoxOYniEVZfiIG4hgkPN6ZdOEhxVe1byAVJjE8XxYGtmecLcTCEKjT2cZxKRlKuDqwSeAkRHLQgMQmEmFpHLhTzXP+HWrodCVpSdvX9YNw03YZRhVYmQ7pvSQSHAWxr2AWd5WrhHhhIuzyuUByWKUwAb8EIDD0MQAlCUKmXibFIPciTqVQOTkACNTRAZQ2WUrLlsPoVi+yBPmURWu4mNRGETjWWmoSGAkXTGPaLLGED+30dkrN8hzlPcwFvBBSFYURcFMWdaQuuiPrXN0MQvP81pulC0VWKq5YngZkEWyDkr1k6iE1o6hY5hWI56aBCky4MPgcDaFb0m1h6PD8IIwiiG7420gyJBTSyhZPDsGvGDmEeWGEERfrYVpbEToPdZ5gqzJUWf5d2cM1YmhYEqYlwuBadLl3ioThEycQ3g8e0rgd8VN7JAJAmA2dxjeVIS7hFi9yYpjGkSZHxJVxg3OHhgN-PHmL-Tu6AiQYBRbQZzKKhBnC-oOxi-YuqePaqt90tM4DhEwfmnJHWkyYL5dSvqnG+kEZgWwaKvAwwREb2jcESRqphMZGg+j+MW5p7jf3pASaIUD3IyVgY2eBAAjcg4lBDIPOCRNaC4HKXC2LhQBiAkYkEag8EwBYg5kOBnPaBlCWLUL3BAJhH8PB8PQd-fYTwcF1RCKA4I1U2oJHIcnRKgobbgyoLImIWZqTOA1lgnUDliI6mwiyRy5FkxxBnknI6+juAmMLF7Mwvti4-kxjmG82xx5Dh2N0E+59RHawocdKgYETFfj4XSCOhxJ5WlwWcbBa0YiUVsDSKaDhdGGPZhTe2xATGTRCAWIk9xSH2mzB9CqQRrBK0cI4PurJjC6MEgwFeHc0Lu30G4RMStLjfxvAybojSgGsh7m02kDh+5PGSNEtyXiWkFz8fEAJZcPr6F4VXEw04CwRyBikIAA */
  model.createMachine(
    {
      predictableActionArguments: true,
      preserveActionOrder: true,
      tsTypes: {} as import('./AddVcModalMachine.typegen').Typegen0,
      schema: {
        context: model.initialContext,
        events: {} as EventFrom<typeof model>,
      },
      id: 'AddVcModal',
      initial: 'acceptingIdInput',
      on: {
        SET_INDIVIDUAL_ID: {
          actions: ['clearIdError', 'clearId', 'setIdType', 'setId'],
          target: '#AddVcModal.acceptingIdInput.idle',
        },
      },
      states: {
        acceptingIdInput: {
          entry: ['setTransactionId', 'clearOtp'],
          initial: 'rendering',
          states: {
            rendering: {
              on: {
                READY: {
                  actions: 'setIdInputRef',
                  target: 'focusing',
                },
              },
            },
            focusing: {
              after: {
                '100': {
                  description:
                    'Small delay to properly show the keyboard when focusing input.',
                  target: 'idle',
                },
              },
            },
            idle: {
              entry: 'focusInput',
              on: {
                SET_INDIVIDUAL_ID: {
                  actions: ['clearIdError', 'clearId', 'setIdType', 'setId'],
                },
                INPUT_ID: {
                  actions: 'setId',
                },
                VALIDATE_INPUT: [
                  {
                    cond: 'isEmptyId',
                    target: '#AddVcModal.acceptingIdInput.invalid.empty',
                  },
                  {
                    cond: 'isWrongIdFormat',
                    target: '#AddVcModal.acceptingIdInput.invalid.format',
                  },
                  {
                    actions: 'clearIdError',
                    target: 'requestingOtp',
                  },
                ],
                SELECT_ID_TYPE: {
                  actions: ['clearIdError', 'setIdType', 'clearId'],
                },
              },
            },
            invalid: {
              entry: 'focusInput',
              states: {
                empty: {
                  entry: 'setIdErrorEmpty',
                },
                format: {
                  entry: 'setIdErrorWrongFormat',
                },
                backend: {},
              },
              on: {
                INPUT_ID: {
                  actions: ['setId', 'clearIdError'],
                  target: 'idle',
                },
                VALIDATE_INPUT: [
                  {
                    cond: 'isEmptyId',
                    target: '.empty',
                  },
                  {
                    cond: 'isWrongIdFormat',
                    target: '.format',
                  },
                  {
                    actions: 'clearIdError',
                    target: 'requestingOtp',
                  },
                ],
                SELECT_ID_TYPE: {
                  actions: ['clearIdError', 'setIdType', 'clearId'],
                  target: 'idle',
                },
              },
            },
            requestingOtp: {
              invoke: {
                src: 'requestOtp',
                onDone: [
                  {
                    target: '#AddVcModal.acceptingOtpInput',
                    actions: ['setPhoneNumber', 'setEmail'],
                  },
                ],
                onError: [
                  {
                    actions: 'setIdBackendError',
                    target: '#AddVcModal.acceptingIdInput.invalid.backend',
                  },
                ],
              },
            },
          },
          on: {
            DISMISS: {
              actions: 'forwardToParent',
            },
          },
        },
        acceptingOtpInput: {
          entry: 'clearOtp',
          on: {
            INPUT_OTP: {
              actions: 'setOtp',
              target: 'requestingCredential',
            },
            DISMISS: {
              target: 'cancelDownload',
            },
            RESEND_OTP: {
              target: '.resendOTP',
            },
          },
          initial: 'idle',
          states: {
            idle: {},
            resendOTP: {
              invoke: {
                src: 'requestOtp',
                onDone: [
                  {
                    target: 'idle',
                    actions: ['setPhoneNumber', 'setEmail'],
                  },
                ],
                onError: [
                  {
                    actions: 'setIdBackendError',
                    target: '#AddVcModal.acceptingIdInput.invalid.backend',
                  },
                ],
              },
            },
          },
        },
        cancelDownload: {
          on: {
            CANCEL: {
              actions: ['clearId', 'resetIdInputRef', 'forwardToParent'],
            },
            WAIT: {
              target: 'acceptingOtpInput',
            },
          },
        },
        requestingCredential: {
          invoke: {
            src: 'requestCredential',
            onDone: [
              {
                actions: 'setRequestId',
                target: 'done',
              },
            ],
            onError: [
              {
                actions: 'setIdBackendError',
                cond: 'isIdInvalid',
                target: '#AddVcModal.acceptingIdInput.invalid.backend',
              },
              {
                actions: 'setOtpError',
                target: 'acceptingOtpInput',
              },
            ],
          },
        },
        done: {
          type: 'final',
          data: context => new VCMetadata(context),
        },
      },
    },
    {
      actions: {
        forwardToParent: sendParent('DISMISS'),

        setId: model.assign({
          id: (_context, event) => event.id,
        }),

        setIdType: model.assign({
          idType: (_context, event) => event.idType,
        }),

        setOtp: model.assign({
          otp: (_context, event) => event.otp,
        }),

        setTransactionId: assign({
          transactionId: () => String(new Date().valueOf()).substring(3, 13),
        }),

        setRequestId: assign({
          requestId: (_context, event) =>
            (event as DoneInvokeEvent<string>).data,
        }),

        setPhoneNumber: assign({
          phoneNumber: (_context, event) => event.data.response.maskedMobile,
        }),

        setEmail: model.assign({
          email: (_context, event) => event.data.response.maskedEmail,
        }),

        setIdBackendError: assign({
          idError: (context, event) => {
            const message = (event as ErrorPlatformEvent).data.message;
            const ID_ERRORS_MAP = {
              'UIN invalid': 'invalidUin',
              'VID invalid': 'invalidVid',
              'UIN not available in database': 'missingUin',
              'VID not available in database': 'missingVid',
              'No message available': 'noMessageAvailable',
              'while generating otp error is occured':
                'whileGeneratingOtpErrorIsOccured',
              'Network request failed': 'networkRequestFailed',
              'Invalid Input Parameter - individualId':
                context.idType === 'UIN' ? 'invalidUin' : 'invalidVid',
              'VID is expired/deactivated': 'deactivatedVid',
            };
            const backendError = ID_ERRORS_MAP[message]
              ? i18n.t(`errors.backend.${ID_ERRORS_MAP[message]}`, {
                  ns: 'AddVcModal',
                })
              : i18n.t(`errors.genericError`, {
                  ns: 'common',
                });
            sendErrorEvent(
              getErrorEventData(
                TelemetryConstants.FlowType.vcDownload,
                message,
                backendError,
              ),
            );
            return backendError;
          },
        }),

        clearId: model.assign({id: ''}),

        clearIdError: model.assign({idError: ''}),

        setIdErrorEmpty: model.assign({
          idError: () => i18n.t('errors.input.empty', {ns: 'AddVcModal'}),
        }),

        setIdErrorWrongFormat: model.assign({
          idError: context =>
            i18n.t('AddVcModal:errors.input.invalidFormat', {
              idType: context.idType,
            }),
        }),

        setOtpError: assign({
          otpError: (_context, event) => {
            const message = (event as ErrorPlatformEvent).data.message;
            const OTP_ERRORS_MAP = {
              'OTP is invalid': 'invalidOtp',
              'OTP has expired': 'expiredOtp',
            };

            const otpErrorMessage = OTP_ERRORS_MAP[message]
              ? i18n.t(`errors.backend.${OTP_ERRORS_MAP[message]}`, {
                  ns: 'AddVcModal',
                })
              : message;

            sendErrorEvent(
              getErrorEventData(
                TelemetryConstants.FlowType.vcDownload,
                message,
                otpErrorMessage,
              ),
            );
            return otpErrorMessage;
          },
        }),

        setIdInputRef: model.assign({
          idInputRef: (_context, event) => event.idInputRef,
        }),

        resetIdInputRef: model.assign({
          idInputRef: null,
        }),

        clearOtp: assign({otp: ''}),

        focusInput: context => context.idInputRef.focus(),
      },

      services: {
        requestOtp: async context => {
          sendInteractEvent(
            getInteractEventData('VC Download', 'CLICK', 'Requesting OTP'),
          );
          return request(
            API_URLS.requestOtp.method,
            API_URLS.requestOtp.buildURL(),
            {
              id: 'mosip.identity.otp.internal',
              individualId: context.id,
              metadata: {},
              otpChannel: ['PHONE', 'EMAIL'],
              requestTime: String(new Date().toISOString()),
              transactionID: context.transactionId,
              version: '1.0',
            },
          );
        },

        requestCredential: async context => {
          // force wait to fix issue with hanging overlay
          await new Promise(resolve => setTimeout(resolve, 1000));
          const response = await request(
            API_URLS.credentialRequest.method,
            API_URLS.credentialRequest.buildURL(),
            {
              individualId: context.id,
              individualIdType: context.idType,
              otp: context.otp,
              transactionID: context.transactionId,
            },
          );
          return response.response.requestId;
        },
      },

      guards: {
        isEmptyId: ({id}) => id?.trim() === '',

        isWrongIdFormat: ({idType, id}) => {
          const validIdType =
            idType === 'UIN' ? id.length === 10 : id.length === 16;
          return !(/^\d{10,16}$/.test(id) && validIdType);
        },

        isIdInvalid: (_context, event: unknown) =>
          ['IDA-MLC-009', 'RES-SER-29', 'IDA-MLC-018'].includes(
            (event as BackendResponseError).name,
          ),
      },
    },
  );

type State = StateFrom<typeof AddVcModalMachine>;

export function selectId(state: State) {
  return state.context.id;
}

export function selectIdType(state: State) {
  return state.context.idType;
}

export function selectIdInputRef(state: State) {
  return state.context.idInputRef;
}

export function selectIdError(state: State) {
  return state.context.idError;
}

export function selectOtpError(state: State) {
  return state.context.otpError;
}

export function selectIsPhoneNumber(state: State) {
  return state.context.phoneNumber;
}

export function selectIsEmail(state: State) {
  return state.context.email;
}

export function selectIsAcceptingIdInput(state: State) {
  return state.matches('acceptingIdInput');
}

export function selectIsInvalid(state: State) {
  return state.matches('acceptingIdInput.invalid');
}

export function selectIsAcceptingOtpInput(state: State) {
  return state.matches('acceptingOtpInput');
}

export function selectIsRequestingOtp(state: State) {
  return state.matches('acceptingIdInput.requestingOtp');
}

export function selectIsRequestingCredential(state: State) {
  return state.matches('requestingCredential');
}

export function selectIsCancellingDownload(state: State) {
  return state.matches('cancelDownload');
}
