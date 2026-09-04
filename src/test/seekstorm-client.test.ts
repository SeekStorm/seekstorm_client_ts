/// <reference types="node" />
import assert from "node:assert/strict";
import test from "node:test";
import { SeekStormApiError, SeekStormClient } from "../seekstorm-client.js";
import { FieldType, SearchMode } from "../types.js";

function mockFetch(response: Response): { fetch: typeof fetch; request: () => Request | undefined } {
  let request: Request | undefined;
  return {
    fetch: async (input, init) => { request = new Request(input, init); return response; },
    request: () => request,
  };
}

test("search sends the expected API path, key, and JSON body", async () => {
  const mock = mockFetch(new Response('{"count_total":1}', { status: 200 }));
  const client = new SeekStormClient({ baseUrl: "http://localhost:8080/", apiKey: "test-key", fetch: mock.fetch });
  const result = await client.search(7, { query: "vector", search_mode: SearchMode.Hybrid });
  assert.equal(result.count_total, 1);
  assert.equal(mock.request()?.url, "http://localhost:8080/api/v1/index/7/query");
  assert.equal(mock.request()?.headers.get("apikey"), "test-key");
  assert.deepEqual(JSON.parse(await mock.request()!.text()), { query: "vector", search_mode: "Hybrid" });
});

test("non-success responses expose status and response body", async () => {
  const mock = mockFetch(new Response("bad api key", { status: 401 }));
  const client = new SeekStormClient({ fetch: mock.fetch });
  await assert.rejects(client.getApiKey(), (error: unknown) => error instanceof SeekStormApiError && error.status === 401 && error.responseBody === "bad api key");
});

test("numeric operations accept the server's JSON Ok wrapper", async () => {
  const mock = mockFetch(new Response('{"Ok":2}', { status: 200 }));
  const client = new SeekStormClient({ fetch: mock.fetch });
  assert.equal(await client.indexDocument(1, { title: "test" }), 2);
});

test("API key info accepts the server's wrapped result shapes", async () => {
  const mock = mockFetch(new Response('{"Ok":[{"id":1,"name":"test"}]}', { status: 200 }));
  const client = new SeekStormClient({ fetch: mock.fetch });
  assert.deepEqual(await client.getApiKey(), [{ id: 1, name: "test" }]);
  const schema = { field: "title", field_type: FieldType.Text, store: true };
  assert.equal(schema.field_type, "Text");
});