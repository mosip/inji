import argon2 from 'react-native-argon2';
import {AnyState} from 'xstate';
import {getDeviceNameSync} from 'react-native-device-info';
import {GOOGLE_DRIVE_NAME, ICLOUD_DRIVE_NAME, isAndroid} from './constants';
import {generateSecureRandom} from 'react-native-securerandom';
import forge from 'node-forge';
import {useState, useEffect} from 'react';
import {Dimensions, Keyboard} from 'react-native';

export const hashData = async (
  data: string,
  salt: string,
  config: Argon2iConfig,
): Promise<string> => {
  const result = await argon2(data, salt, config);
  return result.rawHash as string;
};

export const generateRandomString = async () => {
  const randomBytes = await generateSecureRandom(64);
  const randomString = randomBytes.reduce(
    (acc, byte) => acc + byte.toString(16).padStart(2, '0'),
    '',
  );
  return randomString;
};
export const generateBackupEncryptionKey = (
  password: string,
  salt: string,
  iterations: number,
  length: number,
) => forge.pkcs5.pbkdf2(password, salt, iterations, length);

export interface Argon2iConfig {
  iterations: number;
  memory: number;
  parallelism: number;
  hashLength: number;
  mode: string;
}

export default function testIDProps(id: string | undefined) {
  return isAndroid()
    ? {accessible: true, accessibilityLabel: id}
    : {testID: id};
}

export const removeWhiteSpace = (str: string) => {
  return str ? str.replace(/\s/g, '') : str;
};

export function logState(state: AnyState) {
  if (__DEV__) {
    const data = JSON.stringify(
      state.event,
      (key, value) => {
        if (key === 'type') return undefined;
        if (typeof value === 'string' && value.length >= 100) {
          return value.slice(0, 100) + '...';
        }
        return value;
      },
      2,
    );
    console.log(
      `[${getDeviceNameSync()}] ${state.machine?.id}: ${
        state.event.type
      } -> ${state.toStrings().pop()}\n${
        data.length > 300 ? data.slice(0, 300) + '...' : data
      }
      `,
    );
  }
}

export const getMaskedText = (id: string): string => {
  return '*'.repeat(id.length - 4) + id.slice(-4);
};

export const faceMatchConfig = (resp: string) => {
  return {
    withFace: {
      encoder: {
        tfModel: {
          path: resp + '/model.tflite',
          inputWidth: 160,
          inputHeight: 160,
          outputLength: 512,
          modelChecksum:
            '797b4d99794965749635352d55da38d4748c28c659ee1502338badee4614ed06',
        },
      },
      matcher: {
        threshold: 1,
      },
    },
  };
};

export const getBackupFileName = () => {
  return `backup_${Date.now()}`;
};

export const BYTES_IN_MEGABYTE = 1000 * 1000;

export const bytesToMB = (bytes: number): string => {
  if (bytes <= 0) {
    return '0';
  }

  const megabytes = bytes / BYTES_IN_MEGABYTE;
  return Number(megabytes).toFixed(2);
};

export const getDriveName = () =>
  isAndroid() ? GOOGLE_DRIVE_NAME : ICLOUD_DRIVE_NAME;

export function sleep(time = 1000) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export const getScreenHeight = () => {
  const {height} = Dimensions.get('window');
  const isSmallScreen = height < 600;

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      event => {
        const keyboardHeight = event.endCoordinates.height;
        setKeyboardHeight(keyboardHeight + 150);
      },
    );
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const screenHeight = Math.floor(height - keyboardHeight);

  return {isSmallScreen, screenHeight};
};
