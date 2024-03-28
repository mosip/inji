import React from 'react';
import {ImageBackground, Pressable, Image} from 'react-native';
import {getLocalizedField} from '../../../i18n';
import {VCMetadata} from '../../../shared/VCMetadata';
import {KebabPopUp} from '../../KebabPopUp';
import {VerifiableCredential} from '../../../types/VC/vc';
import {Column, Row} from '../../ui';
import {Theme} from '../../ui/styleUtils';
import {CheckBox, Icon} from 'react-native-elements';
import {SvgImage} from '../../ui/svg';
import {VcItemContainerProfileImage} from '../../VcItemContainerProfileImage';
import {isVCLoaded, setBackgroundColour} from '../common/VCUtils';
import {setTextColor, VCItemFieldValue} from '../common/VCItemField';
import {WalletBinding} from '../../../screens/Home/MyVcs/WalletBinding';
import {VCVerification} from '../../VCVerification';
import {Issuers} from '../../../shared/openId4VCI/Utils';
import {VCItemContainerFlowType} from '../../../shared/Utils';
import {RemoveVcWarningOverlay} from '../../../screens/Home/MyVcs/RemoveVcWarningOverlay';
import {HistoryTab} from '../../../screens/Home/MyVcs/HistoryTab';

export const VCCardViewContent: React.FC<VCItemContentProps> = props => {
  const selectableOrCheck = props.selectable && (
    <CheckBox
      checked={props.selected}
      checkedIcon={
        <Icon name="check-circle" type="material" color={Theme.Colors.Icon} />
      }
      uncheckedIcon={
        <Icon
          name="radio-button-unchecked"
          color={Theme.Colors.uncheckedIcon}
        />
      }
      onPress={() => props.onPress()}
    />
  );
  const issuerLogo = props.verifiableCredentialData.issuerLogo;
  const faceImage = props.verifiableCredentialData.face;

  return (
    <ImageBackground
      source={Theme.CloseCard}
      resizeMode="stretch"
      style={[
        Theme.Styles.backgroundImageContainer,
        setBackgroundColour(props.wellknown),
      ]}>
      <Column>
        <Row crossAlign="center" padding="3 0 0 3">
          {VcItemContainerProfileImage(props)}
          <Column fill align={'space-around'} margin="0 10 0 10">
            <VCItemFieldValue
              key={'fullName'}
              fieldName="fullName"
              fieldValue={getLocalizedField(
                props.credential?.credentialSubject['fullName'],
              )}
              wellknown={props.wellknown}
            />
            <Row>
              <VCVerification
                wellknown={props.wellknown}
                isVerified={props.isVerified}
              />
            </Row>
          </Column>

          {isVCLoaded(props.credential, props.fields) && (
            <Image
              src={issuerLogo?.url}
              alt={issuerLogo?.alt_text}
              style={Theme.Styles.issuerLogo}
              resizeMethod="scale"
              resizeMode="contain"
            />
          )}

          {!Object.values(VCItemContainerFlowType).includes(props.flow) && (
            <>
              {props.vcMetadata.issuer === Issuers.Sunbird ||
              props.walletBindingResponse
                ? SvgImage.walletActivatedIcon()
                : SvgImage.walletUnActivatedIcon()}
              <Pressable
                onPress={props.KEBAB_POPUP}
                accessible={false}
                style={Theme.Styles.kebabPressableContainer}>
                <KebabPopUp
                  iconColor={setTextColor(props.wellknown)}
                  vcMetadata={props.vcMetadata}
                  iconName="dots-three-horizontal"
                  iconType="entypo"
                  isVisible={props.isKebabPopUp}
                  onDismiss={props.DISMISS}
                  service={props.service}
                  vcHasImage={faceImage !== undefined}
                />
              </Pressable>
            </>
          )}
          {selectableOrCheck}
        </Row>

        <WalletBinding service={props.service} vcMetadata={props.vcMetadata} />

        <RemoveVcWarningOverlay
          testID="removeVcWarningOverlay"
          service={props.service}
          vcMetadata={props.vcMetadata}
        />

        <HistoryTab service={props.service} vcMetadata={props.vcMetadata} />
      </Column>
    </ImageBackground>
  );
};

export interface VCItemContentProps {
  context: any;
  credential: VerifiableCredential;
  verifiableCredentialData: any;
  fields: [];
  wellknown: {};
  generatedOn: string;
  selectable: boolean;
  selected: boolean;
  isPinned?: boolean;
  service: any;
  onPress?: () => void;
  isDownloading?: boolean;
  flow?: string;
  walletBindingResponse: {};
  KEBAB_POPUP: () => {};
  DISMISS: () => {};
  isKebabPopUp: boolean;
  vcMetadata: VCMetadata;
  isVerified?: boolean;
}

VCCardViewContent.defaultProps = {
  isPinned: false,
};
