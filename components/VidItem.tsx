import React, {useContext, useRef} from 'react';
import {useInterpret, useSelector} from '@xstate/react';
import {Pressable} from 'react-native';
import {CheckBox} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ActorRefFrom} from 'xstate';
import {
  selectGeneratedOn,
  selectId,
  selectVerifiableCredential,
} from '../machines/VCItemMachine/selectors';
import {Column, Row, Text} from './ui';
import {Theme} from './ui/styleUtils';
import {RotatingIcon} from './RotatingIcon';
import {GlobalContext} from '../shared/GlobalContext';
import {getLocalizedField} from '../i18n';
import {VCMetadata} from '../shared/VCMetadata';
import {createVCItemMachine} from '../machines/VCItemMachine/VCItemMachine';

export const VidItem: React.FC<VcItemProps> = props => {
  const {appService} = useContext(GlobalContext);
  const machine = useRef(
    createVCItemMachine(
      appService.getSnapshot().context.serviceRefs,
      props.vcMetadata,
    ),
  );
  const service = useInterpret(machine.current);
  const uin = useSelector(service, selectId);
  const verifiableCredential = useSelector(service, selectVerifiableCredential);
  const generatedOn = useSelector(service, selectGeneratedOn);

  const selectableOrCheck = props.selectable ? (
    <CheckBox
      checked={props.selected}
      checkedIcon={<Icon name="checkbox-intermediate" size={24} />}
      uncheckedIcon={<Icon name="checkbox-blank-outline" size={24} />}
      onPress={() => props.onPress(service)}
    />
  ) : (
    <Icon name="chevron-right" />
  );

  return (
    <Pressable
      onPress={() => props.onPress(service)}
      disabled={!verifiableCredential}>
      <Row
        elevation={!verifiableCredential ? 0 : 2}
        crossAlign="center"
        margin={props.margin}
        backgroundColor={
          !verifiableCredential
            ? Theme.Colors.lightGreyBackgroundColor
            : Theme.Colors.whiteBackgroundColor
        }
        padding={[16, 16]}
        style={
          !verifiableCredential
            ? Theme.VidItemStyles.loadingContainer
            : Theme.VidItemStyles.container
        }>
        <Column fill margin="0 24 0 0">
          <Text
            weight="semibold"
            style={
              !verifiableCredential
                ? Theme.VidItemStyles.loadingTitle
                : Theme.VidItemStyles.title
            }
            margin="0 0 6 0">
            {!verifiableCredential ? '' : uin}
          </Text>
          <Text
            size="smaller"
            numLines={1}
            style={
              !verifiableCredential
                ? Theme.VidItemStyles.loadingSubtitle
                : Theme.VidItemStyles.subtitle
            }>
            {!verifiableCredential
              ? ''
              : getLocalizedField(
                  verifiableCredential.credentialSubject.fullName,
                ) +
                ' · ' +
                generatedOn}
          </Text>
        </Column>
        {verifiableCredential ? (
          selectableOrCheck
        ) : (
          <RotatingIcon name="sync" color={Theme.Colors.rotatingIcon} />
        )}
      </Row>
    </Pressable>
  );
};

interface VcItemProps {
  vcMetadata: VCMetadata;
  margin?: string;
  selectable?: boolean;
  selected?: boolean;
  onPress?: (vcRef?: ActorRefFrom<typeof VCItemMachine>) => void;
}
