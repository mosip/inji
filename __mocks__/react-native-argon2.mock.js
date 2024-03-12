const mockArgon2 = jest.fn();

mockArgon2.hash = jest.fn();
mockArgon2.verify = jest.fn();

export default mockArgon2;
