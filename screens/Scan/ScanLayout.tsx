import React from 'react';
import { useTranslation } from 'react-i18next';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from 'react-native-elements';

import { Theme } from '../../components/ui/styleUtils';
import { SendVcScreen } from './SendVcScreen';
import { MessageOverlay } from '../../components/MessageOverlay';
import { useScanLayout } from './ScanLayoutController';
import { LanguageSelector } from '../../components/LanguageSelector';
import { ScanScreen } from './ScanScreen';
import { I18nManager, Platform } from 'react-native';

const ScanStack = createNativeStackNavigator();

export const ScanLayout: React.FC = () => {
  const { t } = useTranslation('ScanScreen');
  const controller = useScanLayout();

  return (
    <React.Fragment>
      <ScanStack.Navigator
        initialRouteName="ScanScreen"
        screenOptions={{
          headerTitleAlign: 'center',
          headerRight: () =>
            I18nManager.isRTL && Platform.OS !== 'ios' ? null : (
              <LanguageSelector
                triggerComponent={
                  <Icon name="language" color={Theme.Colors.Icon} />
                }
              />
            ),
          headerLeft: () =>
            I18nManager.isRTL && Platform.OS !== 'ios' ? (
              <LanguageSelector
                triggerComponent={
                  <Icon name="language" color={Theme.Colors.Icon} />
                }
              />
            ) : null,
        }}>
        {!controller.isDone && (
          <ScanStack.Screen
            name="SendVcScreen"
            component={SendVcScreen}
            options={{
              title: t('sharingVc', {
                vcLabel: controller.vcLabel.singular,
              }),
            }}
          />
        )}
        <ScanStack.Screen
          name="ScanScreen"
          component={ScanScreen}
          options={{
            title: t('MainLayout:scan').toUpperCase(),
          }}
        />
      </ScanStack.Navigator>

      <MessageOverlay
        isVisible={controller.statusOverlay != null}
        message={controller.statusOverlay?.message}
        hint={controller.statusOverlay?.hint}
        onCancel={controller.statusOverlay?.onCancel}
        progress={!controller.isInvalid}
        onBackdropPress={controller.DISMISS_INVALID}
      />
    </React.Fragment>
  );
};
