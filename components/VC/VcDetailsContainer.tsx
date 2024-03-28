import React from 'react';
import {VCDetailView, VCItemDetailsProps} from './Views/VCDetailView';

export const VcDetailsContainer: React.FC<VCItemDetailsProps> = props => {
  return <VCDetailView {...props} />;
};
