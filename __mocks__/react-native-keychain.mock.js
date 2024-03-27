const mockReactNativeKeychain = {
  setGenericPassword: jest.fn(),
  getGenericPassword: function () {
    return {
      username: 'testuser',
      password: 'testpassword',
    };
  },
  resetGenericPassword: jest.fn(),
};
export default mockReactNativeKeychain;
