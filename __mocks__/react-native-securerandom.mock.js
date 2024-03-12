const mockGenSecureRandom = jest.fn();

// You may customize the mock implementation based on your needs
mockGenSecureRandom.mockImplementation((length, callback) => {
  const randomBytes = Array.from({length}, () =>
    Math.floor(Math.random() * 256),
  );
  callback(null, randomBytes);
});

export default mockGenSecureRandom;
