import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto'; // https://stackoverflow.com/a/75787849
import {registerRootComponent} from 'expo';
import './globals.js';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
