import React from 'react';
import {I18nManager, Modal as RNModal, Pressable, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {Column, Row, Text} from '.';
import {useSendVcScreen} from '../../screens/Scan/SendVcScreenController';
import {DeviceInfoList} from '../DeviceInfoList';
import {ElevationLevel, Theme} from './styleUtils';
import testIDProps from '../../shared/commonUtil';

export const Modal: React.FC<ModalProps> = props => {
  const controller = useSendVcScreen();

  return (
    <RNModal
      {...testIDProps(props.testID)}
      animationType="slide"
      style={props.modalStyle}
      visible={props.isVisible}
      onShow={props.onShow}
      onRequestClose={props.onDismiss}>
      <Column fill safe>
        <Row elevation={props.headerElevation}>
          <View style={props.modalStyle}>
            {props.headerRight && !props.arrowLeft ? (
              <Icon
                {...testIDProps('closeModal')}
                name={I18nManager.isRTL ? 'chevron-right' : 'chevron-left'}
                onPress={props.onDismiss}
                color={Theme.Colors.Icon}
              />
            ) : null}
            {props.arrowLeft ? (
              <Pressable onPress={props.onDismiss} accessible={false}>
                <Icon
                  {...testIDProps('arrowLeft')}
                  name={I18nManager.isRTL ? 'arrow-right' : 'arrow-left'}
                  type="material-community"
                  containerStyle={Theme.Styles.backArrowContainer}
                  color={Theme.Colors.Icon}
                />
              </Pressable>
            ) : null}
            <Row
              fill
              align={props.headerLeft ? 'flex-start' : 'center'}
              margin={props.arrowLeft ? '16 0 0 -15' : '16 0 0 10'}>
              <Column>
                <Text testID={props.testID} style={Theme.TextStyles.header}>
                  {props.headerTitle || props.headerLeft}
                </Text>
                {!props.requester ? (
                  <Text
                    weight="semibold"
                    style={Theme.TextStyles.small}
                    color={
                      props.headerLabelColor
                        ? props.headerLabelColor
                        : Theme.Colors.textLabel
                    }>
                    {props.headerLabel}
                  </Text>
                ) : (
                  <Text
                    weight="semibold"
                    style={Theme.TextStyles.small}
                    color={Theme.Colors.IconBg}>
                    <DeviceInfoList deviceInfo={controller.receiverInfo} />
                  </Text>
                )}
              </Column>
            </Row>
            {props.headerRight != null ||
              props.arrowLeft ||
              (props.showClose && (
                <Icon
                  {...testIDProps('close')}
                  name="close"
                  onPress={props.onDismiss}
                  color={Theme.Colors.Details}
                  size={27}
                />
              ))}
            {props.headerRight && props.headerRight}
          </View>
        </Row>
        {props.children}
      </Column>
    </RNModal>
  );
};

Modal.defaultProps = {
  modalStyle: Theme.ModalStyles.defaultModal,
  showClose: true,
};

export interface ModalProps {
  testID?: string;
  isVisible: boolean;
  requester?: boolean;
  showClose?: boolean;
  modalStyle?: Object;
  onDismiss?: () => void;
  headerTitle?: string;
  headerElevation?: ElevationLevel;
  headerLabel?: string;
  headerLabelColor?: string;
  headerRight?: React.ReactElement;
  headerLeft?: React.ReactElement;
  arrowLeft?: boolean;
  onShow?: () => void;
  children?: React.ReactNode;
}
