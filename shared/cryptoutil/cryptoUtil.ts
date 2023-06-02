import { KeyPair, RSA } from 'react-native-rsa-native';
import forge from 'node-forge';
import getAllConfigurations from '../commonprops/commonProps';

export function generateKeys(): Promise<KeyPair> {
  return Promise.resolve(RSA.generateKeys(4096));
}

export async function getJwt(
  privateKey: string,
  individualId: string,
  thumbprint: string
) {
  var token: string = null;
  try {
    var iat = Math.floor(new Date().getTime() / 1000);
    var exp = Math.floor(new Date().getTime() / 1000) + 18000;

    var config = await getAllConfigurations();

    const key = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    const header = {
      'alg': 'RS256',
      //'kid': keyId,
      'x5t#S256': thumbprint,
    };
    var myJSON =
      '{"iss": "' +
      config.issuer +
      '", "aud": "' +
      config.audience +
      '", "sub": "' +
      individualId +
      '", "iat": ' +
      iat +
      ', "exp": ' +
      exp +
      '}';
    var payload = JSON.parse(myJSON);
    const strHeader = JSON.stringify(header);
    const strPayload = JSON.stringify(payload);
    const header64 = encodeB64(strHeader);
    const payload64 = encodeB64(strPayload);
    const preHash = header64 + '.' + payload64;
    md.update(preHash, 'utf8');
    const signature = key.sign(md);
    const signature64 = encodeB64(signature);
    var token: string = header64 + '.' + payload64 + '.' + signature64;
    return token;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

function encodeB64(str: string) {
  const encodedB64 = forge.util.encode64(str);
  return encodedB64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export interface WalletBindingResponse {
  walletBindingId: string;
  keyId: string;
  thumbprint: string;
  expireDateTime: string;
}
