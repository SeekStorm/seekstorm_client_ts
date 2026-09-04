import type {
  ApiKeyQuotaRequest,
  CreateIndexRequest,
  Document,
  GetDocumentRequest,
  GetIteratorRequest,
  IndexId,
  IndexResponse,
  IteratorResult,
  JsonValue,
  SearchRequest,
  SearchResponse,
  SeekStormClientOptions,
} from "./types.js";

const API_PREFIX = "/api/v1";

/** Error returned when SeekStorm responds with a non-2xx HTTP status. */
export class SeekStormApiError extends Error {
  public constructor(
    message: string,
    /** HTTP status returned by the server. */
    public readonly status: number,
    /** Unparsed response body returned by the server. */
    public readonly responseBody: string,
  ) {
    super(message);
    this.name = "SeekStormApiError";
  }
}

/**
 * Promise-based REST client for the SeekStorm vector and lexical search server.
 *
 * The client uses the Fetch API, adds the configured `apikey` header to every
 * request, and uses the server's snake_case JSON contract.
 */
export class SeekStormClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly fetchFn: typeof globalThis.fetch;
  private readonly timeoutMs?: number;

  /** Creates a client using `http://127.0.0.1` when no base URL is supplied. */
  public constructor(options: SeekStormClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "http://127.0.0.1").replace(/\/+$/, "");
    this.apiKey = options.apiKey;
    this.fetchFn = options.fetch ?? globalThis.fetch;
    this.timeoutMs = options.timeoutMs;
  }

  /** Probes the server health endpoint and returns its plain-text banner. */
  public live(): Promise<string> { return this.sendText("GET", "/live"); }
  /** Retrieves metadata for indices associated with this client's API key. */
  public async getApiKey(): Promise<IndexResponse[]> {
    const response = await this.sendJson<unknown>("GET", "/apikey");
    if (Array.isArray(response)) return response as IndexResponse[];
    if (response && typeof response === "object") {
      const payload = response as Record<string, unknown>;
      for (const field of ["indices", "result", "Ok", "ok", "data"]) {
        if (Array.isArray(payload[field])) return payload[field] as IndexResponse[];
      }
      if ("id" in payload && "name" in payload) return [payload as IndexResponse];
    }
    return [];
  }
  /** Creates an API key using a client configured with the master API key. */
  public createApiKey(request: ApiKeyQuotaRequest): Promise<string> { return this.sendText("POST", "/apikey", request); }
  /** Deletes an API key using a client configured with the master API key. */
  public deleteApiKey(apiKey: string): Promise<number> { return this.sendNumber("DELETE", "/apikey", apiKey); }
  /** Creates an index and returns its server-assigned ID. */
  public createIndex(request: CreateIndexRequest | Document): Promise<number> { return this.sendNumber("POST", "/index", request); }
  /** Fetches metadata for an index. */
  public getIndex(indexId: IndexId): Promise<IndexResponse> { return this.sendJson("GET", this.indexPath(indexId)); }
  /** Deletes an index and all documents it contains. */
  public deleteIndex(indexId: IndexId): Promise<number> { return this.sendNumber("DELETE", this.indexPath(indexId)); }
  /**
   * Persists indexed documents and makes them searchable with `realtime: false`.
   * Commit is expensive and is normally invoked automatically at 64K new documents per shard.
   */
  public commitIndex(indexId: IndexId): Promise<number> { return this.sendNumber("PATCH", this.indexPath(indexId)); }
  /** Applies a server-supported JSON patch to an index and returns its updated metadata. */
  public patchIndex(indexId: IndexId, patch: Document): Promise<IndexResponse> { return this.sendJson("PATCH", this.indexPath(indexId), patch); }
  /** Iterates document IDs and, when requested, document data without executing a search query. */
  public getIterator(indexId: IndexId, request: GetIteratorRequest): Promise<IteratorResult> { return this.sendJson("POST", `${this.indexPath(indexId)}/iterator`, request); }
  /** Creates an iterator request and returns the number of document IDs skipped by it. */
  public async createIterator(indexId: IndexId, request: GetIteratorRequest): Promise<number> { return (await this.getIterator(indexId, request)).skip ?? 0; }
  /** Indexes one document and returns the server's indexed-document count. */
  public indexDocument(indexId: IndexId, document: Document): Promise<number> { return this.sendNumber("POST", `${this.indexPath(indexId)}/doc`, document); }
  /** Indexes multiple documents in one request. */
  public indexDocuments(indexId: IndexId, documents: Document[]): Promise<number> { return this.sendNumber("POST", `${this.indexPath(indexId)}/doc`, documents); }
  /** Replaces one document using its `[documentId, document]` update tuple. */
  public updateDocument(indexId: IndexId, documentId: IndexId, document: Document): Promise<number> { return this.sendNumber("PATCH", `${this.indexPath(indexId)}/doc`, [documentId, document]); }
  /** Replaces multiple documents using `[documentId, document]` update tuples. */
  public updateDocuments(indexId: IndexId, documents: Array<[IndexId, Document]>): Promise<number> { return this.sendNumber("PATCH", `${this.indexPath(indexId)}/doc`, documents); }
  /** Deletes all documents matching a search request. */
  public deleteDocumentsByQuery(indexId: IndexId, request: SearchRequest): Promise<number> { return this.sendNumber("DELETE", `${this.indexPath(indexId)}/doc`, request); }
  /** Deletes multiple documents by ID. */
  public deleteDocumentsByDocIds(indexId: IndexId, documentIds: IndexId[]): Promise<number> { return this.sendNumber("DELETE", `${this.indexPath(indexId)}/doc`, documentIds); }
  /** Deletes one document by ID through the request-body endpoint. */
  public deleteDocumentByDocId(indexId: IndexId, documentId: IndexId): Promise<number> { return this.sendNumber("DELETE", `${this.indexPath(indexId)}/doc`, documentId); }
  /** Removes every document while retaining the index configuration. */
  public clearIndex(indexId: IndexId): Promise<number> { return this.sendNumber("DELETE", `${this.indexPath(indexId)}/doc`, "clear", "application/octet-stream"); }
  /** Fetches one document, optionally filtering fields or requesting highlights. */
  public getDocument(indexId: IndexId, documentId: IndexId, request?: GetDocumentRequest): Promise<Document> { return this.sendJson("GET", `${this.indexPath(indexId)}/doc/${encodeURIComponent(String(documentId))}`, request); }
  /** Deletes one document by ID through the document-ID endpoint. */
  public deleteDocument(indexId: IndexId, documentId: IndexId): Promise<number> { return this.sendNumber("DELETE", `${this.indexPath(indexId)}/doc/${encodeURIComponent(String(documentId))}`); }
  /** Uploads an octet-stream file with its filename and optional date headers. */
  public uploadFile(indexId: IndexId, fileName: string, content: Blob | ArrayBuffer | ArrayBufferView, date?: string): Promise<number> {
    return this.sendNumber("POST", `${this.indexPath(indexId)}/file`, content, "application/octet-stream", { file: fileName, ...(date ? { date } : {}) });
  }
  /** Downloads a stored file as an `ArrayBuffer`. */
  public async getFile(indexId: IndexId, documentId: IndexId): Promise<ArrayBuffer> {
    const response = await this.request("GET", `${this.indexPath(indexId)}/file/${encodeURIComponent(String(documentId))}`);
    return response.arrayBuffer();
  }
  /** Executes a lexical, vector, or hybrid search query. */
  public search(indexId: IndexId, request: SearchRequest): Promise<SearchResponse> { return this.sendJson("POST", `${this.indexPath(indexId)}/query`, request); }
  /** Executes a raw query and returns the server JSON without response shaping. */
  public queryRaw(indexId: IndexId, request: Document): Promise<JsonValue> { return this.sendJson("POST", `${this.indexPath(indexId)}/query`, request); }

  private indexPath(indexId: IndexId): string { return `/index/${encodeURIComponent(String(indexId))}`; }
  private async sendJson<T>(method: string, path: string, body?: unknown): Promise<T> { return (await this.request(method, path, body)).json() as Promise<T>; }
  private async sendText(method: string, path: string, body?: unknown): Promise<string> { return (await this.request(method, path, body)).text(); }
  private async sendNumber(method: string, path: string, body?: unknown, contentType?: string, headers?: HeadersInit): Promise<number> {
    const text = await (await this.request(method, path, body, contentType, headers)).text();
    const value = this.parseNumber(text);
    if (!Number.isFinite(value)) throw new TypeError(`Expected a numeric SeekStorm response, received: ${await text}`);
    return value;
  }
  private parseNumber(text: string): number {
    const value = Number(text.trim());
    if (Number.isFinite(value)) return value;
    try {
      const response = JSON.parse(text) as unknown;
      if (typeof response === "number") return response;
      if (response && typeof response === "object") {
        for (const field of ["Ok", "ok", "value", "result"]) {
          const wrapped = (response as Record<string, unknown>)[field];
          if (typeof wrapped === "number") return wrapped;
          if (typeof wrapped === "string") return Number(wrapped.trim());
        }
      }
    } catch {
      return Number.NaN;
    }
    return Number.NaN;
  }
  private async request(method: string, path: string, body?: unknown, contentType?: string, extraHeaders?: HeadersInit): Promise<Response> {
    const headers = new Headers({ Accept: "application/json" });
    if (this.apiKey) headers.set("apikey", this.apiKey);
    if (body !== undefined) headers.set("Content-Type", contentType ?? "application/json");
    new Headers(extraHeaders).forEach((value, name) => headers.set(name, value));
    const controller = this.timeoutMs ? new AbortController() : undefined;
    const timeout = controller ? setTimeout(() => controller.abort(), this.timeoutMs) : undefined;
    try {
      const response = await this.fetchFn(`${this.baseUrl}${API_PREFIX}${path}`, {
        method, headers, signal: controller?.signal,
        body: body === undefined ? undefined : contentType ? (body as BodyInit) : JSON.stringify(body),
      });
      if (!response.ok) throw new SeekStormApiError(`SeekStorm request failed with status ${response.status}`, response.status, await response.text());
      return response;
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
}