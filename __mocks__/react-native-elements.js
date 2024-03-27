const Button = jest.fn().mockReturnValue(null);
const Icon = jest.fn().mockReturnValue(null);

// Mock the ButtonProps
const ButtonProps = {
  // Add any mocked props you need
};

const ListItem = {
  Content: ({children}) => <div>{children}</div>,
};

// Export the mock
export {Button as RNEButton, ButtonProps as RNEButtonProps, Icon, ListItem};
