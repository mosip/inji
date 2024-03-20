jest.mock('telemetry-sdk', () => {
  const TelemetrySDK = {
    trackEvent: jest.fn(),
    trackPageView: jest.fn(),
    error: (data, {}) => jest.fn(data),
  };

  return TelemetrySDK;
});
