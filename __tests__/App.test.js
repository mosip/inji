import React from 'react';
import renderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-argon2');

jest.mock('@mosip/tuvali');

jest.mock('react-native-bluetooth-state-manager');

jest.mock('react-native-permissions');

jest.mock('react-native-linear-gradient', () => (LinearGradient = jest.fn()));

jest.mock('expo-camera', () => (Camera = jest.fn()));

jest.mock('base58-universal/main', () => require('../__mocks__/base58-universal-main.js'));

describe('<App />', () => {
  it('has 1 child', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree.children.length).toBe(1);
  });
});
