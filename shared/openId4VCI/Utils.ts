import jwtDecode from 'jwt-decode';
import jose from 'node-jose';
import {isIOS} from '../constants';
import pem2jwk from 'simple-pem2jwk';
import {displayType, issuerType} from '../../machines/Issuers/IssuersMachine';
import getAllConfigurations, {CACHED_API} from '../api';

import i18next from 'i18next';
import {getJWT} from '../cryptoutil/cryptoUtil';
import i18n from '../../i18n';
import {
  CredentialWrapper,
  VerifiableCredential,
} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {
  BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS,
  DETAIL_VIEW_ADD_ON_FIELDS,
  getIdType,
  getCredentialTypes,
} from '../../components/VC/common/VCUtils';
import {getVerifiableCredential} from '../../machines/VerifiableCredential/VCItemMachine/VCItemSelectors';
import {vcVerificationBannerDetails} from '../../components/BannerNotificationContainer';
import {getErrorEventData, sendErrorEvent} from '../telemetry/TelemetryUtils';
import {TelemetryConstants} from '../telemetry/TelemetryConstants';

export const Protocols = {
  OpenId4VCI: 'OpenId4VCI',
  OTP: 'OTP',
};

export const Issuers = {
  MosipOtp: '',
  Mosip: 'Mosip',
};

export function getVcVerificationDetails(
  statusType,
  vcMetadata,
  verifiableCredential,
  wellknown: Object,
): vcVerificationBannerDetails {
  const idType = getIdType(
    wellknown,
    getCredentialTypes(getVerifiableCredential(verifiableCredential)),
  );
  return {
    statusType: statusType,
    vcType: idType,
    vcNumber: vcMetadata.displayId,
  };
}

export const ACTIVATION_NEEDED = [Issuers.Mosip, Issuers.MosipOtp];

export const isActivationNeeded = (issuer: string) => {
  return ACTIVATION_NEEDED.indexOf(issuer) !== -1;
};

export const Issuers_Key_Ref = 'OpenId4VCI_KeyPair';

export const getIdentifier = (context, credential: VerifiableCredential) => {
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

export const getCredentialRequestBody = async (
  proofJWT: string,
  credentialType: Array<string>,
) => {
  return {
    format: 'ldp_vc',
    credential_definition: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: credentialType,
    },
    proof: {
      proof_type: 'jwt',
      jwt: proofJWT,
    },
  };
};

export const updateCredentialInformation = (
  context,
  credential: VerifiableCredential,
): CredentialWrapper => {
  return {
    verifiableCredential: {
      ...credential,
      wellKnown: context.selectedIssuer['.well-known'],
      credentialTypes: credential.credential.type ?? ['VerifiableCredential'],
      issuerLogo: getDisplayObjectForCurrentLanguage(
        context.selectedIssuer.display,
      )?.logo,
    },
    identifier: getIdentifier(context, credential),
    generatedOn: new Date(),
    vcMetadata: context.vcMetadata || {},
  };
};

export const getDisplayObjectForCurrentLanguage = (
  display: [displayType],
): displayType => {
  const currentLanguage = i18next.language;
  const languageKey = Object.keys(display[0]).includes('language')
    ? 'language'
    : 'locale';
  let displayType = display.filter(
    obj => obj[languageKey] == currentLanguage,
  )[0];
  if (!displayType) {
    displayType = display.filter(obj => obj[languageKey] === 'en')[0];
  }
  return displayType;
};

export const constructAuthorizationConfiguration = (
  selectedIssuer: issuerType,
  supportedScope: string,
) => {
  return {
    issuer: selectedIssuer.credential_issuer,
    clientId: selectedIssuer.client_id,
    scopes: [supportedScope],
    additionalHeaders: selectedIssuer.additional_headers,
    redirectUrl: selectedIssuer.redirect_uri,
    additionalParameters: {ui_locales: i18n.language},
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
      'Exception occurred while constructing JWK from PEM : ' +
        publicKey +
        '  Exception is ',
      e,
    );
  }
};

export const getSelectedCredentialTypeDetails = (
  wellknown: any,
  vcCredentialTypes: Object[],
): Object => {
  for (let credential in wellknown.credential_configurations_supported) {
    const credentialDetails =
      wellknown.credential_configurations_supported[credential];

    if (
      JSON.stringify(credentialDetails.credential_definition.type) ===
      JSON.stringify(vcCredentialTypes)
    ) {
      return credentialDetails;
    }
  }
  console.error(
    'Selected credential type is not available in wellknown config supported credentials list',
  );
  sendErrorEvent(
    getErrorEventData(
      TelemetryConstants.FlowType.wellknownConfig,
      TelemetryConstants.ErrorId.mismatch,
      TelemetryConstants.ErrorMessage.wellknownConfigMismatch,
    ),
  );
  return {};
};

export const getCredentialIssuersWellKnownConfig = async (
  issuer: string,
  wellknown: string,
  vcCredentialTypes: Object[],
  defaultFields: string[],
) => {
  let fields: string[] = defaultFields;
  let credentialDetails: any;
  if (wellknown) {
    const response = await CACHED_API.fetchIssuerWellknownConfig(
      issuer,
      wellknown,
    );
    if (response) {
      credentialDetails = getSelectedCredentialTypeDetails(
        response,
        vcCredentialTypes,
      );
      if (Object.keys(credentialDetails).includes('order')) {
        fields = credentialDetails.order;
      } else {
        fields = Object.keys(
          credentialDetails.credential_definition.credentialSubject,
        );
      }
    }
  }
  return {
    wellknown: credentialDetails,
    fields: fields,
  };
};

export const getDetailedViewFields = async (
  issuer: string,
  wellknown: string,
  vcCredentialTypes: Object[],
  defaultFields: string[],
) => {
  let response = await getCredentialIssuersWellKnownConfig(
    issuer,
    wellknown,
    vcCredentialTypes,
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

export async function constructProofJWT(
  publicKey: string,
  privateKey: string,
  accessToken: string,
  selectedIssuer: issuerType,
): Promise<string> {
  const jwtHeader = {
    alg: 'RS256',
    jwk: await getJWK(publicKey),
    typ: 'openid4vci-proof+jwt',
  };
  const decodedToken = jwtDecode(accessToken);
  const jwtPayload = {
    iss: selectedIssuer.client_id,
    nonce: decodedToken.c_nonce,
    aud: selectedIssuer.credential_audience,
    iat: Math.floor(new Date().getTime() / 1000),
    exp: Math.floor(new Date().getTime() / 1000) + 18000,
  };

  return await getJWT(jwtHeader, jwtPayload, Issuers_Key_Ref, privateKey);
}
