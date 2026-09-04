# SeekStorm TypeScript REST Client

<img src="https://raw.githubusercontent.com/SeekStorm/seekstorm_client_ts/main/assets/logo.png" width="450" alt="Logo"><br>
**Fetch-based, promise-oriented TypeScript client for the SeekStorm vector & lexical search server.**.

seekstorm_client_ts is open source licensed under the [Apache License 2.0](https://github.com/SeekStorm/seekstorm_client_ts?tab=Apache-2.0-1-ov-file#readme)

## SeekStorm REST client (TypeScript)
[![GitHub Stars](https://img.shields.io/github/stars/SeekStorm/seekstorm_client_ts)](https://github.com/SeekStorm/seekstorm_client_ts)
[![npm](https://img.shields.io/npm/v/seekstorm_client_ts?label=npm)](https://www.npmjs.com/package/seekstorm_client_ts)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/SeekStorm/seekstorm_client_pure_ts?tab=Apache-2.0-1-ov-file#readme)

## SeekStorm REST client (Python)
[![GitHub Stars](https://img.shields.io/github/stars/SeekStorm/seekstorm_client_pure_py)](https://github.com/SeekStorm/seekstorm_client_pure_py)
[![PyPI](https://img.shields.io/pypi/v/seekstorm-client-pure-py?label=PyPI)](https://pypi.org/project/seekstorm-client-pure-py/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/SeekStorm/seekstorm_client_pure_py?tab=Apache-2.0-1-ov-file#readme)

## SeekStorm REST client (C#)
[![GitHub Stars](https://img.shields.io/github/stars/SeekStorm/seekstorm_client_cs)](https://github.com/SeekStorm/seekstorm_client_cs)
[![NuGet version](https://badge.fury.io/nu/SeekStorm.Client.svg)](https://badge.fury.io/nu/SeekStorm.Client)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/SeekStorm/seekstorm_client_cs?tab=Apache-2.0-1-ov-file#readme)

## SeekStorm REST client (Java)
[![GitHub Stars](https://img.shields.io/github/stars/SeekStorm/seekstorm_client_java)](https://github.com/SeekStorm/seekstorm_client_java)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/SeekStorm/seekstorm_client_java?tab=Apache-2.0-1-ov-file#readme)

## SeekStorm REST client (Rust)
[![GitHub Stars](https://img.shields.io/github/stars/SeekStorm/SeekStorm)](https://github.com/SeekStorm/SeekStorm)
[![Crates.io](https://img.shields.io/crates/v/seekstorm_client_rs.svg)](https://crates.io/crates/seekstorm_client_rs)
[![Downloads](https://img.shields.io/crates/d/seekstorm_client_rs.svg?style=flat-square)](https://crates.io/crates/seekstorm_client_rs)
[![Documentation](https://docs.rs/seekstorm_client_rs/badge.svg)](https://docs.rs/seekstorm_client_rs)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/SeekStorm/SeekStorm?tab=Apache-2.0-1-ov-file#readme)
[![Roadmap](https://img.shields.io/badge/Roadmap-2026-DA7F07.svg)](#roadmap)

## SeekStorm multi-tenancy search server
[![GitHub Stars](https://img.shields.io/github/stars/SeekStorm/SeekStorm)](https://github.com/SeekStorm/SeekStorm)
[![Crates.io](https://img.shields.io/crates/v/seekstorm_server.svg)](https://crates.io/crates/seekstorm_server)
[![Downloads](https://img.shields.io/crates/d/seekstorm_server.svg?style=flat-square)](https://crates.io/crates/seekstorm_server)
[![Docker](https://img.shields.io/docker/pulls/wolfgarbe/seekstorm_server)](https://hub.docker.com/r/wolfgarbe/seekstorm_server)
[![REST API Documentation](https://docs.rs/seekstorm/badge.svg)](https://seekstorm.github.io/documentation/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/SeekStorm/SeekStorm?tab=Apache-2.0-1-ov-file#readme)
[![Roadmap](https://img.shields.io/badge/Roadmap-2026-DA7F07.svg)](#roadmap)

## SeekStorm in-process search library
[![GitHub Stars](https://img.shields.io/github/stars/SeekStorm/SeekStorm)](https://github.com/SeekStorm/SeekStorm)
[![Crates.io](https://img.shields.io/crates/v/seekstorm.svg)](https://crates.io/crates/seekstorm)
[![Downloads](https://img.shields.io/crates/d/seekstorm.svg?style=flat-square)](https://crates.io/crates/seekstorm)
[![Documentation](https://docs.rs/seekstorm/badge.svg)](https://docs.rs/seekstorm)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/SeekStorm/SeekStorm?tab=Apache-2.0-1-ov-file#readme)
[![Roadmap](https://img.shields.io/badge/Roadmap-2026-DA7F07.svg)](#roadmap)
<p>
  <a href="https://seekstorm.com">Website</a> | 
  <a href="https://seekstorm.github.io/search-benchmark-game/">Benchmark</a> | 
  <a href="https://deephn.org/">Demo</a> | 
  <a href="https://github.com/SeekStorm/seekstorm_client_py">Repository for SeekStorm Python client </a> | 
  <a href="https://github.com/SeekStorm/SeekStorm">Repository for SeekStorm library, server, Rust client </a> | 
  <a href="https://github.com/SeekStorm/SeekStorm#roadmap">Roadmap</a> | 
  <a href="https://seekstorm.com/blog/">Blog</a> | 
  <a href="https://x.com/seekstorm">X</a>
</p>

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