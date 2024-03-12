import React from 'react';
import renderer from 'react-test-renderer';
import {HomeScreenLayout} from '../screens/HomeScreenLayout';

/*
jest.mock('@react-navigation/native-stack');

jest.mock('expo-constants', () => require('../__mocks__/expo-constants.mock'));

jest.mock('react-native-argon2', () =>
  require('../__mocks__/react-native-argon2.mock'),
);

jest.mock('react-native-securerandom', () =>
  require('../__mocks__/react-native-securerandom.mock'),
);

jest.mock('react-native-keychain', () =>
  require('../__mocks__/react-native-keychain.mock'),
);

jest.mock('telemetry-sdk', () => require('../__mocks__/telemetry-sdk.mock'));

jest.mock('react-native-rsa-native', () =>
  require('../__mocks__/react-native-rsa-native.mock'),
);

jest.mock('react-native-localize', () =>
  require('../__mocks__/react-native-localize.mock'),
);

jest.mock('expo-localization', () =>
  require('../__mocks__/expo-localization.mock'),
);

jest.mock('iso-639-3', () => (iso6393To1 = jest.fn()));

jest.mock('react-native-fs', () =>
  require('../__mocks__/react-native-fs.mock'),
);

jest.mock('react-native-zip-archive', () =>
  require('../__mocks__/react-native-zip-archive.mock'),
);

jest.mock('react-native-secure-key-store', () =>
  require('../__mocks__/react-native-secure-key-store.mock'),
);

jest.mock('@mosip/tuvali');

jest.mock('react-native-permissions');

*/
describe('<HomeScreenLayout />', () => {
  it('Testing the HomeScreenLayout component', () => {
    // Render the component
    const homeScreenLayoutComponent = renderer
      .create(<HomeScreenLayout />)
      .toJSON();
    expect(homeScreenLayoutComponent).toMatchSnapshot();
  });
});
