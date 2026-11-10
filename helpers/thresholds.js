// NFRs (see README): agreed targets for the whole API and for login
export const nfrThresholds = {
  http_req_failed: ['rate<0.01'], // NFR-01: less than 1% of failed requests
  http_req_duration: ['p(95)<500', 'p(99)<1000'], // NFR-02: 95% < 500 ms and 99% < 1 s
  'http_req_duration{name:POST /login}': ['p(95)<300'], // NFR-03: login 95% < 300 ms
  checks: ['rate>0.99'], // functional checks must pass, or the timings are not trustworthy
};
