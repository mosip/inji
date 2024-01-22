import mock from 'jest';
import argon2 from 'react-native-argon2';

jest.mock('react-native-argon2', {
  argon2: (pwd, salt, config) => pwd + salt,
});
