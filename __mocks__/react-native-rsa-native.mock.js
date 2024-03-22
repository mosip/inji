const KeyPair = jest.fn();
const RSA = jest.fn();

// Customize the mock implementation as needed
KeyPair.mockImplementation(() => {
  return {
    // Mock KeyPair properties or methods
  };
});

RSA.mockImplementation(() => {
  return {
    // Mock RSA properties or methods
  };
});

export {KeyPair, RSA};
