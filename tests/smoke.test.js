// Smoke: 2 VUs for 30 s - checks that the script and the API work before any real load
import { createTestData } from '../helpers/test-data.js';
import { browseProducts, buyProduct } from '../helpers/journeys.js';
import { nfrThresholds } from '../helpers/thresholds.js';

const MAX_VUS = 2;

export const options = {
  stages: [{ duration: '30s', target: 2 }],
  thresholds: nfrThresholds,
};

export function setup() {
  return createTestData(MAX_VUS);
}

// Behavior mix: 70% of iterations browse the catalog, 30% buy (login + cart)
export default function (data) {
  if (Math.random() < 0.7) {
    browseProducts(data);
  } else {
    buyProduct(data);
  }
}
