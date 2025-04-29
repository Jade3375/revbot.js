import type {} from "../struct/index";
import { EventEmitter } from "node:events";
import { Events } from "../utils/constants";
import { RestClient } from "../rest/restClient";

/**
 * Represents the base client that provides core functionality for interacting with the API.
 *
 * @extends EventEmitter
 */
export declare interface BaseClient {
  on<K extends keyof ClientEvents>(
    event: K,
    listener: (...args: ClientEvents[K]) => Awaited<void>,
  ): this;
  on<S extends string | symbol>(
    event: Exclude<S, keyof ClientEvents>,
    listener: (...args: any[]) => Awaited<void>,
  ): this;
  once<K extends keyof ClientEvents>(
    event: K,
    listener: (...args: ClientEvents[K]) => Awaited<void>,
  ): this;
  once<S extends string | symbol>(
    event: Exclude<S, keyof ClientEvents>,
    listener: (...args: any[]) => Awaited<void>,
  ): this;
  emit<K extends keyof ClientEvents>(
    event: K,
    ...args: ClientEvents[K]
  ): boolean;
  emit<S extends string | symbol>(
    event: Exclude<S, keyof ClientEvents>,
    ...args: unknown[]
  ): boolean;
  off<K extends keyof ClientEvents>(
    event: K,
    listener: (...args: ClientEvents[K]) => Awaited<void>,
  ): this;
  off<S extends string | symbol>(
    event: Exclude<S, keyof ClientEvents>,
    listener: (...args: any[]) => Awaited<void>,
  ): this;
  removeAllListeners<K extends keyof ClientEvents>(event?: K): this;
  removeAllListeners<S extends string | symbol>(
    event?: Exclude<S, keyof ClientEvents>,
  ): this;
}

/**
 * Represents the events that the client can emit.
 */
export interface ClientEvents {}

/**
 * Represents the options for configuring the client.
 */
export interface clientOptions {
  /** Whether to fetch all members of a server. */
  fetchMembers?: boolean;

  /** Configuration for REST API requests. */
  rest?: {
    /** The timeout for REST requests in milliseconds. */
    timeout: number;
    /** The number of retries for failed REST requests. */
    retries: number;
  };

  /** Configuration for WebSocket connections. */
  ws?: {
    /** The interval for sending heartbeats in milliseconds. */
    heartbeatInterval?: number;
    /** Whether to automatically reconnect on disconnection. */
    reconnect?: boolean;
  };
}

/**
 * Represents the base client that provides core functionality for interacting with the API.
 *
 * @extends EventEmitter
 */
export abstract class BaseClient extends EventEmitter {
  /** The REST client for making API requests. */
  readonly api: RestClient;

  /** The authentication token for the client. */
  #token: string | null = null;

  /** The options for configuring the client. */
  options: clientOptions;

  /** Whether the client is a bot. */
  bot = true;

  /**
   * Creates a new BaseClient instance.
   *
   * @param {clientOptions} [options={}] - The options for configuring the client.
   */
  constructor(options: clientOptions = {}) {
    super();
    this.options = {
      ...options,
    };
    this.api = new RestClient(this);
  }

  /**
   * Emits a debug message.
   *
   * @param {unknown} msg - The debug message to emit.
   */
  debug(msg: unknown): void {
    this.emit(Events.DEBUG, msg);
  }

  /**
   * Sets the authentication token for the client.
   *
   * @param {string | null} token - The authentication token.
   */
  set token(token: string | null) {
    this.#token = token;
  }

  /**
   * Gets the authentication token for the client.
   *
   * @returns {string | null} The authentication token, or `null` if not set.
   */
  get token(): string | null {
    return this.#token;
  }
}
