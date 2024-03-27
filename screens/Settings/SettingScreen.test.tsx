import React from 'react';
import {SettingScreen} from './SettingScreen';
import ShallowRenderer from 'react-test-renderer/shallow';
import mockedConstants from '../../__mocks__/react-native.mock';

describe('testing the settingsScreen component in Android and IOS', () => {
  beforeEach(() => {
    // Mock Platform module for Android
    jest.mock('expo-constants', () => {
      mockedConstants.Platform.OS = 'android';
      return mockedConstants;
    });
  });

  it('renders the SettingScreen component in android', () => {
    const renderer = new ShallowRenderer();
    const result = renderer.render(
      <SettingScreen
        triggerComponent={undefined}
        navigation={undefined}
        route={undefined}
      />,
    );
    expect(result).toMatchSnapshot();
  });

  it('renders the SettingScreen component in IOS', () => {
    // Clear the previous mock
    jest.resetModules();
    // Mock Platform module for IOS
    jest.mock('expo-constants', () => {
      mockedConstants.Platform.OS = 'ios';
      return mockedConstants;
    });

    const renderer = new ShallowRenderer();
    const result = renderer.render(
      <SettingScreen
        triggerComponent={undefined}
        navigation={undefined}
        route={undefined}
      />,
    );
    expect(result).toMatchSnapshot();
  });
});
