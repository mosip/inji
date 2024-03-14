const LinearGradientMock = jest.mock('react-native-linear-gradient', () => {
  return {
    // Add mocked properties or methods here
    default: jest.fn(),
  };
});

export default LinearGradientMock;
