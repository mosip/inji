import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextItem } from './ui/TextItem';

export const DeviceInfoList: React.FC<DeviceInfoProps> = (props) => {
  const { t } = useTranslation('DeviceInfoList');

  return (
    <React.Fragment>
      <TextItem
        divider
        label={props.of === 'receiver' ? t('requestedBy') : t('sentBy')}
        text={props.deviceInfo.deviceName}
      />
    </React.Fragment>
  );
};

interface DeviceInfoProps {
  of: 'sender' | 'receiver';
  deviceInfo: DeviceInfo;
}

export interface DeviceInfo {
  deviceName: string;
  name: string;
  deviceId: string;
}
