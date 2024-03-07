class RsaVerificationKey2018 {
  constructor(options) {
    // Your mock implementation for the constructor
  }

  // Add any other methods or properties you need to mock
  async sign() {
    return '';
  }
  async verifySignature(verifyData, verificationMethod, proof) {
    return true;
  }
  async assertVerificationMethod() {}
  async getVerificationMethod() {
    return 'mockVerificationMethod';
  }
  async matchProof() {
    return true;
  }
}

export default RsaVerificationKey2018;
