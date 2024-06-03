import {
  VC,
  VcIdType,
  VCMetadataType,
} from '../machines/VerifiableCredential/VCMetaMachine/vc';
import {
  getSelectedCredentialType,
  Issuers,
  Protocols,
} from './openId4VCI/Utils';
import {getMosipIdentifier} from './commonUtil';
import {getVerifiableCredential} from '../machines/VerifiableCredential/VCItemMachine/VCItemSelectors';

const VC_KEY_PREFIX = 'VC';
const VC_ITEM_STORE_KEY_REGEX = '^VC_[a-zA-Z0-9_-]+$';

export class VCMetadata {
  static vcKeyRegExp = new RegExp(VC_ITEM_STORE_KEY_REGEX);
  idType: VcIdType | string = '';
  requestId = '';
  isPinned = false;
  id: string = '';
  displayId: string = '';
  issuer?: string = '';
  protocol?: string = '';
  timestamp?: string = '';
  isVerified: boolean = false;
  credentialType: string[] = [];

  constructor({
    idType = '',
    requestId = '',
    isPinned = false,
    id = '',
    issuer = '',
    protocol = '',
    timestamp = '',
    isVerified = false,
    credentialType = [],
  } = {}) {
    this.idType = idType;
    this.requestId = requestId;
    this.isPinned = isPinned;
    this.id = id;
    this.displayId = id;
    this.protocol = protocol;
    this.issuer = issuer;
    this.timestamp = timestamp;
    this.isVerified = isVerified;
    this.credentialType = credentialType;
  }

  //TODO: Remove any typing and use appropriate typing
  static fromVC(vc: Partial<VC> | VCMetadata | any) {
    return new VCMetadata({
      idType: vc.idType,
      requestId: vc.requestId,
      isPinned: vc.isPinned || false,
      id: vc.id,
      protocol: vc.protocol,
      issuer: vc.issuer,
      timestamp: vc.vcMetadata ? vc.vcMetadata.timestamp : vc.timestamp,
      isVerified: vc.isVerified,
      credentialType: vc.vcMetadata
        ? vc.vcMetadata.credentialType
        : vc.credentialType
        ? vc.credentialType
        : getVerifiableCredential(vc.verifiableCredential).type[1],
    });
  }

  static fromVcMetadataString(vcMetadataStr: string | object) {
    try {
      if (typeof vcMetadataStr === 'object')
        return new VCMetadata(vcMetadataStr);
      return new VCMetadata(JSON.parse(vcMetadataStr));
    } catch (e) {
      console.error('Failed to parse VC Metadata', e);
      return new VCMetadata();
    }
  }

  static isVCKey(key: string): boolean {
    return VCMetadata.vcKeyRegExp.exec(key) != null;
  }

  isFromOpenId4VCI() {
    return this.protocol === Protocols.OpenId4VCI;
  }

  // Used for mmkv storage purposes and as a key for components and vc maps
  // Update VC_ITEM_STORE_KEY_REGEX in case of changes in vckey
  getVcKey(): string {
    return this.timestamp !== ''
      ? `${VC_KEY_PREFIX}_${this.timestamp}_${this.requestId}`
      : `${VC_KEY_PREFIX}_${this.requestId}`;
  }

  equals(other: VCMetadata): boolean {
    return this.getVcKey() === other.getVcKey();
  }
}

export function parseMetadatas(metadataStrings: object[]) {
  return metadataStrings.map(o => new VCMetadata(o));
}

export const getVCMetadata = (context: object) => {
  const [issuer, protocol, credentialId] =
    context.credentialWrapper?.identifier.split(':');

  console.log(
    '#####context.verifiableCredential?.credential: ',
    context.verifiableCredential?.credential,
  );
  console.log(
    '#####context.verifiableCredential?.type: ',
    context.verifiableCredential?.credential.type,
  );
  return VCMetadata.fromVC({
    requestId: credentialId ?? null,
    issuer: issuer,
    protocol: protocol,
    id:
      context.verifiableCredential?.credential.credentialSubject.policyNumber ||
      getMosipIdentifier(
        context.verifiableCredential?.credential.credentialSubject,
      ),
    timestamp: context.timestamp ?? '',
    isVerified: context.vcMetadata.isVerified ?? false,
    credentialType: getSelectedCredentialType(
      context.verifiableCredential?.credential,
    ),
  });
};
