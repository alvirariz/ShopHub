const axios = require('axios');
const FormData = require('form-data');
const api = axios.create({ headers: { 'Content-Type': 'application/json' } });
const form = new FormData();
form.append('name', 'test');
api.post('http://localhost:3000/api/products/test-upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => console.log(res.data)).catch(err => console.log(err.message));
