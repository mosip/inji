import React, {useEffect, useState} from 'react';
import {Pressable, View} from 'react-native';
import {ActorRefFrom} from 'xstate';
import {ErrorMessageOverlay} from '../../MessageOverlay';
import {Theme} from '../../ui/styleUtils';
import {VCMetadata} from '../../../shared/VCMetadata';
import {format} from 'date-fns';

import {VCCardSkeleton} from '../common/VCCardSkeleton';
import {VCCardViewContent} from './VCCardViewContent';
import {useVcItemController} from '../VCItemController';
import {getCredentialIssuersWellKnownConfig} from '../../../shared/openId4VCI/Utils';
import {CARD_VIEW_DEFAULT_FIELDS, isVCLoaded} from '../common/VCUtils';
import {
  VCItemEvents,
  VCItemMachine,
} from '../../../machines/VCItemMachine/VCItemMachine';

export const VCCardView: React.FC<VCItemProps> = props => {
  let {
    service,
    context,
    credential,
    verifiableCredentialData,
    walletBindingResponse,
    isKebabPopUp,
    isSavingFailedInIdle,
    storeErrorTranslationPath,
    generatedOn,
    DISMISS,
    KEBAB_POPUP,
  } = useVcItemController(props);

  let formattedDate =
    generatedOn && format(new Date(generatedOn), 'MM/dd/yyyy');

  useEffect(() => {
    service.send(VCItemEvents.UPDATE_VC_METADATA(props.vcMetadata));
  }, [props.vcMetadata]);

  const vc = props.isDownloading ? null : credential;

  const [fields, setFields] = useState([]);
  const [wellknown, setWellknown] = useState(null);
  useEffect(() => {
    getCredentialIssuersWellKnownConfig(
      verifiableCredentialData?.issuer,
      verifiableCredentialData?.wellKnown,
      verifiableCredentialData?.credentialTypes,
      CARD_VIEW_DEFAULT_FIELDS,
    ).then(response => {
      setWellknown(response.wellknown);
      setFields(response.fields);
    });
  }, [verifiableCredentialData?.wellKnown]);

  if (!isVCLoaded(credential, fields)) {
    return <VCCardSkeleton />;
  }

  return (
    <React.Fragment>
      <Pressable
        accessible={false}
        onPress={() => props.onPress(service)}
        style={
          props.selected
            ? Theme.Styles.selectedBindedVc
            : Theme.Styles.closeCardBgContainer
        }>
        <VCCardViewContent
          vcMetadata={props.vcMetadata}
          context={context}
          walletBindingResponse={walletBindingResponse}
          credential={vc}
          verifiableCredentialData={verifiableCredentialData}
          fields={fields}
          wellknown={wellknown}
          generatedOn={formattedDate}
          selectable={props.selectable}
          selected={props.selected}
          service={service}
          isPinned={props.isPinned}
          onPress={() => props.onPress(service)}
          isDownloading={props.isDownloading}
          flow={props.flow}
          isKebabPopUp={isKebabPopUp}
          DISMISS={DISMISS}
          KEBAB_POPUP={KEBAB_POPUP}
          isVerified={credential !== null}
        />
      </Pressable>
      <ErrorMessageOverlay
        isVisible={isSavingFailedInIdle}
        error={storeErrorTranslationPath}
        onDismiss={DISMISS}
        translationPath={'VcDetails'}
      />
    </React.Fragment>
  );
};

export interface VCItemProps {
  vcMetadata: VCMetadata;
  margin?: string;
  selectable?: boolean;
  selected?: boolean;
  onPress?: (vcRef?: ActorRefFrom<typeof VCItemMachine>) => void;
  onShow?: (vcRef?: ActorRefFrom<typeof VCItemMachine>) => void;
  isDownloading?: boolean;
  isPinned?: boolean;
  flow?: string;
}
