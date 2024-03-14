import React from 'react';
import renderer from 'react-test-renderer';
import {HomeScreen} from '../screens/Home/HomeScreen';

describe.skip('<HomeScreen />', () => {
  it('Testing the HomeScreen component', () => {
    // Render the component
    const homeScreenComponent = renderer.create(<HomeScreen />).toJSON();
    expect(homeScreenComponent).toMatchSnapshot();
  });
});
