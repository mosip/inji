import {MMKVLoader} from 'react-native-mmkv-storage';
import getAllConfigurations from './api';
import {
  getFreeDiskStorageOldSync,
  getFreeDiskStorageSync,
} from 'react-native-device-info';
import SecureKeystore from '@mosip/secure-keystore';
import {
  decryptJson,
  encryptJson,
  HMAC_ALIAS,
  hmacSHA,
  isHardwareKeystoreExists,
} from './cryptoutil/cryptoUtil';
import {VCMetadata} from './VCMetadata';
import {
  androidVersion,
  isAndroid,
  MY_VCS_STORE_KEY,
  SETTINGS_STORE_KEY,
  ENOENT,
} from './constants';
import FileStorage, {
  getFilePath,
  getDirectorySize,
  vcDirectoryPath,
} from './fileStorage';
import {__AppId} from './GlobalVariables';
import {getErrorEventData, sendErrorEvent} from './telemetry/TelemetryUtils';
import {TelemetryConstants} from './telemetry/TelemetryConstants';
import {BYTES_IN_MEGABYTE} from './commonUtil';
import fileStorage from './fileStorage';
import {DocumentDirectoryPath, ReadDirItem} from 'react-native-fs';

export const MMKV = new MMKVLoader().initialize();

async function generateHmac(
  encryptionKey: string,
  data: string,
): Promise<string> {
  if (!isHardwareKeystoreExists) {
    return hmacSHA(encryptionKey, data);
  }
  return await SecureKeystore.generateHmacSha(HMAC_ALIAS, data);
}

class Storage {
  static exportData = async (encryptionKey: string) => {
    try {
      const completeBackupData = {};
      let dataFromDB: Record<string, any> = {};

      const allKeysInDB = await MMKV.indexer.strings.getKeys();
      const keysToBeExported = allKeysInDB.filter(key =>
        key.includes('CACHE_FETCH_ISSUER_WELLKNOWN_CONFIG_'),
      );
      keysToBeExported?.push(MY_VCS_STORE_KEY);

      const encryptedDataPromises = keysToBeExported.map(key =>
        MMKV.getItem(key),
      );
      const encryptedDataList = await Promise.all(encryptedDataPromises);
      for (let index = 0; index < keysToBeExported.length; index++) {
        const key = keysToBeExported[index];
        let encryptedData = encryptedDataList[index];
        if (encryptedData != null) {
          const decryptedData = await decryptJson(encryptionKey, encryptedData);
          dataFromDB[key] = JSON.parse(decryptedData);
        }
      }

      dataFromDB[MY_VCS_STORE_KEY].map(myVcMetadata => {
        myVcMetadata.isPinned = false;
      });

      completeBackupData['VC_Records'] = {};

      let vcKeys = allKeysInDB.filter(key => key.indexOf('VC_') === 0);
      for (let ind in vcKeys) {
        const key = vcKeys[ind];
        const vc = await this.getItem(key, encryptionKey);

        if (vc) {
          const decryptedVCData = await decryptJson(encryptionKey, vc);
          const deactivatedVC =
            removeWalletBindingDataBeforeBackup(decryptedVCData);
          completeBackupData['VC_Records'][key] = deactivatedVC;
        } else {
          dataFromDB.myVCs = dataFromDB.myVCs.filter(vcMetaData => {
            return (
              VCMetadata.fromVcMetadataString(vcMetaData).getVcKey() !== key
            );
          });
        }
      }
      completeBackupData['dataFromDB'] = dataFromDB;

      return completeBackupData;
    } catch (error) {
      sendErrorEvent(
        getErrorEventData(
          TelemetryConstants.FlowType.dataBackup,
          error.message,
          error.stack,
        ),
      );
      console.error('exporting data is failed due to this error:', error);
      throw error;
    }
  };

