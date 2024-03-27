const ReactNativeAppAuth = jest.mock('react-native-app-auth', () => {
  return {
    // Mocked properties or methods
    authorize: jest.fn(),
    refresh: jest.fn(),
    // Add more mocks as needed
  };
});

export default ReactNativeAppAuth;
