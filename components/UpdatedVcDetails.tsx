import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import * as DateFnsLocale from '../lib/date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View, ImageBackground } from 'react-native';
import { Icon, ListItem } from 'react-native-elements';
import { VC, CredentialSubject } from '../types/vc';
import { Column, Row, Text } from './ui';
import { Colors } from './ui/styleUtils';
import { TextItem } from './ui/TextItem';

const styles = StyleSheet.create({
  successTag: {
    backgroundColor: Colors.Green,
    height: 43,
    flex: 1,
    alignItems: 'center',
    paddingLeft: 6,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 18,
    margin: 6,
  },
  logo: {
    height: 50,
    width: 40,
    marginRight: 10,
  },
  container: {
    flex: 2,
    padding: 10,
  },
  detailes: {
    width: 290,
    marginLeft: 110,
    marginTop: 0,
  },
  labelPart: {
    margin: 0,
    borderRadius: 0,
    borderWidth: 0,
    width: 240,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
});

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
    <ImageBackground
      style={{
        width: '100%',
        height: '100%',
      }}
      source={require('../assets/ID-open.png')}>
      <View style={styles.header}>
        <View>
          <Text weight="bold" size="smaller" color={Colors.Orange}>
            {t('fullName')}
          </Text>
          <Text weight="bold" size="smaller">
            {getLocalizedField(
              props.vc?.verifiableCredential.credentialSubject.fullName
            )}
          </Text>
        </View>
        <Image
          source={require('../assets/mosip-logo.png')}
          style={styles.logo}
        />
      </View>

      <Row style={styles.container}>
        <ListItem bottomDivider>
          <ListItem.Content>
            <ListItem.Subtitle>{t('photo')}</ListItem.Subtitle>
            <ListItem.Content>
              <Image
                source={
                  props.vc?.credential.biometrics?.face
                    ? { uri: props.vc?.credential.biometrics.face }
                    : require('../assets/placeholder-photo.png')
                }
                style={{
                  width: 128,
                  height: 180,
                  resizeMode: 'cover',
                  borderRadius: 5,
                  marginTop: -25,
                  marginLeft: -14,
                  padding: 10,
                }}
              />
            </ListItem.Content>
          </ListItem.Content>
        </ListItem>

        <Column style={styles.detailes}>
          <Column style={styles.labelPart}>
            <Column
              fill
              padding="12 16"
              margin="0 16 0 0"
              style={styles.labelPart}>
              <Text weight="bold" size="smaller" color={Colors.Orange}>
                {props.vc?.idType}
              </Text>
              <Text weight="semibold" size="smaller">
                {props.vc?.id}
              </Text>
            </Column>

            <Column
              fill
              padding="12 16"
              margin="0 16 0 0"
              style={styles.labelPart}>
              <Text weight="bold" size="smaller" color={Colors.Orange}>
                {t('generatedOn')}
              </Text>
              <Text weight="semibold" size="smaller">
                {new Date(props.vc?.generatedOn).toLocaleDateString()}
              </Text>
            </Column>

            <Column fill padding="12 16" style={styles.labelPart}>
              <Text weight="bold" size="smaller" color={Colors.Orange}>
                {t('status')}
              </Text>
              <Row>
                <Text weight="semibold" size="smaller">
                  {t('valid')}
                </Text>
                {props.vc?.isVerified && <VerifiedIcon />}
              </Row>
            </Column>
          </Column>

          <Column
            fill
            padding="12 16"
            margin="0 16 0 0"
            style={styles.labelPart}>
            <Text weight="bold" size="smaller" color={Colors.Orange}>
              {t('gender')}
            </Text>
            <Text weight="semibold" size="smaller">
              {getLocalizedField(
                props.vc?.verifiableCredential.credentialSubject.gender
              )}
            </Text>
          </Column>

          <Column
            fill
            padding="12 16"
            margin="0 16 0 0"
            style={styles.labelPart}>
            <Text weight="bold" size="smaller" color={Colors.Orange}>
              {t('dateOfBirth')}
            </Text>
            <Text weight="semibold" size="smaller">
              {getLocalizedField(
                props.vc?.verifiableCredential.credentialSubject.dateOfBirth
              )}
            </Text>
          </Column>

          <Column
            fill
            padding="12 16"
            margin="0 16 0 0"
            style={styles.labelPart}>
            <Text weight="bold" size="smaller" color={Colors.Orange}>
              {t('phoneNumber')}
            </Text>
            <Text weight="semibold" size="smaller">
              {getLocalizedField(
                props.vc?.verifiableCredential.credentialSubject.phone
              )}
            </Text>
          </Column>

          <Column
            fill
            padding="12 16"
            margin="0 16 0 0"
            style={styles.labelPart}>
            <Text weight="bold" size="smaller" color={Colors.Orange}>
              {t('email')}
            </Text>
            <Text weight="semibold" size="smaller">
              {getLocalizedField(
                props.vc?.verifiableCredential.credentialSubject.email
              )}
            </Text>
          </Column>

          <Column
            fill
            padding="12 16"
            margin="0 16 0 0"
            style={styles.labelPart}>
            <Text weight="bold" size="smaller" color={Colors.Orange}>
              {t('address')}
            </Text>
            <Text weight="semibold" size="smaller">
              {getFullAddress(props.vc?.verifiableCredential.credentialSubject)}
            </Text>
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
