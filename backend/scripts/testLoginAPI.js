const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function testLogin(email, password, expectedRole) {
  try {
    console.log(`\n=== Testing login for ${email} ===`);
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });

    const { user, token } = response.data;
    console.log(`✓ Login successful`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Expected Role: ${expectedRole}`);

    if (user.role === expectedRole) {
      console.log(`  ✓ Role matches!`);
    } else {
      console.log(`  ✗ Role mismatch! Expected ${expectedRole} but got ${user.role}`);
    }

    return true;
  } catch (error) {
    console.log(`✗ Login failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('Testing login API with different user roles...\n');

  // Test farmer login
  await testLogin('farmer@test.com', 'password123', 'farmer');

  // Test marketplace login
  await testLogin('marketplace@test.com', 'password123', 'marketplace');

  // Test admin login
  await testLogin('admin@test.com', 'password123', 'admin');

  console.log('\n=== All tests completed ===\n');
}

runTests();
