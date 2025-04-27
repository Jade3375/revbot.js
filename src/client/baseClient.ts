import type {} from "../struct/index";
import { EventEmitter } from "node:events";
import { Events } from "../utils/constants";
import { RestClient } from "../rest/restClient";

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

export interface ClientEvents {}

export interface clientOptions {
  fetchMembers?: boolean;
  rest?: {
    timeout: number;
    retries: number;
  };
  ws?: {
    heartbeatInterval?: number;
    reconnect?: boolean;
  };
}

export abstract class BaseClient extends EventEmitter {
  readonly api: RestClient;
  #token: string | null = null;
  options: clientOptions;
  bot = true;

  constructor(options: clientOptions = {}) {
    super();
    this.options = {
      ...options,
    };
    this.api = new RestClient(this);
  }

  debug(msg: unknown): void {
    this.emit(Events.DEBUG, msg);
  }

  set token(token: string | null) {
    this.#token = token;
  }

  get token(): string | null {
    return this.#token;
  }
}
