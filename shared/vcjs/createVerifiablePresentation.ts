import vcjs from '@digitalcredentials/vc';
import jsonld from '@digitalcredentials/jsonld';
// import { RSAKeyPair } from '@digitalcredentials/jsonld-signatures';
import {RsaSignature2018} from '../../lib/jsonld-signatures/suites/rsa2018/RsaSignature2018';
import {VerifiableCredential, VerifiablePresentation} from '../../types/VC/vc';

export function createVerifiablePresentation(
  vc: VerifiableCredential,
  challenge: string,
): Promise<VerifiablePresentation> {
  const presentation = vcjs.createPresentation({
    verifiableCredential: [vc],
  });

  // TODO: private key to sign VP
  // const key = new RSAKeyPair({ ... })
  const suite = new RsaSignature2018({
    verificationMethod: vc.proof.verificationMethod,
    date: vc.proof.created,
    // TODO: key
  });

  return vcjs.signPresentation({
    presentation,
    suite,
    challenge,
    documentLoader: jsonld.documentLoaders.xhr(),
  });
}
