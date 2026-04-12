const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'admin@test.com',
      password: 'admin123'
    });
    console.log('✅ Success:', res.data.message);
  } catch(e) {
    console.error('❌ Failed:', e.response?.data || e.message);
  }
}
test();
