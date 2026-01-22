Observer frontend — backend integration notes

What I added:
- `openapi.yaml` — OpenAPI 3.0 spec for auth and accounts endpoints.
- `api/client.js` — small fetch-based API client (token injection, refresh, timeout).
- `api/mock-server.js` — Express mock server implementing the spec (in-memory data).
- `types/api.d.ts` — TypeScript type hints for common responses.
- `package.json` — to install mock server dependencies and run it.

Run the mock server locally

1. Install dependencies:

```bash
npm install
```

2. Start mock server:

```bash
npm run start:mock
```

It will listen on `http://localhost:4000` by default.

Frontend integration

- Point the front-end API base to `http://localhost:4000` (set `window.API_BASE_URL` or use environment variable).
- Use `api/client.js` methods (import API client with modules) to call endpoints:
  - `api.login(username, password)`
  - `api.getAccounts()`
  - `api.createAccount(payload)`
  - `api.updateAccount(id, payload)`
  - `api.deleteAccount(id)`
  - `api.updateOrder(orderArray)`

Next recommended steps

- Replace `localStorage` token handling with secure cookie flows if needed.
- Add MSW (Mock Service Worker) for more granular mocking in the browser during UI tests.
- Generate TypeScript clients from `openapi.yaml` if you want strict typed clients.
