import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { getBaseUrl } from '../utils/variables.js';
import { getToken } from './auth.js';
import { userForCurrentVu } from './test-data.js';

const json = { 'Content-Type': 'application/json' };

// Browsing customer: lists products, searches and opens one product
export function browseProducts(data) {
  const product = data.products[Math.floor(Math.random() * data.products.length)];

  group('Browse products', () => {
    const list = http.get(`${getBaseUrl()}/produtos`, { tags: { name: 'GET /produtos' } });
    check(list, { 'list products: status 200': (r) => r.status === 200 });

    const search = http.get(`${getBaseUrl()}/produtos?nome=${encodeURIComponent(product.nome)}`, {
      tags: { name: 'GET /produtos?nome' },
    });
    check(search, { 'search product: 1 result': (r) => r.status === 200 && r.json('quantidade') === 1 });

    const detail = http.get(`${getBaseUrl()}/produtos/${product._id}`, { tags: { name: 'GET /produtos/{id}' } });
    check(detail, { 'product detail: status 200': (r) => r.status === 200 });
  });

  sleep(1);
}

// Buying customer: logs in, creates a cart and cancels it (stock is restored)
export function buyProduct(data) {
  const user = userForCurrentVu(data);
  const product = data.products[Math.floor(Math.random() * data.products.length)];

  group('Buy product', () => {
    const token = getToken(user.email, user.password);
    check(token, { 'login: token received': (t) => typeof t === 'string' && t.startsWith('Bearer ') });

    const headers = { ...json, Authorization: token };

    const cart = http.post(
      `${getBaseUrl()}/carrinhos`,
      JSON.stringify({ produtos: [{ idProduto: product._id, quantidade: 1 }] }),
      { headers, tags: { name: 'POST /carrinhos' } },
    );
    check(cart, { 'create cart: status 201': (r) => r.status === 201 });

    sleep(1);

    const cancel = http.del(`${getBaseUrl()}/carrinhos/cancelar-compra`, null, {
      headers,
      tags: { name: 'DELETE /carrinhos/cancelar-compra' },
    });
    check(cancel, { 'cancel cart: status 200': (r) => r.status === 200 });
  });

  sleep(1);
}
