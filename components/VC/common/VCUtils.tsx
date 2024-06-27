import {
  Credential,
  CredentialSubject,
  CredentialTypes,
  IssuerWellknownResponse,
  VerifiableCredential,
} from '../../../machines/VerifiableCredential/VCMetaMachine/vc';
import i18n, {getLocalizedField} from '../../../i18n';
import {Row} from '../../ui';
import {VCItemField} from './VCItemField';
import React from 'react';
import {Theme} from '../../ui/styleUtils';
import {CREDENTIAL_REGISTRY_EDIT} from 'react-native-dotenv';
import {VCVerification} from '../../VCVerification';
import {MIMOTO_BASE_URL} from '../../../shared/constants';
import {VCItemDetailsProps} from '../Views/VCDetailView';
import {getSelectedCredentialTypeDetails} from '../../../shared/openId4VCI/Utils';
import {parseJSON} from '../../../shared/Utils';

export const CARD_VIEW_DEFAULT_FIELDS = ['fullName'];
export const DETAIL_VIEW_DEFAULT_FIELDS = [
  'fullName',
  'gender',
  'phone',
  'dateOfBirth',
  'email',
  'address',
];

//todo UIN & VID to be removed once we get the fields in the wellknown endpoint
export const CARD_VIEW_ADD_ON_FIELDS = ['UIN', 'VID'];
export const DETAIL_VIEW_ADD_ON_FIELDS = [
  'status',
  'credentialRegistry',
  'idType',
];

export const DETAIL_VIEW_BOTTOM_SECTION_FIELDS = [
  'email',
  'address',
  'credentialRegistry',
];

export const BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS = [
  ...getAddressFields(),
  'email',
  'credentialRegistry',
];

export const getFieldValue = (
  verifiableCredential: Credential,
  field: string,
  wellknown: any,
  props: any,
) => {
  switch (field) {
    case 'status':
      return (
        <VCVerification
          wellknown={wellknown}
          isVerified={props.verifiableCredentialData.vcMetadata.isVerified}
        />
      );
    case 'idType':
      return getIdType(wellknown);
    case 'credentialRegistry':
      return props?.vc?.credentialRegistry;
    case 'address':
      return getLocalizedField(
        getFullAddress(verifiableCredential?.credentialSubject),
      );
    default: {
      const fieldValue = verifiableCredential?.credentialSubject[field];
      if (Array.isArray(fieldValue) && typeof fieldValue[0] !== 'object') {
        return fieldValue.join(', ');
      }
      return getLocalizedField(fieldValue);
    }
  }
};

export const getFieldName = (field: string, wellknown: any) => {
  if (wellknown) {
    const credentialDefinition = wellknown.credential_definition;
    if (!credentialDefinition) {
      console.error(
        'Credential definition is not available for the selected credential type',
      );
    }
    let fieldObj = credentialDefinition?.credentialSubject[field];
    if (fieldObj) {
      const newFieldObj = fieldObj.display.map(obj => {
        return {language: obj.locale, value: obj.name};
      });
      return getLocalizedField(newFieldObj);
    }
  }
  return i18n.t(`VcDetails:${field}`);
};

export const getBackgroundColour = (wellknown: any) => {
  return wellknown?.display[0]?.background_color ?? Theme.Colors.textValue;
};

//To-Do what will be the fallback image
export const getBackgroundImage = (wellknown: any) => {
  return wellknown?.display[0]?.background_image ?? Theme.OpenCard;
};

export const getTextColor = (wellknown: any, defaultColor: string) => {
  return wellknown?.display[0]?.text_color ?? defaultColor;
};

export function getAddressFields() {
  return [
    'addressLine1',
    'addressLine2',
    'addressLine3',
    'city',
    'province',
    'region',
    'postalCode',
  ];
}

function getFullAddress(credential: CredentialSubject) {
  if (!credential) {
    return '';
  }

  const fields = getAddressFields();

  return fields
    .map(field => getLocalizedField(credential[field]))
    .filter(Boolean)
    .join(', ');
}

export const fieldItemIterator = (
  fields: any[],
  verifiableCredential: VerifiableCredential | Credential,
  wellknown: any,
  props: VCItemDetailsProps,
) => {
  return fields.map(field => {
    const fieldName = getFieldName(field, wellknown);
    const fieldValue = getFieldValue(
      verifiableCredential,
      field,
      wellknown,
      props,
    );
    if (
      (field === 'credentialRegistry' &&
        CREDENTIAL_REGISTRY_EDIT === 'false') ||
      !fieldValue
    )
      return;
    return (
      <Row
        key={field}
        style={{flexDirection: 'row', flex: 1}}
        align="space-between"
        margin="0 8 15 0">
        <VCItemField
          key={field}
          fieldName={fieldName}
          fieldValue={fieldValue}
          verifiableCredential={verifiableCredential}
          wellknown={wellknown}
          testID={field}
        />
      </Row>
    );
  });
};

export const isVCLoaded = (
  verifiableCredential: Credential,
  fields: string[],
) => {
  return verifiableCredential != null && fields.length > 0;
};

export const getMosipLogo = () => {
  return {
    url: `${MIMOTO_BASE_URL}/inji/mosip-logo.png`,
    alt_text: 'a square logo of mosip',
  };
};

/**
 *
 * @param wellknown (either supportedCredential's wellknown or whole well known response of issuer)
 * @param idType
 * @returns id Type translations (Eg - National ID)
 *
 * supportedCredential's wellknown is passed from getActivityText after fresh download
 * & all other consumers pass whole well known response of issuer
 */
export const getIdType = (
  wellknown: CredentialTypes | IssuerWellknownResponse,
  idType?: string[],
) => {
  if (wellknown && wellknown?.display) {
    const idTypeObj = wellknown.display.map((displayProps: any) => {
      return {language: displayProps.locale, value: displayProps.name};
    });
    return getLocalizedField(idTypeObj);
  } else if (
    wellknown &&
    Object.keys(wellknown).length > 0 &&
    idType !== undefined
  ) {
    let supportedCredentialsWellknown;
    wellknown = parseJSON(wellknown) as unknown as Object[];
    if (!!!wellknown['credential_configurations_supported']) {
      return i18n.t('VcDetails:nationalCard');
    }
    supportedCredentialsWellknown = getSelectedCredentialTypeDetails(
      wellknown,
      idType,
    );
    if (Object.keys(supportedCredentialsWellknown).length === 0) {
      return i18n.t('VcDetails:nationalCard');
    }
    return getIdType(supportedCredentialsWellknown);
  } else {
    return i18n.t('VcDetails:nationalCard');
  }
};

export const getCredentialTypes = (
  credential: Credential | VerifiableCredential,
): string[] => {
  return (credential?.credentialTypes as string[]) ?? ['VerifiableCredential'];
};
