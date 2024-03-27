const {NativeModules} = require('react-native');

const RNFingerprintChange = require('react-native-biometrics-changed');

// Mock the NativeModules for 'react-native-biometrics-changed'
RNFingerprintChange.NativeModules = {
  ...RNFingerprintChange.NativeModules,
  // Add any mocked properties or methods you need
};

module.exports = RNFingerprintChange;
