import { ClientUser } from "../struct/clientUser";
import { Emoji } from "../struct/emoji";
import { Events, WSEvents, wsUrl } from "../utils/constants";
import { client } from "./client";

declare function setInterval(
  cb: (...args: any[]) => void,
  delay?: number,
  ...args: any[]
): number;

/**
 * Represents the WebSocket client used for real-time communication with the API.
 */
export class WebSocketClient {
  /** The interval for sending heartbeats, in milliseconds. */
  heartbeatInterval?: number;

  /** The timestamp of the last ping sent, in milliseconds. */
  lastPingTimestamp?: number;

  /** Whether the last pong acknowledgment was received. */
  lastPongAck?: boolean = false;

  /** The WebSocket connection instance. */
  socket?: WebSocket | null;

  /** Whether the WebSocket client is connected. */
  connected: boolean = false;

  /** A promise representing the reconnecting process, or `null` if not reconnecting. */
  reconnecting: Promise<unknown> | null = null;

  /** Whether the WebSocket client is ready. */
  ready = false;

  /**
   * Creates a new WebSocketClient instance.
   *
   * @param {client} client - The client instance.
   */
  constructor(protected readonly client: client) {}

  /**
   * Logs a debug message.
   *
   * @param {unknown} message - The message to log.
   * @private
   */
  private debug(message: unknown): void {
    this.client.debug(`[WS] ${message}`);
  }

