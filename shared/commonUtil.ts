import argon2 from 'react-native-argon2';
import {AnyState} from 'xstate';
import {getDeviceNameSync} from 'react-native-device-info';
import {isAndroid} from './constants';

export const hashData = async (
  data: string,
  salt: string,
  config: Argon2iConfig,
): Promise<string> => {
  const result = await argon2(data, salt, config);
  return result.rawHash as string;
};

export interface Argon2iConfig {
  iterations: number;
  memory: number;
  parallelism: number;
  hashLength: number;
  mode: string;
}

export default function testIDProps(id) {
  return isAndroid()
    ? {accessible: true, accessibilityLabel: id}
    : {testID: id};
}

export const removeWhiteSpace = (str: string) => {
  return str ? str.replace(/\s/g, '') : str;
};

export function logState(state: AnyState) {
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
    `[${getDeviceNameSync()}] ${state.machine.id}: ${
      state.event.type
    } -> ${state.toStrings().pop()}\n${
      data.length > 300 ? data.slice(0, 300) + '...' : data
    }
    `,
  );
}

export const getMaskedText = (id: string): string => {
  return '*'.repeat(id.length - 4) + id.slice(-4);
};
