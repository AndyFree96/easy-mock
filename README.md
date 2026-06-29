# EasyMock

A lightweight, zero-config **mock API server** with a modern web dashboard. Define mock endpoints, customize responses with template variables, simulate delays and HTTP status codes — all through a clean UI or JSON import/export.

![](https://img.shields.io/badge/Node.js-%3E%3D22.18-brightgreen)
![](https://img.shields.io/badge/License-ISC-blue)

## Features

- **Instant Mock APIs** — create endpoints with custom method, path, response body, status code, delay, and headers
- **Template Variables** — `{{timestamp}}` `{{datetime}}` `{{uuid}}` `{{randomInt}}` `{{randomFloat}}` `{{randomBool}}`
- **Path Parameters** — `/api/users/:id` matches `/api/users/42`
- **Enable/Disable Toggle** — switch mocks on/off without deleting
- **Request Logging** — every mock hit is logged with method, path, status, response time, and IP
- **Stats Dashboard** — total requests, average response time, method distribution, top paths
- **Export / Import** — backup all mocks as JSON, restore or share with one click
- **Dark Mode** — built-in theme toggle
- **Monaco Editor** — JSON response editing with syntax highlighting
- **TypeScript** — full type safety on both frontend and backend

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 22.18

### Install & Run

```bash
# Clone
git clone https://github.com/AndyFree96/easy-mock.git
cd easy-mock

# Start backend (port 3000)
cd server
npm install
npm run dev

# Start frontend (port 5173) — in another terminal
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## Usage

### Creating a Mock

1. Click **Create Mock** on the Mock APIs tab
2. Choose HTTP method, enter path (supports `:param` and `*` wildcards)
3. Write JSON response — the Monaco editor validates syntax
4. Optionally set status code, delay (ms), and custom headers
5. Click **Save**

### Template Variables

| Variable | Example Output |
|---|---|
| `{{timestamp}}` | `1719600000000` |
| `{{datetime}}` | `2024-06-29T00:00:00.000Z` |
| `{{uuid}}` | `550e8400-e29b-41d4-a716-446655440000` |
| `{{randomInt}}` | `4823` |
| `{{randomFloat}}` | `73.58` |
| `{{randomBool}}` | `true` |

### Path Patterns

| Pattern | Matches |
|---|---|
| `/api/users` | Exact match only |
| `/api/users/:id` | `/api/users/42`, `/api/users/abc` |
| `/api/*` | `/api/anything`, `/api/a/b/c` |

### Import / Export

- **Export**: downloads all mocks as `easy-mock-export.json`
- **Import**: upload a previously exported JSON file (overwrites existing mocks with same path+method)

## API Reference

The mock server runs on `http://localhost:3000`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/mock/create` | Create a mock |
| `PUT` | `/mock/:id` | Update a mock |
| `PUT` | `/mock/:id/toggle` | Toggle enabled/disabled |
| `GET` | `/mock/list` | List all mocks (`?search=`) |
| `GET` | `/mock/:id` | Get a single mock |
| `DELETE` | `/mock/:id` | Delete a mock |
| `GET` | `/mock/test` | Test-run a mock (`?path=&method=`) |
| `GET` | `/mock/stats` | Request statistics |
| `GET` | `/mock/logs` | Request logs (`?page=&limit=&method=`) |
| `GET` | `/mock/export` | Export all mocks as JSON |
| `POST` | `/mock/import` | Import mocks (`{ "mocks": [...], "overwrite": true }`) |

### Create Mock Body

```json
{
  "method": "GET",
  "path": "/api/hello",
  "response": { "message": "hello {{randomInt}}" },
  "delay": 200,
  "status": 200,
  "headers": { "X-Custom": "value" }
}
```

## Project Structure

```
easy-mock/
├── server/                # Express 5 + better-sqlite3 backend
│   ├── src/
│   │   ├── index.ts          # Entry point, graceful shutdown
│   │   ├── config.ts         # Environment variable config
│   │   ├── db.ts             # SQLite schema + prepared statements
│   │   ├── routes/mock.ts    # All /mock/* API routes
│   │   └── middleware/
│   │       └── mockHandler.ts # Mock interception middleware
│   └── package.json
├── frontend/              # Vue 3 + Element Plus dashboard
│   ├── src/
│   │   ├── App.vue           # Shell: tabs, dark mode, export/import
│   │   ├── api/mock.ts       # Axios API client
│   │   ├── types/mock.ts     # TypeScript interfaces
│   │   ├── composables/
│   │   │   ├── useMocks.ts   # Mock CRUD logic
│   │   │   └── useLogs.ts    # Log pagination/filter logic
│   │   └── components/
│   │       ├── MockList.vue   # Mock table + search + toggle
│   │       ├── MockForm.vue   # Create/edit dialog
│   │       ├── LogPanel.vue   # Request log with detail dialog
│   │       ├── TestDialog.vue # Test result viewer
│   │       ├── StatsPanel.vue # Stats dashboard
│   │       └── JsonEditor.vue # Monaco editor wrapper
│   └── package.json
└── README.md
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `CORS_ORIGIN` | `*` | CORS allowed origin |
| `DB_PATH` | `easymock.db` | SQLite database file path |

## License

ISC © [AndyFree96](https://github.com/AndyFree96)
