jest.mock('react-native-mmkv-storage', () => ({
  MMKVLoader: () => ({
    initialize: () => ({
      getItem: key => jest.fn(),
      setItem: (key, data) => jest.fn(),
      indexer: {
        strings: {
          getKeys: () => jest.fn(),
        },
      },
    }),
  }),
}));
