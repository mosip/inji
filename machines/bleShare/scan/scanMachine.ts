/* eslint-disable sonarjs/no-duplicate-string */
import tuvali from '@mosip/tuvali';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import {
  ActorRefFrom,
  assign,
  DoneInvokeEvent,
  EventFrom,
  send,
  spawn,
  StateFrom,
} from 'xstate';
import {createModel} from 'xstate/lib/model';
import {EmitterSubscription, Linking} from 'react-native';
import {DeviceInfo} from '../../../components/DeviceInfoList';
import {getDeviceNameSync} from 'react-native-device-info';
import {VC, VerifiablePresentation} from '../../../types/VC/vc';
import {AppServices} from '../../../shared/GlobalContext';
import {ActivityLogEvents, ActivityLogType} from '../../activityLog';
import {
  androidVersion,
  FACE_AUTH_CONSENT,
  isAndroid,
  isIOS,
  MY_LOGIN_STORE_KEY,
} from '../../../shared/constants';
import {subscribe} from '../../../shared/openIdBLE/walletEventHandler';
import {
  check,
  checkMultiple,
  PERMISSIONS,
  PermissionStatus,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import {
  checkLocationPermissionStatus,
  checkLocationService,
  requestLocationPermission,
} from '../../../shared/location';
import {CameraCapturedPicture} from 'expo-camera';
import {log} from 'xstate/lib/actions';
import {createQrLoginMachine, qrLoginMachine} from '../../QrLoginMachine';
import {StoreEvents} from '../../store';
import {WalletDataEvent} from '@mosip/tuvali/lib/typescript/types/events';
import {BLEError} from '../types';
import Storage from '../../../shared/storage';
import {VCMetadata} from '../../../shared/VCMetadata';
import {
  getEndEventData,
  getErrorEventData,
  getImpressionEventData,
  getStartEventData,
  sendEndEvent,
  sendErrorEvent,
  sendImpressionEvent,
  sendStartEvent,
} from '../../../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../../../shared/telemetry/TelemetryConstants';
import {logState} from '../../../shared/commonUtil';
import {VCShareFlowType} from '../../../shared/Utils';
import {getIdType} from '../../../shared/openId4VCI/Utils';

const {wallet, EventTypes, VerificationStatus} = tuvali;

const model = createModel(
  {
    serviceRefs: {} as AppServices,
    senderInfo: {} as DeviceInfo,
    receiverInfo: {} as DeviceInfo,
    selectedVc: {} as VC,
    bleError: {} as BLEError,
    createdVp: null as VC,
    loggers: [] as EmitterSubscription[],
    vcName: '',
    flowType: VCShareFlowType.SIMPLE_SHARE,
    verificationImage: {} as CameraCapturedPicture,
    openId4VpUri: '',
    shareLogType: '' as ActivityLogType,
    QrLoginRef: {} as ActorRefFrom<typeof qrLoginMachine>,
    linkCode: '',
    showFaceAuthConsent: true as boolean,
    readyForBluetoothStateCheck: false,
    showFaceCaptureSuccessBanner: false,
  },
  {
    events: {
      SELECT_VC: (vc: VC, flowType: string) => ({vc, flowType}),
      SCAN: (params: string) => ({params}),
      ACCEPT_REQUEST: () => ({}),
      VERIFY_AND_ACCEPT_REQUEST: () => ({}),
      VC_ACCEPTED: () => ({}),
      VC_REJECTED: () => ({}),
      VC_SENT: () => ({}),
      CANCEL: () => ({}),
      CLOSE_BANNER: () => ({}),
      STAY_IN_PROGRESS: () => ({}),
      RETRY: () => ({}),
      DISMISS: () => ({}),
      GOTO_HISTORY: () => ({}),
      CONNECTED: () => ({}),
      DISCONNECT: () => ({}),
      BLE_ERROR: (bleError: BLEError) => ({bleError}),
      CONNECTION_DESTROYED: () => ({}),
      SCREEN_BLUR: () => ({}),
      SCREEN_FOCUS: () => ({}),
      BLUETOOTH_PERMISSION_ENABLED: () => ({}),
      BLUETOOTH_PERMISSION_DENIED: () => ({}),
      BLUETOOTH_STATE_ENABLED: () => ({}),
      BLUETOOTH_STATE_DISABLED: () => ({}),
      NEARBY_ENABLED: () => ({}),
      NEARBY_DISABLED: () => ({}),
      GOTO_SETTINGS: () => ({}),
      START_PERMISSION_CHECK: () => ({}),
      LOCATION_ENABLED: () => ({}),
      LOCATION_DISABLED: () => ({}),
      LOCATION_REQUEST: () => ({}),
      CHECK_FLOW_TYPE: () => ({}),
      UPDATE_VC_NAME: (vcName: string) => ({vcName}),
      STORE_RESPONSE: (response: any) => ({response}),
      APP_ACTIVE: () => ({}),
      FACE_VALID: () => ({}),
      FACE_INVALID: () => ({}),
      RETRY_VERIFICATION: () => ({}),
      VP_CREATED: (vp: VerifiablePresentation) => ({vp}),
      TOGGLE_USER_CONSENT: () => ({}),
      RESET: () => ({}),
      FACE_VERIFICATION_CONSENT: (isConsentGiven: boolean) => ({
        isConsentGiven,
      }),
    },
  },
);
const QR_LOGIN_REF_ID = 'QrLogin';
export const ScanEvents = model.events;

export const scanMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5SwMYEMB2BiAygYQCUBRIgOQH0AhAGQFUCBtABgF1FQAHAe1gEsAXXlwzsQAD0QAWAEwAaEAE9EARgCsygHSSAnLu1N1ypkwBs06QF8L81JlyESFAGIB5PLRzM2SENz6DhUQkEGXklBFVVJg0zQ20TJn0AdmlVKxt0bBoiciICAhdGVlE-ASERH2CADjlFRCqTJI1lVJbzYyYUqvSQWwwNFAALMBQAaxx+LgAnNBgsCGEwDV4MADcuUaW+geGxienZsAQV9fQAjC8vEp4ywMrEKJMNJKYqgGYTN+k3qKrtWvCqhMTzeSSiYMkb0kyn+SR62yGI3GkxmcwWGCWJw2W0yOyR+1RRyxZ3Kl2U3k4N3OQQepmerw+Xx+r3+YVpTSqSR0qiSMOUkhMaWsvVxsH4aCm-AACmApgBbXiwPjCPC7Ua4AAqAEECBryFK8gBZACSOBwxpcFDwAAkiHgANJXHylan3BBGeIaJjQpJgzoyVImNkhfkaPS6N5GaTGQUmeGi8WSmXyxXKjCqpGanV6g0EE1mi1W20Ohjk67+co091GJ7e5S+8EBoHBgWqLR6Ixg741OHC7ZiiXS2UKpXlDNjLO6-VG03my3kG12x3SCm+KmVt0tbSSL1mBJffTaA-B9RtvQ1KqSJjSMFVbp93GIsakMASgBGCgAImBVrwUHBkxHNM8TGFYoCwUgiB1SgAE1clILVsk-J1KQrO5QGCaEQVUaFtBaNRpB0RoT0kGpmkkHkrxaAxtHjTAQNGF93y-H8-wA4dU3KBiwIgqCCFg8hP1NRDqCIZDimddd0PEKRlGw3D8NUQj4iSEjjHI1R3m0TTVChe8Mnop9GNfKYP2-X9-1gQDOOEDQpjAABHABXOBBAwcDIOguCyBEsSULXNCKgwxBdDbKprzUMFlDeH5BRPRkND+HkkjMUwjGUOj+iMpjTJYiz2JTUdbPs5zXJ4zz+LgoScF88TVxdDdgoQULEoinl1BioFVBI0M3m0pJtySPrlH0kVDLVHKzNYyzrKK-owAwNA3wAG0gLB-Ia6Tgha8LpEijrYu6uoIlIt4Ygogb9F01R-kyhjKGWlzJi4fhBlm4CjJ4mhaCIDUXBcDVrWnPNZ0LeDao2qSgpkhA9qSKoND2u9fW0O8mDUE96x3fkdJR5GhQMrK1Qep6uBet6OLm7j3Kwb7fv+wHgfzOcKE-MhjT8iTUNuaHgmkYEdxiqFLtx7R4qvDQfhkN53iqetUjuoySbAZ7XveriFqW1aIHWrmAp5qsRtIyXIQaRIr15TST29JocaPQjzF0SRFeJx6VbJ16JjQfglk+mm6b+gGgZwbUNRyHykMhwKqz6ppIS7KpIk6Ex+pbJPJf6nDJBSUFnYfcakWV1XBi9n3qfAgOGeD0OcmqiG9c23mVGzhH4k5bQor+OSW0aTQcZS0EZbwvPCfut3i9L321S+uh6aD8gQ61MPBOEyOy0k6O3VjrRQSUxPwRTnkWwt86eRMZR+QG-kXcL8ePZL8Uy5KlyxRnn7A8Zxfl4j0S6vLA3NxMD6l6d4fUGjxFIuoY+e1EqZz+OYIaI8xpE1vqTcmk87KORfm5Cus8P7VyXrXVev8o4AKapfVuJh26dzwkGY6kJ0YaS5PEIEMIkEIldmgz2j8liaxWmtUhrpyEtzDFQgaNDu70KiGFNoNQBQmAFJYfOKCxhF3vhgvh2t1rr25kImGPx9AZx5NRSMl5j4pUlnvSEHcL5AjuvZJWd90E8PLrTPBVcF413BpHBuUMY4dx3gnJOKVU7HV3gjBROlYy6X9PYkYnD3bOO9lPJEb856fy8XXHx9U-FuneE0L40hUYfAGjUSIwYZYDSMQ0F43p9DX2UZgxxXCH7JI0JogRvjN5NXyZLR27xGio1SEdcIoJGiSxaKRDufw9C9lHg4hJE8XEdJ1qWHJ3SYYjU9OoUwCigH8lRqpMJe0zwDU6B8I8A87orRaerYQ34MC8DWlqKUUpyBajwBqY0AA1IggjGqbMvAjKEMsEjbk6GoKoLZ-ggn6kNYwOFrrXKcWrSmaYHlPJ1gAcQBi4Bev0vmkCxZ4LpZCYYyB0M0X0Q8bxyQ+CeB21SDBbkjG8ZFLSMXPNee8z5Py-mkr0cEKMLZ0bRD6ppOSQIfhRHYbiDEEpKB5TYlZNF5ROU6xeW8j5Xzfn-K2g8AEDxPjSFgTdYwvIL7vAJsgjQ8qpiKvMsqu5GB1VYBxX9fFGpCXEr1U3WGoITVAnCuKnQR5JAnl0ia+OAouSaV9Eo0eKBVoSjAngYQGIUDnCwNVPAlpIKfN9THHQCMcIjV9EAvCe1gxFJuhpINW4CKK2TVMVN6aRhZrEAOMuaAABmPspgAAo2YhwKHBL5hoiAuFoBqAAlFgBEzbW0YAzecQtW9i0aFLZyF4w0q3HSKRfU+QJBQDVznGRpPaVgQCXSu8o9gtSkDXU1Pq58Yhoxui0N4iQxb7u0sC94QDOg3mFrK+il6MDXvcmm5d7a734AfWs-+grEDis0FQ8KH7vjfurQop4V4+oxhOaNbY4HINQGg7e4Q97H0riQwC4IfVoRvow5Wr9uhq0yARryBRii7yo2tf2QYXAADuABFKY1AuBQBWPMRYyw1jYg0OJyT0mLgCvo1IR2zw5ZyworhnCOH3jNBiokL9lqgFssabAITYmJNSZk9VZmT79HxDQ++1j2H91yxNefBBKVE780kKB-o1mRPKfsyFlEPEQ6FByMQHAUpLQ4H5esslmEEh4dMCkC+2kD0jMQPzTSYYK2EVePzIacybUoDbZmniubSD5rDn-DeaWVBApNqC82EKrb0JCW+2NLI94ZUadVmDtX3LyalFMKT9klRYE7S43t-aB31ca2Dcdk7p1zoRDVnBk3ptQFm7AZzmEoTaC0CnK8lzLkGGrboaIvmikvGjOjT4itdtgQ0IIOUYAuBOX4FgPAD68BEGoCdlDAbN1yzAeYH4AyWxG0RmCXSF9IwKMs-M1iYBhOfdgGAVa42oDfJQFgWgUpPyEPIMQLUOBLTg-dDoTQ8NorSEvN6BopFgxqFeJu6Mh5vimxTnE382Pcf49g+5Yn2bTSrbtBqenWyng7IFvs4tRzRmSq0PDbSMg8bDcxyLnHE28cE5wVL5LolPnkG+XgBX0jN1qBTi902ULjr8haJuvc8LIh0oxza+yhuxem7AlL35BBjRODgg+z8PKQdSj1MQUTP0Q7095E0UtjQFHhT+DLLn58mimEDPhZS+v-dY6N1ADQJuJdE5Jx8uPCeiBJ6ICn9T+qEBp83VhFKpEWS57d9nB73o9qAY7kA4juIA9PIr1X8XhOpdA9ICDsHbe-VyXVwVq80Ry3gt9J8Awwvp9B5r1Lv6WKsWiXIB4PIC4ktkHl6vw2ijEZ4S5C8bO+g6HhGinJGIw+wHXhRS0SNJT6i4TaZD-jLTLQ8QK5-BK41h7KRhq7VpKRnTXivBRCw5Z5+7bCgEz544QYh4k45p5py6wHbIIH4YHKcjVrZ684GCpCnQqQCaT7l5i6EGS4k4274qkAP6pbIYhCMKozxD8wzLMLhq-p0joFmAwhlaIKH5gGV4EFkah54Cx5EDx6cz8EabViJzPBlrFqYH-CGqwyNBoHRjAgdyaSxAKH4ELQqFcFqHEAABScuWhdG7eOWbYvInIhh14xhd2Hw9BMh+gPYUIth7BDhgOwOoOCumuPhzCic-h5gKBKQXo0Y7wQWPInIrOERxu9hRB+2M2cAsA82XaSwS2soA6OA1oOoxoRK5AG2U6s686rBge+RHBteRRh2JR9OukXG3m4I4IrmtB-MzwLwOEHwZh14OBbRR+HRDhX2vAP2f2AOi+y+cRkQ+hvh-GyRJhqQMCSkiQck4UzCYIeRShBRnBs+GAaxMRK+2hnh9Y3hBhuxRSKR+6Zgga0YXYRgciwBBu8xleaAKA-4HAPsOsjms4duAozwscmkrw58bwOGQ06RuyVhDQCsIBbBE29kAAVu2mtFCWaOQfAbslQcgb+kEUcSEXIbMfRHgZ9qsLKLwD2goGBMaBAAtIIPwAoFgE4B8jkN8lqNQMaM1rojoZfHdroEjgYKcTFAKA0oCYoRoMyS2myRyVybcQIHyQKSDuQPUcKaKeKfrAIZ3hnj3tnkeK7t-onCWnuOFGYD2MFpgu0ZXmqayeye5JydyTqdEUvrEY-m6Oad3lnn3jaSoMep7oFrFHtPyBPgyTiZXigPZN7CHhwLJhiPJusJsFXnMSqSma+GbhwMcApiSMIJcEGeQkfPupbBMjCAiVljeBcQMKmcWVgLKNNlMBoBwMtN7D2tMHKHmYmW6a2UWemaWacGmRWawPTqyv1tIrIfENuMiW7uoLWHzvzHDOhgmf0IyRNicGgNARAD6dqbydLjgE5lWTDKzhEqkMYH1KVgYKud-gkK3KehSjUoci2YeceaeTyXycQBqAQHBGHhHsaEDl8nTteXzKjDEPeSVlvrpFzhVolC0KlP8OPkUndNeqgLtkSaaFeY8X6uYB7jdFeF+QcvELQWoOMQYF8Q+TUPSf0IMJgBANAe5A9GAEQFMF2ReURR4X6leDuMCDxkiSxvzMGHxolDhLeZgXIueqPL+bwJCYRdCTBShqRCWtCNuhWvhNWqCAjHtAojeMjp-jfKBO5JJuWRgDgLKPlOXM6qXE5KUdQG4EvGDD-O4S1gIVCBRLzv1OfNIflggIZW2DWq0JUpEAmlVtPFZVwDZXZVMA5X7FAE5Y-C5VgG5ZBWDFkiQhpf6ryIlEFmWgYFyLEBUhKs8I0HGSNKzl8C6aldZdObZfZWxJgqVK-O5BqFwEQItPwlle5VBRQF5SaY3FWN2OdkYEgTFOfJiRvqFbpGdNLPWHspeN8BZaMGBM1ecElQ5c-GVN1b1f1atINTlfOHld5RKe3redEFeFQvUq2LyJVVQpYgYDGtCFCHYiNnFVADteUHte1VqZilgJqjyjqiloJRNduLWDGDhJyMnD+qMtCNEOoCkK8OjENDYT9akvFYlW1f+BoMDWtNlR5fOInsnnwVDVvN8G2Map0IXk6QtVCEAojFECzdItruesKBgFwFyfAD4H0NTU1AALRI2IAi1njhjS26CRJ3QrAgmCDMnC03mHqfA4SJCfB1Vwxc6s6bodCmAURfqJy3Q417AoiHAq18yESJRCypCXI5zvAMpNCxDRSRCGBKQxW4GuQtqZo4CsUtqcFW0qAXwmo1BFI57ox87i0RCCiSzMI1VfA56l79iJhDiFRpjjijDB0IBoxGLGGWlyLWxPCcgyp-qtCVYcJIiTRKozSqrSTjVbwx17znaRKJx4yciKWxXV0mRTT5QqoZ1cSpU500HHS6R4RMqs5vnaSbU12Op12D3FRYKHVQA50yGSyJxBZiLTXRTxS+hMJyxmDFop2PgTS9210FRAQawnWQA51dBhi0pXiaSs4vBf4PCkQ+YURyzqDxCJCbVqLkzOo50jQ-AdZmy76QrWwNCnxHixymX-0ooUyL0qJbXuTAN3hnQgrgMWyQNj0jQIwtDs0NlfC6QIO3L13zQ30QA52tDRAdCO5DQRg3iYwBK7zoxMXq2NWLLqI8Ij0x0yABI4yJxfCfB8ZkOJLcJtLD0+WSmghpw3hGLlrQhZHMVjwtIYIHVdWr0yPt7hR9xSqvZJ1mEtgywiUXTlozJHjiNLJtIrLAMNUxBSxchfrXiXZpyQinz+aaSgJxLNISOtI+x8MVLAgmrir-B1UNmQi+PcNJJlzSPXVr5yNhLMKmqXhAi97WHROoL+MaJUNr1kTCHAjejnz1h3gVJghTVf2RhHi2IAk2o3L+POrqo0OoyaBwE0Q3R3itjiyYOyUywyzywukNPFzNM6Nr7+YyXSyJC+HM0Kla76AM0Mh1PbB2oOrTSX02QuoLSYrAP4QxBY3RXfATELVSqYPaQLMWogMsGGSLpQYfYN25LPqfW87GLvH8Y1mjLoyaAdy8gLMZGvAumkY3qwYPMbIMa8gmrLn4PRTIy0Epy7jmA3gZamNd2CZhZ2aqY506VM46Y4z6YSHhCEQKLGaRj1W6BdOqOha2YqYrDLDsVgBYtEuOPWEY3fBHg4Y22fBfpcgtyO13RUvhaqZV5RZoNjNVimwcgC4YH74x2FYRImblpfMyz8s2aCu0uLS-hQBplHXWiKgojhAJPisYZhgywVqRBHjbiGYmrRTG0UTRiNojYfaiuGtuhYSt2+jwzRXvC020FbGh1FIyGZGNVOuV4rBTbFFKiMv1j7O+j7z1U+u-p-AxCyIBYDKkOOtjZ7bfa-b-ZYsfrPD-CDw55MV3ZJuPZ3h7wfDpvKkV530x2o7RBGACOyFXYn0jlAmz7B5B1ituhKRtjTNHhAJggevKB56JDzNQiERfnvAtkQH44cXaMuvkIuMXZ3h7KYWJwoHmBom0KnE6CV35l2GdHE450-BnSFOiG6DiE4YT03hDsvYnGXgtnKGFFhsHZHZYtCFwGXsdw6AEsFZlJ0WQg4RFOAHPtXFdHZurHAPGCaAyyIotzcgDSjHeHv5SygeqP7mXHHsoA3H8A539HaaEOdDDHny0GXiym4bfrwwxQtkglgkQn2M8iJRRQos1AKKjufFRBonq320-DNnYmjn4mEnUM9vLvEuipf0jR0rNhUkF4WF7ShHAYulYe2poCavatQA9XWhcA-bAO9wxDAjCOQg6AvkFZmHBEpy3ixAqdJmqkskanelakAUwcKMWMhHFLMNu5DSQt7gsjwzhQyCzttnpnANeff5RB0OweQgHHxB9Q-lrBHkqX-k6lhcLVlrLXr7HFAh1Jtv9C4WjYrq31ic3k0RaCmAgfoH6BmewyH2UfoU+jhGNKsUQYLtcU8Vdk0NFLtjhhAJt0jRSWGJSxyXXgKXy2JfHlYtySaD3kpBxkpBQL7rSyOORjTNGcH5m2oN-UJUtWA3-g0Ps7NDFNPYpxmz-uhWRjeHs3DSNCMOoun243bf43JXtWpXpXewuUHeehNtmAdyncJDnfoeIzywPlZadCbXbU7e7UE1LCaM4I9V9VawMsld8w3RnS2IY1BY3hBaVX+XMhAiiGTvXMoOQ-PcOXE2idLv6L8jLW7JBWHOA-GJvUgdcjRQChWBWBAA */
  model.createMachine(
    {
      predictableActionArguments: true,
      preserveActionOrder: true,
      tsTypes: {} as import('./scanMachine.typegen').Typegen0,
      schema: {
        context: model.initialContext,
        events: {} as EventFrom<typeof model>,
        services: {} as {
          createVp: {
            data: VC;
          };
        },
      },
      invoke: {
        src: 'monitorConnection',
      },
      id: 'scan',
      initial: 'inactive',
      on: {
        SCREEN_BLUR: {
          target: '#scan.disconnectDevice',
        },
        SCREEN_FOCUS: {
          target: '.checkStorage',
        },
        BLE_ERROR: {
          target: '.handlingBleError',
          actions: ['sendBLEConnectionErrorEvent', 'setBleError'],
        },
        RESET: {
          target: '.checkStorage',
        },
        DISMISS: {
          target: '#scan.reviewing.disconnect',
        },
        SELECT_VC: {
          actions: ['setSelectedVc', 'setFlowType'],
          target: '.checkStorage',
        },
      },
      states: {
        inactive: {
          entry: ['removeLoggers'],
        },
        disconnectDevice: {
          invoke: {
            src: 'disconnect',
          },
          on: {
            DISCONNECT: {
              target: '#scan.inactive',
            },
          },
        },
        checkStorage: {
          invoke: {
            src: 'checkStorageAvailability',
            onDone: [
              {
                cond: 'isMinimumStorageRequiredForAuditEntryReached',
                target: 'restrictSharingVc',
              },
              {
                target: 'startPermissionCheck',
              },
            ],
          },
        },
        restrictSharingVc: {},

        startPermissionCheck: {
          on: {
            START_PERMISSION_CHECK: [
              {
                cond: 'uptoAndroid11',
                target: '#scan.checkBluetoothPermission',
              },
              {
                cond: 'isIOS',
                target: '#scan.checkBluetoothPermission',
              },
              {
                target: '#scan.checkNearbyDevicesPermission',
              },
            ],
          },
        },

        checkNearbyDevicesPermission: {
          initial: 'checking',
          states: {
            checking: {
              invoke: {
                src: 'checkNearByDevicesPermission',
              },
              on: {
                NEARBY_ENABLED: {
                  target: 'enabled',
                },
                NEARBY_DISABLED: {
                  target: 'requesting',
                },
              },
            },
            requesting: {
              invoke: {
                src: 'requestNearByDevicesPermission',
              },
              on: {
                NEARBY_ENABLED: {
                  target: '#scan.checkBluetoothPermission',
                },
                NEARBY_DISABLED: {
                  target: '#scan.nearByDevicesPermissionDenied',
                },
              },
            },
            enabled: {
              always: {
                target: '#scan.checkBluetoothPermission',
              },
            },
          },
        },

        checkBluetoothPermission: {
          initial: 'checking',
          states: {
            checking: {
              invoke: {
                src: 'checkBluetoothPermission',
              },
              on: {
                BLUETOOTH_PERMISSION_ENABLED: {
                  actions: 'setReadyForBluetoothStateCheck',
                  target: 'enabled',
                },
                BLUETOOTH_PERMISSION_DENIED: {
                  target: '#scan.bluetoothPermissionDenied',
                },
              },
            },
            enabled: {
              always: {
                target: '#scan.checkBluetoothState',
              },
            },
          },
        },

        checkBluetoothState: {
          initial: 'checking',
          states: {
            checking: {
              invoke: {
                src: 'checkBluetoothState',
              },
              on: {
                BLUETOOTH_STATE_ENABLED: {
                  target: 'enabled',
                },
                BLUETOOTH_STATE_DISABLED: [
                  {
                    cond: 'isIOS',
                    target: '#scan.checkBluetoothPermission',
                  },
                  {
                    target: 'requesting',
                  },
                ],
              },
            },
            requesting: {
              invoke: {
                src: 'requestBluetooth',
              },
              on: {
                BLUETOOTH_STATE_ENABLED: {
                  target: 'enabled',
                },
                BLUETOOTH_STATE_DISABLED: {
                  target: '#scan.bluetoothDenied',
                },
              },
            },
            enabled: {
              always: [
                {
                  cond: 'uptoAndroid11',
                  target: '#scan.checkingLocationState',
                },
                {
                  target: '#scan.clearingConnection',
                },
              ],
            },
          },
        },

        recheckBluetoothState: {
          initial: 'checking',
          states: {
            checking: {
              invoke: {
                src: 'checkBluetoothState',
              },
              on: {
                BLUETOOTH_STATE_ENABLED: {
                  target: 'enabled',
                },
                BLUETOOTH_STATE_DISABLED: {
                  target: '#scan.bluetoothDenied',
                },
              },
            },
            enabled: {
              always: [
                {
                  cond: 'uptoAndroid11',
                  target: '#scan.checkingLocationState',
                },
                {
                  target: '#scan.clearingConnection',
                },
              ],
            },
          },
        },

        bluetoothPermissionDenied: {
          on: {
            APP_ACTIVE: '#scan.checkBluetoothState',
            GOTO_SETTINGS: {
              actions: 'openBluetoothSettings',
            },
          },
        },

        bluetoothDenied: {
          on: {
            APP_ACTIVE: '#scan.recheckBluetoothState',
          },
        },

        nearByDevicesPermissionDenied: {
          on: {
            APP_ACTIVE: '#scan.checkNearbyDevicesPermission',
            GOTO_SETTINGS: {
              actions: 'openAppPermission',
            },
          },
        },

        clearingConnection: {
          invoke: {
            src: 'disconnect',
          },
          on: {
            DISCONNECT: {
              target: '#scan.checkFaceAuthConsent',
              internal: false,
            },
          },
          after: {
            DESTROY_TIMEOUT: {
              target: '#scan.checkFaceAuthConsent',
              actions: [],
              internal: false,
            },
          },
        },
        checkFaceAuthConsent: {
          entry: 'getFaceAuthConsent',
          on: {
            STORE_RESPONSE: {
              actions: 'updateShowFaceAuthConsent',
              target: '#scan.findingConnection',
            },
          },
        },
        findingConnection: {
          entry: [
            'removeLoggers',
            'registerLoggers',
            'clearUri',
            'setChildRef',
          ],
          on: {
            SCAN: [
              {
                target: 'connecting',
                cond: 'isOpenIdQr',
                actions: ['sendVcSharingStartEvent', 'setUri'],
              },
              {
                target: 'showQrLogin',
                cond: 'isQrLogin',
                actions: ['sendVcSharingStartEvent', 'setLinkCode'],
              },
              {
                target: 'invalid',
              },
            ],
          },
        },
        showQrLogin: {
          invoke: {
            id: 'QrLogin',
            src: qrLoginMachine,
            onDone: {
              target: '.storing',
            },
          },
          on: {
            DISMISS: '#scan.checkFaceAuthConsent',
          },
          initial: 'idle',
          states: {
            idle: {},
            storing: {
              entry: ['storeLoginItem'],
              on: {
                STORE_RESPONSE: {
                  target: 'navigatingToHistory',
                  actions: ['storingActivityLog'],
                },
              },
            },
            navigatingToHistory: {},
          },
          entry: [
            'sendScanData',
            () =>
              sendStartEvent(
                getStartEventData(TelemetryConstants.FlowType.qrLogin),
              ),
          ],
        },
        connecting: {
          invoke: {
            src: 'startConnection',
          },
          initial: 'inProgress',
          after: {
            CONNECTION_TIMEOUT: {
              target: '.timeout',
              internal: true,
            },
          },
          states: {
            inProgress: {
              on: {
                CANCEL: {
                  target: '#scan.reviewing.cancelling',
                },
              },
            },
            timeout: {
              on: {
                STAY_IN_PROGRESS: {
                  target: 'inProgress',
                },
                CANCEL: {
                  target: '#scan.reviewing.cancelling',
                },
                RETRY: {
                  target: '#scan.reviewing.cancelling',
                },
              },
            },
          },
          on: {
            CONNECTED: {
              target: 'reviewing',
              actions: ['setSenderInfo', 'setReceiverInfo'],
            },
          },
        },
        reviewing: {
          initial: 'idle',
          entry: ['resetShouldVerifyPresence', send('CHECK_FLOW_TYPE')],
          on: {
            CHECK_FLOW_TYPE: [
              {
                cond: 'isFlowTypeSimpleShare',
                target: '.selectingVc',
              },
              {
                cond: 'isFlowTypeMiniViewShare',
                target: '.sendingVc',
                actions: 'setShareLogTypeUnverified',
              },
              {
                cond: 'isFlowTypeMiniViewShareWithSelfie',
                target: '.verifyingIdentity',
              },
            ],
          },
          exit: ['clearCreatedVp'],
          states: {
            idle: {},
            selectingVc: {
              on: {
                DISCONNECT: {
                  target: '#scan.disconnected',
                },
                SELECT_VC: {
                  actions: ['setSelectedVc', 'setFlowType'],
                },
                VERIFY_AND_ACCEPT_REQUEST: [
                  {
                    cond: 'showFaceAuthConsentScreen',
                    target: 'faceVerificationConsent',
                  },
                  {
                    target: 'verifyingIdentity',
                  },
                ],
                ACCEPT_REQUEST: {
                  target: 'sendingVc',
                  actions: [
                    'setShareLogTypeUnverified',
                    'resetFaceCaptureBannerStatus',
                  ],
                },
                CANCEL: {
                  target: 'cancelling',
                  actions: 'sendVCShareFlowCancelEndEvent',
                },
                TOGGLE_USER_CONSENT: {
                  actions: 'toggleShouldVerifyPresence',
                },
              },
            },
            cancelling: {
              always: {
                target: '#scan.clearingConnection',
              },
            },
            sendingVc: {
              invoke: {
                src: 'sendVc',
              },
              after: {
                SHARING_TIMEOUT: {
                  target: '.timeout',
                  internal: true,
                },
              },
              initial: 'inProgress',
              states: {
                inProgress: {
                  on: {
                    CANCEL: {
                      target: '#scan.reviewing.cancelling',
                      actions: ['sendVCShareFlowCancelEndEvent'],
                    },
                    CLOSE_BANNER: {
                      actions: ['resetFaceCaptureBannerStatus'],
                    },
                  },
                },
                timeout: {
                  on: {
                    STAY_IN_PROGRESS: {
                      target: 'inProgress',
                    },
                    CANCEL: {
                      target: '#scan.reviewing.cancelling',
                      actions: ['sendVCShareFlowTimeoutEndEvent'],
                    },
                    RETRY: {
                      target: '#scan.reviewing.cancelling',
                      actions: ['sendVCShareFlowTimeoutEndEvent'],
                    },
                  },
                },
                sent: {
                  description:
                    'VC data has been shared and the receiver should now be viewing it',
                  on: {
                    CANCEL: {
                      target: '#scan.reviewing.cancelling',
                    },
                  },
                },
              },
              on: {
                DISCONNECT: {
                  target: '#scan.disconnected',
                },
                VC_SENT: {
                  target: '.sent',
                },
                VC_ACCEPTED: {
                  target: '#scan.reviewing.accepted',
                },
                VC_REJECTED: {
                  target: '#scan.reviewing.rejected',
                },
                CANCEL: {
                  target: '#scan.reviewing.cancelling',
                },
              },
            },
            accepted: {
              entry: ['logShared', 'sendVcShareSuccessEvent'],
              on: {
                DISMISS: {
                  target: 'disconnect',
                },
                GOTO_HISTORY: {
                  target: 'navigateToHistory',
                },
              },
            },
            rejected: {
              on: {
                RETRY: {
                  target: '#scan.clearingConnection',
                },
              },
            },
            disconnect: {
              //Renamed this to disconnect from navigateToHome as we are disconnecting the devices.
              invoke: {
                src: 'disconnect',
              },
            },
            navigateToHistory: {
              entry: ['resetFlowType', 'resetSelectedVc'],
              always: '#scan.disconnected',
            },
            faceVerificationConsent: {
              on: {
                FACE_VERIFICATION_CONSENT: {
                  actions: [
                    'setShowFaceAuthConsent',
                    'storeShowFaceAuthConsent',
                  ],
                  target: 'verifyingIdentity',
                },
                DISMISS: {
                  target: '#scan.reviewing.selectingVc',
                },
              },
            },
            verifyingIdentity: {
              on: {
                FACE_VALID: {
                  target: 'sendingVc',
                  actions: [
                    'setShareLogTypeVerified',
                    'updateFaceCaptureBannerStatus',
                  ],
                },
                FACE_INVALID: {
                  target: 'invalidIdentity',
                  actions: 'logFailedVerification',
                },
                CANCEL: [
                  {
                    cond: 'isFlowTypeSimpleShare',
                    target: 'selectingVc',
                  },
                  {
                    target: 'cancelling',
                  },
                ],
              },
            },
            creatingVp: {
              invoke: {
                src: 'createVp',
                onDone: [
                  {
                    target: 'sendingVc',
                    actions: 'setCreatedVp',
                  },
                ],
                onError: [
                  {
                    target: 'selectingVc',
                    actions: log('Could not create Verifiable Presentation'),
                  },
                ],
              },
            },
            invalidIdentity: {
              on: {
                DISMISS: [
                  {
                    cond: 'isFlowTypeSimpleShare',
                    target: 'selectingVc',
                  },
                  {
                    target: 'cancelling',
                  },
                ],
                RETRY_VERIFICATION: {
                  target: 'verifyingIdentity',
                },
              },
            },
          },
        },
        disconnected: {
          on: {
            RETRY: {
              target: '#scan.reviewing.cancelling',
            },
            DISMISS: {
              target: '#scan.reviewing.disconnect',
            },
          },
        },
        handlingBleError: {
          on: {
            RETRY: {
              target: '#scan.reviewing.cancelling',
            },
            DISMISS: {
              target: '#scan.clearingConnection',
            },
          },
        },
        invalid: {
          on: {
            DISMISS: {
              target: '#scan.clearingConnection',
            },
          },
        },
        checkingLocationState: {
          initial: 'checkLocationService',
          states: {
            checkLocationService: {
              invoke: {
                src: 'checkLocationStatus',
              },
              on: {
                LOCATION_ENABLED: {
                  target: 'checkingPermissionStatus',
                },
                LOCATION_DISABLED: {
                  target: 'disabled',
                },
              },
            },
            checkingPermissionStatus: {
              invoke: {
                src: 'checkLocationPermission',
              },
              on: {
                LOCATION_ENABLED: {
                  target: '#scan.clearingConnection',
                },
                LOCATION_DISABLED: {
                  target: 'requestToEnableLocation',
                },
              },
            },
            requestToEnableLocation: {
              invoke: {
                src: 'requestToEnableLocationPermission',
              },
              on: {
                LOCATION_ENABLED: {
                  target: '#scan.clearingConnection',
                },
                LOCATION_DISABLED: {
                  target: 'denied',
                },
              },
            },
            denied: {
              on: {
                APP_ACTIVE: {
                  target: 'checkingPermissionStatus',
                },
                LOCATION_REQUEST: {
                  actions: 'openAppPermission',
                },
              },
            },
            disabled: {
              on: {
                LOCATION_REQUEST: {
                  target: 'checkLocationService',
                },
              },
            },
          },
        },
      },
    },
    {
      actions: {
        setChildRef: assign({
          QrLoginRef: context => {
            const service = spawn(
              createQrLoginMachine(context.serviceRefs),
              QR_LOGIN_REF_ID,
            );
            service.subscribe(logState);
            return service;
          },
        }),

        updateShowFaceAuthConsent: model.assign({
          showFaceAuthConsent: (_, event) => {
            return event.response || event.response === null;
          },
        }),

        setShowFaceAuthConsent: model.assign({
          showFaceAuthConsent: (_, event) => {
            return !event.isConsentGiven;
          },
        }),

        getFaceAuthConsent: send(StoreEvents.GET(FACE_AUTH_CONSENT), {
          to: context => context.serviceRefs.store,
        }),

        storeShowFaceAuthConsent: send(
          (context, event) =>
            StoreEvents.SET(FACE_AUTH_CONSENT, !event.isConsentGiven),
          {
            to: context => context.serviceRefs.store,
          },
        ),

        sendScanData: context =>
          context.QrLoginRef.send({
            type: 'GET',
            linkCode: context.linkCode,
            flowType: context.flowType,
            selectedVc: context.selectedVc,
            faceAuthConsentGiven: context.showFaceAuthConsent,
          }),

        openBluetoothSettings: () => {
          isAndroid()
            ? BluetoothStateManager.openSettings().catch()
            : Linking.openURL('App-Prefs:Bluetooth');
        },

        openAppPermission: () => Linking.openSettings(),

        setUri: model.assign({
          openId4VpUri: (_context, event) => event.params,
        }),

        clearUri: assign({
          openId4VpUri: '',
        }),

        setSenderInfo: assign({
          senderInfo: () => {
            return {name: 'Wallet', deviceName: 'Wallet', deviceId: ''};
          },
        }),

        setReceiverInfo: assign({
          receiverInfo: () => {
            return {name: 'Verifier', deviceName: 'Verifier', deviceId: ''};
          },
        }),

        setReadyForBluetoothStateCheck: model.assign({
          readyForBluetoothStateCheck: () => true,
        }),

        setBleError: assign({
          bleError: (_context, event) => event.bleError,
        }),

        setSelectedVc: assign({
          selectedVc: (context, event) => {
            return {
              ...event.vc,
              shouldVerifyPresence: context.selectedVc.shouldVerifyPresence,
            };
          },
        }),

        resetSelectedVc: assign({
          selectedVc: {},
        }),

        setFlowType: assign({
          flowType: (_context, event) => event.flowType,
        }),

        resetFlowType: assign({
          flowType: VCShareFlowType.SIMPLE_SHARE,
        }),

        setCreatedVp: assign({
          createdVp: (_context, event) => event.data,
        }),

        clearCreatedVp: assign({
          createdVp: () => null,
        }),

        registerLoggers: assign({
          loggers: () => {
            if (__DEV__) {
              return [
                wallet.handleDataEvents(event => {
                  console.log(
                    getDeviceNameSync(),
                    '<Sender.Event>',
                    JSON.stringify(event).slice(0, 100),
                  );
                }),
              ];
            } else {
              return [];
            }
          },
        }),

        removeLoggers: assign({
          loggers: ({loggers}) => {
            loggers?.forEach(logger => logger.remove());
            return [];
          },
        }),

        setShareLogTypeUnverified: model.assign({
          shareLogType: 'VC_SHARED',
        }),

        setShareLogTypeVerified: model.assign({
          shareLogType: 'PRESENCE_VERIFIED_AND_VC_SHARED',
        }),

        updateFaceCaptureBannerStatus: model.assign({
          showFaceCaptureSuccessBanner: true,
        }),

        resetFaceCaptureBannerStatus: model.assign({
          showFaceCaptureSuccessBanner: false,
        }),

        logShared: send(
          context => {
            const vcMetadata = context.selectedVc?.vcMetadata;
            return ActivityLogEvents.LOG_ACTIVITY({
              _vcKey: VCMetadata.fromVC(vcMetadata).getVcKey(),
              type: context.selectedVc.shouldVerifyPresence
                ? 'VC_SHARED_WITH_VERIFICATION_CONSENT'
                : context.shareLogType,
              id: vcMetadata.id,
              idType: getIdType(vcMetadata.issuer),
              timestamp: Date.now(),
              deviceName:
                context.receiverInfo.name || context.receiverInfo.deviceName,
              vcLabel: vcMetadata.id,
            });
          },
          {to: context => context.serviceRefs.activityLog},
        ),

        logFailedVerification: send(
          context =>
            ActivityLogEvents.LOG_ACTIVITY({
              _vcKey: VCMetadata.fromVC(context.selectedVc).getVcKey(),
              type: 'PRESENCE_VERIFICATION_FAILED',
              timestamp: Date.now(),
              idType: getIdType(context.selectedVc.issuer),
              id: context.selectedVc.id,
              deviceName:
                context.receiverInfo.name || context.receiverInfo.deviceName,
              vcLabel: context.selectedVc.id,
            }),
          {to: context => context.serviceRefs.activityLog},
        ),

        toggleShouldVerifyPresence: assign({
          selectedVc: context => ({
            ...context.selectedVc,
            shouldVerifyPresence: !context.selectedVc.shouldVerifyPresence,
          }),
        }),

        setLinkCode: assign({
          linkCode: (_, event) =>
            new URL(event.params).searchParams.get('linkCode'),
        }),

        resetShouldVerifyPresence: assign({
          selectedVc: context => ({
            ...context.selectedVc,
            shouldVerifyPresence: false,
          }),
        }),

        storeLoginItem: send(
          (_context, event) => {
            return StoreEvents.PREPEND(
              MY_LOGIN_STORE_KEY,
              (event as DoneInvokeEvent<string>).data,
            );
          },
          {to: context => context.serviceRefs.store},
        ),

        storingActivityLog: send(
          (_, event) =>
            ActivityLogEvents.LOG_ACTIVITY({
              _vcKey: '',
              id: event.response.selectedVc.vcMetadata.id,
              idType: getIdType(event.response.selectedVc.vcMetadata.issuer),
              type: 'QRLOGIN_SUCCESFULL',
              timestamp: Date.now(),
              deviceName: '',
              vcLabel: String(event.response.selectedVc.vcMetadata.id),
            }),
          {
            to: context => context.serviceRefs.activityLog,
          },
        ),

        sendVcShareSuccessEvent: () => {
          sendImpressionEvent(
            getImpressionEventData(
              TelemetryConstants.FlowType.senderVcShare,
              TelemetryConstants.Screens.vcShareSuccessPage,
            ),
          );
          sendEndEvent(
            getEndEventData(
              TelemetryConstants.FlowType.senderVcShare,
              TelemetryConstants.EndEventStatus.success,
            ),
          );
        },

        sendBLEConnectionErrorEvent: (_context, event) => {
          sendErrorEvent(
            getErrorEventData(
              TelemetryConstants.FlowType.senderVcShare,
              event.bleError.code,
              event.bleError.message,
            ),
          );
          sendEndEvent(
            getEndEventData(
              TelemetryConstants.FlowType.senderVcShare,
              TelemetryConstants.EndEventStatus.failure,
            ),
          );
        },

        sendVcSharingStartEvent: () => {
          sendStartEvent(
            getStartEventData(TelemetryConstants.FlowType.senderVcShare),
          );
          sendImpressionEvent(
            getImpressionEventData(
              TelemetryConstants.FlowType.senderVcShare,
              TelemetryConstants.Screens.scanScreen,
            ),
          );
        },

        sendVCShareFlowCancelEndEvent: () => {
          sendEndEvent(
            getEndEventData(
              TelemetryConstants.FlowType.senderVcShare,
              TelemetryConstants.EndEventStatus.cancel,
              {comment: 'User cancelled VC share'},
            ),
          );
        },

        sendVCShareFlowTimeoutEndEvent: () => {
          sendEndEvent(
            getEndEventData(
              TelemetryConstants.FlowType.senderVcShare,
              TelemetryConstants.EndEventStatus.failure,
              {comment: 'VC sharing timeout'},
            ),
          );
        },
      },

      services: {
        checkBluetoothPermission: () => async callback => {
          // wait a bit for animation to finish when app becomes active
          await new Promise(resolve => setTimeout(resolve, 250));
          try {
            // Passing Granted for android since permission status is always granted even if its denied.
            let response: PermissionStatus = RESULTS.GRANTED;

            if (isIOS()) {
              response = await check(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
            }

            if (response === RESULTS.GRANTED) {
              callback(model.events.BLUETOOTH_PERMISSION_ENABLED());
            } else {
              callback(model.events.BLUETOOTH_PERMISSION_DENIED());
            }
          } catch (e) {
            console.error(e);
          }
        },

        checkBluetoothState: () => callback => {
          const subscription = BluetoothStateManager.onStateChange(state => {
            if (state === 'PoweredOn') {
              callback(model.events.BLUETOOTH_STATE_ENABLED());
            } else {
              callback(model.events.BLUETOOTH_STATE_DISABLED());
            }
          }, true);
          return () => subscription.remove();
        },

        requestBluetooth: () => callback => {
          BluetoothStateManager.requestToEnable()
            .then(() => callback(model.events.BLUETOOTH_STATE_ENABLED()))
            .catch(() => callback(model.events.BLUETOOTH_STATE_DISABLED()));
        },

        requestToEnableLocationPermission: () => callback => {
          requestLocationPermission(
            () => callback(model.events.LOCATION_ENABLED()),
            () => callback(model.events.LOCATION_DISABLED()),
          );
        },

        monitorConnection: () => callback => {
          const walletErrorCodePrefix = 'TVW';
          const subscription = wallet.handleDataEvents(event => {
            if (event.type === EventTypes.onDisconnected) {
              callback({type: 'DISCONNECT'});
            }
            if (
              event.type === EventTypes.onError &&
              event.code.includes(walletErrorCodePrefix)
            ) {
              callback({
                type: 'BLE_ERROR',
                bleError: {message: event.message, code: event.code},
              });
              console.error('BLE Exception: ' + event.message);
            }
          });

          return () => subscription.remove();
        },

        checkNearByDevicesPermission: () => callback => {
          checkMultiple([
            PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
            PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          ])
            .then(response => {
              if (
                response[PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE] ===
                  RESULTS.GRANTED &&
                response[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] ===
                  RESULTS.GRANTED
              ) {
                callback(model.events.NEARBY_ENABLED());
              } else {
                callback(model.events.NEARBY_DISABLED());
              }
            })
            .catch(err => {
              callback(model.events.NEARBY_DISABLED());
            });
        },

        requestNearByDevicesPermission: () => callback => {
          requestMultiple([
            PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
            PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          ])
            .then(response => {
              if (
                response[PERMISSIONS.ANDROID.BLUETOOTH_SCAN] ===
                  RESULTS.GRANTED &&
                response[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] ===
                  RESULTS.GRANTED
              ) {
                callback(model.events.NEARBY_ENABLED());
              } else {
                callback(model.events.NEARBY_DISABLED());
              }
            })
            .catch(err => {
              callback(model.events.NEARBY_DISABLED());
            });
        },

        checkLocationPermission: () => callback => {
          checkLocationPermissionStatus(
            () => callback(model.events.LOCATION_ENABLED()),
            () => callback(model.events.LOCATION_DISABLED()),
          );
        },
        checkLocationStatus: () => callback => {
          return checkLocationService(
            () => callback(model.events.LOCATION_ENABLED()),
            () => callback(model.events.LOCATION_DISABLED()),
          );
        },

        startConnection: context => callback => {
          wallet.startConnection(context.openId4VpUri);
          const statusCallback = (event: WalletDataEvent) => {
            if (event.type === EventTypes.onSecureChannelEstablished) {
              callback({type: 'CONNECTED'});
            }
          };

          const subscription = subscribe(statusCallback);
          return () => subscription?.remove();
        },

        sendVc: context => callback => {
          const vp = context.createdVp;
          const vc = {
            ...(vp != null ? vp : context.selectedVc),
          };

          const statusCallback = (event: WalletDataEvent) => {
            if (event.type === EventTypes.onDataSent) {
              callback({type: 'VC_SENT'});
            } else if (event.type === EventTypes.onVerificationStatusReceived) {
              callback({
                type:
                  event.status === VerificationStatus.ACCEPTED
                    ? 'VC_ACCEPTED'
                    : 'VC_REJECTED',
              });
            }
          };
          wallet.sendData(
            JSON.stringify({
              ...vc,
            }),
          );
          const subscription = subscribe(statusCallback);
          return () => subscription?.remove();
        },

        disconnect: () => () => {
          try {
            wallet.disconnect();
          } catch (e) {
            // pass
          }
        },

        createVp: context => async () => {
          // const verifiablePresentation = await createVerifiablePresentation(...);

          const verifiablePresentation: VerifiablePresentation = {
            '@context': [''],
            proof: null,
            type: 'VerifiablePresentation',
            verifiableCredential: [context.selectedVc.verifiableCredential],
          };

          const vc: VC = {
            ...context.selectedVc,
            verifiableCredential: null,
            verifiablePresentation,
          };

          return Promise.resolve(vc);
        },

        checkStorageAvailability: () => async () => {
          return Promise.resolve(
            Storage.isMinimumLimitReached('minStorageRequiredForAuditEntry'),
          );
        },
      },

      guards: {
        showFaceAuthConsentScreen: context => {
          return context.showFaceAuthConsent;
        },

        // sample: 'OPENID4VP://connect:?name=OVPMOSIP&key=69dc92a2cc91f02258aa8094d6e2b62877f5b6498924fbaedaaa46af30abb364'
        isOpenIdQr: (_context, event) =>
          event.params.startsWith('OPENID4VP://'),

        isQrLogin: (context, event) => {
          try {
            let linkCode = new URL(event.params);
            // sample: 'inji://landing-page-name?linkCode=sTjp0XVH3t3dGCU&linkExpireDateTime=2023-11-09T06:56:18.482Z'
            return linkCode.searchParams.get('linkCode') !== null;
          } catch (e) {
            return false;
          }
        },

        uptoAndroid11: () => isAndroid() && androidVersion < 31,

        isIOS: () => isIOS(),

        isMinimumStorageRequiredForAuditEntryReached: (_context, event) =>
          Boolean(event.data),

        isFlowTypeMiniViewShareWithSelfie: context =>
          context.flowType === VCShareFlowType.MINI_VIEW_SHARE_WITH_SELFIE,

        isFlowTypeMiniViewShare: context =>
          context.flowType === VCShareFlowType.MINI_VIEW_SHARE,

        isFlowTypeSimpleShare: context =>
          context.flowType === VCShareFlowType.SIMPLE_SHARE,
      },

      delays: {
        DESTROY_TIMEOUT: 500,
        CONNECTION_TIMEOUT: 5 * 1000,
        SHARING_TIMEOUT: 15 * 1000,
      },
    },
  );

type State = StateFrom<typeof scanMachine>;

export function createScanMachine(serviceRefs: AppServices) {
  return scanMachine.withContext({
    ...scanMachine.context,
    serviceRefs,
  });
}

export function selectIsMinimumStorageRequiredForAuditEntryLimitReached(
  state: State,
) {
  return state.matches('restrictSharingVc');
}

export function selectIsFaceVerificationConsent(state: State) {
  return state.matches('reviewing.faceVerificationConsent');
}
