const mockedLocales = ['en-US', 'fr-FR', 'es-ES'];

const mockRNLocalize = {
  locales: mockedLocales,
  getTimeZone: jest.fn(),
};

export default mockRNLocalize;
