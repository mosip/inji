const Camera = {
  // Mocked Camera properties or methods here
  takePictureAsync: jest.fn(),
  recordAsync: jest.fn(),
  Constants: {
    Type: {
      front: 'front',
      back: 'back',
    },
  },
};

const CameraCapturedPicture = jest.fn();

const PermissionResponse = {
  granted: 'granted',
  denied: 'denied',
  undetermined: 'undetermined',
};

export {Camera, CameraCapturedPicture, PermissionResponse};
