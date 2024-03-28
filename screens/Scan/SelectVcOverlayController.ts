import {useState} from 'react';
import {ActorRefFrom} from 'xstate';
import {VC} from '../../types/VC/vc';
import {VCMetadata} from '../../shared/VCMetadata';
import {VCItemMachine} from '../../machines/VCItemMachine/VCItemMachine';

export function useSelectVcOverlay(props: SelectVcOverlayProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(null);
  const [selectedVcRef, setSelectedVcRef] =
    useState<ActorRefFrom<typeof VCItemMachine>>(null);

  return {
    selectVcItem,
    selectedIndex,

    onSelect: () => {
      const {serviceRefs, ...vc} = selectedVcRef.getSnapshot().context;
      props.onSelect(vc);
    },

    onVerifyAndSelect: () => {
      const {serviceRefs, ...vc} = selectedVcRef.getSnapshot().context;
      props.onVerifyAndSelect(vc);
    },
  };

  function selectVcItem(index: number) {
    return (vcRef: ActorRefFrom<typeof VCItemMachine>) => {
      setSelectedIndex(index);
      setSelectedVcRef(vcRef);
    };
  }
}

export interface SelectVcOverlayProps {
  isVisible: boolean;
  receiverName: string;
  vcMetadatas: VCMetadata[];
  onSelect: (vc: VC) => void;
  onVerifyAndSelect: (vc: VC) => void;
  onCancel: () => void;
}
