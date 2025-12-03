const axios = require('axios');

async function testLogs() {
  try {
    // Login first
    const loginRes = await axios.post(
      'http://localhost:5000/api/auth/login',
      { username: 'alice', password: 'alice123' }
    );
    
    const token = loginRes.data.token;
    
    // Get all logs
    console.log('=== System Logs ===\n');
    const logsRes = await axios.get(
      'http://localhost:5000/api/logs',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log(`Total logs: ${logsRes.data.length}\n`);
    
    // Show last 10 logs
    logsRes.data.slice(0, 10).forEach(log => {
      console.log(`[${log.severity}] ${log.type}`);
      console.log(`  User: ${log.username || 'N/A'}`);
      console.log(`  Time: ${new Date(log.timestamp).toLocaleString()}`);
      console.log(`  Details: ${log.details}\n`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogs();
