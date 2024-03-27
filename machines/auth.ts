import {assign, ContextFrom, EventFrom, send, StateFrom} from 'xstate';
import {createModel} from 'xstate/lib/model';
import {downloadModel} from '../shared/api';
import {AppServices} from '../shared/GlobalContext';
import {StoreEvents, StoreResponseEvent} from './store';
import {generateSecureRandom} from 'react-native-securerandom';
import binaryToBase64 from 'react-native/Libraries/Utilities/binaryToBase64';

const model = createModel(
  {
    serviceRefs: {} as AppServices,
    passcode: '',
    passcodeSalt: '',
    biometrics: '',
    canUseBiometrics: false,
    selectLanguage: false,
    toggleFromSettings: false,
  },
  {
    events: {
      SETUP_PASSCODE: (passcode: string) => ({passcode}),
      SETUP_BIOMETRICS: (biometrics: string) => ({biometrics}),
      CHANGE_METHOD: (isToggleFromSettings: boolean) => ({
        isToggleFromSettings,
      }),
      LOGOUT: () => ({}),
      LOGIN: () => ({}),
      STORE_RESPONSE: (response?: unknown) => ({response}),
      SELECT: () => ({}),
      NEXT: () => ({}),
    },
  },
);

export const AuthEvents = model.events;

type SetupBiometricsEvent = EventFrom<typeof model, 'SETUP_BIOMETRICS'>;

export const authMachine = model.createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import('./auth.typegen').Typegen0,
    schema: {
      context: model.initialContext,
      events: {} as EventFrom<typeof model>,
    },
    id: 'auth',
    initial: 'init',
    states: {
      init: {
        entry: ['requestStoredContext'],
        on: {
          STORE_RESPONSE: [
            {
              cond: 'hasData',
              target: 'checkingAuth',
              actions: ['setContext'],
            },
            {target: 'savingDefaults'},
          ],
        },
      },
      savingDefaults: {
        entry: ['storeContext'],
        on: {
          STORE_RESPONSE: 'checkingAuth',
        },
      },
      checkingAuth: {
        always: [
          {cond: 'hasLanguageset', target: 'languagesetup'},
          {cond: 'hasPasscodeSet', target: 'unauthorized'},
          {cond: 'hasBiometricSet', target: 'unauthorized'},
          {target: 'settingUp'},
        ],
      },
      languagesetup: {
        on: {
          SELECT: {
            target: 'introSlider',
          },
        },
      },
      introSlider: {
        invoke: {
          src: 'generatePasscodeSalt',
          onDone: {
            actions: ['setPasscodeSalt', 'storeContext'],
          },
        },
        on: {
          NEXT: {
            target: 'settingUp',
          },
        },
      },
      settingUp: {
        on: {
          SETUP_PASSCODE: {
            target: 'authorized',
            actions: ['setPasscode', 'setLanguage', 'storeContext'],
          },
          SETUP_BIOMETRICS: {
            target: 'authorized',
            actions: ['setBiometrics', 'setLanguage', 'storeContext'],
          },
        },
      },
      unauthorized: {
        on: {
          LOGIN: 'authorized',
        },
      },
      authorized: {
        invoke: {
          src: 'downloadFaceSdkModel',
          onDone: {
            actions: ['storeContext'],
          },
        },
        on: {
          LOGOUT: 'unauthorized',
          SETUP_BIOMETRICS: {
            actions: ['setBiometrics', 'storeContext'],
          },
          CHANGE_METHOD: {
            actions: ['setIsToggleFromSettings'],
            target: 'settingUp',
          },
        },
      },
    },
  },
  {
    actions: {
      requestStoredContext: send(StoreEvents.GET('auth'), {
        to: context => context.serviceRefs.store,
      }),

      setIsToggleFromSettings: assign({
        toggleFromSettings: (_, event) => event.isToggleFromSettings,
      }),

      storeContext: send(
        context => {
          const {serviceRefs, toggleFromSettings, ...data} = context;
          return StoreEvents.SET('auth', data);
        },
        {to: context => context.serviceRefs.store},
      ),

      setContext: model.assign((_, event) => {
        const {serviceRefs, ...data} = event.response as ContextFrom<
          typeof model
        >;
        return data;
      }),

      setPasscode: model.assign({
        passcode: (_, event) => event.passcode,
      }),

      setBiometrics: model.assign({
        biometrics: (_, event: SetupBiometricsEvent) => event.biometrics,
      }),

      setLanguage: assign({
        selectLanguage: context => true,
      }),

      setPasscodeSalt: assign({
        passcodeSalt: (context, event) => {
          return event.data as string;
        },
      }),
    },

    services: {
      downloadFaceSdkModel: () => () => {
        downloadModel();
      },
      generatePasscodeSalt: () => async () => {
        const randomBytes = await generateSecureRandom(16);
        return binaryToBase64(randomBytes) as string;
      },
    },

    guards: {
      hasData: (_, event: StoreResponseEvent) => event.response != null,

      hasPasscodeSet: context => {
        return context.passcode !== '';
      },
      hasBiometricSet: context => {
        return context.biometrics !== '';
      },
      hasLanguageset: context => {
        return !context.selectLanguage;
      },
    },
  },
);

export function createAuthMachine(serviceRefs: AppServices) {
  return authMachine.withContext({
    ...authMachine.context,
    serviceRefs,
  });
}

type State = StateFrom<typeof authMachine>;

export function selectPasscode(state: State) {
  return state?.context?.passcode;
}

export function selectPasscodeSalt(state: State) {
  return state.context.passcodeSalt;
}

export function selectBiometrics(state: State) {
  return state?.context?.biometrics;
}

export function selectCanUseBiometrics(state: State) {
  return state?.context?.canUseBiometrics;
}

export function selectAuthorized(state: State) {
  return state.matches('authorized');
}

export function selectUnauthorized(state: State) {
  return state.matches('unauthorized');
}

export function selectSettingUp(state: State) {
  return state?.matches('settingUp');
}

export function selectLanguagesetup(state: State) {
  return state.matches('languagesetup');
}
export function selectIntroSlider(state: State) {
  return state.matches('introSlider');
}

export function selectIsBiometricToggleFromSettings(state: State) {
  if (state.matches('settingUp')) {
    return state.context.toggleFromSettings;
  }
  return false;
}
