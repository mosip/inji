import vcjs from '@digitalcredentials/vc';
import jsonld from '@digitalcredentials/jsonld';
import {RsaSignature2018} from '../../lib/jsonld-signatures/suites/rsa2018/RsaSignature2018';
import {VerifiablePresentation} from '../../types/VC/vc';

export async function verifyPresentation(
  presentation: VerifiablePresentation,
  challenge: string,
): Promise<boolean> {
  const suite = new RsaSignature2018({
    verificationMethod: presentation.proof.verificationMethod,
    date: presentation.proof.created,
  });

  const result = await vcjs.verify({
    presentation,
    challenge,
    suite,
    documentLoader: jsonld.documentLoaders.xhr(),
  });

  return result.verified;
}
