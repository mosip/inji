import {KeyPair, RSA} from 'react-native-rsa-native';
import forge from 'node-forge';
import {BIOMETRIC_CANCELLED, DEBUG_MODE_ENABLED, isIOS} from '../constants';
import SecureKeystore from '@mosip/secure-keystore';
import {BiometricCancellationError} from '../error/BiometricCancellationError';
import {EncryptedOutput} from './encryptedOutput';
import {Buffer} from 'buffer';

// 5min
export const AUTH_TIMEOUT = 5 * 60;
export const ENCRYPTION_ID = 'c7c22a6c-9759-4605-ac88-46f4041d863d';
export const HMAC_ALIAS = '860cc320-4248-11ee-be56-0242ac120002';
//This key is used to request biometric at app open to reset auth timeout which is used by encryption key
export const DUMMY_KEY_FOR_BIOMETRIC_ALIAS =
  '9a6cfc0e-4248-11ee-be56-0242ac120002';

export function generateKeys(): Promise<KeyPair> {
  return Promise.resolve(RSA.generateKeys(4096));
}

/**
 * isCustomKeystore is a cached check of existence of a hardware keystore.
 */
export const isHardwareKeystoreExists = isCustomSecureKeystore();

export async function getJWT(
  header: object,
  payLoad: object,
  individualId: string,
  privateKey: string,
) {
  try {
    const header64 = encodeB64(JSON.stringify(header));
    const payLoad64 = encodeB64(JSON.stringify(payLoad));
    const preHash = header64 + '.' + payLoad64;
    const signature64 = await createSignature(
      privateKey,
      preHash,
      individualId,
    );
    return header64 + '.' + payLoad64 + '.' + signature64;
  } catch (e) {
    console.error('Exception Occurred While Constructing JWT ', e);
    throw e;
  }
}

export async function createSignature(
  privateKey: string,
  preHash: string,
  individualId: string,
) {
  let signature64;

  if (!isHardwareKeystoreExists) {
    const key = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(preHash, 'utf8');

    const signature = key.sign(md);
    return encodeB64(signature);
  } else {
    try {
      signature64 = await SecureKeystore.sign(individualId, preHash);
    } catch (error) {
      console.error('Error in creating signature:', error);
      if (error.toString().includes(BIOMETRIC_CANCELLED)) {
        throw new BiometricCancellationError(error.toString());
      }
      throw error;
    }

    return replaceCharactersInB64(signature64);
  }
}

function replaceCharactersInB64(encodedB64: string) {
  return encodedB64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function encodeB64(str: string) {
  const encodedB64 = forge.util.encode64(str);
  return replaceCharactersInB64(encodedB64);
}

/**
 * DO NOT USE DIRECTLY and/or REPEATEDLY in application lifeycle.
 *
 * This can make a call to the Android native layer hence taking up more time,
 *  use the isCustomKeystore constant in the app lifeycle instead.
 */
function isCustomSecureKeystore() {
  return !isIOS() ? SecureKeystore.deviceSupportsHardware() : false;
}

export async function encryptJson(
  encryptionKey: string,
  data: string,
): Promise<string> {
  try {
    // Disable Encryption in debug mode
    if (DEBUG_MODE_ENABLED && __DEV__) {
      return JSON.stringify(data);
    }

    if (!isHardwareKeystoreExists) {
      return encryptWithForge(data, encryptionKey).toString();
    }
    const base64EncodedString = Buffer.from(data).toString('base64');
    return await SecureKeystore.encryptData(ENCRYPTION_ID, base64EncodedString);
  } catch (error) {
    console.error('error while encrypting:', error);
    if (error.toString().includes(BIOMETRIC_CANCELLED)) {
      throw new BiometricCancellationError(error.toString());
    }
    throw error;
  }
}

export async function decryptJson(
  encryptionKey: string,
  encryptedData: string,
): Promise<string> {
  try {
    if (encryptedData === null || encryptedData === undefined) {
      // to avoid crash in case of null or undefined
      return '';
    }
    // Disable Encryption in debug mode
    if (DEBUG_MODE_ENABLED && __DEV__) {
      return JSON.parse(encryptedData);
    }

    if (!isHardwareKeystoreExists) {
      return decryptWithForge(encryptedData, encryptionKey);
    }

    return await SecureKeystore.decryptData(ENCRYPTION_ID, encryptedData);
  } catch (e) {
    console.error('error decryptJson:', e);

    if (e.toString().includes(BIOMETRIC_CANCELLED)) {
      throw new BiometricCancellationError(e.toString());
    }
    throw e;
  }
}

function encryptWithForge(text: string, key: string): EncryptedOutput {
  //iv - initialization vector
  const iv = forge.random.getBytesSync(16);
  const salt = forge.random.getBytesSync(128);
  const encryptionKey = forge.pkcs5.pbkdf2(key, salt, 4, 16);
  const cipher = forge.cipher.createCipher('AES-CBC', encryptionKey);
  cipher.start({iv: iv});
  cipher.update(forge.util.createBuffer(text, 'utf8'));
  cipher.finish();
  var cipherText = forge.util.encode64(cipher.output.getBytes());
  const encryptedData = new EncryptedOutput(
    cipherText,
    forge.util.encode64(iv),
    forge.util.encode64(salt),
  );
  return encryptedData;
}

function decryptWithForge(encryptedData: string, key: string): string {
  const encryptedOutput = EncryptedOutput.fromString(encryptedData);
  const salt = forge.util.decode64(encryptedOutput.salt);
  const encryptionKey = forge.pkcs5.pbkdf2(key, salt, 4, 16);
  const decipher = forge.cipher.createDecipher('AES-CBC', encryptionKey);
  decipher.start({iv: forge.util.decode64(encryptedOutput.iv)});
  decipher.update(
    forge.util.createBuffer(forge.util.decode64(encryptedOutput.encryptedData)),
  );
  decipher.finish();
  const decryptedData = decipher.output.toString();
  return decryptedData;
}

export function hmacSHA(encryptionKey: string, data: string) {
  const hmac = forge.hmac.create();
  hmac.start('sha256', encryptionKey);
  hmac.update(data);
  const resultBytes = hmac.digest().getBytes().toString();
  return resultBytes;
}
