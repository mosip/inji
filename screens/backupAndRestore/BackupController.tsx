import {useSelector} from '@xstate/react';
import {useContext} from 'react';
import {
  BackupEvents,
  selectIsBackingUp,
  selectIsBackingUpSuccess,
  selectIsBackingUpFailure,
  selectIsBackupInprogress,
  selectBackupErrorReason,
  lastBackupDetails,
} from '../../machines/backupAndRestore/backup';
import {GlobalContext} from '../../shared/GlobalContext';

export function useBackupScreen() {
  const {appService} = useContext(GlobalContext);
  const backupService = appService.children.get('backup');

  return {
    lastBackupDetails: useSelector(backupService, lastBackupDetails),
    backupErrorReason: useSelector(backupService, selectBackupErrorReason),
    isBackingUp: useSelector(backupService, selectIsBackingUp),
    isBackingUpSuccess: useSelector(backupService, selectIsBackingUpSuccess),
    isBackingUpFailure: useSelector(backupService, selectIsBackingUpFailure),
    isBackupInProgress: useSelector(backupService, selectIsBackupInprogress),
    DATA_BACKUP: () => {
      backupService.send(BackupEvents.DATA_BACKUP());
    },
    OK: () => {
      backupService.send(BackupEvents.OK());
    },
    DISMISS: () => {
      backupService.send(BackupEvents.DISMISS());
    },
    FETCH_DATA: () => {
      backupService.send(BackupEvents.FETCH_DATA());
    },
    PASSWORD: () => {
      backupService.send(BackupEvents.PASSWORD());
    },
    SET_BASE_ENC_KEY: (key: string) => {
      backupService.send(BackupEvents.SET_BASE_ENC_KEY(key));
    },
    PHONE_NUMBER: () => {
      backupService.send(BackupEvents.PHONE_NUMBER());
    },
    SEND_OTP: () => {
      backupService.send(BackupEvents.SEND_OTP());
    },
    INPUT_OTP: (otp: string) => backupService.send(BackupEvents.INPUT_OTP(otp)),
  };
}
