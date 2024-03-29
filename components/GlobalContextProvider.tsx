import React from 'react';
import {useInterpret} from '@xstate/react';
import {appMachine} from '../machines/app';

import {GlobalContext} from '../shared/GlobalContext';
import {logState} from '../shared/commonUtil';

export const GlobalContextProvider: React.FC = props => {
  const appService = useInterpret(appMachine, {devTools: __DEV__});

  if (__DEV__) {
    appService.subscribe(logState);
  }

  return (
    <GlobalContext.Provider value={{appService}}>
      {props.children}
    </GlobalContext.Provider>
  );
};
