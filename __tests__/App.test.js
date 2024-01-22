import React from 'react';
import renderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-argon2');

describe('<App />', () => {
  it('has 1 child', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree.children.length).toBe(1);
  });
});
