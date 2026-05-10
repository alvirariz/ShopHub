const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
  try {
    const form = new FormData();
    form.append('name', 'Test Product');
    form.append('price', '99.99');
    form.append('category', 'test');
    form.append('stock', '10');
    form.append('storeId', '1');
    form.append('image', Buffer.from('test image data'), { filename: 'test.jpg', contentType: 'image/jpeg' });

    const res = await axios.post('http://localhost:3000/api/products/test-upload', form, {
      headers: form.getHeaders()
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}
test();
