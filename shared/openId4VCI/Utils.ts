import jwtDecode from 'jwt-decode';
import jose from 'node-jose';
import {isIOS} from '../constants';
import pem2jwk from 'simple-pem2jwk';
import {displayType, issuerType} from '../../machines/issuersMachine';
import getAllConfigurations from '../api';

import i18next from 'i18next';
import {getJWT} from '../cryptoutil/cryptoUtil';
import {CACHED_API} from '../api';
import i18n from '../../i18n';
import {CredentialWrapper, VerifiableCredential} from '../../types/VC/vc';
import {
  BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS,
  DETAIL_VIEW_ADD_ON_FIELDS,
} from '../../components/VC/common/VCUtils';

export const Protocols = {
  OpenId4VCI: 'OpenId4VCI',
  OTP: 'OTP',
};

export const Issuers = {
  Mosip: '',
  Sunbird: 'Sunbird',
  ESignet: 'ESignet',
};

/**
 * @param issuer of the VC as per the VC metadata in MMKV
 * @returns the ID-type to be used for further translation
 *
 * NOTE: This might be replaced by a more standards compliant way later.
 */
export function getIdType(issuer: string | undefined): string {
  if (issuer === '' || issuer === Issuers.ESignet) {
    return 'nationalCard';
  }
  return 'insuranceCard';
}

export const ID_TYPE = {
  MOSIPVerifiableCredential: i18n.t('VcDetails:nationalCard'),
  InsuranceCredential: i18n.t('VcDetails:insuranceCard'),
  OpenG2PBeneficiaryVerifiableCredential: i18n.t('VcDetails:beneficiaryCard'),
  OpenG2PRegistryVerifiableCredential: i18n.t('VcDetails:socialRegistryCard'),
};

export const getIDType = (verifiableCredential: VerifiableCredential) => {
  return ID_TYPE[verifiableCredential.type[1]];
};

export const ACTIVATION_NEEDED = [Issuers.ESignet, Issuers.Mosip];

export const isActivationNeeded = (issuer: string) => {
  return ACTIVATION_NEEDED.indexOf(issuer) !== -1;
};

export const Issuers_Key_Ref = 'OpenId4VCI_KeyPair';

export const getIdentifier = (context, credential) => {
  const credentialIdentifier = credential.credential.id;
  const credId = credentialIdentifier.startsWith('did')
    ? credentialIdentifier.split(':')
    : credentialIdentifier.split('/');
  return (
    context.selectedIssuer.credential_issuer +
    ':' +
    context.selectedIssuer.protocol +
    ':' +
    credId[credId.length - 1]
  );
};

export const getBody = async context => {
  const header = {
    alg: 'RS256',
    jwk: await getJWK(context.publicKey),
    typ: 'openid4vci-proof+jwt',
  };
  const decodedToken = jwtDecode(context.tokenResponse.accessToken);
  const payload = {
    iss: context.selectedIssuer.client_id,
    nonce: decodedToken.c_nonce,
    aud: context.selectedIssuer.credential_audience,
    iat: Math.floor(new Date().getTime() / 1000),
    exp: Math.floor(new Date().getTime() / 1000) + 18000,
  };

  const proofJWT = await getJWT(
    header,
    payload,
    Issuers_Key_Ref,
    context.privateKey,
  );
  return {
    format: 'ldp_vc',
    credential_definition: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: context.selectedIssuer?.credential_type
        ? context.selectedIssuer.credential_type
        : ['VerifiableCredential', 'MOSIPVerifiableCredential'],
    },
    proof: {
      proof_type: 'jwt',
      jwt: proofJWT,
    },
  };
};

export const updateCredentialInformation = (context, credential) => {
  let credentialWrapper: CredentialWrapper = {};
  credentialWrapper.verifiableCredential = credential;
  credentialWrapper.identifier = getIdentifier(context, credential);
  credentialWrapper.generatedOn = new Date();
  credentialWrapper.verifiableCredential.wellKnown =
    context.selectedIssuer['.well-known'];
  credentialWrapper.verifiableCredential.credentialTypes =
    context.selectedIssuer['credential_type'];
  // credentialWrapper.verifiableCredential.wellKnown =
  //   'https://esignet.collab.mosip.net/.well-known/openid-credential-issuer';
  credentialWrapper.verifiableCredential.issuerLogo =
    getDisplayObjectForCurrentLanguage(context.selectedIssuer.display)?.logo;
  credentialWrapper.vcMetadata = context.vcMetadata || {};
  return credentialWrapper;
};

