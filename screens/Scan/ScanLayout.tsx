import React from 'react';
import {useTranslation} from 'react-i18next';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SendVcScreen} from './SendVcScreen';
import {useScanLayout} from './ScanLayoutController';
import {ScanScreen} from './ScanScreen';
import {SCAN_ROUTES} from '../../routes/routesConstants';
import {SharingStatusModal} from './SharingStatusModal';
import {Theme} from '../../components/ui/styleUtils';
import {Icon} from 'react-native-elements';
import {Loader} from '../../components/ui/Loader';
import {VCShareFlowType} from '../../shared/Utils';
import {VerifyIdentityOverlay} from '../VerifyIdentityOverlay';
import {MessageOverlay} from '../../components/MessageOverlay';
import {Row, Button} from '../../components/ui';
import {Text} from '../../components/ui';
import {I18nManager, View} from 'react-native';
import {SvgImage} from '../../components/ui/svg';

const ScanStack = createNativeStackNavigator();

export const ScanLayout: React.FC = () => {
  const {t} = useTranslation('ScanScreen');
  const controller = useScanLayout();
  const bleErrorCode = controller.bleError.code;

  if (
    controller.statusOverlay != null &&
    !controller.isAccepted &&
    !controller.isInvalid
  ) {
    return (
      <Loader
        title={controller.statusOverlay?.title}
        hint={controller.statusOverlay?.hint}
        onCancel={controller.statusOverlay?.onButtonPress}
        onStayInProgress={controller.statusOverlay?.onStayInProgress}
        isHintVisible={
          controller.isStayInProgress ||
          controller.isBleError ||
          controller.isSendingVc
        }
        onRetry={controller.statusOverlay?.onRetry}
      />
    );
  }

  return (
    <React.Fragment>
      <VerifyIdentityOverlay
        vc={controller.selectedVc}
        controller={controller}
      />

      <ScanStack.Navigator initialRouteName="ScanScreen">
        {controller.isReviewing &&
          controller.flowType === VCShareFlowType.SIMPLE_SHARE && (
            <ScanStack.Screen
              name={SCAN_ROUTES.SendVcScreen}
              component={SendVcScreen}
              options={{
                title: t('sharingVc'),
                headerTitleAlign: 'center',
                headerTitle: props => (
                  <View style={Theme.Styles.sendVcHeaderContainer}>
                    <Text style={Theme.Styles.scanLayoutHeaderTitle}>
                      {props.children}
                    </Text>
                  </View>
                ),
                headerBackVisible: false,
                headerRight: () =>
                  !I18nManager.isRTL && (
                    <Icon
                      name="close"
                      color={Theme.Colors.blackIcon}
                      onPress={controller.CANCEL}
                    />
                  ),
                headerLeft: () =>
                  I18nManager.isRTL && (
                    <Icon
                      name="close"
                      color={Theme.Colors.blackIcon}
                      onPress={controller.CANCEL}
                    />
                  ),
              }}
            />
          )}
        <ScanStack.Screen
          name={SCAN_ROUTES.ScanScreen}
          component={ScanScreen}
          options={{
            title: t('MainLayout:share'),
            headerTitle: props => (
              <View style={Theme.Styles.scanLayoutHeaderContainer}>
                <Text style={Theme.Styles.scanLayoutHeaderTitle}>
                  {props.children}
                </Text>
              </View>
            ),
          }}
        />
      </ScanStack.Navigator>

      <SharingStatusModal
        isVisible={controller.isAccepted}
        testId={'sharingSuccessModal'}
        buttonStatus={'homeAndHistoryIcons'}
        title={t('status.accepted.title')}
        message={t('status.accepted.message')}
        image={SvgImage.SuccessLogo()}
        goToHome={controller.GOTO_HOME}
        goToHistory={controller.GOTO_HISTORY}
      />

      <SharingStatusModal
        isVisible={controller.isDisconnected}
        testId={'walletSideSharingErrorModal'}
        image={SvgImage.ErrorLogo()}
        title={t('status.disconnected.title')}
        message={t('status.disconnected.message')}
        gradientButtonTitle={t('status.bleError.retry')}
        clearButtonTitle={t('status.bleError.home')}
        onGradientButton={controller.onRetry}
        onClearButton={controller.GOTO_HOME}
      />

      <SharingStatusModal
        isVisible={controller.isBleError}
        testId={'walletSideSharingErrorModal'}
        image={SvgImage.ErrorLogo()}
        title={t(`status.bleError.${bleErrorCode}.title`)}
        message={t(`status.bleError.${bleErrorCode}.message`)}
        gradientButtonTitle={t('status.bleError.retry')}
        clearButtonTitle={t('status.bleError.home')}
        onGradientButton={controller.onRetry}
        onClearButton={controller.GOTO_HOME}
      />
    </React.Fragment>
  );
};