  /**
   * Sends data through the WebSocket connection.
   *
   * @param {unknown} data - The data to send.
   * @returns {Promise<void>} A promise that resolves when the data is sent.
   * @throws {Error} Throws an error if the WebSocket is not open.
   */
  async send(data: unknown): Promise<void> {
    if (this.reconnecting) {
      this.debug("Reconnecting, waiting to send message.");
      await this.reconnecting;
    }
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      this.debug("Socket is not open, cannot send message.");
      throw new Error("Socket is not open");
    }
  }

  /**
   * Handles the WebSocket connection opening.
   *
   * @private
   */
  private onOpen(): void {
    if (!this.client.token) throw new Error("Token is required");
    this.send({
      type: WSEvents.AUTHENTICATE,
      token: this.client.token,
    });
  }

  /**
   * Gets the current ping (latency) of the WebSocket connection.
   *
   * @returns {number} The ping in milliseconds, or `-0` if the WebSocket is not connected.
   */
  get ping(): number {
    if (!this.socket) return -0;
    return Date.now() - this.lastPingTimestamp!;
  }

  /**
   * Sets the heartbeat interval for the WebSocket connection.
   *
   * @param {number} time - The interval time in milliseconds. Use `-1` to clear the interval.
   */
  setHeartbeatTimer(time: number): void {
    this.debug(`Setting a heartbeat interval for ${time}ms.`);
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (time !== -1) {
      this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), time);
    }
  }

  /**
   * Sends a heartbeat to the server to keep the connection alive.
   */
  sendHeartbeat(): void {
    this.debug("Sending heartbeat.");

    if (!this.lastPongAck) {
      this.debug("Did not receive a pong ack.");
      if (this.client.options.ws?.reconnect) {
        this.reconnecting = this.destroy()
          .then(() => this.connect())
          .then(() => (this.reconnecting = null));
      }
    }
    const now = Date.now();
    this.send({ type: WSEvents.PING, data: now });
    this.lastPongAck = false;
    this.lastPingTimestamp = now;
  }

  /**
   * Handles WebSocket errors.
   *
   * @param {unknown} event - The error event.
   * @private
   */
  private onError(event: unknown): void {
    this.client.emit(Events.ERROR, event);
  }

  /**
   * Handles incoming WebSocket messages.
   *
   * @param {{ data: unknown }} param0 - The message event containing the data.
   * @private
   */
  private onMessage({ data }: { data: unknown }): void {
    let packet: unknown;
    try {
      packet = JSON.parse(String(data));
    } catch (err) {
      this.client.emit(Events.ERROR, err);
      return;
    }

    this.client.emit(Events.RAW, packet);

    this.onPacket(packet).catch((e) => this.client.emit(Events.ERROR, e));
  }

  /**
   * Handles the WebSocket connection closing.
   *
   * @param {{ code: number; reason: string }} event - The close event containing the code and reason.
   * @private
   */
  private onClose(event: { code: number; reason: string }): void {
    this.debug(`Closed with reason: ${event.reason}, code: ${event.code}`);
    this.destroy();
  }

  /**
   * Handles incoming WebSocket packets.
   *
   * @param {any} packet - The packet data.
   * @private
   */
  private async onPacket(packet: any) {
    if (!packet) {
      this.debug(`Received broken packet: '${packet}'.`);
      return;
    }

    switch (packet.type) {
      case WSEvents.BULK:
        await Promise.all(packet.v.map((p: unknown) => this.onPacket(p)));
        break;
      case WSEvents.AUTHENTICATED:
        this.connected = true;
        break;
      case WSEvents.PONG:
        this.debug(`Received a heartbeat.`);
        this.lastPongAck = true;
        break;
      case WSEvents.ERROR:
        this.client.emit(Events.ERROR, packet.error);
        break;
      case WSEvents.READY: {
        this.lastPongAck = true;

        const promises: Promise<unknown>[] = [];

        for (const user of packet.users) {
          if (user.relationship === "User" && !this.client.user) {
            this.client.user = new ClientUser(this.client, user);
          } else {
            this.client.users._add(user);
          }
        }

        for (const server of packet.servers) {
          const s = this.client.servers._add(server);
          if (this.client.options.fetchMembers) {
            promises.push(s.members.fetch());
          }
        }

        for (const channel of packet.channels) {
          this.client.channels._add(channel);
        }

        for (const member of packet.members) {
          this.client.servers.cache
            .get(member._id.server)
            ?.members._add(member);
        }

        for (const emoji of packet.emojis) {
          this.client.servers.cache
            .get(emoji.parent.id)
            ?.emojis.set(emoji._id, { ...emoji, _id: emoji._id });
        }

        this.setHeartbeatTimer(
          this.client.options.ws?.heartbeatInterval ?? 30000,
        );

        await Promise.all(promises);

        this.ready = true;

        this.client.emit(Events.READY, this.client);
        break;
      }
      default: {
        const action = this.client.events.get(packet.type);
        if (action) {
          await action.handle(packet);
        } else {
          this.debug(`Received unknown packet "${packet.type}"`);
        }

        break;
      }
    }
  }

  /**
   * Connects to the WebSocket server.
   *
   * @returns {Promise<this>} A promise that resolves when the connection is established.
   */
  connect(): Promise<this> {
    return new Promise((resolve) => {
      if (this.socket?.readyState === WebSocket.OPEN && this.ready) {
        return resolve(this);
      }

      if (typeof this.client.options === "undefined") {
        throw new Error("MISSING_CONFIGURATION_SYNC");
      }

      if (typeof this.client.token !== "string") {
        throw new Error("INVALID_TOKEN");
      }
      const ws = (this.socket = this.socket ?? new WebSocket(`${wsUrl}`));

      ws.onopen = this.onOpen.bind(this);
      ws.onmessage = this.onMessage.bind(this);
      ws.onerror = this.onError.bind(this);
      ws.onclose = this.onClose.bind(this);
      ws.addEventListener("open", () => resolve(this));
    });
  }

  /**
   * Destroys the WebSocket connection and clears its state.
   *
   * @returns {Promise<void>} A promise that resolves when the connection is destroyed.
   */
  destroy(): Promise<void> {
    return new Promise((resolve) => {
      this.setHeartbeatTimer(-1);
      this.connected = false;
      this.ready = false;

      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.addEventListener("close", () => {
          this.socket = null;
          resolve();
        });

        this.socket.close();
      } else {
        this.socket = null;
        resolve();
      }
    });
  }
}
