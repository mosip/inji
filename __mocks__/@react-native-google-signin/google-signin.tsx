export const mockUserInfo: User = {
  idToken: 'mockIdToken',
  serverAuthCode: 'mockServerAuthCode',
  scopes: [],
  user: {
    email: 'mockEmail',
    id: 'mockId',
    givenName: 'mockGivenName',
    familyName: 'mockFamilyName',
    photo: null,
    name: 'mockFullName',
  },
};

const GoogleSignin = {
  configure: jest.fn(),
  hasPlayServices: jest.fn().mockResolvedValue(true),
  getTokens: jest.fn().mockResolvedValue({
    accessToken: 'mockAccessToken',
    idToken: 'mockIdToken',
  }),
  signIn: jest.fn().mockResolvedValue(mockUserInfo),
  signInSilently: jest.fn().mockResolvedValue(mockUserInfo),
  revokeAccess: jest.fn().mockResolvedValue(null),
  signOut: jest.fn().mockResolvedValue(null),
  isSignedIn: jest.fn().mockResolvedValue(true),
  addScopes: jest.fn().mockResolvedValue(mockUserInfo),
  getCurrentUser: jest.fn().mockResolvedValue(mockUserInfo),
  clearCachedAccessToken: jest.fn().mockResolvedValue(null),
};

const statusCodes = {
  SIGN_IN_CANCELLED: 'mock_SIGN_IN_CANCELLED',
  IN_PROGRESS: 'mock_IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'mock_PLAY_SERVICES_NOT_AVAILABLE',
  SIGN_IN_REQUIRED: 'mock_SIGN_IN_REQUIRED',
};

export interface User {
  user: {
    id: string;
    name: string | null;
    email: string;
    photo: string | null;
    familyName: string | null;
    givenName: string | null;
  };
  scopes?: string[];
  idToken: string | null;
  /**
   * Not null only if a valid webClientId and offlineAccess: true was
   * specified in configure().
   */
  serverAuthCode: string | null;
}

export {GoogleSignin, statusCodes};