  static loadBackupData = async (data, encryptionKey) => {
    try {
      // 0. check for previous backup states
      const prevBkpState = `${DocumentDirectoryPath}/.prev`;
      const previousBackupExists = await fileStorage.exists(prevBkpState);
      let previousRestoreTimestamp: string = '';
      if (previousBackupExists) {
        // 0. Remove partial restored files
        previousRestoreTimestamp = await fileStorage.readFile(prevBkpState);
        previousRestoreTimestamp = previousRestoreTimestamp.trim();
        this.unloadVCs(encryptionKey, parseInt(previousRestoreTimestamp));
      }
      // 1. opening the file
      const completeBackupData = JSON.parse(data);
      // 2. Load and store VC_records & MMKV things
      const backupStartState = Date.now().toString();
      // record the state to help with cleanup activities post partial backup
      await fileStorage.writeFile(prevBkpState, backupStartState);
      const dataFromDB = await Storage.loadVCs(
        completeBackupData,
        encryptionKey,
      );
      // 3. Update the Well Known configs of the VCs
      const allKeysFromDB = Object.keys(dataFromDB);
      const cacheKeys = allKeysFromDB.filter(key =>
        key.includes('CACHE_FETCH_ISSUER_WELLKNOWN_CONFIG_'),
      );
      cacheKeys.forEach(async key => {
        const value = dataFromDB[key];
        const encryptedValue = await encryptJson(
          encryptionKey,
          JSON.stringify(value),
        );
        await this.setItem(key, encryptedValue, encryptionKey);
        return true;
      });
    } catch (error) {
      return error;
    }
  };
  static isVCStorageInitialised = async (): Promise<boolean> => {
    try {
      const res = await FileStorage.getInfo(vcDirectoryPath);
      return res.isDirectory();
    } catch (_) {
      return false;
    }
  };

  static setItem = async (
    key: string,
    data: string,
    encryptionKey?: string,
  ) => {
    try {
      const isSavingVC = VCMetadata.isVCKey(key);
      if (isSavingVC) {
        await this.storeVC(key, data);
        return await this.storeVcHmac(encryptionKey, data, key);
      }

      await MMKV.setItem(key, data);
    } catch (error) {
      console.error('Error Occurred while saving in Storage.', error);
      throw error;
    }
  };

  static getItem = async (key: string, encryptionKey?: string) => {
    try {
      const isVCKey = VCMetadata.isVCKey(key);

      if (isVCKey) {
        const data = await this.readVCFromFile(key);
        const isCorrupted = await this.isCorruptedVC(key, encryptionKey, data);

        if (isCorrupted) {
          sendErrorEvent(
            getErrorEventData(
              TelemetryConstants.FlowType.fetchData,
              TelemetryConstants.ErrorId.tampered,
              'VC is corrupted and will be deleted from storage',
            ),
          );
          console.debug(
            '[Inji-406]: VC is corrupted and will be deleted from storage',
          );
          console.debug('[Inji-406]: VC key: ', key);
          console.debug('[Inji-406]: is Data null', data === null);
        }

        return isCorrupted ? null : data;
      }

      return await MMKV.getItem(key);
    } catch (error) {
      const isVCKey = VCMetadata.isVCKey(key);

      if (isVCKey) {
        const isDownloaded = await this.isVCAlreadyDownloaded(
          key,
          encryptionKey,
        );

        if (isDownloaded && error.message.includes(ENOENT)) {
          sendErrorEvent(
            getErrorEventData(
              TelemetryConstants.FlowType.fetchData,
              TelemetryConstants.ErrorId.dataRetrieval,
              error.message,
            ),
          );
          throw new Error(ENOENT);
        }
      }
      sendErrorEvent(
        getErrorEventData(
          TelemetryConstants.FlowType.fetchData,
          TelemetryConstants.ErrorId.dataRetrieval,
          'Error Occurred while retrieving from Storage',
        ),
      );

      console.error('Error Occurred while retrieving from Storage.', error);
      throw error;
    }
  };

