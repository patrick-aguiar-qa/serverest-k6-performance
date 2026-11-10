// Average load: 20 concurrent users for 1 min - the expected day-to-day load
import { createTestData } from '../helpers/test-data.js';
import { browseProducts, buyProduct } from '../helpers/journeys.js';
import { nfrThresholds } from '../helpers/thresholds.js';

const MAX_VUS = 20;

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // ramp-up
    { duration: '1m', target: 20 }, // average load
    { duration: '30s', target: 0 }, // ramp-down
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
