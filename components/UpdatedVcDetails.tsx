import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import * as DateFnsLocale from '../lib/date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Image, View, ImageBackground } from 'react-native';
import { Icon, ListItem } from 'react-native-elements';
import { VC, CredentialSubject } from '../types/vc';
import { Column, Row, Text } from './ui';
import {
  Colors,
  Styles,
  ProfileIcon,
  MosipLogo,
  OpenCard,
} from './ui/styleUtils';
import { TextItem } from './ui/TextItem';

const VerifiedIcon: React.FC = () => {
  return (
    <Icon
      name="check-circle"
      color={Colors.Green}
      size={14}
      containerStyle={{ marginStart: 4, bottom: 1 }}
    />
  );
};

export const UpdatedVcDetails: React.FC<VcDetailsProps> = (props) => {
  const { t, i18n } = useTranslation('VcDetails');

  return (
    <ImageBackground style={Styles.bgContainer} source={OpenCard}>
      <View style={Styles.closeDetailsHeader}>
        <View>
          <Text weight="bold" size="smaller" color={Colors.DetailsText}>
            {t('fullName')}
          </Text>
          <Text weight="bold" size="smaller">
            {getLocalizedField(
              props.vc?.verifiableCredential.credentialSubject.fullName
            )}
          </Text>
        </View>
        <Image source={MosipLogo} style={Styles.logo} />
      </View>

      <Row style={Styles.openDetailsContainer}>
        <ListItem bottomDivider>
          <ListItem.Content>
            <ListItem.Subtitle>{t('photo')}</ListItem.Subtitle>
            <ListItem.Content>
              <Image
                source={
                  props.vc?.credential.biometrics?.face
                    ? { uri: props.vc?.credential.biometrics.face }
                    : ProfileIcon
                }
                style={Styles.openCardImage}
              />
            </ListItem.Content>
          </ListItem.Content>
        </ListItem>

        <Column style={Styles.details}>
          <Column style={Styles.labelPart}>
            <Column fill style={Styles.labelPart}>
              <Text weight="bold" size="smaller" color={Colors.DetailsText}>
                {props.vc?.idType}
              </Text>
              <Text weight="semibold" size="smaller">
                {props.vc?.id}
              </Text>
            </Column>

            <Column fill style={Styles.labelPart}>
              <Text weight="bold" size="smaller" color={Colors.DetailsText}>
                {t('generatedOn')}
              </Text>
              <Text weight="semibold" size="smaller">
                {new Date(props.vc?.generatedOn).toLocaleDateString()}
              </Text>
            </Column>

            <Column fill style={Styles.labelPart}>
              <Text weight="bold" size="smaller" color={Colors.DetailsText}>
                {t('status')}
              </Text>
              <Row>
                <Text weight="semibold" size="smaller">
                  {t('valid')}
                </Text>
                {props.vc?.isVerified && <VerifiedIcon />}
              </Row>
            </Column>
            <Column fill style={Styles.labelPart}>
              <Text weight="bold" size="smaller" color={Colors.DetailsText}>
                {t('gender')}
              </Text>
              <Text weight="semibold" size="smaller">
                {getLocalizedField(
                  props.vc?.verifiableCredential.credentialSubject.gender
                )}
              </Text>
            </Column>

            <Column fill style={Styles.labelPart}>
              <Text weight="bold" size="smaller" color={Colors.DetailsText}>
                {t('dateOfBirth')}
              </Text>
              <Text weight="semibold" size="smaller">
                {new Date(
                  getLocalizedField(
                    props.vc?.verifiableCredential.credentialSubject.dateOfBirth
                  )
                ).toLocaleDateString()}
              </Text>
            </Column>

            <Column fill style={Styles.labelPart}>
              <Text weight="bold" size="smaller" color={Colors.DetailsText}>
                {t('phoneNumber')}
              </Text>
              <Text weight="semibold" size="smaller">
                {getLocalizedField(
                  props.vc?.verifiableCredential.credentialSubject.phone
                )}
              </Text>
            </Column>

            <Column fill style={Styles.labelPart}>
              <Text weight="bold" size="smaller" color={Colors.DetailsText}>
                {t('email')}
              </Text>
              <Text weight="semibold" size="smaller">
                {getLocalizedField(
                  props.vc?.verifiableCredential.credentialSubject.email
                )}
              </Text>
            </Column>

            <Column fill style={Styles.labelPart}>
              <Text weight="bold" size="smaller" color={Colors.DetailsText}>
                {t('address')}
              </Text>
              <Text weight="semibold" size="smaller">
                {getFullAddress(
                  props.vc?.verifiableCredential.credentialSubject
                )}
              </Text>
            </Column>
          </Column>

          {props.vc?.reason?.length > 0 && (
            <Text margin="24 24 16 24" weight="semibold">
              {t('reasonForSharing')}
            </Text>
          )}
          {props.vc?.reason?.map((reason, index) => (
            <TextItem
              key={index}
              divider
              label={formatDistanceToNow(reason.timestamp, {
                addSuffix: true,
                locale: DateFnsLocale[i18n.language],
              })}
              text={reason.message}
            />
          ))}
        </Column>
      </Row>
    </ImageBackground>
  );
};

interface VcDetailsProps {
  vc: VC;
}

interface LocalizedField {
  language: string;
  value: string;
}

function getFullAddress(credential: CredentialSubject) {
  if (!credential) {
    return '';
  }

  const fields = [
    'addressLine1',
    'addressLine2',
    'addressLine3',
    'city',
    'province',
    'region',
  ];

  return fields
    .map((field) => getLocalizedField(credential[field]))
    .concat(credential.postalCode)
    .filter(Boolean)
    .join(', ');
}

function getLocalizedField(rawField: string | LocalizedField) {
  if (typeof rawField === 'string') {
    return rawField;
  }
  try {
    const locales: LocalizedField[] = JSON.parse(JSON.stringify(rawField));
    return locales[0].value;
  } catch (e) {
    return '';
  }
}
