import React from 'react';
import { getVersion } from 'react-native-device-info';
import { ListItem, Switch } from 'react-native-elements';
import { Column, Text } from '../../components/ui';
import { Colors } from '../../components/ui/styleUtils';
import { MainRouteProps } from '../../routes/main';
import { EditableListItem } from '../../components/EditableListItem';
import { MessageOverlay } from '../../components/MessageOverlay';
import { Credits } from './Credits';
import { useProfileScreen } from './ProfileScreenController';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../../components/LanguageSelector';
import i18next, { SUPPORTED_LANGUAGES } from '../../i18n';

const LanguageSetting: React.FC = () => {
  const { t } = useTranslation('ProfileScreen');

  return (
    <LanguageSelector
      triggerComponent={
        <ListItem bottomDivider>
          <ListItem.Content>
            <ListItem.Title>
              <Text>{t('language')}</Text>
            </ListItem.Title>
          </ListItem.Content>
          <Text margin="0 12 0 0" color={Colors.Grey}>
            {SUPPORTED_LANGUAGES[i18next.language]}
          </Text>
        </ListItem>
      }
    />
  );
};

export const ProfileScreen: React.FC<MainRouteProps> = (props) => {
  const { t } = useTranslation('ProfileScreen');
  const controller = useProfileScreen(props);
  return (
    <Column fill padding="24 0" backgroundColor={Colors.LightGrey}>
      <MessageOverlay
        isVisible={controller.alertMsg != ''}
        onBackdropPress={controller.hideAlert}
        title={controller.alertMsg}
      />
      <EditableListItem
        label={t('name')}
        value={controller.name}
        onEdit={controller.UPDATE_NAME}
      />
      <EditableListItem
        label={t('vcLabel')}
        value={controller.vcLabel.singular}
        onEdit={controller.UPDATE_VC_LABEL}
      />
      <LanguageSetting />
      <ListItem bottomDivider disabled={!controller.canUseBiometrics}>
        <ListItem.Content>
          <ListItem.Title>
            <Text>{t('bioUnlock')}</Text>
          </ListItem.Title>
        </ListItem.Content>
        <Switch
          value={controller.isBiometricUnlockEnabled}
          onValueChange={controller.useBiometrics}
          color={Colors.Orange}
        />
      </ListItem>
      <ListItem bottomDivider disabled>
        <ListItem.Content>
          <ListItem.Title>
            <Text color={Colors.Grey}>{t('authFactorUnlock')}</Text>
          </ListItem.Title>
        </ListItem.Content>
      </ListItem>
      <Credits label={t('credits')} />
      <ListItem bottomDivider onPress={controller.LOGOUT}>
        <ListItem.Content>
          <ListItem.Title>
            <Text>{t('logout')}</Text>
          </ListItem.Title>
        </ListItem.Content>
      </ListItem>
      <Text
        weight="semibold"
        margin="32 0 0 0"
        align="center"
        size="smaller"
        color={Colors.Grey}>
        Version: {getVersion()}
      </Text>
      {controller.backendInfo.application.name !== '' ? (
        <Column>
          <Text
            weight="semibold"
            align="center"
            size="smaller"
            color={Colors.Grey}>
            {controller.backendInfo.application.name}:{' '}
            {controller.backendInfo.application.version}
          </Text>
          <Text
            weight="semibold"
            align="center"
            size="smaller"
            color={Colors.Grey}>
            MOSIP: {controller.backendInfo.config['mosip.host']}
          </Text>
        </Column>
      ) : null}
    </Column>
  );
};
