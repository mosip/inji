export const generateSecureRandom = jest.fn().mockResolvedValue(
  // Return an array or buffer of random bytes
  // For example, to return an array of 64 random bytes:
  new Uint8Array(64).map(() => Math.floor(Math.random() * 256)),
);
