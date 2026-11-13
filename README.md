# ServeRest Performance Tests (k6)

![Performance smoke test](https://github.com/patrick-aguiar-qa/serverest-k6-performance/actions/workflows/performance.yml/badge.svg)

Performance tests for the [ServeRest](https://github.com/ServeRest/ServeRest) e-commerce API with
[k6](https://grafana.com/docs/k6/): **smoke, average load, stress and spike** tests that simulate
real customer behavior and fail automatically when a performance requirement (NFR) is broken.

Part of a small QA portfolio on the same product:
[API tests](https://github.com/patrick-aguiar-qa/serverest-api-tests) ·
[Web tests (Cypress)](https://github.com/patrick-aguiar-qa/serverest-web-cypress) ·
[Playwright + TypeScript](https://github.com/patrick-aguiar-qa/serverest-playwright-ts) ·
**Performance tests** (this repo).

> All tests run against a **local** ServeRest instance (`npm run api`). Load tests should never be
> pointed at a public or third-party server.

## Performance requirements (NFRs)

There was no documented NFR for this API, so these targets were defined for the study and implemented
as k6 **thresholds** (in a real team they would be agreed with the PO or Tech Lead):

| ID | Requirement | k6 threshold |
|---|---|---|
| NFR-01 | Less than 1% of requests fail | `http_req_failed: rate<0.01` |
| NFR-02 | 95% of requests in under 500 ms and 99% in under 1 s | `http_req_duration: p(95)<500, p(99)<1000` |
| NFR-03 | Login: 95% in under 300 ms | `http_req_duration{name:POST /login}: p(95)<300` |
| — | Functional checks pass (otherwise fast errors would hide the real timing) | `checks: rate>0.99` |

## User behavior

Each iteration simulates one of two customer groups:

| Group | Share | Journey |
|---|---|---|
| Browsing | 70% | List products → search by name → open product details |
| Buying | 30% | Log in → create a cart → cancel the purchase (stock is restored) |

Test data is created in `setup()`: **one user per virtual user**, so two VUs never share a login or a cart,
plus a set of products with enough stock.

## Load profiles

| Test | Profile | Goal |
|---|---|---|
| `smoke.test.js` | 2 VUs for 30 s | Script and API work before applying load (runs in CI) |
| `load.test.js` | Ramp to 20 VUs, hold 1 min | Expected day-to-day load |
| `stress.test.js` | Ramp to 50 VUs, hold 1 min 30 s | 2.5× the average load |
| `spike.test.js` | 0 → 150 VUs in 10 s, hold 30 s | Sudden peak (e.g. a flash sale) |

## Results

Local run on a developer laptop (Windows, ServeRest 3.2.2, k6 2.3), November 2026. Numbers change on every
run and on every machine; what matters is the trend and whether the NFRs hold.

| Test | Requests | Throughput | p(95) | p(99) | Errors | NFRs |
|---|---|---|---|---|---|---|
| Load (20 VUs) | 4,194 | 35 req/s | 6.6 ms | 11.5 ms | 0% | ✅ all met |
| Stress (50 VUs) | 13,746 | 91 req/s | 14.3 ms | 57.8 ms | 0% | ✅ all met |
| Spike (150 VUs) | 12,742 | 244 req/s | 144 ms | **1.97 s** | 0% | ❌ NFR-02 (p99) broken |

**What this means for the business**

- With up to 2.5× the expected traffic, the API is fast and stable: 99% of customers get a response in
  under 60 ms and no request fails.
- During a sudden spike to 150 simultaneous users, **no request fails, but 1 in 100 customers waits
  around 2 seconds** (the slowest request took 3.1 s), and login slows down from ~2 ms to up to 1.7 s.
  For a flash sale, this is the point to investigate with the developers: the k6 dashboard shows the exact
  time window when the threshold was crossed, which can be matched against the server logs.

## Project structure

```
├── .github/workflows/performance.yml   # Smoke test on every push / pull request
├── config/config.local.json            # Default BASE_URL for local runs
├── fixtures/                           # User and product request bodies
├── helpers/
│   ├── auth.js                         # getToken(email, password)
│   ├── journeys.js                     # browseProducts / buyProduct with checks
│   ├── test-data.js                    # setup data: one user per VU + products
│   └── thresholds.js                   # NFRs as k6 thresholds
├── tests/                              # One test type per file
│   ├── smoke.test.js
│   ├── load.test.js
│   ├── stress.test.js
│   └── spike.test.js
├── utils/variables.js                  # __ENV.BASE_URL with local fallback
└── reports/                            # HTML dashboards (not versioned)
```

## Getting started

**Requirements:** Node.js 20 or later (to run ServeRest) and [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/).

```bash
git clone https://github.com/patrick-aguiar-qa/serverest-k6-performance.git
cd serverest-k6-performance
npm install
npm run api
```

In another terminal:

| Command | Test |
|---|---|
| `npm run test:smoke` | Smoke |
| `npm run test:load` | Average load |
| `npm run test:stress` | Stress |
| `npm run test:spike` | Spike |

**Another environment:** `k6 run tests/load.test.js -e BASE_URL=http://my-env:3000`

**Live dashboard and HTML report** (Git Bash / macOS / Linux):

```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=reports/load-report.html k6 run tests/load.test.js
```

The dashboard opens at `http://localhost:5665` during the run; the HTML report is saved in `reports/`.

## Author

**Patrick Aguiar** — QA Engineer · [LinkedIn](https://www.linkedin.com/in/patrick-aguiar-qa) · [GitHub](https://github.com/patrick-aguiar-qa)
