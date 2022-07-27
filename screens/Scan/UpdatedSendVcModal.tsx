import React from 'react';
import { Input } from 'react-native-elements';
import { DeviceInfoList } from '../../components/DeviceInfoList';
import { Button, Column } from '../../components/ui';
import { Colors } from '../../components/ui/styleUtils';
import { MessageOverlay } from '../../components/MessageOverlay';
import { Modal, ModalProps } from '../../components/ui/Modal';
import { useSendVcModal } from './SendVcModalController';
import { useTranslation } from 'react-i18next';
import { UpdatedVcItem } from '../../components/UpdatedVcItem';
import { useSelectVcOverlay } from './SelectVcOverlayController';
import { SingleVcItem } from '../../components/SingleVcItem';

export const UpdatedSendVcModal: React.FC<SendVcModalProps> = (props) => {
  const { t } = useTranslation('UpdatedSendVcModal');
  const controller = useSendVcModal();

  const onShare = () => {
    controller.ACCEPT_REQUEST();
    controller2.onSelect();
  };

  const details = {
    isVisible: controller.isSelectingVc,
    receiverName: controller.receiverInfo.deviceName,
    onSelect: controller.SELECT_VC,
    onCancel: controller.CANCEL,
    vcKeys: controller.vcKeys,
  };

  const controller2 = useSelectVcOverlay(details);

  const reasonLabel = t('Reason For Sharing');

  return (
    <Modal {...props}>
      <Column fill backgroundColor={Colors.LightGrey}>
        <Column padding="16 0" scroll>
          <DeviceInfoList of="receiver" deviceInfo={controller.receiverInfo} />
          <Column padding="24">
            <Input
              placeholder={!controller.reason ? reasonLabel : ''}
              label={controller.reason ? reasonLabel : ''}
              onChangeText={controller.UPDATE_REASON}
              containerStyle={{ marginBottom: 24 }}
            />
          </Column>
          <Column>
            {controller.vcKeys.length === 1 && (
              <SingleVcItem
                key={controller.vcKeys[0]}
                vcKey={controller.vcKeys[0]}
                margin="0 2 8 2"
                onShow={controller2.selectVcItem(0)}
                selectable
                selected={0 === controller2.selectedIndex}
              />
            )}

            {controller.vcKeys.length > 1 &&
              controller.vcKeys.map((vcKey, index) => (
                <UpdatedVcItem
                  key={vcKey}
                  vcKey={vcKey}
                  margin="0 2 8 2"
                  onPress={controller2.selectVcItem(index)}
                  selectable
                  selected={index === controller2.selectedIndex}
                />
              ))}
          </Column>
        </Column>
        <Column
          backgroundColor={Colors.White}
          padding="16 24"
          margin="2 0 0 0"
          elevation={2}>
          <Button
            title={t('AcceptRequest', { vcLabel: controller.vcLabel.singular })}
            margin="12 0 12 0"
            disabled={controller2.selectedIndex == null}
            onPress={onShare}
          />
          <Button
            type="clear"
            title={t('Reject')}
            onPress={controller.CANCEL}
          />
        </Column>
      </Column>

      <MessageOverlay
        isVisible={controller.isSendingVc}
        title={t('Sharing..')}
        hasProgress
      />

      <MessageOverlay
        isVisible={controller.isAccepted}
        title={t(controller.vcLabel.singular, 'Sent succesfully')}
        message={t('statusAccepted.message', {
          vcLabel: controller.vcLabel.singular,
          receiver: controller.receiverInfo.deviceName,
        })}
        onShow={props.onDismiss}
      />

      <MessageOverlay
        isVisible={controller.isRejected}
        title={t('statusRejected.title')}
        message={t('statusRejected.message', {
          vcLabel: controller.vcLabel.singular,
          receiver: controller.receiverInfo.deviceName,
        })}
        onBackdropPress={props.onDismiss}
      />
    </Modal>
  );
};

type SendVcModalProps = ModalProps;
