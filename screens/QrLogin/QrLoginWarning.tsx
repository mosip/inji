import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Column, Row} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {Text} from '../../components/ui';
import {Icon} from 'react-native-elements';
import {useQrLogin} from './QrLoginController';
import {Modal} from '../../components/ui/Modal';
import {Dimensions, Image} from 'react-native';
import {QrLoginRef} from '../../machines/QrLoginMachine';
import {SvgImage} from '../../components/ui/svg';

export const QrLoginWarning: React.FC<QrLoginWarningProps> = props => {
  const {t} = useTranslation('QrLogin');
  const controller = useQrLogin(props);

  return (
    <Modal
      isVisible={controller.isShowWarning}
      arrowLeft={<Icon name={''} />}
      headerTitle={t('confirmation')}
      headerElevation={5}
      onDismiss={props.onCancel}>
      <Column
        fill
        align="space-between"
        padding={'21 0 0 0'}
        style={{display: props.isVisible ? 'flex' : 'none'}}
        backgroundColor={Theme.Colors.lightGreyBackgroundColor}>
        <Column align="space-evenly" crossAlign="center" padding={'16 15 0 15'}>
          {SvgImage.WarningLogo()}
          <Text
            align="center"
            style={Theme.Styles.detailsText}
            margin="30 15 15 15">
            {t('domainWarning')}
          </Text>
          <Text
            align="center"
            margin={'30 15 0 10'}
            weight="regular"
            color={Theme.Colors.Icon}
            style={Theme.Styles.urlContainer}>
            {controller.domainName}
          </Text>
        </Column>

        <Column padding={'0 16 14 16'}>
          <Text
            align="center"
            weight="semibold"
            style={Theme.TextStyles.smaller}
            margin="0 12 10 12">
            {t('checkDomain')}
          </Text>
          <Row
            align="space-evenly"
            padding={'9'}
            crossAlign="center"
            style={Theme.Styles.lockDomainContainer}>
            <Icon name="lock" size={20} color={'grey'} type="font-awesome" />
            <Text
              weight="semibold"
              style={Theme.TextStyles.smaller}
              color={Theme.Colors.GrayIcon}>
              {t('domainHead')}
            </Text>
          </Row>
        </Column>

        <Column
          padding={'10'}
          width={Dimensions.get('screen').width * 0.98}
          style={Theme.Styles.bottomButtonsContainer}>
          <Button
            margin={'0 12 0 12'}
            title={t('confirm')}
            onPress={props.onConfirm}
            styles={Theme.ButtonStyles.radius}
          />
          <Button
            margin={'10 12 0 12'}
            type="clear"
            title={t('common:cancel')}
            onPress={props.onCancel}
            styles={Theme.ButtonStyles.clear}
          />
        </Column>
      </Column>
    </Modal>
  );
};

interface QrLoginWarningProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  service: QrLoginRef;
}
