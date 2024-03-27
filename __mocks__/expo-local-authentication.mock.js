const mockLocalAuthentication = jest.fn();

mockLocalAuthentication.hasHardwareAsync = jest.fn(() => Promise.resolve(true));
mockLocalAuthentication.supportedAuthenticationTypesAsync = jest.fn(() =>
  Promise.resolve(['fingerprint']),
);
mockLocalAuthentication.authenticateAsync = jest.fn(() =>
  Promise.resolve({success: true}),
);

export default mockLocalAuthentication;
