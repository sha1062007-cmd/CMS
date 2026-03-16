const fetch = require('node-fetch');

async function testSeed() {
  try {
    const response = await fetch('http://localhost:5000/api/contacts/seed', {
      method: 'POST'
    });
    const result = await response.json();
    console.log(result);
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

testSeed();
