import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl } from 'react-native';
import { Icon } from 'react-native-elements';
import { Centered, Column, Text } from '../../components/ui';
import { Colors } from '../../components/ui/styleUtils';
import { HomeScreenTabProps } from './HomeScreen';
import { useReceivedVcsTab } from './ReceivedVcsTabController';
import { UpdatedVcItem } from '../../components/UpdatedVcItem';

export const ReceivedVcsTab: React.FC<HomeScreenTabProps> = (props) => {
  const { t } = useTranslation('ReceivedVcsTab');
  const controller = useReceivedVcsTab(props);

  return (
    <Column fill style={{ display: props.isVisible ? 'flex' : 'none' }}>
      <Column
        scroll
        padding="32 24"
        refreshControl={
          <RefreshControl
            refreshing={controller.isRefreshingVcs}
            onRefresh={controller.REFRESH}
          />
        }>
        {controller.vcKeys.map((vcKey) => (
          <UpdatedVcItem
            key={vcKey}
            vcKey={vcKey}
            margin="0 2 8 2"
            onPress={controller.VIEW_VC}
          />
        ))}
        {controller.vcKeys.length === 0 && (
          <React.Fragment>
            <Centered fill>
              <Icon
                style={{ marginBottom: 20 }}
                size={40}
                name="sentiment-dissatisfied"
              />
              <Text align="center" weight="semibold" margin="0 0 4 0">
                {t('noReceivedVcsTitle', {
                  vcLabel: controller.vcLabel.plural,
                })}
              </Text>
              <Text align="center" color={Colors.Grey}>
                {t('noReceivedVcsText', {
                  vcLabel: controller.vcLabel.singular,
                })}
              </Text>
            </Centered>
          </React.Fragment>
        )}
      </Column>
    </Column>
  );
};
