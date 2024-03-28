import {logoType} from "../../machines/issuersMachine";

export interface VC {
    id?: string;
    idType?: VcIdType;
    credential?: DecodedCredential;
    verifiableCredential: VerifiableCredential;
    verifiablePresentation?: VerifiablePresentation;
    requestId?: string;
    isVerified?: boolean;
    lastVerifiedOn: number;
    shouldVerifyPresence?: boolean;
    walletBindingResponse?: WalletBindingResponse;
    credentialRegistry?: string;
    isPinned?: boolean;
    hashedId?: string;
}

export type VcIdType = 'UIN' | 'VID';

export interface DecodedCredential {
    biometrics: {
        face: string;
        finger: {
            left_thumb: string;
            right_thumb: string;
        };
    };
}

export interface CredentialSubject {
    //TODO: This should change to mandatory field if uin is also issued
    UIN?: string;
    VID?: string;
    addressLine1: LocalizedField[] | string;
    city: LocalizedField[] | string;
    dateOfBirth: string;
    email: string;
    fullName: LocalizedField[] | string;
    gender: LocalizedField[] | string;
    id: string;
    phone: string;
    face: string;
}

type VCContext = (string | Record<string, unknown>)[];

export interface Credential {
    '@context': VCContext;
    credentialSubject: CredentialSubject;
    id: string;
    issuanceDate: string;
    issuer: string;
    proof: {
        created: string;
        jws: string;
        proofPurpose: 'assertionMethod' | string;
        type: 'RsaSignature2018' | string;
        verificationMethod: string;
    };
    type: VerifiableCredentialType[];
}

export interface VerifiableCredential {
    issuerLogo: logoType;
    format: string;
    credential: Credential;
    wellKnown: string;
    credentialTypes: Object[];
}

export interface CredentialWrapper {
    verifiableCredential: VerifiableCredential;
    identifier: string;
    generatedOn: Date;
    issuerLogo: string;
}

export interface VerifiablePresentation {
    '@context': VCContext;
    verifiableCredential: VerifiableCredential[];
    type: 'VerifiablePresentation';
    proof: {
        created: string;
        jws: string;
        proofPurpose: 'authentication' | string;
        type: 'RsaSignature2018' | string;
        verificationMethod: string;
        challenge: string;
        domain: string;
    };
}

export type VerifiableCredentialType =
    | 'VerifiableCredential'
    | 'MOSIPVerfiableCredential'
    | string;

export interface VCLabel {
    singular: string;
    plural: string;
}

export interface LocalizedField {
    language: string;
    value: string;
}

export interface linkTransactionResponse {
    authFactors: Object[];
    authorizeScopes: null;
    clientName: string;
    configs: {};
    essentialClaims: string[];
    linkTransactionId: string;
    logoUrl: string;
    voluntaryClaims: string[];
}

export interface WalletBindingResponse {
    walletBindingId: string;
    keyId: string;
    thumbprint: string;
    expireDateTime: string;
}