  /**
   * unloadVCs will remove a set of VCs against a particular time range
   *
   * @param cutOffTimestamp the timestamp of the VC backup start time to current time
   */
  private static async unloadVCs(encryptionKey: any, cutOffTimestamp: number) {
    try {
      // 1. Find the VCs in the inji directory which have the said timestamp
      const file: ReadDirItem[] = await fileStorage.getAllFilesInDirectory(
        `${DocumentDirectoryPath}/inji/VC/`,
      );
      const isGreaterThanEq = function (fName: string, ts: number): boolean {
        fName = fName.split('.')[0];
        const curr = fName.split('_')[1];
        return parseInt(curr) >= ts;
      };
      for (let i = 0; i < file.length; i++) {
        const f = file[i];
        if (isGreaterThanEq(f.name, cutOffTimestamp)) {
          await fileStorage.removeItem(f.path);
        }
      }
      // TODO: should this be done via the Store state machine to avoid popups?
      // 3. Remove the keys from MMKV which have the same timestamp
      let myVCsEnc = await MMKV.getItem(MY_VCS_STORE_KEY, encryptionKey);
      if (myVCsEnc !== null) {
        let mmkvVCs = await decryptJson(encryptionKey, myVCsEnc);
        let vcList: VCMetadata[] = JSON.parse(mmkvVCs);
        let newVCList: VCMetadata[] = [];
        vcList.forEach(d => {
          if (d.timestamp && parseInt(d.timestamp) < cutOffTimestamp) {
            newVCList.push(d);
          }
        });
        const finalVC = await encryptJson(
          encryptionKey,
          JSON.stringify(newVCList),
        );
        await MMKV.setItem(MY_VCS_STORE_KEY, finalVC);
      }
    } catch (e) {
      console.error('error while unloadVcs:', e);
      sendErrorEvent(
        getErrorEventData(
          TelemetryConstants.FlowType.dataRestore,
          TelemetryConstants.ErrorId.failure,
          e.message,
        ),
      );
    }
  }

  private static async loadVCs(completeBackupData: {}, encryptionKey: any) {
    try {
      const allVCs = completeBackupData['VC_Records'];
      const allVCKeys = Object.keys(allVCs);
      const dataFromDB = completeBackupData['dataFromDB'];
      // 0. Check for VC presense in the store
      // 1. store the VCs and the HMAC
      allVCKeys.forEach(async key => {
        let vc = allVCs[key];
        const ts = Date.now();
        const prevUnixTimeStamp = vc.vcMetadata.timestamp;
        vc.vcMetadata.timestamp = ts;
        dataFromDB.myVCs.forEach(myVcMetadata => {
          if (
            myVcMetadata.requestId === vc.vcMetadata.requestId &&
            myVcMetadata.timestamp === prevUnixTimeStamp
          ) {
            myVcMetadata.timestamp = ts;
          }
        });
        const updatedVcKey = new VCMetadata(vc.vcMetadata).getVcKey();
        const encryptedVC = await encryptJson(
          encryptionKey,
          JSON.stringify(vc),
        );
        const tmp = VCMetadata.fromVC(key);
        // Save the VC to disk
        await this.setItem(updatedVcKey, encryptedVC, encryptionKey);
      });
      // 2. Update myVCsKey
      const dataFromMyVCKey = dataFromDB[MY_VCS_STORE_KEY];
      const encryptedMyVCKeyFromMMKV = await MMKV.getItem(MY_VCS_STORE_KEY);
      let newDataForMyVCKey: VCMetadata[] = [];
      if (encryptedMyVCKeyFromMMKV != null) {
        const myVCKeyFromMMKV = await decryptJson(
          encryptionKey,
          encryptedMyVCKeyFromMMKV,
        );
        newDataForMyVCKey = [
          ...JSON.parse(myVCKeyFromMMKV),
          ...dataFromMyVCKey,
        ];
      } else {
        newDataForMyVCKey = dataFromMyVCKey;
      }
      const encryptedDataForMyVCKey = await encryptJson(
        encryptionKey,
        JSON.stringify(newDataForMyVCKey),
      );
      await this.setItem(
        MY_VCS_STORE_KEY,
        encryptedDataForMyVCKey,
        encryptionKey,
      );
      await fileStorage.removeItemIfExist(`${DocumentDirectoryPath}/.prev`);
      return dataFromDB;
    } catch (e) {
      console.error('error while loading Vcs:', e);
      sendErrorEvent(
        getErrorEventData(
          TelemetryConstants.FlowType.dataBackup,
          TelemetryConstants.ErrorId.failure,
          e.message,
        ),
      );
    }
  }

  private static async isVCAlreadyDownloaded(
    key: string,
    encryptionKey: string,
  ) {
    try {
      const storedHMACofCurrentVC = await this.readHmacForVC(
        key,
        encryptionKey,
      );
      return storedHMACofCurrentVC !== null;
    } catch (e) {
      throw e;
    }
  }

