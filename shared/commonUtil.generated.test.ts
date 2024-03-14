import {useState} from 'react';
import testIDProps, {
  bytesToMB,
  faceMatchConfig,
  generateBackupEncryptionKey,
  generateRandomString,
  getBackupFileName,
  getDriveName,
  getMaskedText,
  getScreenHeight,
  hashData,
  logState,
  removeWhiteSpace,
  sleep,
} from './commonUtil';
import {argon2iConfig} from './constants';
import React from 'react';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn(),
}));

useState.mockReturnValue([0, jest.fn()]);

const mockUseEffect = jest.spyOn(React, 'useEffect');

// Set up a mock implementation for useEffect
mockUseEffect.mockImplementation(() => {});

describe('hashData', () => {
  it('should expose a function', () => {
    expect(hashData).toBeDefined();
  });

  it('hashData should return hashed string', async () => {
    const hashedData = await hashData('1234567890', '1600', argon2iConfig);
    expect(hashedData).toBe('mockedRawHashValue');
  });
});

describe('generateRandomString', () => {
  it('should expose a function', () => {
    expect(generateRandomString).toBeDefined();
  });

  it('generateRandomString should return random string', async () => {
    const RandomString = await generateRandomString();
    expect(typeof RandomString).toBe('string');
  });
});

describe('generateBackupEncryptionKey', () => {
  it('should expose a function', () => {
    expect(generateBackupEncryptionKey).toBeDefined();
  });

  it('generateBackupEncryptionKey should return Encrypted key', async () => {
    const BackupEncryptionKey = generateBackupEncryptionKey(
      '1234567890',
      '123445',
      5,
      16,
    );
    expect(typeof BackupEncryptionKey).toBe('string');
  });
});

describe('testIDProps', () => {
  it('should expose a function', () => {
    expect(testIDProps).toBeDefined();
  });

  it('testIDProps should return expected output', () => {
    const id = 'test id props';
    const testID = testIDProps(id);
    expect(typeof testID).toBe('object');
  });
});

describe('removeWhiteSpace', () => {
  it('should expose a function', () => {
    expect(removeWhiteSpace).toBeDefined();
  });

  it('removeWhiteSpace should return string with out white space', () => {
    const response = removeWhiteSpace('React native unit testing');
    expect(response).toBe('Reactnativeunittesting');
  });
});

describe('logState', () => {
  it('should expose a function', () => {
    expect(logState).toBeDefined();
  });

  // it('logState should return expected output', () => {
  //   const retValue = logState(state);
  //   expect(retValue).toBe(String);
  // });
});

describe('getMaskedText', () => {
  it('should expose a function', () => {
    expect(getMaskedText).toBeDefined();
  });

  it('getMaskedText should return expected output', () => {
    const id = '1234567890';
    const maskedTxt = getMaskedText(id);
    expect(maskedTxt).toBe('******7890');
  });
});

describe('faceMatchConfig', () => {
  it('should expose a function', () => {
    expect(faceMatchConfig).toBeDefined();
  });

  // it('faceMatchConfig should return expected output', () => {
  //   // const retValue = faceMatchConfig(resp);
  //   expect(false).toBeTruthy();
  // });
});

describe('getBackupFileName', () => {
  it('should expose a function', () => {
    expect(getBackupFileName).toBeDefined();
  });

  it('getBackupFileName should return expected output', () => {
    const FileName = getBackupFileName();
    expect(typeof FileName).toBe('string');
  });
});

describe('bytesToMB', () => {
  it('should expose a function', () => {
    expect(bytesToMB).toBeDefined();
  });

  it('bytesToMB should return expected output', () => {
    const value = bytesToMB(100);
    const BYTES_IN_MEGABYTE = 1000 * 1000;
    const megabytes = 100 / BYTES_IN_MEGABYTE;

    expect(value).toBe(Number(megabytes).toFixed(2));
  });
});

describe('getDriveName', () => {
  it('should expose a function', () => {
    expect(getDriveName).toBeDefined();
  });

  it('getDriveName should return expected output', () => {
    const driveName = getDriveName();
    expect(typeof driveName).toBe('string');
  });
});

describe('sleep', () => {
  it('should expose a function', () => {
    expect(sleep).toBeDefined();
  });

  // it('sleep should return expected output', () => {
  //   // const retValue = sleep(time);
  //   expect(false).toBeTruthy();
  // });
});

describe('getScreenHeight', () => {
  it('should expose a function', () => {
    expect(getScreenHeight).toBeDefined();
  });

  it('getScreenHeight should return screen height', () => {
    const height = getScreenHeight();
    expect(typeof height).toBe('object');
  });
});
