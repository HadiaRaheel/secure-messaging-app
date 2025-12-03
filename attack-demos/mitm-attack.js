const crypto = require('crypto');

console.log('=== MITM Attack Demonstration ===\n');

// ============================================
// SCENARIO 1: Insecure DH Exchange (No Signatures)
// ============================================
console.log('SCENARIO 1: Insecure DH Exchange (No Signatures)');
console.log('------------------------------------------------');

// Alice generates her DH key pair
console.log('1. Alice generates DH key pair');
const alice = crypto.createDiffieHellman(2048);
const aliceKeys = alice.generateKeys();
console.log(`   Alice public key: ${aliceKeys.toString('hex').substring(0, 32)}...`);

// Attacker (Eve) intercepts and generates her own keys
console.log('\n  2. ATTACKER (Eve) INTERCEPTS!');
const eve = crypto.createDiffieHellman(alice.getPrime(), alice.getGenerator());
const eveKeys = eve.generateKeys();
console.log(`   Eve generates her own DH key pair`);
console.log(`   Eve public key: ${eveKeys.toString('hex').substring(0, 32)}...`);

// Bob generates his DH key pair
console.log('\n3. Bob generates DH key pair');
const bob = crypto.createDiffieHellman(alice.getPrime(), alice.getGenerator());
const bobKeys = bob.generateKeys();
console.log(`   Bob public key: ${bobKeys.toString('hex').substring(0, 32)}...`);

// Eve performs man-in-the-middle attack
console.log('\n4. Eve intercepts and substitutes keys:');
console.log('   Eve sends her key to Alice (Alice thinks it\'s Bob\'s key)');
const aliceSharedSecret = alice.computeSecret(eveKeys);
console.log(`   Alice computes shared secret with Eve: ${aliceSharedSecret.toString('hex').substring(0, 32)}...`);

console.log('   Eve sends her key to Bob (Bob thinks it\'s Alice\'s key)');
const bobSharedSecret = bob.computeSecret(eveKeys);
console.log(`   Bob computes shared secret with Eve: ${bobSharedSecret.toString('hex').substring(0, 32)}...`);

console.log('\n ATTACK SUCCESSFUL!');
console.log('   Eve can decrypt Alice\'s messages using: ' + aliceSharedSecret.toString('hex').substring(0, 32) + '...');
console.log('   Eve can decrypt Bob\'s messages using: ' + bobSharedSecret.toString('hex').substring(0, 32) + '...');
console.log('   Alice and Bob think they\'re secure, but Eve sees EVERYTHING!');
console.log('   Eve can read, modify, or inject messages without detection\n');


// ============================================
// SCENARIO 2: Protected DH with Digital Signatures
// ============================================
console.log('\n' + '='.repeat(60));
console.log('SCENARIO 2: DH with Digital Signatures (PROTECTED)');
console.log('='.repeat(60));

// Generate RSA key pairs for Alice and Bob (for signing)
console.log('\n1. Setup: Alice and Bob generate RSA key pairs for signatures');
const aliceRSA = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});
const bobRSA = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});
console.log('   ✓ Alice has RSA key pair (for signing/verifying)');
console.log('   ✓ Bob has RSA key pair (for signing/verifying)');

// Generate new DH keys for this scenario
console.log('\n2. Alice generates DH key pair and SIGNS it with her RSA private key');
const alice2 = crypto.createDiffieHellman(2048);
const aliceKeys2 = alice2.generateKeys();
console.log(`   Alice DH public key: ${aliceKeys2.toString('hex').substring(0, 32)}...`);

// Alice signs her DH public key
const aliceSignature = crypto.sign('sha256', aliceKeys2, {
  key: aliceRSA.privateKey,
  padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
});
console.log(`   Alice signature: ${aliceSignature.toString('hex').substring(0, 32)}...`);

// Bob generates his keys and signs them
console.log('\n3. Bob generates DH key pair and SIGNS it with his RSA private key');
const bob2 = crypto.createDiffieHellman(alice2.getPrime(), alice2.getGenerator());
const bobKeys2 = bob2.generateKeys();
console.log(`   Bob DH public key: ${bobKeys2.toString('hex').substring(0, 32)}...`);

const bobSignature = crypto.sign('sha256', bobKeys2, {
  key: bobRSA.privateKey,
  padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
});
console.log(`   Bob signature: ${bobSignature.toString('hex').substring(0, 32)}...`);

