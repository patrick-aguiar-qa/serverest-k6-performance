import http from 'k6/http';
import { getBaseUrl } from '../utils/variables.js';
import { getToken } from './auth.js';

const userFixture = JSON.parse(open('../fixtures/user.json'));
const productFixture = JSON.parse(open('../fixtures/product.json'));
const json = { headers: { 'Content-Type': 'application/json' } };

function createUser(id, admin) {
  const user = {
    ...userFixture,
    email: `qa.perf.${Date.now()}.${id}@qa.com`,
    administrador: String(admin),
  };
  http.post(`${getBaseUrl()}/usuarios`, JSON.stringify(user), json);
  return { email: user.email, password: user.password };
}

// One user per virtual user: two VUs never share credentials or a cart
export function createTestData(userCount, productCount = 5) {
  const admin = createUser('admin', true);
  const adminToken = getToken(admin.email, admin.password);

  const products = [];
  for (let i = 0; i < productCount; i++) {
    const product = { ...productFixture, nome: `QA Perf Product ${Date.now()} ${i}` };
    const response = http.post(`${getBaseUrl()}/produtos`, JSON.stringify(product), {
      headers: { 'Content-Type': 'application/json', Authorization: adminToken },
    });
    products.push({ _id: response.json('_id'), nome: product.nome });
  }

  const users = [];
  for (let i = 0; i < userCount; i++) {
    users.push(createUser(i, false));
  }

  return { users, products };
}

export function userForCurrentVu(data) {
  return data.users[(__VU - 1) % data.users.length];
}
