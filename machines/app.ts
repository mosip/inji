import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import {
  getDeviceId,
  getDeviceName,
  getDeviceNameSync,
} from 'react-native-device-info';
import { EventFrom, spawn, StateFrom } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { authMachine, createAuthMachine } from './auth';
import { createSettingsMachine, settingsMachine } from './settings';
import { storeMachine } from './store';
import { createVidMachine, vidMachine } from './vid';
import { createActivityLogMachine, activityLogMachine } from './activityLog';
import { createRequestMachine, requestMachine } from './request';
import { createScanMachine, scanMachine } from './scan';
import { respond } from 'xstate/lib/actions';
import { AppServices } from '../shared/GlobalContext';

const model = createModel(
  {
    info: {} as AppInfo,
    serviceRefs: {} as AppServices,
  },
  {
    events: {
      ACTIVE: () => ({}),
      INACTIVE: () => ({}),
      OFFLINE: () => ({}),
      ONLINE: (networkType: NetInfoStateType) => ({ networkType }),
      REQUEST_DEVICE_INFO: () => ({}),
      READY: (data?: unknown) => ({ data }),
      APP_INFO_RECEIVED: (info: AppInfo) => ({ info }),
    },
  }
);

type AppInfoReceived = EventFrom<typeof model, 'APP_INFO_RECEIVED'>;

export const appMachine = model.createMachine(
  {
    id: 'app',
    context: model.initialContext,
    initial: 'init',
    states: {
      init: {
        initial: 'store',
        states: {
          store: {
            entry: ['spawnStoreActor', 'logStoreEvents'],
            on: {
              READY: 'services',
            },
          },
          // TODO: SafetyNet Attestation check
          // safetyNet: {
          //   invoke: {
          //     id: 'safetynet',
          //     src: safetyNetMachine
          //   },
          // },
          services: {
            entry: ['spawnServiceActors', 'logServiceEvents'],
            on: {
              READY: 'info',
            },
          },
          info: {
            invoke: {
              src: 'getAppInfo',
            },
            on: {
              APP_INFO_RECEIVED: {
                target: '#ready',
                actions: ['setAppInfo'],
              },
            },
          },
        },
      },
      ready: {
        id: 'ready',
        type: 'parallel',
        on: {
          REQUEST_DEVICE_INFO: {
            actions: ['requestDeviceInfo'],
          },
        },
        states: {
          focus: {
            invoke: {
              src: 'checkFocusState',
            },
            on: {
              ACTIVE: '.active',
              INACTIVE: '.inactive',
            },
            initial: 'checking',
            states: {
              checking: {},
              active: {},
              inactive: {},
            },
          },
          network: {
            invoke: {
              src: 'checkNetworkState',
            },
            on: {
              ONLINE: '.online',
              OFFLINE: '.offline',
            },
            initial: 'checking',
            states: {
              checking: {},
              online: {},
              offline: {},
            },
          },
        },
      },
    },
  },
  {
    actions: {
      requestDeviceInfo: respond((context) => ({
        type: 'RECEIVE_DEVICE_INFO',
        info: {
          ...context.info,
          name: context.serviceRefs.settings.getSnapshot().context.name,
        },
      })),

      spawnStoreActor: model.assign({
        serviceRefs: (context) => ({
          ...context.serviceRefs,
          store: spawn(storeMachine, storeMachine.id),
        }),
      }),

      logStoreEvents: (context) => {
        context.serviceRefs.store.subscribe(logState);
      },

      spawnServiceActors: model.assign({
        serviceRefs: (context) => {
          const serviceRefs = {
            ...context.serviceRefs,
          };
          serviceRefs.auth = spawn(
            createAuthMachine(serviceRefs),
            authMachine.id
          );
          serviceRefs.vid = spawn(createVidMachine(serviceRefs), vidMachine.id);
          serviceRefs.settings = spawn(
            createSettingsMachine(serviceRefs),
            settingsMachine.id
          );
          serviceRefs.activityLog = spawn(
            createActivityLogMachine(serviceRefs),
            activityLogMachine.id
          );
          serviceRefs.scan = spawn(
            createScanMachine(serviceRefs),
            scanMachine.id
          );
          serviceRefs.request = spawn(
            createRequestMachine(serviceRefs),
            requestMachine.id
          );
          return serviceRefs;
        },
      }),

      logServiceEvents: (context) => {
        context.serviceRefs.auth.subscribe(logState);
        context.serviceRefs.vid.subscribe(logState);
        context.serviceRefs.settings.subscribe(logState);
        context.serviceRefs.activityLog.subscribe(logState);
        context.serviceRefs.scan.subscribe(logState);
        context.serviceRefs.request.subscribe(logState);
      },

      setAppInfo: model.assign({
        info: (_, event: AppInfoReceived) => event.info,
      }),
    },

    services: {
      getAppInfo: () => async (callback) => {
        const appInfo = {
          deviceId: getDeviceId(),
          deviceName: await getDeviceName(),
        };

        callback(model.events.APP_INFO_RECEIVED(appInfo));
      },

      checkFocusState: () => (callback) => {
        const handler = (newState: AppStateStatus) => {
          switch (newState) {
            case 'background':
            case 'inactive':
              callback({ type: 'INACTIVE' });
              break;
            case 'active':
              callback({ type: 'ACTIVE' });
              break;
          }
        };

        AppState.addEventListener('change', handler);

        return () => AppState.removeEventListener('change', handler);
      },

      checkNetworkState: () => (callback) => {
        const unsubscribe = NetInfo.addEventListener((state) => {
          if (state.isConnected) {
            callback({ type: 'ONLINE', networkType: state.type });
          } else {
            callback({ type: 'OFFLINE' });
          }
        });

        return unsubscribe;
      },
    },
  }
);

interface AppInfo {
  deviceId: string;
  deviceName: string;
}

type State = StateFrom<typeof appMachine>;

export function selectAppInfo(state: State) {
  return state.context.info;
}

export function selectIsReady(state: State) {
  return state.matches('ready');
}

export function selectIsOnline(state: State) {
  return state.matches('ready.network.online');
}

export function selectIsActive(state: State) {
  return state.matches('ready.focus.active');
}

export function logState(state) {
  const data = JSON.stringify(state.event);
  console.log(
    `[${getDeviceNameSync()}] ${state.machine.id}: ${state
      .toStrings()
      .join(' ')} ${data.length > 1000 ? data.slice(0, 1000) + '...' : data}`
  );
}
