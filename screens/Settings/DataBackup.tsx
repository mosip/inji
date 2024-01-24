import React, {useEffect, useState} from 'react';
import {Platform, Pressable} from 'react-native';
import {ListItem} from 'react-native-elements';
import {Row, Text} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {SvgImage} from '../../components/ui/svg';
import BackupAndRestoreScreen from './BackupAndRestoreScreen';
import {useBackupScreen} from './BackupController';
import {AccountSelection} from './AccountSelection';
import {CloudStorage} from 'react-native-cloud-storage';
import {request} from 'react-native-permissions';
import {request as apiRequest} from '../../shared/request';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {GOOGLE_ANDROID_CLIENT_ID} from 'react-native-dotenv';

export const DataBackup: React.FC = ({} = props => {
  const controller = useBackupScreen(props);
  const [hadBackUpAlreadyDone, setHadBackUpAlreadyDone] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showBackAndRestoreScreen, setShowBackAndRestoreScreen] =
    useState(false);

  const [profileInfo, setProfileInfo] = useState(null);

  // TODO : Check if the setup is already done

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/drive.appdata'],
  });

  const [authenticationResponseType, setAuthenticationResponseType] = useState<
    null | 'cancel' | 'dismiss' | 'opened' | 'locked' | 'success'
  >(null);

  useEffect(() => {
    extractUserInfo();
  }, [response]);

  const extractUserInfo: () => Promise<void> = async () => {
    if (response)
      console.log('response google signin ', JSON.stringify(response, null, 2));
    if (response?.type == 'success') {
      CloudStorage.setGoogleDriveAccessToken(
        response?.authentication?.accessToken,
      );
      const profileResponse = await apiRequest(
        'GET',
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${response.authentication?.accessToken}`,
        undefined,
        '',
      );
      setProfileInfo({
        email: profileResponse.email,
        picture: profileResponse.picture,
      });
      setAuthenticationResponseType(response.type);
    } else if (response?.type === 'dismiss') {
      setAuthenticationResponseType(response.type);
    }
  };

  const handleBackupAndRestore = () => {
    if (hadBackUpAlreadyDone) setShowBackAndRestoreScreen(true);
    else setShowConfirmation(true);
  };

  return (
    <React.Fragment>
      <Pressable onPress={handleBackupAndRestore}>
        <ListItem topDivider bottomDivider>
          {SvgImage.DataBackupIcon(25, 25)}
          <ListItem.Content>
            <ListItem.Title style={{paddingTop: 3}}>
              <Row>
                <Text
                  weight="semibold"
                  color={Theme.Colors.settingsLabel}
                  style={{paddingRight: 10}}>
                  Backup & Restore
                </Text>
                <Text
                  style={Theme.BackupStyles.newStyles}
                  color={Theme.Colors.whiteText}>
                  New
                </Text>
              </Row>
            </ListItem.Title>
          </ListItem.Content>
        </ListItem>
      </Pressable>

      {showConfirmation && (
        <AccountSelection
          isVisible={showConfirmation}
          onDismiss={() => controller.DISMISS()}
          onProceed={promptAsync}
          goBack={() => setShowConfirmation(false)}
        />
      )}
      {showBackAndRestoreScreen && (
        <BackupAndRestoreScreen
          onBackPress={() => {
            setShowBackAndRestoreScreen(false);
          }}
        />
      )}
    </React.Fragment>
  );
});
