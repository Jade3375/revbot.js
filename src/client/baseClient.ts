import type {
  Channel,
  Role,
  Server,
  ServerMember,
  User,
} from "../struct/index";
import { EventEmitter } from "node:events";
import { Events } from "../utils/constants";
import { RestClient } from "../rest/restClient";
import { Message } from "../struct/index";
import { client } from "./client";

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
export interface ClientEvents {
  /** Emitted when a debug message is logged. */
  [Events.DEBUG]: [unknown];
  /** Emitted when a message is received. */
  [Events.MESSAGE]: [Message];
  /** Emitted when a message is deleted. */
  [Events.MESSAGE_DELETE]: [Message];
  /** Emitted when a message is updated. */
  [Events.MESSAGE_UPDATE]: [Message, Message];
  /** Emitted when a reaction is added to a message. */
  [Events.MESSAGE_REACT]: [Message];
  /** Emitted when a reaction is removed from a message. */
  [Events.MESSAGE_REACT_REMOVE]: [Message];
  /** Emitted when a message is bulk deleted. */
  [Events.MESSAGE_DELETE_BULK]: [string[]];
  /** Emitted when a channel is created. */
  [Events.CHANNEL_CREATE]: [Channel];
  /** Emitted when a channel is deleted. */
  [Events.CHANNEL_DELETE]: [Channel];
  /** Emitted when a channel is updated. */
  [Events.CHANNEL_UPDATE]: [Channel, Channel];
  /** Emitted when a server is created. */
  [Events.SERVER_CREATE]: [Server];
  /** Emitted when a server is deleted. */
  [Events.SERVER_DELETE]: [Server];
  /** Emitted when a server is updated. */
  [Events.SERVER_UPDATE]: [Server, Server];
  /** Emitted when a server member joins. */
  [Events.SERVER_MEMBER_JOIN]: [ServerMember];
  /** Emitted when a server member leaves. */
  [Events.SERVER_MEMBER_LEAVE]: [ServerMember];
  /** Emitted when a server member is updated. */
  [Events.SERVER_MEMBER_UPDATE]: [ServerMember, ServerMember];
  /** Emitted when a user is updated. */
  [Events.USER_UPDATE]: [User, User];
  /** Emitted when a user is typing. */
  [Events.TYPING_START]: [Channel, User];
  /** Emitted when a user stops typing. */
  [Events.TYPING_STOP]: [Channel, User];
  /** Emitted when a group member joins. */
  [Events.GROUP_JOIN]: [Channel, User];
  /** Emitted when a group member leaves. */
  [Events.GROUP_LEAVE]: [Channel, User];
  /** Emitted when the client is ready. */
  [Events.READY]: [client];
  /** Emitted when an error occurs. */
  [Events.ERROR]: [unknown];
  /** Emitted when a raw event is received. */
  [Events.RAW]: [unknown];
  /** emitted when a role is created */
  [Events.ROLE_CREATE]: [Role];
  /** emitted when a role is deleted */
  [Events.ROLE_DELETE]: [Role];
  /** emitted when a role is updated */
  [Events.ROLE_UPDATE]: [Role, Role];
}

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
