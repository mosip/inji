import { ViewStyle, StyleSheet } from 'react-native';

export const Colors = {
  TabItemText: '#F2811D',
  DetailsText: '#F2811D',
  AddIdBtnBg: '#F2811D',
  ClearAddIdBtnBg: 'transparent',
  IconBg: '#F2811D',
  Black: '#231F20',
  Grey: '#B0B0B0',
  Grey5: '#E0E0E0',
  Grey6: '#F2F2F2',
  Orange: '#F2811D',
  LightGrey: '#FAF9FF',
  White: '#FFFFFF',
  Red: '#EB5757',
  Green: '#219653',
};

export const OpenCard = require('../../assets/ID-open.png');

export const CloseCard = require('../../assets/ID-closed.png');

export const ProfileIcon = require('../../assets/placeholder-photo.png');

export const MosipLogo = require('../../assets/mosip-logo.png');

export const Styles = StyleSheet.create({
  title: {
    color: Colors.Black,
    backgroundColor: 'transparent',
  },
  loadingTitle: {
    color: 'transparent',
    backgroundColor: Colors.Grey5,
    borderRadius: 4,
  },
  subtitle: {
    backgroundColor: 'transparent',
  },
  loadingSubtitle: {
    backgroundColor: Colors.Grey,
    borderRadius: 4,
  },
  detailsContainer: {
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.Grey6,
    borderRadius: 4,
    margin: 5,
  },
  closeDetailsContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
  },
  logoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: 300,
  },
  bgContainer: {
    borderRadius: 10,
    margin: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: -1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  successTag: {
    backgroundColor: Colors.Green,
    height: 43,
    flex: 1,
    alignItems: 'center',
    paddingLeft: 6,
  },
  closeDetailsHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 18,
    margin: 6,
  },
  logo: {
    height: 48,
    width: 40,
    marginRight: 10,
  },
  openDetailsContainer: {
    flex: 2,
    padding: 10,
  },
  details: {
    width: 290,
    marginLeft: 110,
    marginTop: 0,
  },
  labelPart: {
    borderRadius: 0,
    borderWidth: 0,
    width: 240,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    marginLeft: 4,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  closeCardImage: {
    width: 130,
    height: 150,
    resizeMode: 'cover',
  },
  openCardImage: {
    width: 130,
    height: 160,
    resizeMode: 'cover',
    borderRadius: 5,
    marginTop: -25,
    marginLeft: -14,
    padding: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: Colors.Grey,
    color: Colors.Black,
    flex: 1,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    fontWeight: '600',
    height: 40,
    lineHeight: 28,
    margin: 8,
    textAlign: 'center',
  },
  scannerContainer: {
    borderWidth: 4,
    borderColor: Colors.Black,
    borderRadius: 32,
    justifyContent: 'center',
    height: 300,
    width: 300,
    overflow: 'hidden',
  },
  scanner: {
    height: 400,
    width: '100%',
    margin: 'auto',
  },
  flipIconButton: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  tabIndicator: {
    backgroundColor: Colors.Orange,
  },
  tabContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  tabView: {
    flex: 1,
  },
  detailsText: {
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
  },
});

export function spacing(type: 'margin' | 'padding', values: string) {
  const [top, end, bottom, start] = values.split(' ').map(Number);

  return {
    [`${type}Top`]: top,
    [`${type}End`]: end != null ? end : top,
    [`${type}Bottom`]: bottom != null ? bottom : top,
    [`${type}Start`]: start != null ? start : end != null ? end : top,
  };
}

export type ElevationLevel = 0 | 1 | 2 | 3 | 4 | 5;

export function elevation(level: ElevationLevel): ViewStyle {
  // https://ethercreative.github.io/react-native-shadow-generator/

  if (level === 0) {
    return null;
  }

  const index = level - 1;

  return {
    shadowColor: Colors.Black,
    shadowOffset: {
      width: 0,
      height: [1, 1, 1, 2, 2][index],
    },
    shadowOpacity: [0.18, 0.2, 0.22, 0.23, 0.25][index],
    shadowRadius: [1.0, 1.41, 2.22, 2.62, 3.84][index],
    elevation: level,
    zIndex: level,
    borderRadius: 4,
    backgroundColor: Colors.White,
  };
}
