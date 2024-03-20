import React from 'react';
import {SettingScreen} from './SettingScreen';
import ShallowRenderer from 'react-test-renderer/shallow';

it('Matches snapshot', () => {
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

// it('renders the SettingScreen component', () => {
//   const SettingsScreenComponent = renderer
//     .create(
//       <SettingScreen
//         triggerComponent={undefined}
//         navigation={undefined}
//         route={undefined}
//       />,
//     )
//     .toJSON();

//   expect(SettingsScreenComponent).toMatchSnapshot();
// });
