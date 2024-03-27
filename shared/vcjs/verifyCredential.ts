import vcjs from '@digitalcredentials/vc';
import jsonld from '@digitalcredentials/jsonld';
import {RsaSignature2018} from '../../lib/jsonld-signatures/suites/rsa2018/RsaSignature2018';
import {Ed25519Signature2018} from '../../lib/jsonld-signatures/suites/ed255192018/Ed25519Signature2018';
import {AssertionProofPurpose} from '../../lib/jsonld-signatures/purposes/AssertionProofPurpose';
import {PublicKeyProofPurpose} from '../../lib/jsonld-signatures/purposes/PublicKeyProofPurpose';
import {VerifiableCredential} from '../../types/VC/ExistingMosipVC/vc';
import {Credential} from '../../types/VC/EsignetMosipVC/vc';
import {getErrorEventData, sendErrorEvent} from '../telemetry/TelemetryUtils';
import {TelemetryConstants} from '../telemetry/TelemetryConstants';

// FIXME: Ed25519Signature2018 not fully supported yet.
// Ed25519Signature2018 proof type check is not tested with its real credential
const ProofType = {
  ED25519: 'Ed25519Signature2018',
  RSA: 'RsaSignature2018',
};

const ProofPurpose = {
  Assertion: 'assertionMethod',
  PublicKey: 'publicKey',
};

export async function verifyCredential(
  verifiableCredential: VerifiableCredential | Credential,
): Promise<VerificationResult> {
  try {
    let purpose: PublicKeyProofPurpose | AssertionProofPurpose;
    switch (verifiableCredential.proof.proofPurpose) {
      case ProofPurpose.PublicKey:
        purpose = new PublicKeyProofPurpose();
        break;
      case ProofPurpose.Assertion:
        purpose = new AssertionProofPurpose();
        break;
    }

    let suite: Ed25519Signature2018 | RsaSignature2018;
    const suiteOptions = {
      verificationMethod: verifiableCredential.proof.verificationMethod,
      date: verifiableCredential.proof.created,
    };
    switch (verifiableCredential.proof.type) {
      case ProofType.ED25519: {
        suite = new Ed25519Signature2018(suiteOptions);
        break;
      }
      case ProofType.RSA: {
        suite = new RsaSignature2018(suiteOptions);
        break;
      }
    }

    const vcjsOptions = {
      purpose,
      suite,
      credential: verifiableCredential,
      documentLoader: jsonld.documentLoaders.xhr(),
    };

    //ToDo - Have to remove once range error is fixed during verification
    const result = await vcjs.verifyCredential(vcjsOptions);
    return handleResponse(result, verifiableCredential);

    //ToDo Handle Expiration error message
  } catch (error) {
    return {
      isVerified: false,
      errorMessage: VerificationErrorType.TECHNICAL_ERROR,
    };
  }
}

function handleResponse(
  result: any,
  verifiableCredential: VerifiableCredential | Credential,
) {
  var errorMessage = VerificationErrorType.NO_ERROR;
  var isVerifiedFlag = true;

  if (!result?.verified) {
    let errorCodeName = result['results'][0].error.name;
    if (errorCodeName == 'jsonld.InvalidUrl') {
      errorMessage = VerificationErrorType.NETWORK_ERROR;
      isVerifiedFlag = false;
    } else if (errorCodeName == VerificationErrorType.RANGE_ERROR) {
      errorMessage = VerificationErrorType.RANGE_ERROR;
      const vcIdentifier = verifiableCredential.credentialSubject.UIN
        ? verifiableCredential.credentialSubject.UIN
        : verifiableCredential.credentialSubject.VID;
      sendErrorEvent(
        getErrorEventData(
          TelemetryConstants.FlowType.vcVerification,
          TelemetryConstants.ErrorId.vcVerificationFailed,
          TelemetryConstants.ErrorMessage.vcVerificationFailed + vcIdentifier,
        ),
      );
      isVerifiedFlag = true;
    } else {
      errorMessage = VerificationErrorType.TECHNICAL_ERROR;
      isVerifiedFlag = false;
    }
  }

  const verificationResult: VerificationResult = {
    isVerified: isVerifiedFlag,
    errorMessage: errorMessage,
  };
  return verificationResult;
}

const VerificationErrorType = {
  NO_ERROR: '',
  TECHNICAL_ERROR: 'technicalError',
  RANGE_ERROR: 'RangeError',
  NETWORK_ERROR: 'networkError',
  EXPIRATION_ERROR: 'expirationError',
};

export interface VerificationResult {
  errorMessage: string;
  isVerified: boolean;
}
