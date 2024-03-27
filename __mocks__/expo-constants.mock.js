// Mocked values for expo-constants
const mockedConstants = {
  appOwnership: 'standalone',
  statusBarHeight: 10,
  // TODO: add global ENVs to run tests from PoV of an Android & an iOS device
  platform: {
    ios: {
      model: 'iPhone',
      platform: 'ios',
      statusBarHeight: 20, // Mocked statusBarHeight for iOS
    },
    android: {
      model: 'Android',
      platform: 'android',
      statusBarHeight: 24, // Mocked statusBarHeight for Android
    },
  },
  // Add other constants as needed for your tests
};

export default mockedConstants;
