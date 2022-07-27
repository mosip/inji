import React from 'react';
import { Column } from '../../components/ui';
import { Colors } from '../../components/ui/styleUtils';
import { Modal, ModalProps } from '../../components/ui/Modal';
import { useReceiveVcModal } from './ReceiveVcModalController';
import { NewVcDetails } from '../../components/NewVcDetails';

export const TimerBasedReceiveVcModal: React.FC<ReceveVcModalProps> = (
  props
) => {
  const controller = useReceiveVcModal();

  return (
    <Modal
      {...props}
      onShow={() =>
        setTimeout(() => {
          props.onAccept();
        }, 5000)
      }>
      <Column scroll padding="0 0 48 0" backgroundColor={Colors.LightGrey}>
        <NewVcDetails vc={controller.incomingVc} />
      </Column>
    </Modal>
  );
};

interface ReceveVcModalProps extends ModalProps {
  onAccept: () => void;
  onReject: () => void;
  onShow: () => void;
}
