import React from 'react';
import renderer from 'react-test-renderer';
import {Text} from '../components/ui';

describe('<Text />', () => {
  it('Testing the Text component', () => {
    // Render the component
    const textComponent = renderer.create(<Text />).toJSON();
    expect(textComponent).toMatchSnapshot();
  });
});
