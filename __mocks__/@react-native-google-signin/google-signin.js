const GoogleSignin = {
  // Mock your methods or properties here
  configure: jest.fn(),
  signIn: jest.fn(),
  // Add more mock methods or properties as needed
};

const statusCodes = {
  // Mock your status codes here
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  // Add more mock status codes as needed
};

export {GoogleSignin, statusCodes};
