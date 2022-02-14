import { createContext } from 'react';
import { ActorRefFrom, InterpreterFrom } from 'xstate';
import { activityLogMachine } from '../machines/activityLog';
import { appMachine } from '../machines/app';
import { authMachine } from '../machines/auth';
import { requestMachine } from '../machines/request';
import { scanMachine } from '../machines/scan';
import { settingsMachine } from '../machines/settings';
import { storeMachine } from '../machines/store';
import { vidMachine } from '../machines/vid';

export const GlobalContext = createContext({} as GlobalServices);

export interface GlobalServices {
  appService: InterpreterFrom<typeof appMachine>;
}

export interface AppServices {
  store: ActorRefFrom<typeof storeMachine>;
  auth: ActorRefFrom<typeof authMachine>;
  vid: ActorRefFrom<typeof vidMachine>;
  settings: ActorRefFrom<typeof settingsMachine>;
  activityLog: ActorRefFrom<typeof activityLogMachine>;
  request: ActorRefFrom<typeof requestMachine>;
  scan: ActorRefFrom<typeof scanMachine>;
}
