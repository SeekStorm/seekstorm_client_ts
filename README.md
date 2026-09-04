# SeekStorm TypeScript REST Client

Fetch-based, promise-oriented TypeScript client for the SeekStorm vector and lexical search server.

## Install

```bash
npm install seekstorm_client_ts
```

## Usage

```ts
import { FieldType, SeekStormClient } from "seekstorm_client_ts";

const client = new SeekStormClient({
  baseUrl: "http://127.0.0.1:8080",
  apiKey: "your-apikey",
});

const indexId = await client.createIndex({
  index_name: "demo",
  schema: [{ field: "title", field_type: FieldType.Text, store: true, index_lexical: true }],
});

await client.indexDocument(indexId, { title: "hello seekstorm" });
const results = await client.search(indexId, { query: "hello", length: 5 });
```

`SeekStormClient` exposes API key, index, document, iterator, file, and search operations. It sends the configured `apikey` header automatically and throws `SeekStormApiError` for non-2xx responses.

## Development

```bash
npm install
npm test
```

With a SeekStorm server running, execute the real-server lifecycle test with:

```bash
npm run test:integration
```

It defaults to `http://127.0.0.1:80`, creates the local demo API key through the default master key, then removes its disposable index. Set `SEEKSTORM_BASE_URL` and `SEEKSTORM_MASTER_API_KEY` to override either value.

## Publishing

The `Publish to npm` GitHub Actions workflow runs when a tag matching `v*` is pushed. It uses npm Trusted Publishing, so no `NPM_TOKEN` secret is needed.

Before the first release, configure Trusted Publisher in npm for the `seekstorm_client_ts` package with:

- Repository: `SeekStorm/seekstorm_client_ts`
- Workflow filename: `publish.yml`

Publish a matching package version by pushing a tag such as `v0.1.0`.