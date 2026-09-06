const request = require('supertest');
const express = require('express');
const app = express();
app.get('/api/test', (req, res) => res.json({message:'ok'}));

test('GET /api/test returns ok', async () => {
  const response = await request(app).get('/api/test');
  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual({message:'ok'});
});