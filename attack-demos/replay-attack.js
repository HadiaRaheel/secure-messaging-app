// Replay Attack Demonstration

console.log('=== Replay Attack Demonstration ===\n');

console.log('SCENARIO 1: Without Replay Protection');
console.log('--------------------------------------');

const message1 = {
  from: 'Alice',
  to: 'Bank',
  content: 'Transfer $100 to Bob',
  encrypted: 'a8f3k2j...'
};

console.log('1. Alice sends: "Transfer $100 to Bob"');
console.log('   Encrypted message:', message1.encrypted);

console.log('\n 2. Attacker captures the encrypted message');
console.log('   Attacker saves:', message1.encrypted);

console.log('\n 3. Attacker replays the same message 10 times');
for (let i = 1; i <= 3; i++) {
  console.log(`   Replay #${i}:`, message1.encrypted);
}

console.log('\n  ATTACK SUCCESSFUL!');
console.log('   Bank processes: Transfer $100 × 10 = $1000 transferred!');
console.log('   Alice only authorized $100');

console.log('\n\nSCENARIO 2: With Replay Protection');
console.log('-----------------------------------');

const messages = [
  { seq: 1, nonce: Date.now(), timestamp: new Date(), content: 'Transfer $100' },
  { seq: 2, nonce: Date.now() + 1, timestamp: new Date(), content: 'Transfer $50' }
];

console.log('Protection mechanisms:');
console.log('1. Sequence numbers (1, 2, 3...)');
console.log('2. Nonces (random unique values)');
console.log('3. Timestamps (reject old messages)');

console.log('\nAlice sends message #1:');
console.log('  Sequence: 1');
console.log('  Nonce:', messages[0].nonce);
console.log('  Timestamp:', messages[0].timestamp.toISOString());

console.log('\n  Attacker tries to replay message #1');
console.log(' REJECTED! Sequence number 1 already used');

console.log('\n Attacker tries with old timestamp (6 minutes ago)');
console.log(' REJECTED! Message too old (> 5 minutes)');

console.log('\n Replay attack prevented!');
