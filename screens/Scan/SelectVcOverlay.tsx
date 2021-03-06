import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet } from 'react-native';
import { Overlay } from 'react-native-elements/dist/overlay/Overlay';
import { Button, Column, Row, Text } from '../../components/ui';
import { Colors, elevation } from '../../components/ui/styleUtils';
import { VcItem } from '../../components/VcItem';
import {
  SelectVcOverlayProps,
  useSelectVcOverlay,
} from './SelectVcOverlayController';

const styles = StyleSheet.create({
  overlay: {
    ...elevation(5),
    backgroundColor: Colors.White,
    padding: 0,
  },
});

export const SelectVcOverlay: React.FC<SelectVcOverlayProps> = (props) => {
  const { t } = useTranslation('SelectVcOverlay');
  const controller = useSelectVcOverlay(props);

  return (
    <Overlay isVisible={props.isVisible} overlayStyle={styles.overlay}>
      <Column
        padding="24"
        width={Dimensions.get('screen').width * 0.9}
        style={{ maxHeight: Dimensions.get('screen').height * 0.9 }}>
        <Text weight="semibold" margin="0 0 16 0">
          {t('header', { vcLabel: controller.vcLabel.singular })}
        </Text>
        <Text margin="0 0 16 0">
          {t('chooseVc', { vcLabel: controller.vcLabel.singular })}{' '}
          <Text weight="semibold">{props.receiverName}</Text>
        </Text>
        <Column margin="0 0 32 0" scroll>
          {props.vcKeys.map((vcKey, index) => (
            <VcItem
              key={vcKey}
              vcKey={vcKey}
              margin="0 2 8 2"
              onPress={controller.selectVcItem(index)}
              selectable
              selected={index === controller.selectedIndex}
            />
          ))}
        </Column>
        <Row margin="16 0 0 0">
          <Button
            fill
            type="clear"
            title={t('cancel')}
            onPress={() => props.onCancel()}
            margin="0 8 0 0"
          />
          <Button
            fill
            title={t('share')}
            disabled={controller.selectedIndex == null}
            onPress={controller.onSelect}
          />
        </Row>
      </Column>
    </Overlay>
  );
};