export const updateVCmetadataOfCredentialWrapper = (
  context,
  credentialWrapper: CredentialWrapper,
) => {
  credentialWrapper.vcMetadata = context.vcMetadata;
  return credentialWrapper;
};

export const getDisplayObjectForCurrentLanguage = (
  display: [displayType],
): displayType => {
  const currentLanguage = i18next.language;
  let displayType = display.filter(obj => obj.language == currentLanguage)[0];
  if (!displayType) {
    displayType = display.filter(obj => obj.language == 'en')[0];
  }
  return displayType;
};

export const constructAuthorizationConfiguration = (
  selectedIssuer: issuerType,
) => {
  return {
    clientId: selectedIssuer.client_id,
    scopes: selectedIssuer.scopes_supported,
    additionalHeaders: selectedIssuer.additional_headers,
    redirectUrl: selectedIssuer.redirect_uri,
    serviceConfiguration: {
      authorizationEndpoint: selectedIssuer.authorization_endpoint,
      tokenEndpoint: selectedIssuer.token_endpoint,
    },
  };
};

export const getJWK = async publicKey => {
  try {
    let publicKeyJWKString;
    let publicKeyJWK;
    if (isIOS()) {
      publicKeyJWKString = await jose.JWK.asKey(publicKey, 'pem');
      publicKeyJWK = publicKeyJWKString.toJSON();
    } else {
      publicKeyJWK = await pem2jwk(publicKey);
    }
    return {
      ...publicKeyJWK,
      alg: 'RS256',
      use: 'sig',
    };
  } catch (e) {
    console.error(
      'Exception occured while constructing JWK from PEM : ' +
        publicKey +
        '  Exception is ',
      e,
    );
  }
};

export const getCredentialIssuersWellKnownConfig = async (
  issuer: string,
  wellknown: string,
  credentialTypes: Object[],
  defaultFields: string[],
) => {
  let fields: string[] = defaultFields;
  let response = null;
  if (wellknown) {
    response = await CACHED_API.fetchIssuerWellknownConfig(issuer, wellknown);
    if (!response) {
      fields = [];
    } else if (response?.credentials_supported[0].order) {
      fields = response?.credentials_supported[0].order;
    } else {
      const supportedCredentialTypes = credentialTypes.filter(
        type => type !== 'VerifiableCredential',
      );
      const selectedCredentialType = supportedCredentialTypes[0];

      response?.credentials_supported.filter(credential => {
        if (credential.id === selectedCredentialType) {
          fields = Object.keys(
            credential.credential_definition.credentialSubject,
          );
        }
      });
    }
  }
  return {
    wellknown: response,
    fields: fields,
  };
};

export const getDetailedViewFields = async (
  issuer: string,
  wellknown: string,
  credentialTypes: Object[],
  defaultFields: string[],
) => {
  let response = await getCredentialIssuersWellKnownConfig(
    issuer,
    wellknown,
    credentialTypes,
    defaultFields,
  );

  let updatedFieldsList = response.fields.concat(DETAIL_VIEW_ADD_ON_FIELDS);

  updatedFieldsList = removeBottomSectionFields(updatedFieldsList);

  return {
    wellknown: response.wellknown,
    fields: updatedFieldsList,
  };
};

export const removeBottomSectionFields = fields => {
  return fields.filter(
    fieldName =>
      !BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS.includes(fieldName) &&
      fieldName !== 'address',
  );
};

export const vcDownloadTimeout = async (): Promise<number> => {
  const response = await getAllConfigurations();

  return Number(response['openId4VCIDownloadVCTimeout']) || 30000;
};

// OIDCErrors is a collection of external errors from the OpenID library or the issuer
export enum OIDCErrors {
  OIDC_FLOW_CANCELLED_ANDROID = 'User cancelled flow',
  OIDC_FLOW_CANCELLED_IOS = 'org.openid.appauth.general error -3',

  INVALID_TOKEN_SPECIFIED = 'Invalid token specified',
  OIDC_CONFIG_ERROR_PREFIX = 'Config error',
}

// ErrorMessage is the type of error message shown in the UI
export enum ErrorMessage {
  NO_INTERNET = 'noInternetConnection',
  GENERIC = 'generic',
  REQUEST_TIMEDOUT = 'requestTimedOut',
  BIOMETRIC_CANCELLED = 'biometricCancelled',
}
