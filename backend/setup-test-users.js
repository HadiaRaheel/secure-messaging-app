// backend/setup-test-users.js
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

const testUsers = [
  { username: 'alice', password: 'alice123' },
  { username: 'bob', password: 'bob123' },
  { username: 'charlie', password: 'charlie123' }
];

async function setupTestUsers() {
  console.log('\n🔧 Setting up test users...\n');
  
  for (const user of testUsers) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/register`,
        user
      );
      
      console.log(`✓ Created user: ${user.username}`);
      console.log(`  User ID: ${response.data.userId}`);
      
    } catch (error) {
      if (error.response?.status === 400 && 
          error.response.data.message.includes('already exists')) {
        console.log(`ℹ User ${user.username} already exists (skipping)`);
      } else {
        console.log(`✗ Failed to create ${user.username}:`, 
          error.response?.data?.message || error.message);
      }
    }
  }
  
  console.log('\n✓ Test users setup complete!\n');
  console.log('You can now run:');
  console.log('  node test-replay-attack.js');
  console.log('  node mitm-attack.js\n');
}

setupTestUsers();