  private static async isCorruptedVC(
    key: string,
    encryptionKey: string,
    data: string,
  ) {
    // TODO: INJI-612 refactor
    try {
      const storedHMACofCurrentVC = await this.readHmacForDataCorruptionCheck(
        key,
        encryptionKey,
      );
      const HMACofVC = await generateHmac(encryptionKey, data);
      return HMACofVC !== storedHMACofCurrentVC;
    } catch (e) {
      throw e;
    }
  }

  private static async readHmacForVC(key: string, encryptionKey: string) {
    try {
      const encryptedHMACofCurrentVC = await MMKV.getItem(key);
      if (encryptedHMACofCurrentVC) {
        return decryptJson(encryptionKey, encryptedHMACofCurrentVC);
      }
      return null;
    } catch (e) {
      console.error('error while reading Hmac for VC ', e);
      throw e;
    }
  }

  private static async readHmacForDataCorruptionCheck(
    key: string,
    encryptionKey: string,
  ) {
    try {
      const encryptedHMACofCurrentVC = await MMKV.getItem(key);
      if (encryptedHMACofCurrentVC) {
        return decryptJson(encryptionKey, encryptedHMACofCurrentVC);
      }
      return null;
    } catch (e) {
      throw e;
    }
  }

  private static async readVCFromFile(key: string) {
    return await FileStorage.readFile(getFilePath(key));
  }

  private static async storeVC(key: string, data: string) {
    await FileStorage.createDirectory(vcDirectoryPath);
    const path = getFilePath(key);
    return await FileStorage.writeFile(path, data);
  }

  // TODO: INJI-612 refactor
  private static async storeVcHmac(
    encryptionKey: string,
    data: string,
    key: string,
  ) {
    const HMACofVC = await generateHmac(encryptionKey, data);
    const encryptedHMACofVC = await encryptJson(encryptionKey, HMACofVC);
    await MMKV.setItem(key, encryptedHMACofVC);
  }

  static removeItem = async (key: string) => {
    if (VCMetadata.isVCKey(key)) {
      const path = getFilePath(key);
      const isFileExists = await FileStorage.exists(path);
      if (isFileExists) {
        return await FileStorage.removeItem(path);
      } else {
        console.warn('file not exist`s');
      }
    }
    MMKV.removeItem(key);
  };

  static clear = async () => {
    try {
      (await FileStorage.exists(`${vcDirectoryPath}`)) &&
        (await FileStorage.removeItem(`${vcDirectoryPath}`));
      const settings = await MMKV.getItem(SETTINGS_STORE_KEY);
      const appId = JSON.parse(settings).appId;
      __AppId.setValue(appId);
      MMKV.clearStore();
      await MMKV.setItem(SETTINGS_STORE_KEY, JSON.stringify({appId: appId}));
    } catch (e) {
      console.error('Error Occurred while Clearing Storage.', e);
    }
  };

  static isMinimumLimitReached = async (limitInMB: string) => {
    const configurations = await getAllConfigurations();
    if (!configurations[limitInMB]) return false;

    const minimumStorageLimitInBytes =
      configurations[limitInMB] * BYTES_IN_MEGABYTE;

    const freeDiskStorageInBytes =
      isAndroid() && androidVersion < 29
        ? getFreeDiskStorageOldSync()
        : getFreeDiskStorageSync();


    return freeDiskStorageInBytes <= minimumStorageLimitInBytes;
  };
}

export default Storage;

function removeWalletBindingDataBeforeBackup(data: string) {
  const vcData = JSON.parse(data);
  vcData.walletBindingResponse = null;
  vcData.publicKey = null;
  vcData.privateKey = null;
  return vcData;
}

export async function isMinimumLimitForBackupReached() {
  try {
    const directorySize = await getDirectorySize(vcDirectoryPath);
    const freeDiskStorageInBytes =
      isAndroid() && androidVersion < 29
        ? getFreeDiskStorageOldSync()
        : getFreeDiskStorageSync();

    return freeDiskStorageInBytes <= 2 * directorySize;
  } catch (error) {
    console.error('Error in isMinimumLimitForBackupReached:', error);
    throw error;
  }
}

export async function isMinimumLimitForBackupRestorationReached() {
  // TODO: Have two checks, one for downloading the ZIP file from the cloud &
  //  then by looking at it's metadata to check it's expanded size
  // APIs:
  // 1. CloudStorage.stat(file, context)
  // 2. getUncompressedSize()
  return await Storage.isMinimumLimitReached('minStorageRequired');
}
