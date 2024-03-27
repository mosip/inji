import renderer from 'react-test-renderer';
import React from 'react';
import {Text} from './Text';

describe('<Text />', () => {
  it('Testing the Text component', () => {
    // Render the component
    const textComponent = renderer
      .create(<Text children="Testing react native text component" />)
      .toJSON();
    expect(textComponent).toMatchSnapshot();
  });
});
