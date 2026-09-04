/** A JSON-compatible value accepted by raw SeekStorm document and query payloads. */
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
/** A stored SeekStorm document with arbitrary JSON fields. */
export type Document = Record<string, JsonValue>;
/** A server-assigned index or document identifier. */
export type IndexId = string | number;

/** Lexical similarity model used when creating an index. */
export enum LexicalSimilarity { Bm25f = "Bm25f", Bm25fProximity = "Bm25fProximity" }
/** Tokenizer preset used during indexing. */
export enum TokenizerType { AsciiAlphabetic = "AsciiAlphabetic", UnicodeAlphanumeric = "UnicodeAlphanumeric", UnicodeAlphanumericFolded = "UnicodeAlphanumericFolded", UnicodeAlphanumericZH = "UnicodeAlphanumericZH" }
/** Stemmer preset used during indexing. */
export enum StemmerType { None = "None", English = "English", German = "German", Spanish = "Spanish", French = "French", Italian = "Italian", Portuguese = "Portuguese", Russian = "Russian" }
/** Stop-word preset used during indexing. */
export enum StopwordType { None = "None", English = "English", German = "German", Spanish = "Spanish", French = "French", Italian = "Italian", Portuguese = "Portuguese", Russian = "Russian" }
/** Frequent-word preset used during indexing. */
export enum FrequentwordType { None = "None", English = "English", German = "German", Spanish = "Spanish", French = "French", Italian = "Italian", Portuguese = "Portuguese", Russian = "Russian" }
/** Document compression used for index storage. */
export enum DocumentCompression { None = "None", Lz4 = "Lz4", Snappy = "Snappy", Zstd = "Zstd" }
/** N-gram indexing flags. Combine values with bitwise OR for `ngram_indexing`. */
export enum NgramSet { NgramFF = 1, NgramFFF = 2 }
/** Search response shape requested from the server. */
export enum ResultType { Count = "Count", Topk = "Topk", TopkCount = "TopkCount" }
/** Query composition mode for search and delete-by-query. */
export enum QueryType { Union = "Union", Intersection = "Intersection", Phrase = "Phrase", Not = "Not" }
/** Query rewriting mode used by search. */
export enum QueryRewriting { SearchOnly = "SearchOnly", Auto = "Auto" }
/** Search mode used by the server. */
export enum SearchMode { Lexical = "Lexical", Vector = "Vector", Hybrid = "Hybrid" }
/** Storage and indexing type of a schema field. */
export enum FieldType {
  U8 = "U8", U16 = "U16", U32 = "U32", U64 = "U64", I8 = "I8", I16 = "I16", I32 = "I32", I64 = "I64",
  Timestamp = "Timestamp", F32 = "F32", F64 = "F64", Bool = "Bool", String16 = "String16", String32 = "String32",
  StringSet16 = "StringSet16", StringSet32 = "StringSet32", Point = "Point", Text = "Text", Json = "Json", Binary = "Binary",
}

/** An extensible server configuration object. */
export type DynamicConfig = Record<string, JsonValue>;
/** Dynamic synonym configuration entry. */
export type Synonym = DynamicConfig;
/** Dynamic spelling-correction configuration. */
export type SpellingCorrectionConfig = DynamicConfig;
/** Dynamic query-completion configuration. */
export type QueryCompletionConfig = DynamicConfig;
/** Dynamic clustering configuration. */
export type ClusteringConfig = DynamicConfig;
/** Dynamic vector inference configuration. */
export type InferenceConfig = DynamicConfig;
/** Dynamic distance-field descriptor. */
export type DistanceField = DynamicConfig;
/** Dynamic facet request entry. */
export type QueryFacet = DynamicConfig;
/** Dynamic facet filter entry. */
export type FacetFilterItem = DynamicConfig;
/** Dynamic result-sort entry. */
export type ResultSortItem = DynamicConfig;

/** Configuration supplied when creating a {@link SeekStormClient}. */
export interface SeekStormClientOptions {
  /** SeekStorm server origin, without the `/api/v1` suffix. Defaults to `http://127.0.0.1`. */
  baseUrl?: string;
  /** Secret or master API key sent as the `apikey` header. */
  apiKey?: string;
  /** Custom Fetch implementation, useful for tests and non-browser runtimes. */
  fetch?: typeof globalThis.fetch;
  /** Per-request timeout in milliseconds. Omit to leave request timing to Fetch. */
  timeoutMs?: number;
}

