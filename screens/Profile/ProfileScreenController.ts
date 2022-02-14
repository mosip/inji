import { useSelector } from '@xstate/react';
import { useContext } from 'react';
import { AuthEvents, selectCanUseBiometrics } from '../../machines/auth';
import {
  selectBiometricUnlockEnabled,
  selectName,
  selectVidLabel,
  SettingsEvents,
} from '../../machines/settings';
import { MainRouteProps } from '../../routes/main';
import { GlobalContext } from '../../shared/GlobalContext';

export function useProfileScreen({ navigation }: MainRouteProps) {
  const { appService } = useContext(GlobalContext);
  const authService = appService.children.get('auth');
  const settingsService = appService.children.get('settings');

  return {
    name: useSelector(settingsService, selectName),
    vidLabel: useSelector(settingsService, selectVidLabel),
    isBiometricUnlockEnabled: useSelector(
      settingsService,
      selectBiometricUnlockEnabled
    ),
    canUseBiometrics: useSelector(authService, selectCanUseBiometrics),

    UPDATE_NAME: (name: string) =>
      settingsService.send(SettingsEvents.UPDATE_NAME(name)),

    UPDATE_VID_LABEL: (label: string) =>
      settingsService.send(SettingsEvents.UPDATE_VID_LABEL(label)),

    LOGOUT: () => {
      authService.send(AuthEvents.LOGOUT());
      navigation.navigate('Welcome');
    },
  };
}