// Eve tries to intercept again
console.log('\n 4. Eve TRIES to perform MITM attack again...');
const eve2 = crypto.createDiffieHellman(alice2.getPrime(), alice2.getGenerator());
const eveKeys2 = eve2.generateKeys();
console.log(`   Eve generates her own DH keys: ${eveKeys2.toString('hex').substring(0, 32)}...`);
console.log('   Eve intercepts Alice\'s message and tries to substitute her own key...');

// Eve tries to sign with her own key (but doesn't have Alice's private key)
console.log('\n5. Eve tries to forge Alice\'s signature...');
const eveRSA = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});
const eveSignature = crypto.sign('sha256', eveKeys2, {
  key: eveRSA.privateKey,  // Eve's own key, not Alice's!
  padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
});
console.log('   Eve creates signature with HER OWN private key (not Alice\'s)');

// Bob verifies the signature using Alice's PUBLIC key
console.log('\n6. Bob receives the message and verifies signature with Alice\'s PUBLIC key:');
const isValidSignature = crypto.verify(
  'sha256',
  eveKeys2,  // Eve's key that she tried to send
  {
    key: aliceRSA.publicKey,  // Alice's real public key
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  },
  eveSignature  // Eve's signature
);

console.log(`   Signature verification result: ${isValidSignature}`);

if (!isValidSignature) {
  console.log('\n ATTACK FAILED! ');
  console.log('   ✓ Bob detects that signature is INVALID');
  console.log('   ✓ Bob knows this is NOT from Alice');
  console.log('   ✓ Bob REJECTS the key exchange');
  console.log('   ✓ Bob terminates the connection');
  console.log('   ✓ Eve CANNOT decrypt any messages');
  console.log('   ✓ MITM attack is PREVENTED! ');
}

// Now show the CORRECT signature verification
console.log('\n7. Legitimate key exchange between Alice and Bob:');
console.log('   Alice sends: [DH Public Key + Signature]');
console.log('   Bob verifies Alice\'s signature with Alice\'s PUBLIC key:');

const aliceSignatureValid = crypto.verify(
  'sha256',
  aliceKeys2,  // Alice's real DH key
  {
    key: aliceRSA.publicKey,  // Alice's real public key
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  },
  aliceSignature  // Alice's real signature
);

console.log(`   Signature verification: ${aliceSignatureValid ? ' VALID' : ' INVALID'}`);

if (aliceSignatureValid) {
  console.log('   ✓ Bob confirms this is REALLY from Alice');
  console.log('   ✓ Bob proceeds with key exchange');
  
  // Bob verifies and computes shared secret
  const bobVerifiedSecret = bob2.computeSecret(aliceKeys2);
  console.log(`   ✓ Bob computes shared secret: ${bobVerifiedSecret.toString('hex').substring(0, 32)}...`);
  
  // Alice does the same
  console.log('\n   Bob sends: [DH Public Key + Signature]');
  console.log('   Alice verifies Bob\'s signature with Bob\'s PUBLIC key:');
  
  const bobSignatureValid = crypto.verify(
    'sha256',
    bobKeys2,
    {
      key: bobRSA.publicKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    },
    bobSignature
  );
  
  console.log(`   Signature verification: ${bobSignatureValid ? ' VALID' : ' INVALID'}`);
  
  if (bobSignatureValid) {
    const aliceVerifiedSecret = alice2.computeSecret(bobKeys2);
    console.log('   Alice confirms this is REALLY from Bob');
    console.log(`   Alice computes shared secret: ${aliceVerifiedSecret.toString('hex').substring(0, 32)}...`);
    
    // Verify they match
    console.log('\n8. Verification:');
    if (aliceVerifiedSecret.equals(bobVerifiedSecret)) {
      console.log('   Both parties have the SAME shared secret');
      console.log('   Secure communication established');
      console.log('   Eve is COMPLETELY BLOCKED from the conversation');
    }
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('SUMMARY: How Digital Signatures Prevent MITM');
console.log('='.repeat(60));
console.log('\nWithout Signatures:');
console.log('  Attacker can substitute their own keys');
console.log('  No way to verify key authenticity');
console.log('  Attacker sees all communication');
console.log('\nWith Digital Signatures:');
console.log('  Each party signs their DH public key with RSA private key');
console.log('  Receiver verifies signature using sender\'s RSA public key');
console.log('  Attacker cannot forge signatures (lacks private key)');
console.log('  Any key substitution is detected and rejected');
console.log('  MITM attack is PREVENTED');
console.log('\n' + '='.repeat(60));