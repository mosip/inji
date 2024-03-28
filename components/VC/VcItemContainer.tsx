import React from 'react';
import {VCCardView, VCItemProps} from './Views/VCCardView';

export const VcItemContainer: React.FC<VCItemProps> = props => {
  return <VCCardView {...props} />;
};
