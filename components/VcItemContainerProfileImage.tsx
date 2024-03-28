import {VCItemContentProps} from './VC/Views/VCCardViewContent';
import {ImageBackground} from 'react-native';
import {Theme} from './ui/styleUtils';
import React from 'react';
import {ProfileIcon} from './ProfileIcon';
import {SvgImage} from './ui/svg';

export const VcItemContainerProfileImage = (props: VCItemContentProps) => {
  const imageUri = props.verifiableCredentialData.face;

  return imageUri ? (
    <ImageBackground
      imageStyle={Theme.Styles.faceImage}
      source={{uri: imageUri}}
      style={Theme.Styles.closeCardImage}>
      {props?.isPinned && SvgImage.pinIcon()}
    </ImageBackground>
  ) : (
    <>
      <ProfileIcon
        isPinned={props?.isPinned}
        profileIconContainerStyles={Theme.Styles.ProfileIconContainer}
        profileIconSize={30}
      />
    </>
  );
};
