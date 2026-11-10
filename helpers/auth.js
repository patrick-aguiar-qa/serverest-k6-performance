import http from 'k6/http';
import { getBaseUrl } from '../utils/variables.js';

export function getToken(email, password) {
  const response = http.post(`${getBaseUrl()}/login`, JSON.stringify({ email, password }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'POST /login' },
  });

  return response.json('authorization');
}