/** Quota limits used to create an API key with a master-key client. */
export interface ApiKeyQuotaRequest {
  indices_max: number;
  indices_size_max: number;
  documents_max: number;
  operations_max: number;
  rate_limit?: number | null;
  demo?: boolean;
}

/** Index configuration and schema sent to the create-index endpoint. */
export interface CreateIndexRequest {
  index_name: string;
  schema: SchemaField[];
  similarity?: LexicalSimilarity;
  tokenizer?: TokenizerType;
  stemmer?: StemmerType;
  stop_words?: StopwordType;
  frequent_words?: FrequentwordType;
  ngram_indexing?: NgramSet;
  document_compression?: DocumentCompression;
  synonyms?: Synonym[];
  spelling_correction?: SpellingCorrectionConfig;
  query_completion?: QueryCompletionConfig;
  clustering?: ClusteringConfig;
  inference?: InferenceConfig;
}

/** A field definition in a SeekStorm index schema. */
export interface SchemaField {
  field: string;
  field_type: FieldType;
  store?: boolean;
  index_lexical?: boolean;
  index_vector?: boolean;
  facet?: boolean;
  boost?: number;
  longest?: boolean;
  dictionary_source?: boolean;
  completion_source?: boolean;
  [key: string]: JsonValue | undefined;
}

/** Metadata returned for an index. Unknown server fields are retained. */
export interface IndexResponse {
  id?: IndexId;
  name?: string;
  schema?: SchemaField[] | Record<string, DynamicConfig>;
  indexed_doc_count?: number;
  committed_doc_count?: number;
  operations_count?: number;
  query_count?: number;
  version?: string;
  facets_minmax?: Record<string, DynamicConfig>;
  [key: string]: unknown;
}

/** Highlight configuration used by search and get-document requests. */
export interface Highlight {
  field: string;
  name?: string;
  fragment_number?: number;
  fragment_size?: number;
  highlight_markup?: boolean;
  pre_tags?: string;
  post_tags?: string;
}

/** A lexical, vector, or hybrid search request. */
export interface SearchRequest {
  query: string;
  query_vector?: JsonValue;
  enable_empty_query?: boolean;
  offset?: number;
  length?: number;
  result_type?: ResultType;
  realtime?: boolean;
  highlights?: Highlight[];
  field_filter?: string[];
  fields?: string[];
  distance_fields?: DistanceField[];
  query_facets?: QueryFacet[];
  facet_filter?: FacetFilterItem[];
  result_sort?: ResultSortItem[];
  query_type_default?: QueryType;
  query_rewriting?: QueryRewriting;
  search_mode?: SearchMode;
}

/** Search results and metadata returned by SeekStorm. Unknown server fields are retained. */
export interface SearchResponse {
  time?: number;
  original_query?: string;
  query?: string;
  offset?: number;
  length?: number;
  count?: number;
  count_total?: number;
  query_terms?: string[];
  results?: Array<{ _id?: IndexId; _score?: number; [key: string]: JsonValue | undefined }>;
  facets?: Record<string, JsonValue>;
  suggestions?: string[];
  [key: string]: unknown;
}

/** Optional document-retrieval controls for highlights, fields, and distance data. */
export interface GetDocumentRequest {
  query_terms?: string[];
  highlights?: Highlight[];
  fields?: string[];
  distance_fields?: DistanceField[];
}

/** One document replacement expressed as the request-body update tuple. */
export interface UpdateDocumentRequest { doc_id: IndexId; document: Document; }

/** Paging and projection options for sequential document iteration. */
export interface GetIteratorRequest {
  document_id?: IndexId;
  skip?: number;
  take?: number;
  include_deleted?: boolean;
  include_document?: boolean;
  fields?: string[];
}

/** A page of document IDs and optional document data returned by the iterator endpoint. */
export interface IteratorResult {
  skip?: number;
  results?: Array<{ doc_id?: IndexId; doc?: Document; [key: string]: JsonValue | undefined }>;
  [key: string]: unknown;
}
