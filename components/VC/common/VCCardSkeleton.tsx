import {Theme} from '../../ui/styleUtils';
import {Column, Row} from '../../ui';
import {ImageBackground, View} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';

export const VCCardSkeleton = () => {
  return (
    <View style={Theme.Styles.closeCardBgContainer}>
      <ImageBackground
        source={Theme.CloseCard}
        resizeMode="stretch"
        style={Theme.Styles.vertloadingContainer}>
        <Column>
          <Row crossAlign="center">
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              width={40}
              height={53}
              style={{borderRadius: 5}}
            />
            <Column fill align={'space-around'} margin={'0 10 0 10'}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                width={100}
                style={{borderRadius: 5, marginTop: 5}}
              />
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                width={50}
                style={{borderRadius: 5, marginTop: 5}}
              />
            </Column>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              width={35}
              height={35}
              style={{borderRadius: 5}}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              width={18}
              height={22}
              style={{borderRadius: 5, marginLeft: 10}}
            />
          </Row>
        </Column>
      </ImageBackground>
    </View>
  );
};
