import { assign, ContextFrom, EventFrom, send, StateFrom } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { AppServices } from '../shared/GlobalContext';
import {
  APP_ID_DICTIONARY,
  APP_ID_LENGTH,
  HOST,
  SETTINGS_STORE_KEY,
} from '../shared/constants';
import { VCLabel } from '../types/vc';
import { StoreEvents } from './store';
import getAllConfigurations, {
  COMMON_PROPS_KEY,
} from '../shared/commonprops/commonProps';
import Storage from '../shared/storage';
import ShortUniqueId from 'short-unique-id';
import { __AppId } from '../shared/GlobalVariables';

const model = createModel(
  {
    serviceRefs: {} as AppServices,
    name: '',
    vcLabel: {
      singular: 'Card',
      plural: 'Cards',
    } as VCLabel,
    isBiometricUnlockEnabled: false,
    credentialRegistry: HOST,
    appId: null,
    credentialRegistryResponse: '' as string,
  },
  {
    events: {
      UPDATE_NAME: (name: string) => ({ name }),
      UPDATE_VC_LABEL: (label: string) => ({ label }),
      TOGGLE_BIOMETRIC_UNLOCK: (enable: boolean) => ({ enable }),
      STORE_RESPONSE: (response: unknown) => ({ response }),
      CHANGE_LANGUAGE: (language: string) => ({ language }),
      UPDATE_CREDENTIAL_REGISTRY: (credentialRegistry: string) => ({
        credentialRegistry,
      }),
      UPDATE_CREDENTIAL_REGISTRY_RESPONSE: (
        credentialRegistryResponse: string
      ) => ({
        credentialRegistryResponse: credentialRegistryResponse,
      }),
      CANCEL: () => ({}),
    },
  }
);

export const SettingsEvents = model.events;

export const settingsMachine = model.createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import('./settings.typegen').Typegen0,
    schema: {
      context: model.initialContext,
      events: {} as EventFrom<typeof model>,
    },
    id: 'settings',
    initial: 'init',
    states: {
      init: {
        entry: ['requestStoredContext'],
        on: {
          STORE_RESPONSE: [
            {
              cond: 'hasPartialData',
              target: 'idle',
              actions: ['setContext', 'updatePartialDefaults', 'storeContext'],
            },
            { cond: 'hasData', target: 'idle', actions: ['setContext'] },
            { target: 'storingDefaults' },
          ],
        },
      },
      storingDefaults: {
        entry: ['updateDefaults', 'storeContext'],
        on: {
          STORE_RESPONSE: 'idle',
        },
      },
      idle: {
        on: {
          TOGGLE_BIOMETRIC_UNLOCK: {
            actions: ['toggleBiometricUnlock', 'storeContext'],
          },
          UPDATE_NAME: {
            actions: ['updateName', 'storeContext'],
          },
          UPDATE_VC_LABEL: {
            actions: ['updateVcLabel', 'storeContext'],
          },
          UPDATE_CREDENTIAL_REGISTRY: {
            actions: ['resetCredentialRegistry'],
            target: 'resetInjiProps',
          },
          CANCEL: {
            actions: ['resetCredentialRegistry'],
          },
        },
      },
      resetInjiProps: {
        invoke: {
          src: 'resetInjiProps',
          onDone: {
            actions: [
              'updateCredentialRegistrySuccess',
              'updateCredentialRegistry',
              'storeContext',
            ],
            target: 'idle',
          },
          onError: {
            actions: ['updateCredentialRegistryResponse'],
            target: 'idle',
          },
        },
        on: {
          CANCEL: {
            actions: ['resetCredentialRegistry'],
            target: 'idle',
          },
        },
      },
    },
  },
  {
    actions: {
      requestStoredContext: send(StoreEvents.GET(SETTINGS_STORE_KEY), {
        to: (context) => context.serviceRefs.store,
      }),

      updateDefaults: model.assign({
        appId: () => {
          const appId = generateAppId();
          __AppId.setValue(appId);
          return appId;
        },
      }),

      updatePartialDefaults: model.assign({
        appId: (context) => context.appId || generateAppId(),
      }),

      storeContext: send(
        (context) => {
          const { serviceRefs, ...data } = context;
          return StoreEvents.SET(SETTINGS_STORE_KEY, data);
        },
        { to: (context) => context.serviceRefs.store }
      ),

      setContext: model.assign((context, event) => {
        const newContext = event.response as ContextFrom<typeof model>;
        __AppId.setValue(newContext.appId);
        return {
          ...context,
          ...newContext,
        };
      }),

      updateName: model.assign({
        name: (_, event) => event.name,
      }),

      updateVcLabel: model.assign({
        vcLabel: (_, event) => ({
          singular: event.label,
          plural: event.label + 's',
        }),
      }),
      updateCredentialRegistry: assign({
        credentialRegistry: (_context, event) => event.data.warningDomainName,
      }),

      updateCredentialRegistryResponse: assign({
        credentialRegistryResponse: () => 'error',
      }),

      updateCredentialRegistrySuccess: assign({
        credentialRegistryResponse: () => 'success',
      }),

      resetCredentialRegistry: model.assign({
        credentialRegistryResponse: () => '',
      }),

      toggleBiometricUnlock: model.assign({
        isBiometricUnlockEnabled: (_, event) => event.enable,
      }),
    },

    services: {
      resetInjiProps: async (context, event) => {
        try {
          await Storage.removeItem(COMMON_PROPS_KEY);
          return await getAllConfigurations(event.credentialRegistry);
        } catch (error) {
          console.log('Error from resetInjiProps ', error);
          throw error;
        }
      },
    },

    guards: {
      hasData: (_, event) => event.response != null,
      hasPartialData: (_, event) =>
        event.response != null && event.response.appId == null,
    },
  }
);

export function createSettingsMachine(serviceRefs: AppServices) {
  return settingsMachine.withContext({
    ...settingsMachine.context,
    serviceRefs,
  });
}

function generateAppId() {
  const shortUUID = new ShortUniqueId({
    length: APP_ID_LENGTH,
    dictionary: APP_ID_DICTIONARY,
  });
  return shortUUID.randomUUID();
}

type State = StateFrom<typeof settingsMachine>;

export function selectName(state: State) {
  return state.context.name;
}

export function selectAppId(state: State) {
  return state.context.appId;
}

export function selectVcLabel(state: State) {
  return state.context.vcLabel;
}

export function selectCredentialRegistry(state: State) {
  return state.context.credentialRegistry;
}
export function selectCredentialRegistryResponse(state: State) {
  return state.context.credentialRegistryResponse;
}

export function selectBiometricUnlockEnabled(state: State) {
  return state.context.isBiometricUnlockEnabled;
}
export function selectIsResetInjiProps(state: State) {
  return state.matches('resetInjiProps');
}
