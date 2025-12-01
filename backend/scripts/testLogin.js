const http = require('http');

const testLogin = (email, password) => {
  const data = JSON.stringify({
    email,
    password
  });

  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: JSON.parse(body) });
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

// Test all users
const testUsers = [
  { email: 'jshyd05@gmail.com', password: 'test123', role: 'Your Account' },
  { email: 'farmer@test.com', password: 'test123', role: 'Farmer' },
  { email: 'marketplace@test.com', password: 'test123', role: 'Marketplace' },
  { email: 'admin@test.com', password: 'test123', role: 'Admin' }
];

(async () => {
  console.log('🧪 Testing Login Endpoint...\n');
  console.log('='.repeat(60));

  for (const user of testUsers) {
    try {
      const result = await testLogin(user.email, user.password);
      if (result.status === 200) {
        console.log(`✅ ${user.role} Login SUCCESS`);
        console.log(`   Email: ${user.email}`);
        console.log(`   User: ${result.body.user.name}`);
        console.log(`   Role: ${result.body.user.role}`);
      } else {
        console.log(`❌ ${user.role} Login FAILED`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Error: ${result.body.error}`);
      }
    } catch (error) {
      console.log(`❌ ${user.role} Login ERROR`);
      console.log(`   Error: ${error.message}`);
    }
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('✨ Login tests complete!');
  console.log('\nNow try logging in from your mobile app with:');
  console.log('  Email: jshyd05@gmail.com');
  console.log('  Password: test123');
  console.log('='.repeat(60));
})();
