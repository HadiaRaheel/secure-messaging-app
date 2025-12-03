const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// Create ssl directory if it doesn't exist
const sslDir = path.join(__dirname, 'ssl');
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir);
}

// Generate a key pair
console.log('Generating 2048-bit key pair...');
const keys = forge.pki.rsa.generateKeyPair(2048);

// Create a certificate
console.log('Creating self-signed certificate...');
const cert = forge.pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{
  name: 'commonName',
  value: 'HUES'
}, {
  name: 'countryName',
  value: 'PK'
}, {
  shortName: 'ST',
  value: 'Punjab'
}, {
  name: 'localityName',
  value: 'Islamabad'
}, {
  name: 'organizationName',
  value: 'Secure Messaging App'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.sign(keys.privateKey);

// Convert to PEM format
const pemKey = forge.pki.privateKeyToPem(keys.privateKey);
const pemCert = forge.pki.certificateToPem(cert);

// Save to files
fs.writeFileSync(path.join(sslDir, 'server.key'), pemKey);
fs.writeFileSync(path.join(sslDir, 'server.crt'), pemCert);

console.log('SSL certificate and key generated successfully!');
console.log('Files saved to:', sslDir);