import React from 'react';
import renderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-argon2');

jest.mock('@react-native-google-signin/google-signin');

jest.mock('@mosip/tuvali');

jest.mock('react-native-bluetooth-state-manager');

jest.mock('react-native-permissions');

describe('<App />', () => {
  it('has 1 child', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree.children.length).toBe(1);
  });
});
