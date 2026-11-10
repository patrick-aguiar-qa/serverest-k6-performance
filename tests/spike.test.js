// Spike: 0 to 150 users in 10 s (e.g. a flash sale), then back to 0
import { createTestData } from '../helpers/test-data.js';
import { browseProducts, buyProduct } from '../helpers/journeys.js';
import { nfrThresholds } from '../helpers/thresholds.js';

const MAX_VUS = 150;

export const options = {
  stages: [
    { duration: '10s', target: 150 }, // sudden spike
    { duration: '30s', target: 150 },
    { duration: '10s', target: 0 },
  ],
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
