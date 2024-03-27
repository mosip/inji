const mockArgon2 = jest.fn().mockResolvedValue({
  hash: jest.fn(),
  verify: jest.fn(),
  rawHash: 'mockedRawHashValue',
});

export default mockArgon2;
