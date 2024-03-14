const ShimmerPlaceHolderMock = jest.mock(
  'react-native-shimmer-placeholder',
  () => {
    return {
      // Add mocked properties or methods here
      default: jest.fn(),
    };
  },
);

export default ShimmerPlaceHolderMock;
