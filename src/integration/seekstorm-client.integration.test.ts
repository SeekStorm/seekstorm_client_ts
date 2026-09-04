/// <reference types="node" />
import assert from "node:assert/strict";
import test from "node:test";
import { SeekStormApiError, SeekStormClient } from "../seekstorm-client.js";
import { FieldType } from "../types.js";

const baseUrl = process.env.SEEKSTORM_BASE_URL ?? "http://127.0.0.1:80";
const masterApiKey = process.env.SEEKSTORM_MASTER_API_KEY ?? "/iWStCpyfpd/BVlHOFtwnMgrFrmof4jGq/OQDWXQzcM=";

test("indexes, searches, iterates, retrieves, and deletes documents", async (context) => {
  const masterClient = new SeekStormClient({ baseUrl, apiKey: masterApiKey });
  const live = await masterClient.live();
  assert.match(live, /SeekStorm/);

  let apiKey: string;
  try {
    apiKey = await masterClient.createApiKey({
      indices_max: 10,
      indices_size_max: 100_000,
      documents_max: 10_000_000,
      operations_max: 10_000_000,
      rate_limit: 100_000,
      demo: true,
    });
  } catch (error) {
    if (error instanceof SeekStormApiError && (error.status === 401 || error.status === 403)) {
      context.skip(`SeekStorm master API key rejected: ${error.responseBody}`);
      return;
    }
    throw error;
  }

  const client = new SeekStormClient({ baseUrl, apiKey });
  let indexId: number;
  try {
    indexId = await client.createIndex({
      index_name: `typescript_e2e_${Date.now()}_${crypto.randomUUID().replaceAll("-", "_")}`,
      schema: [
        { field: "title", field_type: FieldType.Text, store: true, index_lexical: true },
        { field: "body", field_type: FieldType.Text, store: true, index_lexical: true, longest: true },
        { field: "url", field_type: FieldType.String32, store: true, index_lexical: false },
      ],
    });
  } catch (error) {
    if (error instanceof SeekStormApiError && (error.status === 401 || error.status === 403)) {
      context.skip(`SeekStorm API key rejected: ${error.responseBody}`);
      return;
    }
    throw error;
  }

  try {
    await client.indexDocuments(indexId, [
      { title: "one", body: "typescript integration marker alpha", url: "https://example.org/one" },
      { title: "two", body: "typescript integration marker beta", url: "https://example.org/two" },
    ]);
    await client.commitIndex(indexId);

    const search = await client.search(indexId, { query: "typescript integration marker" });
    assert.ok((search.results?.length ?? 0) >= 2, "search should return indexed documents");

    const iterator = await client.getIterator(indexId, { skip: 0, take: 10, include_document: true, include_deleted: false });
    assert.ok((iterator.results?.length ?? 0) >= 2, "iterator should return indexed documents");

    const documentId = iterator.results?.[0]?.doc_id;
  if (documentId === undefined) throw new Error("iterator result should include a document ID");
    const document = await client.getDocument(indexId, documentId);
    assert.equal(typeof document.title, "string");

    const remaining = await client.deleteDocument(indexId, documentId);
    assert.ok(remaining >= 0);
  } finally {
    await client.deleteIndex(indexId).catch(() => undefined);
  }
});