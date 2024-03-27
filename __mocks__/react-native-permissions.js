const PermissionsMock = {
  checkMultiple: jest.fn(),
  PERMISSIONS: {
    // Add mocked permission constants here
    CAMERA: 'camera',
    STORAGE: 'storage',
    // Add more as needed
  },
  requestMultiple: jest.fn(),
  RESULTS: {
    // Add mocked result constants here
    GRANTED: 'granted',
    DENIED: 'denied',
    // Add more as needed
  },
};

export default PermissionsMock;
