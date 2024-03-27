import {ActivityLog, getActionText} from './ActivityLogEvent';

describe('ActivityLog', () => {
  let instance;

  beforeEach(() => {
    instance = new ActivityLog();
  });

  it('Activity log instance should have a timestamp set', () => {
    expect(instance.timestamp).not.toBeUndefined();
  });

  it('logTamperedVCs() should have the tampered vc removed removed type set', () => {
    expect(ActivityLog.logTamperedVCs().type).toMatch('TAMPERED_VC_REMOVED');
  });
});

describe('getActionText', () => {
  let activityLog;
  let mockIl18nfn;
  beforeEach(() => {
    mockIl18nfn = jest.fn();
    activityLog = new ActivityLog({
      id: 'mockId',
      idType: 'mockIDtype',
      _vcKey: 'mock_vc_key',
      type: 'mockType',
      timestamp: 1234,
      deviceName: 'fakeDevice',
      vcLabel: 'fakeVClabel',
    });
  });
  // BDD examples
  it('should fetch id type from translation file mock', () => {
    mockIl18nfn.mockImplementation(input => {
      if (input === `VcDetails:mockIDtype`) {
        return 'National ID';
      }
    });
    getActionText(activityLog, mockIl18nfn);
    expect(mockIl18nfn).toHaveBeenCalledWith(`VcDetails:mockIDtype`);
    expect(mockIl18nfn).toHaveBeenCalledWith('mockType', {
      idType: 'National ID',
      id: 'mockId',
    });
    expect(mockIl18nfn).toHaveBeenCalledTimes(2);
    // TODO: assert the returned string
  });
  it('should not fetch id type from translation file mock', () => {
    activityLog.idType = undefined;
    getActionText(activityLog, mockIl18nfn);
    expect(mockIl18nfn).toHaveBeenCalledWith('mockType', {
      idType: '',
      id: 'mockId',
    });
    expect(mockIl18nfn).toHaveBeenCalledTimes(1);
  });
});
