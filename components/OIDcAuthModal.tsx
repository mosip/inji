import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button, Centered, Column, Text } from './ui';
import { Modal, ModalProps } from './ui/Modal';
import { Theme } from './ui/styleUtils';

export const OIDcAuthenticationOverlay: React.FC<
  OIDcAuthenticationModalProps
> = (props) => {
  const { t } = useTranslation('OIDcAuth');

  return (
    <Modal isVisible={props.isVisible} onDismiss={props.onDismiss}>
      <Column fill padding="32" align="space-between">
        <Centered fill>
          <Icon
            name="card-account-details-outline"
            color={Theme.Colors.Icon}
            size={30}
          />
          <Text
            align="center"
            weight="bold"
            margin="8 0 12 0"
            style={{ fontSize: 24 }}>
            {t('title')}
          </Text>
          <Text align="center">{t('text')}</Text>
          <Text
            align="center"
            color={Theme.Colors.errorMessage}
            margin="16 0 0 0">
            {props.error}
          </Text>
        </Centered>
        <Column>
          <Button title={t('verify')} onPress={() => props.onVerify()} />
        </Column>
      </Column>
    </Modal>
  );
};

interface OIDcAuthenticationModalProps extends ModalProps {
  onVerify: () => void;
  error?: string;
}
