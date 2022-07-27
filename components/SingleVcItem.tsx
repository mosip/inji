import React, { useContext, useRef } from 'react';
import { useInterpret, useSelector } from '@xstate/react';
import { StyleSheet, Image, ImageBackground } from 'react-native';
import { CheckBox, Icon } from 'react-native-elements';
import { ActorRefFrom } from 'xstate';
import {
  createVcItemMachine,
  selectVerifiableCredential,
  selectGeneratedOn,
  selectTag,
  selectId,
  vcItemMachine,
} from '../machines/vcItem';
import { Column, Row, Text } from './ui';
import { Colors } from './ui/styleUtils';
import { GlobalContext } from '../shared/GlobalContext';
import { useTranslation } from 'react-i18next';

const styles = StyleSheet.create({
  title: {
    color: Colors.Black,
    backgroundColor: 'transparent',
  },
  loadingTitle: {
    color: 'transparent',
    backgroundColor: Colors.Grey5,
    borderRadius: 4,
  },
  subtitle: {
    backgroundColor: 'transparent',
  },
  loadingSubtitle: {
    backgroundColor: Colors.Grey,
    borderRadius: 4,
  },
  container: {
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.Grey6,
    borderRadius: 4,
    margin: 5,
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
  },
  logoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: 300,
  },
  bgContainer: {
    borderRadius: 10,
    margin: 5,
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

export const SingleVcItem: React.FC<VcItemProps> = (props) => {
  const { appService } = useContext(GlobalContext);
  const { t } = useTranslation('VcDetails');

  const machine = useRef(
    createVcItemMachine(
      appService.getSnapshot().context.serviceRefs,
      props.vcKey
    )
  );
  const service = useInterpret(machine.current);

  const uin = useSelector(service, selectId);
  const tag = useSelector(service, selectTag);

  const context = useSelector(service, selectVerifiableCredential);
  const generatedOn = useSelector(service, selectGeneratedOn);

  const selectableOrCheck = props.selectable ? (
    <CheckBox
      checked={props.selected}
      checkedIcon={<Icon name="radio-button-checked" />}
      uncheckedIcon={<Icon name="radio-button-unchecked" />}
      onPress={() => props.onPress(service)}
    />
  ) : null;

  return (
    <Column style={styles.bgContainer} onShow={props.onShow(service)}>
      <ImageBackground
        source={
          !context.verifiableCredential
            ? null
            : require('../assets/ID-closed.png')
        }
        style={
          !context.verifiableCredential
            ? styles.loadingContainer
            : styles.container
        }>
        <Row
          crossAlign="center"
          style={
            !context.verifiableCredential
              ? styles.loadingContainer
              : styles.container
          }>
          <Column
            style={
              !context.verifiableCredential
                ? styles.loadingContainer
                : styles.detailsContainer
            }>
            <Image
              source={
                !context.verifiableCredential
                  ? require('../assets/placeholder-photo.png')
                  : { uri: context.credential.biometrics.face }
              }
              style={{
                width: 130,
                height: 145,
                resizeMode: 'cover',
              }}
            />

            <Column margin="0 0 0 50">
              <Column>
                <Text color={Colors.Orange} size="smaller">
                  Full name
                </Text>
                <Text
                  weight="bold"
                  size="smaller"
                  style={
                    !context.verifiableCredential
                      ? styles.loadingTitle
                      : styles.title
                  }>
                  {!context.verifiableCredential
                    ? ''
                    : getLocalizedField(
                        context.verifiableCredential.credentialSubject.fullName
                      )}
                </Text>
              </Column>

              <Column>
                <Text color={Colors.Orange} size="smaller">
                  UIN
                </Text>
                <Text
                  weight="bold"
                  size="smaller"
                  style={
                    !context.verifiableCredential
                      ? styles.loadingTitle
                      : styles.title
                  }>
                  {!context.verifiableCredential ? '' : tag || uin}
                </Text>
              </Column>
              <Column>
                <Text color={Colors.Orange} size="smaller">
                  Generated on
                </Text>
                <Text
                  numLines={1}
                  weight="bold"
                  size="smaller"
                  style={
                    !context.verifiableCredential
                      ? styles.loadingTitle
                      : styles.subtitle
                  }>
                  {!context.verifiableCredential ? '' : generatedOn}
                </Text>
              </Column>
              <Column>
                <Text size="smaller" color={Colors.Orange}>
                  {t('status')}
                </Text>
                <Row>
                  <Text
                    weight="bold"
                    size="smaller"
                    style={
                      !context.verifiableCredential
                        ? styles.loadingTitle
                        : styles.subtitle
                    }>
                    {!context.verifiableCredential ? '' : t('valid')}
                  </Text>
                  {!context.verifiableCredential ? null : <VerifiedIcon />}
                </Row>
              </Column>
            </Column>
          </Column>
        </Row>
      </ImageBackground>
    </Column>
  );
};

interface VcItemProps {
  vcKey: string;
  margin?: string;
  selectable?: boolean;
  selected?: boolean;
  onPress?: (vcRef?: ActorRefFrom<typeof vcItemMachine>) => void;
  onShow?: (vcRef?: ActorRefFrom<typeof vcItemMachine>) => void;
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
