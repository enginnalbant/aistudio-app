async function testEndpoint() {
  console.log('Testing /api/accounts...');
  try {
    const response = await fetch('http://localhost:3000/api/accounts', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    const text = await response.text();
    console.log('Response text:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

testEndpoint();
