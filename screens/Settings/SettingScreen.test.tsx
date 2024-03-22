import React from 'react';
import {SettingScreen} from './SettingScreen';
import ShallowRenderer from 'react-test-renderer/shallow';
import { Theme } from '../../components/ui/styleUtils';
import {SvgImage} from '../../components/ui/svg';

describe('settings screen on Android', () => {
it('Matches snapshot', () => {
  jest.mock('react-native-elements', () => {
    const { View } = require('react-native');
    return {
      ListItem: {
        Content: ({ children }) => <View>{children}</View>,
      }
    };
  });
  const renderer = new ShallowRenderer();
  const result = renderer.render(
    <SettingScreen
      triggerComponent={<Icon
        name="settings"
        type="simple-line-icon"
        size={21}
        style={Theme.Styles.IconContainer}
        color={Theme.Colors.Icon}
      }
      navigation={undefined}
      route={undefined}
    />,
  );
  expect(result).toMatchSnapshot();
});



}) 
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
